/**
 * GET /api/admin/payments?key=ADMIN_KEY
 * Returns all payment log entries. Protected by ADMIN_KEY.
 */

import { getAllPayments, getRevenueSummary } from '../../_shared/payment-log';

interface Env {
  ADMIN_KEY: string;
  PAYMENT_LOG?: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const providedKey = url.searchParams.get('key');

  const adminKey = env.ADMIN_KEY || 'stilled-local-dev';
  if (providedKey !== adminKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const [payments, summary] = await Promise.all([
    getAllPayments(env.PAYMENT_LOG),
    getRevenueSummary(env.PAYMENT_LOG),
  ]);

  return new Response(JSON.stringify({ payments, summary }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });
};
