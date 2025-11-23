# 🚀 Supabase Setup Guide for ChainGuard

## Overview
This guide will help you set up your new Supabase project for the ChainGuard Digital Evidence Management system.

---

## 📋 Required Components

Your ChainGuard application requires:

1. **Database Table**: `kv_store_af0976da` - Key-value store for all application data
2. **Storage Bucket**: `evidence-files` - Stores encrypted evidence files
3. **Edge Function**: `make-server-af0976da` - Backend API server

---

## 🗄️ Part 1: Database Setup

### Step 1: Create the KV Store Table

Go to your Supabase Dashboard → SQL Editor and run this SQL:

```sql
-- Create the key-value store table
CREATE TABLE kv_store_af0976da (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- Add index for prefix searches (improves performance)
CREATE INDEX idx_kv_store_key_prefix ON kv_store_af0976da (key text_pattern_ops);

-- Enable Row Level Security (RLS)
ALTER TABLE kv_store_af0976da ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to do everything
CREATE POLICY "Service role can do everything" 
ON kv_store_af0976da
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Create policy to allow authenticated users to read
CREATE POLICY "Authenticated users can read" 
ON kv_store_af0976da
FOR SELECT 
TO authenticated
USING (true);
```

### Step 2: Verify Table Creation

Run this query to verify:

```sql
SELECT * FROM kv_store_af0976da LIMIT 1;
```

You should see an empty table (no error).

---

## 📦 Part 2: Storage Setup

### Step 1: Create the Evidence Files Bucket

1. Go to **Storage** in your Supabase Dashboard
2. Click **"Create a new bucket"**
3. Set the following:
   - **Name**: `evidence-files`
   - **Public**: ❌ **Unchecked** (private bucket)
   - **File size limit**: Leave empty or set to max (supports unlimited file sizes)
4. Click **Create bucket**

### Step 2: Configure Storage Policies

Go to **Storage → Policies** for the `evidence-files` bucket and add these policies:

#### Policy 1: Service Role Full Access
```sql
-- Allow service role to do everything
CREATE POLICY "Service role full access"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'evidence-files')
WITH CHECK (bucket_id = 'evidence-files');
```

#### Policy 2: Authenticated Users Can Read Their Own Files
```sql
-- Allow authenticated users to read files they have access to
CREATE POLICY "Users can read their files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'evidence-files');
```

---

## ⚙️ Part 3: Edge Function Setup

### Step 1: Install Supabase CLI

If you haven't already:

```bash
npm install -g supabase
```

### Step 2: Link Your Project

```bash
supabase login
supabase link --project-ref ptutcrbextnrrbcfubxs
```

### Step 3: Deploy the Edge Function

From your project root directory:

```bash
supabase functions deploy make-server-af0976da --no-verify-jwt
```

**Important Flags:**
- `--no-verify-jwt`: Allows the function to be called without JWT authentication (handles auth internally)

### Step 4: Set Environment Variables

Your edge function needs these environment variables:

```bash
# Automatically set by Supabase:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY

# No additional env vars needed!
```

---

## 🔐 Part 4: Get Your Credentials

You already have these in your `.env` file, but here's where to find them:

1. Go to **Settings → API** in Supabase Dashboard
2. Copy these values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API keys → anon/public** → `VITE_SUPABASE_ANON_KEY`
   - **Project Reference ID** → `VITE_SUPABASE_PROJECT_ID`

Your current `.env` file:
```env
VITE_SUPABASE_URL=https://ptutcrbextnrrbcfubxs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0dXRjcmJleHRucnJiY2Z1YnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzU3MDMsImV4cCI6MjA3OTMxMTcwM30.LJdlmMBAAuc_9UVbEivkgL0Ef049IZ6OjmRr2DPCMqk
VITE_SUPABASE_PROJECT_ID=ptutcrbextnrrbcfubxs
```

✅ **Already configured correctly!**

---

## 🧪 Part 5: Test Your Setup

### Test 1: Initialize Demo Users

1. Run your local development server:
   ```bash
   npm run dev
   ```

2. Log in as admin:
   - Email: `admin@evidenceshield.gov`
   - Password: `admin123`

3. Go to **Admin Dashboard**

4. Click **"Initialize Users"** button

5. You should see: **"8 demo users initialized"**

### Test 2: Upload a Test File

1. Go to **Upload Evidence**
2. Upload a small test file
3. Check if it appears in **My Evidence**

### Test 3: Check Storage

