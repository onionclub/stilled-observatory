// src/utils/metrics.ts

// Calculates the STILLED Resonance Index based on Phase 3 Specifications
// Composite score from four equal-weight signals: scroll depth, average read time, return visit rate, subscriber conversion.

export interface SignalData {
    essaySlug: string;
    title: string;
    scrollDepthPercent: number; // 0-100
    averageReadTimeSeconds: number; // raw seconds
    returnVisitRatePercent: number; // 0-100
    newSubscribersAssisted: number; // count
}

export interface ResonanceResult {
    essaySlug: string;
    title: string;
    compositeScore: number; // 0-100 scaled
    dominantTag: 'DEEP READING' | 'RETURN VISITS' | 'CONVERSION';
}

function normalize(value: number, min: number, max: number): number {
    if (max === min) return 0;
    const normalized = (value - min) / (max - min);
    return Math.max(0, Math.min(1, normalized));
}

// Logic: Calculate Resonance Index using actual logic but placeholder data
export async function getResonanceIndexData(): Promise<ResonanceResult[]> {
    // 1. Placeholder raw data matching Plausible + Ghost cross-referencing
    const placeholderData: SignalData[] = [
        { essaySlug: 'architecture-of-meaning', title: 'The Architecture of Meaning', scrollDepthPercent: 88, averageReadTimeSeconds: 550, returnVisitRatePercent: 42, newSubscribersAssisted: 14 },
        { essaySlug: 'navigating-liminal-time', title: 'Navigating Liminal Time', scrollDepthPercent: 65, averageReadTimeSeconds: 300, returnVisitRatePercent: 81, newSubscribersAssisted: 3 },
        { essaySlug: 'void-of-absolute', title: 'The Void of the Absolute', scrollDepthPercent: 45, averageReadTimeSeconds: 180, returnVisitRatePercent: 20, newSubscribersAssisted: 28 },
        { essaySlug: 'mechanisms-of-self-dissolution', title: 'Mechanisms of Self-Dissolution', scrollDepthPercent: 92, averageReadTimeSeconds: 610, returnVisitRatePercent: 35, newSubscribersAssisted: 5 },
        { essaySlug: 'tyranny-of-coherence', title: 'On the Tyranny of Coherence', scrollDepthPercent: 55, averageReadTimeSeconds: 210, returnVisitRatePercent: 58, newSubscribersAssisted: 8 }
    ];

    if (placeholderData.length === 0) return [];

    // 2. Normalize components across the set to create comparable ranges (0 to 1)
    const maxScroll = Math.max(...placeholderData.map(d => d.scrollDepthPercent));
    const maxTime = Math.max(...placeholderData.map(d => d.averageReadTimeSeconds));
    const maxReturn = Math.max(...placeholderData.map(d => d.returnVisitRatePercent));
    const maxSub = Math.max(...placeholderData.map(d => d.newSubscribersAssisted));

    return placeholderData.map(data => {
        const normScroll = normalize(data.scrollDepthPercent, 0, maxScroll);
        const normTime = normalize(data.averageReadTimeSeconds, 0, maxTime);
        const normReturn = normalize(data.returnVisitRatePercent, 0, maxReturn);
        const normSub = normalize(data.newSubscribersAssisted, 0, maxSub);

        // 3. Four equal-weight signals for composite score
        const compositeScore = Math.round(((normScroll + normTime + normReturn + normSub) / 4) * 100);

        // 4. Qualitative tag logic
        // DEEP READING (scroll + time dominant), RETURN VISITS (return rate dominant), CONVERSION (subscriber dominant)
        const deepReadingStrength = (normScroll + normTime) / 2;
        const returnVisitsStrength = normReturn;
        const conversionStrength = normSub;

        let dominantTag: ResonanceResult['dominantTag'] = 'DEEP READING';
        let maxStrength = deepReadingStrength;

        if (returnVisitsStrength > maxStrength) {
            maxStrength = returnVisitsStrength;
            dominantTag = 'RETURN VISITS';
        }

        if (conversionStrength > maxStrength) {
            maxStrength = conversionStrength;
            dominantTag = 'CONVERSION';
        }

        return {
            essaySlug: data.essaySlug,
            title: data.title,
            compositeScore,
            dominantTag
        };
    }).sort((a, b) => b.compositeScore - a.compositeScore); // Rank by composite score
}

// -------------------------------------------------------------
// PHASE 5 LOGIC: Zone 1 (AI Situational Brief)
// -------------------------------------------------------------

