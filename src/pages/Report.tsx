import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Share2, ArrowLeft, Check, Download, AlertTriangle, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { domToPng } from 'modern-screenshot';
import GanttChart from '../components/GanttChart';
import PieChartSummary from '../components/PieChartSummary';
import FinalTaskList from '../components/FinalTaskList';
import { getBudgetStatus } from '../utils/plannerUtils';

export default function Report() {
    const { id } = useParams<{ id: string }>();
    const { theme, goals, tasks, timeBudget, shareId, syncToCloud, loadFromCloud } = useStore();
    const [copied, setCopied] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [loading, setLoading] = useState(!!id);
    const reportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (id) {
            loadFromCloud(id)
                .catch(err => alert('加载计划失败：' + err.message))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const { isOverBudget, overage } = getBudgetStatus(timeBudget, tasks, goals);

    const DOMAINS = [
        '学习成长', '体验突破', '休闲娱乐',
        '工作事业', '中心', '家庭生活',
        '身体健康', '财务理财', '人际社群'
    ];

    const handleShare = async () => {
        try {
            let currentId = id || shareId;
            if (!currentId) {
                currentId = await syncToCloud();
            }

            const shareUrl = `${window.location.origin}/report/${currentId}`;
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
            alert('云端同步成功！链接已复制，有效期 48 小时内可导出 2 次。');
        } catch (err: any) {
            console.error('Sync failed:', err);
            alert('同步失败：' + (err.message || '网络错误'));
        }
    };

    const handleExport = async () => {
        if (!reportRef.current) return;
        setExporting(true);
        try {
            let currentId = id || shareId;
            if (!currentId) {
                // If not shared yet, sync first to track usage
                currentId = await syncToCloud();
            }

            // Check usage limits in Firestore
            const { doc, getDoc, updateDoc, serverTimestamp } = await import('firebase/firestore');
            const { db } = await import('../firebase');
            const docRef = doc(db, 'plans', currentId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const now = Date.now();
                const lastExported = data.lastExported?.toMillis() || 0;
                const fortyEightHours = 48 * 3600 * 1000;

                let newCount = (data.exportCount || 0);

                // If more than 48h passed since last export, reset count
                if (now - lastExported > fortyEightHours) {
                    newCount = 0;
                }

                if (newCount >= 2) {
                    const remainingMs = fortyEightHours - (now - lastExported);
                    const remainingHours = Math.ceil(remainingMs / (3600 * 1000));
                    throw new Error(`导出次数已达上限（48小时内限2次）。请在 ${remainingHours} 小时后再试。`);
                }

                // Proceed with export
                await new Promise(resolve => setTimeout(resolve, 800));
                const footer = reportRef.current.querySelector('.show-on-export');
                if (footer) (footer as HTMLElement).style.display = 'block';

                const dataUrl = await domToPng(reportRef.current, {
                    backgroundColor: '#f8f9fa',
                    scale: 2,
                    filter: (node) => !(node instanceof HTMLElement && node.hasAttribute('data-html2canvas-ignore'))
                });

                if (footer) (footer as HTMLElement).style.display = 'none';

                // Update Firestore
                await updateDoc(docRef, {
                    exportCount: newCount + 1,
                    lastExported: serverTimestamp()
                });

                const link = document.createElement('a');
                link.download = `2026年度计划-${theme}.png`;
                link.href = dataUrl;
                link.click();
            }
        } catch (err: any) {
            console.error('Export failed:', err);
            alert(err.message || '导出失败，请重试');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-6 space-y-4">
                <Loader2 size={40} className="text-indigo-500 animate-spin" />
                <p className="text-slate-500 font-bold">正在为您从云端加载计划...</p>
            </div>
        );
    }

    if (isOverBudget) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-10 text-center space-y-6 border border-red-100">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle size={40} className="text-red-500" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-slate-800">平衡度未达标</h2>
                        <p className="text-slate-500 leading-relaxed">
                            你的年度计划当前超支 <span className="text-red-500 font-bold">{overage} 小时</span>。为了保证计划的可执行性，请先在控制台调整任务或预算。
                        </p>
                    </div>
                    <Link
                        to="/"
                        className="block w-full gradient-primary text-white font-bold py-4 rounded-2xl shadow-soft-hover transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={18} /> 返回调整计划
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] px-4 sm:px-6 lg:px-8 py-10 font-sans">
            <div className="max-w-6xl mx-auto space-y-12" ref={reportRef}>
                <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 data-html2canvas-ignore">
                    <Link to="/" className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 font-bold transition self-start md:self-auto bg-slate-50 px-5 py-2.5 rounded-xl hover:bg-indigo-50">
                        <ArrowLeft size={18} /> 返回控制台
                    </Link>

                    <div className="flex gap-4 w-full md:w-auto">
                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="flex-1 md:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                        >
                            <Download size={18} />
                            {exporting ? '正在生成...' : '导出长图'}
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

                <div className="space-y-12">
                    <div className="text-center space-y-4 pt-4 pb-8 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
                        <p className="text-indigo-500 font-bold uppercase tracking-widest text-sm drop-shadow-sm">2026 年度计划执行报告</p>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-800 font-serif italic max-w-4xl mx-auto leading-tight drop-shadow-md">
                            "{theme}"
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

                        <div className="lg:col-span-2 relative bg-white rounded-[2.5rem] shadow-soft border border-emerald-50 p-8">
                            <PieChartSummary />
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] shadow-soft border border-emerald-50 p-8 md:p-10 overflow-hidden relative">
                        <div className="absolute -left-20 -top-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="relative z-10">
                            <GanttChart />
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] shadow-soft border border-emerald-50 p-8 md:p-10">
                        <FinalTaskList />
                    </div>
                </div>

                <div className="text-center py-10 text-slate-400 font-medium hidden show-on-export">
                    由 The Goal-Grid Planner 生成
                </div>
            </div>
        </div>
    );
}
