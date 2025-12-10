-- Create profiles table for user roles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  experience_years INTEGER,
  certificate_type TEXT,
  teacher_type TEXT,
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exams table
CREATE TABLE public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  language TEXT NOT NULL DEFAULT 'english' CHECK (language IN ('english', 'arabic')),
  time_limit INTEGER,
  max_attempts INTEGER DEFAULT 1,
  is_published BOOLEAN DEFAULT false,
  share_link TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES public.exams ON DELETE CASCADE NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'fill_blank', 'written', 'poll', 'true_false', 'complete', 'matching', 'translate', 'paragraph')),
  question_text TEXT NOT NULL,
  question_data JSONB,
  points INTEGER DEFAULT 1,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exam_attempts table
CREATE TABLE public.exam_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES public.exams ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users NOT NULL,
  answers JSONB DEFAULT '{}',
  score INTEGER,
  total_points INTEGER,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Exams policies
CREATE POLICY "Teachers can view their own exams" ON public.exams FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Students can view published exams" ON public.exams FOR SELECT USING (is_published = true);
CREATE POLICY "Teachers can create exams" ON public.exams FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can update their own exams" ON public.exams FOR UPDATE USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can delete their own exams" ON public.exams FOR DELETE USING (auth.uid() = teacher_id);

-- Questions policies
CREATE POLICY "Anyone can view questions of published exams" ON public.questions FOR SELECT USING (EXISTS (SELECT 1 FROM public.exams WHERE exams.id = questions.exam_id AND (exams.teacher_id = auth.uid() OR exams.is_published = true)));
CREATE POLICY "Teachers can create questions for their exams" ON public.questions FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.exams WHERE exams.id = exam_id AND exams.teacher_id = auth.uid()));
CREATE POLICY "Teachers can update questions for their exams" ON public.questions FOR UPDATE USING (EXISTS (SELECT 1 FROM public.exams WHERE exams.id = exam_id AND exams.teacher_id = auth.uid()));
CREATE POLICY "Teachers can delete questions for their exams" ON public.questions FOR DELETE USING (EXISTS (SELECT 1 FROM public.exams WHERE exams.id = exam_id AND exams.teacher_id = auth.uid()));

-- Exam attempts policies
CREATE POLICY "Students can view their own attempts" ON public.exam_attempts FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Teachers can view attempts for their exams" ON public.exam_attempts FOR SELECT USING (EXISTS (SELECT 1 FROM public.exams WHERE exams.id = exam_id AND exams.teacher_id = auth.uid()));
CREATE POLICY "Students can create attempts" ON public.exam_attempts FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update their own attempts" ON public.exam_attempts FOR UPDATE USING (auth.uid() = student_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON public.exams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();