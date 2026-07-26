/**
 * POST /api/stripe-webhook
 * Handles Stripe webhook events. Verifies signature, logs completed payments.
 */

import Stripe from 'stripe';

interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  PAYMENT_LOG?: KVNamespace;
}

interface PaymentLogEntry {
  id: string;
  created: string;
  customerEmail: string;
  customerName: string;
  service: string;
  addons: string[];
  amountTotal: number;
  currency: string;
  paymentStatus: string;
  sessionId: string;
}

async function logPayment(env: Env, entry: PaymentLogEntry) {
  const key = `payment:${entry.id}`;
  const value = JSON.stringify(entry);

  if (env.PAYMENT_LOG) {
    await env.PAYMENT_LOG.put(key, value);
  } else {
    console.log('[PAYMENT LOG]', key, value);
  }
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
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature.', { status: 400 });
  }

  // Handle checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const service = session.metadata?.service || 'unknown';
    const addons = session.metadata?.addons
      ? session.metadata.addons.split(',').filter(Boolean)
      : [];

    const entry: PaymentLogEntry = {
      id: session.id,
      created: new Date().toISOString(),
      customerEmail: session.customer_details?.email || 'unknown',
      customerName: session.customer_details?.name || 'unknown',
      service,
      addons,
      amountTotal: session.amount_total || 0,
      currency: session.currency || 'usd',
      paymentStatus: session.payment_status || 'unknown',
      sessionId: session.id,
    };

    await logPayment(env, entry);

    console.log(`[PAYMENT] ${entry.customerEmail} paid $${(entry.amountTotal / 100).toFixed(2)} for ${entry.service}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
