/**
 * POST /api/checkout
 * Creates a Stripe Checkout Session and returns the URL for redirect.
 *
 * Body: { service: "single-inquiry" | "three-letter-series" | "monthly-rhythm",
 *         addons?: ["rush-delivery" | "audio-reflection"] }
 */

interface Env {
  STRIPE_SECRET_KEY: string;
  PAYMENT_LOG?: KVNamespace;
}

// Service definitions — price in cents, name, description
const CATALOG: Record<string, {
  name: string;
  amount: number;
  description: string;
  mode: 'payment' | 'subscription';
}> = {
  'single-inquiry': {
    name: 'The Single Inquiry',
    amount: 9700,
    description: 'One written consultation — 1 exchange, 1 response.',
    mode: 'payment',
  },
  'three-letter-series': {
    name: 'The 3-Letter Series',
    amount: 21700,
    description: 'Three written exchanges over 60 days.',
    mode: 'payment',
  },
  'monthly-rhythm': {
    name: 'The Monthly Rhythm',
    amount: 39700,
    description: 'Weekly deep-dive letters + mid-week check-ins. Recurring monthly.',
    mode: 'subscription',
  },
};

const ADDONS: Record<string, { name: string; amount: number }> = {
  'rush-delivery': { name: '24-Hour Rush Delivery', amount: 6700 },
  'audio-reflection': { name: 'Audio Voice Reflection', amount: 4700 },
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const origin = new URL(request.url).origin;

  if (!env.STRIPE_SECRET_KEY) {
    return new Response(JSON.stringify({ error: 'Payment service not configured.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { service?: string; addons?: string[] };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { service, addons = [] } = body;

  if (!service || !CATALOG[service]) {
    return new Response(JSON.stringify({ error: 'Invalid service selected.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const svc = CATALOG[service];

  // Validate add-ons
  const validAddons = addons.filter(a => ADDONS[a]);
  if (addons.length !== validAddons.length) {
    return new Response(JSON.stringify({ error: 'Invalid add-on selected.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Build line items
  const lineItems: Array<{
    price_data: {
      currency: string;
      product_data: { name: string; description?: string };
      unit_amount: number;
      recurring?: { interval: 'month' };
    };
    quantity: number;
  }> = [
    {
      price_data: {
        currency: 'usd',
        product_data: { name: svc.name, description: svc.description },
        unit_amount: svc.amount,
        ...(svc.mode === 'subscription' ? { recurring: { interval: 'month' as const } } : {}),
      },
      quantity: 1,
    },
  ];

  for (const a of validAddons) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: ADDONS[a].name },
        unit_amount: ADDONS[a].amount,
      },
      quantity: 1,
    });
  }

  // Determine success/cancel URLs
  const successUrl = `${origin}/counsel/confirmed?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/counsel`;

  // Create Stripe Checkout Session
  const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      mode: svc.mode,
      line_items: JSON.stringify(lineItems.map(li => ({
        price_data: li.price_data,
        quantity: li.quantity,
      }))),
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: JSON.stringify({
        service,
        addons: validAddons.join(','),
      }),
      ...(svc.mode === 'subscription'
        ? { subscription_data: JSON.stringify({ metadata: { service } }) }
        : {}),
      payment_intent_data: JSON.stringify({
        metadata: { service, addons: validAddons.join(',') },
      }),
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error('Stripe error:', err);
    return new Response(JSON.stringify({ error: 'Could not create checkout session.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const session = await resp.json() as { url: string; id: string };
  return new Response(JSON.stringify({ url: session.url }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
