import { useState, useEffect } from 'react';
import { X, TrendingUp, Eye, Heart, ShoppingCart, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format, subDays } from 'date-fns';

interface AnalyticsProps {
  onClose: () => void;
}

interface DailyStats {
  date: string;
  views: number;
  likes: number;
  purchases: number;
  revenue: number;
}

interface ProductStats {
  product_id: string;
  product_title: string;
  total_views: number;
  total_likes: number;
  total_purchases: number;
  total_revenue: number;
  conversion_rate: number;
}

export default function Analytics({ onClose }: AnalyticsProps) {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [productStats, setProductStats] = useState<ProductStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<7 | 30 | 90>(30);
  const { user } = useAuth();

  useEffect(() => {
    loadAnalytics();
  }, [user, period]);

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      const startDate = format(subDays(new Date(), period), 'yyyy-MM-dd');

      // Load daily stats
      const { data: dailyData, error: dailyError } = await supabase
        .from('product_analytics')
        .select('*')
        .gte('date', startDate)
        .in('product_id', 
          await supabase
            .from('products')
            .select('id')
            .eq('user_id', user.id)
            .then(res => res.data?.map(p => p.id) || [])
        )
        .order('date', { ascending: true });

      if (dailyError) throw dailyError;

      // Aggregate by date
      const aggregated = (dailyData || []).reduce((acc: DailyStats[], curr: any) => {
        const existing = acc.find((d: DailyStats) => d.date === curr.date);
        if (existing) {
          existing.views += curr.views;
          existing.likes += curr.likes;
          existing.purchases += curr.purchases;
          existing.revenue += parseFloat(curr.revenue);
        } else {
          acc.push({
            date: curr.date,
            views: curr.views,
            likes: curr.likes,
            purchases: curr.purchases,
            revenue: parseFloat(curr.revenue),
          });
        }
        return acc;
      }, [] as DailyStats[]);

      setDailyStats(aggregated);

      // Load product stats
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, title')
        .eq('user_id', user.id);

      if (productsError) throw productsError;

      const productStatsPromises = (products || []).map(async (product) => {
        const { data: analytics } = await supabase
          .from('product_analytics')
          .select('*')
          .eq('product_id', product.id)
          .gte('date', startDate);

        const totals = (analytics || []).reduce(
          (acc, curr) => ({
            views: acc.views + curr.views,
            likes: acc.likes + curr.likes,
            purchases: acc.purchases + curr.purchases,
            revenue: acc.revenue + parseFloat(curr.revenue),
          }),
          { views: 0, likes: 0, purchases: 0, revenue: 0 }
        );

        return {
          product_id: product.id,
          product_title: product.title,
          total_views: totals.views,
          total_likes: totals.likes,
          total_purchases: totals.purchases,
          total_revenue: totals.revenue,
          conversion_rate: totals.views > 0 ? (totals.purchases / totals.views) * 100 : 0,
        };
      });

      const stats = await Promise.all(productStatsPromises);
      setProductStats(stats.sort((a, b) => b.total_revenue - a.total_revenue));
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalStats = dailyStats.reduce(
    (acc, curr) => ({
      views: acc.views + curr.views,
      likes: acc.likes + curr.likes,
      purchases: acc.purchases + curr.purchases,
      revenue: acc.revenue + curr.revenue,
    }),
    { views: 0, likes: 0, purchases: 0, revenue: 0 }
  );

  return (
    <div className="fixed inset-0 gradient-dark z-50 flex flex-col overflow-y-auto">
      <div className="glass-effect border-b border-white/10 p-4 sticky top-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 glass-effect hover:bg-white/20 rounded-xl transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-white">Analytics Dashboard</h2>
              <p className="text-sm text-white/70">Track your performance</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setPeriod(days as 7 | 30 | 90)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                period === days
                  ? 'gradient-primary text-white shadow-glow'
                  : 'glass-effect text-white/70 hover:bg-white/20'
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="glass-effect rounded-xl p-4 hover:bg-white/20 transition">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-blue-400" />
              <span className="text-white/70 text-sm">Views</span>
            </div>
            <div className="text-2xl font-bold text-white">{totalStats.views}</div>
          </div>

          <div className="glass-effect rounded-xl p-4 hover:bg-white/20 transition">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-red-400" />
              <span className="text-white/70 text-sm">Likes</span>
            </div>
            <div className="text-2xl font-bold text-white">{totalStats.likes}</div>
          </div>

          <div className="glass-effect rounded-xl p-4 hover:bg-white/20 transition">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="w-5 h-5 text-green-400" />
              <span className="text-white/70 text-sm">Sales</span>
            </div>
            <div className="text-2xl font-bold text-white">{totalStats.purchases}</div>
          </div>

          <div className="glass-effect rounded-xl p-4 hover:bg-white/20 transition">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-yellow-400" />
              <span className="text-white/70 text-sm">Revenue</span>
            </div>
            <div className="text-2xl font-bold text-gradient">
              ${totalStats.revenue.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Product Performance */}
        <div className="glass-effect rounded-xl p-4">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Product Performance
          </h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-yellow-500 border-t-transparent"></div>
            </div>
          ) : productStats.length === 0 ? (
            <p className="text-white/70 text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {productStats.map((product) => (
                <div
                  key={product.product_id}
                  className="glass-effect rounded-xl p-4 hover:bg-white/20 transition"
                >
                  <h4 className="font-semibold text-white mb-3">{product.product_title}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                    <div>
                      <div className="text-white/70">Views</div>
                      <div className="text-white font-bold">{product.total_views}</div>
                    </div>
                    <div>
                      <div className="text-white/70">Likes</div>
                      <div className="text-white font-bold">{product.total_likes}</div>
                    </div>
                    <div>
                      <div className="text-white/70">Sales</div>
                      <div className="text-white font-bold">{product.total_purchases}</div>
                    </div>
                    <div>
                      <div className="text-white/70">Revenue</div>
                      <div className="text-gradient font-bold">
                        ${product.total_revenue.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/70">Conversion</div>
                      <div className="text-white font-bold">
                        {product.conversion_rate.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
