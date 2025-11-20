import { Package, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface BundleCardProps {
  bundle: {
    id: string;
    title: string;
    description: string;
    price: number;
    discount_percentage: number;
    media_url: string;
    user_id: string;
  };
  onUserClick: (userId: string) => void;
  onPurchaseClick: (bundleId: string) => void;
}

interface BundleProduct {
  id: string;
  title: string;
  price: number;
  media_url: string;
}

export default function BundleCard({ bundle, onUserClick, onPurchaseClick }: BundleCardProps) {
  const [products, setProducts] = useState<BundleProduct[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadBundleDetails();
  }, [bundle.id]);

  const loadBundleDetails = async () => {
    const { data: items } = await supabase
      .from('bundle_items')
      .select(`
        product_id,
        products (id, title, price, media_url)
      `)
      .eq('bundle_id', bundle.id);

    if (items) {
      setProducts(items.map((item: any) => item.products));
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', bundle.user_id)
      .single();

    setProfile(profileData);
  };

  const originalPrice = products.reduce((sum, p) => sum + p.price, 0);
  const savings = originalPrice - bundle.price;

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-500/30 shadow-xl">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
          <Package className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
              BUNDLE DEAL
            </span>
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
              SAVE {bundle.discount_percentage}%
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">{bundle.title}</h3>
          {bundle.description && (
            <p className="text-white/70 text-sm mb-3">{bundle.description}</p>
          )}
        </div>
      </div>

      {/* Products in bundle */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {products.slice(0, 3).map((product) => (
          <div key={product.id} className="relative aspect-square rounded-lg overflow-hidden">
            <img
              src={product.media_url}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
              <p className="text-white text-xs font-medium truncate">{product.title}</p>
            </div>
          </div>
        ))}
        {products.length > 3 && (
          <div className="aspect-square rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <p className="text-white font-bold">+{products.length - 3}</p>
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className="bg-black/30 rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/70 text-sm">Original Price:</span>
          <span className="text-white/70 line-through">${originalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-green-400 text-sm font-medium">You Save:</span>
          <span className="text-green-400 font-bold">${savings.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-white/10">
          <span className="text-white font-bold text-lg">Bundle Price:</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            ${bundle.price.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {profile && (
          <button
            onClick={() => onUserClick(bundle.user_id)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                {profile.username?.[0]?.toUpperCase()}
              </div>
            )}
            <span className="text-white text-sm">@{profile.username}</span>
          </button>
        )}
        <button
          onClick={() => onPurchaseClick(bundle.id)}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg"
        >
          <ShoppingCart className="w-5 h-5" />
          Buy Bundle
        </button>
      </div>
    </div>
  );
}
