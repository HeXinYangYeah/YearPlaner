import React from 'react';
import { useStore } from '../store/useStore';
import type { Domain } from '../store/useStore';
import { Target, TrendingUp, Heart, Users, BookOpen, Coffee, Star, Briefcase } from 'lucide-react';

const DOMAIN_ICONS: Record<string, { icon: React.ElementType, color: string, bg: string }> = {
    '职业发展': { icon: Briefcase, color: 'text-[#3b82f6]', bg: 'bg-[#eff6ff]' },
    '财务': { icon: TrendingUp, color: 'text-[#10b981]', bg: 'bg-[#ecfdf5]' },
    '健康': { icon: Heart, color: 'text-[#f43f5e]', bg: 'bg-[#fff1f2]' },
    '家庭': { icon: Users, color: 'text-[#f59e0b]', bg: 'bg-[#fffbeb]' },
    '社交': { icon: Target, color: 'text-[#8b5cf6]', bg: 'bg-[#f5f3ff]' },
    '学习': { icon: BookOpen, color: 'text-[#0ea5e9]', bg: 'bg-[#f0f9ff]' },
    '休闲': { icon: Coffee, color: 'text-[#d946ef]', bg: 'bg-[#fdf4ff]' },
    '个人成长': { icon: Star, color: 'text-[#eab308]', bg: 'bg-[#fefce8]' }
};

interface GoalGridCellProps {
    domain: Domain;
    onClick: () => void;
}

export default function GoalGridCell({ domain, onClick }: GoalGridCellProps) {
    const { goals } = useStore();
    const domainGoals = goals.filter(g => g.domain === domain);
    const conf = DOMAIN_ICONS[domain] || { icon: Target, color: 'text-slate-500', bg: 'bg-slate-100' };
    const Icon = conf.icon;

    // Calculate progress based on 3 max goals
    const progressPerc = Math.min((domainGoals.length / 3) * 100, 100);

    return (
        <div
            onClick={onClick}
            className="glass-panel rounded-[2rem] p-5 md:p-6 flex flex-col items-center justify-between cursor-pointer hover:-translate-y-1 transition-all duration-300 group min-h-[140px] md:min-h-[160px] relative overflow-hidden"
        >
            <div className="flex flex-col items-center gap-3 w-full">
                <div className={`p-4 rounded-3xl ${conf.bg} ${conf.color} transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                    <Icon size={28} strokeWidth={2} />
                </div>
                <h3 className="font-bold font-serif tracking-wide text-[#333333] text-sm md:text-lg">{domain}</h3>
            </div>

            <div className="w-full mt-4 flex flex-col items-center gap-2">
                {domainGoals.length === 0 ? (
                    <p className="text-[11px] md:text-xs text-center text-slate-400">设置愿景</p>
                ) : (
                    <p className="text-[11px] text-center text-slate-500">{domainGoals.length} 项愿景</p>
                )}

                {/* Subtle progress bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${progressPerc > 0 ? conf.color.replace('text-', 'bg-') : 'bg-transparent'} transition-all duration-500 ease-out`}
                        style={{ width: `${progressPerc}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
