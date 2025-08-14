-- Quick fix for OTP table - add missing columns
-- Run this in your PostgreSQL database to fix the "used_at column does not exist" error

-- Add missing columns to otps table
ALTER TABLE otps ADD COLUMN IF NOT EXISTS used_at TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE otps ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0;
ALTER TABLE otps ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT 3;
ALTER TABLE otps ADD COLUMN IF NOT EXISTS ip_address INET NULL;
ALTER TABLE otps ADD COLUMN IF NOT EXISTS user_agent TEXT NULL;
ALTER TABLE otps ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(255) NOT NULL DEFAULT 'default';
ALTER TABLE otps ADD COLUMN IF NOT EXISTS used BOOLEAN DEFAULT false;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_otps_tenant_id ON otps(tenant_id);
CREATE INDEX IF NOT EXISTS idx_otps_used ON otps(used);
CREATE INDEX IF NOT EXISTS idx_otps_attempts ON otps(attempts);

-- Update existing records with default values
UPDATE otps SET 
    attempts = COALESCE(attempts, 0),
    max_attempts = COALESCE(max_attempts, 3),
    used = COALESCE(used, false),
    tenant_id = COALESCE(tenant_id, 'default')
WHERE attempts IS NULL OR max_attempts IS NULL OR used IS NULL OR tenant_id IS NULL;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'otps' 
ORDER BY ordinal_position;
