import { useRef, useEffect, useState } from 'react';
import { useStore, type Domain, type Goal } from '../store/useStore';
import { calculateCost } from '../utils/plannerUtils';
import { Loader2 } from 'lucide-react';

interface BentoGridProps {
    allocations: Record<Domain, number>;
    goals: Goal[];
    isDark?: boolean;
}

const DOMAIN_ORDER: Domain[] = [
    '工作事业', '学习成长', '身体健康', '财务理财',
    '家庭生活', '人际社群', '体验突破', '休闲娱乐'
];

const DOMAIN_STYLE: Record<string, { bg: string; textColor: string; tagBg: string }> = {
    '工作事业': { bg: '#1e3a5f', textColor: '#93c5fd', tagBg: 'rgba(147,197,253,0.15)' },
    '学习成长': { bg: '#2d1b69', textColor: '#c4b5fd', tagBg: 'rgba(196,181,253,0.15)' },
    '身体健康': { bg: '#14532d', textColor: '#86efac', tagBg: 'rgba(134,239,172,0.15)' },
    '财务理财': { bg: '#713f12', textColor: '#fde68a', tagBg: 'rgba(253,230,138,0.15)' },
    '家庭生活': { bg: '#831843', textColor: '#fda4af', tagBg: 'rgba(253,164,175,0.15)' },
    '人际社群': { bg: '#164e63', textColor: '#67e8f9', tagBg: 'rgba(103,232,249,0.15)' },
    '体验突破': { bg: '#7c2d12', textColor: '#fdba74', tagBg: 'rgba(253,186,116,0.15)' },
    '休闲娱乐': { bg: '#3b0764', textColor: '#d8b4fe', tagBg: 'rgba(216,180,254,0.15)' },
};

const DOMAIN_STYLE_LIGHT: Record<string, { bg: string; textColor: string; tagBg: string }> = {
    '工作事业': { bg: '#dbeafe', textColor: '#1d4ed8', tagBg: 'rgba(29,78,216,0.10)' },
    '学习成长': { bg: '#ede9fe', textColor: '#5b21b6', tagBg: 'rgba(91,33,182,0.10)' },
    '身体健康': { bg: '#dcfce7', textColor: '#166534', tagBg: 'rgba(22,101,52,0.10)' },
    '财务理财': { bg: '#fef9c3', textColor: '#854d0e', tagBg: 'rgba(133,77,14,0.10)' },
    '家庭生活': { bg: '#ffe4e6', textColor: '#9f1239', tagBg: 'rgba(159,18,57,0.10)' },
    '人际社群': { bg: '#cffafe', textColor: '#155e75', tagBg: 'rgba(21,94,117,0.10)' },
    '体验突破': { bg: '#ffedd5', textColor: '#9a3412', tagBg: 'rgba(154,52,18,0.10)' },
    '休闲娱乐': { bg: '#f3e8ff', textColor: '#6b21a8', tagBg: 'rgba(107,33,168,0.10)' },
};

interface BlockData {
    domain: Domain;
    value: number;
}

interface BlockResult extends BlockData {
    x: number;
    y: number;
    w: number;
    h: number;
}

function binaryTreemap(data: BlockData[], x: number, y: number, w: number, h: number): BlockResult[] {
    if (data.length === 0) return [];
    if (data.length === 1) return [{ ...data[0], x, y, w, h }];

    const total = data.reduce((acc, d) => acc + d.value, 0);
    let halfSum = 0;
    let splitIndex = 1;
    for (let i = 0; i < data.length; i++) {
        halfSum += data[i].value;
        if (halfSum >= total / 2) {
            const prevDiff = Math.abs(total / 2 - (halfSum - data[i].value));
            const currDiff = Math.abs(total / 2 - halfSum);
            splitIndex = (prevDiff < currDiff && i > 0) ? i : i + 1;
            break;
        }
    }
    if (splitIndex <= 0) splitIndex = 1;
    if (splitIndex >= data.length) splitIndex = data.length - 1;

    const leftData = data.slice(0, splitIndex);
    const rightData = data.slice(splitIndex);
    const leftWeight = leftData.reduce((acc, d) => acc + d.value, 0);
    const ratio = total > 0 ? leftWeight / total : 0.5;

    if (w > h) {
        const leftW = w * ratio;
        return [
            ...binaryTreemap(leftData, x, y, leftW, h),
            ...binaryTreemap(rightData, x + leftW, y, w - leftW, h)
        ];
    } else {
        const leftH = h * ratio;
        return [
            ...binaryTreemap(leftData, x, y, w, leftH),
            ...binaryTreemap(rightData, x, y + leftH, w, h - leftH)
        ];
    }
}

