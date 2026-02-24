import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';
import type { Goal, Task } from '../store/useStore';
import {
    ChevronLeft, ChevronRight, Clock, Edit2, Trash2, AlertTriangle,
    Plus, Target, CheckCircle2, Calendar, Timer
} from 'lucide-react';
import TaskModal from './TaskModal';
import { eachWeekOfInterval, parseISO, startOfWeek, endOfWeek, format } from 'date-fns';

// ── Helper: check if goal has time set or is decomposed ────────────────────────
function hasTimeSet(goal: Goal, tasks: Task[]) {
    return !!goal.startDate || tasks.some(t => t.goalId === goal.id && !t.hidden);
}

// ── Domain config — ORDER matches GoalGrid 9-grid: L→R, T→B, skip center ──────
const DOMAIN_ORDER = [
    '学习成长', '体验突破', '休闲娱乐',
    '工作事业', '家庭生活', '身体健康',
    '财务理财', '人际社群',
] as const;

type DomainName = typeof DOMAIN_ORDER[number];

// Colors matched to the bento board image the user uploaded
const DOMAIN_THEME: Record<DomainName, {
    solid: string; bg: string; ring: string; text: string; muted: string; chip: string;
}> = {
    '学习成长': { solid: '#818cf8', bg: '#1a1248', ring: 'rgba(129,140,248,0.40)', text: '#c4b5fd', muted: 'rgba(196,181,253,0.65)', chip: 'rgba(129,140,248,0.18)' },
    '体验突破': { solid: '#c4945a', bg: '#2a1a0a', ring: 'rgba(196,148,90,0.40)', text: '#f5c98e', muted: 'rgba(245,201,142,0.65)', chip: 'rgba(196,148,90,0.18)' },
    '休闲娱乐': { solid: '#7c6fc4', bg: '#1a1338', ring: 'rgba(124,111,196,0.40)', text: '#c4b5fd', muted: 'rgba(196,181,253,0.65)', chip: 'rgba(124,111,196,0.18)' },
    '工作事业': { solid: '#4f77c0', bg: '#0d1a30', ring: 'rgba(79,119,192,0.40)', text: '#93c5fd', muted: 'rgba(147,197,253,0.65)', chip: 'rgba(79,119,192,0.18)' },
    '家庭生活': { solid: '#c05a74', bg: '#2a0d16', ring: 'rgba(192,90,116,0.40)', text: '#fda4af', muted: 'rgba(253,164,175,0.65)', chip: 'rgba(192,90,116,0.18)' },
    '身体健康': { solid: '#3a7a55', bg: '#0a1e12', ring: 'rgba(58,122,85,0.40)', text: '#6ee7b7', muted: 'rgba(110,231,183,0.65)', chip: 'rgba(58,122,85,0.18)' },
    '财务理财': { solid: '#b08240', bg: '#1a1204', ring: 'rgba(176,130,64,0.40)', text: '#fde68a', muted: 'rgba(253,230,138,0.65)', chip: 'rgba(176,130,64,0.18)' },
    '人际社群': { solid: '#35a0a0', bg: '#051516', ring: 'rgba(53,160,160,0.40)', text: '#67e8f9', muted: 'rgba(103,232,249,0.65)', chip: 'rgba(53,160,160,0.18)' },
};

