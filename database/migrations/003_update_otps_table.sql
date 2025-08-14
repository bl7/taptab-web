-- Update OTPs table to add missing columns
-- This migration adds the missing columns that the code expects

-- Add used_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'otps' AND column_name = 'used_at'
    ) THEN
        ALTER TABLE otps ADD COLUMN used_at TIMESTAMP WITH TIME ZONE NULL;
        RAISE NOTICE 'Added used_at column to otps table';
    ELSE
        RAISE NOTICE 'used_at column already exists in otps table';
    END IF;
END $$;

-- Add attempts column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'otps' AND column_name = 'attempts'
    ) THEN
        ALTER TABLE otps ADD COLUMN attempts INTEGER DEFAULT 0;
        RAISE NOTICE 'Added attempts column to otps table';
    ELSE
        RAISE NOTICE 'attempts column already exists in otps table';
    END IF;
END $$;

-- Add max_attempts column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'otps' AND column_name = 'max_attempts'
    ) THEN
        ALTER TABLE otps ADD COLUMN max_attempts INTEGER DEFAULT 3;
        RAISE NOTICE 'Added max_attempts column to otps table';
    ELSE
        RAISE NOTICE 'max_attempts column already exists in otps table';
    END IF;
END $$;

-- Add ip_address column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'otps' AND column_name = 'ip_address'
    ) THEN
        ALTER TABLE otps ADD COLUMN ip_address INET NULL;
        RAISE NOTICE 'Added ip_address column to otps table';
    ELSE
        RAISE NOTICE 'ip_address column already exists in otps table';
    END IF;
END $$;

-- Add user_agent column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'otps' AND column_name = 'user_agent'
    ) THEN
        ALTER TABLE otps ADD COLUMN user_agent TEXT NULL;
        RAISE NOTICE 'Added user_agent column to otps table';
    ELSE
        RAISE NOTICE 'user_agent column already exists in otps table';
    END IF;
END $$;

-- Add tenant_id column if it doesn't exist (needed for multi-tenant support)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'otps' AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE otps ADD COLUMN tenant_id VARCHAR(255) NOT NULL DEFAULT 'default';
        RAISE NOTICE 'Added tenant_id column to otps table';
    ELSE
        RAISE NOTICE 'tenant_id column already exists in otps table';
    END IF;
END $$;

-- Add used column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'otps' AND column_name = 'used'
    ) THEN
        ALTER TABLE otps ADD COLUMN used BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added used column to otps table';
    ELSE
        RAISE NOTICE 'used column already exists in otps table';
    END IF;
END $$;

-- Create indexes for the new columns if they don't exist
CREATE INDEX IF NOT EXISTS idx_otps_tenant_id ON otps(tenant_id);
CREATE INDEX IF NOT EXISTS idx_otps_used ON otps(used);
CREATE INDEX IF NOT EXISTS idx_otps_attempts ON otps(attempts);

-- Update existing records to have default values
UPDATE otps SET 
    attempts = COALESCE(attempts, 0),
    max_attempts = COALESCE(max_attempts, 3),
    used = COALESCE(used, false),
    tenant_id = COALESCE(tenant_id, 'default')
WHERE attempts IS NULL OR max_attempts IS NULL OR used IS NULL OR tenant_id IS NULL;

-- Show the final table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'otps' 
ORDER BY ordinal_position;
