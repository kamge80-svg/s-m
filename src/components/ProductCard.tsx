import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Bookmark, MoreVertical } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSound } from '../contexts/SoundContext';

interface Product {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  media_url: string;
  media_type: 'image' | 'video';
  thumbnail_url: string;
  like_count: number;
  comment_count: number;
  view_count: number;
  profiles?: {
    username: string;
    avatar_url: string;
  };
}

interface ProductCardProps {
  product: Product;
  isVisible: boolean;
  onLike: (productId: string, isLiked: boolean) => void;
  onComment: (productId: string) => void;
  onShare: (productId: string) => void;
  onUserClick: (userId: string, productId?: string) => void;
  onBuyClick?: (productId: string) => void;
  isLiked: boolean;
  isBookmarked?: boolean;
  onBookmark?: (productId: string, isBookmarked: boolean) => void;
  onOptions?: (productId: string) => void;
  hasPromo?: boolean;
}

export default function ProductCard({
  product,
  isVisible,
  onLike,
  onComment,
  onShare,
  onUserClick,
  onBuyClick,
  isLiked,
  isBookmarked = false,
  onBookmark,
  onOptions,
  hasPromo = false,
}: ProductCardProps) {
  const [doubleTapLike, setDoubleTapLike] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();
  const { isSoundEnabled, toggleSound } = useSound();
  const lastTapRef = useRef(0);
  const hasInteractedRef = useRef(false);
  
  // Utiliser promo_video_url si disponible, sinon media_url
  const videoUrl = (product as any).promo_video_url || product.media_url;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Gérer l'événement de chargement
    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadstart', handleLoadStart);

    if (isVisible) {
      // Reset video to start
      video.currentTime = 0;
      // Appliquer le paramètre de son global
      video.muted = !isSoundEnabled;
      
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`Video playing ${isSoundEnabled ? 'with sound' : 'muted'}:`, product.title);
            hasInteractedRef.current = true;
            setIsLoading(false);
          })
          .catch((error) => {
            console.warn('Video autoplay blocked:', error.message);
            // Si bloqué, essayer en muet
            video.muted = true;
            video.play()
              .then(() => {
                hasInteractedRef.current = true;
                setIsLoading(false);
              })
              .catch(console.error);
          });
      }
    } else {
      video.pause();
      video.currentTime = 0;
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, [isVisible, product.title, isSoundEnabled]);

  const handleVideoClick = () => {
    // Si c'est une vidéo promo, TOUJOURS ouvrir le profil
    if (hasPromo) {
      onUserClick(product.user_id, product.id);
    } else {
      // Vidéo normale - double-tap pour like
      handleDoubleTap();
    }
  };

  useEffect(() => {
    if (isVisible && user) {
      const recordView = async () => {
        await supabase.from('views').insert({
          user_id: user.id,
          product_id: product.id,
        });
      };
      recordView();
    }
  }, [isVisible, product.id, user]);



  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (!isLiked) {
        onLike(product.id, false);
        setDoubleTapLike(true);
        setTimeout(() => setDoubleTapLike(false), 1000);
      }
    }

    lastTapRef.current = now;
  };

  return (
    <div className="relative w-full h-screen snap-start snap-always flex-shrink-0 bg-black">
      {product.media_type === 'video' ? (
        <>
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            loop
            muted={!isSoundEnabled}
            playsInline
            preload="auto"
            onClick={handleVideoClick}
          />
          
          {/* Indicateur de chargement */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
            </div>
          )}

          {/* Badge "Promo" si c'est une vidéo promo */}
          {hasPromo && !isLoading && (
            <div className="absolute top-4 left-4 px-4 py-2 rounded-full gradient-primary text-white text-sm font-bold shadow-glow animate-pulse">
              🎬 Tap to see full product
            </div>
          )}
        </>
      ) : (
        <img
          src={product.media_url}
          alt={product.title}
          className="w-full h-full object-contain"
          onClick={handleDoubleTap}
        />
      )}

      {doubleTapLike && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="relative">
            <Heart className="w-32 h-32 text-red-500 fill-red-500 animate-bounce-scale" />
            <Heart className="w-32 h-32 text-red-500 fill-red-500 absolute inset-0 animate-ping opacity-75" />
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 pb-20 bg-gradient-to-t from-black via-black/60 to-transparent">
        <div className="flex items-end justify-between gap-3">
          {/* Left side - Info */}
          <div className="flex-1 min-w-0">
            {/* User info */}
            <button
              onClick={() => onUserClick(product.user_id)}
              className="flex items-center gap-2 mb-3 group"
            >
              <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden border-2 border-white shadow-lg">
                {product.profiles?.avatar_url && (
                  <img
                    src={product.profiles.avatar_url}
                    alt={product.profiles.username}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <span className="text-white font-bold text-sm group-hover:underline drop-shadow-lg">
                @{product.profiles?.username || 'user'}
              </span>
            </button>

            {/* Title */}
            <h2 className="text-white text-base font-bold mb-1 drop-shadow-lg line-clamp-1">
              {product.title}
            </h2>
            
            {/* Description */}
            <p className="text-white/95 text-xs mb-2 line-clamp-2 drop-shadow-md">
              {(product as any).short_description || product.description}
            </p>
            
            {/* Buy Button */}
            {product.price > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBuyClick?.(product.id);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 shadow-glow hover:scale-105 transition-all active:scale-95"
              >
                <span className="text-white font-bold text-sm">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-white font-semibold text-sm">
                  • Acheter
                </span>
              </button>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex flex-col gap-2 items-center -mt-40">
            {/* Like */}
            <button
              onClick={() => onLike(product.id, isLiked)}
              className="flex flex-col items-center gap-0.5 group"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                isLiked
                  ? 'bg-gradient-to-br from-red-500 to-pink-500 shadow-red-500/50 scale-105'
                  : 'bg-white/20 backdrop-blur-md group-hover:bg-white/30 group-hover:scale-105'
              }`}>
                <Heart
                  className={`w-5 h-5 transition-all ${
                    isLiked
                      ? 'text-white fill-white'
                      : 'text-white'
                  }`}
                />
              </div>
              <span className="text-white text-xs font-bold drop-shadow-lg">
                {product.like_count}
              </span>
            </button>

            {/* Comment */}
            <button
              onClick={() => onComment(product.id)}
              className="flex flex-col items-center gap-0.5 group"
            >
              <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 group-hover:scale-105 transition-all duration-300 shadow-lg">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-white text-xs font-bold drop-shadow-lg">
                {product.comment_count}
              </span>
            </button>

            {/* Bookmark */}
            <button
              onClick={() => onBookmark?.(product.id, isBookmarked)}
              className="flex flex-col items-center gap-0.5 group"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                isBookmarked
                  ? 'bg-gradient-to-br from-yellow-500 to-amber-500 shadow-yellow-500/50 scale-105'
                  : 'bg-white/20 backdrop-blur-md group-hover:bg-white/30 group-hover:scale-105'
              }`}>
                <Bookmark
                  className={`w-5 h-5 transition-all ${
                    isBookmarked
                      ? 'text-white fill-white'
                      : 'text-white'
                  }`}
                />
              </div>
            </button>

            {/* Share */}
            <button
              onClick={() => onShare(product.id)}
              className="flex flex-col items-center gap-0.5 group"
            >
              <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 group-hover:scale-105 transition-all duration-300 shadow-lg">
                <Share2 className="w-5 h-5 text-white" />
              </div>
            </button>

            {/* Sound toggle for videos */}
            {product.media_type === 'video' && (
              <button
                onClick={toggleSound}
                className="flex flex-col items-center gap-0.5 group"
              >
                <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 group-hover:scale-105 transition-all duration-300 shadow-lg">
                  {!isSoundEnabled ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </div>
              </button>
            )}

            {/* Options for owner */}
            {user?.id === product.user_id && onOptions && (
              <button
                onClick={() => onOptions(product.id)}
                className="flex flex-col items-center gap-0.5 group"
              >
                <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 group-hover:scale-105 transition-all duration-300 shadow-lg">
                  <MoreVertical className="w-5 h-5 text-white" />
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
