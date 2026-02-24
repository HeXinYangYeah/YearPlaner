import type { Domain } from '../store/useStore';

interface WheelOfLifeProps {
    data: Record<Domain, number>;
    isDark?: boolean;
    uniqueId?: string;
}

const DOMAINS: Domain[] = [
    '学习成长', '体验突破', '休闲娱乐', '工作事业',
    '家庭生活', '身体健康', '财务理财', '人际社群'
];

const DOMAIN_COLORS = [
    '#818cf8', // indigo - 学习成长
    '#f97316', // orange - 体验突破
    '#a78bfa', // violet - 休闲娱乐
    '#38bdf8', // sky - 工作事业
    '#fb7185', // rose - 家庭生活
    '#4ade80', // green - 身体健康
    '#facc15', // yellow - 财务理财
    '#22d3ee', // cyan - 人际社群
];

const DOMAIN_SHORT: Record<Domain, string> = {
    '学习成长': '学习',
    '体验突破': '体验',
    '休闲娱乐': '休闲',
    '工作事业': '事业',
    '家庭生活': '家庭',
    '身体健康': '健康',
    '财务理财': '财富',
    '人际社群': '人际',
};

export default function WheelOfLife({ data, isDark = false, uniqueId = 'wheel' }: WheelOfLifeProps) {
    const maxValue = Math.max(...Object.values(data), 1);
    const size = 320;
    const center = size / 2;
    const radius = size * 0.38;
    const angleStep = (Math.PI * 2) / 8;

    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
    const spokeColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';

    const getPoint = (i: number, normVal: number) => {
        const angle = i * angleStep - Math.PI / 2;
        return {
            x: center + radius * normVal * Math.cos(angle),
            y: center + radius * normVal * Math.sin(angle),
        };
    };

    const normalizedValues = DOMAINS.map((domain) => {
        const v = data[domain] || 0;
        return v === 0 ? 0.06 : 0.1 + (v / maxValue) * 0.9;
    });

    // Build main polygon path
    const polyPoints = normalizedValues.map((nv, i) => {
        const p = getPoint(i, nv);
        return `${p.x},${p.y}`;
    }).join(' ');

    // Background grid levels
    const bgLevels = [0.25, 0.5, 0.75, 1.0];
    const bgPolygons = bgLevels.map((scale) => {
        const pts = Array.from({ length: 8 }, (_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + radius * scale * Math.cos(angle);
            const y = center + radius * scale * Math.sin(angle);
            return `${x},${y}`;
        }).join(' ');
        return pts;
    });

    // Label positions outside radius
    const labelRadius = radius * 1.28;

    return (
        <div className="w-full flex flex-col items-center">
            <svg
                viewBox={`0 0 ${size} ${size}`}
                className="w-full max-w-[300px] overflow-visible"
            >
                <defs>
                    {DOMAINS.map((_, i) => (
                        <radialGradient key={`grad-${uniqueId}-${i}`} id={`grad-${uniqueId}-${i}`} cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor={DOMAIN_COLORS[i]} stopOpacity="0.7" />
                            <stop offset="100%" stopColor={DOMAIN_COLORS[i]} stopOpacity="0.15" />
                        </radialGradient>
                    ))}
                    <linearGradient id={`mainGrad-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.6" />
                        <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#4ade80" stopOpacity="0.6" />
                    </linearGradient>
                </defs>

                {/* Background grid polygons */}
                {bgPolygons.map((pts, i) => (
                    <polygon
                        key={`bg-${i}`}
                        points={pts}
                        fill="none"
                        stroke={gridColor}
                        strokeWidth={i === 3 ? 1.5 : 1}
                    />
                ))}

                {/* Spokes */}
                {DOMAINS.map((_, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    const x2 = center + radius * Math.cos(angle);
                    const y2 = center + radius * Math.sin(angle);
                    return (
                        <line key={`spoke-${i}`} x1={center} y1={center} x2={x2} y2={y2}
                            stroke={spokeColor} strokeWidth="1" />
                    );
                })}

                {/* Per-axis colored fill triangles (subtle) */}
                {DOMAINS.map((_, i) => {
                    const prev = (i - 1 + 8) % 8;
                    const next = (i + 1) % 8;
                    const p0 = `${center},${center}`;
                    const p1 = getPoint(i, normalizedValues[i]);
                    const p2prev = getPoint(prev, normalizedValues[prev]);
                    const p2next = getPoint(next, normalizedValues[next]);
                    void p2prev; void p2next;
                    void p0; void p1;
                    return null; // Skip per-axis fills, use main gradient instead
                })}

                {/* Main filled polygon */}
                <polygon
                    points={polyPoints}
                    fill={`url(#mainGrad-${uniqueId})`}
                    stroke="rgba(129,140,248,0.9)"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />

                {/* Axis-colored dots at tips */}
                {DOMAINS.map((domain, i) => {
                    const p = getPoint(i, normalizedValues[i]);
                    const percent = data[domain] ? Math.round((data[domain] / maxValue) * 100) : 0;
                    void percent;
                    return (
                        <circle key={`dot-${i}`}
                            cx={p.x} cy={p.y} r="5"
                            fill={DOMAIN_COLORS[i]}
                            stroke={isDark ? '#000' : '#fff'}
                            strokeWidth="2"
                        />
                    );
                })}

                {/* Labels */}
                {DOMAINS.map((domain, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    const lx = center + labelRadius * Math.cos(angle);
                    const ly = center + labelRadius * Math.sin(angle);
                    return (
                        <text
                            key={`lbl-${i}`}
                            x={lx}
                            y={ly}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="11"
                            fontWeight="600"
                            fill={DOMAIN_COLORS[i]}
                            fontFamily="system-ui, sans-serif"
                        >
                            {DOMAIN_SHORT[domain]}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}
