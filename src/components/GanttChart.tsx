import { useStore } from '../store/useStore';
import type { Task, Goal } from '../store/useStore';
import { differenceInDays, parseISO, startOfYear, endOfYear, getDayOfYear } from 'date-fns';

const DOMAIN_COLORS: Record<string, string> = {
    '职业发展': 'bg-blue-500',
    '财务': 'bg-emerald-500',
    '健康': 'bg-red-500',
    '家庭': 'bg-orange-500',
    '社交': 'bg-purple-500',
    '学习': 'bg-indigo-500',
    '休闲': 'bg-pink-500',
    '个人成长': 'bg-amber-500'
};

export default function GanttChart() {
    const { tasks, goals } = useStore();
    const visibleTasks = tasks.filter(t => !t.hidden);

    if (visibleTasks.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm text-center">
                <p className="text-slate-500">没有规划任何任务，无法生成甘特图。</p>
            </div>
        );
    }

    // Find overall min/max year from tasks just to establish the boundary
    const currentYear = new Date().getFullYear();
    const yearStart = startOfYear(new Date(currentYear, 0, 1));
    const yearEnd = endOfYear(new Date(currentYear, 11, 31));
    const totalDays = differenceInDays(yearEnd, yearStart) + 1; // usually 365 or 366

    // Group tasks by goal Domain
    const grouped: Record<string, { task: Task; goal: Goal }[]> = {};

    visibleTasks.forEach(task => {
        const goal = goals.find(g => g.id === task.goalId);
        if (!goal) return;

        if (!grouped[goal.domain]) grouped[goal.domain] = [];
        grouped[goal.domain].push({ task, goal });
    });

    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm overflow-x-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-6">年度甘特图全景</h3>

            <div className="min-w-[800px]">
                {/* Timeline Header */}
                <div className="flex border-b border-slate-200 pb-2 mb-4 ml-[120px]">
                    {months.map((m, i) => (
                        <div key={m} className={`flex-1 text-center text-xs font-semibold text-slate-500 border-l border-slate-100 ${i === 0 ? 'border-l-0' : ''}`}>
                            {m}
                        </div>
                    ))}
                </div>

                {/* Rows */}
                <div className="space-y-6">
                    {Object.entries(grouped).map(([domain, items]) => (
                        <div key={domain} className="relative">
                            <div className="text-sm font-bold text-slate-700 mb-2 truncate w-[110px] absolute left-0 top-0">
                                {domain}
                            </div>
                            <div className="ml-[120px] space-y-2 relative border-l border-r border-slate-100 bg-slate-50/50 py-2 rounded-xl">
                                {/* Background grid */}
                                <div className="absolute inset-0 flex pointer-events-none">
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className="flex-1 border-r border-slate-200/50 last:border-0" />
                                    ))}
                                </div>

                                {/* Task Bars */}
                                {items.map(({ task }) => {
                                    try {
                                        const start = parseISO(task.startDate);
                                        const end = parseISO(task.endDate);

                                        // Constrain to current year
                                        const displayStart = start < yearStart ? yearStart : start;
                                        const displayEnd = end > yearEnd ? yearEnd : end;

                                        if (displayEnd < displayStart) return null; // out of scope

                                        const startDay = getDayOfYear(displayStart) - 1;
                                        const duration = differenceInDays(displayEnd, displayStart) + 1;

                                        const leftPct = (startDay / totalDays) * 100;
                                        const widthPct = (duration / totalDays) * 100;
                                        const color = DOMAIN_COLORS[domain] || 'bg-slate-500';

                                        return (
                                            <div key={task.id} className="relative h-6 group">
                                                <div
                                                    className={`absolute h-full rounded-md shadow-sm ${color} opacity-80 group-hover:opacity-100 transition-all cursor-pointer`}
                                                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                                                    title={`${task.title} (${task.startDate} 至 ${task.endDate})`}
                                                >
                                                    {widthPct > 5 && (
                                                        <span className="absolute inset-0 flex items-center px-2 text-[10px] text-white font-medium truncate pointer-events-none">
                                                            {task.title}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    } catch (e) {
                                        return null;
                                    }
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
