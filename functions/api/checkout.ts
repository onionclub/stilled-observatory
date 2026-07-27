/**
 * POST /api/checkout
 * Creates a Stripe Checkout Session and returns the URL for redirect.
 *
 * Body: { service: "single-inquiry" | "three-letter-series" | "monthly-rhythm",
 *         addons?: ["rush-delivery" | "audio-reflection"] }
 */

interface Env {
  STRIPE_SECRET_KEY: string;
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
  const successUrl = `${origin}/counsel/confirmed?session_id={CHECKOUT_SESSION_ID}&service=${encodeURIComponent(service)}`;
  const cancelUrl = `${origin}/counsel`;

  // Build form-encoded body (Stripe requires this content type)
  const params = new URLSearchParams();
  params.append('mode', svc.mode);
  params.append('success_url', successUrl);
  params.append('cancel_url', cancelUrl);
  params.append('metadata[service]', service);
  params.append('metadata[addons]', validAddons.join(','));

  lineItems.forEach((item, i) => {
    params.append(`line_items[${i}][price_data][currency]`, 'usd');
    params.append(`line_items[${i}][price_data][product_data][name]`, item.price_data.product_data.name);
    if (item.price_data.product_data.description) {
      params.append(`line_items[${i}][price_data][product_data][description]`, item.price_data.product_data.description);
    }
    params.append(`line_items[${i}][price_data][product_data][tax_code]`, 'txcd_10000000');
    params.append(`line_items[${i}][price_data][unit_amount]`, String(item.price_data.unit_amount));
    params.append(`line_items[${i}][quantity]`, String(item.quantity));
    if (item.price_data.recurring?.interval) {
      params.append(`line_items[${i}][price_data][recurring][interval]`, item.price_data.recurring.interval);
    }
  });

  if (svc.mode === 'subscription') {
    params.append('subscription_data[metadata][service]', service);
  }

  const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
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
