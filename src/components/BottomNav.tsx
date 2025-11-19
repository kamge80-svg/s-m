import { Home, Plus, User, Search, TrendingUp, Bookmark, Bell, MessageCircle, Grid } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';

interface BottomNavProps {
  activeView: 'feed' | 'create' | 'profile' | 'search' | 'trending' | 'bookmarks';
  onViewChange: (view: 'feed' | 'create' | 'profile' | 'search' | 'trending' | 'bookmarks') => void;
  onNotificationsClick?: () => void;
  onMessagesClick?: () => void;
  onCategoriesClick?: () => void;
}

export default function BottomNav({ activeView, onViewChange, onNotificationsClick, onMessagesClick, onCategoriesClick }: BottomNavProps) {
  const { unreadCount } = useNotifications();

  return (
    <>
      {/* Top Bar avec effet glass - Ultra compact */}
      <div className="fixed top-0 left-0 right-0 z-40 glass-effect border-b border-white/10 px-3 py-1.5">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-base font-bold text-gradient">sîm</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={onMessagesClick}
              className="p-1.5 rounded-lg transition-all glass-effect hover:bg-white/20 text-white/70 hover:text-white relative"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onNotificationsClick}
              className="p-1.5 rounded-lg transition-all glass-effect hover:bg-white/20 text-white/70 hover:text-white relative"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[8px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <ThemeToggle />
            <LanguageSelector />
            <button
              onClick={onCategoriesClick}
              className="p-1.5 rounded-lg transition-all glass-effect hover:bg-white/20 text-white/70 hover:text-white"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewChange('trending')}
              className={`p-1.5 rounded-lg transition-all ${
                activeView === 'trending'
                  ? 'bg-gradient-to-br from-yellow-500 to-amber-500 text-white shadow-glow'
                  : 'glass-effect hover:bg-white/20 text-white/70 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewChange('bookmarks')}
              className={`p-1.5 rounded-lg transition-all ${
                activeView === 'bookmarks'
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-glow-green'
                  : 'glass-effect hover:bg-white/20 text-white/70 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewChange('search')}
              className={`p-1.5 rounded-lg transition-all ${
                activeView === 'search'
                  ? 'bg-white text-black'
                  : 'glass-effect hover:bg-white/20 text-white/70 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation avec effet glass - Ultra compact */}
      <div className="fixed bottom-0 left-0 right-0 z-40 glass-effect border-t border-white/10 pb-safe">
        <div className="flex items-center justify-around py-1.5 px-2 max-w-7xl mx-auto">
          <button
            onClick={() => onViewChange('feed')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${
              activeView === 'feed'
                ? 'text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Home className={`w-4 h-4 ${activeView === 'feed' ? 'fill-white' : ''}`} />
            <span className="text-[9px] font-medium">Home</span>
          </button>

          <button
            onClick={() => onViewChange('create')}
            className="relative flex items-center justify-center transition-all hover:scale-110"
          >
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
              <Plus className="w-4 h-4 text-white" />
            </div>
          </button>

          <button
            onClick={() => onViewChange('profile')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${
              activeView === 'profile'
                ? 'text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <User className={`w-4 h-4 ${activeView === 'profile' ? 'fill-white' : ''}`} />
            <span className="text-[9px] font-medium">Profile</span>
          </button>
        </div>
      </div>
    </>
  );
}
