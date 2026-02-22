import { useState } from 'react';
import { useStore } from '../store/useStore';
import type { Domain } from '../store/useStore';
import { X, Plus, HelpCircle, Trash2, Lightbulb } from 'lucide-react';

interface GoalModalProps {
    domain: Domain;
    isOpen: boolean;
    onClose: () => void;
}

const SMART_TIPS = "SMART 原则：\nS: 具体 (Specific)\nM: 可衡量 (Measurable)\nA: 可实现 (Achievable)\nR: 相关性 (Relevant)\nT: 有时限 (Time-bound)";

const EXAMPLES: Record<string, string[]> = {
    '职业发展': ['晋升为高级工程师', '主导完成3个核心项目'],
    '财务': ['存下 50,000 元储蓄', '副业收入达到每月 2000 元'],
    '健康': ['每周保持3次有氧运动', '体脂率降至 18%'],
    '家庭': ['每月组织一次全家短途游', '每周日晚上陪父母视频一小时'],
    '社交': ['结识 5 位行业内资深人士', '每月参加 1 次线下读书会'],
    '学习': ['考取 AWS 解决方案架构师认证', '读完 24 本专业领域书籍'],
    '休闲': ['学会弹奏 5 首尤克里里曲子', '完成一次为期一周的新疆自驾游'],
    '个人成长': ['完成 100 篇高质量博客输出', '养成每天冥想 10 分钟的习惯']
};

export default function GoalModal({ domain, isOpen, onClose }: GoalModalProps) {
    const { goals, addGoal, removeGoal } = useStore();
    const [newTitle, setNewTitle] = useState('');
    const [showExamples, setShowExamples] = useState(false);

    const domainGoals = goals.filter(g => g.domain === domain);

    if (!isOpen) return null;

    const handleAdd = () => {
        if (!newTitle.trim()) return;
        if (domainGoals.length >= 3) return;
        addGoal({ domain, title: newTitle.trim() });
        setNewTitle('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800">{domain} 目标设置</h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowExamples(!showExamples)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-full transition flex items-center space-x-1"
                            title="查看案例"
                        >
                            <Lightbulb size={20} />
                            <span className="text-sm font-medium">案例</span>
                        </button>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {showExamples && (
                        <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                            <h4 className="text-sm font-bold text-amber-800 mb-2">领域范例：</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-amber-900/80">
                                {EXAMPLES[domain]?.map((ex, i) => (
                                    <li key={i}>{ex}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="space-y-4">
                        {domainGoals.map((g, i) => (
                            <div key={g.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                                <span className="font-medium text-slate-700">
                                    <span className="text-primary-500 mr-2">{i + 1}.</span>
                                    {g.title}
                                </span>
                                <button
                                    onClick={() => removeGoal(g.id)}
                                    className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}

                        {domainGoals.length < 3 ? (
                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-slate-700">添加新目标</label>
                                    <div className="group relative">
                                        <HelpCircle size={16} className="text-slate-400 cursor-help" />
                                        <div className="absolute right-0 w-64 p-3 bg-slate-800 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 whitespace-pre-wrap -top-2 translate-y-[-100%]">
                                            {SMART_TIPS}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                        placeholder="输入具体、可衡量的目标..."
                                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                                    />
                                    <button
                                        onClick={handleAdd}
                                        disabled={!newTitle.trim()}
                                        className="px-4 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    该领域还能添加 {3 - domainGoals.length} 个目标（最多 3 个）
                                </p>
                            </div>
                        ) : (
                            <div className="text-center p-4 bg-slate-50 rounded-2xl text-sm text-slate-500">
                                该领域目标已满（最多 3 个）
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 text-right">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition"
                    >
                        完成
                    </button>
                </div>
            </div>
        </div>
    );
}
