import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ProductCard from './ProductCard';
import ProductOptions from './ProductOptions';
import PaymentModal from './PaymentModal';
import { ProductCardSkeleton } from './SkeletonLoader';

interface Product {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  media_url: string;
  media_type: 'image' | 'video';
  thumbnail_url: string;
  promo_video_url: string | null;
  like_count: number;
  comment_count: number;
  view_count: number;
  profiles?: {
    username: string;
    avatar_url: string;
  };
}

interface FeedProps {
  onUserClick: (userId: string, productId?: string) => void;
  onCommentClick: (productId: string) => void;
  categoryFilter?: string | null;
}

export default function Feed({ onUserClick, onCommentClick, categoryFilter }: FeedProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
  const [bookmarkedProducts, setBookmarkedProducts] = useState<Set<string>>(new Set());
  const [showOptions, setShowOptions] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<{ productId: string; title: string; price: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  const loadProducts = useCallback(async () => {
    try {
      console.log('Loading products...', categoryFilter ? `Category: ${categoryFilter}` : 'All');
      
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (categoryFilter) {
        query = query.eq('category', categoryFilter);
      }

      const { data: productsData, error: productsError } = await query;

      if (productsError) {
        console.error('Error loading products:', productsError);
        throw productsError;
      }

      console.log('Products loaded:', productsData?.length || 0, 'products');

      // Then load profiles separately
      if (productsData && productsData.length > 0) {
        const userIds = [...new Set(productsData.map(p => p.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);

        if (profilesError) {
          console.warn('Error loading profiles:', profilesError);
          // Continue without profiles
          setProducts(productsData);
        } else {
          // Merge products with profiles
          const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
          const productsWithProfiles = productsData.map(product => ({
            ...product,
            profiles: profilesMap.get(product.user_id) || undefined,
          }));
          setProducts(productsWithProfiles);
        }
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      showToast('Failed to load products. Check console for details.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadLikedProducts = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('likes')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setLikedProducts(new Set(data?.map((like) => like.product_id) || []));
    } catch (error) {
      console.error('Error loading likes:', error);
    }
  }, [user]);

  const loadBookmarkedProducts = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setBookmarkedProducts(new Set(data?.map((b) => b.product_id) || []));
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  }, [user]);

  useEffect(() => {
    loadProducts();
    loadLikedProducts();
    loadBookmarkedProducts();
  }, [loadProducts, loadLikedProducts, loadBookmarkedProducts]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const windowHeight = window.innerHeight;
      const index = Math.round(scrollTop / windowHeight);
      
      if (index !== currentIndex) {
        console.log('Scrolled to product:', index);
        setCurrentIndex(index);
      }
    };

    // Set initial index
    handleScroll();

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentIndex]);

  const handleLike = async (productId: string, isLiked: boolean) => {
    if (!user) return;

    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('product_id', productId)
          .eq('user_id', user.id);

        setLikedProducts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });

        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, like_count: p.like_count - 1 } : p
          )
        );
      } else {
        await supabase.from('likes').insert({
          product_id: productId,
          user_id: user.id,
        });

        setLikedProducts((prev) => new Set(prev).add(productId));

        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, like_count: p.like_count + 1 } : p
          )
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = async (productId: string) => {
    const url = `${window.location.origin}/product/${productId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this product',
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

  const handleBookmark = async (productId: string, isBookmarked: boolean) => {
    if (!user) return;

    try {
      if (isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('product_id', productId)
          .eq('user_id', user.id);

        setBookmarkedProducts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else {
        await supabase.from('bookmarks').insert({
          product_id: productId,
          user_id: user.id,
        });

        setBookmarkedProducts((prev) => new Set(prev).add(productId));
        showToast('Added to bookmarks', 'success');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      showToast('Failed to update bookmark', 'error');
    }
  };

  if (loading) {
    return (
      <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
        <ProductCardSkeleton />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <p className="text-white text-lg">No products yet. Be the first to post!</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          isVisible={index === currentIndex}
          onLike={handleLike}
          onComment={onCommentClick}
          onShare={handleShare}
          onUserClick={onUserClick}
          onBuyClick={(productId) => {
            const prod = products.find(p => p.id === productId);
            if (prod) {
              setShowPaymentModal({ productId: prod.id, title: prod.title, price: prod.price });
            }
          }}
          isLiked={likedProducts.has(product.id)}
          isBookmarked={bookmarkedProducts.has(product.id)}
          onBookmark={handleBookmark}
          onOptions={(productId) => setShowOptions(productId)}
          hasPromo={!!product.promo_video_url}
        />
      ))}

      {showPaymentModal && (
        <PaymentModal
          productId={showPaymentModal.productId}
          productTitle={showPaymentModal.title}
          amount={showPaymentModal.price}
          onClose={() => setShowPaymentModal(null)}
          onPaymentSuccess={async () => {
            try {
              await supabase.from('purchases').insert({
                buyer_id: user!.id,
                seller_id: products.find(p => p.id === showPaymentModal.productId)!.user_id,
                product_id: showPaymentModal.productId,
                amount: showPaymentModal.price,
                status: 'completed',
              });
              showToast('Purchase successful! 🎉', 'success');
              setShowPaymentModal(null);
            } catch (error) {
              showToast('Purchase failed', 'error');
            }
          }}
        />
      )}

      {showOptions && (
        <ProductOptions
          productId={showOptions}
          onClose={() => setShowOptions(null)}
          onDeleted={() => {
            setProducts((prev) => prev.filter((p) => p.id !== showOptions));
            setShowOptions(null);
          }}
          onEdited={() => {
            loadProducts();
            setShowOptions(null);
          }}
        />
      )}
    </div>
  );
}
