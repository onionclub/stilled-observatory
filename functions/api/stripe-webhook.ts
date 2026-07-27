/**
 * POST /api/stripe-webhook
 * Handles Stripe webhook events. Verifies signature, logs completed payments.
 */

import Stripe from 'stripe';
import { writePayment } from '../_shared/payment-log';

interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  PAYMENT_LOG?: KVNamespace;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return new Response('Webhook not configured.', { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing stripe-signature header.', { status: 400 });
  }

  const body = await request.text();
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body, signature, env.STRIPE_WEBHOOK_SECRET,
      undefined, // default tolerance
      Stripe.createSubtleCryptoProvider()
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature.', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    await writePayment({
      id: session.id,
      created: new Date().toISOString(),
      customerEmail: session.customer_details?.email || 'unknown',
      customerName: session.customer_details?.name || 'unknown',
      service: session.metadata?.service || 'unknown',
      addons: session.metadata?.addons ? session.metadata.addons.split(',').filter(Boolean) : [],
      amountTotal: session.amount_total || 0,
      currency: session.currency || 'usd',
      paymentStatus: session.payment_status || 'unknown',
      sessionId: session.id,
      receiptUrl: session.payment_intent
        ? `https://dashboard.stripe.com/payments/${session.payment_intent}`
        : undefined,
    }, env.PAYMENT_LOG);

    console.log(`[PAYMENT] ${session.customer_details?.email} paid $${((session.amount_total || 0) / 100).toFixed(2)} for ${session.metadata?.service}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
