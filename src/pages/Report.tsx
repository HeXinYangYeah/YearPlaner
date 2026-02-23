import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Share2, ArrowLeft, Check, Download, AlertTriangle, Loader2, Moon, Sun, Smartphone, Monitor } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { domToPng } from 'modern-screenshot';
import { getBudgetStatus } from '../utils/plannerUtils';
import { calculateDomainTimeAllocations } from '../utils/reportUtils';
import WheelOfLife from '../components/WheelOfLife';
import BentoGrid from '../components/BentoGrid';
import FinalTaskList from '../components/FinalTaskList';

export default function Report() {
    const { id } = useParams<{ id: string }>();
    const { theme, goals, tasks, timeBudget, shareId, syncToCloud, loadFromCloud } = useStore();
    const [copied, setCopied] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [loading, setLoading] = useState(!!id);
    const reportRef = useRef<HTMLDivElement>(null);

    // New State for Report Options
    const [selectedMonth, setSelectedMonth] = useState<number | 'ALL'>('ALL');
    const [darkMode, setDarkMode] = useState(false);
    const [layoutMode, setLayoutMode] = useState<'mobile' | 'tablet'>('mobile');
    const [showSafeZoneMask, setShowSafeZoneMask] = useState(false);

    useEffect(() => {
        if (id) {
            loadFromCloud(id)
                .catch(err => alert('加载计划失败：' + err.message))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const { isOverBudget, overage } = getBudgetStatus(timeBudget, tasks, goals);
    const allocations = calculateDomainTimeAllocations(goals, tasks);

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
        // Hide mask during export to just get the clean image
        const safeZoneWasOn = showSafeZoneMask;
        if (safeZoneWasOn) setShowSafeZoneMask(false);

        try {
            let currentId = id || shareId;
            if (!currentId) {
                currentId = await syncToCloud();
            }

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

                if (now - lastExported > fortyEightHours) {
                    newCount = 0;
                }

                if (newCount >= 2) {
                    const remainingMs = fortyEightHours - (now - lastExported);
                    const remainingHours = Math.ceil(remainingMs / (3600 * 1000));
                    throw new Error(`导出次数已达上限（48小时内限2次）。请在 ${remainingHours} 小时后再试。`);
                }

                await new Promise(resolve => setTimeout(resolve, 800));

                // Ensure tailwind generates the background properly
                const bgColor = darkMode ? '#0f172a' : '#f8f9fa';

                const dataUrl = await domToPng(reportRef.current, {
                    backgroundColor: bgColor,
                    scale: 2,
                    filter: (node) => !(node instanceof HTMLElement && node.hasAttribute('data-html2canvas-ignore'))
                });

                await updateDoc(docRef, {
                    exportCount: newCount + 1,
                    lastExported: serverTimestamp()
                });

                const link = document.createElement('a');
                const suffix = selectedMonth === 'ALL' ? '全部' : `${selectedMonth + 1}月`;
                link.download = `2026计划-${theme}-${suffix}.png`;
                link.href = dataUrl;
                link.click();
            }
        } catch (err: any) {
            console.error('Export failed:', err);
            alert(err.message || '导出失败，请重试');
        } finally {
            if (safeZoneWasOn) setShowSafeZoneMask(true);
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

    // Generate Month Options
    const months = Array.from({ length: 12 }, (_, i) => i);

    return (
        <div className="min-h-screen bg-slate-100 px-4 sm:px-6 py-6 font-sans">
            {/* Header / Controls */}
            <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 sm:p-6 rounded-[2rem] shadow-sm border border-slate-200 sticky top-4 z-50">
                <Link to="/" className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 font-bold transition self-start md:self-auto bg-slate-50 px-5 py-2.5 rounded-xl hover:bg-indigo-50">
                    <ArrowLeft size={18} /> 返回控制台
                </Link>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setLayoutMode('mobile')}
                            className={`p-2 rounded-lg flex items-center gap-2 transition-all ${layoutMode === 'mobile' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                            title="手机壁纸比例 (9:16)"
                        >
                            <Smartphone size={18} />
                            <span className="text-sm font-bold hidden sm:inline">手机</span>
                        </button>
                        <button
                            onClick={() => setLayoutMode('tablet')}
                            className={`p-2 rounded-lg flex items-center gap-2 transition-all ${layoutMode === 'tablet' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                            title="横幅比例 (宽幅)"
                        >
                            <Monitor size={18} />
                            <span className="text-sm font-bold hidden sm:inline">平板/宽幅</span>
                        </button>
                    </div>

                    <div className="w-px h-8 bg-slate-200"></div>

                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setDarkMode(false)}
                            className={`p-2 rounded-lg transition-all ${!darkMode ? 'bg-white shadow-sm text-amber-500' : 'text-slate-500 hover:text-slate-700'}`}
                            title="浅色模式"
                        >
                            <Sun size={18} />
                        </button>
                        <button
                            onClick={() => setDarkMode(true)}
                            className={`p-2 rounded-lg transition-all ${darkMode ? 'bg-slate-800 shadow-sm text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}
                            title="深色模式 (OLED 友好)"
                        >
                            <Moon size={18} />
                        </button>
                    </div>

                    {layoutMode === 'mobile' && (
                        <>
                            <div className="w-px h-8 bg-slate-200"></div>
                            <button
                                onClick={() => setShowSafeZoneMask(!showSafeZoneMask)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${showSafeZoneMask ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                            >
                                锁屏遮罩 {showSafeZoneMask ? 'ON' : 'OFF'}
                            </button>
                        </>
                    )}
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                        <Download size={18} />
                        {exporting ? '生成中...' : '下载图片'}
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex-1 md:flex-none gradient-primary hover:brightness-110 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-soft-hover transition-all hidden sm:flex"
                    >
                        {copied ? <Check size={18} /> : <Share2 size={18} />}
                        {copied ? '已复制' : '分享'}
                    </button>
                </div>
            </div>

            {/* Container for Export */}
            <div className={`mx-auto transition-all duration-500 flex justify-center ${layoutMode === 'mobile' ? 'max-w-md w-full' : 'max-w-6xl w-full'}`}>

                {/* The actual exportable area */}
                <div
                    ref={reportRef}
                    className={`
                        relative overflow-hidden transition-colors duration-500
                        ${darkMode ? 'bg-slate-900' : 'bg-[#f8f9fa]'}
                        ${layoutMode === 'mobile' ? 'w-full aspect-[9/16] rounded-[3rem] shadow-2xl scale-[0.85] origin-top md:scale-100' : 'w-full min-h-[800px] rounded-[2rem] shadow-xl'}
                    `}
                >
                    {/* Dark mode global override via Tailwind's `dark:` class prefix. 
                        We wrap the inner content in a div with the 'dark' class if darkMode is true. */}
                    <div className={`w-full h-full relative z-10 p-6 sm:p-8 flex flex-col ${darkMode ? 'dark text-white' : 'text-slate-900'} ${layoutMode === 'mobile' ? 'justify-center py-16' : ''}`}>

                        {/* Safe Zone Mask Overlay for Mobile */}
                        {layoutMode === 'mobile' && showSafeZoneMask && (
                            <div className="absolute inset-0 z-50 pointer-events-none data-html2canvas-ignore">
                                {/* Top Clock Area */}
                                <div className="absolute top-0 inset-x-0 h-32 bg-black/20 backdrop-blur-[2px] border-b border-white/20 flex flex-col items-center justify-center pt-8 text-white/90">
                                    <div className="text-4xl font-light tracking-tight pb-1">09:41</div>
                                    <div className="text-xs font-medium uppercase tracking-widest opacity-80">Monday, Jan 1</div>
                                </div>
                                {/* Bottom Dock Area */}
                                <div className="absolute bottom-0 inset-x-0 h-24 bg-black/20 backdrop-blur-[2px] border-t border-white/20 flex items-end justify-center pb-4">
                                    <div className="w-1/3 h-1 bg-white/80 rounded-full"></div>
                                </div>
                            </div>
                        )}

                        {/* Ambient Background Glows */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                            <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 dark:bg-indigo-500/30 rounded-full blur-[100px]"></div>
                            <div className="absolute top-1/2 -right-40 w-96 h-96 bg-emerald-500/20 dark:bg-emerald-500/20 rounded-full blur-[100px]"></div>
                            <div className="absolute -bottom-40 left-1/4 w-96 h-96 bg-pink-500/10 dark:bg-pink-500/20 rounded-full blur-[100px]"></div>
                        </div>

                        {/* Content Wrapper */}
                        <div className={`relative z-10 flex-1 flex flex-col gap-8 ${layoutMode === 'tablet' ? 'grid grid-cols-12 gap-8' : ''}`}>

                            {/* Header Section */}
                            <div className={`text-center space-y-3 ${layoutMode === 'tablet' ? 'col-span-12' : ''}`}>
                                <p className="text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-widest text-xs drop-shadow-sm">
                                    {selectedMonth === 'ALL' ? '2026 ANNUAL VISION' : `2026 FOCUS: MONTH ${selectedMonth + 1}`}
                                </p>
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-serif italic max-w-4xl mx-auto leading-tight drop-shadow-md text-slate-800 dark:text-white">
                                    "{theme}"
                                </h1>
                            </div>

                            {/* Month Selector Carousel (Only visible, hidden in export or integrated into design) */}
                            <div className={`w-full overflow-x-auto pb-4 hide-scrollbar snap-x ${layoutMode === 'tablet' ? 'col-span-12' : ''}`}>
                                <div className="flex gap-2 w-max mx-auto px-4">
                                    <button
                                        onClick={() => setSelectedMonth('ALL')}
                                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all snap-center whitespace-nowrap
                                            ${selectedMonth === 'ALL'
                                                ? 'bg-indigo-600 text-white shadow-md'
                                                : 'bg-white/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'}`}
                                    >
                                        全年总览
                                    </button>
                                    {months.map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setSelectedMonth(m)}
                                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all snap-center whitespace-nowrap
                                                ${selectedMonth === m
                                                    ? 'bg-indigo-600 text-white shadow-md'
                                                    : 'bg-white/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'}`}
                                        >
                                            {m + 1}月
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={`${layoutMode === 'tablet' ? 'col-span-12 grid grid-cols-12 gap-8' : 'space-y-8 flex-1'}`}>

                                {/* Top Layout: Bento + Wheel */}
                                <div className={`${layoutMode === 'tablet' ? 'col-span-12 xl:col-span-7 flex flex-col gap-6' : 'flex flex-col gap-6'}`}>
                                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] shadow-soft border border-white/50 dark:border-slate-800/50 p-6 sm:p-8">
                                        <BentoGrid allocations={allocations} />
                                    </div>
                                </div>

                                <div className={`${layoutMode === 'tablet' ? 'col-span-12 xl:col-span-5' : ''}`}>
                                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] shadow-soft border border-white/50 dark:border-slate-800/50 p-6 sm:p-8 flex flex-col items-center justify-center h-full">
                                        <h3 className="text-lg font-bold font-serif text-slate-800 dark:text-slate-200 mb-6 text-center w-full">时间投入生命平衡轮</h3>
                                        <WheelOfLife data={allocations} />
                                    </div>
                                </div>

                                {/* Task List Area */}
                                <div className={`${layoutMode === 'tablet' ? 'col-span-12' : 'flex-1 overflow-y-auto hide-scrollbar pb-8'}`}>
                                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] shadow-soft border border-white/50 dark:border-slate-800/50 p-6 sm:p-8">
                                        <FinalTaskList selectedMonth={selectedMonth} />
                                    </div>
                                </div>
                            </div>

                            {/* Watermark */}
                            <div className="mt-8 text-center text-[10px] text-slate-400 dark:text-slate-600 font-medium tracking-widest uppercase">
                                Designed with The Goal-Grid Planner
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
