/**
 * Shared payment log — Cloudflare KV.
 * In local dev, wrangler provides a preview KV namespace automatically.
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

export async function getAllPayments(kv?: KVNamespace): Promise<PaymentEntry[]> {
  if (!kv) return [];
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

export async function writePayment(entry: PaymentEntry, kv?: KVNamespace): Promise<void> {
  if (!kv) {
    console.log('[PAYMENT LOG] No KV — payment not persisted:', entry.id);
    return;
  }
  await kv.put(`${KV_PREFIX}${entry.id}`, JSON.stringify(entry));
  console.log(`[PAYMENT LOG] ${entry.customerEmail} — ${entry.service} — $${(entry.amountTotal / 100).toFixed(2)}`);
}

export async function getRevenueSummary(kv?: KVNamespace): Promise<{
  totalRevenue: number;
  totalPayments: number;
  byService: Record<string, { count: number; revenue: number }>;
}> {
  const payments = await getAllPayments(kv);
  const byService: Record<string, { count: number; revenue: number }> = {};

  let totalRevenue = 0;
  let totalPayments = 0;
  for (const p of payments) {
    if (p.paymentStatus !== 'paid') continue;
    totalRevenue += p.amountTotal;
    totalPayments++;
    if (!byService[p.service]) byService[p.service] = { count: 0, revenue: 0 };
    byService[p.service].count++;
    byService[p.service].revenue += p.amountTotal;
  }

  return { totalRevenue, totalPayments, byService };
}
