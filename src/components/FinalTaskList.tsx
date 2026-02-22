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
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">年度计划最终清单</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(grouped).map(([domain, domainTasks]) => (
                    <div key={domain} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <h4 className="font-bold text-primary-700 mb-3 border-b border-primary-100 pb-2">{domain}</h4>
                        <ul className="space-y-2">
                            {domainTasks.map((task, i) => (
                                <li key={task.id} className="text-sm text-slate-700 flex items-start gap-2">
                                    <span className="text-primary-400 font-medium mt-0.5">{i + 1}.</span>
                                    <div>
                                        <span className="font-medium">{task.title}</span>
                                        <div className="text-xs text-slate-500 mt-0.5">{task.startDate} 至 {task.endDate}</div>
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
