import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Share2, ArrowLeft, Check, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import GanttChart from '../components/GanttChart';
import PieChartSummary from '../components/PieChartSummary';
import FinalTaskList from '../components/FinalTaskList';

export default function Report() {
    const { theme, goals } = useStore();
    const [copied, setCopied] = useState(false);

    // Tiny goal grid summary
    const DOMAINS = [
        '学习成长', '体验突破', '休闲娱乐',
        '工作事业', '中心', '家庭生活',
        '身体健康', '财务理财', '人际社群'
    ];

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
        <div className="min-h-screen bg-[#f8f9fa] px-4 sm:px-6 lg:px-8 py-10 font-sans">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                    <Link to="/" className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 font-bold transition self-start md:self-auto bg-slate-50 px-5 py-2.5 rounded-xl hover:bg-indigo-50">
                        <ArrowLeft size={18} /> 返回控制台
                    </Link>

                    <div className="flex gap-4 w-full md:w-auto">
                        <button className="flex-1 md:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition">
                            <Download size={18} />
                            导出长图
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex-1 md:flex-none gradient-primary hover:brightness-110 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-soft-hover transition-all"
                        >
                            {copied ? <Check size={18} /> : <Share2 size={18} />}
                            {copied ? '已复制分享链接' : '分享我的年度计划'}
                        </button>
                    </div>
                </header>

                {/* Hero Title Area */}
                <div className="text-center space-y-4 pt-4 pb-8 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
                    <p className="text-indigo-500 font-bold uppercase tracking-widest text-sm drop-shadow-sm">2026 年度计划执行报告</p>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-800 font-serif italic max-w-4xl mx-auto leading-tight drop-shadow-md">
                        "{theme}"
                    </h1>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Small Goal Grid Summary (Visual Infographic) */}
                    <div className="lg:col-span-1 flex flex-col items-center bg-white rounded-[2.5rem] p-8 shadow-soft border border-emerald-50 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>
                        <h3 className="text-xl font-bold font-serif text-slate-800 mb-8 text-center w-full z-10">目标结构鸟瞰</h3>

                        <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] aspect-square relative z-10">
                            {DOMAINS.map((domain, index) => {
                                if (index === 4) {
                                    return (
                                        <div key="center" className="gradient-primary rounded-2xl flex items-center justify-center text-white font-black text-sm p-2 text-center shadow-lg transform scale-110 z-20">
                                            核心
                                        </div>
                                    );
                                }
                                const count = goals.filter(g => g.domain === domain).length;
                                return (
                                    <div key={domain} className="bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center p-2 text-center relative overflow-hidden group">
                                        <span className="text-xs font-bold text-slate-700 z-10">{domain}</span>
                                        {count > 0 && <span className="text-[10px] font-bold text-emerald-500 mt-1 z-10">{count} 项</span>}
                                        {count > 0 && <div className="absolute inset-x-0 bottom-0 bg-emerald-100 opacity-50 transition-all duration-500" style={{ height: `${(count / 3) * 100}%` }}></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Time Allocation Pie Chart */}
                    <div className="lg:col-span-2 relative bg-white rounded-[2.5rem] shadow-soft border border-emerald-50 p-8">
                        <PieChartSummary />
                    </div>
                </div>

                {/* Gantt Chart Section */}
                <div className="bg-white rounded-[2.5rem] shadow-soft border border-emerald-50 p-8 md:p-10 overflow-hidden relative">
                    <div className="absolute -left-20 -top-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10">
                        <GanttChart />
                    </div>
                </div>

                {/* Final Task List Summary */}
                <div className="bg-white rounded-[2.5rem] shadow-soft border border-emerald-50 p-8 md:p-10">
                    <FinalTaskList />
                </div>

            </div>
        </div>
    );
}
