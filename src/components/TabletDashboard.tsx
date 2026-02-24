import type { Domain, Goal, Task } from '../store/useStore';
import { calculateCost } from '../utils/plannerUtils';

interface TabletDashboardProps {
    goals: Goal[];
    tasks: Task[];
    theme?: string; // kept for API compatibility, no longer rendered
    isDark?: boolean;
}

const DOMAINS: Domain[] = [
    '工作事业', '学习成长', '身体健康', '财务理财',
    '家庭生活', '人际社群', '体验突破', '休闲娱乐'
];

const DOMAIN_SHORT: Record<Domain, string> = {
    '学习成长': '学习', '体验突破': '体验', '休闲娱乐': '休闲', '工作事业': '事业',
    '家庭生活': '家庭', '身体健康': '健康', '财务理财': '财富', '人际社群': '人际',
};

const DOMAIN_COLORS: Record<string, { solid: string; bar: string }> = {
    '事业': { solid: '#38bdf8', bar: 'linear-gradient(90deg,#38bdf8,#0ea5e9)' },
    '学习': { solid: '#818cf8', bar: 'linear-gradient(90deg,#818cf8,#6366f1)' },
    '健康': { solid: '#4ade80', bar: 'linear-gradient(90deg,#4ade80,#22c55e)' },
    '财富': { solid: '#facc15', bar: 'linear-gradient(90deg,#facc15,#eab308)' },
    '家庭': { solid: '#fb7185', bar: 'linear-gradient(90deg,#fb7185,#f43f5e)' },
    '人际': { solid: '#22d3ee', bar: 'linear-gradient(90deg,#22d3ee,#06b6d4)' },
    '体验': { solid: '#fb923c', bar: 'linear-gradient(90deg,#fb923c,#f97316)' },
    '休闲': { solid: '#a78bfa', bar: 'linear-gradient(90deg,#a78bfa,#8b5cf6)' },
};

