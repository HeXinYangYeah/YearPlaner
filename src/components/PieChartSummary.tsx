import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useStore } from '../store/useStore';
import { differenceInDays, parseISO } from 'date-fns';

ChartJS.register(ArcElement, Tooltip, Legend);

const DOMAIN_COLORS: Record<string, string> = {
    '学习成长': '#3b82f6',
    '体验突破': '#f43f5e',
    '休闲娱乐': '#ec4899',
    '工作事业': '#6366f1',
    '家庭生活': '#f97316',
    '身体健康': '#10b981',
    '财务理财': '#f59e0b',
    '人际社群': '#8b5cf6'
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
                borderWidth: 4,
                borderColor: '#ffffff',
                hoverOffset: 8
            },
        ],
    };

    const options = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        family: 'Inter, sans-serif',
                        size: 13,
                        weight: 'bold' as const
                    },
                    color: '#475569'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1e293b',
                bodyColor: '#475569',
                borderColor: '#f1f5f9',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                titleFont: { family: 'Inter', size: 14, weight: 'bold' as const },
                bodyFont: { family: 'Inter', size: 13, weight: 'normal' as const },
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
        <div className="flex flex-col items-center justify-center h-full w-full">
            <h3 className="text-xl font-bold font-serif text-slate-800 mb-6 w-full text-left">时间投入占比</h3>
            <div className="w-full h-[280px] flex justify-center items-center">
                <Pie data={data} options={options} />
            </div>
        </div>
    );
}
