import { useMemo } from 'react';
import type { Goal, Task } from '../store/useStore';
import { isActiveInMonth } from '../utils/reportUtils';

interface QuarterlySlideProps {
    goals: Goal[];
    tasks: Task[]
    isDark?: boolean;
    currentQuarter?: number; // 1-4, auto from current date if not supplied
}

const QUARTER_CONFIG = [
    {
        q: 1, label: 'Q1', months: [0, 1, 2],
        // Spring — tender green
        bg: 'linear-gradient(160deg, #052e16 0%, #14532d 100%)',
        accent: '#4ade80',
        tagBg: 'rgba(74,222,128,0.18)',
        bgLight: 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 100%)',
        accentLight: '#16a34a',
        tagBgLight: 'rgba(22,163,74,0.10)',
    },
    {
        q: 2, label: 'Q2', months: [3, 4, 5],
        // Summer — sky blue
        bg: 'linear-gradient(160deg, #0c2a4a 0%, #1e3a5f 100%)',
        accent: '#38bdf8',
        tagBg: 'rgba(56,189,248,0.18)',
        bgLight: 'linear-gradient(160deg, #f0f9ff 0%, #dbeafe 100%)',
        accentLight: '#0284c7',
        tagBgLight: 'rgba(2,132,199,0.10)',
    },
    {
        q: 3, label: 'Q3', months: [6, 7, 8],
        // Autumn — warm amber
        bg: 'linear-gradient(160deg, #3c1a06 0%, #7c2d12 100%)',
        accent: '#fb923c',
        tagBg: 'rgba(249,115,22,0.18)',
        bgLight: 'linear-gradient(160deg, #fff7ed 0%, #ffedd5 100%)',
        accentLight: '#ea580c',
        tagBgLight: 'rgba(234,88,12,0.10)',
    },
    {
        q: 4, label: 'Q4', months: [9, 10, 11],
        // Winter — ice blue/violet
        bg: 'linear-gradient(160deg, #0d1b3e 0%, #1e1b4b 100%)',
        accent: '#93c5fd',
        tagBg: 'rgba(147,197,253,0.18)',
        bgLight: 'linear-gradient(160deg, #f5f3ff 0%, #ede9fe 100%)',
        accentLight: '#4f46e5',
        tagBgLight: 'rgba(79,70,229,0.10)',
    },
];

function getQuarterKeywords(goals: Goal[], tasks: Task[], months: number[]): string[] {
    const visibleTasks = tasks.filter(t => !t.hidden);

    // Collect task titles active in these months
    const taskTitles: string[] = [];
    visibleTasks.forEach(t => {
        if (months.some(m => isActiveInMonth(t, 2026, m))) {
            taskTitles.push(t.title.slice(0, 4));
        }
    });

    // Collect goal titles (vision) if no task
    goals.forEach(g => {
        const hasTasks = visibleTasks.some(t => t.goalId === g.id);
        if (!hasTasks && months.some(m => isActiveInMonth(g, 2026, m))) {
            taskTitles.push(g.title.slice(0, 4));
        }
    });

    // Deduplicate
    return [...new Set(taskTitles)].slice(0, 8);
}

function getTopKeyword(goals: Goal[], tasks: Task[], months: number[]): string {
    const kws = getQuarterKeywords(goals, tasks, months);
    return kws[0] || '';
}

