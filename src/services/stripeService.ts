import { loadStripe, Stripe } from '@stripe/stripe-js';
import { supabase } from '../lib/supabase';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('Stripe publishable key not found');
      return null;
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

export const createPaymentIntent = async (
  productId: string,
  amount: number,
  sellerId?: string
): Promise<PaymentIntent> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const amountInCents = Math.round(amount * 100);
    console.log('Creating payment intent for:', { productId, amount, amountInCents, userId: user.id, sellerId });

    // Call Supabase Edge Function to create payment intent
    const response = await supabase.functions.invoke('create-payment-intent', {
      body: {
        productId,
        amount: amountInCents,
        userId: user.id,
        sellerId: sellerId || '',
      },
    });

    console.log('Full response:', response);
    console.log('Response data:', response.data);
    console.log('Response error:', response.error);

    if (response.error) {
      console.error('Edge function error details:', {
        message: response.error.message,
        context: response.error.context,
        name: response.error.name
      });
      throw new Error(response.error.message || 'Failed to create payment intent');
    }
    
    if (!response.data || !response.data.clientSecret) {
      console.error('Invalid response data:', response.data);
      throw new Error('Invalid response from payment service');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

export const confirmPurchase = async (
  productId: string,
  paymentIntentId: string,
  amount: number,
  sellerId?: string
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Calculate commission (7% platform, 93% seller)
    const platformFee = Math.round(amount * 0.07 * 100) / 100; // 7%
    const sellerAmount = Math.round(amount * 0.93 * 100) / 100; // 93%

    // Record the purchase in database with commission details
    const { error } = await supabase.from('purchases').insert({
      user_id: user.id,
      product_id: productId,
      payment_intent_id: paymentIntentId,
      status: 'completed',
      amount: amount,
      platform_fee: platformFee,
      seller_amount: sellerAmount,
      commission_rate: 7.00,
    });

    if (error) throw error;

    // Update seller's revenue (only the 93%)
    if (sellerId) {
      // This would be handled by a database trigger or separate function
      console.log(`Seller ${sellerId} will receive $${sellerAmount} (93% of $${amount})`);
    }
  } catch (error) {
    console.error('Error confirming purchase:', error);
    throw error;
  }
};