// ── Helper: calculate total planned hours from goals ──────────────────────────
function calcTotalPlannedHours(goals: Goal[], tasks: Task[]): number {
    let total = 0;
    goals.forEach(goal => {
        const goalTasks = tasks.filter(t => t.goalId === goal.id && !t.hidden);
        if (goalTasks.length > 0) {
            goalTasks.forEach(t => {
                if (t.weeklyHours) {
                    const weeks = goal.startDate && goal.endDate
                        ? Math.max(1, Math.round((new Date(goal.endDate).getTime() - new Date(goal.startDate).getTime()) / (7 * 24 * 3600000)))
                        : 52;
                    total += t.weeklyHours * weeks;
                } else if (t.dailyMinutes && t.weeklyFrequency) {
                    const weeks = goal.startDate && goal.endDate
                        ? Math.max(1, Math.round((new Date(goal.endDate).getTime() - new Date(goal.startDate).getTime()) / (7 * 24 * 3600000)))
                        : 52;
                    total += (t.dailyMinutes * t.weeklyFrequency / 60) * weeks;
                }
            });
        } else if (goal.startDate && goal.endDate) {
            const weeks = Math.max(1, Math.round((new Date(goal.endDate).getTime() - new Date(goal.startDate).getTime()) / (7 * 24 * 3600000)));
            if (goal.weeklyHours) total += goal.weeklyHours * weeks;
            else if (goal.dailyMinutes) total += (goal.dailyMinutes / 60) * 7 * weeks;
        }
    });
    return Math.round(total);
}

// ── Helper: compute peak week ──────────────────────────────────────────────────
function calcPeakWeek(goals: Goal[], tasks: Task[], availableWeekly: number) {
    const startOfAnalysis = startOfWeek(new Date());
    const endOfAnalysis = parseISO('2026-12-31');
    const weeks = eachWeekOfInterval({ start: startOfAnalysis, end: endOfAnalysis });

    const weeklyLoad = weeks.map(weekStart => {
        const weekEnd = endOfWeek(weekStart);
        let totalHours = 0;
        tasks.forEach(task => {
            if (task.hidden) return;
            const taskStart = parseISO(task.startDate);
            const taskEnd = parseISO(task.endDate);
            if (taskStart <= weekEnd && taskEnd >= weekStart) {
                if (task.weeklyHours) totalHours += task.weeklyHours;
                else if (task.dailyMinutes && task.weeklyFrequency) totalHours += (task.dailyMinutes * task.weeklyFrequency) / 60;
            }
        });
        goals.forEach(goal => {
            if (tasks.filter(t => t.goalId === goal.id).length === 0 && goal.startDate && goal.endDate) {
                const gStart = parseISO(goal.startDate);
                const gEnd = parseISO(goal.endDate);
                if (gStart <= weekEnd && gEnd >= weekStart) {
                    if (goal.weeklyHours) totalHours += goal.weeklyHours;
                    else if (goal.dailyMinutes) totalHours += (goal.dailyMinutes * 7) / 60;
                }
            }
        });
        return { start: weekStart, end: weekEnd, totalHours };
    });

    const maxWeek = [...weeklyLoad].sort((a, b) => b.totalHours - a.totalHours)[0];
    const overBudgetWeeks = weeklyLoad.filter(w => w.totalHours > availableWeekly);
    return {
        peakHours: maxWeek?.totalHours || 0,
        peakStart: maxWeek?.start,
        peakEnd: maxWeek?.end,
        isOverBudget: overBudgetWeeks.length > 0,
        overBudgetWeeks,
    };
}

// ── Toast component ────────────────────────────────────────────────────────────
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
    useEffect(() => {
        const t = setTimeout(onDone, 2800);
        return () => clearTimeout(t);
    }, [onDone]);
    return (
        <div style={{
            position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)',
            zIndex: 999, background: 'rgba(239,68,68,0.95)', color: '#fff',
            padding: '10px 20px', borderRadius: '14px', fontWeight: 700, fontSize: '14px',
            boxShadow: '0 4px 20px rgba(239,68,68,0.4)', whiteSpace: 'nowrap',
            backdropFilter: 'blur(8px)',
            animation: 'fadeInUp 0.25s ease',
        }}>
            {message}
        </div>
    );
}

