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

const SERVICE_NAMES: Record<string, string> = {
  'single-inquiry': 'The Single Inquiry',
  'three-letter-series': 'The 3-Letter Series',
  'monthly-rhythm': 'The Monthly Rhythm',
};

function nextMonday(): string {
  const d = new Date();
  d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7 || 7));
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function buildEmailHtml(
  firstName: string,
  reference: string,
  service: string,
  addons: string[],
  counselEmail: string,
): string {
  const hasRush = addons.includes('rush-delivery');
  const hasAudio = addons.includes('audio-reflection');

  // --- Package block ---
  const packages: Record<string, string> = {
    'single-inquiry':
      'You have chosen <strong style="color: #2C3E33;">The Single Inquiry</strong>. We will explore <strong>1 specific situation</strong>. I will return to you with a comprehensive, essay-style reflection designed to offer <strong>deep clarity</strong> and a <strong>shift in perspective</strong>.',
    'three-letter-series':
      'You have chosen <strong style="color: #2C3E33;">The 3-Letter Series</strong>. Over the next <strong>60 days</strong>, we will have <strong>3 full exchanges</strong>. This is a short arc of sustained correspondence. It allows you to reflect, apply insights, and write back as your situation evolves. You may use your letters <strong>at your own pace</strong>.',
    'monthly-rhythm':
      'You have joined <strong style="color: #2C3E33;">The Monthly Rhythm</strong>. I am deeply honored to be one of the <strong>8 people</strong> holding this space for you this month. We will establish a steady, quiet accountability through our weekly deep-dives and mid-week check-ins. This will accompany you through your daily integration <strong>without the friction of live calls</strong>.',
  };
  const packageBlock = packages[service] || '';

  // --- Add-on blocks ---
  let addonBlock = '';
  if (hasRush) {
    addonBlock += '<p style="margin: 0 0 0.75rem 0;">I also see you have chosen the <strong>24-Hour Rush Delivery</strong>. I will make your words my immediate priority to ensure your response is delivered <strong>swiftly</strong>.</p>';
  }
  if (hasAudio) {
    addonBlock += '<p style="margin: 0 0 0.75rem 0;">You have also included the <strong>Audio Voice Reflection</strong>. Alongside my written words, you will hear my voice in a <strong>5-7 minute personalized memo</strong> with each response. This offers another layer of <strong>nuance and care</strong>.</p>';
  }

  // --- Timeline/cadence block ---
  let timelineBlock = '';
  if (service === 'monthly-rhythm') {
    const monday = nextMonday();
    timelineBlock = `<p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #999; margin: 0 0 0.35rem 0;">How our rhythm works</p>
<p style="margin: 0 0 0.75rem 0;">Each week, we will have <strong>two touchpoints</strong>.</p>
<p style="margin: 0 0 0.75rem 0;">On <strong>Monday</strong>, write to <a href="mailto:${counselEmail}" style="color: #2C3E33;">${counselEmail}</a> with ${reference} in the subject line. Share your core context for the week. I will return your comprehensive response on <strong>Wednesday</strong>.</p>
<p style="margin: 0 0 0.75rem 0;">On <strong>Friday</strong>, send a brief note to the same address sharing how you are integrating the insights. I will return a focused response on <strong>Saturday</strong> to keep you aligned for the weekend.</p>
<p style="margin: 0 0 0 0;">Your first Monday deep-dive begins on <strong>${monday}</strong>.</p>`;
  } else if (hasRush) {
    timelineBlock = `<p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #999; margin: 0 0 0.35rem 0;">When you will hear back</p>
<p style="margin: 0 0 0 0;">Because you chose the 24-hour option, I will prioritize your inquiry and return your custom response within <strong>24 hours</strong> of receiving your email.</p>`;
  } else {
    timelineBlock = `<p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #999; margin: 0 0 0.35rem 0;">When you will hear back</p>
<p style="margin: 0 0 0 0;">I will sit with your words and return to you with your custom response within <strong>3 business days</strong>. Take your time writing. I will take my time reflecting.</p>`;
  }

  const nameGreeting = firstName ? `${firstName},` : '';

  return `<!DOCTYPE html>
<html>
<body style="font-family: Georgia, 'Times New Roman', serif; max-width: 580px; margin: 0 auto; padding: 2.5rem 2rem; color: #1A1A1A; background: #F9F8F6; line-height: 1.75;">

  <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.14em; color: #999; margin: 0 0 2rem 0;">Stilled.</p>

  <p style="font-size: 16px; margin: 0 0 1.25rem 0;">${nameGreeting}</p>

  <p style="font-size: 16px; margin: 0 0 1.25rem 0;">Thank you for trusting me with your thoughts. Your payment is received, and your inquiry is now open.</p>

  <p style="margin: 0 0 0.75rem 0;">${packageBlock}</p>
  ${addonBlock ? addonBlock + '\n' : ''}
  <div style="background: #FFFFFF; border: 1px solid #E5E5E5; border-radius: 4px; padding: 1.5rem; margin: 1.75rem 0;">

    <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #999; margin: 0 0 0.35rem 0;">Order Reference</p>
    <p style="font-family: 'Courier New', monospace; font-size: 14px; color: #2C3E33; margin: 0 0 1.25rem 0; word-break: break-all;">${reference}</p>

    <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #999; margin: 0 0 0.35rem 0;">How to begin</p>
    <p style="margin: 0 0 0.75rem 0;">There is no rush. <strong>Take a breath.</strong> When you feel ready, write to <a href="mailto:${counselEmail}" style="color: #2C3E33; text-decoration: underline;">${counselEmail}</a>.</p>
    <p style="margin: 0 0 0.75rem 0;">To keep our space organized, please put your reference number <strong>(${reference})</strong> in the subject line of your email.</p>
    <p style="margin: 0 0 0.75rem 0;">In the body of the message, please share:</p>
    <ul style="margin: 0 0 1.25rem 0; padding-left: 1.5rem;">
      <li>The <strong>context</strong> of your situation (up to 750 words, or as much as feels right).</li>
      <li>Up to <strong>3 specific questions</strong> you would like us to explore.</li>
    </ul>

    ${timelineBlock}

  </div>

  <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #999; margin: 2rem 0 0.35rem 0;">A quiet note before you write</p>
  <p style="margin: 0 0 0.75rem 0;">I want you to feel <strong>secure</strong> in what you are stepping into. I have spent over <strong>5 years</strong> and more than <strong>10,000 hours</strong> immersed in this work. I do not follow a single path or repeat one teacher's framework. I have studied multiple traditions of manifestation and tested their principles exhaustively. I understand the underlying mechanics with the <strong>precision of a science</strong> and the <strong>depth of a lived practice</strong>.</p>
  <p style="margin: 0 0 0.75rem 0;">What you receive from me is not surface encouragement or recycled advice. It is a response shaped by a deep, tested understanding of what <strong>actually creates shift</strong>, and what does not. You are in <strong>careful hands</strong>.</p>
  <p style="margin: 0 0 0.75rem 0;">This is a quiet, private correspondence between you and one person. Your inquiry will be read <strong>slowly</strong> and held with <strong>care</strong>. The response you receive will be written with the same depth of attention you brought to the asking. <strong>The quality of the answer should honor the courage it took to ask.</strong></p>
  <p style="margin: 0 0 1.75rem 0;">If you have any questions before you send your inquiry, simply reply to this email. <strong>I am here.</strong></p>

  <p style="margin: 0 0 0.25rem 0;">ness,</p>

  <div style="background: #FFF; display: inline-block; padding: 0.5rem 0.75rem; border-radius: 2px; margin: 0 0 1rem 0;"><img src="https://stilled.page/signature.png" alt="ness" style="width: 140px; height: auto; display: block;" /></div>

  <p style="font-size: 15px; margin: 1rem 0 0 0; color: #1A1A1A;">Stilled.</p>

</body>
</html>`;
}

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
    console.log('[EMAIL] No RESEND_API_KEY set -- skipping email to', customerEmail);
    return;
  }

  const firstName = customerName ? customerName.split(' ')[0] : '';
  const reference = sessionId.replace('cs_', '').slice(0, 14);
  const svcName = SERVICE_NAMES[service] || service;

  const html = buildEmailHtml(firstName, reference, service, addons, counselEmail);

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Stilled. <noreply@stilled.page>',
        to: [customerEmail],
        subject: `Your order instructions (Ref: ${reference})`,
        html,
      }),
    });

    if (!resp.ok) {
      console.error('[EMAIL] Failed to send:', await resp.text());
    } else {
      console.log(`[EMAIL] Sent confirmation to ${customerEmail} for ${svcName}`);
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
