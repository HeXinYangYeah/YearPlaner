// Removed React import
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

    // Constraints logic
    const safeWeekly = Math.max(0, availableWeekly);
    const progressPerc = Math.min((safeWeekly / 168) * 100, 100);

    // SVG gauge circle params
    const radius = 64;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPerc / 100) * circumference;

    // Determine color based on availability
    const isScarce = safeWeekly < 20;

    return (
        <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-soft border border-emerald-50 max-w-5xl mx-auto relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">

                {/* Sliders Section */}
                <div className="flex-1 w-full space-y-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl shadow-sm">
                            <Clock size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold font-serif text-slate-800">时间预算 (Time Budget)</h2>
                            <p className="text-sm text-slate-500 mt-1">划定界限，计算你真正的“可支配时间”</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <SliderControl
                            label="每周工作/学习"
                            value={timeBudget.workHours}
                            onChange={(val: string) => handleUpdate('workHours', val)}
                            max={120}
                            color="bg-blue-500"
                            gradient="from-blue-400 to-blue-600"
                        />
                        <SliderControl
                            label="每周睡眠"
                            value={timeBudget.sleepHours}
                            onChange={(val: string) => handleUpdate('sleepHours', val)}
                            max={100}
                            color="bg-indigo-500"
                            gradient="from-indigo-400 to-indigo-600"
                        />
                        <SliderControl
                            label="每周必要杂务 (吃饭/通勤/家务)"
                            value={timeBudget.necessaryHours}
                            onChange={(val: string) => handleUpdate('necessaryHours', val)}
                            max={60}
                            color="bg-slate-500"
                            gradient="from-slate-400 to-slate-600"
                        />
                    </div>
                </div>

                {/* Gauge Section */}
                <div className="w-full md:w-auto flex flex-col items-center justify-center p-6 md:p-8 glass-panel rounded-[2rem] bg-slate-50/50 relative min-w-[320px]">
                    <h3 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-6">Available Time</h3>

                    <div className="relative flex justify-center items-center">
                        <svg className="transform -rotate-90 w-48 h-48">
                            <defs>
                                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#fb923c" /> {/* Orange */}
                                    <stop offset="100%" stopColor="#10b981" /> {/* Green */}
                                </linearGradient>
                            </defs>
                            {/* Background Track */}
                            <circle
                                cx="96" cy="96" r={radius}
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                className="text-slate-100"
                            />
                            {/* Progress Track */}
                            <circle
                                cx="96" cy="96" r={radius}
                                stroke="url(#gaugeGradient)"
                                strokeWidth="12"
                                strokeLinecap="round"
                                fill="transparent"
                                style={{
                                    strokeDasharray: circumference,
                                    strokeDashoffset: strokeDashoffset,
                                    transition: 'stroke-dashoffset 1s ease-out'
                                }}
                            />
                        </svg>

                        {/* Center Number Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className={`text-5xl font-black font-serif tracking-tighter ${isScarce ? 'text-orange-500' : 'text-emerald-500'}`}>
                                {safeWeekly}
                            </span>
                            <span className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Hrs / Wk</span>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <div className="text-sm text-slate-500 font-medium">年度总可支配</div>
                        <div className="text-2xl font-bold text-slate-800 font-serif mt-1">
                            {availableYearly} <span className="text-sm font-sans text-slate-400">小时</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

// Sub-component for custom interactive slider
function SliderControl({ label, value, onChange, max, color, gradient }: any) {
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <div className="w-full relative group">
            <div className="flex justify-between items-end mb-2">
                <label className="text-sm font-bold text-slate-700">{label}</label>
                <div className="flex items-center gap-1">
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-14 text-right bg-transparent text-lg font-bold text-slate-800 outline-none border-b-2 border-transparent focus:border-slate-300 transition-colors"
                        min="0"
                        max={max}
                    />
                    <span className="text-xs font-bold text-slate-400">h</span>
                </div>
            </div>

            <div className="relative h-3 bg-slate-100 rounded-full flex items-center">
                {/* Active progress bar */}
                <div
                    className={`absolute left-0 h-full rounded-full bg-gradient-to-r ${gradient} shadow-sm group-hover:brightness-110 transition-all`}
                    style={{ width: `${percentage}%` }}
                ></div>

                {/* The actual native range slider perfectly layered continuously on top for native drag logic */}
                <input
                    type="range"
                    min="0"
                    max={max}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                {/* Custom thumb to replace the hidden native one visually */}
                <div
                    className={`absolute h-5 w-5 bg-white rounded-full shadow-md border-2 border-white pointer-events-none transition-transform group-hover:scale-110 z-0 ${color}`}
                    style={{ left: `calc(${percentage}% - 10px)` }}
                ></div>
            </div>
        </div>
    );
}
