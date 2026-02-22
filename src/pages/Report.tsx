import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Share2, ArrowLeft, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import GanttChart from '../components/GanttChart';
import PieChartSummary from '../components/PieChartSummary';
import FinalTaskList from '../components/FinalTaskList';

export default function Report() {
    const { theme, goals } = useStore();
    const [copied, setCopied] = useState(false);

    // Tiny goal grid summary
    const DOMAINS = ['职业发展', '财务', '健康', '家庭', '中心', '社交', '学习', '休闲', '个人成长'];

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
            alert('链接已复制！快去分享你的年度计划吧！');
        } catch (err) {
            alert('复制失败，请手动复印链接');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-10">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <Link to="/" className="text-slate-500 hover:text-primary-600 flex items-center gap-2 font-medium transition self-start md:self-auto">
                        <ArrowLeft size={18} /> 返回主页
                    </Link>

                    <button
                        onClick={handleShare}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition"
                    >
                        {copied ? <Check size={18} /> : <Share2 size={18} />}
                        {copied ? '已复制分享链接' : '分享我的年度计划'}
                    </button>
                </header>

                <div className="text-center mb-16">
                    <p className="text-primary-600 font-bold uppercase tracking-widest text-sm mb-3">202X 年度计划报告</p>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 font-serif italic max-w-3xl mx-auto">
                        "{theme}"
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-1 flex flex-col items-center justify-center bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 text-center w-full">目标全景图</h3>
                        <div className="grid grid-cols-3 gap-2 w-full max-w-[280px] aspect-square">
                            {DOMAINS.map((domain, index) => {
                                if (index === 4) {
                                    return (
                                        <div key="center" className="bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xs p-1 text-center shadow-inner">
                                            {theme.substring(0, 4) + (theme.length > 4 ? '...' : '')}
                                        </div>
                                    );
                                }
                                const count = goals.filter(g => g.domain === domain).length;
                                return (
                                    <div key={domain} className="bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center p-2 text-center relative overflow-hidden">
                                        <span className="text-xs font-semibold text-slate-600 z-10">{domain}</span>
                                        {count > 0 && <span className="text-[10px] text-slate-400 mt-1 z-10">{count}个目标</span>}
                                        {count > 0 && <div className="absolute inset-0 bg-primary-50 opacity-50"></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="lg:col-span-2 relative">
                        <PieChartSummary />
                    </div>
                </div>

                <div className="mb-12">
                    <GanttChart />
                </div>

                <div className="mb-12">
                    <FinalTaskList />
                </div>

            </div>
        </div>
    );
}
