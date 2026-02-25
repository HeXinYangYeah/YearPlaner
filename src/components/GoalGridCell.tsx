import React from 'react';
import { useStore } from '../store/useStore';
import type { Domain } from '../store/useStore';
import { Target, TrendingUp, Heart, Users, BookOpen, Coffee, Star, Briefcase } from 'lucide-react';

const DOMAIN_ICONS: Record<string, { icon: React.ElementType, color: string, bg: string, cardBg: string }> = {
    '学习成长': { icon: BookOpen, color: 'text-[#0ea5e9]', bg: 'bg-white/60', cardBg: 'bg-gradient-to-br from-sky-50 to-blue-100' },
    '体验突破': { icon: Star, color: 'text-[#eab308]', bg: 'bg-white/60', cardBg: 'bg-gradient-to-br from-yellow-50 to-amber-100' },
    '休闲娱乐': { icon: Coffee, color: 'text-[#d946ef]', bg: 'bg-white/60', cardBg: 'bg-gradient-to-br from-fuchsia-50 to-pink-100' },
    '工作事业': { icon: Briefcase, color: 'text-[#3b82f6]', bg: 'bg-white/60', cardBg: 'bg-gradient-to-br from-blue-50 to-indigo-100' },
    '家庭生活': { icon: Users, color: 'text-[#f59e0b]', bg: 'bg-white/60', cardBg: 'bg-gradient-to-br from-orange-50 to-amber-100' },
    '身体健康': { icon: Heart, color: 'text-[#f43f5e]', bg: 'bg-white/60', cardBg: 'bg-gradient-to-br from-rose-50 to-red-100' },
    '财务理财': { icon: TrendingUp, color: 'text-[#10b981]', bg: 'bg-white/60', cardBg: 'bg-gradient-to-br from-emerald-50 to-teal-100' },
    '人际社群': { icon: Target, color: 'text-[#8b5cf6]', bg: 'bg-white/60', cardBg: 'bg-gradient-to-br from-purple-50 to-violet-100' }
};

interface GoalGridCellProps {
    domain: Domain;
    showWarning?: boolean;
    onClick: () => void;
}

export default function GoalGridCell({ domain, showWarning, onClick }: GoalGridCellProps) {
    const { goals } = useStore();
    const domainGoals = goals.filter(g => g.domain === domain);
    const conf = DOMAIN_ICONS[domain] || { icon: Target, color: 'text-slate-500', bg: 'bg-white/60', cardBg: 'bg-slate-50' };
    const Icon = conf.icon;

    // Calculate progress based on 3 max goals
    const progressPerc = Math.min((domainGoals.length / 3) * 100, 100);

    return (
        <div
            onClick={onClick}
            className={`rounded-[1.5rem] p-5 md:p-6 flex flex-col items-center justify-between cursor-pointer hover:-translate-y-1 transition-all duration-300 group min-h-[140px] md:min-h-[160px] relative overflow-hidden backdrop-blur-md border border-white/60 shadow-sm hover:shadow-md ${conf.cardBg} ${showWarning ? 'border-red-400 !bg-red-50 anim-pulse' : ''}`}
        >
            {showWarning && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            )}
            <div className="flex flex-col items-center gap-3 w-full">
                <div className={`p-4 rounded-[1.2rem] ${conf.bg} ${conf.color} transition-transform duration-300 group-hover:scale-110 shadow-sm backdrop-blur-sm border border-white/40`}>
                    <Icon size={28} strokeWidth={2} />
                </div>
                <h3 className="font-bold font-serif tracking-wide text-slate-800 text-sm md:text-lg">{domain}</h3>
            </div>

            <div className="w-full mt-4 flex flex-col items-center gap-2">
                {domainGoals.length === 0 ? (
                    <p className="text-[11px] md:text-xs text-center text-slate-500/80 font-medium">设置愿景</p>
                ) : (
                    <p className="text-[11px] text-center text-slate-600 font-medium">{domainGoals.length} 项愿景</p>
                )}

                {/* Subtle progress bar */}
                <div className="w-full bg-white/50 h-1.5 rounded-full overflow-hidden shadow-inner">
                    <div
                        className={`h-full ${progressPerc > 0 ? conf.color.replace('text-', 'bg-') : 'bg-transparent'} transition-all duration-500 ease-out`}
                        style={{ width: `${progressPerc}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
