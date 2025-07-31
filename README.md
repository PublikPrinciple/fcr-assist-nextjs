# FCR Assist - Assessment Platform

A comprehensive assessment platform for early childhood educators built with modern web technologies.

## 🚀 Live Demo

**Coming Soon** - Deploy to Vercel with Supabase backend

## 📋 Overview

FCR Assist helps early childhood educators assess their professional development across key competency areas including classroom management, curriculum planning, child development, and family engagement.

### ✨ Key Features

- **Dynamic Assessments** - Survey.js powered forms with real-time validation
- **Progress Tracking** - Auto-save functionality with visual progress indicators  
- **Secure Authentication** - Supabase Auth with protected routes
- **Real-time Data** - PostgreSQL database with Row Level Security
- **Responsive Design** - Mobile-first UI with shadcn/ui components
- **Professional Reports** - Detailed results with recommendations

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js 15    │    │   Supabase      │    │   Survey.js     │
│   App Router    │◄──►│   PostgreSQL    │    │   Forms Engine  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Middleware    │    │   RLS Policies  │    │   Assessment    │
│   Auth Guard    │    │   Security      │    │   Templates     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Accessible component library
- **Survey.js** - Dynamic form rendering

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Primary database
- **Row Level Security** - Data protection
- **Real-time subscriptions** - Live updates

### DevOps
- **Vercel** - Deployment platform
- **GitHub Actions** - CI/CD pipeline
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📦 Assessment Categories

1. **Classroom Management** - Environment setup and behavior strategies
2. **Curriculum Planning** - Educational program design
3. **Child Development** - Understanding developmental milestones
4. **Family Engagement** - Building community partnerships
5. **Professional Development** - Continuous learning practices
6. **Health & Safety** - Maintaining safe environments
7. **Inclusive Practices** - Supporting diverse learners
8. **Assessment & Evaluation** - Measuring child progress

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase account
- Vercel account (for deployment)

### 1. Clone & Install

```bash
git clone https://github.com/PublikPrinciple/fcr-assist-nextjs.git
cd fcr-assist-nextjs
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Configure your environment variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Optional - Survey.js Pro License
NEXT_PUBLIC_SURVEYJS_LICENSE_KEY=your-license-key
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the migration in `supabase/migrations/`

### 4. Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🔒 Security Features

- **Row Level Security** - Database-level access control
- **Protected Routes** - Middleware-based authentication
- **Input Validation** - Zod schema validation
- **CSRF Protection** - Built-in Next.js security
- **Secure Headers** - Production security headers

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📈 Status

- ✅ **Phase 1**: Next.js 15 setup with App Router
- ✅ **Phase 2**: UI component migration with shadcn/ui
- ✅ **Phase 3**: Authentication system with Supabase
- ✅ **Phase 4**: Assessment framework with Survey.js
- ✅ **Phase 5**: Database integration with RLS policies
- 🚀 **Current**: Production deployment and testing

---

**Built with ❤️ for early childhood educators**