// Light mode colors
const DOMAIN_COLORS_LIGHT: Record<string, { solid: string; bar: string }> = {
    '事业': { solid: '#0284c7', bar: 'linear-gradient(90deg,#0284c7,#0369a1)' },
    '学习': { solid: '#4f46e5', bar: 'linear-gradient(90deg,#4f46e5,#4338ca)' },
    '健康': { solid: '#16a34a', bar: 'linear-gradient(90deg,#16a34a,#15803d)' },
    '财富': { solid: '#ca8a04', bar: 'linear-gradient(90deg,#ca8a04,#a16207)' },
    '家庭': { solid: '#e11d48', bar: 'linear-gradient(90deg,#e11d48,#be123c)' },
    '人际': { solid: '#0e7490', bar: 'linear-gradient(90deg,#0e7490,#0c5470)' },
    '体验': { solid: '#ea580c', bar: 'linear-gradient(90deg,#ea580c,#c2410c)' },
    '休闲': { solid: '#7c3aed', bar: 'linear-gradient(90deg,#7c3aed,#6d28d9)' },
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const QUARTER_LABELS = ['Q1', 'Q2', 'Q3', 'Q4'];

const YEAR_START_MS = new Date('2026-01-01').getTime();
const YEAR_END_MS = new Date('2026-12-31').getTime();
const YEAR_SPAN_MS = YEAR_END_MS - YEAR_START_MS;

function dateToPercent(dateStr: string): number {
    const ms = new Date(dateStr).getTime();
    return Math.max(0, Math.min(100, ((ms - YEAR_START_MS) / YEAR_SPAN_MS) * 100));
}

export default function TabletDashboard({ goals, tasks, isDark = true }: TabletDashboardProps) {
    const visibleTasks = tasks.filter(t => !t.hidden);

    const textMuted = isDark ? 'rgba(148,163,184,0.7)' : 'rgba(100,116,139,0.8)';
    const borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
    const gridLine = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
    const qLine = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const rowHover = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)';
    const COLORS = isDark ? DOMAIN_COLORS : DOMAIN_COLORS_LIGHT;

    // Today marker — hardcoded to 2026-02-24 per session
    const todayDateStr = '2026-02-24';
    const todayPct = dateToPercent(todayDateStr);

    // Domain hours for ordering
    const domainHours = DOMAINS.reduce((acc, domain) => {
        const dGoals = goals.filter(g => g.domain === domain);
        let total = 0;
        dGoals.forEach(g => {
            const gTasks = visibleTasks.filter(t => t.goalId === g.id);
            if (gTasks.length > 0) {
                gTasks.forEach(t => { total += calculateCost(t); });
            } else {
                total += calculateCost(g);
            }
        });
        acc[domain] = total;
        return acc;
    }, {} as Record<Domain, number>);

    const sortedDomains = [...DOMAINS].sort((a, b) => domainHours[b] - domainHours[a]);

    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            overflow: 'hidden',
        }}>



            {/* ── Grid area (sidebar + timeline) ──────────── */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                padding: '0 8px 8px 8px',
            }}>

                {/* ── Header row: quarter labels ─────────── */}
                <div style={{
                    display: 'flex',
                    flexShrink: 0,
                    marginBottom: '2px',
                }}>
                    {/* Sidebar spacer */}
                    <div style={{ width: '88px', flexShrink: 0 }} />
                    {/* Quarter labels */}
                    <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
                        {QUARTER_LABELS.map((q, i) => (
                            <div
                                key={q}
                                style={{
                                    flex: 1,
                                    textAlign: 'center',
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    color: textMuted,
                                    paddingBottom: '3px',
                                    borderLeft: i === 0 ? 'none' : `1px dashed ${qLine}`,
                                }}
                            >
                                {q}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Month labels ───────────────────────── */}
                <div style={{
                    display: 'flex',
                    flexShrink: 0,
                    marginBottom: '4px',
                }}>
                    <div style={{ width: '88px', flexShrink: 0 }} />
                    <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
                        {MONTH_LABELS.map((m) => (
                            <div
                                key={m}
                                style={{
                                    flex: 1,
                                    textAlign: 'center',
                                    fontSize: '8px',
                                    fontWeight: 600,
                                    color: textMuted,
                                    opacity: 0.7,
                                    borderLeft: `1px solid ${gridLine}`,
                                }}
                            >
                                {m}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Domain rows ────────────────────────── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px', overflow: 'hidden' }}>
                    {sortedDomains.map((domain, rowIdx) => {
                        const shortName = DOMAIN_SHORT[domain];
                        const colors = COLORS[shortName] || COLORS['学习'];
                        const hours = domainHours[domain];

                        const dGoals = goals.filter(g => g.domain === domain);
                        const dTasks = dGoals.flatMap(g => visibleTasks.filter(t => t.goalId === g.id));

                        // Goals used as fallback bars (no task decomposition)
                        const goalBars = dGoals.filter(g => {
                            const hasTask = visibleTasks.some(t => t.goalId === g.id);
                            return !hasTask && g.startDate && g.endDate;
                        });

                        // Stagger rows slightly for readability (2 tracks per domain)
                        const bars = dTasks.length > 0
                            ? dTasks.filter(t => t.startDate && t.endDate).map(t => ({
                                id: t.id,
                                title: t.title,
                                left: dateToPercent(t.startDate),
                                width: Math.max(dateToPercent(t.endDate) - dateToPercent(t.startDate), 1.5),
                            }))
                            : goalBars.map(g => ({
                                id: g.id,
                                title: g.title,
                                left: dateToPercent(g.startDate!),
                                width: Math.max(dateToPercent(g.endDate!) - dateToPercent(g.startDate!), 1.5),
                            }));

                        return (
                            <div
                                key={domain}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    flex: 1,
                                    minHeight: 0,
                                    background: rowIdx % 2 === 0 ? rowHover : 'transparent',
                                    borderRadius: '6px',
                                }}
                            >
                                {/* ── Left sidebar cell ── */}
                                <div style={{
                                    width: '88px',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    paddingLeft: '6px',
                                    paddingRight: '6px',
                                    height: '100%',
                                    borderRight: `1px solid ${borderColor}`,
                                }}>
                                    {/* Color swatch */}
                                    <div style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '3px',
                                        background: colors.solid,
                                        flexShrink: 0,
                                    }} />
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '10px',
                                            fontWeight: 800,
                                            color: colors.solid,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {domain}
                                        </div>
                                        <div style={{
                                            fontSize: '8px',
                                            fontWeight: 600,
                                            color: textMuted,
                                        }}>
                                            {hours > 0 ? `${Math.round(hours)}h` : '待规划'}
                                        </div>
                                    </div>
                                </div>

                                {/* ── Right timeline cell ── */}
                                <div style={{
                                    flex: 1,
                                    position: 'relative',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}>
                                    {/* Month grid lines */}
                                    {Array.from({ length: 11 }, (_, i) => (
                                        <div key={i} style={{
                                            position: 'absolute',
                                            top: 0,
                                            bottom: 0,
                                            width: '1px',
                                            left: `${((i + 1) / 12) * 100}%`,
                                            background: gridLine,
                                        }} />
                                    ))}

                                    {/* Quarter dividers (heavier) */}
                                    {[3, 6, 9].map(m => (
                                        <div key={m} style={{
                                            position: 'absolute',
                                            top: 0,
                                            bottom: 0,
                                            width: '1px',
                                            left: `${(m / 12) * 100}%`,
                                            background: qLine,
                                        }} />
                                    ))}

                                    {/* Today line */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '10%',
                                        bottom: '10%',
                                        width: '2px',
                                        borderRadius: '1px',
                                        left: `${todayPct}%`,
                                        background: '#f472b6',
                                        zIndex: 10,
                                    }} />

                                    {/* Gantt bars */}
                                    {bars.length === 0 && hours > 0 && (
                                        /* Whole-year placeholder bar */
                                        <div style={{
                                            position: 'absolute',
                                            left: '0%',
                                            width: '100%',
                                            height: '8px',
                                            borderRadius: '4px',
                                            background: colors.bar,
                                            opacity: 0.25,
                                        }} />
                                    )}

                                    {/* Actual task/goal bars - stacked rows to prevent overlap */}
                                    {bars.map((bar, bi) => {
                                        const trackH = '8px';
                                        // Simple 2-track stagger
                                        const topOffset = bi % 2 === 0 ? 'calc(50% - 10px)' : 'calc(50% + 2px)';
                                        return (
                                            <div
                                                key={bar.id}
                                                title={bar.title}
                                                style={{
                                                    position: 'absolute',
                                                    top: topOffset,
                                                    left: `${bar.left}%`,
                                                    width: `${bar.width}%`,
                                                    height: trackH,
                                                    borderRadius: '4px',
                                                    background: colors.bar,
                                                    opacity: 0.85,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    paddingLeft: '4px',
                                                    overflow: 'hidden',
                                                    maxWidth: '100%',
                                                }}
                                            >
                                                {bar.width > 6 && (
                                                    <span style={{
                                                        fontSize: '7px',
                                                        fontWeight: 700,
                                                        color: '#fff',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}>
                                                        {bar.title}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Footer ──────────────────────────────────── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 12px 8px 12px',
                flexShrink: 0,
            }}>
                <span style={{
                    fontSize: '8px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: textMuted,
                    opacity: 0.5,
                }}>
                    Goal-Grid Planner · Design Your Year · 2026
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {sortedDomains.slice(0, 4).map(d => {
                        const sn = DOMAIN_SHORT[d];
                        const c = COLORS[sn];
                        return (
                            <div key={d} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: c?.solid || '#818cf8' }} />
                                <span style={{ fontSize: '8px', fontWeight: 600, color: textMuted }}>{sn}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
