import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { StripeCardElementOptions } from '@stripe/stripe-js';

interface StripeCardFormProps {
  amount: number;
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const cardElementOptions: StripeCardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1e293b',
      '::placeholder': {
        color: '#94a3b8',
      },
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    invalid: {
      color: '#ef4444',
    },
  },
  hidePostalCode: true,
};

export default function StripeCardForm({ amount, clientSecret, onSuccess, onError }: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        onError(error.message || 'Erreur de paiement');
      } else if (paymentIntent?.status === 'succeeded') {
        onSuccess();
      }
    } catch (err) {
      onError('Une erreur est survenue lors du paiement');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Informations de carte
        </label>
        <div className="p-4 rounded-lg border border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'Traitement...' : `Payer $${amount.toFixed(2)}`}
      </button>

      <div className="flex items-center justify-center gap-3 text-slate-400 text-xs">
        <span>🔒 Paiement sécurisé par Stripe</span>
      </div>
    </form>
  );
}
