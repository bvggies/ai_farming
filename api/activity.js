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
        ? await sql`SELECT * FROM farm_logs WHERE user_id = ${userId} ORDER BY log_date DESC LIMIT 30`
        : [];

      // Aggregates
      let aggregates = { totalBirds: 0, avgFeedKg: 0, lastLogDate: null };
      if (farmLogs.length > 0) {
        const birds = farmLogs.map(f => Number(f.num_birds || 0));
        const feedKg = farmLogs.map(f => Number(f.daily_feed_kg || 0));
        aggregates.totalBirds = birds[0] || 0;
        aggregates.avgFeedKg = feedKg.length ? (feedKg.reduce((a,b)=>a+b,0) / feedKg.length).toFixed(2) : 0;
        aggregates.lastLogDate = farmLogs[0].log_date;
      }

      return res.json({
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
        aggregates
      });
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
