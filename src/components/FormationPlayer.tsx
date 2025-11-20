import { useState, useEffect } from 'react';
import { X, CheckCircle, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface CoursePlayerProps {
  lessonId: string;
  onClose: () => void;
  onComplete?: () => void;
}

export default function CoursePlayer({ lessonId, onClose, onComplete }: CoursePlayerProps) {
  const [lesson, setLesson] = useState<any>(null);
  const [module, setModule] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      const { data: lessonData } = await supabase
        .from('course_lessons')
        .select(`
          *,
          course_modules (
            *,
            courses (*)
          )
        `)
        .eq('id', lessonId)
        .single();

      setLesson(lessonData);
      setModule(lessonData.course_modules);

      if (user) {
        const { data: progress } = await supabase
          .from('lesson_progress')
          .select('completed')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
          .single();

        setIsCompleted(progress?.completed || false);
      }

      const { data: quizData } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('lesson_id', lessonId)
        .limit(1);

      setHasQuiz((quizData?.length || 0) > 0);
    } catch (error) {
      console.error('Error loading lesson:', error);
    }
  };

  const markAsComplete = async () => {
    if (!user) return;

    try {
      await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        });

      await supabase.rpc('calculate_course_progress', {
        user_id_param: user.id,
        course_id_param: module.courses.id,
      });

      setIsCompleted(true);
      showToast('Lesson completed!', 'success');
      if (onComplete) onComplete();
    } catch (error: any) {
      showToast(error.message || 'Failed to mark as complete', 'error');
    }
  };

  if (!lesson) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{lesson.title}</h1>
              <p className="text-sm text-slate-400">
                {module.title} • {lesson.duration_minutes} min
              </p>
            </div>
          </div>

          {isCompleted && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-500 font-medium">Completed</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            {lesson.video_url && (
              <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden">
                <video
                  src={lesson.video_url}
                  controls
                  className="w-full h-full"
                  onEnded={!isCompleted ? markAsComplete : undefined}
                />
              </div>
            )}

            {/* Lesson Content */}
            <div className="bg-slate-900 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">About this lesson</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 whitespace-pre-wrap">
                  {lesson.content || 'No content available for this lesson.'}
                </p>
              </div>
            </div>

            {/* Quiz Section */}
            {hasQuiz && (
              <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-xl font-bold text-white mb-2">Test Your Knowledge</h3>
                <p className="text-slate-300 mb-4">
                  Complete the quiz to reinforce what you've learned
                </p>
                <button
                  onClick={() => setShowQuiz(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 transition"
                >
                  Start Quiz
                </button>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition">
                <ChevronLeft className="w-5 h-5" />
                Previous Lesson
              </button>

              {!isCompleted && (
                <button
                  onClick={markAsComplete}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition"
                >
                  Mark as Complete
                </button>
              )}

              <button className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition">
                Next Lesson
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Progress */}
            <div className="bg-slate-900 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4">Your Progress</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Completed</span>
                  <span className="text-white font-bold">0/10</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 w-0" />
                </div>
              </div>
            </div>

            {/* Discussion */}
            <div className="bg-slate-900 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-white">Discussion</h3>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                Ask questions and discuss with other students
              </p>
              <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                Join Discussion
              </button>
            </div>

            {/* Resources */}
            <div className="bg-slate-900 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4">Resources</h3>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition text-sm"
                >
                  📄 Lesson Notes
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition text-sm"
                >
                  💻 Code Examples
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition text-sm"
                >
                  📚 Additional Reading
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
