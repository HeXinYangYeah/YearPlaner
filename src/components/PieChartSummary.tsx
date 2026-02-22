import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useStore } from '../store/useStore';
import { differenceInDays, parseISO } from 'date-fns';

ChartJS.register(ArcElement, Tooltip, Legend);

const DOMAIN_COLORS: Record<string, string> = {
    '职业发展': '#3b82f6', // blue-500
    '财务': '#10b981', // emerald-500
    '健康': '#ef4444', // red-500
    '家庭': '#f97316', // orange-500
    '社交': '#a855f7', // purple-500
    '学习': '#6366f1', // indigo-500
    '休闲': '#ec4899', // pink-500
    '个人成长': '#f59e0b' // amber-500
};

export default function PieChartSummary() {
    const { tasks, goals } = useStore();
    const visibleTasks = tasks.filter(t => !t.hidden);

    const domainHours: Record<string, number> = {};

    const calculateCost = (item: { startDate?: string, endDate?: string, weeklyHours?: number, dailyMinutes?: number, weeklyFrequency?: number }) => {
        try {
            if (!item.startDate || !item.endDate) return 0;
            const start = parseISO(item.startDate);
            const end = parseISO(item.endDate);
            const days = differenceInDays(end, start) + 1; // inclusive
            if (days <= 0) return 0;

            const weeks = days / 7;
            let weeklyCost = 0;

            if (item.weeklyHours) {
                weeklyCost = item.weeklyHours;
            } else if (item.dailyMinutes) {
                const freq = item.weeklyFrequency || 7;
                weeklyCost = (item.dailyMinutes * freq) / 60;
            }

            return weeklyCost * weeks;
        } catch (e) {
            return 0;
        }
    };

    visibleTasks.forEach(task => {
        const goal = goals.find(g => g.id === task.goalId);
        if (!goal) return;

        if (!domainHours[goal.domain]) domainHours[goal.domain] = 0;
        domainHours[goal.domain] += calculateCost(task);
    });

    // Also include undecomposed goals
    goals.forEach(goal => {
        const goalTasks = tasks.filter(t => t.goalId === goal.id);
        if (goalTasks.length === 0) {
            if (!domainHours[goal.domain]) domainHours[goal.domain] = 0;
            domainHours[goal.domain] += calculateCost(goal);
        }
    });

    const labels = Object.keys(domainHours).filter(k => domainHours[k] > 0);
    const dataValues = labels.map(k => Math.round(domainHours[k]));
    const bgColors = labels.map(k => DOMAIN_COLORS[k] || '#94a3b8');

    if (labels.length === 0) return null;

    const data = {
        labels,
        datasets: [
            {
                data: dataValues,
                backgroundColor: bgColors,
                borderWidth: 2,
                borderColor: '#ffffff',
            },
        ],
    };

    const options = {
        plugins: {
            legend: { position: 'right' as const },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += context.parsed + ' 小时';
                        }
                        return label;
                    }
                }
            }
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center justify-center h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-4 w-full text-left">时间投入占比</h3>
            <div className="w-full max-w-[300px]">
                <Pie data={data} options={options} />
            </div>
        </div>
    );
}
