-- Migrate existing single bucket associations to transaction_buckets table
-- This script copies all existing transaction.bucket_id entries to the transaction_buckets table
INSERT INTO transaction_buckets (id, transaction_id, bucket_id, created_at, updated_at)
SELECT 
  substr('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx', 1, 8) || '-' ||
  substr('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx', 1, 4) || '-' ||
  substr('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx', 1, 4) || '-' ||
  substr('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx', 1, 4) || '-' ||
  substr('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx', 1, 12) as id,
  t.id as transaction_id,
  t.bucket_id,
  COALESCE(t.created_at, CURRENT_TIMESTAMP) as created_at,
  COALESCE(t.updated_at, CURRENT_TIMESTAMP) as updated_at
FROM transactions t
WHERE t.bucket_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM transaction_buckets tb 
    WHERE tb.transaction_id = t.id AND tb.bucket_id = t.bucket_id
  );
