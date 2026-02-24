import { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import {
    ArrowLeft, Download, Moon, Sun, Shield, ShieldOff,
    Check, Share2, ChevronLeft, ChevronRight, Loader2, AlertTriangle
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas-pro';
import { getBudgetStatus } from '../utils/plannerUtils';
import { calculateDomainTimeAllocations } from '../utils/reportUtils';
import WheelOfLife from '../components/WheelOfLife';
import BentoGrid from '../components/BentoGrid';
import QuarterlySlide from '../components/QuarterlySlide';
import TabletDashboard from '../components/TabletDashboard';

// ─── Slide definition ────────────────────────────────────────────────────────
type SlideId = 'A' | 'B' | 'C' | 'D';
interface SlideConfig {
    id: SlideId;
    aspect: '9/16' | '16/10';
}

const SLIDES: SlideConfig[] = [
    { id: 'A', aspect: '9/16' },
    { id: 'B', aspect: '9/16' },
    { id: 'C', aspect: '9/16' },
    { id: 'D', aspect: '16/10' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const isMobileDevice = () => /iPhone|iPad|Android|Mobile/i.test(navigator.userAgent);

/** Convert a data-URL to a Blob-URL that browsers can reliably long-press-save */
function dataUrlToBlobUrl(dataUrl: string): string {
    const [header, base64] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mime });
    return URL.createObjectURL(blob);
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Report() {
    const { id } = useParams<{ id: string }>();
    const { theme, goals, tasks, timeBudget, shareId, syncToCloud, loadFromCloud } = useStore();

    const [loading, setLoading] = useState(!!id);
    const [isDark, setIsDark] = useState(true);
    const [showSafeZone, setShowSafeZone] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [exporting, setExporting] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
    const [previewSlideId, setPreviewSlideId] = useState<string>('');
    const [copied, setCopied] = useState(false);

    const swipeContainerRef = useRef<HTMLDivElement>(null);
    const slideRefs = useRef<Record<SlideId, HTMLDivElement | null>>({
        A: null, B: null, C: null, D: null,
    });

    useEffect(() => {
        if (id) {
            loadFromCloud(id)
                .catch(err => alert('加载计划失败：' + err.message))
                .finally(() => setLoading(false));
        }
    }, [id]);

    // Observe which slide is in view via scroll position
    useEffect(() => {
        const container = swipeContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollLeft = container.scrollLeft;
            const width = container.offsetWidth;
            const idx = Math.round(scrollLeft / width);
            setCurrentSlide(Math.min(idx, SLIDES.length - 1));
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const goToSlide = (idx: number) => {
        const container = swipeContainerRef.current;
        if (!container) return;
        container.scrollTo({ left: container.offsetWidth * idx, behavior: 'smooth' });
        setCurrentSlide(idx);
    };

    const { isOverBudget, overage } = getBudgetStatus(timeBudget, tasks, goals);
    const allocations = calculateDomainTimeAllocations(goals, tasks);

    // ── Export / Download ────────────────────────────────────────────────────
    const handleDownload = useCallback(async () => {
        const slide = SLIDES[currentSlide];
        const el = slideRefs.current[slide.id];
        if (!el || exporting) return;

        setExporting(true);
        const wasSafeZone = showSafeZone;
        if (wasSafeZone) setShowSafeZone(false);

        try {
            await new Promise(r => setTimeout(r, 300));

            const bgColor = isDark ? '#000000' : '#f8fafc';

            const canvas = await html2canvas(el, {
                backgroundColor: bgColor,
                scale: 3,
                useCORS: true,
                allowTaint: false,
                logging: false,
                imageTimeout: 0,
                width: el.offsetWidth,
                height: el.offsetHeight,
                onclone: (doc) => {
                    doc.body.style.transform = 'none';
                    doc.body.style.overflow = 'hidden';
                },
                ignoreElements: el => el.hasAttribute('data-html2canvas-ignore'),
            });

            const dataUrl = canvas.toDataURL('image/png', 1.0);

            if (isMobileDevice()) {
                // Mobile: blob URL for <img> display (long-press), data URL kept for download
                const blobUrl = dataUrlToBlobUrl(dataUrl);
                setPreviewBlobUrl(blobUrl);
                setPreviewSlideId(slide.id);
                setPreviewImage(dataUrl);
            } else {
                // Desktop: trigger download
                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = `年度计划_${slide.id}_${new Date().toISOString().slice(0, 10)}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : '未知错误';
            console.error('Export failed:', err);
            alert('生成图片失败：' + msg);
        } finally {
            if (wasSafeZone) setShowSafeZone(true);
            setExporting(false);
        }
    }, [currentSlide, exporting, isDark, showSafeZone]);

    // ── Share ────────────────────────────────────────────────────────────────
    const handleShare = async () => {
        try {
            let cid = id || shareId;
            if (!cid) cid = await syncToCloud();
            const url = `${window.location.origin}/report/${cid}`;
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : '网络错误';
            alert('同步失败：' + msg);
        }
    };

    // ── Loading / Budget gates ───────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#000' }}>
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={40} className="animate-spin" style={{ color: '#818cf8' }} />
                    <p className="font-bold text-sm" style={{ color: '#94a3b8' }}>正在加载计划...</p>
                </div>
            </div>
        );
    }

    if (isOverBudget) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0a0a0a' }}>
                <div className="max-w-md w-full text-center space-y-6 p-10 rounded-3xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <AlertTriangle size={40} style={{ color: '#ef4444', margin: '0 auto' }} />
                    <h2 className="text-2xl font-black" style={{ color: '#f1f5f9' }}>计划超支 {overage}h</h2>
                    <p className="text-sm" style={{ color: '#94a3b8' }}>
                        请先在控制台调整任务或时间预算，确保计划可执行后再导出。
                    </p>
                    <Link to="/" className="block py-4 rounded-2xl font-bold text-white"
                        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                        <ArrowLeft size={16} className="inline mr-2" />返回调整计划
                    </Link>
                </div>
            </div>
        );
    }

    // ── Colors ───────────────────────────────────────────────────────────────
    const pageBg = isDark ? '#050505' : '#f1f5f9';
    const barBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
    const barBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const textBase = isDark ? '#e2e8f0' : '#1e293b';
    const textMuted = isDark ? '#94a3b8' : '#64748b';
    const accentGrad = 'linear-gradient(135deg,#6366f1,#8b5cf6)';

    return (
        <div
            style={{
                background: pageBg,
                fontFamily: 'system-ui, sans-serif',
                height: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            {/* ── Top nav bar ─────────────────────────────────────────── */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    flexShrink: 0,
                    borderBottom: `1px solid ${barBorder}`,
                    background: pageBg,
                    zIndex: 50,
                }}
            >
                <Link
                    to="/"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 10px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: textMuted,
                        background: barBg,
                        textDecoration: 'none',
                    }}
                >
                    <ArrowLeft size={14} /> 返回
                </Link>

                {/* Dot indicators */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {SLIDES.map((s, i) => (
                        <button
                            key={s.id}
                            onClick={() => goToSlide(i)}
                            style={{
                                width: i === currentSlide ? '22px' : '7px',
                                height: '7px',
                                borderRadius: '4px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease',
                                background: i === currentSlide
                                    ? 'linear-gradient(90deg,#6366f1,#8b5cf6)'
                                    : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'),
                                padding: 0,
                            }}
                        />
                    ))}
                </div>

                <button
                    onClick={handleShare}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 10px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: textMuted,
                        background: barBg,
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    {copied ? <Check size={14} style={{ color: '#4ade80' }} /> : <Share2 size={14} />}
                    {copied ? '已复制' : '分享'}
                </button>
            </div>

            {/* ── Full-screen horizontal swiper ─────────────────────── */}
            <div
                ref={swipeContainerRef}
                style={{
                    flex: 1,
                    display: 'flex',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
            >
                {SLIDES.map((slide) => {
                    const isPortrait = slide.aspect === '9/16';

                    // Full-screen slide wrapper
                    return (
                        <div
                            key={slide.id}
                            style={{
                                scrollSnapAlign: 'center',
                                flexShrink: 0,
                                width: '100vw',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '12px',
                                boxSizing: 'border-box',
                            }}
                        >
                            {/* ── The exportable card ── */}
                            <div
                                ref={el => { slideRefs.current[slide.id] = el; }}
                                style={{
                                    // Aspect-ratio based sizing: fill available height, constrain width
                                    aspectRatio: isPortrait ? '9/16' : '16/10',
                                    height: '100%',
                                    maxHeight: '100%',
                                    maxWidth: '100%',
                                    background: isDark ? '#000000' : '#ffffff',
                                    borderRadius: '24px',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    boxShadow: isDark
                                        ? '0 0 60px rgba(99,102,241,0.15), 0 20px 60px rgba(0,0,0,0.7)'
                                        : '0 20px 60px rgba(0,0,0,0.15)',
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                {/* Ambient background orbs */}
                                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
                                    {slide.id === 'A' && <>
                                        <div style={{ position: 'absolute', top: '-20%', left: '-20%', width: '60%', height: '60%', borderRadius: '50%', background: isDark ? 'radial-gradient(circle,rgba(99,102,241,0.2),transparent 70%)' : 'radial-gradient(circle,rgba(99,102,241,0.08),transparent 70%)' }} />
                                        <div style={{ position: 'absolute', bottom: '-20%', right: '-20%', width: '60%', height: '60%', borderRadius: '50%', background: isDark ? 'radial-gradient(circle,rgba(74,222,128,0.15),transparent 70%)' : 'radial-gradient(circle,rgba(74,222,128,0.06),transparent 70%)' }} />
                                    </>}
                                    {slide.id === 'D' && (
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: isDark ? 'radial-gradient(ellipse at 30% 0%,rgba(99,102,241,0.12),transparent 60%)' : 'radial-gradient(ellipse at 30% 0%,rgba(99,102,241,0.05),transparent 60%)' }} />
                                    )}
                                </div>

                                {/* Safe zone mask (only for portrait slides) */}
                                {showSafeZone && isPortrait && (
                                    <div
                                        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50 }}
                                        data-html2canvas-ignore
                                    >
                                        <div style={{
                                            position: 'absolute', top: 0, left: 0, right: 0, height: '15%',
                                            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                                            padding: '0 0 8px 0',
                                        }}>
                                            <div style={{ fontSize: '28px', fontWeight: 300, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.5px', lineHeight: 1 }}>09:41</div>
                                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginTop: '2px' }}>2026年2月24日 周二</div>
                                        </div>
                                        <div style={{
                                            position: 'absolute', bottom: 0, left: 0, right: 0, height: '20%',
                                            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                                            padding: '0 0 16px 0', gap: '10px',
                                        }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {['📷', '🔦'].map((icon, i) => (
                                                    <div key={i} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{icon}</div>
                                                ))}
                                            </div>
                                            <div style={{ width: '120px', height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.5)' }} />
                                        </div>
                                        <div style={{ position: 'absolute', top: '15%', right: '8px', background: 'rgba(99,102,241,0.7)', borderRadius: '4px', padding: '2px 6px', fontSize: '8px', fontWeight: 700, color: '#fff' }}>SAFE ZONE ↓</div>
                                        <div style={{ position: 'absolute', bottom: '20%', right: '8px', background: 'rgba(99,102,241,0.7)', borderRadius: '4px', padding: '2px 6px', fontSize: '8px', fontWeight: 700, color: '#fff' }}>SAFE ZONE ↑</div>
                                    </div>
                                )}

                                {/* ── Slide content ─────────────────────── */}
                                <div
                                    style={{
                                        position: 'relative',
                                        zIndex: 1,
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        padding: '1rem',
                                        minHeight: 0,
                                        overflow: 'hidden',
                                    }}
                                >
                                    {/* Card header (theme) — hidden for Slide D landscape */}
                                    {slide.id !== 'D' && (
                                        <div style={{ flexShrink: 0, marginBottom: '8px' }}>
                                            <p style={{ fontSize: '7px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: isDark ? '#818cf8' : '#6366f1', marginBottom: '2px' }}>
                                                2026 ANNUAL VISION
                                            </p>
                                            <h1 style={{
                                                fontSize: isPortrait ? '13px' : '16px',
                                                fontWeight: 900,
                                                fontStyle: 'italic',
                                                color: isDark ? '#f1f5f9' : '#1e293b',
                                                lineHeight: 1.2,
                                                letterSpacing: '-0.3px',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}>
                                                "{theme || '我的年度主题'}"
                                            </h1>
                                        </div>
                                    )}

                                    {/* Slide body */}
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                                        {slide.id === 'A' && (
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px', minHeight: 0 }}>
                                                <WheelOfLife data={allocations} isDark={isDark} uniqueId={`slide-a-${isDark}`} />
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                                                    {Object.entries(allocations)
                                                        .sort(([, a], [, b]) => b - a)
                                                        .slice(0, 8)
                                                        .map(([domain, hours], i) => {
                                                            const colors = ['#818cf8', '#fb923c', '#a78bfa', '#38bdf8', '#fb7185', '#4ade80', '#facc15', '#22d3ee'];
                                                            const shortNames: Record<string, string> = { '学习成长': '学习', '体验突破': '体验', '休闲娱乐': '休闲', '工作事业': '事业', '家庭生活': '家庭', '身体健康': '健康', '财务理财': '财富', '人际社群': '人际' };
                                                            return (
                                                                <div key={domain} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors[i], flexShrink: 0 }} />
                                                                    <span style={{ fontSize: '9px', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                        {shortNames[domain] || domain.slice(0, 2)}{hours > 0 ? ` ${Math.round(hours)}h` : ''}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        )}

                                        {slide.id === 'B' && (
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                                                <BentoGrid allocations={allocations} goals={goals} isDark={isDark} />
                                            </div>
                                        )}

                                        {slide.id === 'C' && (
                                            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                                                <QuarterlySlide goals={goals} tasks={tasks} isDark={isDark} />
                                            </div>
                                        )}

                                        {slide.id === 'D' && (
                                            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                                                <TabletDashboard goals={goals} tasks={tasks} theme={theme} isDark={isDark} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Card footer */}
                                    <div style={{ flexShrink: 0, marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '7px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: isDark ? 'rgba(148,163,184,0.4)' : 'rgba(100,116,139,0.5)' }}>
                                            The Goal-Grid Planner · 2026
                                        </span>
                                        <div style={{
                                            width: '20px', height: '20px', borderRadius: '50%',
                                            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '9px', fontWeight: 900, color: '#fff',
                                        }}>
                                            {slide.id}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Bottom action bar ─────────────────────────────────── */}
            <div
                style={{
                    flexShrink: 0,
                    padding: '8px 12px 16px',
                    background: `linear-gradient(0deg, ${pageBg} 60%, transparent)`,
                    position: 'relative',
                    zIndex: 40,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        borderRadius: '16px',
                        background: barBg,
                        border: `1px solid ${barBorder}`,
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    {/* Prev / Next arrows */}
                    <button
                        onClick={() => goToSlide(Math.max(0, currentSlide - 1))}
                        disabled={currentSlide === 0}
                        style={{
                            padding: '7px',
                            borderRadius: '10px',
                            border: 'none',
                            cursor: 'pointer',
                            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                            color: textBase,
                            opacity: currentSlide === 0 ? 0.3 : 1,
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => goToSlide(Math.min(SLIDES.length - 1, currentSlide + 1))}
                        disabled={currentSlide === SLIDES.length - 1}
                        style={{
                            padding: '7px',
                            borderRadius: '10px',
                            border: 'none',
                            cursor: 'pointer',
                            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                            color: textBase,
                            opacity: currentSlide === SLIDES.length - 1 ? 0.3 : 1,
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <ChevronRight size={16} />
                    </button>

                    <div style={{ width: '1px', height: '22px', background: barBorder }} />

                    {/* Safe Zone toggle */}
                    <button
                        onClick={() => setShowSafeZone(v => !v)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 10px',
                            borderRadius: '10px',
                            border: showSafeZone ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: showSafeZone ? 'rgba(99,102,241,0.15)' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
                            color: showSafeZone ? '#818cf8' : textMuted,
                        }}
                    >
                        {showSafeZone ? <Shield size={13} /> : <ShieldOff size={13} />}
                        安全区
                    </button>

                    {/* Dark / Light toggle */}
                    <button
                        onClick={() => setIsDark(v => !v)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 10px',
                            borderRadius: '10px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(251,191,36,0.15)',
                            color: isDark ? '#818cf8' : '#d97706',
                        }}
                    >
                        {isDark ? <Moon size={13} /> : <Sun size={13} />}
                        {isDark ? '深色' : '浅色'}
                    </button>

                    <div style={{ flex: 1 }} />

                    {/* Download button */}
                    <button
                        onClick={handleDownload}
                        disabled={exporting}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: exporting ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            fontWeight: 800,
                            background: accentGrad,
                            color: '#ffffff',
                            boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                            opacity: exporting ? 0.6 : 1,
                        }}
                    >
                        {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        {exporting ? '生成中...' : '下载'}
                    </button>
                </div>
            </div>

            {/* ── Mobile preview modal ─────────────────────────────── */}
            {previewImage && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 100,
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'rgba(0,0,0,0.97)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', flexShrink: 0 }}>
                        <button
                            onClick={() => {
                                if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
                                setPreviewBlobUrl(null);
                                setPreviewImage(null);
                            }}
                            style={{ padding: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex' }}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '15px' }}>图片已生成 ✓</span>
                        <div style={{ width: '36px' }} />
                    </div>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', overflow: 'hidden' }}>
                        <img
                            src={previewBlobUrl || previewImage}
                            alt="年度计划图"
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '16px' }}
                            crossOrigin="anonymous"
                        />
                    </div>

                    <div style={{ padding: '16px 18px 32px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{
                            borderRadius: '16px',
                            padding: '12px 16px',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: 600,
                            background: 'rgba(99,102,241,0.15)',
                            border: '1px solid rgba(99,102,241,0.3)',
                            color: '#a5b4fc',
                        }}>
                            💡 长按上方图片，选择「保存图片」保存到相册
                        </div>
                        {/* Direct save button – works even when long-press does not */}
                        <button
                            onClick={() => {
                                if (!previewImage) return;
                                // Create a FRESH blob URL just for this download click,
                                // then immediately revoke it – this avoids:
                                // 1. Browser security block on huge data: URLs
                                // 2. Stale-reference issue from reusing a stored blob URL
                                const ts = Date.now();
                                const fname = `年度计划_${previewSlideId}_${new Date().toISOString().slice(0, 10)}_${ts}.png`;
                                const freshBlobUrl = dataUrlToBlobUrl(previewImage);
                                const a = document.createElement('a');
                                a.href = freshBlobUrl;
                                a.download = fname;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                // Revoke after a short delay to let the download start
                                setTimeout(() => URL.revokeObjectURL(freshBlobUrl), 3000);
                            }}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '16px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 800,
                                fontSize: '15px',
                                background: accentGrad,
                                color: '#fff',
                                boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                            }}
                        >
                            <Download size={16} /> 开始保存
                        </button>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => {
                                    if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
                                    setPreviewBlobUrl(null);
                                    setPreviewImage(null);
                                }}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    borderRadius: '16px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 800,
                                    fontSize: '14px',
                                    background: 'rgba(255,255,255,0.08)',
                                    color: '#e2e8f0',
                                }}
                            >
                                关闭
                            </button>
                            {navigator.share && (
                                <button
                                    onClick={async () => {
                                        try {
                                            const res = await fetch(previewImage);
                                            const blob = await res.blob();
                                            const file = new File([blob], '年度计划.png', { type: 'image/png' });
                                            if (navigator.canShare?.({ files: [file] })) {
                                                await navigator.share({ title: '我的年度计划', files: [file] });
                                            }
                                        } catch { /* AbortError OK */ }
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '14px',
                                        borderRadius: '16px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: 800,
                                        fontSize: '14px',
                                        background: accentGrad,
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                    }}
                                >
                                    <Share2 size={15} /> 分享
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Scrollbar hide */}
            <style>{`
                div[style*="scroll-snap-type"] { scrollbar-width: none; }
                div[style*="scroll-snap-type"]::-webkit-scrollbar { display: none; }
                [style*="overflowX: auto"]::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
}
