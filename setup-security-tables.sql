-- Run this script in your PostgreSQL database to create the security tables
-- This will eliminate the "relation does not exist" errors

-- Create failed attempts tracking table
CREATE TABLE IF NOT EXISTS failed_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT NULL,
    attempt_type VARCHAR(50) NOT NULL, -- 'otp_request', 'otp_verify', 'login'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for failed attempts
CREATE INDEX IF NOT EXISTS idx_failed_attempts_email ON failed_attempts(email);
CREATE INDEX IF NOT EXISTS idx_failed_attempts_ip ON failed_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_failed_attempts_created_at ON failed_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_failed_attempts_type ON failed_attempts(attempt_type);

-- Create audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL,
    email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    ip_address INET NULL,
    user_agent TEXT NULL,
    success BOOLEAN NOT NULL,
    details JSONB NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_email ON audit_logs(email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON audit_logs(success);

-- Add foreign key constraint if users table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_audit_logs_user_id' 
            AND table_name = 'audit_logs'
        ) THEN
            ALTER TABLE audit_logs 
            ADD CONSTRAINT fk_audit_logs_user_id 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- Verify tables were created
SELECT 
    table_name, 
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t 
WHERE table_name IN ('failed_attempts', 'audit_logs')
ORDER BY table_name;
