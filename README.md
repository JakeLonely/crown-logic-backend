# Crown Logic Backend API

A scalable Node.js + Express backend for Crown Logic, powered by Supabase PostgreSQL database and deployed on Render.

## 🏗️ Architecture

```
Crown Logic Backend
├── Express API Server
├── PostgreSQL Database (Supabase)
├── Contact Form Submissions
├── Project Management
├── Application Hosting
└── Admin Dashboard
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase account (free tier)
- Render account (free tier)

### 1. Clone & Setup

```bash
git clone https://github.com/yourusername/crown-logic-backend.git
cd crown-logic-backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Fill in your `.env` file with:
- Supabase credentials
- Frontend URL
- Email settings (optional)

### 3. Setup Supabase

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Copy your **Project URL** and **Anon Key** to `.env`
4. Go to SQL Editor in Supabase dashboard
5. Create tables (see below)

### 4. Create Database Tables

Run this SQL in Supabase SQL Editor:

```sql
-- Submissions Table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(100),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE projects (
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

-- Applications Table
CREATE TABLE applications (
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

-- Users Table (for admin)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_projects_published ON projects(published);
CREATE INDEX idx_applications_published ON applications(published);
CREATE INDEX idx_users_email ON users(email);
```

### 5. Run Locally

```bash
npm run dev
```

Server runs on `http://localhost:3000`

## 📚 API Endpoints

### Contact Form
- `POST /api/contact` - Submit contact form
- `GET /api/contact/:id` - Get submission (admin)

### Projects
- `GET /api/projects` - Get all public projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (admin)
- `PUT /api/projects/:id` - Update project (admin)
- `DELETE /api/projects/:id` - Delete project (admin)

### Applications
- `GET /api/applications` - Get all applications
- `GET /api/applications/:id` - Get single application
- `POST /api/applications` - Create application (admin)

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/submissions` - All submissions
- `PUT /api/admin/submissions/:id` - Update submission
- `DELETE /api/admin/submissions/:id` - Delete submission

## 🌐 Deploy to Render

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial backend setup"
git push origin main
```

### Step 2: Create Render Service

1. Go to [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: crown-logic-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click "Create Web Service"

### Step 3: Add Environment Variables

In Render dashboard:
1. Go to "Environment"
2. Add variables from `.env`:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `FRONTEND_URL`
   - `ADMIN_EMAIL`

### Step 4: Deploy

Render will automatically deploy when you push to GitHub.

Your API will be available at: `https://crown-logic-api.onrender.com`

## 🔒 Security

- ✅ CORS enabled for frontend
- ✅ Helmet for security headers
- ✅ Rate limiting (100 requests per 15 min)
- ✅ Input validation with Joi
- ⚠️ TODO: JWT authentication for admin routes
- ⚠️ TODO: Password hashing for users

## 📝 Next Steps

1. **Authentication** - Add JWT tokens for admin access
2. **Email Service** - Send confirmation & admin notification emails
3. **File Upload** - Add image/file upload capability
4. **Admin Dashboard** - Build web interface for management
5. **Analytics** - Track API usage and metrics

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **Hosting**: Render.com
- **Monitoring**: Built-in Render logs

## 📚 Resources

- [Express Documentation](https://expressjs.com)
- [Supabase Guide](https://supabase.com/docs)
- [Render Deployment](https://render.com/docs)

## 📄 License

MIT

---

**Made with ❤️ by Crown Logic**
