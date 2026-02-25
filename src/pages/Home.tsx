import { useState } from 'react';
import { ChevronRight, ChevronLeft, Calendar, BarChart3, ListTodo, HelpCircle, Loader2 } from 'lucide-react';
import GoalGrid from '../components/GoalGrid';
import TimeBudgetSettings from '../components/TimeBudgetSettings';
import TaskDecomposition from '../components/TaskDecomposition';
import { useStore } from '../store/useStore';

const STEPS = [
    { id: 1, title: '愿景目标', icon: Calendar, description: '定义你的 2026 年度核心主题与八大领域目标' },
    { id: 2, title: '时间预算', icon: BarChart3, description: '分配每周时间，确保计划的可执行性' },
    { id: 3, title: '行动分解', icon: ListTodo, description: '将目标拆解为具体的习惯与项目任务' }
];

export default function Home() {
    const [currentStep, setCurrentStep] = useState(1);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isConsumingUsage, setIsConsumingUsage] = useState(false);
    const { setShowTutorial, showTutorial, theme, goals, activeModal } = useStore();

    const validateStep = (step: number) => {
        if (step === 1) {
            if (!theme || theme === '我的年度主题' || theme === '填写年度主题' || theme.trim() === '') {
                return '请输入你的 2026 年度主题。';
            }
            const domains = ['学习成长', '体验突破', '休闲娱乐', '工作事业', '家庭生活', '身体健康', '财务理财', '人际社群'];
            const filledDomains = new Set(goals.map(g => g.domain));
            const missingDomains = domains.filter(d => !filledDomains.has(d as any));
            if (missingDomains.length > 0) {
                return `还有一些领域没有填写愿景：${missingDomains.join('、')}。请点击空格子填写内容。`;
            }
        }
        return null;
    };

    const nextStep = async () => {
        const error = validateStep(currentStep);
        if (error) {
            setValidationError(error);
            setTimeout(() => setValidationError(null), 5000);
            return;
        }

        // If moving from Step 1 to Step 2, validate and consume access code usage
        if (currentStep === 1) {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');

            if (!code) {
                setValidationError('未检测到有效邀请码，无法继续。请通过专属链接重新访问。');
                setTimeout(() => setValidationError(null), 5000);
                return;
            }

            setIsConsumingUsage(true);
            try {
                const response = await fetch('/api/consume-usage', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code })
                });

                const text = await response.text();
                let result: any = {};
                try {
                    result = JSON.parse(text);
                } catch {
                    console.error('Server returned non-JSON:', text);
                    throw new Error('服务器返回了无效的响应，请检查 Vercel 后端配置（环境变量是否已设置）。');
                }

                if (response.ok && result.data && result.data.success) {
                    console.log('Usage consumed successfully');
                } else {
                    throw new Error(result.error || '扣除使用次数失败');
                }
            } catch (err: any) {
                console.error("Usage consumption failed:", err);
                setValidationError(err.message || '邀请码无效、过期或次数已用完，无法生成计划。');
                setTimeout(() => setValidationError(null), 5000);
                setIsConsumingUsage(false);
                return;
            }
            setIsConsumingUsage(false);
        }

        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
            setValidationError(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setValidationError(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Step 3 is full-screen (fixed position) — TaskDecomposition manages its own scroll
    if (currentStep === 3) {
        return <TaskDecomposition />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 pb-32">
            {/* Validation Error Alert */}
            {validationError && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] w-[90%] max-w-md animate-in slide-in-from-top-4 duration-300">
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl shadow-xl flex items-start gap-3">
                        <div className="bg-amber-100 p-1.5 rounded-full text-amber-600">
                            <Calendar size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-amber-900">{validationError}</p>
                        </div>
                        <button onClick={() => setValidationError(null)} className="text-amber-400 hover:text-amber-600">
                            <HelpCircle size={18} className="rotate-45" />
                        </button>
                    </div>
                </div>
            )}

            {/* Branding Header */}
            <div className="flex items-center justify-center gap-4 mb-12 animate-in fade-in zoom-in duration-700 relative">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-100 overflow-hidden">
                        <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="4" y="4" width="24" height="24" rx="6" fill="url(#logo_grad)" />
                            <path d="M10 10H14V14H10V10Z" fill="white" fillOpacity="0.8" />
                            <path d="M18 10H22V14H18V10Z" fill="white" fillOpacity="0.8" />
                            <path d="M10 18H14V22H10V18Z" fill="white" fillOpacity="0.8" />
                            <path d="M18 18H22V22H18V18Z" fill="white" fillOpacity="0.8" />
                            <circle cx="16" cy="16" r="3" fill="white" className="animate-pulse" />
                            <defs>
                                <linearGradient id="logo_grad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#6366f1" />
                                    <stop offset="1" stopColor="#10b981" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 bg-clip-text text-transparent tracking-tighter">
                            澄心 <span className="text-slate-400 font-light ml-1">ClearGrid</span>
                        </h1>
                        <button
                            onClick={() => setShowTutorial(true)}
                            className="p-1.5 text-slate-300 hover:text-indigo-500 transition-colors rounded-full hover:bg-indigo-50"
                            title="重新查看教程"
                        >
                            <HelpCircle size={20} />
                        </button>
                    </div>
                    <p className="text-[10px] text-indigo-500/60 font-black uppercase tracking-widest leading-none">Perspective &amp; Focus</p>
                </div>
            </div>

            {/* Steps Progress Indicator — only shown on Step 1 */}
            {currentStep === 1 && (
                <div className="max-w-3xl mx-auto mb-16">
                    <div className="flex items-center justify-between relative">
                        {/* Background Progress Line */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
                        <div
                            className="absolute top-1/2 left-0 h-1 bg-indigo-500 -translate-y-1/2 z-0 transition-all duration-500"
                            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                        ></div>

                        {STEPS.map((step) => {
                            const Icon = step.icon;
                            const isActive = currentStep >= step.id;
                            const isCurrent = currentStep === step.id;

                            return (
                                <div key={step.id} className="relative z-10 flex flex-col items-center group">
                                    <button
                                        onClick={() => {
                                            if (step.id < currentStep) {
                                                setCurrentStep(step.id);
                                                setValidationError(null);
                                            }
                                        }}
                                        disabled={step.id >= currentStep}
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${isCurrent
                                            ? 'gradient-primary text-white scale-110'
                                            : isActive
                                                ? 'bg-indigo-100 text-indigo-600'
                                                : 'bg-white text-slate-300 border border-slate-100'
                                            }`}
                                    >
                                        <Icon size={20} />
                                    </button>
                                    <span className={`mt-3 text-xs font-black uppercase tracking-tighter transition-colors ${isCurrent ? 'text-indigo-600' : isActive ? 'text-indigo-400' : 'text-slate-300'
                                        }`}>
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="text-center mt-10">
                        <h2 className="text-2xl font-black text-slate-800 mb-2">{STEPS[currentStep - 1].title}</h2>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto">{STEPS[currentStep - 1].description}</p>
                    </div>
                </div>
            )}

            {/* Main Content Areas */}
            <main className="min-h-[60vh] transition-all duration-500">
                {currentStep === 1 && (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <GoalGrid />
                    </section>
                )}

                {currentStep === 2 && (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <TimeBudgetSettings />
                    </section>
                )}


            </main>

            {/* Bottom Navigation Dock — hidden on step 3 (wizard handles its own nav) */}
            {(!showTutorial && !activeModal && currentStep < 3) && (
                <div className="fixed bottom-0 left-0 w-full p-4 z-[50] md:p-8 flex justify-center pointer-events-none animate-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-white/80 backdrop-blur-xl border border-slate-100 p-2 rounded-[2rem] shadow-2xl flex items-center gap-3 pointer-events-auto max-w-md w-full">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="flex-1 px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition bg-slate-50 text-slate-400 disabled:opacity-30 hover:bg-slate-100"
                        >
                            <ChevronLeft size={20} />
                            上一步
                        </button>

                        {currentStep < 3 ? (
                            <button
                                onClick={nextStep}
                                disabled={isConsumingUsage}
                                className="flex-[2] gradient-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-200 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isConsumingUsage ? (
                                    <>
                                        正在验证与保存进度...
                                        <Loader2 size={20} className="animate-spin" />
                                    </>
                                ) : (
                                    <>
                                        下一步
                                        <ChevronRight size={20} />
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="flex-[2] text-center text-xs font-bold text-emerald-500 flex flex-col items-center px-4">
                                <span>已完成所有规划</span>
                                <div className="flex gap-1 mt-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
