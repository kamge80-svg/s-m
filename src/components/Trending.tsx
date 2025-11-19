import { useState, useEffect } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TrendingProps {
  onClose: () => void;
  onProductClick: (productId: string) => void;
}

interface TrendingProduct {
  id: string;
  title: string;
  media_url: string;
  media_type: 'image' | 'video';
  like_count: number;
  view_count: number;
  comment_count: number;
  profiles?: {
    username: string;
    avatar_url: string;
  };
}

export default function Trending({ onClose, onProductClick }: TrendingProps) {
  const [products, setProducts] = useState<TrendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'likes' | 'views' | 'comments'>('likes');

  useEffect(() => {
    loadTrendingProducts();
  }, [sortBy]);

  const loadTrendingProducts = async () => {
    setLoading(true);
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
        .order(sortBy === 'likes' ? 'like_count' : sortBy === 'views' ? 'view_count' : 'comment_count', {
          ascending: false,
        })
        .limit(20);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading trending products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-600" />
          <h2 className="text-xl font-bold text-slate-900">Trending</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="flex gap-2 mb-6">
          {(['likes', 'views', 'comments'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`px-4 py-2 rounded-full font-medium transition ${
                sortBy === option
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-600 border-t-transparent"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No products found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product, index) => (
              <button
                key={product.id}
                onClick={() => onProductClick(product.id)}
                className="w-full flex gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition text-left group"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-lg">
                    #{index + 1}
                  </div>
                </div>

                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                  {product.media_type === 'video' ? (
                    <video
                      src={product.media_url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={product.media_url}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate group-hover:underline">
                    {product.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    @{product.profiles?.username || 'user'}
                  </p>
                  <div className="flex gap-3 mt-2 text-xs text-slate-500">
                    <span>{product.like_count} likes</span>
                    <span>{product.view_count} views</span>
                    <span>{product.comment_count} comments</span>
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
