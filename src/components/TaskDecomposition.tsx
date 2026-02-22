import { useState } from 'react';
import { useStore } from '../store/useStore';
import type { Goal, Task } from '../store/useStore';
import { Plus, Clock, Edit2, Trash2, AlertTriangle, BrainCircuit, Target, CheckCircle2, Calendar } from 'lucide-react';
import TaskModal from './TaskModal';
import GoalTimeModal from './GoalTimeModal';

export default function TaskDecomposition() {
    const { goals, tasks, removeTask, timeBudget } = useStore();
    const [activeGoalForTask, setActiveGoalForTask] = useState<Goal | null>(null);
    const [activeGoalForTime, setActiveGoalForTime] = useState<Goal | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isEvaluatingMode, setIsEvaluatingMode] = useState(false);

    // Group goals by domain
    const goalsByDomain: Record<string, Goal[]> = {};
    goals.forEach(g => {
        if (!goalsByDomain[g.domain]) goalsByDomain[g.domain] = [];
        goalsByDomain[g.domain].push(g);
    });

    // Time budget calculation
    const totalUsed = timeBudget.workHours + timeBudget.sleepHours + timeBudget.necessaryHours;
    const availableWeekly = 168 - totalUsed;

    let plannedWeeklyHours = 0;
    tasks.forEach(task => {
        if (!task.hidden) {
            if (task.weeklyHours) {
                plannedWeeklyHours += task.weeklyHours;
            } else if (task.dailyMinutes && task.weeklyFrequency) {
                plannedWeeklyHours += (task.dailyMinutes * task.weeklyFrequency) / 60;
            }
        }
    });

    goals.forEach(goal => {
        const goalTasks = tasks.filter(t => t.goalId === goal.id);
        if (goalTasks.length === 0) {
            if (goal.weeklyHours) {
                plannedWeeklyHours += goal.weeklyHours;
            } else if (goal.dailyMinutes) {
                plannedWeeklyHours += (goal.dailyMinutes * 7) / 60;
            }
        }
    });

    const isOverBudget = plannedWeeklyHours > availableWeekly;

    if (goals.length === 0) {
        return (
            <div className="bg-white rounded-[2rem] p-10 text-center border border-slate-100 shadow-soft max-w-4xl mx-auto flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Target className="text-slate-400" size={32} />
                </div>
                <h2 className="text-2xl font-bold font-serif text-slate-800 mb-2">任务拆解</h2>
                <p className="text-slate-500">请先在上方专属区域添加你的年度目标与愿景。</p>
            </div>
        );
    }

    return (
        <div className="bg-[#f8f9fa] rounded-[2.5rem] p-6 text-slate-800 shadow-soft border border-emerald-50 max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-50 text-indigo-500 rounded-[1.25rem] shadow-sm">
                        <Clock size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold font-serif text-slate-800">目标拆解与时间分配</h2>
                        <p className="text-sm text-slate-500 mt-1">为你的目标添加具体任务，追踪时间投入</p>
                    </div>
                </div>

                <div className="flex items-center gap-6 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Planned</span>
                        <span className={`text-xl font-bold font-serif ${isOverBudget ? 'text-red-500' : 'text-slate-700'}`}>
                            {plannedWeeklyHours.toFixed(1)} <span className="text-sm font-sans text-slate-400">h</span>
                        </span>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available</span>
                        <span className="text-xl font-bold font-serif text-emerald-500">
                            {availableWeekly.toFixed(1)} <span className="text-sm font-sans text-emerald-400">h</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Tutorial Header */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 space-y-2 text-center md:text-left">
                    <h3 className="text-lg font-bold text-slate-800">为什么要进行目标拆解？</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">目标往往是庞大且抽象的。通过将目标拆解为具体的“习惯类”或“项目类”任务，你才能将其排入每天的日程表，确保它被有效执行。</p>
                </div>
                <div className="flex-1 flex justify-center items-center gap-3">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex justify-center items-center text-indigo-500 mx-auto mb-2"><Target size={20} /></div>
                        <span className="text-xs font-bold text-slate-600">宏大目标</span>
                    </div>
                    <div className="text-slate-300">→</div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex justify-center items-center text-emerald-500 mx-auto mb-2"><CheckCircle2 size={20} /></div>
                        <span className="text-xs font-bold text-slate-600">每日习惯</span>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex justify-center items-center text-orange-500 mx-auto mb-2"><Target size={20} /></div>
                        <span className="text-xs font-bold text-slate-600">具体项目</span>
                    </div>
                </div>
            </div>

            {/* Over Budget Alert Module */}
            {isOverBudget && (
                <div className="bg-red-50/80 backdrop-blur-md rounded-[2rem] p-6 md:p-8 border border-red-100 shadow-soft relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                    <div className="absolute -right-10 -top-10 text-red-100/50 pointer-events-none">
                        <AlertTriangle size={150} />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <div className="flex-1 space-y-3">
                            <h3 className="text-xl font-bold text-red-800 flex items-center gap-2">
                                <AlertTriangle className="text-red-500" />
                                时间预算严重超支！
                            </h3>
                            <p className="text-red-600/80 text-sm leading-relaxed">
                                你规划的任务总耗时 ({plannedWeeklyHours.toFixed(1)}h) 已经超过了每周实际可用的时间 ({availableWeekly.toFixed(1)}h)。
                                贪多嚼不烂，为了保证执行率，请进行取舍。
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto">
                            <button
                                onClick={() => setIsEvaluatingMode(true)}
                                className="w-full py-3 px-5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition shadow-md flex justify-center items-center gap-2 group"
                            >
                                <BrainCircuit className="group-hover:rotate-12 transition-transform" size={20} />
                                启用智能取舍 (为任务打分)
                            </button>
                            <p className="text-xs text-red-400 text-center font-medium">或在下方手动删除部分任务</p>
                        </div>
                    </div>
                </div>
            )}

            {isEvaluatingMode && (
                <div className="bg-indigo-600 text-white rounded-[1.5rem] p-4 text-center shadow-lg sticky top-4 z-30 font-bold flex justify-between items-center px-6 animate-pulse">
                    <span>智能取舍模式已开启：请点击任务上的编辑按钮进行评分</span>
                    <button onClick={() => setIsEvaluatingMode(false)} className="text-indigo-200 hover:text-white px-3 py-1 bg-indigo-700 rounded-lg text-sm">关闭模式</button>
                </div>
            )}

            <div className="space-y-6">
                {Object.entries(goalsByDomain).map(([domain, domainGoals]) => (
                    <div key={domain} className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold font-serif text-slate-800 mb-6 flex items-center gap-3">
                            <span className="w-3 h-8 gradient-primary rounded-full inline-block shadow-sm"></span>
                            {domain}
                        </h3>

                        <div className="space-y-5">
                            {domainGoals.map(goal => {
                                const goalTasks = tasks.filter(t => t.goalId === goal.id);
                                const isDecomposed = goalTasks.length > 0;

                                return (
                                    <div key={goal.id} className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-slate-700 text-lg">{goal.title}</h4>
                                            {!isDecomposed && (
                                                <button
                                                    onClick={() => setActiveGoalForTime(goal)}
                                                    className="text-xs text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl font-bold transition hover:scale-105"
                                                >
                                                    直接估算时间
                                                </button>
                                            )}
                                        </div>

                                        {/* Direct Time Estimate Display */}
                                        {!isDecomposed && goal.startDate && (
                                            <div className="mb-4 text-sm text-slate-600 bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                                                <div className="space-y-1">
                                                    <p className="flex items-center gap-2 text-slate-500">
                                                        <Calendar size={14} /> {goal.startDate} - {goal.endDate}
                                                    </p>
                                                    <p className="font-medium text-slate-700 flex items-center gap-2">
                                                        <Clock size={14} className="text-indigo-400" />
                                                        {goal.weeklyHours ? `每周 ${goal.weeklyHours} 小时` : `每天 ${goal.dailyMinutes} 分钟`}
                                                    </p>
                                                </div>
                                                <button onClick={() => setActiveGoalForTime(goal)} className="text-slate-400 hover:text-indigo-600 p-2 bg-slate-50 rounded-full hover:bg-indigo-50 transition">
                                                    <Edit2 size={16} />
                                                </button>
                                            </div>
                                        )}

                                        {/* Task List */}
                                        {isDecomposed && (
                                            <div className="space-y-3 mb-4">
                                                {goalTasks.map(task => (
                                                    <div key={task.id} className={`bg-white border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-all ${isEvaluatingMode && !task.painScore ? 'border-red-300 shadow-md ring-2 ring-red-100' : 'border-slate-100 hover:shadow-soft'}`}>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <span className={`text-[11px] px-2.5 py-1 rounded-lg font-bold tracking-wider ${task.type === 'habit' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                                                    {task.type === 'habit' ? '习惯类' : '项目类'}
                                                                </span>
                                                                <span className={`font-bold text-slate-800 ${task.hidden ? 'line-through text-slate-400' : ''}`}>
                                                                    {task.title}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-slate-500 mt-2 flex items-center gap-3 font-medium">
                                                                <span className="flex items-center gap-1"><Calendar size={12} /> {task.startDate.slice(5)}/{task.endDate.slice(5)}</span>
                                                                <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                                                    <Clock size={12} />
                                                                    {task.weeklyHours ? `每周 ${task.weeklyHours}h` : `每天 ${task.dailyMinutes}m, 每周 ${task.weeklyFrequency}天`}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Optional Score Display in Evaluating Mode */}
                                                        {isEvaluatingMode && (
                                                            <div className="flex gap-2 text-xs font-bold mr-4 bg-slate-50 px-3 py-2 rounded-xl">
                                                                <span className="text-red-500">痛:{task.painScore || 0}</span>
                                                                <span className="text-orange-500">热:{task.passionScore || 0}</span>
                                                                <span className="text-blue-500">时:{task.timingScore || 0}</span>
                                                            </div>
                                                        )}

                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setEditingTask(task)}
                                                                className={`p-2 rounded-xl font-bold text-xs flex items-center gap-1 transition ${isEvaluatingMode ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}
                                                            >
                                                                <Edit2 size={16} /> {isEvaluatingMode ? '去打分' : ''}
                                                            </button>
                                                            <button onClick={() => removeTask(task.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition"><Trash2 size={16} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <button
                                            onClick={() => setActiveGoalForTask(goal)}
                                            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-sm font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition flex items-center justify-center gap-2"
                                        >
                                            <Plus size={18} /> 添加分离任务 (习惯 / 项目)
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
                    requireEvaluation={false}
                    onClose={() => setActiveGoalForTask(null)}
                />
            )}

            {editingTask && (
                <TaskModal
                    task={editingTask}
                    requireEvaluation={isEvaluatingMode}
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
