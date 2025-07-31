-- Create profiles table extension (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'teacher',
  years_experience TEXT,
  classroom_type TEXT,
  program_type TEXT,
  center TEXT,
  preferred_language TEXT DEFAULT 'english',
  assessment_mode TEXT DEFAULT 'self',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create assessments table
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'classroom_management',
    'curriculum_planning',
    'child_development',
    'family_engagement',
    'professional_development',
    'health_safety',
    'inclusive_practices',
    'assessment_evaluation'
  )),
  estimated_time INTEGER DEFAULT 15,
  sections JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create assessment_submissions table
CREATE TABLE IF NOT EXISTS public.assessment_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  responses JSONB NOT NULL DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  score NUMERIC(5,2),
  percent_complete INTEGER DEFAULT 0 CHECK (percent_complete >= 0 AND percent_complete <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, user_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- Create assessment_results table
CREATE TABLE IF NOT EXISTS public.assessment_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES public.assessment_submissions(id) ON DELETE CASCADE NOT NULL,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  section_scores JSONB NOT NULL DEFAULT '{}',
  total_score NUMERIC(5,2) NOT NULL,
  max_possible_score NUMERIC(5,2) NOT NULL,
  percentage_score NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN max_possible_score > 0 THEN (total_score / max_possible_score) * 100
      ELSE 0
    END
  ) STORED,
  recommendations JSONB DEFAULT '[]',
  strengths JSONB DEFAULT '[]',
  areas_for_improvement JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Assessments RLS Policies (public read for active assessments)
CREATE POLICY "Active assessments are viewable by authenticated users" ON public.assessments
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Only admins can modify assessments" ON public.assessments
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Assessment Submissions RLS Policies
CREATE POLICY "Users can view own submissions" ON public.assessment_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own submissions" ON public.assessment_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions" ON public.assessment_submissions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own submissions" ON public.assessment_submissions
  FOR DELETE USING (auth.uid() = user_id);

-- Assessment Results RLS Policies
CREATE POLICY "Users can view own results" ON public.assessment_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create results" ON public.assessment_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own results" ON public.assessment_results
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS assessments_category_idx ON public.assessments(category);
CREATE INDEX IF NOT EXISTS assessments_active_idx ON public.assessments(is_active);
CREATE INDEX IF NOT EXISTS submissions_user_idx ON public.assessment_submissions(user_id);
CREATE INDEX IF NOT EXISTS submissions_assessment_idx ON public.assessment_submissions(assessment_id);
CREATE INDEX IF NOT EXISTS submissions_status_idx ON public.assessment_submissions(status);
CREATE INDEX IF NOT EXISTS results_user_idx ON public.assessment_results(user_id);
CREATE INDEX IF NOT EXISTS results_assessment_idx ON public.assessment_results(assessment_id);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_assessments_updated_at
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_submissions_updated_at
  BEFORE UPDATE ON public.assessment_submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_results_updated_at
  BEFORE UPDATE ON public.assessment_results
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default assessment templates
INSERT INTO public.assessments (id, title, description, category, estimated_time, sections) VALUES 
('classroom-management-basic', 'Basic Classroom Management', 'Fundamental classroom management strategies and techniques for early childhood educators', 'classroom_management', 15,
'[
  {
    "id": "environment-setup",
    "title": "Learning Environment",
    "description": "Physical and emotional environment setup",
    "questions": [
      {
        "id": "env-organization",
        "type": "rating",
        "title": "How well is your classroom organized to support learning?",
        "description": "Consider accessibility, clear pathways, and defined areas.",
        "required": true,
        "ratingScale": {
          "min": 1,
          "max": 5,
          "minText": "Needs Improvement",
          "maxText": "Excellent"
        }
      },
      {
        "id": "env-materials",
        "type": "single",
        "title": "Are learning materials easily accessible to children?",
        "required": true,
        "choices": [
          {"value": "always", "text": "Always accessible"},
          {"value": "mostly", "text": "Mostly accessible"},
          {"value": "sometimes", "text": "Sometimes accessible"},
          {"value": "rarely", "text": "Rarely accessible"}
        ]
      }
    ]
  },
  {
    "id": "behavior-management",
    "title": "Behavior Management",
    "description": "Strategies for promoting positive behavior",
    "questions": [
      {
        "id": "positive-reinforcement",
        "type": "multiple",
        "title": "Which positive reinforcement strategies do you use regularly?",
        "required": true,
        "choices": [
          {"value": "verbal-praise", "text": "Verbal praise and encouragement"},
          {"value": "visual-cues", "text": "Visual cues and charts"},
          {"value": "peer-recognition", "text": "Peer recognition systems"},
          {"value": "individual-goals", "text": "Individual goal setting"},
          {"value": "family-communication", "text": "Positive family communication"}
        ]
      }
    ]
  }
]'::jsonb),

('curriculum-planning-basic', 'Basic Curriculum Planning', 'Essential curriculum planning skills and developmental appropriateness', 'curriculum_planning', 20,
'[
  {
    "id": "developmental-appropriateness",
    "title": "Developmental Appropriateness",
    "description": "Planning activities that match children\'s developmental stages",
    "questions": [
      {
        "id": "age-appropriate-activities",
        "type": "rating",
        "title": "How well do you match activities to children\'s developmental levels?",
        "required": true,
        "ratingScale": {
          "min": 1,
          "max": 5,
          "minText": "Needs Improvement",
          "maxText": "Excellent"
        }
      }
    ]
  }
]'::jsonb)

ON CONFLICT (id) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';