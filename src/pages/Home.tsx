import { Link } from 'react-router-dom';
import GoalGrid from '../components/GoalGrid';
import TimeBudgetSettings from '../components/TimeBudgetSettings';
import TaskDecomposition from '../components/TaskDecomposition';

export default function Home() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-20">
            <main className="flex flex-col gap-16">
                <section className="relative">
                    <GoalGrid />
                </section>

                <section>
                    <TimeBudgetSettings />
                </section>

                <section>
                    <TaskDecomposition />
                </section>

                <div className="text-center pb-20 pt-8">
                    <Link to="/report" className="px-10 py-5 gradient-primary text-white rounded-full font-bold text-xl shadow-soft-hover hover:scale-105 hover:shadow-2xl transition-all inline-flex items-center gap-3">
                        生成年度专属报告
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </Link>
                </div>
            </main>
        </div>
    );
}
