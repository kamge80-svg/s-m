import { X, Sun, Moon, Globe } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsProps {
  onClose: () => void;
}

export default function Settings({ onClose }: SettingsProps) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl my-8">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t('settings')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
            >
              <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Theme Section */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                {t('appearance')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => theme === 'dark' && toggleTheme()}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    theme === 'light'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <Sun className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {t('light')}
                  </p>
                </button>
                <button
                  onClick={() => theme === 'light' && toggleTheme()}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    theme === 'dark'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <Moon className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {t('dark')}
                  </p>
                </button>
              </div>
            </div>

            {/* Language Section */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {t('language')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setLanguage('en')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    language === 'en'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="text-3xl mb-2">🇬🇧</div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    English
                  </p>
                </button>
                <button
                  onClick={() => setLanguage('fr')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    language === 'fr'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="text-3xl mb-2">🇫🇷</div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Français
                  </p>
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                {t('settingsInfo') || 'Your preferences are saved automatically'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
