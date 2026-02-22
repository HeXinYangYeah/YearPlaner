import { useStore } from '../store/useStore';

export default function FinalTaskList() {
    const { tasks, goals } = useStore();
    const visibleTasks = tasks.filter(t => !t.hidden);

    if (visibleTasks.length === 0) return null;

    // Group tasks by domain via goal
    const grouped: Record<string, typeof visibleTasks> = {};
    visibleTasks.forEach(task => {
        const goal = goals.find(g => g.id === task.goalId);
        if (!goal) return;
        if (!grouped[goal.domain]) grouped[goal.domain] = [];
        grouped[goal.domain].push(task);
    });

    return (
        <div className="w-full">
            <h3 className="text-2xl font-bold font-serif text-slate-800 mb-8 border-b-2 border-emerald-50 pb-4">年度计划最终清单</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Object.entries(grouped).map(([domain, domainTasks]) => (
                    <div key={domain} className="bg-slate-50/80 p-6 rounded-3xl border border-slate-100 hover:shadow-soft transition-all duration-300">
                        <h4 className="font-bold text-lg text-indigo-600 mb-4 flex items-center gap-2">
                            <span className="w-2 h-6 gradient-primary rounded-full"></span>
                            {domain}
                        </h4>
                        <ul className="space-y-4">
                            {domainTasks.map((task, i) => (
                                <li key={task.id} className="text-sm flex gap-3 group">
                                    <span className="text-indigo-300 font-bold mt-0.5 bg-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm shrink-0">
                                        {i + 1}
                                    </span>
                                    <div>
                                        <span className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{task.title}</span>
                                        <div className="text-xs font-medium text-slate-400 mt-1 bg-white px-2 py-1 rounded-md border border-slate-100 inline-block">
                                            {task.startDate.slice(5)} - {task.endDate.slice(5)}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
