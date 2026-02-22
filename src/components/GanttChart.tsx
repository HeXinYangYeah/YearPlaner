import { useStore } from '../store/useStore';
import type { Task, Goal } from '../store/useStore';
import { differenceInDays, parseISO, startOfYear, endOfYear, getDayOfYear } from 'date-fns';

const DOMAIN_COLORS: Record<string, string> = {
    '学习成长': 'bg-gradient-to-r from-blue-400 to-blue-500 shadow-blue-200/50',
    '体验突破': 'bg-gradient-to-r from-rose-400 to-rose-500 shadow-rose-200/50',
    '休闲娱乐': 'bg-gradient-to-r from-pink-400 to-pink-500 shadow-pink-200/50',
    '工作事业': 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-indigo-200/50',
    '家庭生活': 'bg-gradient-to-r from-orange-400 to-orange-500 shadow-orange-200/50',
    '身体健康': 'bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-emerald-200/50',
    '财务理财': 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-amber-200/50',
    '人际社群': 'bg-gradient-to-r from-violet-400 to-violet-500 shadow-violet-200/50'
};

export default function GanttChart() {
    const { tasks, goals } = useStore();
    const visibleTasks = tasks.filter(t => !t.hidden);

    if (visibleTasks.length === 0) {
        return (
            <div className="bg-slate-50 rounded-3xl p-10 border border-slate-100 text-center">
                <p className="text-slate-500 font-medium">没有规划任何任务，无法生成甘特图。快去拆解目标吧！</p>
            </div>
        );
    }

    const currentYear = new Date().getFullYear();
    const yearStart = startOfYear(new Date(currentYear, 0, 1));
    const yearEnd = endOfYear(new Date(currentYear, 11, 31));
    const totalDays = differenceInDays(yearEnd, yearStart) + 1; // 365 or 366

    // Group tasks by goal Domain
    const grouped: Record<string, { task: Task; goal: Goal }[]> = {};

    visibleTasks.forEach(task => {
        const goal = goals.find(g => g.id === task.goalId);
        if (!goal) return;

        if (!grouped[goal.domain]) grouped[goal.domain] = [];
        grouped[goal.domain].push({ task, goal });
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <div className="w-full overflow-x-auto hide-scrollbars">
            <h3 className="text-2xl font-bold font-serif text-slate-800 mb-8">年度时间线 <span className="text-sm font-sans text-slate-400 font-normal ml-2">Timeline Overview</span></h3>

            <div className="min-w-[900px] mb-4">
                {/* Timeline Header */}
                <div className="flex border-b-2 border-slate-100 pb-3 mb-6 ml-[140px] relative">
                    {months.map((m) => (
                        <div key={m} className="flex-1 text-center">
                            <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">{m}</span>
                        </div>
                    ))}
                </div>

                {/* Rows by Domain */}
                <div className="space-y-8">
                    {Object.entries(grouped).map(([domain, items]) => (
                        <div key={domain} className="relative group/domain">
                            {/* Domain Label */}
                            <div className="text-sm font-bold text-slate-700 w-[130px] absolute left-0 top-1/2 -translate-y-1/2 pr-4 text-right">
                                {domain}
                            </div>

                            {/* Chart Area for this Domain */}
                            <div className="ml-[140px] relative bg-slate-50/50 py-3 rounded-2xl">
                                {/* Vertical Grid Lines */}
                                <div className="absolute inset-0 flex pointer-events-none">
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className="flex-1 border-r border-slate-200/50 last:border-0" />
                                    ))}
                                </div>

                                {/* Task Capsule Bars */}
                                <div className="relative min-h-[32px] space-y-3 px-2">
                                    {items.map(({ task }, idx) => {
                                        try {
                                            const start = parseISO(task.startDate);
                                            const end = parseISO(task.endDate);

                                            const displayStart = start < yearStart ? yearStart : start;
                                            const displayEnd = end > yearEnd ? yearEnd : end;

                                            if (displayEnd < displayStart) return null;

                                            const startDay = getDayOfYear(displayStart) - 1;
                                            const duration = differenceInDays(displayEnd, displayStart) + 1;

                                            const leftPct = (startDay / totalDays) * 100;
                                            const widthPct = (duration / totalDays) * 100;
                                            const gradientClass = DOMAIN_COLORS[domain] || 'bg-slate-400';

                                            return (
                                                <div key={task.id} className="relative h-8 group/task" style={{ marginTop: idx > 0 ? '12px' : '0' }}>
                                                    <div
                                                        className={`absolute h-full rounded-full shadow-md ${gradientClass} transition-transform hover:scale-[1.02] cursor-pointer flex items-center justify-center overflow-hidden`}
                                                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                                                        title={`${task.title} (${task.startDate} 至 ${task.endDate})`}
                                                    >
                                                        {widthPct > 8 && (
                                                            <span className="px-3 text-xs text-white font-bold truncate drop-shadow-sm pointer-events-none">
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
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
                .hide-scrollbars::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbars {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
