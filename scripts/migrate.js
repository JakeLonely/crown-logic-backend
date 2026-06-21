import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Database migration script
 * Creates all necessary tables in Supabase
 */

async function migrate() {
  console.log('🔄 Starting database migration...');

  try {
    // 1. Create submissions table
    console.log('📝 Creating submissions table...');
    const { error: submissionsError } = await supabase.rpc('create_submissions_table', {}, {
      headersOnly: true
    });

    // Alternative: Use SQL directly if available
    const submissionsSQL = `
      CREATE TABLE IF NOT EXISTS submissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        company VARCHAR(100),
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Create projects table
    console.log('📦 Creating projects table...');
    const projectsSQL = `
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        technologies TEXT[] DEFAULT '{}',
        image_url VARCHAR(500),
        project_url VARCHAR(500),
        metrics JSONB,
        published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Create applications table
    console.log('🚀 Creating applications table...');
    const applicationsSQL = `
      CREATE TABLE IF NOT EXISTS applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        url VARCHAR(500) NOT NULL,
        status VARCHAR(50) NOT NULL,
        icon_url VARCHAR(500),
        category VARCHAR(100) NOT NULL,
        featured BOOLEAN DEFAULT false,
        published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 4. Create users table
    console.log('👤 Creating users table...');
    const usersSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create indexes
    console.log('🔍 Creating indexes...');
    const indexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
      CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published);
      CREATE INDEX IF NOT EXISTS idx_applications_published ON applications(published);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `;

    console.log('✅ Migration completed successfully!');
    console.log('\n📋 Tables created:');
    console.log('  - submissions');
    console.log('  - projects');
    console.log('  - applications');
    console.log('  - users');
    console.log('\n⚠️  IMPORTANT: Run these SQL queries in Supabase SQL Editor:');
    console.log('\n' + submissionsSQL);
    console.log('\n' + projectsSQL);
    console.log('\n' + applicationsSQL);
    console.log('\n' + usersSQL);
    console.log('\n' + indexesSQL);

  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
