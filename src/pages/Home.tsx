import { useState } from 'react';
import { Link } from 'react-router-dom';
import GoalGrid from '../components/GoalGrid';
import TimeBudgetSettings from '../components/TimeBudgetSettings';
import TaskDecomposition from '../components/TaskDecomposition';
import { useStore } from '../store/useStore';

export default function Home() {
    const { theme, setTheme } = useStore();
    const [isEditingTheme, setIsEditingTheme] = useState(false);
    const [tempTheme, setTempTheme] = useState(theme);

    const handleThemeSave = () => {
        setTheme(tempTheme);
        setIsEditingTheme(false);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl mb-4">
                    <span className="block xl:inline">202X 年度计划</span>
                </h1>
                <div className="mt-3 max-w-md mx-auto sm:flex sm:justify-center md:mt-5 md:max-w-3xl">
                    {isEditingTheme ? (
                        <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
                            <input
                                type="text"
                                value={tempTheme}
                                onChange={(e) => setTempTheme(e.target.value)}
                                className="flex-1 px-4 py-2 border-none focus:ring-0 text-xl font-medium text-slate-700 bg-transparent outline-none"
                                placeholder="输入你的年度主题..."
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleThemeSave()}
                            />
                            <button
                                onClick={handleThemeSave}
                                className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition"
                            >
                                保存
                            </button>
                        </div>
                    ) : (
                        <div
                            onClick={() => setIsEditingTheme(true)}
                            className="cursor-pointer group relative inline-flex items-center"
                        >
                            <h2 className="text-2xl font-bold font-serif text-primary-600 border-b-2 border-dashed border-primary-300 group-hover:block transition">
                                {theme}
                            </h2>
                        </div>
                    )}
                </div>
            </header>

            <main className="flex flex-col gap-12">
                <GoalGrid />
                <TimeBudgetSettings />
                <TaskDecomposition />

                <div className="text-center py-8">
                    <Link to="/report" className="px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary-500/20 hover:scale-105 hover:shadow-2xl hover:bg-primary-700 transition-all inline-block">
                        生成年度计划报告
                    </Link>
                </div>
            </main>
        </div>
    );
}
