-- ============================================
-- ChainGuard Database Migration Scripts
-- ============================================
-- Run these scripts in your Supabase SQL Editor
-- Project: ptutcrbextnrrbcfubxs
-- ============================================

-- ============================================
-- STEP 1: Create KV Store Table
-- ============================================

-- Create the key-value store table for all application data
CREATE TABLE IF NOT EXISTS kv_store_af0976da (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE kv_store_af0976da IS 'Key-value store for ChainGuard evidence management system';

-- ============================================
-- STEP 2: Create Indexes for Performance
-- ============================================

-- Index for prefix searches (critical for performance)
CREATE INDEX IF NOT EXISTS idx_kv_store_key_prefix 
ON kv_store_af0976da (key text_pattern_ops);

-- Index for JSONB value searches (optional, for future queries)
CREATE INDEX IF NOT EXISTS idx_kv_store_value_gin 
ON kv_store_af0976da USING gin (value);

-- ============================================
-- STEP 3: Enable Row Level Security
-- ============================================

-- Enable RLS on the table
ALTER TABLE kv_store_af0976da ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: Create RLS Policies
-- ============================================

-- Policy 1: Service role has full access (required for Edge Functions)
CREATE POLICY "Service role full access" 
ON kv_store_af0976da
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 2: Authenticated users can read all data
CREATE POLICY "Authenticated users can read" 
ON kv_store_af0976da
FOR SELECT 
TO authenticated
USING (true);

-- Policy 3: Anon users can read user data (for login)
CREATE POLICY "Anon users can read user data" 
ON kv_store_af0976da
FOR SELECT 
TO anon
USING (key LIKE 'user:%');

-- ============================================
-- STEP 5: Create Updated At Trigger (Optional)
-- ============================================

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_kv_store_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS kv_store_updated_at_trigger ON kv_store_af0976da;
CREATE TRIGGER kv_store_updated_at_trigger
  BEFORE UPDATE ON kv_store_af0976da
  FOR EACH ROW
  EXECUTE FUNCTION update_kv_store_updated_at();

-- ============================================
-- STEP 6: Storage Bucket Policies
-- ============================================
-- Note: Run these AFTER creating the "evidence-files" bucket
-- in Supabase Dashboard → Storage

-- Policy 1: Service role full access to storage
CREATE POLICY "Service role storage full access"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'evidence-files')
WITH CHECK (bucket_id = 'evidence-files');

-- Policy 2: Authenticated users can read files
CREATE POLICY "Authenticated users can read files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'evidence-files');

-- Policy 3: Authenticated users can upload their own files
CREATE POLICY "Users can upload their files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'evidence-files' 
  AND (storage.foldername(name))[1] = auth.email()
);

-- Policy 4: Users can delete their own files
CREATE POLICY "Users can delete their files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'evidence-files' 
  AND (storage.foldername(name))[1] = auth.email()
);

-- ============================================
-- STEP 7: Verify Installation
-- ============================================

-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'kv_store_af0976da'
) AS table_exists;

-- Check if indexes exist
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'kv_store_af0976da';

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'kv_store_af0976da';

-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'kv_store_af0976da';

-- ============================================
-- STEP 8: Sample Queries for Testing
-- ============================================

-- View all keys (should be empty initially)
SELECT key, 
       CASE 
         WHEN key LIKE 'user:%' THEN 'User'
         WHEN key LIKE 'evidence:%' THEN 'Evidence'
         WHEN key LIKE 'audit:%' THEN 'Audit'
         WHEN key LIKE 'batch:%' THEN 'Batch'
         ELSE 'Other'
       END as type,
       created_at, 
       updated_at
FROM kv_store_af0976da
ORDER BY created_at DESC
LIMIT 20;

-- Count records by type
SELECT 
  CASE 
    WHEN key LIKE 'user:%' AND key NOT LIKE 'user_evidence:%' AND key NOT LIKE 'user_batch:%' THEN 'Users'
    WHEN key LIKE 'evidence:%' THEN 'Evidence Files'
    WHEN key LIKE 'audit:%' AND key LIKE 'audit:audit_%' THEN 'Audit Events'
    WHEN key LIKE 'batch:%' THEN 'Batch Uploads'
    ELSE 'Other'
  END as category,
  COUNT(*) as count
FROM kv_store_af0976da
GROUP BY category
ORDER BY count DESC;

-- View demo users (after initialization)
SELECT 
  value->>'email' as email,
  value->>'name' as name,
  value->>'role' as role,
  value->>'department' as department,
  value->>'status' as status
FROM kv_store_af0976da
WHERE key LIKE 'user:%' 
  AND key NOT LIKE 'user_evidence:%' 
  AND key NOT LIKE 'user_batch:%'
ORDER BY value->>'name';

-- View recent evidence uploads
SELECT 
  value->>'id' as file_id,
  value->>'fileName' as file_name,
  value->>'caseNumber' as case_number,
  value->>'uploaderName' as uploaded_by,
  value->>'timestamp' as timestamp
FROM kv_store_af0976da
WHERE key LIKE 'evidence:%'
ORDER BY value->>'timestamp' DESC
LIMIT 10;

-- View recent audit events
SELECT 
  value->>'id' as audit_id,
  value->>'action' as action,
  value->>'fileName' as file_name,
  value->>'performerName' as performer,
  value->>'timestamp' as timestamp,
  value->>'details' as details
FROM kv_store_af0976da
WHERE key LIKE 'audit:audit_%'
ORDER BY value->>'timestamp' DESC
LIMIT 10;

-- ============================================
-- STEP 9: Cleanup Queries (Use with caution!)
-- ============================================

-- Delete all evidence and audit data (keeps users)
-- WARNING: This will delete all files, audits, and related data!
/*
DELETE FROM kv_store_af0976da 
WHERE key LIKE 'evidence:%' 
   OR key LIKE 'audit:%' 
   OR key LIKE 'batch:%' 
   OR key LIKE 'user_evidence:%' 
   OR key LIKE 'user_batch:%'
   OR key LIKE 'file_audit:%';
*/

-- Delete all data (complete reset)
-- WARNING: This will delete EVERYTHING including users!
/*
DELETE FROM kv_store_af0976da;
*/

-- ============================================
-- STEP 10: Backup Queries
-- ============================================

-- Export all data as JSON (copy result for backup)
SELECT json_agg(
  json_build_object(
    'key', key,
    'value', value,
    'created_at', created_at,
    'updated_at', updated_at
  )
) as backup_data
FROM kv_store_af0976da;

-- ============================================
-- END OF MIGRATION SCRIPTS
-- ============================================

-- Next Steps:
-- 1. Create storage bucket "evidence-files" in Supabase Dashboard
-- 2. Deploy edge function "make-server-af0976da" using Supabase CLI
-- 3. Initialize demo users from your app's Admin Dashboard
-- 4. Test file upload and verification features

-- Questions? Check SUPABASE_SETUP_GUIDE.md for detailed instructions
