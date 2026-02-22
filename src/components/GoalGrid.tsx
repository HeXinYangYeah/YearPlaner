import { useState } from 'react';
import GoalGridCell from './GoalGridCell';
import GoalModal from './GoalModal';
import { useStore } from '../store/useStore';
import type { Domain } from '../store/useStore';

const DOMAINS: Domain[] = [
    '职业发展', '财务', '健康',
    '家庭', '中心', '社交',
    '学习', '休闲', '个人成长'
] as any[]; // casting since '中心' is not a domain but used for layout

export default function GoalGrid() {
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);

    const { theme } = useStore();

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-3 md:gap-6 aspect-square max-h-[800px]">
                {DOMAINS.map((domain, index) => {
                    if (index === 4) {
                        // Center Cell
                        return (
                            <div
                                key="center"
                                className="col-span-1 row-span-1 min-h-[120px] bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl shadow-xl flex flex-col items-center justify-center p-6 text-white transform hover:scale-105 transition-transform duration-300 relative overflow-hidden group border-4 border-white dark:border-slate-800 z-10"
                            >
                                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                <h3 className="text-xl md:text-3xl font-black mb-2 opacity-90 tracking-wider">年度主题</h3>
                                <p className="text-lg md:text-2xl font-serif text-center font-bold tracking-wide">{theme}</p>
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
