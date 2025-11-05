const { getSql } = require('./_db');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  // Auth check
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const userId = decoded.userId;
  const sql = getSql();

  if (req.method === 'GET') {
    try {
      // Ensure tables exist
      const [feedSchedExists, farmLogsExists] = await Promise.all([
        sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='feeding_schedules') as exists`,
        sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='farm_logs') as exists`
      ]);

      const feedingSchedules = feedSchedExists[0]?.exists
        ? await sql`SELECT * FROM feeding_schedules WHERE user_id = ${userId} ORDER BY time_of_day ASC`
        : [];

      const farmLogs = farmLogsExists[0]?.exists
        ? await sql`SELECT * FROM farm_logs WHERE user_id = ${userId} ORDER BY log_date DESC LIMIT 60`
        : [];

      // Aggregates & Analytics (last 7 days)
      const today = new Date();
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push(d.toISOString().slice(0,10));
      }

      const logsByDate = farmLogs.reduce((acc, l) => {
        const key = (l.log_date instanceof Date ? l.log_date.toISOString().slice(0,10) : String(l.log_date));
        acc[key] = l;
        return acc;
      }, {});

      const trend = days.map(dateStr => {
        const l = logsByDate[dateStr];
        return {
          date: dateStr,
          feedKg: Number(l?.daily_feed_kg || 0),
          mortality: Number(l?.mortality || 0),
          numBirds: Number(l?.num_birds || 0)
        };
      });

      const totalFeedKg7d = trend.reduce((s, t) => s + t.feedKg, 0);
      const totalMortality7d = trend.reduce((s, t) => s + t.mortality, 0);
      const avgFeedKg7d = trend.length ? totalFeedKg7d / trend.length : 0;
      const currentBirds = farmLogs.length ? Number(farmLogs[0].num_birds || 0) : 0;
      const feedPerBirdAvg = currentBirds > 0 ? (avgFeedKg7d / currentBirds) : 0;

      // History: recent 15 farm log entries
      const history = farmLogs.slice(0, 15).map(l => ({
        id: l.id,
        date: l.log_date,
        title: `Farm Log • ${new Date(l.log_date).toLocaleDateString()}`,
        details: `Birds: ${l.num_birds || 0}, Feed: ${l.daily_feed_kg || 0} kg, Mortality: ${l.mortality || 0}${l.notes ? ` • ${l.notes}` : ''}`
      }));

      const response = {
        feedingSchedules: feedingSchedules.map(s => ({
          id: s.id,
          timeOfDay: s.time_of_day,
          feedType: s.feed_type,
          rationGrams: s.ration_grams,
          notes: s.notes
        })),
        farmLogs: farmLogs.map(l => ({
          id: l.id,
          logDate: l.log_date,
          numBirds: l.num_birds,
          feedType: l.feed_type,
          dailyFeedKg: l.daily_feed_kg,
          mortality: l.mortality,
          notes: l.notes
        })),
        aggregates: {
          totalBirds: currentBirds,
          avgFeedKg: Number(avgFeedKg7d.toFixed(2)),
          lastLogDate: farmLogs[0]?.log_date || null
        },
        analytics: {
          days: trend,
          totalFeedKg7d: Number(totalFeedKg7d.toFixed(2)),
          avgFeedKg7d: Number(avgFeedKg7d.toFixed(2)),
          totalMortality7d: totalMortality7d,
          feedPerBirdAvg: Number(feedPerBirdAvg.toFixed(4)),
          scheduleCount: feedingSchedules.length
        },
        history
      };

      return res.json(response);
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { kind } = req.body || {};
      if (!kind) return res.status(400).json({ message: 'kind is required' });

      if (kind === 'feeding') {
        const { timeOfDay, feedType = '', rationGrams = 0, notes = '' } = req.body;
        if (!timeOfDay) return res.status(400).json({ message: 'timeOfDay is required' });
        const inserted = await sql`
          INSERT INTO feeding_schedules (user_id, time_of_day, feed_type, ration_grams, notes)
          VALUES (${userId}, ${timeOfDay}, ${feedType}, ${rationGrams}, ${notes})
          RETURNING *
        `;
        const s = inserted[0];
        return res.status(201).json({
          id: s.id,
          timeOfDay: s.time_of_day,
          feedType: s.feed_type,
          rationGrams: s.ration_grams,
          notes: s.notes
        });
      }

      if (kind === 'farm') {
        const { logDate, numBirds = 0, feedType = '', dailyFeedKg = 0, mortality = 0, notes = '' } = req.body;
        const dateVal = logDate || new Date().toISOString().slice(0,10);
        const upserted = await sql`
          INSERT INTO farm_logs (user_id, log_date, num_birds, feed_type, daily_feed_kg, mortality, notes)
          VALUES (${userId}, ${dateVal}, ${numBirds}, ${feedType}, ${dailyFeedKg}, ${mortality}, ${notes})
          ON CONFLICT (user_id, log_date)
          DO UPDATE SET num_birds = EXCLUDED.num_birds,
                        feed_type = EXCLUDED.feed_type,
                        daily_feed_kg = EXCLUDED.daily_feed_kg,
                        mortality = EXCLUDED.mortality,
                        notes = EXCLUDED.notes,
                        updated_at = now()
          RETURNING *
        `;
        const l = upserted[0];
        return res.status(201).json({
          id: l.id,
          logDate: l.log_date,
          numBirds: l.num_birds,
          feedType: l.feed_type,
          dailyFeedKg: l.daily_feed_kg,
          mortality: l.mortality,
          notes: l.notes
        });
      }

      return res.status(400).json({ message: 'Invalid kind. Use feeding or farm.' });
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};
