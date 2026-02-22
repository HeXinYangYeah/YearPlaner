import { useStore } from '../store/useStore';
import type { Goal, Task } from '../store/useStore';

export default function FinalTaskList() {
    const { tasks, goals } = useStore();
    const visibleTasks = tasks.filter(t => !t.hidden);

    if (visibleTasks.length === 0) return null;

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
            <h3 className="text-2xl font-bold font-serif text-slate-800 mb-8 border-b-2 border-emerald-50 pb-4">年度计划最终清单</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Object.entries(domains).map(([domain, domainItems]) => (
                    <div key={domain} className="bg-slate-50/80 p-6 rounded-3xl border border-slate-100 hover:shadow-soft transition-all duration-300">
                        <h4 className="font-bold text-lg text-indigo-600 mb-4 flex items-center gap-2">
                            <span className="w-2 h-6 gradient-primary rounded-full"></span>
                            {domain}
                        </h4>
                        <div className="space-y-6">
                            {domainItems.map(({ goal, tasks: goalTasks }) => (
                                <div key={goal.id} className="space-y-3">
                                    {goalTasks.length > 0 ? (
                                        <ul className="space-y-3">
                                            {goalTasks.map((task) => (
                                                <li key={task.id} className="text-sm group">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                                                        <span className="text-slate-600 group-hover:text-indigo-600 transition-colors font-medium">{task.title}</span>
                                                    </div>
                                                    <div className="text-[10px] font-medium text-slate-400 mt-1 ml-3.5 bg-white px-2 py-0.5 rounded-md border border-slate-100 inline-block font-sans">
                                                        {task.startDate.slice(5)} - {task.endDate.slice(5)}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex gap-2 items-start">
                                                <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                                </div>
                                                <span className="font-bold text-slate-800">{goal.title}</span>
                                            </div>
                                            <div className="ml-7 text-xs text-slate-400 italic bg-white/50 p-2 rounded-xl border border-dashed border-slate-200 font-sans">
                                                愿景待拆解：拟在 {goal.startDate?.slice(5) || '??-??'} 开始投入
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
