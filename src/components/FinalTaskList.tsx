import { useStore } from '../store/useStore';
import type { Goal, Task } from '../store/useStore';
import { isActiveInMonth } from '../utils/reportUtils';

interface FinalTaskListProps {
    selectedMonth: number | 'ALL';
}

export default function FinalTaskList({ selectedMonth }: FinalTaskListProps) {
    const { tasks, goals } = useStore();
    const visibleTasks = tasks.filter(t => !t.hidden);

    if (visibleTasks.length === 0 && goals.length === 0) return null;

    // Group goals by domain and include their tasks
    const domains: Record<string, { goal: Goal; tasks: Task[] }[]> = {};

    goals.forEach(goal => {
        if (!domains[goal.domain]) domains[goal.domain] = [];
        const goalTasks = tasks.filter(t => t.goalId === goal.id && !t.hidden);
        domains[goal.domain].push({ goal, tasks: goalTasks });
    });

    if (Object.keys(domains).length === 0) return null;

    return (
        <div className="w-full">
            <h3 className="text-2xl font-bold font-serif text-slate-800 dark:text-slate-100 mb-8 border-b-2 border-emerald-50 dark:border-slate-800 pb-4">
                {selectedMonth === 'ALL' ? '年度计划最终清单' : `${selectedMonth + 1}月焦点任务`}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Object.entries(domains).map(([domain, domainItems]) => (
                    <div key={domain} className="bg-slate-50/80 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 hover:shadow-soft transition-all duration-300">
                        <h4 className="font-bold text-lg text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-2">
                            <span className="w-2 h-6 gradient-primary rounded-full"></span>
                            {domain}
                        </h4>
                        <div className="space-y-6">
                            {domainItems.map(({ goal, tasks: goalTasks }) => {
                                const isGoalActive = selectedMonth === 'ALL' || isActiveInMonth(goal, 2026, selectedMonth);

                                return (
                                    <div key={goal.id} className="space-y-3">
                                        {goalTasks.length > 0 ? (
                                            <ul className="space-y-3">
                                                {goalTasks.map((task) => {
                                                    const isTaskActive = selectedMonth === 'ALL' || isActiveInMonth(task, 2026, selectedMonth);

                                                    return (
                                                        <li key={task.id} className={`text-sm group transition-opacity duration-300 ${!isTaskActive ? 'opacity-30 grayscale' : 'opacity-100'}`}>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`w-1.5 h-1.5 rounded-full ${isTaskActive ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                                                                <span className="text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-medium">
                                                                    {task.title}
                                                                </span>
                                                            </div>
                                                            <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1 ml-3.5 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800 inline-block font-sans">
                                                                {task.startDate.slice(5)} - {task.endDate.slice(5)}
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        ) : (
                                            <div className={`space-y-2 transition-opacity duration-300 ${!isGoalActive ? 'opacity-30 grayscale' : 'opacity-100'}`}>
                                                <div className="flex gap-2 items-start">
                                                    <div className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                                        <div className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full"></div>
                                                    </div>
                                                    <span className="font-bold text-slate-800 dark:text-slate-200">{goal.title}</span>
                                                </div>
                                                <div className="ml-7 text-xs text-slate-400 dark:text-slate-500 italic bg-white/50 dark:bg-slate-800/50 p-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 font-sans">
                                                    愿景待拆解：拟在 {goal.startDate?.slice(5) || '??-??'} 开始投入
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
