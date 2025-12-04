-- Create transaction_buckets table for many-to-many relationship
CREATE TABLE transaction_buckets (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  bucket_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (bucket_id) REFERENCES buckets(id) ON DELETE CASCADE,
  UNIQUE(transaction_id, bucket_id)
);

-- Create index for faster queries
CREATE INDEX idx_transaction_buckets_transaction_id ON transaction_buckets(transaction_id);
CREATE INDEX idx_transaction_buckets_bucket_id ON transaction_buckets(bucket_id);