export async function getAiSituationalBrief(): Promise<string> {
    const activeEvents = await getConvergenceEvents();
    const baselineData = await getBaselineEngineData();
    const resonanceData = await getResonanceIndexData();

    // Fallback static compilation logic
    const buildFallback = () => {
        // Ghost data mock (would fetch recent published posts from Admin API)
        const recentPostsCount = 1;
        const subscriberDelta = 23;

        // Read depth mock (from Resonance / Audience Depth mock)
        const topEssay = 'The Architecture of Meaning';
        const topEssayBaselineMult = 2.4;

        // YouTube mock (from YouTube Intelligence mock)
        const videoFirstPercent = 67;

        let sentences = [];

        // Sentence 1: What published / Baseline
        if (recentPostsCount > 0) {
            sentences.push(`The most recent published piece, "${topEssay}", is performing ${topEssayBaselineMult}× above the 30-day baseline for read depth.`);
        } else {
            sentences.push('No new pieces were published this week.');
        }

        // Sentence 2: YouTube / Traffic
        if (videoFirstPercent > 50) {
            sentences.push(`Traffic is arriving primarily from YouTube, with ${videoFirstPercent}% of this week's ${subscriberDelta} new subscribers discovering Stilled through video first.`);
        } else {
            sentences.push(`Direct traffic remains the primary acquisition channel, converting ${subscriberDelta} new subscribers.`);
        }

        // Sentence 3: Scroll tracking / Events
        if (activeEvents.length > 0) {
            sentences.push(`A convergence event is currently active for "${activeEvents[0].title}", triggered by: ${activeEvents[0].signals.toLowerCase()}.`);
        } else {
            const surgingEssay = baselineData.find(b => b.label === 'ABOVE BASELINE');
            if (surgingEssay) {
                sentences.push(`Read depth data shows a notable spike for "${surgingEssay.title}", pushing it above your personal baseline.`);
            }
        }

        return sentences.join(' ');
    };

    try {
        const apiKey = import.meta.env.OPENROUTER_API_KEY;
        if (!apiKey) return buildFallback();

        const model = import.meta.env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.3-70b-instruct:free';

        // Prepare data context payload for the LLM
        const contextPayload = {
            recentPublications: [
                { title: 'The Architecture of Meaning', depthMultiplier: 2.4 }
            ],
            aboveBaseline: baselineData.filter(b => b.label === 'ABOVE BASELINE').map(b => b.title),
            activeConvergenceEvents: activeEvents.map(e => ({ title: e.title, signals: e.signals })),
            topResonanceEssay: resonanceData.length > 0 ? resonanceData[0].title : 'None'
        };

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are the intelligence engine for a private publishing dashboard called The Observatory. Your output is a field report, not an assistant response. Write 3 to 5 plain declarative sentences about the current state of the publishing data provided. No headers. No bullets. No markdown. No motivational language. No praise. No second-person address. If nothing is notable, say so directly in one sentence. Analyst tone only. Forensic and precise.'
                    },
                    {
                        role: 'user',
                        content: `Data context for field report: ${JSON.stringify(contextPayload, null, 2)}`
                    }
                ]
            })
        });

        if (!response.ok) {
            return buildFallback();
        }

        const json = await response.json();

        if (json.choices && json.choices.length > 0 && json.choices[0].message) {
            return json.choices[0].message.content.trim();
        }

        return buildFallback();
    } catch (error) {
        return buildFallback();
    }
}

// -------------------------------------------------------------
// PHASE 4 LOGIC: Zone 3 & Zone 4
// -------------------------------------------------------------

export interface BaselineResult {
    title: string;
    readTimeMetric: string; // e.g. "9.2m read time"
    zScore: number;
    label: 'ABOVE BASELINE' | 'WITHIN RANGE' | 'BELOW BASELINE';
}

function calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
}

function calculateStdDev(values: number[], mean: number): number {
    if (values.length < 2) return 0;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (values.length - 1);
    return Math.sqrt(variance);
}

export async function getBaselineEngineData(): Promise<BaselineResult[]> {
    const resonancePoints = await getResonanceIndexData();
    if (resonancePoints.length === 0) return [];

    // The specification dictates comparison against "personal historical average for this format/day". 
    // In the placeholder logic, we use the Resonance Index composite scores to represent the historical pool.
    const historicalScores = resonancePoints.map(r => r.compositeScore);
    const mean = calculateMean(historicalScores);
    const stdDev = calculateStdDev(historicalScores, mean);

    // Provide the top 3 items for the Baseline Engine UI display (similar to mockup)
    // using the first three for variance demonstration.
    const demoItems = resonancePoints.slice(0, 3).map((item, index) => {
        // Z-score formula: (Value - Mean) / Standard Deviation
        // Handle 0 stdDev fallback gracefully
        const zScore = stdDev === 0 ? 0 : (item.compositeScore - mean) / stdDev;

        let label: BaselineResult['label'] = 'WITHIN RANGE';
        if (zScore > 1.0) label = 'ABOVE BASELINE';
        if (zScore < -1.0) label = 'BELOW BASELINE';

        // Mock read time mapping to matching UI string (converting proxy seconds for display)
        const mockSeconds = [550, 384, 186][index % 3];
        const minutes = Number((mockSeconds / 60).toFixed(1));

        return {
            title: item.title,
            readTimeMetric: `${minutes}m read time`,
            zScore,
            label
        };
    });

    return demoItems;
}

