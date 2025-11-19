import { useState, useEffect } from 'react';
import { X, ShoppingBag, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface PurchaseHistoryProps {
  onClose: () => void;
  onProductClick?: (productId: string) => void;
}

interface Purchase {
  id: string;
  product_id: string;
  amount: number;
  status: string;
  created_at: string;
  product_title: string;
  product_media_url: string;
  product_thumbnail_url: string;
  seller_username: string;
  seller_avatar_url: string;
}

export default function PurchaseHistory({ onClose, onProductClick }: PurchaseHistoryProps) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const { user } = useAuth();

  useEffect(() => {
    loadPurchases();
  }, [user, filter]);

  const loadPurchases = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('purchase_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error loading purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = purchases
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="fixed inset-0 gradient-dark z-50 flex flex-col">
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
              <h2 className="text-xl font-bold text-white">Purchase History</h2>
              <p className="text-sm text-white/70">{purchases.length} purchases</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`py-2 px-4 rounded-xl font-medium transition-all ${
              filter === 'all'
                ? 'gradient-primary text-white shadow-glow'
                : 'glass-effect text-white/70 hover:bg-white/20'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`py-2 px-4 rounded-xl font-medium transition-all ${
              filter === 'completed'
                ? 'gradient-primary text-white shadow-glow'
                : 'glass-effect text-white/70 hover:bg-white/20'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`py-2 px-4 rounded-xl font-medium transition-all ${
              filter === 'pending'
                ? 'gradient-primary text-white shadow-glow'
                : 'glass-effect text-white/70 hover:bg-white/20'
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {!loading && purchases.length > 0 && (
        <div className="glass-effect border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-500" />
              <span className="text-white/70">Total Spent:</span>
            </div>
            <span className="text-2xl font-bold text-gradient">
              ${totalSpent.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-yellow-500 border-t-transparent"></div>
          </div>
        ) : purchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ShoppingBag className="w-16 h-16 text-white/30 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No purchases yet</h3>
            <p className="text-white/70">
              Start exploring and buy your first product!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {purchases.map((purchase) => (
              <button
                key={purchase.id}
                onClick={() => onProductClick?.(purchase.product_id)}
                className="w-full glass-effect rounded-xl p-4 hover:bg-white/20 transition-all hover:scale-[1.02]"
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-black flex-shrink-0">
                    <img
                      src={purchase.product_thumbnail_url || purchase.product_media_url}
                      alt={purchase.product_title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <h4 className="font-bold text-white mb-1 truncate">
                      {purchase.product_title}
                    </h4>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 to-green-500 overflow-hidden">
                        {purchase.seller_avatar_url ? (
                          <img
                            src={purchase.seller_avatar_url}
                            alt={purchase.seller_username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                            {purchase.seller_username[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-white/70 text-sm">
                        @{purchase.seller_username}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-white/70">
                        <Calendar className="w-4 h-4" />
                        {formatDistanceToNow(new Date(purchase.created_at), { addSuffix: true })}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          purchase.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {purchase.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-gradient">
                      ${purchase.amount.toFixed(2)}
                    </div>
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
