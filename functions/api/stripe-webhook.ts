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
  const counselEmail = env.COUNSEL_EMAIL || 'guidance@stilled.page';

  if (!apiKey) {
    console.log('[EMAIL] No RESEND_API_KEY set — skipping email to', customerEmail);
    return;
  }

  const svc = SERVICE_INFO[service] || { name: service, instructions: 'Reply to this email with your situation and questions.' };
  const shortRef = sessionId.replace('cs_', '').slice(0, 14);

  const hasRush = addons.includes('rush-delivery');
  const hasAudio = addons.includes('audio-reflection');
  const timeline = hasRush ? 'within 24 hours' : 'within 3 business days';

  const addonSummary = addons.length
    ? addons.map(a => a === 'rush-delivery'
        ? '<li>24-Hour Rush Delivery — your response will arrive within 24 hours of each inquiry.</li>'
        : '<li>Audio Voice Reflection — each written response will include a 5–7 minute personalized voice memo elaborating on key themes in spoken cadence.</li>'
      ).join('')
    : '';

  const greeting = customerName ? `Dear ${customerName.split(' ')[0]},` : 'Thank you for your order.';

  const html = `<!DOCTYPE html>
<html>
<body style="font-family: Georgia, 'Times New Roman', serif; max-width: 580px; margin: 0 auto; padding: 2.5rem 2rem; color: #1A1A1A; background: #F4F4F0; line-height: 1.75;">

  <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.14em; color: #999; margin: 0 0 2rem 0;">Stilled.</p>

  <p style="font-size: 16px; margin: 0 0 1.25rem 0;">${greeting}</p>

  <p style="font-size: 16px; margin: 0 0 1.25rem 0;">Your payment has been received. This confirms your order for <strong style="color: #2C3E33;">${svc.name}</strong>.</p>

  ${addonSummary ? `
  <p style="font-size: 14px; margin: 0 0 1rem 0; color: #555;">Your order includes:</p>
  <ul style="font-size: 14px; margin: 0 0 1.5rem 0; padding-left: 1.5rem; color: #555;">
    ${addonSummary}
  </ul>` : ''}

  <div style="background: #FFFFFF; border: 1px solid #E5E5E5; border-radius: 4px; padding: 1.5rem; margin: 1.75rem 0;">

    <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #999; margin: 0 0 0.35rem 0;">Order Reference</p>
    <p style="font-family: 'Courier New', monospace; font-size: 14px; color: #2C3E33; margin: 0 0 1.25rem 0; word-break: break-all;">${shortRef}</p>

    <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #999; margin: 0 0 0.35rem 0;">What to do now</p>
    <p style="font-size: 15px; margin: 0 0 1.25rem 0;">Write to <a href="mailto:${counselEmail}" style="color: #2C3E33; text-decoration: underline;">${counselEmail}</a> with your situation — up to 750 words — and up to 3 specific questions. Put your order reference <strong>${shortRef}</strong> in the subject line so your message is routed correctly.</p>

    <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #999; margin: 0 0 0.35rem 0;">When you'll hear back</p>
    <p style="font-size: 15px; margin: 0 0 0 0;">A comprehensive, custom essay-style response will arrive in your inbox <strong>${timeline}</strong>.${hasAudio ? ' Each response will be accompanied by a 5–7 minute audio voice memo.' : ''}</p>

  </div>

  <p style="font-size: 14px; margin: 1.75rem 0 0.75rem 0; color: #555;">This is a quiet, private correspondence between you and one person. Your inquiry will be read carefully, and your response will be written with the same attention you brought to the asking.</p>

  <p style="font-size: 14px; margin: 0 0 1.75rem 0; color: #555;">If you have questions before sending your inquiry, reply to this email.</p>

  <hr style="border: none; border-top: 1px solid #E5E5E5; margin: 1.75rem 0;">

  <p style="font-size: 13px; color: #999; margin: 0 0 0.25rem 0;">Stilled.</p>
  <p style="font-size: 11px; color: #BBB; margin: 0;">Your order reference: ${shortRef}</p>

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
