import { differenceInDays, parseISO } from 'date-fns';
import type { Task, TimeBudget, Goal } from '../store/useStore';

export const calculateCost = (item: { startDate?: string, endDate?: string, weeklyHours?: number, dailyMinutes?: number, weeklyFrequency?: number }) => {
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

export const getBudgetStatus = (timeBudget: TimeBudget, tasks: Task[], goals: Goal[]) => {
    const totalUsed = timeBudget.workHours + timeBudget.sleepHours + timeBudget.necessaryHours;
    const availableWeekly = 168 - totalUsed;
    const overallAnnualBudget = availableWeekly * 52;

    let plannedAnnualHours = 0;

    tasks.filter(t => !t.hidden).forEach(task => {
        plannedAnnualHours += calculateCost(task);
    });

    goals.forEach(goal => {
        const goalTasks = tasks.filter(t => t.goalId === goal.id);
        if (goalTasks.length === 0) {
            plannedAnnualHours += calculateCost(goal);
        }
    });

    const isOverBudget = plannedAnnualHours > overallAnnualBudget;
    const overage = Math.round(plannedAnnualHours - overallAnnualBudget);

    return {
        plannedAnnualHours,
        overallAnnualBudget,
        isOverBudget,
        overage
    };
};
