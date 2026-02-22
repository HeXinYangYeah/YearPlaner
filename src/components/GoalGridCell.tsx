import React from 'react';
import { useStore } from '../store/useStore';
import type { Domain } from '../store/useStore';
import { Target, TrendingUp, Heart, Users, BookOpen, Coffee, Star, Briefcase } from 'lucide-react';

const DOMAIN_ICONS: Record<string, React.ElementType> = {
    '职业发展': Briefcase,
    '财务': TrendingUp,
    '健康': Heart,
    '家庭': Users,
    '社交': Target,
    '学习': BookOpen,
    '休闲': Coffee,
    '个人成长': Star
};

interface GoalGridCellProps {
    domain: Domain;
    onClick: () => void;
}

export default function GoalGridCell({ domain, onClick }: GoalGridCellProps) {
    const { goals } = useStore();
    const domainGoals = goals.filter(g => g.domain === domain);
    const Icon = DOMAIN_ICONS[domain] || Target;

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-between cursor-pointer hover:shadow-md hover:border-primary-200 transition-all duration-300 group min-h-[120px]"
        >
            <div className="flex flex-col items-center gap-2 mb-2 w-full">
                <div className="p-3 bg-slate-50 rounded-full group-hover:bg-primary-50 transition-colors duration-300 text-slate-500 group-hover:text-primary-600">
                    <Icon size={24} />
                </div>
                <h3 className="font-semibold text-slate-700 text-sm md:text-base">{domain}</h3>
            </div>

            <div className="w-full flex-1 flex flex-col justify-end gap-1">
                {domainGoals.length === 0 ? (
                    <p className="text-xs text-center text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">点击添加目标</p>
                ) : (
                    domainGoals.map((g, i) => (
                        <div key={g.id} className="text-xs bg-slate-50 px-2 py-1 rounded truncate text-slate-600 border border-slate-100">
                            {i + 1}. {g.title}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
