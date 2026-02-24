import type { Domain, Goal } from '../store/useStore';

interface BentoGridProps {
    allocations: Record<Domain, number>;
    goals: Goal[];
    isDark?: boolean;
}

const DOMAIN_ORDER: Domain[] = [
    '工作事业', '学习成长', '身体健康', '财务理财',
    '家庭生活', '人际社群', '体验突破', '休闲娱乐'
];

// Solid color backgrounds (not transparent) for punchy Bento look
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

// Asymmetric Bento layout
// Grid: 4 cols, auto rows
// [0: 2×2] [1: 2×1]
// [0 cont ] [2: 1×1] [3: 1×1]
// [4: 1×1] [5: 1×1] [6: 2×1]
// [7: 4×1] spanning full
const GRID_SPANS = [
    { col: 'span 2', row: 'span 2' },  // 0 - hero
    { col: 'span 2', row: 'span 1' },  // 1 - top right wide
    { col: 'span 1', row: 'span 1' },  // 2
    { col: 'span 1', row: 'span 1' },  // 3
    { col: 'span 1', row: 'span 1' },  // 4
    { col: 'span 1', row: 'span 1' },  // 5
    { col: 'span 2', row: 'span 1' },  // 6 - bottom right wide
    { col: 'span 4', row: 'span 1' },  // 7 - full width bottom
];

function getKeywords(goals: Goal[], domain: Domain): string[] {
    const domainGoals = goals.filter(g => g.domain === domain);
    if (domainGoals.length === 0) return [];
    return domainGoals.map(g => g.title.trim());
}

// Maximum keywords to show per cell based on grid span
function getMaxKeywords(index: number): number {
    // index 0 = hero (2×2), index 7 = full-width (4×1), index 1 = top-right wide (2×1)
    if (index === 0) return 3; // hero cell is big but needs room for label
    if (index === 7) return 4; // full-width, horizontal layout
    if (index === 1 || index === 6) return 3; // wide cells
    return 2; // small 1×1 cells — keep it sparse so text stays readable
}

// Adaptive font size: shrink for long text so it stays inside its chip
function getAdaptiveFontSize(text: string, basePx: number): string {
    const len = text.length;
    if (len <= 6) return `${basePx}px`;
    if (len <= 10) return `${Math.round(basePx * 0.9)}px`;
    if (len <= 16) return `${Math.round(basePx * 0.8)}px`;
    return `${Math.round(basePx * 0.7)}px`;
}

export default function BentoGrid({ allocations, goals, isDark = false }: BentoGridProps) {
    const sortedDomains = [...DOMAIN_ORDER].sort(
        (a, b) => (allocations[b] || 0) - (allocations[a] || 0)
    );
    const STYLES = isDark ? DOMAIN_STYLE : DOMAIN_STYLE_LIGHT;

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gridTemplateRows: 'repeat(4, 1fr)',
                gap: '6px',
                width: '100%',
                height: '100%',
            }}
        >
            {sortedDomains.map((domain, index) => {
                const span = GRID_SPANS[index] || { col: 'span 1', row: 'span 1' };
                const style = STYLES[domain] || STYLES['工作事业'];
                const allKeywords = getKeywords(goals, domain);
                const maxKw = getMaxKeywords(index);
                const keywords = allKeywords.slice(0, maxKw);
                const isHero = index === 0;
                const isFullWidth = index === 7;

                // Font sizing: smaller cells need smaller fonts to stay contained
                const isSmallCell = index >= 2 && index <= 6 && index !== 6;
                const labelSize = isHero ? '13px' : isFullWidth ? '11px' : '10px';
                const kwFontSize = isHero ? '14px' : isFullWidth ? '12px' : isSmallCell ? '11px' : '12px';

                return (
                    <div
                        key={domain}
                        style={{
                            gridColumn: span.col,
                            gridRow: span.row,
                            background: style.bg,
                            borderRadius: '12px',
                            padding: isHero ? '10px' : isFullWidth ? '8px 12px' : '8px',
                            display: 'flex',
                            flexDirection: isFullWidth ? 'row' : 'column',
                            justifyContent: 'space-between',
                            alignItems: isFullWidth ? 'center' : 'flex-start',
                            overflow: 'hidden',
                            minHeight: 0,
                            minWidth: 0,
                            boxSizing: 'border-box',
                        }}
                    >
                        {/* Domain label */}
                        <div
                            style={{
                                fontSize: labelSize,
                                fontWeight: 900,
                                color: style.textColor,
                                letterSpacing: '-0.3px',
                                lineHeight: 1.1,
                                flexShrink: 0,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '100%',
                            }}
                        >
                            {domain}
                        </div>

                        {/* Keywords */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: isFullWidth ? 'row' : 'column',
                                flexWrap: isFullWidth ? 'wrap' : 'nowrap',
                                gap: '3px',
                                marginTop: isFullWidth ? 0 : '4px',
                                alignItems: isFullWidth ? 'center' : 'flex-start',
                                flex: isFullWidth ? 1 : undefined,
                                justifyContent: isFullWidth ? 'flex-end' : 'flex-start',
                                marginLeft: isFullWidth ? '8px' : 0,
                                overflow: 'hidden',
                                minWidth: 0,
                                maxWidth: '100%',
                            }}
                        >
                            {keywords.length === 0 ? (
                                <span style={{
                                    fontSize: kwFontSize,
                                    fontWeight: 700,
                                    color: style.textColor,
                                    opacity: 0.4,
                                    fontStyle: 'italic',
                                }}>
                                    待填写
                                </span>
                            ) : keywords.map((kw, i) => {
                                const adaptedSize = getAdaptiveFontSize(kw, parseFloat(kwFontSize));
                                return (
                                    <span
                                        key={i}
                                        style={{
                                            fontSize: adaptedSize,
                                            fontWeight: 800,
                                            color: style.textColor,
                                            background: style.tagBg,
                                            padding: '2px 6px',
                                            borderRadius: '5px',
                                            lineHeight: 1.35,
                                            wordBreak: 'break-all',
                                            overflowWrap: 'break-word',
                                            whiteSpace: 'normal',
                                            maxWidth: '100%',
                                            overflow: 'hidden',
                                            display: 'block',
                                            boxSizing: 'border-box',
                                        }}
                                    >
                                        {kw}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
