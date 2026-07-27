/**
 * Shared payment log — KV in production, JSON file in local dev.
 */

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

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
const LOCAL_DB_PATH = join(process.cwd(), '.local-payment-log.json');

function readLocalDb(): PaymentEntry[] {
  try {
    if (!existsSync(LOCAL_DB_PATH)) return [];
    const raw = readFileSync(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeLocalDb(entries: PaymentEntry[]): void {
  try {
    writeFileSync(LOCAL_DB_PATH, JSON.stringify(entries, null, 2), 'utf-8');
  } catch {
    console.error('[PAYMENT LOG] Failed to write local DB');
  }
}

export async function getAllPayments(kv?: KVNamespace): Promise<PaymentEntry[]> {
  if (kv) {
    const list = await kv.list({ prefix: KV_PREFIX });
    const entries: PaymentEntry[] = [];
    for (const key of list.keys) {
      const raw = await kv.get(key.name);
      if (raw) {
        try { entries.push(JSON.parse(raw)); } catch { /* skip */ }
      }
    }
    return entries.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
  }

  return readLocalDb().sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
}

export async function writePayment(entry: PaymentEntry, kv?: KVNamespace): Promise<void> {
  if (kv) {
    await kv.put(`${KV_PREFIX}${entry.id}`, JSON.stringify(entry));
    return;
  }

  const db = readLocalDb();
  const idx = db.findIndex(e => e.id === entry.id);
  if (idx >= 0) {
    db[idx] = entry;
  } else {
    db.push(entry);
  }
  writeLocalDb(db);
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
