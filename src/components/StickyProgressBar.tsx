import { useState } from 'react';
import { useStore } from '../store/useStore';
import { differenceInDays, parseISO } from 'date-fns';
import EvaluationModal from './EvaluationModal';

export default function StickyProgressBar() {
    const { timeBudget, tasks } = useStore();
    const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);

    const totalUsed = timeBudget.workHours + timeBudget.sleepHours + timeBudget.necessaryHours;
    const availableWeekly = 168 - totalUsed;
    const overallAnnualBudget = availableWeekly * 52;

    // Calculate planned time
    // Formula: for each task not hidden:
    // Weeks = difference in days / 7
    // cost = (dailyMinutes * 7 / 60 OR weeklyHours) * Weeks
    let plannedAnnualHours = 0;

    // Helper to calculate cost
    const calculateCost = (item: { startDate?: string, endDate?: string, weeklyHours?: number, dailyMinutes?: number, weeklyFrequency?: number }) => {
        try {
            if (!item.startDate || !item.endDate) return 0;
            const start = parseISO(item.startDate);
            const end = parseISO(item.endDate);
            const days = differenceInDays(end, start) + 1; // inclusive
            if (days <= 0) return 0;

            const weeks = days / 7;
            let weeklyCost = 0;

            if (item.weeklyHours) {
                weeklyCost = item.weeklyHours;
            } else if (item.dailyMinutes) {
                // Goals only have dailyMinutes (assume 7 days), Tasks have dailyMinutes * weeklyFrequency
                const freq = item.weeklyFrequency || 7;
                weeklyCost = (item.dailyMinutes * freq) / 60;
            }

            return weeklyCost * weeks;
        } catch (e) {
            return 0;
        }
    };

    tasks.filter(t => !t.hidden).forEach(task => {
        plannedAnnualHours += calculateCost(task);
    });

    const { goals } = useStore.getState();
    goals.forEach(goal => {
        const goalTasks = tasks.filter(t => t.goalId === goal.id);
        if (goalTasks.length === 0) {
            plannedAnnualHours += calculateCost(goal);
        }
    });

    const rawPercent = overallAnnualBudget > 0 ? (plannedAnnualHours / overallAnnualBudget) * 100 : 0;
    const percent = Math.min(rawPercent, 100);
    const overBudget = rawPercent > 100;

    let barColor = 'bg-emerald-500';
    if (rawPercent > 80 && rawPercent <= 100) barColor = 'bg-amber-500';
    if (overBudget) barColor = 'bg-red-500';

    return (
        <>
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm px-4 py-3">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4">

                    <div className="w-full flex-1">
                        <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-slate-600">已规划耗时: {Math.round(plannedAnnualHours)} 小时</span>
                            <span className="text-slate-500">年度预算: {overallAnnualBudget} 小时</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h - full ${barColor} transition - all duration - 500`}
                                style={{ width: `${percent}% ` }}
                            />
                        </div>
                    </div>

                    <div className="flex-shrink-0 flex items-center gap-3">
                        {overBudget && (
                            <span className="text-xs font-bold text-red-600 animate-pulse">
                                超支 {Math.round(plannedAnnualHours - overallAnnualBudget)} 小时！
                            </span>
                        )}
                        <button
                            onClick={() => setIsEvaluationOpen(true)}
                            className={`px - 4 py - 2 rounded - xl text - sm font - bold transition - all ${overBudget
                                ? 'bg-red-100 text-red-700 hover:bg-red-200 ring-2 ring-red-400 ring-offset-1'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                } `}
                        >
                            智能评估
                        </button>
                    </div>

                </div>
            </div>
            <EvaluationModal
                isOpen={isEvaluationOpen}
                onClose={() => setIsEvaluationOpen(false)}
            />
        </>
    );
}
