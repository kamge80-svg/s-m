import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface QuizComponentProps {
  lessonId: string;
  onClose: () => void;
  onComplete?: (passed: boolean) => void;
}

export default function QuizComponent({ lessonId, onClose, onComplete }: QuizComponentProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    loadQuiz();
  }, [lessonId]);

  const loadQuiz = async () => {
    const { data } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('order_index');

    setQuestions(data || []);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (selectedAnswer === questions[currentQuestion].correct_answer) {
      setScore(score + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers: number[]) => {
    const finalScore = finalAnswers.reduce((acc, answer, index) => {
      return acc + (answer === questions[index].correct_answer ? 1 : 0);
    }, 0);

    const passed = (finalScore / questions.length) >= 0.7;

    if (user) {
      await supabase.from('quiz_attempts').insert({
        user_id: user.id,
        lesson_id: lessonId,
        score: finalScore,
        total_questions: questions.length,
        passed,
      });
    }

    setScore(finalScore);
    setShowResult(true);
    showToast(passed ? 'Quiz passed!' : 'Try again!', passed ? 'success' : 'error');
    if (onComplete) onComplete(passed);
  };

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md">
          <p className="text-center text-slate-900 dark:text-white">No quiz available</p>
          <button onClick={onClose} className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg">
            Close
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full">
          <div className="text-center">
            {passed ? (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            )}
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {passed ? 'Congratulations!' : 'Keep Learning!'}
            </h2>
            <p className="text-4xl font-bold text-blue-600 mb-4">{percentage}%</p>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              You scored {score} out of {questions.length}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
              >
                Close
              </button>
              {!passed && (
                <button
                  onClick={() => {
                    setCurrentQuestion(0);
                    setSelectedAnswer(null);
                    setScore(0);
                    setAnswers([]);
                    setShowResult(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const options = question.options as string[];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-2xl w-full">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          {question.question}
        </h3>

        <div className="space-y-3 mb-6">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedAnswer(index)}
              className={`w-full p-4 text-left rounded-lg border-2 transition ${
                selectedAnswer === index
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <span className="text-slate-900 dark:text-white">{option}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={selectedAnswer === null}
          className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {currentQuestion < questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
        </button>
      </div>
    </div>
  );
}