// ── Onboarding Modal ───────────────────────────────────────────────────────────
function OnboardingModal({ onClose }: { onClose: () => void }) {
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 500, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '24px',
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #1e1b4b, #0f172a)',
                borderRadius: '28px', padding: '32px 28px', maxWidth: '380px', width: '100%',
                border: '1px solid rgba(129,140,248,0.3)',
                boxShadow: '0 20px 60px rgba(99,102,241,0.3)',
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '20px',
                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Target size={28} color="#fff" />
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#f1f5f9', lineHeight: 1.2 }}>
                        为什么要进行目标拆解？
                    </h2>
                    <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>
                        目标往往是庞大且抽象的。通过将目标拆解为具体的<strong style={{ color: '#818cf8' }}>习惯类</strong>或<strong style={{ color: '#818cf8' }}>项目类</strong>任务，你才能将其排入每天的日程表，确保被有效执行。
                    </p>
                    <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'center', marginTop: '4px' }}>
                        {[
                            { icon: <Target size={18} />, label: '宏大目标', color: '#818cf8' },
                            { icon: <ChevronRight size={16} />, label: '', color: '#475569' },
                            { icon: <CheckCircle2 size={18} />, label: '每日习惯', color: '#4ade80' },
                            { icon: <ChevronRight size={16} />, label: '', color: '#475569' },
                            { icon: <Calendar size={18} />, label: '具体项目', color: '#fb923c' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                <div style={{ color: item.color }}>{item.icon}</div>
                                {item.label && <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>{item.label}</span>}
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            marginTop: '8px', width: '100%', padding: '14px',
                            borderRadius: '16px', border: 'none', cursor: 'pointer',
                            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                            color: '#fff', fontSize: '16px', fontWeight: 800,
                            boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                        }}
                    >
                        我知道了，开始填写
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Real-time Dashboard Strip ──────────────────────────────────────────────────
// FIX #2: 剩余可用 = availableYearly - plannedHours (Step 2 yearly available)
// FIX #3: Show weekly available time at top
function DashboardStrip({
    goals, tasks, timeBudget,
}: {
    goals: Goal[]; tasks: Task[];
    timeBudget: { workHours: number; sleepHours: number; necessaryHours: number };
}) {
    const totalUsed = timeBudget.workHours + timeBudget.sleepHours + timeBudget.necessaryHours;
    const availableWeekly = Math.max(0, 168 - totalUsed);
    const availableYearly = availableWeekly * 52;  // FIX #2: use Step 2 yearly
    const plannedHours = calcTotalPlannedHours(goals, tasks);
    const remainingHours = Math.max(0, availableYearly - plannedHours); // FIX #2
    const planPct = availableYearly > 0 ? Math.min((plannedHours / availableYearly) * 100, 100) : 0;

    const { peakHours, peakStart, peakEnd, isOverBudget } = calcPeakWeek(goals, tasks, availableWeekly);

    return (
        <div style={{
            background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            padding: '10px 16px', flexShrink: 0,
        }}>
            {/* FIX #3: Weekly available time header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Clock size={10} color="#38bdf8" />
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#38bdf8' }}>
                    每周可用 {availableWeekly}h
                </span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#475569' }}>
                    年度 {availableYearly}h
                </span>
            </div>

            {/* Annual progress bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    年度总览
                </span>
                <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%', borderRadius: '3px',
                        background: planPct > 90 ? 'linear-gradient(90deg,#ef4444,#f97316)' : 'linear-gradient(90deg,#6366f1,#4ade80)',
                        width: `${planPct}%`, transition: 'width 0.5s ease',
                    }} />
                </div>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#818cf8', whiteSpace: 'nowrap' }}>
                    {Math.round(planPct)}%
                </span>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '9px', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>已规划</span>
                    <span style={{ fontSize: '14px', fontWeight: 900, color: '#818cf8' }}>{plannedHours}<span style={{ fontSize: '9px', color: '#475569', fontWeight: 600, marginLeft: '2px' }}>h</span></span>
                </div>
                <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '9px', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>剩余可用</span>
                    {/* FIX #2: now shows availableYearly - planned */}
                    <span style={{ fontSize: '14px', fontWeight: 900, color: remainingHours < availableYearly * 0.1 ? '#ef4444' : '#4ade80' }}>
                        {remainingHours}<span style={{ fontSize: '9px', color: '#475569', fontWeight: 600, marginLeft: '2px' }}>h</span>
                    </span>
                </div>
                <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '9px', color: isOverBudget ? '#fca5a5' : '#475569', fontWeight: 700, textTransform: 'uppercase' }}>
                        Peak Week {isOverBudget ? '⚠️' : ''}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 900, color: isOverBudget ? '#ef4444' : '#fb923c' }}>
                        {peakHours.toFixed(1)}<span style={{ fontSize: '9px', fontWeight: 600, marginLeft: '2px', color: '#475569' }}>h</span>
                    </span>
                </div>
                {peakStart && peakEnd && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: '9px', color: '#475569', fontWeight: 600 }}>Peak 时段</span>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: isOverBudget ? '#ef4444' : '#94a3b8' }}>
                            {format(peakStart, 'M/d')}–{format(peakEnd, 'M/d')}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── FIX #6: Collapsible inline time picker ────────────────────────────────────
