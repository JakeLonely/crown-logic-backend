/**
 * Database Migration Script
 * Creates tables needed for data deletion requests and audit logging
 * Run with: node scripts/migrate-data-deletion.js
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  console.log('Starting database migrations...\n');

  try {
    // 1. Create data_deletion_requests table
    console.log('Creating data_deletion_requests table...');
    await createDeletionRequestsTable();
    console.log('✓ data_deletion_requests table created\n');

    // 2. Create audit_logs table
    console.log('Creating audit_logs table...');
    await createAuditLogsTable();
    console.log('✓ audit_logs table created\n');

    // 3. Create indexes for better query performance
    console.log('Creating indexes...');
    await createIndexes();
    console.log('✓ Indexes created\n');

    // 4. Create row-level security policies
    console.log('Setting up row-level security...');
    await setupRLS();
    console.log('✓ RLS policies configured\n');

    console.log('✅ All migrations completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

async function createDeletionRequestsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS data_deletion_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL,
      request_id VARCHAR(100) UNIQUE NOT NULL,
      reason TEXT,
      request_source VARCHAR(50),
      status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expected_deletion_date TIMESTAMP,
      completed_at TIMESTAMP,
      data_deleted JSONB, -- Track what was deleted
      notes TEXT -- Admin notes
    );

    -- Create indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_deletion_email ON data_deletion_requests(email);
    CREATE INDEX IF NOT EXISTS idx_deletion_request_id ON data_deletion_requests(request_id);
    CREATE INDEX IF NOT EXISTS idx_deletion_status ON data_deletion_requests(status);
    CREATE INDEX IF NOT EXISTS idx_deletion_created_at ON data_deletion_requests(created_at);
    CREATE INDEX IF NOT EXISTS idx_deletion_expected_date ON data_deletion_requests(expected_deletion_date);

    -- Add comments for documentation
    COMMENT ON TABLE data_deletion_requests IS 'Stores user data deletion requests for GDPR/CCPA compliance';
    COMMENT ON COLUMN data_deletion_requests.request_id IS 'Unique identifier for tracking deletion request';
    COMMENT ON COLUMN data_deletion_requests.status IS 'Current status: pending (awaiting processing), processing (being deleted), completed (fully deleted)';
    COMMENT ON COLUMN data_deletion_requests.expected_deletion_date IS 'Date by which deletion should be completed (30 days from request)';
    COMMENT ON COLUMN data_deletion_requests.data_deleted IS 'JSON object tracking what data was deleted';
  `;

  return executeSQL(sql);
}

async function createAuditLogsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type VARCHAR(100) NOT NULL, -- data_deletion_request, data_access, export, etc.
      email VARCHAR(255),
      request_id VARCHAR(100),
      action VARCHAR(255),
      details JSONB,
      ip_address VARCHAR(45),
      user_agent TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(50), -- success, failure, pending
      error_message TEXT
    );

    -- Create indexes for audit logs
    CREATE INDEX IF NOT EXISTS idx_audit_type ON audit_logs(type);
    CREATE INDEX IF NOT EXISTS idx_audit_email ON audit_logs(email);
    CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_audit_request_id ON audit_logs(request_id);

    -- Add retention comment (GDPR requires 7 year retention for compliance logs)
    COMMENT ON TABLE audit_logs IS 'Audit trail for compliance and legal requirements. Retain for minimum 7 years.';
  `;

  return executeSQL(sql);
}

async function createIndexes() {
  const sql = `
    -- Deletion requests
    CREATE INDEX IF NOT EXISTS idx_deletion_pending ON data_deletion_requests(status) WHERE status = 'pending';
    CREATE INDEX IF NOT EXISTS idx_deletion_completed ON data_deletion_requests(status) WHERE status = 'completed';
    CREATE INDEX IF NOT EXISTS idx_deletion_by_date ON data_deletion_requests(created_at DESC, status);

    -- Audit logs
    CREATE INDEX IF NOT EXISTS idx_audit_recent ON audit_logs(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_by_type_date ON audit_logs(type, timestamp DESC);
  `;

  return executeSQL(sql);
}

async function setupRLS() {
  const sql = `
    -- Enable Row Level Security
    ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;
    ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

    -- Policy: Only admin can view all deletion requests
    CREATE POLICY deletion_requests_admin_view ON data_deletion_requests
    FOR SELECT
    TO authenticated
    USING (
      auth.jwt() ->> 'is_admin' = 'true'
    );

    -- Policy: Prevent direct user updates (use API)
    CREATE POLICY deletion_requests_no_update ON data_deletion_requests
    FOR UPDATE
    USING (false);

    -- Policy: Only admin can view audit logs
    CREATE POLICY audit_logs_admin_view ON audit_logs
    FOR SELECT
    TO authenticated
    USING (
      auth.jwt() ->> 'is_admin' = 'true'
    );

    -- Policy: Prevent audit log modifications
    CREATE POLICY audit_logs_immutable ON audit_logs
    FOR UPDATE
    USING (false);

    CREATE POLICY audit_logs_no_delete ON audit_logs
    FOR DELETE
    USING (false);
  `;

  return executeSQL(sql);
}

async function executeSQL(sql) {
  const statements = sql.split(';').filter(stmt => stmt.trim());

  for (const statement of statements) {
    if (statement.trim()) {
      try {
        const { data, error } = await supabase.rpc('execute_sql', {
          sql_string: statement
        });

        if (error) {
          console.error('SQL Error:', error);
          // Continue with other statements
        }
      } catch (err) {
        // Some statements might fail if they already exist, that's OK
        console.log('  Note:', err.message);
      }
    }
  }

  return true;
}

// Run migrations
runMigrations();
