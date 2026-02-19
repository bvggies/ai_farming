/**
 * POST /api/admin/knowledge/add-8-faqs
 * Add 8 new unique FAQs to the knowledge base (admin only)
 */
const { getSql } = require('../../_db');
const jwt = require('jsonwebtoken');

const newFAQs = [
  {
    title: 'How do I care for newly hatched chicks?',
    content: 'Newly hatched chicks need: a brooder with temperature of 95°F (35°C) for first week, reducing by 5°F each week until 6 weeks old, chick starter feed (20-24% protein), fresh water in shallow containers (add marbles to prevent drowning), clean dry bedding (paper towels or pine shavings), and protection from drafts. Monitor for pasty butt (clean gently with warm water). Provide 24-hour light for first few days, then reduce to 18 hours.',
    category: 'faq',
    tags: ['chick care', 'baby chickens', 'brooding'],
    keywords: ['newly hatched chicks', 'chick care guide', 'raising baby chickens'],
    isAIVerified: true
  },
  {
    title: 'How do I check if an egg is fertile?',
    content: 'To check fertility: use a bright flashlight (candling) in a dark room after 7-10 days of incubation. Fertile eggs show: visible blood vessels forming a spiderweb pattern, a dark spot (developing embryo), and movement when gently rotated. Infertile eggs appear clear or show only a yolk shadow. Remove infertile eggs to prevent contamination. Fresh eggs can also be cracked open - fertile eggs show a small white bullseye on the yolk (blastodisc).',
    category: 'faq',
    tags: ['egg fertility', 'candling', 'breeding'],
    keywords: ['check egg fertility', 'candling eggs', 'fertile eggs'],
    isAIVerified: true
  },
  {
    title: 'How should I store chicken feed?',
    content: 'Store feed in: airtight containers (metal bins or food-grade plastic), cool dry location (below 75°F), away from direct sunlight, elevated off ground to prevent moisture and pests, and use oldest feed first (FIFO rotation). Buy only what you can use in 2-3 months. Check for mold, insects, or off odors before feeding. Keep feed containers sealed tightly to prevent rodents and moisture. Store different feed types separately and label with purchase date.',
    category: 'faq',
    tags: ['feed storage', 'feed management', 'storage'],
    keywords: ['how to store chicken feed', 'feed storage tips', 'feed preservation'],
    isAIVerified: true
  },
  {
    title: 'How do I tame and handle my chickens?',
    content: 'Tame chickens by: spending time near them daily, offering treats from your hand, moving slowly and speaking softly, handling gently but confidently, starting with short sessions (5-10 minutes), handling during evening when birds are calmer, and being consistent. Hold birds securely but not tightly - support body and wings. Start with calm breeds and younger birds. Regular handling reduces stress during health checks and makes management easier.',
    category: 'faq',
    tags: ['handling', 'taming', 'socialization'],
    keywords: ['tame chickens', 'handle chickens', 'chicken socialization'],
    isAIVerified: true
  },
  {
    title: 'Why do chickens lay fewer eggs in winter?',
    content: 'Reduced winter laying is due to: shorter daylight hours (chickens need 14-16 hours of light to lay consistently), cold stress (birds use energy to stay warm), molting season (typically fall/winter), and natural biological rhythms. To maintain production: provide artificial lighting (use timer for 14-16 hours total), ensure adequate nutrition (increase feed 10-20%), keep coop warm but well-ventilated, and use cold-hardy breeds. Some reduction is normal and healthy - forcing year-round production can shorten hen lifespan.',
    category: 'faq',
    tags: ['winter laying', 'seasonal production', 'egg production'],
    keywords: ['winter egg production', 'why fewer eggs in winter', 'seasonal laying'],
    isAIVerified: true
  },
  {
    title: 'What should I do if my chicken is injured?',
    content: 'For injured chickens: isolate immediately in quiet, warm area, stop any bleeding (apply pressure, use styptic powder or cornstarch), clean wounds with saline or warm water, apply antibiotic ointment (poultry-safe), provide fresh water and food nearby, monitor for shock (pale comb, lethargy), keep bird warm and stress-free, and consult veterinarian for serious injuries. Common injuries: cuts, broken legs (splint if possible), pecking wounds, and predator attacks. Have a first aid kit with: bandages, antiseptic, styptic powder, and vet contact.',
    category: 'faq',
    tags: ['first aid', 'injuries', 'emergency care'],
    keywords: ['injured chicken', 'chicken first aid', 'emergency care'],
    isAIVerified: true
  },
  {
    title: 'What are the best security features for a chicken coop?',
    content: 'Essential security features: hardware cloth (1/4 inch mesh, not chicken wire) on all openings, buried wire 6-12 inches deep around perimeter, secure latches (raccoon-proof, use carabiners or padlocks), automatic door closers (solar-powered), motion-activated lights, predator-proof windows (covered with hardware cloth), solid floor or buried wire, and regular security checks. Common weaknesses: gaps larger than 1/4 inch, flimsy latches, unsecured windows, and gaps under doors. Test security by trying to open from outside.',
    category: 'faq',
    tags: ['coop security', 'predator protection', 'safety'],
    keywords: ['secure chicken coop', 'coop security features', 'predator proof coop'],
    isAIVerified: true
  },
  {
    title: 'How do I manage an aggressive rooster?',
    content: 'Manage aggressive roosters by: establishing dominance (carry rooster under arm, don\'t run away), providing adequate hens (1 rooster per 8-10 hens reduces aggression), ensuring enough space (overcrowding increases aggression), removing triggers (reflective surfaces, bright colors), using distraction techniques (toys, perches), considering rehoming if dangerous, and understanding breed tendencies (some breeds are naturally more aggressive). Aggression can be: territorial (protecting flock), hormonal (breeding season), or learned behavior. Never tolerate attacks on children - safety first.',
    category: 'faq',
    tags: ['rooster management', 'aggression', 'behavior'],
    keywords: ['aggressive rooster', 'rooster behavior', 'manage rooster'],
    isAIVerified: true
  }
];

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get auth token
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

    // Check if user is admin
    const sql = getSql();
    const user = await sql`SELECT role FROM users WHERE id = ${decoded.userId}`;
    if (!user[0] || user[0].role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Check if table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'knowledge_base'
      ) as exists
    `;
    
    if (!tableCheck[0]?.exists) {
      return res.status(500).json({ message: 'Knowledge base table does not exist' });
    }

    // Check for existing titles to avoid duplicates
    const existingTitles = await sql`
      SELECT LOWER(TRIM(title)) as normalized_title FROM knowledge_base
    `;
    const existingSet = new Set(existingTitles.map(r => r.normalized_title));

    const added = [];
    const skipped = [];

    for (const faq of newFAQs) {
      const normalizedTitle = faq.title.toLowerCase().trim();
      if (existingSet.has(normalizedTitle)) {
        skipped.push(faq.title);
        continue;
      }

      const inserted = await sql`
        INSERT INTO knowledge_base (title, content, category, tags, keywords, is_ai_verified, created_by_id)
        VALUES (${faq.title}, ${faq.content}, ${faq.category}, ${faq.tags}, ${faq.keywords}, ${faq.isAIVerified}, ${decoded.userId})
        RETURNING id, title
      `;
      
      added.push(inserted[0].title);
      existingSet.add(normalizedTitle); // Prevent duplicates within this batch
    }

    return res.json({
      message: `Added ${added.length} FAQs, skipped ${skipped.length} duplicates`,
      added: added.length,
      skipped: skipped.length,
      addedTitles: added,
      skippedTitles: skipped
    });
  } catch (err) {
    console.error('Error adding FAQs:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
