-- Phase 2: Courses and Learning System

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  level VARCHAR(50) DEFAULT 'beginner',
  duration_hours INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  preview_enabled BOOLEAN DEFAULT true,
  certificate_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course modules (chapters)
CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course lessons
CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course enrollments
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0,
  UNIQUE(user_id, course_id)
);

-- Lesson progress
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER DEFAULT 0,
  UNIQUE(user_id, lesson_id)
);

-- Quiz questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  passed BOOLEAN DEFAULT false,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course certificates
CREATE TABLE IF NOT EXISTS course_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  certificate_url TEXT,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Course discussions (forum)
CREATE TABLE IF NOT EXISTS course_discussions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion replies
CREATE TABLE IF NOT EXISTS discussion_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discussion_id UUID REFERENCES course_discussions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for courses
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Courses are viewable by everyone" ON courses;
CREATE POLICY "Courses are viewable by everyone"
  ON courses FOR SELECT
  USING (is_published = true OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own courses" ON courses;
CREATE POLICY "Users can create their own courses"
  ON courses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own courses" ON courses;
CREATE POLICY "Users can update their own courses"
  ON courses FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own courses" ON courses;
CREATE POLICY "Users can delete their own courses"
  ON courses FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for course_modules
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Modules are viewable by everyone" ON course_modules;
CREATE POLICY "Modules are viewable by everyone"
  ON course_modules FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage their course modules" ON course_modules;
CREATE POLICY "Users can manage their course modules"
  ON course_modules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_modules.course_id
      AND courses.user_id = auth.uid()
    )
  );

-- RLS Policies for course_lessons
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lessons are viewable by enrolled users" ON course_lessons;
CREATE POLICY "Lessons are viewable by enrolled users"
  ON course_lessons FOR SELECT
  USING (
    is_free = true OR
    EXISTS (
      SELECT 1 FROM course_modules cm
      JOIN courses c ON c.id = cm.course_id
      WHERE cm.id = course_lessons.module_id
      AND (
        c.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM course_enrollments
          WHERE course_enrollments.user_id = auth.uid()
          AND course_enrollments.course_id = c.id
        )
      )
    )
  );

DROP POLICY IF EXISTS "Course owners can manage lessons" ON course_lessons;
CREATE POLICY "Course owners can manage lessons"
  ON course_lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM course_modules cm
      JOIN courses c ON c.id = cm.course_id
      WHERE cm.id = course_lessons.module_id
      AND c.user_id = auth.uid()
    )
  );

-- RLS Policies for enrollments
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own enrollments" ON course_enrollments;
CREATE POLICY "Users can view their own enrollments"
  ON course_enrollments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can enroll in courses" ON course_enrollments;
CREATE POLICY "Users can enroll in courses"
  ON course_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for lesson_progress
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own progress" ON lesson_progress;
CREATE POLICY "Users can view their own progress"
  ON lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own progress" ON lesson_progress;
CREATE POLICY "Users can update their own progress"
  ON lesson_progress FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for quiz_questions
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Quiz questions are viewable by enrolled users" ON quiz_questions;
CREATE POLICY "Quiz questions are viewable by enrolled users"
  ON quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM course_lessons cl
      JOIN course_modules cm ON cm.id = cl.module_id
      JOIN courses c ON c.id = cm.course_id
      WHERE cl.id = quiz_questions.lesson_id
      AND (
        c.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM course_enrollments
          WHERE course_enrollments.user_id = auth.uid()
          AND course_enrollments.course_id = c.id
        )
      )
    )
  );

-- RLS Policies for quiz_attempts
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own quiz attempts" ON quiz_attempts;
CREATE POLICY "Users can view their own quiz attempts"
  ON quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create quiz attempts" ON quiz_attempts;
CREATE POLICY "Users can create quiz attempts"
  ON quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for certificates
ALTER TABLE course_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own certificates" ON course_certificates;
CREATE POLICY "Users can view their own certificates"
  ON course_certificates FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can issue certificates" ON course_certificates;
CREATE POLICY "System can issue certificates"
  ON course_certificates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for discussions
ALTER TABLE course_discussions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Discussions are viewable by enrolled users" ON course_discussions;
CREATE POLICY "Discussions are viewable by enrolled users"
  ON course_discussions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = course_discussions.course_id
      AND (
        c.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM course_enrollments
          WHERE course_enrollments.user_id = auth.uid()
          AND course_enrollments.course_id = c.id
        )
      )
    )
  );

DROP POLICY IF EXISTS "Enrolled users can create discussions" ON course_discussions;
CREATE POLICY "Enrolled users can create discussions"
  ON course_discussions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM course_enrollments
      WHERE course_enrollments.user_id = auth.uid()
      AND course_enrollments.course_id = course_discussions.course_id
    )
  );

-- RLS Policies for discussion_replies
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Replies are viewable by enrolled users" ON discussion_replies;
CREATE POLICY "Replies are viewable by enrolled users"
  ON discussion_replies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM course_discussions cd
      JOIN courses c ON c.id = cd.course_id
      WHERE cd.id = discussion_replies.discussion_id
      AND (
        c.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM course_enrollments
          WHERE course_enrollments.user_id = auth.uid()
          AND course_enrollments.course_id = c.id
        )
      )
    )
  );

DROP POLICY IF EXISTS "Enrolled users can reply" ON discussion_replies;
CREATE POLICY "Enrolled users can reply"
  ON discussion_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to calculate course progress
CREATE OR REPLACE FUNCTION calculate_course_progress(user_id_param UUID, course_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
  progress INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_lessons
  FROM course_lessons cl
  JOIN course_modules cm ON cm.id = cl.module_id
  WHERE cm.course_id = course_id_param;

  SELECT COUNT(*) INTO completed_lessons
  FROM lesson_progress lp
  JOIN course_lessons cl ON cl.id = lp.lesson_id
  JOIN course_modules cm ON cm.id = cl.module_id
  WHERE cm.course_id = course_id_param
  AND lp.user_id = user_id_param
  AND lp.completed = true;

  IF total_lessons = 0 THEN
    RETURN 0;
  END IF;

  progress := (completed_lessons * 100) / total_lessons;
  
  UPDATE course_enrollments
  SET progress_percentage = progress
  WHERE user_id = user_id_param
  AND course_id = course_id_param;

  RETURN progress;
END;
$$;

-- Function to issue certificate
CREATE OR REPLACE FUNCTION issue_certificate(user_id_param UUID, course_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  progress INTEGER;
BEGIN
  progress := calculate_course_progress(user_id_param, course_id_param);
  
  IF progress >= 100 THEN
    INSERT INTO course_certificates (user_id, course_id)
    VALUES (user_id_param, course_id_param)
    ON CONFLICT (user_id, course_id) DO NOTHING;
    
    UPDATE course_enrollments
    SET completed_at = NOW()
    WHERE user_id = user_id_param
    AND course_id = course_id_param
    AND completed_at IS NULL;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;
