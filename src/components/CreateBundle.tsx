import { useState, useEffect } from 'react';
import { X, Package, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface Product {
  id: string;
  title: string;
  price: number;
  media_url: string;
}

interface CreateBundleProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateBundle({ onClose, onSuccess }: CreateBundleProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    loadUserProducts();
  }, [user]);

  const loadUserProducts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('products')
      .select('id, title, price, media_url')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading products:', error);
      return;
    }

    setAvailableProducts(data || []);
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const calculateBundlePrice = () => {
    const total = availableProducts
      .filter(p => selectedProducts.includes(p.id))
      .reduce((sum, p) => sum + p.price, 0);
    
    return total * (1 - discountPercentage / 100);
  };

  const calculateSavings = () => {
    const total = availableProducts
      .filter(p => selectedProducts.includes(p.id))
      .reduce((sum, p) => sum + p.price, 0);
    
    return total * (discountPercentage / 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedProducts.length < 2) {
      showToast('Select at least 2 products for a bundle', 'error');
      return;
    }

    setLoading(true);

    try {
      const bundlePrice = calculateBundlePrice();

      const { data: bundle, error: bundleError } = await supabase
        .from('bundles')
        .insert({
          user_id: user?.id,
          title,
          description,
          price: bundlePrice,
          discount_percentage: discountPercentage,
        })
        .select()
        .single();

      if (bundleError) throw bundleError;

      const bundleItems = selectedProducts.map(productId => ({
        bundle_id: bundle.id,
        product_id: productId,
      }));

      const { error: itemsError } = await supabase
        .from('bundle_items')
        .insert(bundleItems);

      if (itemsError) throw itemsError;

      showToast('Bundle created successfully!', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating bundle:', error);
      showToast(error.message || 'Failed to create bundle', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Bundle</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Bundle Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              placeholder="e.g., Complete Video Course Bundle"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
              placeholder="Describe what's included in this bundle..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Discount: {discountPercentage}%
            </label>
            <input
              type="range"
              min="5"
              max="50"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Customers save {discountPercentage}% when buying this bundle
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Select Products ({selectedProducts.length} selected)
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => toggleProduct(product.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                    selectedProducts.includes(product.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => {}}
                    className="w-5 h-5"
                  />
                  {product.media_url && (
                    <img
                      src={product.media_url}
                      alt={product.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">{product.title}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">${product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedProducts.length >= 2 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-700 dark:text-slate-300">Original Price:</span>
                <span className="text-slate-900 dark:text-white font-medium line-through">
                  ${availableProducts
                    .filter(p => selectedProducts.includes(p.id))
                    .reduce((sum, p) => sum + p.price, 0)
                    .toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-700 dark:text-slate-300">You Save:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  -${calculateSavings().toFixed(2)} ({discountPercentage}%)
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-blue-200 dark:border-blue-800">
                <span className="text-lg font-bold text-slate-900 dark:text-white">Bundle Price:</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${calculateBundlePrice().toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedProducts.length < 2}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Bundle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
