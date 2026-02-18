# SQL Syntax Error Fix

## Problem
You're getting: `ERROR: syntax error at or near "'egg_production'"`

## Cause
The error occurs when trying to run SQL entries without the complete `INSERT INTO` statement structure.

## Solution

### Option 1: Run the Complete File (Recommended)
1. Open `server/knowledge_base_data.sql` in Neon SQL Editor
2. Copy the **entire file** (from `CREATE TABLE` to the final `;`)
3. Paste and execute in Neon SQL Editor

### Option 2: Run Individual Entries
If you need to add just these specific entries, use `server/knowledge_base_fix.sql` which contains the complete INSERT statement.

### Option 3: Check Existing Entries
If entries already exist and you're getting duplicates:

```sql
-- Check if entries already exist
SELECT title, category 
FROM knowledge_base 
WHERE title IN (
  'How long do chickens lay eggs?',
  'Why are my eggs dirty?',
  'How long does it take to raise broiler chickens?',
  'What feed is best for broilers?',
  'How do I prevent leg problems in broilers?'
);

-- If they exist, delete first:
DELETE FROM knowledge_base 
WHERE title IN (
  'How long do chickens lay eggs?',
  'Why are my eggs dirty?',
  'How long does it take to raise broiler chickens?',
  'What feed is best for broilers?',
  'How do I prevent leg problems in broilers?'
);
```

## Important Notes

1. **Always include the full INSERT statement**: 
   ```sql
   INSERT INTO knowledge_base (title, content, category, tags, keywords, is_ai_verified) VALUES
   (title, content, category, ...),  -- Each entry starts with (
   (title, content, category, ...),
   ...
   ;  -- Ends with semicolon
   ```

2. **Each entry must start with `(` and end with `)`**

3. **Entries are separated by commas**, except the last one before `;`

4. **Check table exists first**:
   ```sql
   SELECT EXISTS (
     SELECT FROM information_schema.tables 
     WHERE table_schema = 'public' 
     AND table_name = 'knowledge_base'
   );
   ```

## Verification

After running, verify entries were inserted:

```sql
SELECT COUNT(*) as total, 
       category,
       COUNT(*) FILTER (WHERE is_ai_verified = true) as verified
FROM knowledge_base 
GROUP BY category
ORDER BY total DESC;
```

