/**
 * Script to add 8 new FAQs to the knowledge base
 * Run with: node server/scripts/add-8-faqs.js
 * Requires DATABASE_URL environment variable
 */
const { neon } = require('@neondatabase/serverless');

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

async function addFAQs() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const sql = neon(DATABASE_URL);

  try {
    console.log('Checking if knowledge_base table exists...');
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'knowledge_base'
      ) as exists
    `;

    if (!tableCheck[0]?.exists) {
      console.error('Error: knowledge_base table does not exist. Please run the schema first.');
      process.exit(1);
    }

    console.log('Checking for existing FAQs to avoid duplicates...');
    const existingTitles = await sql`
      SELECT LOWER(TRIM(title)) as normalized_title FROM knowledge_base
    `;
    const existingSet = new Set(existingTitles.map(r => r.normalized_title));

    let added = 0;
    let skipped = 0;

    for (const faq of newFAQs) {
      const normalizedTitle = faq.title.toLowerCase().trim();
      if (existingSet.has(normalizedTitle)) {
        console.log(`Skipping duplicate: "${faq.title}"`);
        skipped++;
        continue;
      }

      await sql`
        INSERT INTO knowledge_base (title, content, category, tags, keywords, is_ai_verified)
        VALUES (${faq.title}, ${faq.content}, ${faq.category}, ${faq.tags}, ${faq.keywords}, ${faq.isAIVerified})
      `;
      console.log(`✓ Added: "${faq.title}"`);
      added++;
      existingSet.add(normalizedTitle); // Prevent duplicates within this batch
    }

    console.log(`\nCompleted! Added ${added} FAQs, skipped ${skipped} duplicates.`);
  } catch (error) {
    console.error('Error adding FAQs:', error);
    process.exit(1);
  }
}

addFAQs();