export default function QuarterlySlide({ goals, tasks, isDark = true, currentQuarter }: QuarterlySlideProps) {
    const activeQ = currentQuarter ?? Math.ceil((new Date().getMonth() + 1) / 3);

    const q1Data = useMemo(() => ({
        ...QUARTER_CONFIG[0],
        keywords: getQuarterKeywords(goals, tasks, QUARTER_CONFIG[0].months),
    }), [goals, tasks]);

    const sideQuarters = useMemo(() =>
        QUARTER_CONFIG.slice(1).map(qc => ({
            ...qc,
            topKeyword: getTopKeyword(goals, tasks, qc.months),
        }))
        , [goals, tasks]);

    // Q1 config
    const q1 = q1Data;
    const q1bg = isDark ? q1.bg : q1.bgLight;
    const q1accent = isDark ? q1.accent : q1.accentLight;
    const q1tagBg = isDark ? q1.tagBg : q1.tagBgLight;

    const labelColor = (qc: typeof QUARTER_CONFIG[0]) => isDark ? qc.accent : qc.accentLight;
    const panelBg = (qc: typeof QUARTER_CONFIG[0]) => isDark ? qc.bg : qc.bgLight;
    const tagBg = (qc: typeof QUARTER_CONFIG[0]) => isDark ? qc.tagBg : qc.tagBgLight;
    const dimText = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
    const dimBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
    const isCurrentQ = (q: number) => q === activeQ;

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', gap: '6px' }}>
            {/* ── Left: Q1 (70%) ────────────────────────────── */}
            <div
                style={{
                    flex: '7 0 0',
                    background: q1bg,
                    borderRadius: '16px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    overflow: 'hidden',
                    position: 'relative',
                    border: `1px solid ${q1accent}40`,
                }}
            >
                {/* Current badge */}
                {isCurrentQ(1) && (
                    <div style={{
                        position: 'absolute', top: '12px', right: '12px',
                        background: q1accent,
                        borderRadius: '20px',
                        padding: '2px 8px',
                        fontSize: '9px',
                        fontWeight: 800,
                        color: isDark ? '#000' : '#fff',
                        letterSpacing: '0.5px',
                    }}>
                        NOW
                    </div>
                )}

                {/* Q1 label */}
                <div style={{
                    fontSize: '48px',
                    fontWeight: 900,
                    color: q1accent,
                    lineHeight: 1,
                    letterSpacing: '-2px',
                }}>
                    Q1
                </div>

                {/* Keywords */}
                <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', gap: '6px' }}>
                    {q1.keywords.length === 0 ? (
                        <span style={{ fontSize: '14px', color: q1accent, opacity: 0.4, fontStyle: 'italic' }}>
                            暂无目标
                        </span>
                    ) : q1.keywords.map((kw, i) => (
                        <span
                            key={i}
                            style={{
                                fontSize: q1.keywords.length <= 3 ? '20px' : q1.keywords.length <= 5 ? '16px' : '13px',
                                fontWeight: 800,
                                color: q1accent,
                                background: q1tagBg,
                                padding: '4px 10px',
                                borderRadius: '8px',
                                lineHeight: 1.3,
                            }}
                        >
                            {kw}
                        </span>
                    ))}
                </div>

                {/* Subtle bottom label */}
                <div style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: q1accent,
                    opacity: 0.5,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                }}>
                    Jan · Feb · Mar
                </div>
            </div>

            {/* ── Right: Q2, Q3, Q4 (30%) ────────────────────── */}
            <div style={{
                flex: '3 0 0',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
            }}>
                {sideQuarters.map(qc => {
                    const isCurrent = isCurrentQ(qc.q);
                    return (
                        <div
                            key={qc.q}
                            style={{
                                flex: 1,
                                background: isCurrent ? panelBg(qc) : dimBg,
                                borderRadius: '12px',
                                padding: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                overflow: 'hidden',
                                border: `1px solid ${isCurrent ? labelColor(qc) + '40' : 'transparent'}`,
                                opacity: isCurrent ? 1 : 0.6,
                            }}
                        >
                            <div style={{
                                fontSize: '20px',
                                fontWeight: 900,
                                color: isCurrent ? labelColor(qc) : dimText,
                                lineHeight: 1,
                                letterSpacing: '-0.5px',
                            }}>
                                {qc.label}
                            </div>
                            {qc.topKeyword && (
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: isCurrent ? labelColor(qc) : dimText,
                                    background: isCurrent ? tagBg(qc) : 'transparent',
                                    padding: isCurrent ? '2px 6px' : 0,
                                    borderRadius: '6px',
                                    lineHeight: 1.3,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    display: 'block',
                                }}>
                                    {qc.topKeyword}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
