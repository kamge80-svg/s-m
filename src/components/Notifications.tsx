import { X, Bell, Heart, UserPlus, ShoppingCart, MessageCircle, Check } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsProps {
  onClose: () => void;
  onNavigate?: (link: string) => void;
}

export default function Notifications({ onClose, onNavigate }: NotificationsProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-green-500" />;
      case 'purchase':
        return <ShoppingCart className="w-5 h-5 text-yellow-500" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.link && onNavigate) {
      onNavigate(notification.link);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 gradient-dark z-50 flex flex-col">
      {/* Header */}
      <div className="glass-effect border-b border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 glass-effect hover:bg-white/20 rounded-xl transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-white">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-white/70">{unreadCount} unread</p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 glass-effect hover:bg-white/20 rounded-xl text-white text-sm font-medium transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Bell className="w-16 h-16 text-white/30 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No notifications yet</h3>
            <p className="text-white/70">
              We'll notify you when something happens
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full text-left p-4 rounded-xl transition-all hover:scale-[1.02] ${
                  notification.read
                    ? 'glass-effect hover:bg-white/20'
                    : 'gradient-primary shadow-glow'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    notification.read ? 'glass-effect' : 'bg-white/20'
                  }`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-white">{notification.title}</h4>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                    <p className="text-white/90 text-sm mb-2">{notification.message}</p>
                    <p className="text-white/50 text-xs">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
