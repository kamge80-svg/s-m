import { useState, useEffect } from 'react';
import { X, Play, Lock, CheckCircle, Clock, BookOpen, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface CourseViewerProps {
  courseId: string;
  onClose: () => void;
  onEnroll?: () => void;
}

interface Module {
  id: string;
  title: string;
  description: string;
  is_free: boolean;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  duration_minutes: number;
  is_free: boolean;
  completed?: boolean;
}

export default function CourseViewer({ courseId, onClose, onEnroll }: CourseViewerProps) {
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    loadCourse();
  }, [courseId, user]);

  const loadCourse = async () => {
    try {
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      setCourse(courseData);

      const { data: modulesData } = await supabase
        .from('course_modules')
        .select(`
          *,
          course_lessons (*)
        `)
        .eq('course_id', courseId)
        .order('order_index');

      if (user) {
        const { data: enrollment } = await supabase
          .from('course_enrollments')
          .select('progress_percentage')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .single();

        if (enrollment) {
          setIsEnrolled(true);
          setProgress(enrollment.progress_percentage);

          const { data: progressData } = await supabase
            .from('lesson_progress')
            .select('lesson_id, completed')
            .eq('user_id', user.id);

          const completedLessons = new Set(
            progressData?.filter(p => p.completed).map(p => p.lesson_id) || []
          );

          const modulesWithProgress = modulesData?.map(module => ({
            ...module,
            lessons: module.course_lessons.map((lesson: any) => ({
              ...lesson,
              completed: completedLessons.has(lesson.id),
            })),
          }));

          setModules(modulesWithProgress || []);
        } else {
          setModules(modulesData?.map(m => ({ ...m, lessons: m.course_lessons })) || []);
        }
      } else {
        setModules(modulesData?.map(m => ({ ...m, lessons: m.course_lessons })) || []);
      }
    } catch (error) {
      console.error('Error loading course:', error);
      showToast('Failed to load course', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      showToast('Please sign in to enroll', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
        });

      if (error) throw error;

      showToast('Enrolled successfully!', 'success');
      setIsEnrolled(true);
      if (onEnroll) onEnroll();
      loadCourse();
    } catch (error: any) {
      showToast(error.message || 'Failed to enroll', 'error');
    }
  };

  const canAccessLesson = (lesson: Lesson) => {
    return lesson.is_free || isEnrolled;
  };

  const totalDuration = modules.reduce(
    (sum, module) => sum + module.lessons.reduce((s, l) => s + l.duration_minutes, 0),
    0
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl my-8">
          {/* Header */}
          <div className="relative h-64 bg-gradient-to-br from-blue-600 to-purple-600 rounded-t-2xl overflow-hidden">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 rounded-full transition z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white p-8">
                <h1 className="text-4xl font-bold mb-4">{course?.title}</h1>
                <p className="text-xl text-white/90 mb-6">{course?.description}</p>
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <span>{modules.length} modules</span>
                  </div>
                  <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                    {course?.level}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Enrollment Status */}
            {!isEnrolled ? (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-8 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      ${course?.price}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Get full access to all course content
                    </p>
                  </div>
                  <button
                    onClick={handleEnroll}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-105 shadow-lg"
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 mb-8 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        You're enrolled!
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Progress: {progress}%
                      </p>
                    </div>
                  </div>
                  <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Course Content */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Course Content
              </h2>

              {modules.map((module, moduleIndex) => (
                <div
                  key={module.id}
                  className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
                >
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">
                          Module {moduleIndex + 1}: {module.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {module.description}
                        </p>
                      </div>
                      {module.is_free && (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                          Free Preview
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <button
                        key={lesson.id}
                        onClick={() => canAccessLesson(lesson) && setSelectedLesson(lesson.id)}
                        disabled={!canAccessLesson(lesson)}
                        className={`w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition ${
                          !canAccessLesson(lesson) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            {lesson.completed ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : canAccessLesson(lesson) ? (
                              <Play className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Lock className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-slate-900 dark:text-white">
                              {lessonIndex + 1}. {lesson.title}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {lesson.duration_minutes} min
                              {lesson.is_free && ' • Free'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Certificate */}
            {isEnrolled && progress === 100 && (
              <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-yellow-600" />
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        Congratulations!
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        You've completed this course
                      </p>
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition">
                    Get Certificate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
