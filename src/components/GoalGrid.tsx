import { useState } from 'react';
import { Compass } from 'lucide-react';
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
                                className="min-h-[140px] md:min-h-[160px] bg-gradient-to-br from-orange-400 to-rose-500 rounded-[1.5rem] shadow-sm hover:shadow-md flex flex-col items-center justify-center p-4 text-white transform hover:-translate-y-1 transition-all duration-500 relative overflow-hidden group border border-white/40 backdrop-blur-xl z-10 w-full"
                            >
                                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>

                                <Compass
                                    className="w-8 h-8 md:w-12 md:h-12 mb-1 md:mb-3 opacity-90 drop-shadow-md text-white/90"
                                    strokeWidth={2}
                                />

                                <h3 className="text-[8px] md:text-sm font-bold mb-2 md:mb-3 opacity-80 tracking-[0.2em] uppercase">2026 Theme</h3>

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
                                            {theme || "填写年度主题"}
                                        </h1>
                                        <p className="text-[10px] text-white/50 uppercase tracking-widest mt-2 md:mt-4 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">点击修改</p>
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <GoalGridCell
                            key={domain}
                            domain={domain}
                            showWarning={incompleteDomains.includes(domain) && !!theme && theme !== '填写年度主题' && theme.trim() !== ''}
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
