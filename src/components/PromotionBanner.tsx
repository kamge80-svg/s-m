import { useState, useEffect } from 'react';
import { Clock, Zap } from 'lucide-react';

interface PromotionBannerProps {
  discount: number;
  endDate: string;
  productTitle: string;
}

export default function PromotionBanner({ discount, endDate, productTitle }: PromotionBannerProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endDate).getTime();
      const now = new Date().getTime();
      const difference = end - now;

      if (difference <= 0) {
        setIsExpired(true);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  if (isExpired) return null;

  return (
    <div className="relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-gradient-x"></div>
      
      {/* Content */}
      <div className="relative px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
            <Zap className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">
              🔥 LIMITED TIME OFFER - {discount}% OFF!
            </p>
            <p className="text-white/90 text-xs">
              {productTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
          <Clock className="w-4 h-4 text-white" />
          <div className="text-right">
            <p className="text-white font-mono font-bold text-sm">
              {timeLeft}
            </p>
            <p className="text-white/80 text-xs">
              remaining
            </p>
          </div>
        </div>
      </div>

      {/* Pulse effect */}
      <div className="absolute inset-0 bg-white/10 animate-pulse-slow"></div>
    </div>
  );
}