interface IndexedGoal {
    id: string;
    domain: Domain;
    title: string;
    shortTitle?: string;
    time: number;
}

function getSortedGoals(goals: Goal[], domain: Domain, tasks: any[]): IndexedGoal[] {
    const domainGoals = goals.filter(g => g.domain === domain);
    if (domainGoals.length === 0) return [];

    return domainGoals
        .map(g => {
            const goalTasks = tasks.filter(t => t.goalId === g.id && !t.hidden);
            const time = goalTasks.length > 0
                ? goalTasks.reduce((sum, t) => sum + calculateCost(t), 0)
                : calculateCost(g);
            return { id: g.id, domain: g.domain, title: g.title.trim(), shortTitle: g.shortTitle, time };
        })
        .sort((a, b) => b.time - a.time);
}

// Sub-component to handle local overflow detection and AI fetch
function BentoBlock({
    domain, block, style, maxKw, goalsList
}: {
    domain: Domain; block: BlockResult; style: any; maxKw: number; goalsList: IndexedGoal[];
}) {
    const { updateGoal } = useStore();
    const contentRef = useRef<HTMLDivElement>(null);

    const [useShort, setUseShort] = useState(false);
    const [hideCount, setHideCount] = useState(0);
    const [summarizingIds, setSummarizingIds] = useState<Set<string>>(new Set());

    const activeGoals = goalsList.slice(0, maxKw);
    const visibleCount = Math.max(0, activeGoals.length - hideCount);
    const displayGoals = activeGoals.slice(0, visibleCount);

    // CSS fluid query vars based on container scale - scale title down to minimum 12px for smaller areas
    const titleSize = 'clamp(12px, 14cqmin, 28px)';
    // Scale items down to minimum 10px
    const kwSize = 'clamp(10px, 12cqmin, 14px)';
    // Adaptive paddings
    const tagVerticalPadding = 'clamp(2px, 3cqmin, 6px)';
    const tagHorizontalPadding = 'clamp(6px, 4cqmin, 10px)';

    useEffect(() => {
        const el = contentRef.current;
        if (!el) return;

        let isChecking = false;

        const obs = new ResizeObserver(() => {
            if (isChecking) return;
            isChecking = true;

            requestAnimationFrame(() => {
                if (!el) { isChecking = false; return; }
                const isOverflowing = el.scrollHeight > el.clientHeight + 4 || el.scrollWidth > el.clientWidth + 4;

                if (isOverflowing) {
                    if (!useShort) {
                        setUseShort(true);
                        // Trigger summaries if we are switching to short mode
                        const needsSummary = activeGoals.filter(g => !g.shortTitle && g.title.length > 4);
                        if (needsSummary.length > 0) {
                            fetchSummaries(needsSummary);
                        }
                    } else {
                        // If already using short titles and STILL overflowing (at min font size), hide least time object
                        if (summarizingIds.size === 0 && visibleCount > 1) {
                            setHideCount(h => h + 1);
                        }
                    }
                }
                isChecking = false;
            });
        });
        obs.observe(el);
        return () => obs.disconnect();
    }, [useShort, summarizingIds.size, visibleCount, activeGoals]);

    const fetchSummaries = async (goalsToWrap: IndexedGoal[]) => {
        const ids = new Set(summarizingIds);
        goalsToWrap.forEach(g => ids.add(g.id));
        setSummarizingIds(new Set(ids));

        try {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code') || '';

            await Promise.all(goalsToWrap.map(async (g) => {
                try {
                    const res = await fetch('/api/summarize-vision', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code, vision: g.title, domain: g.domain })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.data?.shortTitle) {
                            updateGoal(g.id, { shortTitle: data.data.shortTitle });
                        }
                    }
                } catch (e) {
                    console.error("Summary failed for", g.id, e);
                } finally {
                    setSummarizingIds(prev => {
                        const next = new Set(prev);
                        next.delete(g.id);
                        return next;
                    });
                }
            }));
        } catch (error) {
            console.error(error);
            setSummarizingIds(new Set());
        }
    };

    return (
        <div
            style={{
                position: 'absolute',
                left: `${block.x}%`,
                top: `${block.y}%`,
                width: `${block.w}%`,
                height: `${block.h}%`,
                boxSizing: 'border-box',
                padding: '4px',
            }}
        >
            <div
                style={{
                    background: style.bg,
                    borderRadius: '12px',
                    padding: '10px 12px',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                    containerType: 'size', // Enable fluid typography
                }}
            >
                {/* Reference anchor for overflow measurement */}
                <div
                    ref={contentRef}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        height: '100%',
                    }}
                >
                    {/* Domain label */}
                    <div
                        style={{
                            fontSize: titleSize,
                            fontWeight: 900,
                            color: style.textColor,
                            letterSpacing: '-0.3px',
                            wordBreak: 'normal',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            flexShrink: 0,
                            lineHeight: '1.2',
                        }}
                    >
                        {domain}
                    </div>

                    {/* Keywords container */}
                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            marginTop: '8px',
                        }}
                    >
                        {goalsList.length === 0 ? (
                            <span style={{
                                fontSize: 'clamp(10px, 10cqmin, 14px)',
                                fontWeight: 700,
                                color: style.textColor,
                                opacity: 0.4,
                                fontStyle: 'italic',
                            }}>
                                待填写
                            </span>
                        ) : displayGoals.map((g) => {
                            const isLoading = summarizingIds.has(g.id);
                            // Choose content: User requested "楷体" (KaiTi) for keyword text to differentiate from title.
                            // If useShort is true, use shortTitle (or title if shortTitle not yet fetched).
                            const activeText = useShort && g.shortTitle ? g.shortTitle : g.title;

                            return (
                                <span
                                    key={g.id}
                                    style={{
                                        fontSize: kwSize,
                                        fontWeight: 800,
                                        fontFamily: '"楷体", "STKaiti", "KaiTi", serif', // Custom KaiTi font
                                        color: style.textColor,
                                        background: style.tagBg,
                                        padding: `${tagVerticalPadding} ${tagHorizontalPadding}`,
                                        borderRadius: '6px',
                                        lineHeight: 1.35,
                                        wordBreak: 'break-word',
                                        overflow: 'hidden',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 4,
                                        WebkitBoxOrient: 'vertical',
                                    }}
                                >
                                    {isLoading ? (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: 0.8 }}>
                                            <Loader2 size={10} className="animate-spin" /> AI总结中...
                                        </span>
                                    ) : (
                                        activeText
                                    )}
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BentoGrid({ allocations, goals, isDark = false }: BentoGridProps) {
    const tasks = useStore(state => state.tasks);
    const STYLES = isDark ? DOMAIN_STYLE : DOMAIN_STYLE_LIGHT;

    const totalAllo = [...DOMAIN_ORDER].reduce((acc, d) => acc + (allocations[d] || 0), 0);
    const minWeight = Math.max(totalAllo * 0.05, 1);

    const data: BlockData[] = [...DOMAIN_ORDER].map(domain => ({
        domain,
        value: Math.max(allocations[domain] || 0, minWeight)
    })).sort((a, b) => b.value - a.value);

    const blocks = binaryTreemap(data, 0, 0, 100, 100);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {blocks.map((block) => {
                const domain = block.domain;
                const style = STYLES[domain] || STYLES['工作事业'];
                const area = block.w * block.h;

                // Allow up to 5 items if huge, 3 if medium, 2 if small
                const maxKw = area > 2000 ? 5 : area > 1000 ? 3 : 2;
                const goalsList = getSortedGoals(goals, domain, tasks);

                return (
                    <BentoBlock
                        key={domain}
                        domain={domain}
                        block={block}
                        style={style}
                        maxKw={maxKw}
                        goalsList={goalsList}
                    />
                );
            })}
        </div>
    );
}
