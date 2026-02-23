import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { Goal } from '../store/useStore';
import { format } from 'date-fns';
import { X } from 'lucide-react';

interface GoalTimeModalProps {
    goal: Goal;
    onClose: () => void;
}

export default function GoalTimeModal({ goal, onClose }: GoalTimeModalProps) {
    const { updateGoal, setActiveModal } = useStore();

    // Lock body scroll when modal is open
    useEffect(() => {
        setActiveModal(`goal-time-${goal.id}`);
        document.body.style.overflow = 'hidden';
        return () => {
            setActiveModal(null);
            document.body.style.overflow = 'unset';
        };
    }, [goal.id, setActiveModal]);

    const [timeMode, setTimeMode] = useState<'daily' | 'weekly'>(goal.weeklyHours ? 'weekly' : 'daily');
    const [dailyMinutes, setDailyMinutes] = useState(goal.dailyMinutes?.toString() || '60');
    const [weeklyHours, setWeeklyHours] = useState(goal.weeklyHours?.toString() || '7');

    const [startDate, setStartDate] = useState(goal.startDate || format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(goal.endDate || '2026-12-31');

    const handleSave = () => {
        if (!startDate || !endDate) {
            alert('请填写起止日期');
            return;
        }
        if (new Date(endDate) < new Date(startDate)) {
            alert('结束日期不能早于开始日期');
            return;
        }

        updateGoal(goal.id, {
            startDate,
            endDate,
            dailyMinutes: timeMode === 'daily' ? parseInt(dailyMinutes, 10) : undefined,
            weeklyHours: timeMode === 'weekly' ? parseFloat(weeklyHours) : undefined,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-800">直接估算时间</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="text-sm font-medium text-slate-700 mb-2">目标：{goal.title}</div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">开始日期</label>
                            <input type="date" value={startDate} max="2027-02-22" onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">结束日期</label>
                            <input type="date" value={endDate} max="2027-02-22" onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="flex gap-4 mb-2">
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input type="radio" checked={timeMode === 'daily'} onChange={() => setTimeMode('daily')} className="text-primary-600 focus:ring-primary-500" />每天
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input type="radio" checked={timeMode === 'weekly'} onChange={() => setTimeMode('weekly')} className="text-primary-600 focus:ring-primary-500" />每周
                            </label>
                        </div>
                        {timeMode === 'daily' ? (
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">每日时长 (分钟)</label>
                                <input type="number" min="1" value={dailyMinutes} onChange={e => setDailyMinutes(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">每周总投入 (小时)</label>
                                <input type="number" min="0.5" step="0.5" value={weeklyHours} onChange={e => setWeeklyHours(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition">取消</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition">保存</button>
                </div>
            </div>
        </div>
    );
}
