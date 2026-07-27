/**
 * POST /api/stripe-webhook
 * Handles Stripe webhook events, logs payments, sends confirmation emails.
 */

import Stripe from 'stripe';
import { writePayment } from '../_shared/payment-log';

interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  PAYMENT_LOG?: KVNamespace;
  RESEND_API_KEY?: string;
  COUNSEL_EMAIL?: string;
}

const SERVICE_INFO: Record<string, { name: string; instructions: string }> = {
  'single-inquiry': {
    name: 'The Single Inquiry',
    instructions: 'Send one email — up to 750 words — detailing your situation and up to 3 specific questions. Put your order reference in the subject line. You\'ll receive a comprehensive written response within 3 business days.',
  },
  'three-letter-series': {
    name: 'The 3-Letter Series',
    instructions: 'Send your first letter — up to 750 words with up to 3 questions. Put your order reference in the subject line. You have 60 days to use all three exchanges at your own pace. Each response arrives within 3 business days.',
  },
  'monthly-rhythm': {
    name: 'The Monthly Rhythm',
    instructions: 'Send your first deep-dive letter. Your weekly cadence: you write Monday–Tuesday, receive a response Wednesday, then a brief check-in Friday–Saturday. Four full cycles per month. Welcome aboard.',
  },
};

async function sendConfirmationEmail(
  env: Env,
  customerEmail: string,
  customerName: string,
  service: string,
  addons: string[],
  sessionId: string,
) {
  const apiKey = env.RESEND_API_KEY;
  const counselEmail = env.COUNSEL_EMAIL || 'concierge@stilled.page';

  if (!apiKey) {
    console.log('[EMAIL] No RESEND_API_KEY set — skipping email to', customerEmail);
    return;
  }

  const svc = SERVICE_INFO[service] || { name: service, instructions: 'Reply to this email with your situation and questions.' };
  const shortRef = sessionId.replace('cs_', '').slice(0, 14);

  const addonLines = addons.length
    ? addons.map(a => a === 'rush-delivery' ? '  + 24-Hour Rush Delivery' : '  + Audio Voice Reflection').join('\n')
    : '';

  const html = `<!DOCTYPE html>
<html>
<body style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 2rem; color: #1A1A1A; background: #F4F4F0;">
  <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.12em; color: #888; margin-bottom: 1.5rem;">Stilled. — Order Confirmed</p>

  <p>${customerName ? customerName + ',' : 'Thank you.'}</p>

  <p>Your payment for <strong>${svc.name}</strong> has been received.${addonLines ? '\n' + addonLines : ''}</p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 1.5rem 0;">

  <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: #888; margin-bottom: 0.25rem;">Order Reference</p>
  <p style="font-family: monospace; font-size: 15px; color: #2C3E33; margin-top: 0;">${shortRef}</p>

  <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: #888; margin-bottom: 0.25rem;">Send your inquiry to</p>
  <p style="font-family: monospace; font-size: 15px; color: #2C3E33; margin-top: 0;">${counselEmail}</p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 1.5rem 0;">

  <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: #888; margin-bottom: 0.25rem;">Next Steps</p>
  <p style="line-height: 1.7;">${svc.instructions}</p>

  <p style="margin-top: 2rem; font-size: 13px; color: #888;">— Stilled.</p>
</body>
</html>`;

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Stilled. <noreply@stilled.page>`,
        to: [customerEmail],
        subject: `Your Order — ${svc.name}`,
        html,
      }),
    });

    if (!resp.ok) {
      console.error('[EMAIL] Failed to send:', await resp.text());
    } else {
      console.log(`[EMAIL] Sent confirmation to ${customerEmail} for ${svc.name}`);
    }
  } catch (err) {
    console.error('[EMAIL] Error sending:', err);
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
    event = await stripe.webhooks.constructEventAsync(
      body, signature, env.STRIPE_WEBHOOK_SECRET,
      undefined,
      Stripe.createSubtleCryptoProvider()
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature.', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const customerEmail = session.customer_details?.email || 'unknown';
    const customerName = session.customer_details?.name || '';
    const service = session.metadata?.service || 'unknown';
    const addons = session.metadata?.addons ? session.metadata.addons.split(',').filter(Boolean) : [];

    await writePayment({
      id: session.id,
      created: new Date().toISOString(),
      customerEmail,
      customerName,
      service,
      addons,
      amountTotal: session.amount_total || 0,
      currency: session.currency || 'usd',
      paymentStatus: session.payment_status || 'unknown',
      sessionId: session.id,
      receiptUrl: session.payment_intent
        ? `https://dashboard.stripe.com/payments/${session.payment_intent}`
        : undefined,
    }, env.PAYMENT_LOG);

    await sendConfirmationEmail(env, customerEmail, customerName, service, addons, session.id);

    console.log(`[PAYMENT] ${customerEmail} paid $${((session.amount_total || 0) / 100).toFixed(2)} for ${service}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
