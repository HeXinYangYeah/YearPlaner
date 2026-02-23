import { parseISO } from 'date-fns';
import type { Domain, Task, Goal } from '../store/useStore';
import { calculateCost } from './plannerUtils';

export const calculateDomainTimeAllocations = (goals: Goal[], tasks: Task[]): Record<Domain, number> => {
    const allocations: Record<Domain, number> = {
        '学习成长': 0, '体验突破': 0, '休闲娱乐': 0, '工作事业': 0,
        '家庭生活': 0, '身体健康': 0, '财务理财': 0, '人际社群': 0
    };

    // Calculate time for tasks
    tasks.filter(t => !t.hidden).forEach(task => {
        const goal = goals.find(g => g.id === task.goalId);
        if (goal && allocations[goal.domain] !== undefined) {
            allocations[goal.domain] += calculateCost(task);
        }
    });

    // Add time for goals with no tasks
    goals.forEach(goal => {
        const goalTasks = tasks.filter(t => t.goalId === goal.id);
        if (goalTasks.length === 0 && allocations[goal.domain] !== undefined) {
            allocations[goal.domain] += calculateCost(goal);
        }
    });

    return allocations;
};

// Check if a task or goal is active in a specific month (0-11)
export const isActiveInMonth = (item: { startDate?: string, endDate?: string }, year: number, monthIndex: number): boolean => {
    if (!item.startDate || !item.endDate) return false;

    try {
        const start = parseISO(item.startDate);
        const end = parseISO(item.endDate);

        // Month start and end
        const monthStart = new Date(year, monthIndex, 1);
        const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59);

        // Check for overlap
        return start <= monthEnd && end >= monthStart;
    } catch {
        return false;
    }
};
