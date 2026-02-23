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
    const { theme, setTheme, goals } = useStore();
    const [isEditingTheme, setIsEditingTheme] = useState(false);
    const [tempTheme, setTempTheme] = useState(theme);

    // Identify domains without goals (v visions)
    // We ignore index 4 (center theme)
    const incompleteDomains = DOMAINS.filter((_, idx) => idx !== 4).filter(d => goals.filter(g => g.domain === d).length === 0);

    const handleThemeSave = () => {
        setTheme(tempTheme);
        setIsEditingTheme(false);
    };

    return (
        <div className="w-full max-w-5xl mx-auto mt-8">
            <div className="grid grid-cols-3 gap-3 md:gap-8 lg:gap-12 relative">

                {DOMAINS.map((domain, index) => {
                    if (index === 4) {
                        // Center Cell - The Hero (2026 Theme)
                        return (
                            <div
                                key="center"
                                className="aspect-square gradient-primary rounded-[2rem] shadow-soft-hover flex flex-col items-center justify-center p-4 text-white transform hover:scale-105 transition-all duration-500 relative overflow-hidden group border-2 border-white/20 backdrop-blur-xl z-10"
                            >
                                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                                <h3 className="text-[8px] md:text-sm font-bold mb-2 opacity-70 tracking-[0.2em] uppercase">2026 Theme</h3>

                                {isEditingTheme ? (
                                    <div className="flex flex-col items-center space-y-3 relative z-20 w-full px-1">
                                        <input
                                            type="text"
                                            value={tempTheme}
                                            onChange={(e) => setTempTheme(e.target.value)}
                                            placeholder="请输入你的2026主题"
                                            className="w-full text-center px-1 py-1 bg-white/10 border-b border-white/50 focus:border-white outline-none text-xs md:text-xl font-serif tracking-widest text-white placeholder-white/30"
                                            autoFocus
                                            onBlur={handleThemeSave}
                                            onKeyDown={(e) => e.key === 'Enter' && handleThemeSave()}
                                        />
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => setIsEditingTheme(true)}
                                        className="cursor-pointer text-center w-full px-2"
                                    >
                                        <h1 className={`font-serif font-bold tracking-widest drop-shadow-md leading-tight ${theme ? 'text-sm md:text-3xl' : 'text-[10px] md:text-lg opacity-40'}`}>
                                            {theme || "请输入主题"}
                                        </h1>
                                        <p className="text-[10px] text-white/50 uppercase tracking-widest mt-4 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">点击修改</p>
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <GoalGridCell
                            key={domain}
                            domain={domain}
                            showWarning={incompleteDomains.includes(domain) && !!theme && theme !== '我的年度主题' && theme.trim() !== ''}
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
