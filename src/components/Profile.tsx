import { useState, useEffect } from 'react';
import { X, Settings, ShoppingCart, Video, User, Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import EditProfile from './EditProfile';
import Wallet from './Wallet';
import MyAccount from './MyAccount';
import SellerTools from './SellerTools';
import { ProfileSkeleton } from './SkeletonLoader';

interface ProfileProps {
  userId?: string;
  highlightProductId?: string;
  onClose: () => void;
  onProductClick?: (productId: string) => void;
  onPurchaseHistoryClick?: () => void;
  onAnalyticsClick?: () => void;
}

interface Profile {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string;
}

interface Product {
  id: string;
  title: string;
  media_url: string;
  media_type: 'image' | 'video';
  thumbnail_url: string;
  like_count: number;
  view_count: number;
  price: number;
}

export default function Profile({ userId, highlightProductId, onClose, onProductClick, onPurchaseHistoryClick, onAnalyticsClick }: ProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ products: 0, revenue: 0, views: 0, followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showMyAccount, setShowMyAccount] = useState(false);
  const [showSellerTools, setShowSellerTools] = useState(false);
  const { user, signOut } = useAuth();
  const { showToast } = useToast();

  const isOwnProfile = !userId || userId === user?.id;
  const displayUserId = userId || user?.id;

  useEffect(() => {
    if (!displayUserId) return;

    const loadProfile = async () => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', displayUserId)
          .maybeSingle();

        if (profileError) throw profileError;
        setProfile(profileData);

        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', displayUserId)
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;
        setProducts(productsData || []);

        const totalRevenue = productsData?.reduce((sum, p) => sum + (p.price || 0), 0) || 0;
        const totalViews = productsData?.reduce((sum, p) => sum + p.view_count, 0) || 0;

        const { count: followersCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact' })
          .eq('following_id', displayUserId);

        const { count: followingCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact' })
          .eq('follower_id', displayUserId);

        setStats({
          products: productsData?.length || 0,
          revenue: totalRevenue,
          views: totalViews,
          followers: followersCount || 0,
          following: followingCount || 0,
        });

        if (!isOwnProfile && user) {
          const { data: followData } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', user.id)
            .eq('following_id', displayUserId)
            .maybeSingle();

          setIsFollowing(!!followData);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [displayUserId, user, isOwnProfile]);

  const handleToggleFollow = async () => {
    if (!user || !displayUserId) return;

    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', displayUserId);
        setIsFollowing(false);
      } else {
        await supabase.from('follows').insert({
          follower_id: user.id,
          following_id: displayUserId,
        });
        setIsFollowing(true);
      }

      setStats((prev) => ({
        ...prev,
        followers: isFollowing ? prev.followers - 1 : prev.followers + 1,
      }));
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleBuyProduct = (product: Product) => {
    // TODO: Implémenter le système de paiement réel (Stripe, PayPal, etc.)
    // Pour l'instant, simulation
    const confirmPurchase = window.confirm(
      `Buy "${product.title}" for $${product.price.toFixed(2)}?\n\nThis is a demo. Real payment integration coming soon.`
    );
    
    if (confirmPurchase) {
      // Simuler l'achat
      showToast(`Purchase successful! You now own "${product.title}"`, 'success');
      // TODO: Enregistrer la transaction dans la base de données
      // TODO: Envoyer l'argent au vendeur
      // TODO: Donner accès au produit à l'acheteur
      // TODO: Créer une table 'purchases' dans Supabase
      // TODO: Mettre à jour le solde du vendeur
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 gradient-dark z-50 overflow-y-auto">
        <div className="sticky top-0 glass-effect border-b border-white/10 p-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-2 glass-effect hover:bg-white/20 rounded-xl transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-xl font-bold text-white">Profile</h2>
          <div className="w-10" />
        </div>
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 gradient-dark z-50 overflow-y-auto">
      <div className="sticky top-0 glass-effect border-b border-white/10 p-4 flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-2 glass-effect hover:bg-white/20 rounded-xl transition"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <h2 className="text-xl font-bold text-white">Profile</h2>
        {isOwnProfile && (
          <button
            onClick={() => setShowEditProfile(true)}
            className="p-2 glass-effect hover:bg-white/20 rounded-xl transition"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-28 h-28 rounded-2xl gradient-primary mb-4 overflow-hidden shadow-glow p-1">
            <div className="w-full h-full rounded-xl overflow-hidden bg-black">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">
                  {profile?.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">
            {profile?.full_name || profile?.username}
          </h1>
          <p className="text-white/70 mb-4">@{profile?.username}</p>
          {profile?.bio && (
            <p className="text-white/90 text-center max-w-md">{profile.bio}</p>
          )}
        </div>

        <div className="grid grid-cols-4 gap-1 mb-6">
          <div className="glass-effect rounded-lg p-1 text-center hover:bg-white/20 transition" style={{height: '75%', width: '30%'}}>
            <div className="text-[10px] font-bold text-white">{stats.products}</div>
            <div className="text-[6px] text-white/70">Products</div>
          </div>
          <div className="glass-effect rounded-lg p-1 text-center hover:bg-white/20 transition" style={{height: '75%', width: '30%'}}>
            <div className="text-[10px] font-bold text-white">{stats.followers}</div>
            <div className="text-[6px] text-white/70">Followers</div>
          </div>
          <div className="glass-effect rounded-lg p-1 text-center hover:bg-white/20 transition" style={{height: '75%', width: '30%'}}>
            <div className="text-[10px] font-bold text-white">{stats.following}</div>
            <div className="text-[6px] text-white/70">Following</div>
          </div>
          <button
            onClick={() => isOwnProfile && setShowWallet(true)}
            disabled={!isOwnProfile}
            className={`glass-effect rounded-xl p-1 text-center transition-all ${
              isOwnProfile ? 'hover:bg-white/20 hover:scale-105 cursor-pointer' : 'cursor-default'
            }`}
            style={{height: '75%', width: '30%'}}
          >
            <div className="text-[10px] font-bold text-gradient">${stats.revenue.toFixed(2)}</div>
            <div className="text-[6px] text-white/70">
              {isOwnProfile ? 'Revenue (Tap)' : 'Revenue'}
            </div>
          </button>
        </div>

        {!isOwnProfile && (
          <button
            onClick={handleToggleFollow}
            className={`w-full mb-8 px-6 py-4 rounded-xl font-bold transition-all hover:scale-105 ${
              isFollowing
                ? 'glass-effect text-white hover:bg-white/20'
                : 'gradient-primary text-white shadow-glow'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}

        {isOwnProfile && (
          <>
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowMyAccount(true)}
                  className="px-6 py-4 glass-effect text-white rounded-xl font-semibold hover:bg-white/20 transition-all hover:scale-105 flex items-center justify-center gap-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20"
                >
                  <User className="w-5 h-5" />
                  My Account
                </button>
                <button
                  onClick={() => setShowSellerTools(true)}
                  className="px-6 py-4 glass-effect text-white rounded-xl font-semibold hover:bg-white/20 transition-all hover:scale-105 flex items-center justify-center gap-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20"
                >
                  <Briefcase className="w-5 h-5" />
                  Seller Tools
                </button>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full mb-8 px-6 py-3 bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-glow transition-all hover:scale-105"
            >
              Sign Out
            </button>
          </>
        )}

        <h3 className="text-lg font-bold text-white mb-4">
          {isOwnProfile ? 'My Products' : 'Products'}
        </h3>

        {products.length === 0 ? (
          <div className="text-center py-12 glass-effect rounded-xl">
            <p className="text-white/70">No products yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className={`glass-effect rounded-xl overflow-hidden hover:scale-105 transition-all ${
                  highlightProductId === product.id ? 'ring-4 ring-yellow-500 shadow-glow animate-pulse' : ''
                }`}
              >
                <div 
                  className="aspect-square relative group cursor-pointer"
                  onClick={() => onProductClick?.(product.id)}
                >
                  {/* Badge "Vous venez de voir" */}
                  {highlightProductId === product.id && (
                    <div className="absolute top-2 left-2 z-10 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold shadow-glow">
                      🎬 Just viewed
                    </div>
                  )}
                  {product.media_type === 'video' ? (
                    // Pour les vidéos, afficher le thumbnail si disponible, sinon la vidéo
                    product.thumbnail_url ? (
                      <img
                        src={product.thumbnail_url}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={product.media_url}
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <img
                      src={product.media_url}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Badge vidéo si c'est une vidéo */}
                  {product.media_type === 'video' && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm flex items-center gap-1">
                      <Video className="w-3 h-3 text-white" />
                      <span className="text-white text-xs font-medium">Video</span>
                    </div>
                  )}
                  
                  {/* Icône panier flottante pour les non-propriétaires */}
                  {!isOwnProfile && product.price > 0 && (
                    <div className="absolute top-2 right-2 w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end justify-center p-3">
                    <div className="text-white text-center">
                      <div className="text-lg font-bold">{product.like_count}</div>
                      <div className="text-xs">likes</div>
                    </div>
                  </div>
                </div>
                
                {/* Product Info & Buy Button */}
                <div className="p-3 space-y-2">
                  <div>
                    <h4 className="text-white font-semibold text-sm truncate">
                      {product.title}
                    </h4>
                    <p className="text-white/70 text-xs">
                      {product.view_count} views
                    </p>
                  </div>
                  
                  {!isOwnProfile && product.price > 0 && (
                    <button
                      onClick={() => handleBuyProduct(product)}
                      className="w-full gradient-primary text-white font-bold py-2 px-3 rounded-lg text-sm hover:shadow-glow transition-all hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Buy ${product.price.toFixed(2)}
                    </button>
                  )}
                  
                  {isOwnProfile && (
                    <div className="text-center">
                      <span className="text-gradient font-bold text-sm">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showEditProfile && (
        <EditProfile
          onClose={() => setShowEditProfile(false)}
          onSuccess={() => {
            setShowEditProfile(false);
            window.location.reload();
          }}
        />
      )}

      {showWallet && (
        <Wallet
          balance={stats.revenue}
          onClose={() => setShowWallet(false)}
        />
      )}

      {showMyAccount && (
        <MyAccount
          revenue={stats.revenue}
          onClose={() => setShowMyAccount(false)}
        />
      )}

      {showSellerTools && (
        <SellerTools
          onClose={() => setShowSellerTools(false)}
        />
      )}
    </div>
  );
}
