import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Calendar, BarChart3, ListTodo, FileText } from 'lucide-react';
import GoalGrid from '../components/GoalGrid';
import TimeBudgetSettings from '../components/TimeBudgetSettings';
import TaskDecomposition from '../components/TaskDecomposition';

const STEPS = [
    { id: 1, title: '愿景目标', icon: Calendar, description: '定义你的 2026 年度核心主题与八大领域目标' },
    { id: 2, title: '时间预算', icon: BarChart3, description: '分配每周时间，确保计划的可执行性' },
    { id: 3, title: '行动分解', icon: ListTodo, description: '将目标拆解为具体的习惯与项目任务' }
];

export default function Home() {
    const [currentStep, setCurrentStep] = useState(1);

    const nextStep = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 pb-32">
            {/* Steps Progress Indicator */}
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
                                    onClick={() => step.id < currentStep && setCurrentStep(step.id)}
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

                {currentStep === 3 && (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <TaskDecomposition />

                        <div className="text-center py-20 animate-in fade-in zoom-in duration-1000">
                            <Link to="/report" className="px-10 py-5 gradient-primary text-white rounded-full font-bold text-xl shadow-soft-hover hover:scale-105 hover:shadow-2xl transition-all inline-flex items-center gap-3">
                                <FileText className="w-6 h-6" />
                                生成 2026 年度报告
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </section>
                )}
            </main>

            {/* Bottom Navigation Dock */}
            <div className="fixed bottom-0 left-0 w-full p-4 z-[100] md:p-8 flex justify-center pointer-events-none">
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
                            className="flex-[2] gradient-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-200 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            下一步
                            <ChevronRight size={20} />
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
        </div>
    );
}
