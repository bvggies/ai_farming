-- Create knowledge_base table if it doesn't exist
CREATE TABLE IF NOT EXISTS knowledge_base (
  id            text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title         text NOT NULL,
  content       text NOT NULL,
  category      text DEFAULT 'general',
  tags          text[] DEFAULT '{}',
  keywords      text[] DEFAULT '{}',
  is_ai_verified boolean DEFAULT false,
  created_by_id text,
  views         integer DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Insert 50+ Knowledge Base Entries
-- FAQs, Tips, and Best Practices for Poultry Farming

-- ===== FEEDING & NUTRITION =====

INSERT INTO knowledge_base (title, content, category, tags, keywords, is_ai_verified) VALUES
('How often should I feed my chickens?', 
'Adult chickens should be fed twice daily - once in the morning and once in the evening. Provide enough feed so that all birds can eat for 15-20 minutes. Remove uneaten feed after 30 minutes to prevent spoilage. Free-range chickens may need less commercial feed as they supplement with insects and greens.',
'feeding', 
ARRAY['feeding', 'schedule', 'adult chickens'],
ARRAY['feeding frequency', 'how often to feed', 'chicken feeding schedule'],
true),

('What is the best feed for laying hens?', 
'Layer feed with 16-18% protein is ideal for laying hens. It should contain calcium (3.5-4%) for strong eggshells. Feed should include grains (corn, wheat), protein sources (soybean meal), and essential vitamins and minerals. Avoid feeding too much corn as it can make birds overweight.',
'feeding',
ARRAY['layer feed', 'egg production', 'nutrition'],
ARRAY['best feed for layers', 'laying hen nutrition', 'layer feed requirements'],
true),

('How much feed does a chicken eat per day?', 
'A healthy adult chicken eats approximately 120-150 grams (4-5 ounces) of feed per day. This varies based on breed, size, activity level, and whether they free-range. Larger breeds and active birds may eat more. Monitor feed consumption as sudden changes can indicate health problems.',
'feeding',
ARRAY['feed quantity', 'daily consumption', 'portion size'],
ARRAY['how much feed per chicken', 'daily feed amount', 'chicken feed consumption'],
true),

('Can I feed kitchen scraps to my chickens?', 
'Yes, but be selective. Safe scraps include: vegetable peels, cooked rice, pasta, bread (in moderation), fruits, and cooked meat (small amounts). Avoid: raw meat, avocado, chocolate, onions, garlic, salty foods, and moldy food. Kitchen scraps should only supplement commercial feed, not replace it.',
'feeding',
ARRAY['kitchen scraps', 'food waste', 'supplemental feeding'],
ARRAY['feeding scraps', 'what can chickens eat', 'kitchen waste for chickens'],
true),

('What supplements do chickens need?', 
'Essential supplements include: grit (for digestion), calcium (crushed eggshells or oyster shells for layers), and fresh water always available. In winter or limited sunlight areas, Vitamin D3 supplementation may be needed. Probiotics can help maintain gut health. Consult a veterinarian for specific recommendations.',
'feeding',
ARRAY['supplements', 'vitamins', 'minerals'],
ARRAY['chicken supplements', 'vitamins for chickens', 'mineral requirements'],
true),

-- ===== HOUSING & MANAGEMENT =====

('How much space does a chicken need?', 
'Provide at least 2-3 square feet per bird in the coop and 8-10 square feet in the run area. Overcrowding leads to stress, disease, and pecking problems. For free-range systems, allow 4 square feet per bird in housing. More space is always better for bird welfare and productivity.',
'housing',
ARRAY['space requirements', 'coop size', 'stocking density'],
ARRAY['chicken space needs', 'how much space per chicken', 'coop size requirements'],
true),

('What temperature should a chicken coop be?', 
'Adult chickens tolerate temperatures from 40-85°F (4-29°C). The ideal range is 60-75°F (15-24°C). Provide ventilation in summer and insulation in winter. Baby chicks need 90-95°F (32-35°C) for the first week, reducing by 5°F each week until they reach 4-6 weeks old.',
'housing',
ARRAY['temperature', 'climate control', 'coop environment'],
ARRAY['chicken coop temperature', 'ideal temperature', 'cold weather care'],
true),

('How often should I clean the chicken coop?', 
'Deep clean the coop monthly, removing all bedding and disinfecting. Spot clean daily by removing wet bedding and droppings. Replace bedding weekly or when it becomes soiled. Regular cleaning prevents disease, parasites, and ammonia buildup that can cause respiratory problems.',
'housing',
ARRAY['cleaning', 'coop maintenance', 'hygiene'],
ARRAY['how to clean coop', 'coop cleaning schedule', 'coop maintenance'],
true),

('What bedding is best for chicken coops?', 
'Good bedding options include: pine shavings (absorbent, affordable), straw (good insulation), sand (easy to clean, but can be cold), and hemp bedding (highly absorbent). Avoid cedar shavings (toxic) and sawdust (too fine, can cause respiratory issues). Bedding should be 4-6 inches deep and kept dry.',
'housing',
ARRAY['bedding', 'litter', 'coop materials'],
ARRAY['best chicken bedding', 'coop bedding options', 'litter material'],
true),

('Do chickens need light at night?', 
'No, chickens need darkness to sleep and maintain natural rhythms. Provide 14-16 hours of light for layers during laying season to maintain egg production, but this should be natural daylight or timed lights, not constant light. Use a timer to maintain consistent day length. Darkness helps prevent stress and overstimulation.',
'housing',
ARRAY['lighting', 'daylight', 'sleep'],
ARRAY['chicken lighting', 'do chickens need light', 'coop lighting'],
true),

-- ===== HEALTH & DISEASE PREVENTION =====

('How do I prevent diseases in my flock?', 
'Prevent disease through: biosecurity (limit visitors, quarantine new birds), clean housing, balanced nutrition, fresh water, vaccination programs, regular health checks, and proper waste management. Isolate sick birds immediately. Practice good hygiene - wash hands and change clothes before handling different flocks.',
'health',
ARRAY['disease prevention', 'biosecurity', 'health management'],
ARRAY['preventing chicken diseases', 'flock health', 'disease control'],
true),

('What are signs of a sick chicken?', 
'Warning signs include: lethargy, loss of appetite, droopy wings, ruffled feathers, diarrhea, difficulty breathing, reduced egg production, isolation from the flock, pale comb/wattles, and unusual behavior. Early detection is crucial. Isolate sick birds and consult a veterinarian for diagnosis and treatment.',
'health',
ARRAY['symptoms', 'disease signs', 'health monitoring'],
ARRAY['sick chicken symptoms', 'how to tell if chicken is sick', 'health problems'],
true),

('How do I treat mites and lice?', 
'Treat external parasites by: dusting birds with food-grade diatomaceous earth or approved poultry dust, treating the coop with permethrin or other approved pesticides, removing and replacing all bedding, and repeating treatment after 7-10 days. Prevent by keeping coop clean and dry. Check birds regularly, especially under wings and around vent.',
'health',
ARRAY['parasites', 'mites', 'lice', 'pest control'],
ARRAY['chicken mites', 'how to treat lice', 'external parasites'],
true),

('Why is my chicken losing feathers?', 
'Feather loss can be due to: molting (natural, seasonal), pecking from other birds (cannibalism), parasites (mites/lice), stress, poor nutrition, or disease. Provide extra protein during molting. Address overcrowding, add enrichment, and ensure proper nutrition. If widespread, consult a veterinarian.',
'health',
ARRAY['feather loss', 'molting', 'pecking'],
ARRAY['why chickens lose feathers', 'feather problems', 'molting season'],
true),

('How do I prevent bumblefoot?', 
'Prevent bumblefoot by: keeping perches smooth and at proper height (2-4 inches wide, 18-24 inches high), removing sharp objects, providing soft bedding, maintaining clean dry conditions, and treating any cuts immediately. Bumblefoot is a bacterial infection of the foot pad often caused by injury or unsanitary conditions.',
'health',
ARRAY['bumblefoot', 'foot problems', 'infection prevention'],
ARRAY['prevent bumblefoot', 'chicken foot infection', 'foot care'],
true),

-- ===== EGG PRODUCTION =====

('How many eggs should a hen lay per week?', 
'Production breeds lay 5-7 eggs per week (250-300 per year). Heritage breeds lay 3-4 eggs per week (150-200 per year). Egg production decreases with age and during molting. Factors affecting production include: breed, age, nutrition, daylight hours, stress, and health. First eggs may be irregular in size and shape.',
'egg_production',
ARRAY['egg laying', 'productivity', 'layer performance'],
ARRAY['how many eggs per week', 'egg production rate', 'laying frequency'],
true),

('Why did my hen stop laying eggs?', 
'Common reasons include: molting (temporary), age (declines after 2-3 years), insufficient daylight (need 14-16 hours), stress, disease, poor nutrition, broodiness, extreme temperatures, or lack of nesting boxes. Ensure proper feed, lighting, and health. If extended, consult a veterinarian.',
'egg_production',
ARRAY['egg production problems', 'not laying', 'reduced production'],
ARRAY['chicken stopped laying', 'why no eggs', 'egg production issues'],
true),

('What causes soft-shelled eggs?', 
'Soft or thin shells result from: calcium deficiency (most common), stress, heat, disease, age, or genetics. Provide layer feed with 3.5-4% calcium and offer free-choice oyster shell or crushed eggshells. Ensure adequate Vitamin D3 for calcium absorption. If persistent, check for illness.',
'egg_production',
ARRAY['egg quality', 'shell problems', 'calcium'],
ARRAY['soft shell eggs', 'thin eggshells', 'calcium deficiency'],
true),

('How long do chickens lay eggs?', 
'Chickens typically start laying at 18-24 weeks old. Peak production is 6-18 months. Production gradually declines after 2 years but can continue for 5-7 years. Heritage breeds lay longer but fewer eggs. Good nutrition and management extend productive life. Most commercial operations replace layers after 18-24 months.',
'egg_production',
ARRAY['laying age', 'production lifespan', 'layer longevity'],
ARRAY['how long do chickens lay', 'laying lifespan', 'egg production age'],
true),

('Why are my eggs dirty?', 
'Dirty eggs can result from: wet or soiled bedding, overcrowded nesting boxes, eggs laid on floor, or health issues causing diarrhea. Provide clean, dry nesting boxes with fresh bedding. Collect eggs 2-3 times daily. Clean dirty eggs gently with warm water if needed, but avoid washing if possible as it removes protective coating.',
'egg_production',
ARRAY['egg cleanliness', 'nesting boxes', 'egg collection'],
ARRAY['dirty eggs', 'clean eggs', 'egg hygiene'],
true),

-- ===== BROILER MANAGEMENT =====

('How long does it take to raise broiler chickens?', 
'Commercial broilers reach market weight (4-6 lbs) in 6-8 weeks. Heritage meat breeds take 12-16 weeks. Growth rate depends on breed, feed quality, and management. Fast-growing broilers need special care to prevent leg problems. Provide adequate space (1-2 sq ft per bird) and proper nutrition.',
'broiler_management',
ARRAY['broiler production', 'growing time', 'meat chickens'],
ARRAY['how long to raise broilers', 'broiler growth', 'meat chicken timeline'],
true),

('What feed is best for broilers?', 
'Broiler starter feed (22-24% protein) for first 2-3 weeks, then broiler grower feed (18-20% protein) until market age. Feed should be high in energy and balanced for rapid growth. Provide feed free-choice (available at all times). Ensure adequate water - broilers drink 2-3 times more water than feed consumed.',
'broiler_management',
ARRAY['broiler feed', 'meat chicken nutrition', 'growth feed'],
ARRAY['best broiler feed', 'meat chicken feed', 'broiler nutrition'],
true),

('How do I prevent leg problems in broilers?', 
'Prevent leg issues by: providing proper nutrition (not overfeeding), adequate space for exercise, good footing (not slippery), appropriate lighting (not too bright), and selecting genetics with good leg health. Limit growth rate slightly if needed. Provide perches and enrichment. Monitor for lameness daily.',
'broiler_management',
ARRAY['leg health', 'broiler welfare', 'growth management'],
ARRAY['broiler leg problems', 'prevent lameness', 'leg health'],
true),

-- ===== BREEDING & HATCHING =====

('How do I hatch chicken eggs?', 
'Use an incubator set to 99.5°F (37.5°C) with 50-55% humidity for first 18 days, then 65-70% for final 3 days. Turn eggs 3-5 times daily until day 18. Stop turning on day 18. Hatching takes 21 days. Use fresh, fertilized eggs (less than 7 days old). Maintain stable temperature and humidity.',
'breeding',
ARRAY['hatching', 'incubation', 'reproduction'],
ARRAY['how to hatch eggs', 'incubating chicken eggs', 'hatching process'],
true),

('What is the ratio of roosters to hens?', 
'For breeding: 1 rooster per 8-10 hens is ideal. For egg production only: no roosters needed. Too many roosters cause over-mating, stress, and injury to hens. Too few roosters may result in unfertilized eggs. Monitor for aggressive behavior and adjust ratio as needed.',
'breeding',
ARRAY['rooster ratio', 'breeding management', 'flock structure'],
ARRAY['roosters per hen', 'breeding ratio', 'rooster management'],
true),

-- ===== BEHAVIOR & WELFARE =====

('Why do chickens peck each other?', 
'Pecking can be due to: overcrowding, boredom, stress, nutritional deficiencies, introduction of new birds, or natural pecking order establishment. Provide adequate space, enrichment (perches, dust baths, treats), balanced diet, and proper lighting. Remove injured birds immediately. Use beak trimming only as last resort under veterinary guidance.',
'behavior',
ARRAY['pecking', 'cannibalism', 'aggression'],
ARRAY['why chickens peck', 'pecking problems', 'aggressive behavior'],
true),

('How do I introduce new chickens to my flock?', 
'Quarantine new birds for 2-4 weeks in separate area. Then introduce gradually: keep them in visible but separate enclosure for a week, allow supervised free-range time together, integrate during evening when birds are calm, provide multiple feeding/watering stations, and monitor closely. Expect some pecking order disputes - normal unless severe.',
'behavior',
ARRAY['introducing birds', 'flock integration', 'new chickens'],
ARRAY['adding new chickens', 'flock introduction', 'integrating birds'],
true),

('Why is my chicken broody?', 
'Broodiness is natural instinct to sit on eggs and hatch them. Signs: sitting on nest constantly, aggressive when disturbed, plucking chest feathers, not leaving nest. To break: remove from nest repeatedly, block access to nesting boxes, place in wire-bottom cage for 2-3 days, or let her hatch eggs if desired.',
'behavior',
ARRAY['broodiness', 'nesting behavior', 'reproduction'],
ARRAY['broody hen', 'how to stop broodiness', 'sitting on eggs'],
true),

-- ===== WATER MANAGEMENT =====

('How much water do chickens need?', 
'Chickens need constant access to fresh, clean water. They drink approximately 500ml (2 cups) per bird per day, more in hot weather or when laying. Provide 1 waterer per 10-15 birds. Clean waterers daily and refill frequently. In winter, prevent freezing with heated waterers. Dehydration is a serious health threat.',
'management',
ARRAY['water', 'hydration', 'waterers'],
ARRAY['how much water', 'chicken water needs', 'water management'],
true),

('How do I prevent water from freezing in winter?', 
'Use heated waterers (poultry-specific, safe designs), change water frequently (2-3 times daily), use black containers that absorb sunlight, add electrolytes to water (helps prevent freezing slightly), or bring waterers inside at night. Never let chickens go without water - they can dehydrate quickly even in cold weather.',
'management',
ARRAY['winter care', 'water freezing', 'cold weather'],
ARRAY['prevent water freezing', 'winter water', 'cold weather care'],
true),

-- ===== PREDATOR PROTECTION =====

('How do I protect my chickens from predators?', 
'Protect with: secure coop with hardware cloth (not chicken wire) buried 6-12 inches, secure latches on doors, motion-activated lights, guard animals (dogs), remove hiding spots near coop, lock birds in at night, and use predator-proof fencing. Common predators include: foxes, raccoons, hawks, owls, dogs, and snakes.',
'management',
ARRAY['predators', 'security', 'coop protection'],
ARRAY['predator protection', 'protect chickens', 'coop security'],
true),

-- ===== VENTILATION =====

('Why is ventilation important in chicken coops?', 
'Proper ventilation removes: ammonia from droppings, moisture (prevents respiratory disease), heat in summer, and stale air. Good ventilation prevents frostbite in winter while maintaining air quality. Provide vents near top (warm air out) and adjustable openings. Draft-free air movement is key - birds should feel air movement without direct drafts.',
'housing',
ARRAY['ventilation', 'air quality', 'coop design'],
ARRAY['chicken coop ventilation', 'air circulation', 'coop ventilation'],
true),

-- ===== POULTRY BREEDS =====

('What are the best breeds for beginners?', 
'Beginner-friendly breeds include: Rhode Island Red (hardy, good layers), Plymouth Rock (docile, dual-purpose), Orpington (gentle, cold-hardy), Australorp (excellent layers), and Sussex (friendly, good foragers). These breeds are generally calm, productive, and easy to manage. Avoid flighty or aggressive breeds until experienced.',
'general',
ARRAY['breeds', 'beginner tips', 'breed selection'],
ARRAY['best chicken breeds', 'beginner breeds', 'breed selection'],
true),

('What is the difference between heritage and commercial breeds?', 
'Heritage breeds: traditional, slower growth, longer lifespan, fewer but larger eggs, better foragers, more disease resistance, suitable for free-range. Commercial breeds: bred for maximum production (eggs or meat), faster growth, higher feed efficiency, may have health issues if over-selected, require more management. Choose based on your goals.',
'general',
ARRAY['breeds', 'heritage', 'commercial'],
ARRAY['heritage vs commercial', 'breed differences', 'chicken breeds'],
true),

-- ===== MOLTING =====

('What is molting and when does it happen?', 
'Molting is the natural process where chickens shed old feathers and grow new ones. It typically occurs in fall (September-November) and can last 6-16 weeks. During molting, egg production stops or decreases significantly. Increase protein in feed (18-20%) to support feather regrowth. This is normal and healthy.',
'health',
ARRAY['molting', 'feathers', 'seasonal'],
ARRAY['chicken molting', 'feather loss', 'molting season'],
true),

-- ===== NESTING BOXES =====

('How many nesting boxes do I need?', 
'Provide 1 nesting box per 4-5 hens. Boxes should be 12x12x12 inches, placed in dark, quiet area of coop, 18-24 inches off ground, with soft bedding. Too few boxes cause competition and floor-laying. More boxes reduce stress and egg breakage. Clean and check regularly.',
'housing',
ARRAY['nesting boxes', 'egg laying', 'coop design'],
ARRAY['nesting box requirements', 'how many boxes', 'nesting space'],
true),

-- ===== FREE-RANGE MANAGEMENT =====

('Should I let my chickens free-range?', 
'Free-ranging provides: exercise, natural diet (insects, greens), reduced feed costs, and better welfare. Risks include: predators, disease exposure, garden damage, and wandering. Use supervised free-ranging or secure run. Provide shelter and always lock birds in coop at night. Balance freedom with safety.',
'management',
ARRAY['free-range', 'foraging', 'outdoor access'],
ARRAY['free-range chickens', 'should I free-range', 'outdoor access'],
true),

-- ===== DUST BATHS =====

('Why do chickens need dust baths?', 
'Dust bathing helps chickens: control parasites (mites, lice), clean feathers, and maintain skin health. Provide dust bath area with dry soil, sand, or diatomaceous earth. Container should be 12-18 inches deep and large enough for birds to roll and scratch. Natural behavior - essential for health.',
'behavior',
ARRAY['dust bath', 'parasite control', 'grooming'],
ARRAY['dust bathing', 'why dust bath', 'chicken grooming'],
true),

-- ===== EGG STORAGE =====

('How long do fresh eggs last?', 
'Fresh, unwashed eggs can be stored at room temperature for 2-3 weeks or refrigerated for 4-5 weeks. Washed eggs must be refrigerated. Best quality within first week. Store pointed end down. Do not wash until ready to use (removes protective coating). Test freshness by floating in water - fresh eggs sink.',
'egg_production',
ARRAY['egg storage', 'food safety', 'egg quality'],
ARRAY['how long eggs last', 'storing eggs', 'egg freshness'],
true),

-- ===== VACCINATION =====

('What vaccines do chickens need?', 
'Common vaccines include: Marek''s disease (highly recommended, given to day-old chicks), Newcastle disease, infectious bronchitis, and fowl pox. Vaccination needs vary by region, flock size, and management system. Consult local veterinarian or extension service for recommendations. Backyard flocks may need fewer vaccines than commercial operations.',
'health',
ARRAY['vaccination', 'disease prevention', 'health programs'],
ARRAY['chicken vaccines', 'vaccination schedule', 'disease prevention'],
true),

-- ===== WASTE MANAGEMENT =====

('How do I manage chicken manure?', 
'Chicken manure is excellent fertilizer but must be composted first (6 months) to kill pathogens and prevent burning plants. Use deep litter method (build up bedding, turn regularly), or remove and compost separately. Wear gloves when handling. Compost should reach 130-150°F to kill pathogens. Rich in nitrogen - use in moderation.',
'management',
ARRAY['manure', 'composting', 'waste management'],
ARRAY['chicken manure', 'composting manure', 'waste management'],
true),

-- ===== WINTER CARE =====

('How do I care for chickens in winter?', 
'Winter care includes: draft-free but well-ventilated coop, adequate bedding for insulation, prevent water freezing (heated waterers), increase feed (birds burn more calories), provide grit (helps digestion), ensure adequate lighting for layers, check for frostbite on combs/wattles, and keep coop dry. Most cold-hardy breeds handle freezing temperatures well.',
'management',
ARRAY['winter', 'cold weather', 'seasonal care'],
ARRAY['winter chicken care', 'cold weather management', 'winter preparation'],
true),

-- ===== SUMMER CARE =====

('How do I keep chickens cool in summer?', 
'Keep chickens cool by: providing shade, ensuring adequate ventilation, fresh cool water (change frequently), frozen treats (frozen fruits/vegetables), misters or shallow water for cooling, reducing activity during hottest hours, and providing electrolytes in water during heat stress. Watch for panting - sign of heat stress. Provide extra water containers.',
'management',
ARRAY['summer', 'heat stress', 'cooling'],
ARRAY['summer chicken care', 'heat management', 'keeping cool'],
true),

-- ===== EGG QUALITY =====

('Why are my eggs different sizes?', 
'Egg size varies by: age of hen (younger hens lay smaller eggs), breed genetics, nutrition, and individual variation. First eggs are often smaller. Production increases and stabilizes after several months. Some variation is normal. Very small or misshapen eggs may indicate health issues - monitor bird health.',
'egg_production',
ARRAY['egg size', 'egg quality', 'production'],
ARRAY['egg size variation', 'why different egg sizes', 'egg quality'],
true),

-- ===== COMMON PROBLEMS =====

('Why are my chickens eating their own eggs?', 
'Egg eating can be caused by: accidental breakage (birds taste egg, develop habit), nutritional deficiency (especially calcium), boredom, or overcrowding. Prevent by: collecting eggs frequently, providing proper nutrition, ensuring adequate nesting boxes, adding golf balls or fake eggs as deterrents, and removing any egg-eating birds from flock if behavior persists.',
'egg_production',
ARRAY['egg eating', 'behavior problems', 'cannibalism'],
ARRAY['chickens eating eggs', 'prevent egg eating', 'egg eating problem'],
true),

('What causes egg binding?', 
'Egg binding occurs when an egg gets stuck in the oviduct. Causes include: calcium deficiency, oversized eggs, stress, obesity, or reproductive issues. Signs: hen straining, not moving, tail pumping. Emergency care: warm bath, gentle massage, isolation. Prevent with proper nutrition and calcium. If not resolved quickly, consult veterinarian immediately.',
'health',
ARRAY['egg binding', 'reproductive problems', 'emergency care'],
ARRAY['egg bound chicken', 'stuck egg', 'reproductive issues'],
true),

-- ===== POULTRY BUSINESS =====

('How do I start a small poultry farm?', 
'Start by: researching local regulations and permits, choosing appropriate breeds for your goals, securing adequate land and housing, developing a business plan, understanding costs (feed, housing, healthcare), identifying markets, starting small (50-100 birds), and learning from experienced farmers. Join local poultry associations and extension programs.',
'general',
ARRAY['starting farm', 'business', 'planning'],
ARRAY['starting poultry farm', 'small farm', 'poultry business'],
true),

-- ===== RECORD KEEPING =====

('What records should I keep for my flock?', 
'Important records include: bird inventory (breeds, numbers, dates), feed consumption and costs, egg production (daily/weekly counts), health treatments and vaccinations, mortality records, breeding records, and financial records. Good record keeping helps identify problems early, track performance, and make management decisions.',
'management',
ARRAY['record keeping', 'flock management', 'documentation'],
ARRAY['poultry records', 'flock tracking', 'farm records'],
true);

-- Verify entries were inserted
SELECT COUNT(*) as total_entries, 
       category, 
       COUNT(*) FILTER (WHERE is_ai_verified = true) as verified_count
FROM knowledge_base 
GROUP BY category
ORDER BY total_entries DESC;

