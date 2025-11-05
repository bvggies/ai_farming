# Knowledge Base Setup

## Problem
You're seeing "No entries found" on the Knowledge Base page.

## Solution

### Step 1: Create the Table
Run this SQL in Neon SQL Editor:

```sql
-- Create knowledge_base table
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
```

### Step 2: Insert Knowledge Base Data
Run the complete `server/knowledge_base_data.sql` file in Neon SQL Editor. This will:
- Create the table (if not exists)
- Insert 50+ knowledge base entries
- Verify the entries were created

### Step 3: Verify
Check if entries exist:

```sql
SELECT COUNT(*) as total, category 
FROM knowledge_base 
GROUP BY category;
```

You should see entries with categories like:
- `feeding`
- `egg_production`
- `health`
- `broiler_management`
- `management`
- etc.

## API Endpoints Created

✅ **GET `/api/knowledge`** - Get all knowledge entries (public, no auth)
✅ **GET `/api/knowledge?id=xxx`** - Get single entry by ID
✅ **GET `/api/knowledge/search?q=query`** - Search entries

## Frontend Updated

✅ KnowledgeBase page now uses the correct API endpoints
✅ Search functionality works with `/api/knowledge/search`
✅ Entry detail view works with query parameter

## Troubleshooting

If you still see "No entries found":

1. **Check table exists:**
   ```sql
   SELECT EXISTS (
     SELECT FROM information_schema.tables 
     WHERE table_schema = 'public' 
     AND table_name = 'knowledge_base'
   );
   ```

2. **Check entries exist:**
   ```sql
   SELECT COUNT(*) FROM knowledge_base;
   ```

3. **Test API directly:**
   Visit: `https://your-app.vercel.app/api/knowledge`
   Should return JSON array of entries

4. **Check browser console:**
   Look for any API errors in the browser's developer console

## Next Steps

After running the SQL:
1. Refresh the Knowledge Base page
2. You should see all 50+ entries
3. Search functionality should work
4. Clicking an entry should show full details

