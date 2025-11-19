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
  amount: number
): Promise<PaymentIntent> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const amountInCents = Math.round(amount * 100);
    console.log('Creating payment intent for:', { productId, amount, amountInCents, userId: user.id });

    // Call Supabase Edge Function to create payment intent
    const response = await supabase.functions.invoke('create-payment-intent', {
      body: {
        productId,
        amount: amountInCents,
        userId: user.id,
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
  paymentIntentId: string
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Record the purchase in database
    const { error } = await supabase.from('purchases').insert({
      user_id: user.id,
      product_id: productId,
      payment_intent_id: paymentIntentId,
      status: 'completed',
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error confirming purchase:', error);
    throw error;
  }
};
