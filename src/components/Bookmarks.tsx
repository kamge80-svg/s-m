import { useState, useEffect } from 'react';
import { X, Bookmark } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface BookmarksProps {
  onClose: () => void;
  onProductClick: (productId: string) => void;
}

interface BookmarkedProduct {
  id: string;
  title: string;
  media_url: string;
  media_type: 'image' | 'video';
  price: number;
  like_count: number;
  profiles?: {
    username: string;
  };
}

export default function Bookmarks({ onClose, onProductClick }: BookmarksProps) {
  const [products, setProducts] = useState<BookmarkedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    loadBookmarks();
  }, [user]);

  const loadBookmarks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          product_id,
          products (
            id,
            title,
            media_url,
            media_type,
            price,
            like_count,
            profiles (
              username
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const bookmarkedProducts = (data || []).map(
        (item: any) => item.products
      );
      setProducts(bookmarkedProducts);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', user?.id);

      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-900">Bookmarks</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No bookmarks yet</p>
            <p className="text-slate-400 text-sm mt-1">Save products to access them later</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition group"
              >
                <button
                  onClick={() => onProductClick(product.id)}
                  className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200"
                >
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
                </button>

                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => onProductClick(product.id)}
                    className="font-semibold text-slate-900 truncate hover:underline text-left"
                  >
                    {product.title}
                  </button>
                  <p className="text-sm text-slate-600">
                    @{product.profiles?.username || 'user'}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="font-bold text-slate-900">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {product.like_count} likes
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRemove(product.id)}
                  className="flex-shrink-0 p-2 text-slate-400 hover:text-red-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
