import { useState } from 'react';
import GoalGridCell from './GoalGridCell';
import GoalModal from './GoalModal';
import { useStore } from '../store/useStore';
import type { Domain } from '../store/useStore';

const DOMAINS: Domain[] = [
    '学习成长', '体验突破', '休闲娱乐',
    '工作事业', '中心', '家庭生活',
    '身体健康', '财务理财', '人际社群'
] as any[];

export default function GoalGrid() {
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
    const { theme, setTheme } = useStore();
    const [isEditingTheme, setIsEditingTheme] = useState(false);
    const [tempTheme, setTempTheme] = useState(theme);

    const handleThemeSave = () => {
        setTheme(tempTheme);
        setIsEditingTheme(false);
    };

    return (
        <div className="w-full max-w-5xl mx-auto mt-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12 relative">

                {DOMAINS.map((domain, index) => {
                    if (index === 4) {
                        // Center Cell - The Hero
                        return (
                            <div
                                key="center"
                                className="col-span-2 md:col-span-1 md:row-span-1 min-h-[160px] md:min-h-full gradient-primary rounded-[2rem] md:rounded-full shadow-soft-hover flex flex-col items-center justify-center p-8 text-white transform hover:scale-105 transition-all duration-500 relative overflow-hidden group border-2 border-white/20 backdrop-blur-xl z-10"
                            >
                                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                                <h3 className="text-xs md:text-sm font-bold mb-2 opacity-70 tracking-[0.2em] uppercase">202X Theme</h3>

                                {isEditingTheme ? (
                                    <div className="flex flex-col items-center space-y-3 relative z-20 w-full px-4">
                                        <input
                                            type="text"
                                            value={tempTheme}
                                            onChange={(e) => setTempTheme(e.target.value)}
                                            className="w-full text-center px-2 py-1 bg-white/10 border-b-2 border-white/50 focus:border-white outline-none text-xl font-serif tracking-widest text-white placeholder-white/50"
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && handleThemeSave()}
                                        />
                                        <button
                                            onClick={handleThemeSave}
                                            className="text-xs px-4 py-1.5 bg-white text-primary-700 rounded-full font-bold hover:bg-slate-100 transition"
                                        >
                                            SAVE
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => setIsEditingTheme(true)}
                                        className="cursor-pointer text-center"
                                    >
                                        <h1 className="text-2xl md:text-4xl font-serif font-bold tracking-widest drop-shadow-md">
                                            {theme}
                                        </h1>
                                        <p className="text-[10px] text-white/50 uppercase tracking-widest mt-4 opacity-0 group-hover:opacity-100 transition-opacity">Click to edit</p>
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <GoalGridCell
                            key={domain}
                            domain={domain}
                            onClick={() => setSelectedDomain(domain)}
                        />
                    );
                })}
            </div>

            {selectedDomain && (
                <GoalModal
                    domain={selectedDomain}
                    isOpen={!!selectedDomain}
                    onClose={() => setSelectedDomain(null)}
                />
            )}
        </div>
    );
}
