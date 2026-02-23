import { useState, useEffect } from 'react';
import { X, ArrowRight, Target, Calendar, BarChart3, Clock, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function RookieTutorial() {
    const { showTutorial, setShowTutorial } = useStore();
    const [step, setStep] = useState(0);

    useEffect(() => {
        const hasSeen = localStorage.getItem('hasSeenRookieTutorial');
        if (!hasSeen) {
            setShowTutorial(true);
        }
    }, [setShowTutorial]);

    const handleFinish = () => {
        localStorage.setItem('hasSeenRookieTutorial', 'true');
        setShowTutorial(false);
        setStep(0); // Reset for next time manual trigger
    };

    if (!showTutorial) return null;

    const steps = [
        {
            title: "欢迎来到 2026 年度计划",
            desc: "一个真正能帮你落地愿景的规划工具。让我们用 1 分钟了解它的核心逻辑。",
            icon: Sparkles,
            color: "text-indigo-500",
            bg: "bg-indigo-50"
        },
        {
            title: "第一步：确定年度愿景",
            desc: "在 3x3 宫格中，为 8 个生活领域写下你模糊的愿景（比如：身体健康）。不要担心不够具体，这里是播撒种子的地方。",
            icon: Target,
            color: "text-emerald-500",
            bg: "bg-emerald-50"
        },
        {
            title: "第二步：拆解为具体任务",
            desc: "将愿景拆解为『习惯类』或『项目类』任务。只有变成具体的动作，计划才有执行的可能。",
            icon: Calendar,
            color: "text-orange-500",
            bg: "bg-orange-50"
        },
        {
            title: "关键：动态时间预算",
            desc: "系统会根据你的项目周期，实时计算每一周的工作量。如果某个时间段负载过高，它会提醒你进行取舍。",
            icon: Clock,
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            title: "最后：生成你的年度报告",
            desc: "一切就绪后，你会获得一份精美的可视化报告，包含甘特图和时间分配明细，让你的 2026 触手可及。",
            icon: BarChart3,
            color: "text-purple-500",
            bg: "bg-purple-50"
        }
    ];

    const current = steps[step];
    const Icon = current.icon;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md transition-all">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-500">
                <button onClick={handleFinish} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition">
                    <X size={20} />
                </button>

                <div className="p-8 md:p-10 flex flex-col items-center text-center">
                    <div className={`w-20 h-20 ${current.bg} ${current.color} rounded-3xl flex items-center justify-center mb-8 shadow-sm transition-all duration-500 transform ${showTutorial ? 'scale-100' : 'scale-0'}`}>
                        <Icon size={40} />
                    </div>

                    <div className="space-y-4 mb-10 h-32">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 font-serif">{current.title}</h2>
                        <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                            {current.desc}
                        </p>
                    </div>

                    {/* Progress dots */}
                    <div className="flex gap-2 mb-10">
                        {steps.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-200'}`} />
                        ))}
                    </div>

                    <button
                        onClick={() => step < steps.length - 1 ? setStep(step + 1) : handleFinish()}
                        className="w-full py-4 gradient-primary text-white rounded-2xl font-bold text-lg shadow-soft-hover hover:scale-[1.02] transition flex items-center justify-center gap-2 group"
                    >
                        {step < steps.length - 1 ? (
                            <>
                                下一步 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        ) : (
                            "开启我的 2026 计划"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
