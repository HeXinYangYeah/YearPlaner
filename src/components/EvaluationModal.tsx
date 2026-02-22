import { useStore } from '../store/useStore';
import type { Task } from '../store/useStore';
import { X, AlertTriangle, EyeOff, CheckCircle } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

interface EvaluationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function EvaluationModal({ isOpen, onClose }: EvaluationModalProps) {
    const { tasks, timeBudget, hideTask } = useStore();

    if (!isOpen) return null;

    const totalUsed = timeBudget.workHours + timeBudget.sleepHours + timeBudget.necessaryHours;
    const availableWeekly = 168 - totalUsed;
    const overallAnnualBudget = availableWeekly * 52;

    // Helper
    const getTaskCost = (task: Task) => {
        try {
            if (!task.startDate || !task.endDate) return 0;
            const start = parseISO(task.startDate);
            const end = parseISO(task.endDate);
            const days = differenceInDays(end, start) + 1;
            if (days <= 0) return 0;

            const weeks = days / 7;
            let weeklyCost = 0;

            if (task.weeklyHours) {
                weeklyCost = task.weeklyHours;
            } else if (task.dailyMinutes && task.weeklyFrequency) {
                weeklyCost = (task.dailyMinutes * task.weeklyFrequency) / 60;
            }

            return weeklyCost * weeks;
        } catch (e) {
            return 0;
        }
    };

    // Only consider unhidden tasks for the over-budget calculation
    const visibleTasks = tasks.filter(t => !t.hidden);
    let plannedAnnualHours = 0;
    visibleTasks.forEach(t => {
        plannedAnnualHours += getTaskCost(t);
    });

    // We need to also add undecomposed goals cost ideally, but for simplicity of this modal
    // we focus on tasks. Let's assume the overage is what we have right now.
    const overage = Math.round(plannedAnnualHours - overallAnnualBudget);
    const isOverBudget = overage > 0;

    // Sort tasks by total score descending (Highest score = keep, lowest score = candidates for hiding)
    // Actually, we want to hide the lowest ones. So we show them in some order (maybe ascending, so lowest is on top to be hidden)
    // Let's show ascending so the lowest priority is at the top of the "chopping block".
    const sortedTasks = [...visibleTasks].sort((a, b) => {
        const scoreA = a.painScore + a.passionScore + a.timingScore;
        const scoreB = b.painScore + b.passionScore + b.timingScore;
        return scoreA - scoreB; // Ascending: lowest score first
    });

    const hideLowestScoreTask = () => {
        if (sortedTasks.length === 0) return;
        hideTask(sortedTasks[0].id);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-2 text-slate-800">
                        <AlertTriangle className={isOverBudget ? "text-red-500" : "text-emerald-500"} />
                        <h2 className="text-xl font-bold">智能任务评估</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    <div className="max-w-xl mx-auto text-center mb-8">
                        {isOverBudget ? (
                            <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 mb-6">
                                <p className="font-bold text-lg mb-1">年度时间已超支 {overage} 小时！</p>
                                <p className="text-sm opacity-90">你的计划大于你拥有的时间。系统已根据你的评估打分将任务排序，建议暂停或暂缓低分任务。</p>
                            </div>
                        ) : (
                            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 mb-6">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <CheckCircle size={24} />
                                    <p className="font-bold text-lg">时间预算健康</p>
                                </div>
                                <p className="text-sm opacity-90">合理的时间规划是成功的第一步，继续保持！</p>
                            </div>
                        )}

                        {isOverBudget && sortedTasks.length > 0 && (
                            <button
                                onClick={hideLowestScoreTask}
                                className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
                            >
                                <EyeOff size={18} />
                                暂缓最低分任务 ({sortedTasks[0].title})
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-800 px-2 text-lg">已规划任务优先级列表 <span className="text-xs font-normal text-slate-500 ml-2">(按总分总升序排列，位于顶部的任务建议优先舍弃)</span></h3>

                        <div className="grid gap-3">
                            {sortedTasks.map((task) => {
                                const totalScore = task.painScore + task.passionScore + task.timingScore;
                                const cost = Math.round(getTaskCost(task));

                                return (
                                    <div key={task.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                                        <div className="flex-1 min-w-0 w-full">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-slate-800 truncate">{task.title}</span>
                                                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">耗时: {cost}h</span>
                                            </div>
                                            <div className="flex gap-4 text-xs text-slate-500">
                                                <span>痛苦: <b className="text-red-500">{task.painScore}</b></span>
                                                <span>热情: <b className="text-orange-500">{task.passionScore}</b></span>
                                                <span>时机: <b className="text-blue-500">{task.timingScore}</b></span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                            <div className="text-center">
                                                <div className="text-xs text-slate-400 font-medium mb-0.5">总分</div>
                                                <div className="text-2xl font-black text-slate-800">{totalScore}</div>
                                            </div>
                                            <button
                                                onClick={() => hideTask(task.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition flex items-center gap-1 text-sm font-medium"
                                            >
                                                <EyeOff size={16} /> <span className="md:hidden">暂缓</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {sortedTasks.length === 0 && (
                                <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 border-dashed text-slate-500">
                                    当前没有未隐藏的任务
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
