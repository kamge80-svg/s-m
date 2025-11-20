import { useState } from 'react';
import { Tag, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';

interface PromoCodeInputProps {
  originalAmount: number;
  onApply: (discount: number, code: string) => void;
  onRemove: () => void;
  appliedCode?: string;
}

export default function PromoCodeInput({ originalAmount, onApply, onRemove, appliedCode }: PromoCodeInputProps) {
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);
  const { showToast } = useToast();

  const validateCode = async () => {
    if (!code.trim()) return;

    setValidating(true);
    try {
      const { data, error } = await supabase
        .rpc('validate_promo_code', {
          code_param: code.toUpperCase(),
          amount_param: originalAmount
        });

      if (error) throw error;

      const result = data[0];
      
      if (result.valid) {
        onApply(result.discount, code.toUpperCase());
        showToast(`Code promo appliqué ! -$${result.discount.toFixed(2)}`, 'success');
        setCode('');
      } else {
        showToast(result.message || 'Code promo invalide', 'error');
      }
    } catch (error: any) {
      console.error('Error validating promo code:', error);
      showToast('Erreur lors de la validation du code', 'error');
    } finally {
      setValidating(false);
    }
  };

  if (appliedCode) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Code promo appliqué
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                {appliedCode}
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="p-2 hover:bg-green-100 dark:hover:bg-green-800 rounded-lg transition"
          >
            <X className="w-4 h-4 text-green-600 dark:text-green-400" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Code promo (optionnel)
      </label>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && validateCode()}
            placeholder="SUMMER2024"
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition uppercase"
            disabled={validating}
          />
        </div>
        <button
          onClick={validateCode}
          disabled={!code.trim() || validating}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {validating ? 'Vérification...' : 'Appliquer'}
        </button>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Entrez un code promo pour bénéficier d'une réduction
      </p>
    </div>
  );
}
