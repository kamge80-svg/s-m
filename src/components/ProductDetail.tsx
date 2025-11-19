import { useState, useEffect } from 'react';
import { X, Heart, Share2, ShoppingCart, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import PaymentModal from './PaymentModal';

interface Product {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  media_url: string;
  media_type: 'image' | 'video';
  promo_video_url: string | null;
  category: string;
  tags: string[];
  like_count: number;
  view_count: number;
  profiles?: {
    username: string;
    avatar_url: string;
  };
}

interface ProductDetailProps {
  productId: string;
  onClose: () => void;
  onUserClick: (userId: string) => void;
  onReviewsClick?: (productId: string) => void;
}

export default function ProductDetail({ productId, onClose, onUserClick, onReviewsClick }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    loadProduct();
    checkIfLiked();
    checkIfPurchased();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;
      setProduct(data);
      
      // Vérifier si l'utilisateur est le propriétaire
      if (user && data.user_id === user.id) {
        console.log('User is owner');
        setIsOwner(true);
        setHasPurchased(true); // Le propriétaire a toujours accès
      } else {
        console.log('User is NOT owner', { userId: user?.id, productUserId: data.user_id });
        setIsOwner(false);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      showToast('Failed to load product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkIfPurchased = async () => {
    if (!user) {
      console.log('No user, cannot check purchase');
      setHasPurchased(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('product_id', productId)
        .eq('status', 'completed')
        .single();

      console.log('Purchase check:', { data, error, hasPurchased: !!data });
      
      if (data) {
        setHasPurchased(true);
      } else {
        setHasPurchased(false);
      }
    } catch (error) {
      // Pas d'achat trouvé
      console.log('No purchase found');
      setHasPurchased(false);
    }
  };

  const checkIfLiked = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single();

      setIsLiked(!!data);
    } catch (error) {
      // Not liked
    }
  };

  const handleLike = async () => {
    if (!user || !product) return;

    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('product_id', productId)
          .eq('user_id', user.id);

        setIsLiked(false);
        setProduct({ ...product, like_count: product.like_count - 1 });
      } else {
        await supabase.from('likes').insert({
          product_id: productId,
          user_id: user.id,
        });

        setIsLiked(true);
        setProduct({ ...product, like_count: product.like_count + 1 });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/product/${productId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          url,
        });
        showToast('Shared successfully!', 'success');
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        showToast('Link copied to clipboard!', 'success');
      } catch (error) {
        showToast('Failed to copy link', 'error');
      }
    }
  };

  const handlePurchase = () => {
    if (!user) {
      showToast('Please sign in to purchase', 'error');
      return;
    }

    if (isOwner) {
      showToast('You cannot buy your own product', 'info');
      return;
    }

    if (hasPurchased) {
      showToast('You already own this product', 'info');
      return;
    }

    // Ouvrir le modal de paiement
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      // Créer l'achat après paiement réussi
      const { error } = await supabase
        .from('purchases')
        .insert({
          buyer_id: user!.id,
          seller_id: product!.user_id,
          product_id: productId,
          amount: product!.price,
          status: 'completed',
        });

      if (error) throw error;

      showToast('Purchase successful! 🎉', 'success');
      setHasPurchased(true);
      setShowPaymentModal(false);
      
      // Recharger le produit pour mettre à jour les stats
      loadProduct();
    } catch (error) {
      console.error('Purchase error:', error);
      showToast('Purchase failed. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-4">Product not found</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white text-black rounded-lg font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full glass-effect flex items-center justify-center hover:bg-white/20 transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white font-bold text-lg">Product Details</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 pb-24">
        {/* Video/Image principale */}
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden mb-6">
          {hasPurchased || isOwner ? (
            // Contenu accessible (acheté ou propriétaire)
            product.media_type === 'video' ? (
              <video
                src={product.media_url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={product.media_url}
                alt={product.title}
                className="w-full h-full object-contain"
              />
            )
          ) : (
            // Contenu verrouillé (pas acheté)
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-black">
              <div className="text-center p-8">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-glow">
                  <ShoppingCart className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-white text-2xl font-bold mb-3">
                  Purchase to Access
                </h3>
                <p className="text-white/70 text-lg mb-6">
                  Buy this product to unlock the full content
                </p>
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-effect">
                  <span className="text-white/60 text-sm">Price:</span>
                  <span className="text-white text-3xl font-bold">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User info */}
        <button
          onClick={() => onUserClick(product.user_id)}
          className="flex items-center gap-3 mb-6 group"
        >
          <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden border-2 border-white/20">
            {product.profiles?.avatar_url && (
              <img
                src={product.profiles.avatar_url}
                alt={product.profiles.username}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="text-left">
            <p className="text-white font-semibold group-hover:underline">
              @{product.profiles?.username || 'user'}
            </p>
            <p className="text-white/60 text-sm">{product.view_count} views</p>
          </div>
        </button>

        {/* Title & Description */}
        <div className="mb-6">
          <h2 className="text-white text-2xl font-bold mb-3">{product.title}</h2>
          <p className="text-white/80 text-base leading-relaxed whitespace-pre-wrap">
            {product.description}
          </p>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {product.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full glass-effect text-white text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-6 mb-6 text-white/60">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            <span>{product.like_count} likes</span>
          </div>
          <div className="flex items-center gap-2">
            <span>👁️</span>
            <span>{product.view_count} views</span>
          </div>
        </div>

        {/* Price & Actions */}
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/60 text-sm mb-1">Price</p>
              <p className="text-white text-3xl font-bold">
                ${product.price.toFixed(2)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleLike}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition ${
                  isLiked
                    ? 'bg-gradient-to-br from-yellow-500 to-amber-500 shadow-glow'
                    : 'glass-effect hover:bg-white/20'
                }`}
              >
                <Heart
                  className={`w-6 h-6 ${
                    isLiked ? 'text-white fill-white' : 'text-white'
                  }`}
                />
              </button>
              <button
                onClick={handleShare}
                className="w-12 h-12 rounded-xl glass-effect flex items-center justify-center hover:bg-white/20 transition"
              >
                <Share2 className="w-6 h-6 text-white" />
              </button>
              {onReviewsClick && (
                <button
                  onClick={() => onReviewsClick(productId)}
                  className="w-12 h-12 rounded-xl glass-effect flex items-center justify-center hover:bg-white/20 transition"
                >
                  <Star className="w-6 h-6 text-white" />
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={hasPurchased || isOwner}
            className={`w-full py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2 ${
              hasPurchased
                ? 'bg-green-600 text-white cursor-default'
                : isOwner
                ? 'bg-slate-600 text-white/50 cursor-not-allowed'
                : 'gradient-primary text-white shadow-glow hover:scale-105'
            }`}
          >
            <ShoppingCart className="w-6 h-6" />
            {hasPurchased ? 'Purchased ✓' : isOwner ? 'Your Product' : 'Buy Now'}
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && product && (
        <PaymentModal
          productId={product.id}
          productTitle={product.title}
          amount={product.price}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
