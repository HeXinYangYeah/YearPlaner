import React from 'react';
import type { Domain } from '../store/useStore';
import {
    BookOpen, Flame, Smile, Briefcase,
    Home, HeartPulse, PiggyBank, Users
} from 'lucide-react';

interface BentoGridProps {
    allocations: Record<Domain, number>;
}

const DOMAIN_ICONS: Record<Domain, React.ElementType> = {
    '学习成长': BookOpen,
    '体验突破': Flame,
    '休闲娱乐': Smile,
    '工作事业': Briefcase,
    '家庭生活': Home,
    '身体健康': HeartPulse,
    '财务理财': PiggyBank,
    '人际社群': Users
};

const DOMAIN_SHORT_NAMES: Record<Domain, string> = {
    '学习成长': '学习',
    '体验突破': '体验',
    '休闲娱乐': '休闲',
    '工作事业': '事业',
    '家庭生活': '家庭',
    '身体健康': '健康',
    '财务理财': '财富',
    '人际社群': '人际'
};

const DOMAIN_COLORS: Record<string, string> = {
    '健康': 'bg-pink-500/10 text-pink-500 border-pink-100 dark:bg-pink-500/20 dark:border-pink-500/20',
    '事业': 'bg-blue-500/10 text-blue-500 border-blue-100 dark:bg-blue-500/20 dark:border-blue-500/20',
    '财富': 'bg-emerald-500/10 text-emerald-500 border-emerald-100 dark:bg-emerald-500/20 dark:border-emerald-500/20',
    '休闲': 'bg-amber-500/10 text-amber-500 border-amber-100 dark:bg-amber-500/20 dark:border-amber-500/20',
    '体验': 'bg-orange-500/10 text-orange-500 border-orange-100 dark:bg-orange-500/20 dark:border-orange-500/20',
    '家庭': 'bg-rose-500/10 text-rose-500 border-rose-100 dark:bg-rose-500/20 dark:border-rose-500/20',
    '学习': 'bg-indigo-500/10 text-indigo-500 border-indigo-100 dark:bg-indigo-500/20 dark:border-indigo-500/20',
    '人际': 'bg-cyan-500/10 text-cyan-500 border-cyan-100 dark:bg-cyan-500/20 dark:border-cyan-500/20'
};

export default function BentoGrid({ allocations }: BentoGridProps) {
    // 1. Sort domains by allocation (highest first)
    const sortedDomains = Object.entries(allocations)
        .sort(([, a], [, b]) => b - a)
        .map(([domain]) => domain as Domain);

    // Provide a default ranking if all are 0
    const topDomains = sortedDomains.length === 8 ? sortedDomains : Object.keys(DOMAIN_ICONS) as Domain[];

    // 2. Assign grid positions
    // Top 1: 2x2 large square
    // Top 2: 2x1 horizontal rect
    // Top 3, 4: 1x2 vertical rect
    // Top 5, 6, 7, 8: 1x1 small square

    // CSS Grid Template:
    // A A B B  (A: #1, B: #2)
    // A A C D  (C: #3, D: #5)
    // E F C G  (E: #4, F: #6, G: #7) 
    // H I J K  (Wait, let's simplify for 8 items)

    // Layout 1:
    // [  1  ] (2x2) [ 2 ] (2x1)
    // [  1  ]       [ 3 ][ 4 ]
    // [ 5 ][ 6 ]    [  7  ] (2x1)
    // [  8  ] (2x1) [ 9 ] -> Only 8 items needed.

    // Let's use custom tailwind col-span classes based on rank
    const getGridClass = (rank: number) => {
        switch (rank) {
            case 0: return 'md:col-span-2 md:row-span-2 col-span-2 row-span-2'; // Biggest target
            case 1: return 'md:col-span-2 md:row-span-1 col-span-2 row-span-1'; // Important width
            case 2: return 'md:col-span-1 md:row-span-2 col-span-1 row-span-1'; // Taller
            default: return 'md:col-span-1 md:row-span-1 col-span-1 row-span-1'; // Standard
        }
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-auto gap-4 md:gap-6 auto-rows-[120px] md:auto-rows-[140px]">
            {topDomains.map((domain, index) => {
                const Icon = DOMAIN_ICONS[domain];
                const shortName = DOMAIN_SHORT_NAMES[domain];
                const hours = allocations[domain] || 0;
                const colorStr = DOMAIN_COLORS[shortName as keyof typeof DOMAIN_COLORS] || 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';

                // Determine layout based on rank and size
                const isLarge = index === 0;
                const isWide = index === 1;

                return (
                    <div
                        key={domain}
                        className={`${getGridClass(index)} rounded-[2rem] p-6 flex flex-col justify-between items-start border backdrop-blur-md shadow-sm transition-all hover:scale-[1.02] ${colorStr}`}
                    >
                        <div className={`p-4 rounded-full bg-white/50 dark:bg-black/20 backdrop-blur-md flex items-center justify-center ${isLarge ? 'w-16 h-16 mb-4' : 'w-12 h-12'}`}>
                            <Icon size={isLarge ? 32 : 24} strokeWidth={1.5} />
                        </div>

                        <div className={`flex flex-col ${isWide && !isLarge ? 'flex-row items-end justify-between w-full' : ''}`}>
                            <div>
                                <h3 className={`${isLarge ? 'text-3xl' : 'text-xl'} font-black tracking-tight mb-1 opacity-90`}>
                                    {shortName}
                                </h3>
                                <p className={`font-medium opacity-70 ${isLarge ? 'text-lg' : 'text-sm'}`}>
                                    {hours > 0 ? `${hours.toFixed(1)} hrs/yr` : '待规划'}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
