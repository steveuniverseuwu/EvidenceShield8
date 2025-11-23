# ⚡ Quick Setup Checklist for New Supabase Project

## Your Current Configuration ✅
```
Project ID: ptutcrbextnrrbcfubxs
URL: https://ptutcrbextnrrbcfubxs.supabase.co
Status: Environment variables configured ✓
```

---

## 5-Minute Setup Steps

### 1️⃣ Create Database Table (2 min)
Go to: **Supabase Dashboard → SQL Editor**

Copy and paste from: `SQL_MIGRATION_SCRIPTS.sql`

**Or run this quick version:**
```sql
CREATE TABLE kv_store_af0976da (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

CREATE INDEX idx_kv_store_key_prefix ON kv_store_af0976da (key text_pattern_ops);

ALTER TABLE kv_store_af0976da ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" 
ON kv_store_af0976da FOR ALL TO service_role
USING (true) WITH CHECK (true);
```

**Verify:** Run `SELECT * FROM kv_store_af0976da;` (should return empty, no error)

---

### 2️⃣ Create Storage Bucket (1 min)
Go to: **Supabase Dashboard → Storage**

1. Click **"New bucket"**
2. Name: `evidence-files`
3. ❌ Uncheck "Public bucket"
4. Click **"Create bucket"**

**Verify:** Bucket `evidence-files` appears in Storage list

---

### 3️⃣ Deploy Edge Function (2 min)
Open terminal in your project folder:

```bash
# Install CLI (if not already installed)
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref ptutcrbextnrrbcfubxs

# Deploy function
supabase functions deploy make-server-af0976da --no-verify-jwt
```

**Verify:** Check Functions tab in Supabase Dashboard - you should see `make-server-af0976da`

---

### 4️⃣ Test Locally (Optional but recommended)
```bash
npm run dev
```

1. Login with: `admin@evidenceshield.gov` / `admin123`
2. Go to **Admin Dashboard**
3. Click **"Initialize Users"**
4. Should see: "8 demo users initialized"

---

### 5️⃣ Update Vercel (if deployed)
Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Ensure these exist:
```
VITE_SUPABASE_URL=https://ptutcrbextnrrbcfubxs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=ptutcrbextnrrbcfubxs
```

Then **Redeploy** your latest deployment.

---

## ✅ Done!

Your setup is complete when:
- [ ] Table `kv_store_af0976da` exists in Database
- [ ] Bucket `evidence-files` exists in Storage  
- [ ] Function `make-server-af0976da` appears in Functions
- [ ] Demo users initialize without errors
- [ ] You can upload a test file successfully

---

## 🆘 Quick Troubleshooting

**"Table does not exist"**
→ Run SQL scripts from Step 1

**"Bucket not found"**
→ Create bucket from Step 2 (exact name: `evidence-files`)

**"Function not found"**
→ Deploy function from Step 3

**"Failed to initialize users"**
→ Check table exists and RLS policies are set

**"Can't upload files"**
→ Verify bucket is named `evidence-files` (not `evidence_files`)

---

## 📚 Need More Details?

- Full guide: `SUPABASE_SETUP_GUIDE.md`
- SQL scripts: `SQL_MIGRATION_SCRIPTS.sql`
- Project docs: `README.md`

---

**Time to complete: ~5 minutes** ⏱️
