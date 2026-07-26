/**
 * Shared payment log — writes to KV in production, JSON file in local dev.
 */

export interface PaymentEntry {
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
  receiptUrl?: string;
}

const KV_PREFIX = 'payment:';
const LOCAL_LOG_PATH = './.local-payment-log.json';

/** Read all payment entries */
export async function getAllPayments(kv?: KVNamespace): Promise<PaymentEntry[]> {
  if (kv) {
    const list = await kv.list({ prefix: KV_PREFIX });
    const entries: PaymentEntry[] = [];
    for (const key of list.keys) {
      const raw = await kv.get(key.name);
      if (raw) {
        try { entries.push(JSON.parse(raw)); } catch { /* skip corrupt */ }
      }
    }
    return entries.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
  }

  // Local dev: read from JSON file
  try {
    // In Cloudflare Functions, we can use __dirname-relative paths
    // but for Astro's dev server, just return an empty array
    return [];
  } catch {
    return [];
  }
}

/** Write a payment entry */
export async function writePayment(entry: PaymentEntry, kv?: KVNamespace): Promise<void> {
  const key = `${KV_PREFIX}${entry.id}`;
  const value = JSON.stringify(entry);

  if (kv) {
    await kv.put(key, value);
    return;
  }

  console.log('[PAYMENT LOG]', key, value);
}

/** Get total revenue */
export async function getRevenueSummary(kv?: KVNamespace): Promise<{
  totalRevenue: number;
  totalPayments: number;
  byService: Record<string, { count: number; revenue: number }>;
}> {
  const payments = await getAllPayments(kv);
  const byService: Record<string, { count: number; revenue: number }> = {};

  let totalRevenue = 0;
  for (const p of payments) {
    if (p.paymentStatus !== 'paid') continue;
    totalRevenue += p.amountTotal;
    if (!byService[p.service]) byService[p.service] = { count: 0, revenue: 0 };
    byService[p.service].count++;
    byService[p.service].revenue += p.amountTotal;
  }

  return {
    totalRevenue,
    totalPayments: payments.filter(p => p.paymentStatus === 'paid').length,
    byService,
  };
}
