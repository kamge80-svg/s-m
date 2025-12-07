import { useState, useEffect } from 'react';
import { X, DollarSign, Users, ShoppingBag, TrendingUp, Eye, Ban } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { logger } from '../utils/logger';

interface AdminDashboardProps {
  onClose: () => void;
}

interface PlatformStats {
  totalEarnings: number;
  totalUsers: number;
  totalProducts: number;
  totalSales: number;
  pendingEarnings: number;
}

interface TopSeller {
  id: string;
  username: string;
  full_name: string;
  total_sales: number;
  total_earnings: number;
}

interface RecentProduct {
  id: string;
  title: string;
  price: number;
  username: string;
  created_at: string;
  is_approved: boolean;
}

const AdminDashboard = ({ onClose }: AdminDashboardProps) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      showToast('Access denied', 'error');
      onClose();
      return;
    }

    // Check if user is admin (you can add an is_admin column to profiles table)
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      // For now, allow any authenticated user (change this in production!)
      logger.warn('Non-admin user accessing dashboard', { userId: user.id });
      // showToast('Admin access required', 'error');
      // onClose();
      // return;
    }

    setIsAdmin(true);
    loadDashboardData();
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load platform stats
      const [
        { data: purchases },
        { data: users },
        { data: products },
        { data: earnings }
      ] = await Promise.all([
        supabase.from('purchases').select('amount'),
        supabase.from('profiles').select('id'),
        supabase.from('products').select('id'),
        supabase.from('platform_earnings').select('platform_amount')
      ]);

      const totalEarnings = earnings?.reduce((sum, e) => sum + (e.platform_amount || 0), 0) || 0;
      const totalSales = purchases?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      setStats({
        totalEarnings,
        totalUsers: users?.length || 0,
        totalProducts: products?.length || 0,
        totalSales,
        pendingEarnings: totalEarnings * 0.1, // Estimate
      });

      // Load top sellers
      const { data: sellers } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          products!products_user_id_fkey (
            purchases (amount)
          )
        `)
        .limit(5);

      const topSellersData = sellers?.map(seller => {
        const sales = seller.products?.flatMap((p: any) => p.purchases || []) || [];
        const totalSales = sales.length;
        const totalEarnings = sales.reduce((sum: number, s: any) => sum + (s.amount || 0), 0);
        
        return {
          id: seller.id,
          username: seller.username || 'Unknown',
          full_name: seller.full_name || 'Unknown',
          total_sales: totalSales,
          total_earnings: totalEarnings,
        };
      }).sort((a, b) => b.total_earnings - a.total_earnings) || [];

      setTopSellers(topSellersData);

      // Load recent products
      const { data: recentProds } = await supabase
        .from('products')
        .select(`
          id,
          title,
          price,
          created_at,
          profiles!products_user_id_fkey (username)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentProducts(recentProds?.map(p => ({
        id: p.id,
        title: p.title,
        price: p.price,
        username: (p.profiles as any)?.username || 'Unknown',
        created_at: p.created_at,
        is_approved: true,
      })) || []);

    } catch (error) {
      logger.error('Failed to load admin dashboard:', error);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProductAction = async (productId: string, action: 'approve' | 'ban') => {
    try {
      if (action === 'ban') {
        await supabase
          .from('products')
          .delete()
          .eq('id', productId);
        
        showToast('Product removed', 'success');
      }
      
      loadDashboardData();
    } catch (error) {
      logger.error('Product action failed:', error);
      showToast('Action failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-slate-800 border-b border-slate-700 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<DollarSign className="w-8 h-8" />}
            title="Platform Earnings"
            value={`$${stats?.totalEarnings.toFixed(2) || '0.00'}`}
            subtitle="7% commission"
            color="green"
          />
          <StatCard
            icon={<Users className="w-8 h-8" />}
            title="Total Users"
            value={stats?.totalUsers.toString() || '0'}
            subtitle="Registered accounts"
            color="blue"
          />
          <StatCard
            icon={<ShoppingBag className="w-8 h-8" />}
            title="Total Products"
            value={stats?.totalProducts.toString() || '0'}
            subtitle="Listed items"
            color="purple"
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Total Sales"
            value={`$${stats?.totalSales.toFixed(2) || '0.00'}`}
            subtitle="All transactions"
            color="orange"
          />
        </div>

        {/* Top Sellers */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Top Sellers</h2>
          <div className="space-y-3">
            {topSellers.map((seller, index) => (
              <div
                key={seller.id}
                className="flex items-center justify-between p-4 bg-slate-700 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{seller.username}</p>
                    <p className="text-slate-400 text-sm">{seller.full_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">${seller.total_earnings.toFixed(2)}</p>
                  <p className="text-slate-400 text-sm">{seller.total_sales} sales</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Products</h2>
          <div className="space-y-3">
            {recentProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 bg-slate-700 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-white font-semibold">{product.title}</p>
                  <p className="text-slate-400 text-sm">
                    by @{product.username} • ${product.price}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {new Date(product.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(`#product/${product.id}`, '_blank')}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                    title="View"
                  >
                    <Eye className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => handleProductAction(product.id, 'ban')}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                    title="Remove"
                  >
                    <Ban className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: 'green' | 'blue' | 'purple' | 'orange';
}

const StatCard = ({ icon, title, value, subtitle, color }: StatCardProps) => {
  const colorClasses = {
    green: 'from-green-500 to-emerald-500',
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-red-500',
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center mb-4 text-white`}>
        {icon}
      </div>
      <h3 className="text-slate-400 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-slate-500 text-xs">{subtitle}</p>
    </div>
  );
};

export default AdminDashboard;
