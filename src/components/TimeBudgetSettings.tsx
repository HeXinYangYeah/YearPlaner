import { useStore } from '../store/useStore';
import { Clock } from 'lucide-react';

export default function TimeBudgetSettings() {
    const { timeBudget, updateTimeBudget } = useStore();

    const handleUpdate = (field: keyof typeof timeBudget, value: string) => {
        const num = parseInt(value, 10);
        if (!isNaN(num) && num >= 0) {
            updateTimeBudget({ [field]: num });
        }
    };

    const totalUsed = timeBudget.workHours + timeBudget.sleepHours + timeBudget.necessaryHours;
    const availableWeekly = 168 - totalUsed;
    const availableYearly = availableWeekly * 52;

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 max-w-4xl mx-auto mt-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <Clock size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">年度时间预算</h2>
                    <p className="text-sm text-slate-500">每周 168 小时，减去固定支出，算出你的可支配时间</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">每周工作/学习 (小时)</label>
                    <input
                        type="number"
                        value={timeBudget.workHours}
                        onChange={(e) => handleUpdate('workHours', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">每周睡眠 (小时)</label>
                    <input
                        type="number"
                        value={timeBudget.sleepHours}
                        onChange={(e) => handleUpdate('sleepHours', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">每周必要杂务 (小时)</label>
                    <input
                        type="number"
                        value={timeBudget.necessaryHours}
                        onChange={(e) => handleUpdate('necessaryHours', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                </div>
            </div>

            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between">
                <div>
                    <div className="text-slate-300 text-sm font-medium">理论可用时间</div>
                    <div className="flex items-end gap-2 mt-1">
                        <span className="text-4xl font-black">{availableWeekly}</span>
                        <span className="text-slate-400 mb-1">小时/周</span>
                    </div>
                </div>
                <div className="hidden md:block w-px h-12 bg-slate-700"></div>
                <div className="mt-4 md:mt-0">
                    <div className="text-slate-300 text-sm font-medium">年度总可支配时间</div>
                    <div className="flex items-end gap-2 mt-1">
                        <span className="text-4xl font-black text-amber-400">{availableYearly}</span>
                        <span className="text-slate-400 mb-1">小时/年</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