1. Go to Supabase Dashboard → **Storage → evidence-files**
2. You should see your uploaded file organized by:
   ```
   evidence-files/
   └── {userEmail}/
       └── {caseNumber}/
           └── {fileId}/
               └── {fileName}
   ```

### Test 4: Check Database

Run this SQL in Supabase:

```sql
-- Check if demo users were created
SELECT key FROM kv_store_af0976da WHERE key LIKE 'user:%';

-- Check if files were uploaded
SELECT key FROM kv_store_af0976da WHERE key LIKE 'evidence:%';

-- Check audit trail
SELECT key FROM kv_store_af0976da WHERE key LIKE 'audit:%';
```

---

## 📊 Part 6: Data Structure

Your application stores data in the `kv_store_af0976da` table using these key patterns:

### User Data
```
user:{email}                          → User profile
user_evidence:{email}:{fileId}        → File references for user
user_batch:{email}:{batchId}          → Batch upload references
```

### Evidence Data
```
evidence:{fileId}                     → File metadata
batch:{batchId}                       → Batch upload metadata
```

### Audit Trail
```
audit:{auditId}                       → Audit event
file_audit:{fileId}:{auditId}         → Per-file audit reference
```

### Example Data Structure:

**User:**
```json
{
  "email": "admin@evidenceshield.gov",
  "name": "System Administrator",
  "role": "Administrator",
  "department": "IT Department",
  "badgeId": "ADMIN-001",
  "password": "admin123",
  "status": "active"
}
```

**Evidence File:**
```json
{
  "id": "file_1234567890_abc123",
  "caseNumber": "CASE-001",
  "description": "Security footage",
  "fileName": "video.mp4",
  "fileSize": 1048576,
  "fileType": "video/mp4",
  "fileHash": "a1b2c3d4...",
  "ipfsCid": "bafybei...",
  "txHash": "0x123abc...",
  "uploadedBy": "admin@evidenceshield.gov",
  "uploaderName": "System Administrator",
  "uploaderRole": "Administrator",
  "department": "IT Department",
  "timestamp": "2024-01-15T10:30:00Z",
  "sharedWith": [],
  "storagePath": "admin@evidenceshield.gov/CASE-001/file_123/video.mp4"
}
```

---

## 🚀 Part 7: Deploy to Vercel

### Update Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → **Settings → Environment Variables**

2. Update/Add these variables:
   ```
   VITE_SUPABASE_URL=https://ptutcrbextnrrbcfubxs.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0dXRjcmJleHRucnJiY2Z1YnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzU3MDMsImV4cCI6MjA3OTMxMTcwM30.LJdlmMBAAuc_9UVbEivkgL0Ef049IZ6OjmRr2DPCMqk
   VITE_SUPABASE_PROJECT_ID=ptutcrbextnrrbcfubxs
   ```

3. Select **All environments** (Production, Preview, Development)

4. Click **Save**

5. Go to **Deployments** and click **Redeploy** on the latest deployment

---

## ✅ Verification Checklist

- [ ] Database table `kv_store_af0976da` created
- [ ] Storage bucket `evidence-files` created (private)
- [ ] Storage policies configured
- [ ] Edge function `make-server-af0976da` deployed
- [ ] Demo users initialized successfully
- [ ] Test file uploaded successfully
- [ ] File appears in Storage bucket
- [ ] Audit trail records created
- [ ] Vercel environment variables updated
- [ ] Vercel redeployed successfully

---

## 🐛 Troubleshooting

### Issue: "Failed to upload to storage"
- Check storage bucket exists and is named exactly `evidence-files`
- Verify storage policies are configured
- Check service role key is set in edge function

### Issue: "File not found" when downloading
- Check file exists in Storage → evidence-files bucket
- Verify `storagePath` is stored in file metadata
- Check storage policies allow reading

### Issue: "Function not found" errors
- Verify edge function is deployed: `supabase functions list`
- Check function name is exactly `make-server-af0976da`
- Redeploy function: `supabase functions deploy make-server-af0976da --no-verify-jwt`

### Issue: Demo users not initializing
- Check database table exists
- Verify RLS policies allow service role access
- Check edge function logs in Supabase Dashboard

---

## 📚 Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🎉 You're All Set!

Your ChainGuard application is now fully configured with:
- ✅ Secure database storage
- ✅ Unlimited file upload support
- ✅ Blockchain-powered audit trail
- ✅ Zero-knowledge proof verification
- ✅ Multi-user evidence sharing

**Next Steps:**
1. Initialize demo users from Admin Dashboard
2. Upload test evidence
3. Try sharing files with other users
4. View audit trail for transparency

Happy evidence management! 🔐
