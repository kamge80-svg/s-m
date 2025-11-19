import { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe, createPaymentIntent, confirmPurchase } from '../services/stripeService';
import StripeCardForm from './StripeCardForm';
import { useToast } from '../contexts/ToastContext';

interface PaymentModalProps {
  productId: string;
  productTitle: string;
  amount: number;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

type PaymentMethod = 'mobile' | 'card' | null;
type MobileProvider = 'orange' | 'mtn' | null;

export default function PaymentModal({ productId, productTitle, amount, onClose, onPaymentSuccess }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [mobileProvider, setMobileProvider] = useState<MobileProvider>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const { showToast } = useToast();
  const stripePromise = getStripe();

  useEffect(() => {
    if (paymentMethod === 'card') {
      initializeStripePayment();
    }
  }, [paymentMethod]);

  const initializeStripePayment = async () => {
    try {
      setProcessing(true);
      const { clientSecret, paymentIntentId } = await createPaymentIntent(productId, amount);
      setClientSecret(clientSecret);
      setPaymentIntentId(paymentIntentId);
    } catch (error) {
      showToast('Erreur lors de l\'initialisation du paiement', 'error');
      setPaymentMethod(null);
    } finally {
      setProcessing(false);
    }
  };

  const handleStripeSuccess = async () => {
    try {
      if (paymentIntentId) {
        await confirmPurchase(productId, paymentIntentId);
      }
      showToast('Paiement réussi !', 'success');
      onPaymentSuccess();
    } catch (error) {
      showToast('Erreur lors de la confirmation', 'error');
    }
  };

  const handleStripeError = (error: string) => {
    showToast(error, 'error');
  };

  const handleMobilePayment = async () => {
    if (!phoneNumber || !mobileProvider) {
      showToast('Veuillez entrer votre numéro de téléphone', 'error');
      return;
    }

    setProcessing(true);
    
    // TODO: Intégrer Orange Money / MTN Mobile Money API
    setTimeout(() => {
      setProcessing(false);
      showToast('Paiement Mobile Money en cours de développement', 'info');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Paiement</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Product Info */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-slate-600 text-sm mb-1">Produit</p>
            <p className="text-slate-900 font-semibold mb-3">{productTitle}</p>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Montant</span>
              <span className="text-2xl font-bold text-slate-900">${amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          {!paymentMethod && (
            <div className="space-y-3">
              <p className="text-slate-700 font-medium mb-3">Choisissez votre mode de paiement</p>
              
              <button
                onClick={() => setPaymentMethod('mobile')}
                className="w-full p-4 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-slate-900">Mobile Money</p>
                  <p className="text-sm text-slate-600">Orange Money, MTN Money</p>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('card')}
                className="w-full p-4 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-slate-900">Carte Bancaire</p>
                  <p className="text-sm text-slate-600">Visa, Mastercard via Stripe</p>
                </div>
              </button>
            </div>
          )}

          {/* Mobile Money Form */}
          {paymentMethod === 'mobile' && (
            <div className="space-y-4">
              <button
                onClick={() => setPaymentMethod(null)}
                className="text-blue-600 text-sm hover:underline"
              >
                ← Retour
              </button>

              <div>
                <p className="text-slate-700 font-medium mb-3">Choisissez votre opérateur</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMobileProvider('orange')}
                    className={`p-4 rounded-xl border-2 transition ${
                      mobileProvider === 'orange'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-slate-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">OM</span>
                      </div>
                      <p className="font-semibold text-slate-900">Orange Money</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setMobileProvider('mtn')}
                    className={`p-4 rounded-xl border-2 transition ${
                      mobileProvider === 'mtn'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-slate-200 hover:border-yellow-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">MTN</span>
                      </div>
                      <p className="font-semibold text-slate-900">MTN Money</p>
                    </div>
                  </button>
                </div>
              </div>

              {mobileProvider && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+237 6XX XXX XXX"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Vous recevrez une notification pour confirmer le paiement
                  </p>
                </div>
              )}

              <button
                onClick={handleMobilePayment}
                disabled={!mobileProvider || !phoneNumber || processing}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Traitement...' : `Payer $${amount.toFixed(2)}`}
              </button>
            </div>
          )}

          {/* Stripe Card Payment Form */}
          {paymentMethod === 'card' && (
            <div className="space-y-4">
              <button
                onClick={() => {
                  setPaymentMethod(null);
                  setClientSecret(null);
                  setPaymentIntentId(null);
                }}
                className="text-blue-600 text-sm hover:underline"
              >
                ← Retour
              </button>

              {processing && !clientSecret && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-slate-600 mt-4">Initialisation du paiement...</p>
                </div>
              )}

              {clientSecret && stripePromise && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripeCardForm
                    amount={amount}
                    clientSecret={clientSecret}
                    onSuccess={handleStripeSuccess}
                    onError={handleStripeError}
                  />
                </Elements>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
