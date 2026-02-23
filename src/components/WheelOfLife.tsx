import type { Domain } from '../store/useStore';

interface WheelOfLifeProps {
    data: Record<Domain, number>;
}

const DOMAINS: Domain[] = [
    '学习成长', '体验突破', '休闲娱乐', '工作事业',
    '家庭生活', '身体健康', '财务理财', '人际社群'
];

export default function WheelOfLife({ data }: WheelOfLifeProps) {
    // 1. Find the maximum value to normalize the chart
    const maxValue = Math.max(...Object.values(data), 1); // Avoid division by zero

    // 2. SVG setup
    const size = 300;
    const center = size / 2;
    const radius = size * 0.4;
    const angleStep = (Math.PI * 2) / 8;

    // 3. Calculate points for the data polygon
    const points = DOMAINS.map((domain, i) => {
        const value = data[domain] || 0;
        // Map 0 -> 0.1 (minimum visible), max -> 1.0
        const normalizedValue = value === 0 ? 0.1 : 0.1 + (value / maxValue) * 0.9;
        const angle = i * angleStep - Math.PI / 2; // Start from top
        const x = center + radius * normalizedValue * Math.cos(angle);
        const y = center + radius * normalizedValue * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    // 4. Calculate points for the background octagon (levels)
    const renderBackgroundPolygon = (scale: number) => {
        const bgPoints = Array.from({ length: 8 }).map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + radius * scale * Math.cos(angle);
            const y = center + radius * scale * Math.sin(angle);
            return `${x},${y}`;
        }).join(' ');

        return <polygon points={bgPoints} fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200" />;
    };

    // 5. Draw axes (spokes)
    const axes = Array.from({ length: 8 }).map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return (
            <line key={`axis-${i}`} x1={center} y1={center} x2={x} y2={y} stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-slate-200" />
        );
    });

    // 6. Labels
    const labels = DOMAINS.map((domain, i) => {
        const angle = i * angleStep - Math.PI / 2;
        // Push labels slightly outside the radius
        const labelRadius = radius * 1.25;
        const x = center + labelRadius * Math.cos(angle);
        const y = center + labelRadius * Math.sin(angle);

        // Simple mapping to shorter names if needed, or keep original
        const shortName = domain.substring(0, 2); // e.g., 学习成长 -> 学习

        return (
            <text
                key={`label-${i}`}
                x={x}
                y={y}
                textAnchor="middle"
                alignmentBaseline="middle"
                className="text-xs font-bold fill-slate-500"
            >
                {shortName}
            </text>
        );
    });

    return (
        <div className="w-full flex justify-center items-center relative">
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full max-w-[300px] overflow-visible">
                {/* Background Web */}
                {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                    <g key={`bg-${i}`}>{renderBackgroundPolygon(scale)}</g>
                ))}

                {axes}

                {/* Data Polygon filled with gradient */}
                <defs>
                    <linearGradient id="wheelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" /> {/* Violet 500 */}
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" /> {/* Blue 500 */}
                    </linearGradient>
                </defs>
                <polygon
                    points={points}
                    fill="url(#wheelGradient)"
                    stroke="#6366f1" // Indigo 500
                    strokeWidth="3"
                    strokeLinejoin="round"
                    className="transition-all duration-700 ease-in-out drop-shadow-md"
                />

                {/* Data Points */}
                {DOMAINS.map((domain, i) => {
                    const value = data[domain] || 0;
                    const normalizedValue = value === 0 ? 0.1 : 0.1 + (value / maxValue) * 0.9;
                    const angle = i * angleStep - Math.PI / 2;
                    const x = center + radius * normalizedValue * Math.cos(angle);
                    const y = center + radius * normalizedValue * Math.sin(angle);
                    return (
                        <circle key={`point-${i}`} cx={x} cy={y} r="4" fill="#ffffff" stroke="#6366f1" strokeWidth="2" />
                    );
                })}

                {labels}
            </svg>
        </div>
    );
}
