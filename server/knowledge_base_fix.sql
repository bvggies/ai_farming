-- Standalone INSERT for the entries causing the error
-- Make sure knowledge_base table exists first!

INSERT INTO knowledge_base (title, content, category, tags, keywords, is_ai_verified) VALUES

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
true);