// Time settings are hidden by default; tap "直接设置时间" to expand
function InlineTimePicker({ goal, theme, autoOpen, onCancel }: { goal: Goal; theme: typeof DOMAIN_THEME[DomainName]; autoOpen?: boolean; onCancel?: () => void }) {
    const { updateGoal } = useStore();
    // Default to open if autoOpen is true OR if no time is set
    const [open, setOpen] = useState(autoOpen ?? !goal.startDate);
    const [timeMode, setTimeMode] = useState<'daily' | 'weekly'>(goal.weeklyHours ? 'weekly' : 'daily');
    const [dailyMinutes, setDailyMinutes] = useState(goal.dailyMinutes?.toString() || '60');
    const [weeklyHours, setWeeklyHours] = useState(goal.weeklyHours?.toString() || '5');
    const [startDate, setStartDate] = useState(goal.startDate || '2026-01-01');
    const [endDate, setEndDate] = useState(goal.endDate || '2026-12-31');

    useEffect(() => {
        if (autoOpen !== undefined) setOpen(autoOpen);
    }, [autoOpen]);

    const handleSave = () => {
        if (!startDate || !endDate) return;
        updateGoal(goal.id, {
            startDate,
            endDate,
            dailyMinutes: timeMode === 'daily' ? parseInt(dailyMinutes, 10) : undefined,
            weeklyHours: timeMode === 'weekly' ? parseFloat(weeklyHours) : undefined,
        });
        setOpen(false);
    };

    const handleCancel = () => {
        setOpen(false);
        if (onCancel) onCancel();
    };

    // Collapsed: show summary card if time is set
    if (!open) {
        if (!goal.startDate) return null;
        return (
            <div style={{ marginBottom: '10px' }}>
                <div style={{
                    background: theme.chip, border: `1px solid ${theme.ring}`,
                    borderRadius: '14px', padding: '12px 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div>
                        <p style={{ fontSize: '11px', color: theme.muted, marginBottom: '4px', fontWeight: 700 }}>
                            <Calendar size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                            {goal.startDate} → {goal.endDate}
                        </p>
                        <p style={{ fontSize: '14px', fontWeight: 800, color: theme.text }}>
                            <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                            {goal.weeklyHours ? `每周 ${goal.weeklyHours} 小时` : `每天 ${goal.dailyMinutes} 分钟`}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setOpen(true)} style={{
                            padding: '8px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                            background: 'rgba(255,255,255,0.1)', color: theme.text, display: 'flex',
                        }}>
                            <Edit2 size={16} />
                        </button>
                        <button onClick={() => {
                            updateGoal(goal.id, { startDate: undefined, endDate: undefined, dailyMinutes: undefined, weeklyHours: undefined });
                        }} style={{
                            padding: '8px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                            background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex',
                        }}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Expanded: full time picker panel
    return (
        <div style={{
            background: 'rgba(0,0,0,0.30)', border: `1px solid ${theme.ring}`,
            borderRadius: '16px', padding: '16px', marginBottom: '10px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <p style={{ fontSize: '12px', fontWeight: 800, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    直接为愿景设置时间
                </p>
                <button onClick={handleCancel} style={{ fontSize: '12px', color: theme.muted, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                    取消设置
                </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                {(['startDate', 'endDate'] as const).map(field => (
                    <div key={field}>
                        <label style={{ fontSize: '10px', fontWeight: 700, color: theme.muted, display: 'block', marginBottom: '4px' }}>
                            {field === 'startDate' ? '开始日期' : '结束日期'}
                        </label>
                        <input
                            type="date"
                            value={field === 'startDate' ? startDate : endDate}
                            max="2026-12-31"
                            min="2026-01-01"
                            onChange={e => field === 'startDate' ? setStartDate(e.target.value) : setEndDate(e.target.value)}
                            style={{
                                width: '100%', padding: '8px 10px', borderRadius: '10px', border: `1px solid ${theme.ring}`,
                                background: 'rgba(0,0,0,0.3)', color: theme.text, fontSize: '12px',
                                outline: 'none', boxSizing: 'border-box',
                                colorScheme: 'dark',
                            }}
                        />
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                {(['daily', 'weekly'] as const).map(m => (
                    <button
                        key={m}
                        onClick={() => setTimeMode(m)}
                        style={{
                            padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, flex: 1,
                            background: timeMode === m ? theme.solid : 'rgba(255,255,255,0.06)',
                            color: timeMode === m ? '#000' : theme.muted, transition: 'all 0.2s',
                        }}
                    >
                        {m === 'daily' ? '每天' : '每周'}
                    </button>
                ))}
            </div>
            {timeMode === 'daily' ? (
                <div>
                    <label style={{ fontSize: '10px', color: theme.muted, display: 'block', marginBottom: '4px', fontWeight: 700 }}>每日时长（分钟）</label>
                    <input type="number" min="1" value={dailyMinutes}
                        onChange={e => setDailyMinutes(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.ring}`, background: 'rgba(0,0,0,0.3)', color: theme.text, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                </div>
            ) : (
                <div>
                    <label style={{ fontSize: '10px', color: theme.muted, display: 'block', marginBottom: '4px', fontWeight: 700 }}>每周总投入（小时）</label>
                    <input type="number" min="0.5" step="0.5" value={weeklyHours}
                        onChange={e => setWeeklyHours(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.ring}`, background: 'rgba(0,0,0,0.3)', color: theme.text, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                </div>
            )}
            <button onClick={handleSave} style={{
                marginTop: '12px', width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                cursor: 'pointer', background: theme.solid, color: '#000', fontSize: '14px', fontWeight: 800,
            }}>
                保存时间设置
            </button>
        </div>
    );
}

// ── Goal Card with mutually exclusive choices ─────────────────────────────────
function GoalCard({ goal, tasks, domainTheme, removeTask, setActiveGoalForTask, setEditingTask }: any) {
    const goalTasks = tasks.filter((t: Task) => t.goalId === goal.id && !t.hidden);
    const isDecomposed = goalTasks.length > 0;

    const [settingTime, setSettingTime] = useState(false);
    const hasTimeSet = !!goal.startDate;

    return (
        <div style={{
            width: '100%',
            background: 'rgba(0,0,0,0.28)', border: `1px solid ${domainTheme.ring}`,
            borderRadius: '18px', padding: '16px', boxSizing: 'border-box',
            display: 'flex', flexDirection: 'column', gap: '12px'
        }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: domainTheme.text, marginBottom: '4px' }}>
                {goal.title}
            </h3>

            {/* State 1: Nothing chosen yet */}
            {!isDecomposed && !hasTimeSet && !settingTime && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                    <button
                        onClick={() => setSettingTime(true)}
                        style={{
                            width: '100%', padding: '14px',
                            border: `1.5px solid ${domainTheme.ring}`,
                            borderRadius: '14px', background: 'transparent',
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: '8px', color: domainTheme.text,
                            fontSize: '14px', fontWeight: 800,
                            transition: 'all 0.2s',
                        }}
                    >
                        <Timer size={18} color={domainTheme.solid} />
                        直接为愿景设置时间
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>或</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    </div>

                    <button
                        onClick={() => setActiveGoalForTask(goal)}
                        style={{
                            width: '100%', padding: '14px', borderRadius: '14px',
                            border: 'none',
                            background: domainTheme.chip, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '8px', transition: 'all 0.2s', color: domainTheme.text,
                            fontSize: '14px', fontWeight: 800
                        }}
                    >
                        <Plus size={18} color={domainTheme.solid} />
                        将愿景拆解为具体目标
                    </button>
                    <p style={{ fontSize: '11px', color: domainTheme.muted, textAlign: 'center', marginTop: '-4px' }}>
                        拆解为具体的习惯或项目，可极大提升成功率
                    </p>
                </div>
            )}

            {/* State 2: Time setting mode */}
            {(!isDecomposed && (settingTime || hasTimeSet)) && (
                <InlineTimePicker
                    goal={goal}
                    theme={domainTheme}
                    autoOpen={settingTime && !hasTimeSet}
                    onCancel={() => setSettingTime(false)}
                />
            )}

            {/* State 3: Decomposed mode */}
            {isDecomposed && (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                        {goalTasks.map((task: Task) => (
                            <div key={task.id} style={{
                                background: 'rgba(255,255,255,0.06)', borderRadius: '14px',
                                padding: '12px 14px', display: 'flex', alignItems: 'center',
                                gap: '10px', border: '1px solid rgba(255,255,255,0.08)',
                            }}>
                                <div style={{
                                    fontSize: '11px', fontWeight: 800, padding: '4px 8px', borderRadius: '8px',
                                    background: task.type === 'habit' ? 'rgba(56,189,248,0.15)' : 'rgba(251,146,60,0.15)',
                                    color: task.type === 'habit' ? '#38bdf8' : '#fb923c',
                                    flexShrink: 0,
                                }}>
                                    {task.type === 'habit' ? '习惯' : '项目'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: '14px', fontWeight: 700, color: domainTheme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {task.title}
                                    </p>
                                    <p style={{ fontSize: '11px', color: domainTheme.muted, marginTop: '4px' }}>
                                        {task.weeklyHours ? `每周 ${task.weeklyHours}h` : `每天 ${task.dailyMinutes}m × ${task.weeklyFrequency}天/周`}
                                        {' · '}{task.startDate?.slice(5)} → {task.endDate?.slice(5)}
                                    </p>
                                </div>
                                <button onClick={() => setEditingTask(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: domainTheme.muted, padding: '6px' }}>
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => removeTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', opacity: 0.8, padding: '6px' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                    {/* Add task CTA */}
                    <button
                        onClick={() => setActiveGoalForTask(goal)}
                        style={{
                            width: '100%', padding: '12px', borderRadius: '14px', marginTop: '4px',
                            border: `2px dashed ${domainTheme.ring}`,
                            background: 'transparent', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '8px', transition: 'all 0.2s', color: domainTheme.muted
                        }}
                    >
                        <Plus size={16} color={domainTheme.solid} />
                        <span style={{ fontSize: '13px', fontWeight: 700 }}>
                            继续添加具体目标
                        </span>
                    </button>
                </>
            )}
        </div>
    );
}

// ── Main TaskDecomposition component ──────────────────────────────────────────
export default function TaskDecomposition({ onBack }: { onBack?: () => void }) {
    const { goals, tasks, removeTask, timeBudget } = useStore();
    const [viewIndex, setViewIndex] = useState(0);
    const [activeGoalForTask, setActiveGoalForTask] = useState<Goal | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(true);
    const [toast, setToast] = useState<string | null>(null);

    const [activeCardIndex, setActiveCardIndex] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setActiveCardIndex(0);
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = 0;
        }
    }, [viewIndex]);

    // FIX #4: Build domain list using GoalGrid order
    const filledDomains = DOMAIN_ORDER.filter(d => goals.some(g => g.domain === d));
    const currentDomain = filledDomains[viewIndex] as DomainName | undefined;
    const domainGoals = currentDomain ? goals.filter(g => g.domain === currentDomain) : [];
    const domainTheme = currentDomain ? DOMAIN_THEME[currentDomain] : DOMAIN_THEME['学习成长'];

    const totalUsed = timeBudget.workHours + timeBudget.sleepHours + timeBudget.necessaryHours;
    const availableWeekly = Math.max(0, 168 - totalUsed);
    const { peakHours, isOverBudget: peakOver } = calcPeakWeek(goals, tasks, availableWeekly);

    const isLastDomain = viewIndex === filledDomains.length - 1;

    const handleNext = useCallback(() => {
        const missing = domainGoals.find(g => !hasTimeSet(g, tasks));
        if (missing) {
            setToast('请先为愿景设置时间或拆解目标');
            return;
        }
        if (isLastDomain) return;
        setViewIndex(i => Math.min(i + 1, filledDomains.length - 1));
    }, [domainGoals, tasks, isLastDomain, filledDomains.length]);

    const handlePrev = () => {
        setViewIndex(i => Math.max(i - 1, 0));
    };

    if (goals.length === 0) {
        return (
            <div style={{
                background: '#0f172a', borderRadius: '2rem', padding: '40px',
                textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)',
                maxWidth: '640px', margin: '0 auto',
            }}>
                <Target size={40} style={{ color: '#475569', margin: '0 auto 16px' }} />
                <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#e2e8f0', marginBottom: '8px' }}>任务拆解</h2>
                <p style={{ color: '#64748b', fontSize: '14px' }}>请先在上方添加你的年度目标与愿景。</p>
            </div>
        );
    }

    return (
        <>
            {/* Toast animation style */}
            <style>{`
                @keyframes fadeInUp { from { opacity:0; transform: translateX(-50%) translateY(12px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
            `}</style>

            {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
            {toast && <Toast message={toast} onDone={() => setToast(null)} />}
            {activeGoalForTask && (
                <TaskModal goal={activeGoalForTask} requireEvaluation={false} onClose={() => setActiveGoalForTask(null)} />
            )}
            {editingTask && (
                <TaskModal task={editingTask} requireEvaluation={false} onClose={() => setEditingTask(null)} />
            )}

            {/* FIX #1: Fixed full-screen layout, no overflow/scroll */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 10,
                display: 'flex', flexDirection: 'column',
                background: domainTheme.bg,
                transition: 'background 0.4s ease',
                overflowY: 'hidden',
            }}>
                {/* Dashboard strip at top */}
                <DashboardStrip goals={goals} tasks={tasks} timeBudget={timeBudget} />

                {/* Domain stepper header */}
                <div style={{
                    padding: '12px 20px 10px',
                    background: 'rgba(0,0,0,0.35)',
                    borderBottom: `1px solid ${domainTheme.ring}`,
                    flexShrink: 0,
                }}>
                    {/* Progress dots */}
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '10px', justifyContent: 'center' }}>
                        {filledDomains.map((d, i) => (
                            <button
                                key={d}
                                onClick={() => setViewIndex(i)}
                                style={{
                                    height: '4px',
                                    width: i === viewIndex ? '24px' : '6px',
                                    borderRadius: '3px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    background: i === viewIndex ? DOMAIN_THEME[d as DomainName].solid
                                        : i < viewIndex ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                                    transition: 'all 0.3s ease',
                                }}
                            />
                        ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '10px', fontWeight: 700, color: domainTheme.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
                                Step {viewIndex + 1} / {filledDomains.length}
                            </p>
                            <h2 style={{ fontSize: '22px', fontWeight: 900, color: domainTheme.text, lineHeight: 1.1 }}>
                                {currentDomain}
                            </h2>
                        </div>
                        {/* Peak warning badge */}
                        {peakOver && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '5px',
                                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: '10px', padding: '4px 10px',
                            }}>
                                <AlertTriangle size={12} color="#ef4444" />
                                <span style={{ fontSize: '11px', fontWeight: 800, color: '#ef4444' }}>峰值超载 {peakHours.toFixed(0)}h</span>
                            </div>
                        )}
                    </div>
                </div>

                <div
                    ref={scrollContainerRef}
                    onScroll={(e) => {
                        const target = e.target as HTMLDivElement;
                        const itemWidth = target.clientWidth;
                        if (itemWidth > 0) {
                            const index = Math.round(target.scrollLeft / itemWidth);
                            if (index !== activeCardIndex && index >= 0 && index < domainGoals.length) {
                                setActiveCardIndex(index);
                            }
                        }
                    }}
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'row',
                        overflowX: 'auto',
                        overflowY: 'hidden',
                        scrollSnapType: 'x mandatory',
                        WebkitOverflowScrolling: 'touch',
                        alignItems: 'stretch'
                    }}>
                    {domainGoals.map((goal) => (
                        <div key={goal.id} style={{
                            minWidth: '100%',
                            flexShrink: 0,
                            scrollSnapAlign: 'center',
                            padding: '24px 20px',
                            boxSizing: 'border-box',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <GoalCard
                                goal={goal}
                                tasks={tasks}
                                domainTheme={domainTheme}
                                removeTask={removeTask}
                                setActiveGoalForTask={setActiveGoalForTask}
                                setEditingTask={setEditingTask}
                            />
                        </div>
                    ))}
                </div>

                {/* Pagination Dots */}
                {domainGoals.length > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '20px', flexShrink: 0 }}>
                        {domainGoals.map((_, idx) => (
                            <div key={idx} style={{
                                width: activeCardIndex === idx ? '16px' : '6px',
                                height: '6px',
                                borderRadius: '3px',
                                backgroundColor: activeCardIndex === idx ? domainTheme.solid : domainTheme.muted,
                                opacity: activeCardIndex === idx ? 1 : 0.4,
                                transition: 'all 0.3s ease'
                            }} />
                        ))}
                    </div>
                )}

                {/* Bottom navigation — fixed at bottom */}
                <div style={{
                    padding: '10px 16px 20px',
                    borderTop: `1px solid ${domainTheme.ring}`,
                    display: 'flex', gap: '10px',
                    background: 'rgba(0,0,0,0.4)',
                    flexShrink: 0,
                }}>
                    <button
                        onClick={() => {
                            if (viewIndex === 0) {
                                if (onBack) onBack();
                            } else {
                                handlePrev();
                            }
                        }}
                        style={{
                            padding: '12px 18px', borderRadius: '16px', border: 'none', cursor: 'pointer',
                            background: 'rgba(255,255,255,0.07)', color: domainTheme.text,
                            fontWeight: 700, fontSize: '13px',
                            display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
                            transition: 'opacity 0.2s',
                        }}
                    >
                        <ChevronLeft size={16} /> 上一步
                    </button>
                    {!isLastDomain ? (
                        <button
                            onClick={handleNext}
                            style={{
                                flex: 1, padding: '12px', borderRadius: '16px', border: 'none',
                                cursor: 'pointer', fontWeight: 800, fontSize: '14px',
                                background: `linear-gradient(135deg, ${domainTheme.solid}, ${domainTheme.solid}cc)`,
                                color: domainTheme.bg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                boxShadow: `0 4px 16px ${domainTheme.ring}`,
                            }}
                        >
                            下一步：{filledDomains[viewIndex + 1]} <ChevronRight size={16} />
                        </button>
                    ) : (
                        <a
                            href="/report"
                            onClick={e => {
                                const missing = domainGoals.find(g => !hasTimeSet(g, tasks));
                                if (missing) {
                                    e.preventDefault();
                                    setToast('请先为愿景设置时间或拆解目标');
                                }
                            }}
                            style={{
                                flex: 1, padding: '12px', borderRadius: '16px',
                                textDecoration: 'none', fontWeight: 800, fontSize: '14px',
                                background: 'linear-gradient(135deg,#6366f1,#4ade80)',
                                color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                            }}
                        >
                            ✨ 生成年度报告
                        </a>
                    )}
                </div>
            </div>
        </>
    );
}
