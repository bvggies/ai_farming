-- Add 8 additional unique FAQs to the knowledge base
-- These FAQs cover topics not already covered in the existing knowledge base

INSERT INTO knowledge_base (title, content, category, tags, keywords, is_ai_verified) VALUES

-- ===== CHICK CARE =====
('How do I care for newly hatched chicks?', 
'Newly hatched chicks need: a brooder with temperature of 95°F (35°C) for first week, reducing by 5°F each week until 6 weeks old, chick starter feed (20-24% protein), fresh water in shallow containers (add marbles to prevent drowning), clean dry bedding (paper towels or pine shavings), and protection from drafts. Monitor for pasty butt (clean gently with warm water). Provide 24-hour light for first few days, then reduce to 18 hours.',
'faq', 
ARRAY['chick care', 'baby chickens', 'brooding'],
ARRAY['newly hatched chicks', 'chick care guide', 'raising baby chickens'],
true),

-- ===== EGG FERTILITY & CANDLING =====
('How do I check if an egg is fertile?', 
'To check fertility: use a bright flashlight (candling) in a dark room after 7-10 days of incubation. Fertile eggs show: visible blood vessels forming a spiderweb pattern, a dark spot (developing embryo), and movement when gently rotated. Infertile eggs appear clear or show only a yolk shadow. Remove infertile eggs to prevent contamination. Fresh eggs can also be cracked open - fertile eggs show a small white bullseye on the yolk (blastodisc).',
'faq', 
ARRAY['egg fertility', 'candling', 'breeding'],
ARRAY['check egg fertility', 'candling eggs', 'fertile eggs'],
true),

-- ===== FEED STORAGE =====
('How should I store chicken feed?', 
'Store feed in: airtight containers (metal bins or food-grade plastic), cool dry location (below 75°F), away from direct sunlight, elevated off ground to prevent moisture and pests, and use oldest feed first (FIFO rotation). Buy only what you can use in 2-3 months. Check for mold, insects, or off odors before feeding. Keep feed containers sealed tightly to prevent rodents and moisture. Store different feed types separately and label with purchase date.',
'faq', 
ARRAY['feed storage', 'feed management', 'storage'],
ARRAY['how to store chicken feed', 'feed storage tips', 'feed preservation'],
true),

-- ===== HANDLING & SOCIALIZATION =====
('How do I tame and handle my chickens?', 
'Tame chickens by: spending time near them daily, offering treats from your hand, moving slowly and speaking softly, handling gently but confidently, starting with short sessions (5-10 minutes), handling during evening when birds are calmer, and being consistent. Hold birds securely but not tightly - support body and wings. Start with calm breeds and younger birds. Regular handling reduces stress during health checks and makes management easier.',
'faq', 
ARRAY['handling', 'taming', 'socialization'],
ARRAY['tame chickens', 'handle chickens', 'chicken socialization'],
true),

-- ===== SEASONAL EGG PRODUCTION =====
('Why do chickens lay fewer eggs in winter?', 
'Reduced winter laying is due to: shorter daylight hours (chickens need 14-16 hours of light to lay consistently), cold stress (birds use energy to stay warm), molting season (typically fall/winter), and natural biological rhythms. To maintain production: provide artificial lighting (use timer for 14-16 hours total), ensure adequate nutrition (increase feed 10-20%), keep coop warm but well-ventilated, and use cold-hardy breeds. Some reduction is normal and healthy - forcing year-round production can shorten hen lifespan.',
'faq', 
ARRAY['winter laying', 'seasonal production', 'egg production'],
ARRAY['winter egg production', 'why fewer eggs in winter', 'seasonal laying'],
true),

-- ===== EMERGENCY FIRST AID =====
('What should I do if my chicken is injured?', 
'For injured chickens: isolate immediately in quiet, warm area, stop any bleeding (apply pressure, use styptic powder or cornstarch), clean wounds with saline or warm water, apply antibiotic ointment (poultry-safe), provide fresh water and food nearby, monitor for shock (pale comb, lethargy), keep bird warm and stress-free, and consult veterinarian for serious injuries. Common injuries: cuts, broken legs (splint if possible), pecking wounds, and predator attacks. Have a first aid kit with: bandages, antiseptic, styptic powder, and vet contact.',
'faq', 
ARRAY['first aid', 'injuries', 'emergency care'],
ARRAY['injured chicken', 'chicken first aid', 'emergency care'],
true),

-- ===== COOP SECURITY =====
('What are the best security features for a chicken coop?', 
'Essential security features: hardware cloth (1/4 inch mesh, not chicken wire) on all openings, buried wire 6-12 inches deep around perimeter, secure latches (raccoon-proof, use carabiners or padlocks), automatic door closers (solar-powered), motion-activated lights, predator-proof windows (covered with hardware cloth), solid floor or buried wire, and regular security checks. Common weaknesses: gaps larger than 1/4 inch, flimsy latches, unsecured windows, and gaps under doors. Test security by trying to open from outside.',
'faq', 
ARRAY['coop security', 'predator protection', 'safety'],
ARRAY['secure chicken coop', 'coop security features', 'predator proof coop'],
true),

-- ===== ROOSTER MANAGEMENT =====
('How do I manage an aggressive rooster?', 
'Manage aggressive roosters by: establishing dominance (carry rooster under arm, don''t run away), providing adequate hens (1 rooster per 8-10 hens reduces aggression), ensuring enough space (overcrowding increases aggression), removing triggers (reflective surfaces, bright colors), using distraction techniques (toys, perches), considering rehoming if dangerous, and understanding breed tendencies (some breeds are naturally more aggressive). Aggression can be: territorial (protecting flock), hormonal (breeding season), or learned behavior. Never tolerate attacks on children - safety first.',
'faq', 
ARRAY['rooster management', 'aggression', 'behavior'],
ARRAY['aggressive rooster', 'rooster behavior', 'manage rooster'],
true);