// -------------------------------------------------------------
// PHASE 4 LOGIC: Zone 4 (Convergence Events)
// -------------------------------------------------------------

export interface ConvergenceEvent {
    title: string;
    signals: string; // e.g. "Scroll depth + Return visits + Newsletter click"
    windowStr: string; // Must strictly be "Within 48 hours"
    verdict: string;   // Forensic assessment
}

export async function getConvergenceEvents(): Promise<ConvergenceEvent[]> {
    // In production:
    // 1. Fetch 30-day historical trailing means for all 4 primary signals (Scroll, Return, Newsletter Link, Subs)
    // 2. Identify spikes (current signal > mean + 1stdev) 
    // 3. Count concurrent spikes occurring within a rolling 48-hour timestamp window
    // 4. If count >= 3, flag as Convergence Event

    // For structural build layout validation, we implement the strictly aligned placeholders
    // passing the logic constraints established in the Phase 4 spec (e.g. strict window string limit).

    // TODO: Phase 5 - Replace hardcoded editorial copy like "This piece landed." 
    // with dynamically generated forensic strings based on actual event data and logic.

    return [
        {
            title: 'Navigating Liminal Time',
            signals: 'Scroll depth + Return visits + Newsletter click',
            windowStr: 'Within 48 hours',
            verdict: 'This piece landed.'
        },
        {
            title: 'Mechanisms of Self-Dissolution',
            signals: 'Direct sharing + Academic paper download spike',
            windowStr: 'Within 48 hours',
            verdict: 'Strong academic resonance.'
        }
    ];
}


// -------------------------------------------------------------
// PHASE 4 LOGIC: Zone 9 (Audience Depth Index)
// -------------------------------------------------------------

export interface AudienceTier {
    id: number;
    label: string; // e.g. "Tier 1: 1 essay read"
    count: number;
    percentage: number;
    isImmersed: boolean;
}

export interface ArchetypeData {
    avgEssaysBeforeSub: number;
    avgDaysToSub: number;
    discoveryPath: string;
    mostCommonEntry: string;
    tierSize: number;
}

export interface AudienceDepthIndex {
    tiers: AudienceTier[];
    archetype: ArchetypeData;
}

export async function getAudienceDepthData(): Promise<AudienceDepthIndex> {
    // In production, this aggregates actual Ghost member reading history to group
    // subscribers/users into read-volume tiers.
    // Query constraint: All member queries must append &filter=email:-scratchpad@stilled.xyz

    return {
        tiers: [
            { id: 1, label: "Tier 1: 1 essay read", count: 847, percentage: 100, isImmersed: false },
            { id: 2, label: "Tier 2: 2–5 essays read", count: 203, percentage: 24, isImmersed: false },
            { id: 3, label: "Tier 3: 6–10 essays read", count: 67, percentage: 8, isImmersed: false },
            { id: 4, label: "Tier 4: 10+ essays read", count: 31, percentage: 4, isImmersed: true }
        ],
        archetype: {
            avgEssaysBeforeSub: 4.2,
            avgDaysToSub: 11,
            discoveryPath: "71% YouTube first",
            mostCommonEntry: "The Architecture of Meaning",
            tierSize: 31
        }
    };
}


// -------------------------------------------------------------
// PHASE 4 LOGIC: Zone 10 (Intellectual Proximity Layer)
// -------------------------------------------------------------

export interface ProximityNode {
    sourceTitle: string;
    destinationTitle: string;
    frequencyCount: number;
}

export async function getIntellectualProximityData(): Promise<ProximityNode[]> {
    // In production, this aggregates session-level click tracking and referrer data 
    // to map what other essays or external domains users visit before/after reading.

    const nodes: ProximityNode[] = [
        {
            sourceTitle: 'The Architecture of Meaning',
            destinationTitle: 'The Void of the Absolute',
            frequencyCount: 84
        },
        {
            sourceTitle: 'The Architecture of Meaning',
            destinationTitle: 'Navigating Liminal Time',
            frequencyCount: 76
        },
        {
            sourceTitle: 'Navigating Liminal Time',
            destinationTitle: 'Against Method',
            frequencyCount: 68
        },
        {
            sourceTitle: 'The Void of the Absolute',
            destinationTitle: 'The Order of Time',
            frequencyCount: 61
        },
        {
            sourceTitle: 'Mechanisms of Self-Dissolution',
            destinationTitle: 'On the Tyranny of Coherence',
            frequencyCount: 55
        }
    ];

    return nodes.sort((a, b) => b.frequencyCount - a.frequencyCount);
}


