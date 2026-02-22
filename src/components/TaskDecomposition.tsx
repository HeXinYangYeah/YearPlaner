import { useState } from 'react';
import { useStore } from '../store/useStore';
import type { Goal, Task } from '../store/useStore';
import { Plus, Clock, Edit2, Trash2 } from 'lucide-react';
import TaskModal from './TaskModal';
import GoalTimeModal from './GoalTimeModal';

export default function TaskDecomposition() {
    const { goals, tasks, removeTask } = useStore();
    const [activeGoalForTask, setActiveGoalForTask] = useState<Goal | null>(null);
    const [activeGoalForTime, setActiveGoalForTime] = useState<Goal | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // Group goals by domain
    const goalsByDomain: Record<string, Goal[]> = {};
    goals.forEach(g => {
        if (!goalsByDomain[g.domain]) goalsByDomain[g.domain] = [];
        goalsByDomain[g.domain].push(g);
    });

    if (goals.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm max-w-4xl mx-auto">
                <h2 className="text-xl font-bold text-slate-800 mb-2">任务分解</h2>
                <p className="text-slate-500">请先在上方九宫格中添加目标。</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                    <Clock size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">目标拆解与时间分配</h2>
                    <p className="text-sm text-slate-500">为你的目标添加具体任务，或直接估算目标耗时</p>
                </div>
            </div>

            <div className="space-y-8">
                {Object.entries(goalsByDomain).map(([domain, domainGoals]) => (
                    <div key={domain}>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="w-2 h-6 bg-primary-500 rounded-full inline-block"></span>
                            {domain}
                        </h3>

                        <div className="space-y-4">
                            {domainGoals.map(goal => {
                                const goalTasks = tasks.filter(t => t.goalId === goal.id);
                                const isDecomposed = goalTasks.length > 0;

                                return (
                                    <div key={goal.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-semibold text-slate-700">{goal.title}</h4>
                                            {!isDecomposed && (
                                                <button
                                                    onClick={() => setActiveGoalForTime(goal)}
                                                    className="text-xs text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg font-medium transition"
                                                >
                                                    直接估算时间
                                                </button>
                                            )}
                                        </div>

                                        {/* Direct Time Estimate Display */}
                                        {!isDecomposed && goal.startDate && (
                                            <div className="mb-3 text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                                                <div>
                                                    <p>起止：{goal.startDate} 至 {goal.endDate}</p>
                                                    <p>投入：{goal.weeklyHours ? `每周 ${goal.weeklyHours} 小时` : `每天 ${goal.dailyMinutes} 分钟`}</p>
                                                </div>
                                                <button onClick={() => setActiveGoalForTime(goal)} className="text-slate-400 hover:text-primary-600 p-2">
                                                    <Edit2 size={16} />
                                                </button>
                                            </div>
                                        )}

                                        {/* Task List */}
                                        {isDecomposed && (
                                            <div className="space-y-2 mb-3">
                                                {goalTasks.map(task => (
                                                    <div key={task.id} className="bg-white border border-slate-100 rounded-xl p-3 flex justify-between items-center group">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${task.type === 'habit' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                                                    {task.type === 'habit' ? '习惯类' : '项目类'}
                                                                </span>
                                                                <span className="font-medium text-slate-800 text-sm line-through decoration-slate-300">
                                                                    {task.hidden ? <span className="text-slate-400">{task.title} (已隐藏)</span> : task.title}
                                                                </span>
                                                                {!task.hidden && <span className="font-medium text-slate-800 text-sm">{task.title}</span>}
                                                            </div>
                                                            <div className="text-xs text-slate-500 mt-1">
                                                                {task.startDate} 至 {task.endDate} ·
                                                                {task.weeklyHours ? ` 每周 ${task.weeklyHours}h` : ` 每天 ${task.dailyMinutes}m, 每周 ${task.weeklyFrequency}天`}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => setEditingTask(task)} className="p-1.5 text-slate-400 hover:text-primary-600 rounded-lg hover:bg-slate-50"><Edit2 size={16} /></button>
                                                            <button onClick={() => removeTask(task.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"><Trash2 size={16} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <button
                                            onClick={() => setActiveGoalForTask(goal)}
                                            className="w-full py-2 border border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50 transition flex items-center justify-center gap-1"
                                        >
                                            <Plus size={16} /> 添加分离任务
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {activeGoalForTask && (
                <TaskModal
                    goal={activeGoalForTask}
                    onClose={() => setActiveGoalForTask(null)}
                />
            )}

            {editingTask && (
                <TaskModal
                    task={editingTask}
                    onClose={() => setEditingTask(null)}
                />
            )}

            {activeGoalForTime && (
                <GoalTimeModal
                    goal={activeGoalForTime}
                    onClose={() => setActiveGoalForTime(null)}
                />
            )}
        </div>
    );
}
