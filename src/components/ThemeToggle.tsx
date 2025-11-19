import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-1.5 rounded-lg transition-all glass-effect hover:bg-white/20"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-3.5 h-3.5 text-white/70 hover:text-white" />
      ) : (
        <Moon className="w-3.5 h-3.5 text-slate-700 hover:text-slate-900" />
      )}
    </button>
  );
}
