# FCR Assist - Deployment Guide

## Overview

FCR Assist has been successfully migrated from React/Vite to Next.js 15 with full Supabase integration. This guide covers deployment to production.

## Phase 5 Complete: Supabase Integration

### ✅ Completed Features

#### Database Integration
- **Complete Supabase schema** with assessments, submissions, results, and profiles
- **Row Level Security (RLS)** policies for data protection
- **Automatic profile creation** via database triggers
- **Assessment data management** with proper CRUD operations

#### Authentication & Security
- **Next.js middleware** for route protection
- **Supabase SSR** integration for server-side auth
- **Protected routes**: `/dashboard`, `/assessments`, `/assessment/*`, `/profile`
- **Auth routes**: `/login`, `/signup`, `/forgot-password`, `/reset-password`

#### Assessment System
- **Survey.js integration** with dynamic form rendering
- **Real-time progress tracking** and auto-save functionality
- **Assessment templates** with classroom management categories
- **Complete workflow**: start → save progress → complete → results

#### Data Migration
- **LocalStorage replaced** with Supabase database
- **Async data operations** with proper error handling
- **Fallback mechanisms** for offline functionality
- **Type-safe database operations** with generated TypeScript types

## Deployment Requirements

### 1. Supabase Project Setup

```bash
# 1. Create Supabase project at https://supabase.com
# 2. Run the migration to create database schema:
```

**Database Migration:**
```sql
-- Located in: /supabase/migrations/20240101000000_create_assessments_schema.sql
-- This creates:
-- - profiles table (extends auth.users)
-- - assessments table (templates and custom assessments)
-- - assessment_submissions table (user responses)
-- - assessment_results table (scored results)
-- - RLS policies for data security
-- - Database triggers for profile creation
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure the following variables:

```bash
# Required - Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional - Survey.js Pro License
NEXT_PUBLIC_SURVEYJS_LICENSE_KEY=your-license-key

# Environment
NODE_ENV=production
```

### 3. Vercel Deployment

**Option A: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

**Option B: GitHub Integration**
1. Push to GitHub repository
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### 4. Database Initialization

After deployment, initialize the database:

```sql
-- Connect to your Supabase project and run:

-- 1. Enable RLS (should be automatic from migration)
-- 2. Create default assessment templates:
INSERT INTO public.assessments (id, title, description, category, sections) 
VALUES (
  'classroom-management-basic',
  'Basic Classroom Management',
  'Fundamental classroom management strategies and techniques',
  'classroom_management',
  '[{"id":"environment-setup","title":"Learning Environment","description":"Physical and emotional environment setup","questions":[{"id":"env-organization","type":"rating","title":"How well is your classroom organized to support learning?","description":"Consider accessibility, clear pathways, and defined areas.","required":true,"ratingScale":{"min":1,"max":5,"minText":"Needs Improvement","maxText":"Excellent"}},{"id":"env-materials","type":"single","title":"Are learning materials easily accessible to children?","required":true,"choices":[{"value":"always","text":"Always accessible"},{"value":"mostly","text":"Mostly accessible"},{"value":"sometimes","text":"Sometimes accessible"},{"value":"rarely","text":"Rarely accessible"}]}]},{"id":"behavior-management","title":"Behavior Management","description":"Strategies for promoting positive behavior","questions":[{"id":"positive-reinforcement","type":"multiple","title":"Which positive reinforcement strategies do you use regularly?","required":true,"choices":[{"value":"verbal-praise","text":"Verbal praise and encouragement"},{"value":"visual-cues","text":"Visual cues and charts"},{"value":"peer-recognition","text":"Peer recognition systems"},{"value":"individual-goals","text":"Individual goal setting"},{"value":"family-communication","text":"Positive family communication"}]}]}]'::jsonb
);
```

## Architecture Overview

```
FCR Assist Next.js 15 Architecture

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   Supabase DB   │    │   Survey.js     │
│   (App Router)  │◄──►│   (PostgreSQL)  │    │   (Forms)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Middleware    │    │   RLS Policies  │    │   Assessment    │
│   (Auth Guard)  │    │   (Security)    │    │   Templates     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components

1. **Next.js 15 App Router**: Modern React app with SSR/SSG capabilities
2. **Supabase Integration**: Real-time database with authentication
3. **Survey.js Engine**: Dynamic form rendering and assessment logic
4. **shadcn/ui Components**: Accessible, customizable UI components
5. **TypeScript Safety**: End-to-end type safety with generated database types

## Testing the Deployment

### 1. Authentication Flow
- [ ] Visit `/signup` and create a new account
- [ ] Verify profile is created in `public.profiles` table
- [ ] Test login/logout functionality
- [ ] Verify protected route redirects work

### 2. Assessment System
- [ ] Navigate to `/assessments` and view available assessments
- [ ] Start an assessment and verify auto-save functionality
- [ ] Complete an assessment and check results are stored
- [ ] Resume an in-progress assessment

### 3. Dashboard Functionality
- [ ] View assessment statistics and progress
- [ ] Check recent activity and quick actions
- [ ] Verify data loads from Supabase correctly

## Monitoring & Maintenance

### Supabase Dashboard
- Monitor database performance and usage
- Review RLS policy effectiveness
- Check authentication metrics

### Vercel Analytics
- Track application performance
- Monitor deployment health
- Review error logs and metrics

### Regular Maintenance
- Update dependencies monthly
- Review and update RLS policies
- Backup database regularly
- Monitor Supabase usage limits

## Troubleshooting

### Common Issues

**1. Environment Variables Not Loading**
```bash
# Check .env.local exists and has correct values
# Restart development server after changes
npm run dev
```

**2. Supabase Connection Issues**
```bash
# Verify environment variables are set
# Check Supabase project URL and keys
# Ensure RLS policies allow access
```

**3. Assessment Data Not Saving**
```bash
# Check browser console for errors
# Verify user is authenticated
# Check RLS policies for assessment_submissions table
```

**4. Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Check for TypeScript errors
npm run type-check
```

## Support

For deployment issues or questions:
1. Check Vercel deployment logs
2. Review Supabase dashboard for database issues
3. Check browser console for client-side errors
4. Review Next.js documentation for App Router issues

---

**Status**: ✅ Ready for Production Deployment
**Last Updated**: Phase 5 Complete - Supabase Integration
**Next Steps**: Initialize Git repository and deploy to Vercel