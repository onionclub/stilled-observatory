// src/utils/ping.ts

export type SyncStatus = 'Live' | 'Stale' | 'Unavailable';

export interface PingResult {
    source: string;
    status: SyncStatus;
    lastSyncLabel: string;
    lastSyncDate: Date | null;
}

/**
 * Normalizes a date into the required status tier.
 * Live: < 5 minutes ago
 * Stale: > 5 minutes ago, < 24 hours ago
 * Unavailable: > 24 hours ago, or null/error
 */
function evaluateStatus(lastSync: Date | null): SyncStatus {
    if (!lastSync) return 'Unavailable';

    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();

    const fiveMinutesMs = 5 * 60 * 1000;
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;

    if (diffMs < fiveMinutesMs) return 'Live';
    if (diffMs < twentyFourHoursMs) return 'Stale';
    return 'Unavailable';
}

function formatSyncLabel(status: SyncStatus, lastSync: Date | null): string {
    if (status === 'Unavailable' || !lastSync) return 'Unavailable';

    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();

    if (diffMs < 60 * 1000) return 'Just now';

    const diffMins = Math.floor(diffMs / (60 * 1000));
    if (diffMins < 60) return `${diffMins} min ago`;

    const diffHrs = Math.floor(diffMs / (60 * 60 * 1000));
    if (diffHrs < 24) return `${diffHrs} hr ago`;

    return 'Unavailable';
}

export async function pingIntelligenceSources(): Promise<PingResult[]> {
    // Server-side mock pings for each API implementation
    // In production: perform lightweight HEAD/GET checks or read last-sync timestamps from cache/DB

    // Simulate realistic sync states based on typical webhook/polling setups:
    // Plausible & Scroll: Live (pinged often)
    // Ghost: Live (webhook based)
    // YouTube: Stale (batch sync every few hours)

    const now = new Date();
    const ghostSync = new Date(now.getTime() - (2 * 60 * 1000)); // 2 mins ago
    const plausibleSync = new Date(now.getTime() - (30 * 1000)); // 30 secs ago
    const scrollSync = new Date(now.getTime() - (4 * 60 * 1000)); // 4 mins ago
    const ytSync = new Date(now.getTime() - (8 * 60 * 60 * 1000)); // 8 hours ago

    const sources = [
        { name: 'Ghost CMS', date: ghostSync },
        { name: 'Plausible Analytics', date: plausibleSync },
        { name: 'YouTube Analytics API', date: ytSync },
        { name: 'Scroll tracking script', date: scrollSync }
    ];

    return sources.map(src => {
        const status = evaluateStatus(src.date);
        return {
            source: src.name,
            status,
            lastSyncLabel: formatSyncLabel(status, src.date),
            lastSyncDate: src.date
        };
    });
}