const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { productId, amount, userId, sellerId } = body;

    if (!productId || !amount || !userId) {
      throw new Error('Missing required parameters');
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured');
    }

    // Calculate platform fee (7%) and seller amount (93%)
    const totalAmount = Math.round(amount); // Amount in cents
    const platformFee = Math.round(totalAmount * 0.07); // 7% commission
    const sellerAmount = totalAmount - platformFee; // 93% to seller

    // Call Stripe API directly using fetch
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'amount': amount.toString(),
        'currency': 'usd',
        'automatic_payment_methods[enabled]': 'true',
        'metadata[productId]': productId,
        'metadata[userId]': userId,
        'metadata[sellerId]': sellerId || '',
        'metadata[platformFee]': platformFee.toString(),
        'metadata[sellerAmount]': sellerAmount.toString(),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Stripe API error:', error);
      throw new Error(`Stripe API error: ${error}`);
    }

    const paymentIntent = await response.json();

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
