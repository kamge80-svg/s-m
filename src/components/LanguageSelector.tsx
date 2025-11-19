import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative group">
      <button className="p-1.5 rounded-lg transition-all glass-effect hover:bg-white/20 flex items-center gap-1">
        <Globe className="w-3.5 h-3.5 text-white/70" />
        <span className="text-white/70 text-xs font-medium uppercase">{language}</span>
      </button>
      <div className="absolute top-full right-0 mt-1 glass-effect rounded-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
        <button
          onClick={() => setLanguage('en')}
          className={`px-4 py-2 text-sm hover:bg-white/20 transition w-full text-left ${
            language === 'en' ? 'text-yellow-500 font-bold' : 'text-white'
          }`}
        >
          English
        </button>
        <button
          onClick={() => setLanguage('fr')}
          className={`px-4 py-2 text-sm hover:bg-white/20 transition w-full text-left ${
            language === 'fr' ? 'text-yellow-500 font-bold' : 'text-white'
          }`}
        >
          Français
        </button>
      </div>
    </div>
  );
}
