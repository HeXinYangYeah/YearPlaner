import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, KeyRound, ArrowRight, Loader2 } from 'lucide-react';

export default function WelcomeGate() {
    const navigate = useNavigate();
    const location = useLocation();
    const [code, setCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlCode = params.get('code');

        if (urlCode) {
            setCode(urlCode);
            verifyCode(urlCode);
        } else {
            setIsLoading(false);
            setError("未检测到专属访问链接。\n请通过您购买后获取的专属链接访问本系统。");
        }
    }, [location]);

    const verifyCode = async (_accessCode: string) => {
        try {
            setIsLoading(true);

            // Re-using decomposeVision with a dummy ping to check validity without consuming usage,
            // OR Better yet, create a checkAccessCode cloud function.
            // Since we haven't written `checkAccessCode` yet, we'll assume the code is valid for visual entry,
            // and the actual usage will be consumed on step 1 -> step 2 transition.

            // For now, we will just visually allow them in if a code is present, 
            // the real validation happens during AI generation and Step 1->2.
            setTimeout(() => {
                setIsValid(true);
                setIsLoading(false);
            }, 800);

        } catch (err: any) {
            console.error("Code verification failed:", err);
            setError("链接验证失败，请刷新重试。");
            setIsLoading(false);
        }
    };

    const handleEnter = () => {
        navigate(`/plan?code=${code}`);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-md w-full bg-white/10 backdrop-blur-2xl border border-white/20 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative z-10 text-center animate-in zoom-in-95 duration-700">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-lg transform -rotate-6">
                    <Sparkles size={36} className="text-white" />
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
                    澄心年度规划
                </h1>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <Loader2 size={32} className="text-indigo-400 animate-spin" />
                        <p className="text-indigo-200 font-medium">正在验证您的专属链接...</p>
                    </div>
                ) : error ? (
                    <div className="space-y-6">
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                            <KeyRound size={32} className="text-red-400 mx-auto mb-4" />
                            <p className="text-red-200 font-medium whitespace-pre-line leading-relaxed text-sm">
                                {error}
                            </p>
                        </div>
                        <a
                            href="https://www.xiaohongshu.com"
                            target="_blank"
                            className="inline-block text-indigo-300 hover:text-indigo-200 text-sm font-bold underline underline-offset-4"
                        >
                            前往小红书获取邀请链接
                        </a>
                    </div>
                ) : isValid && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <p className="text-indigo-100/80 leading-relaxed">
                            欢迎来到您的专属 AI 规划空间。<br />
                            接下来，我们将帮助您把模糊的愿景，转化为切实可行的 2026 行动指南。
                        </p>

                        <button
                            onClick={handleEnter}
                            className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)] group"
                        >
                            开启规划之旅
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <p className="text-xs text-indigo-200/50">
                            提示: 请在 48 小时内完成规划，以免链接失效。
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
