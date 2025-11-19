import { useState, useEffect } from 'react';
import { X, Search as SearchIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SearchProps {
  onClose: () => void;
  onProductClick: (productId: string) => void;
  onUserClick: (userId: string) => void;
}

interface Product {
  id: string;
  user_id: string;
  title: string;
  media_url: string;
  media_type: 'image' | 'video';
  like_count: number;
}

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
}

export default function Search({ onClose, onProductClick, onUserClick }: SearchProps) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'users'>('products');

  useEffect(() => {
    if (query.trim().length < 2) {
      setProducts([]);
      setUsers([]);
      return;
    }

    const searchTimer = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (productsError) throw productsError;
      setProducts(productsData || []);

      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(20);

      if (usersError) throw usersError;
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 gradient-dark z-50 flex flex-col">
      <div className="glass-effect border-b border-white/10 p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 glass-effect hover:bg-white/20 rounded-xl transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products or users..."
              className="w-full pl-12 pr-4 py-3 rounded-xl glass-effect border border-white/20 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 outline-none transition text-white placeholder-white/50"
              autoFocus
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'products'
                ? 'gradient-primary text-white shadow-glow'
                : 'glass-effect text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'users'
                ? 'gradient-primary text-white shadow-glow'
                : 'glass-effect text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            Users ({users.length})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : query.trim().length < 2 ? (
          <div className="text-center py-12">
            <SearchIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Start typing to search</p>
          </div>
        ) : activeTab === 'products' ? (
          products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => onProductClick(product.id)}
                  className="aspect-square bg-slate-100 rounded-lg overflow-hidden relative group"
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
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <div className="text-white text-center px-2">
                      <div className="text-sm font-medium truncate">{product.title}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No users found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => onUserClick(user.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition"
              >
                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                  {user.avatar_url && (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-slate-900">
                    {user.full_name || user.username}
                  </div>
                  <div className="text-sm text-slate-600">@{user.username}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
