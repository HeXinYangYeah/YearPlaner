import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { Goal, Task, TaskType } from '../store/useStore';
import { X, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface TaskModalProps {
    goal?: Goal;
    task?: Task;
    requireEvaluation?: boolean;
    onClose: () => void;
}

export default function TaskModal({ goal, task, requireEvaluation = false, onClose }: TaskModalProps) {
    const { addTask, updateTask, setActiveModal } = useStore();
    const isEditing = !!task;

    // Lock body scroll when modal is open
    useEffect(() => {
        setActiveModal(isEditing ? `task-edit-${task?.id}` : `task-add-${goal?.id}`);

        // Robust scroll lock for mobile
        const originalStyle = window.getComputedStyle(document.body).overflow;
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollBarWidth}px`;

        // Prevent touch move on body for iOS
        const preventDefault = (e: TouchEvent) => {
            if ((e.target as HTMLElement).closest('.modal-content-scrollable')) return;
            e.preventDefault();
        };
        document.addEventListener('touchmove', preventDefault, { passive: false });

        return () => {
            setActiveModal(null);
            document.body.style.overflow = originalStyle;
            document.body.style.paddingRight = '0px';
            document.removeEventListener('touchmove', preventDefault);
        };
    }, [isEditing, task, goal, setActiveModal]);

    const [title, setTitle] = useState(task?.title || '');
    const [type, setType] = useState<TaskType>(task?.type || 'project');
    const [timeMode, setTimeMode] = useState<'daily' | 'weekly'>(task?.weeklyHours ? 'weekly' : 'daily');

    const [dailyMinutes, setDailyMinutes] = useState(task?.dailyMinutes?.toString() || '30');
    const [weeklyFrequency, setWeeklyFrequency] = useState(task?.weeklyFrequency?.toString() || '5');
    const [weeklyHours, setWeeklyHours] = useState(task?.weeklyHours?.toString() || '2');

    const [startDate, setStartDate] = useState(task?.startDate || format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(task?.endDate || '2026-12-31');

    const [painScore, setPainScore] = useState(task?.painScore || 5);
    const [passionScore, setPassionScore] = useState(task?.passionScore || 5);
    const [timingScore, setTimingScore] = useState(task?.timingScore || 5);

    const handleSave = () => {
        if (!title.trim() || !startDate || !endDate) return;

        // Validate dates
        if (new Date(endDate) < new Date(startDate)) {
            alert('结束日期不能早于开始日期');
            return;
        }

        const baseData = {
            title: title.trim(),
            type,
            startDate,
            endDate,
            painScore,
            passionScore,
            timingScore,
            dailyMinutes: timeMode === 'daily' ? parseInt(dailyMinutes, 10) : undefined,
            weeklyFrequency: timeMode === 'daily' ? parseInt(weeklyFrequency, 10) : undefined,
            weeklyHours: timeMode === 'weekly' ? parseFloat(weeklyHours) : undefined,
        };

        if (isEditing && task) {
            updateTask(task.id, baseData);
        } else if (goal) {
            addTask({
                ...baseData,
                goalId: goal.id,
                hidden: false,
            } as any);
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800">
                        {isEditing ? '编辑任务' : `添加任务 · ${goal?.title}`}
                    </h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 modal-content-scrollable">
                    {/* Name & Type */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">任务名称</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="例如：每天背 50 个单词"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">任务类型</label>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                <button
                                    onClick={() => setType('habit')}
                                    className={`flex-1 py-1.5 text-sm rounded-lg font-medium transition ${type === 'habit' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    习惯类
                                </button>
                                <button
                                    onClick={() => setType('project')}
                                    className={`flex-1 py-1.5 text-sm rounded-lg font-medium transition ${type === 'project' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    项目类
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100"></div>

                    {/* Time & Dates */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Calendar size={18} className="text-primary-500" /> 时间安排</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">开始日期</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    max="2027-02-22"
                                    onChange={e => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">结束日期</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    max="2027-02-22"
                                    onChange={e => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex gap-4 mb-2">
                                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                    <input type="radio" checked={timeMode === 'daily'} onChange={() => setTimeMode('daily')} className="text-primary-600 focus:ring-primary-500" />
                                    按日设置
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                    <input type="radio" checked={timeMode === 'weekly'} onChange={() => setTimeMode('weekly')} className="text-primary-600 focus:ring-primary-500" />
                                    按周设置
                                </label>
                            </div>

                            {timeMode === 'daily' ? (
                                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">每日时长 (分钟)</label>
                                        <input type="number" min="1" value={dailyMinutes} onChange={e => setDailyMinutes(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">每周频率 (天)</label>
                                        <input type="number" min="1" max="7" value={weeklyFrequency} onChange={e => setWeeklyFrequency(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <label className="block text-xs text-slate-500 mb-1">每周总投入 (小时)</label>
                                    <input type="number" min="0.5" step="0.5" value={weeklyHours} onChange={e => setWeeklyHours(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Evaluation Scores - Only shown when requireEvaluation is true */}
                    {requireEvaluation && (
                        <div className="space-y-4">
                            <div className="h-px bg-slate-100"></div>
                            <h3 className="font-semibold text-slate-800 text-sm">评估打分 (1-10分) <span className="text-xs font-normal text-slate-400 ml-2">用于智能取舍</span></h3>

                            <div className="space-y-3">
                                <div className="flex items-center gap-4">
                                    <label className="w-20 text-xs text-slate-600 font-medium">痛苦分</label>
                                    <input type="range" min="1" max="10" value={painScore} onChange={e => setPainScore(parseInt(e.target.value))} className="flex-1 accent-red-500" />
                                    <span className="w-6 text-sm font-bold text-red-600 text-right">{painScore}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="w-20 text-xs text-slate-600 font-medium">热情分</label>
                                    <input type="range" min="1" max="10" value={passionScore} onChange={e => setPassionScore(parseInt(e.target.value))} className="flex-1 accent-orange-500" />
                                    <span className="w-6 text-sm font-bold text-orange-600 text-right">{passionScore}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="w-20 text-xs text-slate-600 font-medium">时机分</label>
                                    <input type="range" min="1" max="10" value={timingScore} onChange={e => setTimingScore(parseInt(e.target.value))} className="flex-1 accent-blue-500" />
                                    <span className="w-6 text-sm font-bold text-blue-600 text-right">{timingScore}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition">取消</button>
                    <button onClick={handleSave} disabled={!title.trim()} className="px-6 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 disabled:opacity-50 transition">保存</button>
                </div>
            </div>
        </div>
    );
}
