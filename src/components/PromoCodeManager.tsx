import { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  max_uses: number | null;
  uses_count: number;
  valid_until: string | null;
  active: boolean;
}

export default function PromoCodeManager() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('10');
  const [minPurchase, setMinPurchase] = useState('0');
  const [maxUses, setMaxUses] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    loadPromoCodes();
  }, [user]);

  const loadPromoCodes = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading promo codes:', error);
      return;
    }

    setPromoCodes(data || []);
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('promo_codes').insert({
        user_id: user?.id,
        code: code.toUpperCase(),
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        min_purchase: parseFloat(minPurchase) || 0,
        max_uses: maxUses ? parseInt(maxUses) : null,
        valid_until: validUntil || null,
      });

      if (error) throw error;

      showToast('Promo code created!', 'success');
      setShowCreate(false);
      resetForm();
      loadPromoCodes();
    } catch (error: any) {
      showToast(error.message || 'Failed to create promo code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this promo code?')) return;

    const { error } = await supabase.from('promo_codes').delete().eq('id', id);

    if (error) {
      showToast('Failed to delete promo code', 'error');
      return;
    }

    showToast('Promo code deleted', 'success');
    loadPromoCodes();
  };

  const toggleActive = async (id: string, active: boolean) => {
    const { error } = await supabase
      .from('promo_codes')
      .update({ active: !active })
      .eq('id', id);

    if (error) {
      showToast('Failed to update promo code', 'error');
      return;
    }

    loadPromoCodes();
  };

  const copyCode = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedId(id);
    showToast('Code copied!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetForm = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('10');
    setMinPurchase('0');
    setMaxUses('');
    setValidUntil('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Promo Codes</h2>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          New Code
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                  placeholder="SUMMER2024"
                  required
                />
                <button
                  type="button"
                  onClick={generateCode}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Discount Value
              </label>
              <input
                type="number"
                step="0.01"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Min Purchase ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={minPurchase}
                onChange={(e) => setMinPurchase(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Max Uses (optional)
              </label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                placeholder="Unlimited"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Valid Until (optional)
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowCreate(false);
                resetForm();
              }}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Code'}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {promoCodes.map((promo) => (
          <div
            key={promo.id}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <code className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {promo.code}
                  </code>
                  <button
                    onClick={() => copyCode(promo.code, promo.id)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                  >
                    {copiedId === promo.id ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Discount</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {promo.discount_type === 'percentage'
                        ? `${promo.discount_value}%`
                        : `$${promo.discount_value}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Uses</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {promo.uses_count} / {promo.max_uses || '∞'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Min Purchase</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      ${promo.min_purchase}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Expires</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {promo.valid_until
                        ? new Date(promo.valid_until).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(promo.id, promo.active)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    promo.active
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400'
                  }`}
                >
                  {promo.active ? 'Active' : 'Inactive'}
                </button>
                <button
                  onClick={() => handleDelete(promo.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {promoCodes.length === 0 && !showCreate && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No promo codes yet. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
