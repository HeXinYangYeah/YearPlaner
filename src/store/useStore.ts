import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Domain =
    | '学习成长' | '体验突破' | '休闲娱乐' | '工作事业'
    | '家庭生活' | '身体健康' | '财务理财' | '人际社群';

export interface Goal {
    id: string;
    domain: Domain;
    title: string;
    createdAt: number;
    // For un-decomposed goals time tracking (Part C)
    startDate?: string;
    endDate?: string;
    dailyMinutes?: number;
    weeklyHours?: number;
}

export type TaskType = 'habit' | 'project';

export interface Task {
    id: string;
    goalId: string;
    title: string;
    type: TaskType;
    // Habit: daily duration (min) and weekly frequency (days/week), OR weekly duration (hours)
    // Project: daily/weekly duration as well 
    dailyMinutes?: number;
    weeklyFrequency?: number;
    weeklyHours?: number;
    startDate: string; // ISO date string
    endDate: string; // ISO date string

    // Evaluation 1-10
    painScore: number;
    passionScore: number;
    timingScore: number;
    hidden: boolean;
    createdAt: number;
}

export interface TimeBudget {
    workHours: number;
    sleepHours: number;
    necessaryHours: number;
}

interface PlannerState {
    theme: string;
    setTheme: (theme: string) => void;

    goals: Goal[];
    addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
    updateGoal: (id: string, goal: Partial<Goal>) => void;
    removeGoal: (id: string) => void;

    tasks: Task[];
    addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    removeTask: (id: string) => void;
    hideTask: (id: string) => void;
    unhideTask: (id: string) => void;

    timeBudget: TimeBudget;
    updateTimeBudget: (budget: Partial<TimeBudget>) => void;

    shareId: string | null;
    setShareId: (id: string | null) => void;
    syncToCloud: () => Promise<string>;
    loadFromCloud: (id: string) => Promise<void>;

    showTutorial: boolean;
    setShowTutorial: (show: boolean) => void;

    activeModal: string | null;
    setActiveModal: (modalId: string | null) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useStore = create<PlannerState>()(
    persist(
        (set) => ({
            theme: '我的年度主题',
            setTheme: (theme) => set({ theme }),

            goals: [],
            addGoal: (goal) => set((state) => {
                const domainGoals = state.goals.filter(g => g.domain === goal.domain);
                if (domainGoals.length >= 3) return state; // Max 3 per domain

                return {
                    goals: [
                        ...state.goals,
                        { ...goal, id: generateId(), createdAt: Date.now() }
                    ]
                };
            }),
            updateGoal: (id, updates) => set((state) => ({
                goals: state.goals.map(g => g.id === id ? { ...g, ...updates } : g)
            })),
            removeGoal: (id) => set((state) => ({
                goals: state.goals.filter(g => g.id !== id),
                tasks: state.tasks.filter(t => t.goalId !== id) // Cascade delete
            })),

            tasks: [],
            addTask: (task) => set((state) => ({
                tasks: [
                    ...state.tasks,
                    { ...task, id: generateId(), createdAt: Date.now(), hidden: false }
                ]
            })),
            updateTask: (id, updates) => set((state) => ({
                tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
            })),
            removeTask: (id) => set((state) => ({
                tasks: state.tasks.filter(t => t.id !== id)
            })),
            hideTask: (id) => set((state) => ({
                tasks: state.tasks.map(t => t.id === id ? { ...t, hidden: true } : t)
            })),
            unhideTask: (id) => set((state) => ({
                tasks: state.tasks.map(t => t.id === id ? { ...t, hidden: false } : t)
            })),

            timeBudget: {
                workHours: 40,
                sleepHours: 56, // 8 * 7
                necessaryHours: 20
            },
            updateTimeBudget: (budget) => set((state) => ({
                timeBudget: { ...state.timeBudget, ...budget }
            })),

            shareId: null,
            setShareId: (id) => set({ shareId: id }),
            syncToCloud: async () => {
                const { theme, goals, tasks, timeBudget } = useStore.getState();
                const { doc, setDoc, collection } = await import('firebase/firestore');
                const { db } = await import('../firebase');

                const id = Math.random().toString(36).substring(2, 15);
                await setDoc(doc(collection(db, 'plans'), id), {
                    theme,
                    goals,
                    tasks,
                    timeBudget,
                    createdAt: Date.now(),
                    exportCount: 0,
                    lastExported: null
                });
                set({ shareId: id });
                return id;
            },
            loadFromCloud: async (id) => {
                const { doc, getDoc } = await import('firebase/firestore');
                const { db } = await import('../firebase');

                const docSnap = await getDoc(doc(db, 'plans', id));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    set({
                        theme: data.theme,
                        goals: data.goals,
                        tasks: data.tasks,
                        timeBudget: data.timeBudget,
                        shareId: id
                    });
                } else {
                    throw new Error('Plan not found');
                }
            },

            showTutorial: false,
            setShowTutorial: (show) => set({ showTutorial: show }),

            activeModal: null,
            setActiveModal: (id) => set({ activeModal: id }),
        }),
        {
            name: 'goal-grid-planner-storage',
        }
    )
);
