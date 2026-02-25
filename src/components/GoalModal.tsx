import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { Domain } from '../store/useStore';
import { X, Trash2, ArrowRight, Lightbulb, CheckCircle2, ChevronDown, ChevronUp, Edit2, Sparkles, Loader2, AlertCircle } from 'lucide-react';
// Removed unused Firebase imports: import { getFunctions, httpsCallable } from 'firebase/functions';
// Removed unused Firebase imports: import { app } from '../firebase';

interface GoalModalProps {
    domain: Domain;
    isOpen: boolean;
    onClose: () => void;
}

const EXAMPLES: Record<Domain, { vague: string, specific: string[] }[]> = {
    '学习成长': [
        { vague: '能看懂没有字幕的英文脱口秀', specific: [] },
        { vague: '聊起历史能随口讲几个有意思的典故', specific: [] },
        { vague: '学会用手机拍出能发朋友圈的像样照片', specific: [] },
        { vague: '能看懂中医养生文章里的基本术语', specific: [] },
        { vague: '学一样小时候没条件学的乐器，比如古筝或口琴', specific: [] },
        { vague: '能写一手让同事夸“好看”的字', specific: [] },
        { vague: '看懂基本的红酒标签，点酒不露怯', specific: [] },
        { vague: '学会看户型图和装修图纸，不被销售忽悠', specific: [] }
    ],
    '体验突破': [
        { vague: '在livehouse跟着乐队大声唱一首喜欢的歌', specific: [] },
        { vague: '参加一次陌生人的徒步，走完一整条路线', specific: [] },
        { vague: '染一次以前不敢尝试的发色', specific: [] },
        { vague: '在夜市摆一次摊，卖自己做的小东西', specific: [] },
        { vague: '一个人去听一场演唱会，全程不用看手机', specific: [] },
        { vague: '参加一次志愿者活动，去敬老院或动物救助站', specific: [] },
        { vague: '给自己放一周假，去一个小县城住几天什么都不想', specific: [] },
        { vague: '参加一次即兴戏剧或开放麦，哪怕只是当观众', specific: [] }
    ],
    '休闲娱乐': [
        { vague: '周末能心安理得地躺半天不内疚', specific: [] },
        { vague: '把想玩的游戏通关一两个，不是只买了放着', specific: [] },
        { vague: '有几个固定的搭子，想玩随时能约', specific: [] },
        { vague: '每周追一集新番或综艺，有点小盼头', specific: [] },
        { vague: '学会玩一种桌游，能带新手上路', specific: [] },
        { vague: '有自己的小爱好，做着玩也能做出点样子', specific: [] },
        { vague: '下班后有件事能让自己不想工作', specific: [] },
        { vague: '每年至少解锁一种新玩法，比如露营、路亚、拼图', specific: [] }
    ],
    '工作事业': [
        { vague: '开会时说的话能被同事认真听', specific: [] },
        { vague: '有自己的“一摊事”，别人插不上手的那种', specific: [] },
        { vague: '下班后不用回工作消息也不心慌', specific: [] },
        { vague: '每年能攒点拿得出手的东西，比如项目、作品、业绩', specific: [] },
        { vague: '遇到难缠的客户或同事能接住，不怵', specific: [] },
        { vague: '加薪或跳槽时有底气谈价钱', specific: [] },
        { vague: '同事愿意跟我说点真心话', specific: [] },
        { vague: '有自己的一技之长，不怕被替代', specific: [] }
    ],
    '家庭生活': [
        { vague: '过年回家能心平气和待满三天不吵架', specific: [] },
        { vague: '爸妈学会用智能手机，有事能视频找我', specific: [] },
        { vague: '和伴侣周末能一起好好吃顿饭，不玩手机', specific: [] },
        { vague: '有自己的小窝，哪怕租的也收拾得像回事', specific: [] },
        { vague: '逢年过节能给家人挑到合适的礼物', specific: [] },
        { vague: '家里有个角落是专门属于自己的', specific: [] },
        { vague: '孩子或晚辈愿意跟我聊他们的事', specific: [] },
        { vague: '父母生病时，能请假照顾几天不慌张', specific: [] }
    ],
    '身体健康': [
        { vague: '换季时不再第一个感冒', specific: [] },
        { vague: '连续一周不熬夜，整个人状态不一样', specific: [] },
        { vague: '体检报告上没有标红的箭头', specific: [] },
        { vague: '跑两步赶公交不喘成狗', specific: [] },
        { vague: '腰和脖子不那么容易酸疼', specific: [] },
        { vague: '睡六个小时第二天也能撑住', specific: [] },
        { vague: '吃多了能管住嘴几天，不会一直胖下去', specific: [] },
        { vague: '每年能坚持一项运动三个月以上', specific: [] }
    ],
    '财务理财': [
        { vague: '月底不看余额宝也不慌', specific: [] },
        { vague: '换工作或者休息两三个月不至于焦虑', specific: [] },
        { vague: '朋友结婚随份子时不用纠结数额', specific: [] },
        { vague: '逢年过节给父母包红包不手抖', specific: [] },
        { vague: '想换手机或电脑时能直接买，不用分期硬撑', specific: [] },
        { vague: '有点闲钱能投着玩，亏了也不心疼', specific: [] },
        { vague: '清楚自己的钱花哪了，不是稀里糊涂月光', specific: [] },
        { vague: '遇到意外支出（修车、看病）时不至于刷爆卡', specific: [] }
    ],
    '人际社群': [
        { vague: '难过的时候能找到人出来喝酒聊天', specific: [] },
        { vague: '朋友买房结婚生娃，能真心替他们高兴', specific: [] },
        { vague: '有几个老同学，一年见一两次也不生分', specific: [] },
        { vague: '遇到不懂的事，能找到明白人问一问', specific: [] },
        { vague: '发朋友圈有人点赞评论，不是完全没人理', specific: [] },
        { vague: '能攒局组个饭局，大家吃得开心', specific: [] },
        { vague: '和人聊天时能接住话，不尬聊', specific: [] },
        { vague: '有几个不是同事的朋友，能聊点工作以外的事', specific: [] }
    ]
};

const TUTORIAL_EXAMPLES: Record<Domain, { vague: string, specific: string[] }> = {
    '学习成长': {
        vague: '和朋友聊电影时能说出点门道',
        specific: ['看完20部豆瓣TOP250电影', '每部写三句话短评', '了解3位导演的代表作风格', '每月和朋友约一次观影聊电影', '关注两个靠谱的影评公众号']
    },
    '体验突破': {
        vague: '一个人去陌生城市过个周末',
        specific: ['选一个没去过的周边城市', '订一家青旅或民宿', '不做攻略，随便逛吃两天', '拍一组街拍照片', '写篇随记发朋友圈']
    },
    '休闲娱乐': {
        vague: '周末能睡到自然醒',
        specific: ['周五前把所有工作收尾', '周六手机开勿扰模式', '买一套舒服的床品', '试两次睡醒直接吃早午餐', '周日晚上不焦虑周一']
    },
    '工作事业': {
        vague: '下班后不用想工作的事',
        specific: ['每天列待办清单，下班前清掉', '工作消息只在工作时间回', '每周最多加两天班', '和领导对齐一次职责边界', '培养一个下班后的爱好']
    },
    '家庭生活': {
        vague: '爸妈来我家觉得我过得挺好',
        specific: ['学会做3道爸妈爱吃的菜', '把房间收拾利索，不堆杂物', '带爸妈逛一次公园吃顿饭', '给他们看看我平时的生活照', '让他们放心，别老念叨']
    },
    '身体健康': {
        vague: '爬楼梯不喘气',
        specific: ['每周快走或慢跑2-3次', '坚持早睡，不熬夜刷手机', '每坐1小时站起来伸个懒腰', '少喝奶茶，多喝白水', '年底能一口气爬6层楼']
    },
    '财务理财': {
        vague: '月底不看余额也不慌',
        specific: ['每月发薪先存500元不动', '坚持记账3个月，知道钱花哪了', '取消2个不用的自动扣费', '年底攒够1万元“底气钱”', '少点外卖，自己带饭']
    },
    '人际社群': {
        vague: '有几个能随时叫出来吃饭的朋友',
        specific: ['每月主动约一个朋友吃饭', '朋友约饭尽量不推', '记住三五个好友的生日', '微信聊天不只发表情', '年底组个局大家一起聚聚']
    }
};

export default function GoalModal({ domain, isOpen, onClose }: GoalModalProps) {
    const { goals, addGoal, removeGoal, updateGoal, setActiveModal } = useStore();
    const [newTitle, setNewTitle] = useState('');
    const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const { addTask } = useStore();

    // Tutorial state - show if no goals in this domain yet
    const domainGoals = goals.filter(g => g.domain === domain);
    const [showTutorial, setShowTutorial] = useState(domainGoals.length === 0);
    const [showVisionReference, setShowVisionReference] = useState(false);

    // Sync with global modal state and lock body scroll
    useEffect(() => {
        if (isOpen) {
            setActiveModal(`goal - ${domain} `);

            // "Nuclear" scroll lock for mobile to prevent all wobble
            const scrollY = window.scrollY;
            const originalStyle = document.body.style.overflow;
            const originalPosition = document.body.style.position;
            const originalTop = document.body.style.top;
            const originalWidth = document.body.style.width;

            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `- ${scrollY} px`;
            document.body.style.width = '100%';
            document.body.style.overflowX = 'hidden';

            return () => {
                setActiveModal(null);
                document.body.style.overflow = originalStyle;
                document.body.style.position = originalPosition;
                document.body.style.top = originalTop;
                document.body.style.width = originalWidth;
                document.body.style.overflowX = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [isOpen, domain, setActiveModal]);

    if (!isOpen) return null;

    const handleAdd = async (customTitle?: string) => {
        const titleToAdd = customTitle || newTitle.trim();
        if (!titleToAdd) return;
        if (domainGoals.length >= 3) return;

        // Add goal synchronously
        addGoal({ domain, title: titleToAdd });
        setNewTitle('');

        // Extract code from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (!code) {
            console.log("No access code provided, skipping AI decomposition");
            return;
        }

        // Trigger AI decomposition automatically
        setIsAiLoading(true);
        try {
            const response = await fetch('/api/decompose-vision', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: code,
                    vision: titleToAdd,
                    domain: domain
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || '请求 AI 服务失败');
            }

            if (result.data && result.data.tasks && Array.isArray(result.data.tasks)) {
                // The Goal has just been added, we need to find its generated ID
                // Since we don't have the returned ID directly from addGoal, we can look it up by title and domain
                // Note: this assumes titles are unique within a domain for this exact moment
                setTimeout(() => {
                    const updatedGoals = useStore.getState().goals;
                    const latestGoal = updatedGoals.find(g => g.title === titleToAdd && g.domain === domain);
                    if (latestGoal) {
                        // Add all suggested tasks
                        result.data.tasks.forEach((taskTitle: string) => {
                            // Assuming DeepSeek returns something like "目标1: 早起跑步"
                            // Let's clean the string slightly if it starts with "目标X: "
                            const cleanTitle = taskTitle.replace(/^目标\d+[:：]\s*/, '').trim();
                            addTask({
                                goalId: latestGoal.id,
                                title: cleanTitle,
                                type: 'project', // Default new tasks to project for now
                                startDate: '', // User will set these later
                                endDate: '',
                                painScore: 5,
                                passionScore: 5,
                                timingScore: 5,
                                hidden: false
                            });
                        });
                        // Show a toast or feedback (optional)
                        console.log("AI decomposition success!");
                    }
                }, 500); // small delay to wait for zustand state to flush
            }

        } catch (e: any) {
            console.error("AI Decomposition failed:", e);
            alert(e.message || "智能拆解失败，请重试");
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end md:items-center md:justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-md transition-all overflow-x-hidden">
            <div className="bg-[#f8f9fa] rounded-t-3xl md:rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh] animate-in slide-in-from-bottom-5 md:zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-white">
                    <h2 className="text-xl md:text-2xl font-bold font-serif text-slate-800">{domain} 愿景思考</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-0 overflow-y-auto flex-1 font-sans modal-content-scrollable">
                    {showTutorial ? (
                        <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold text-slate-800">从愿景到年度目标</h3>
                                <p className="text-slate-500 text-sm">我们在做年度计划时，常常不知道从何下手。不要紧，只要先表达出自己模糊的愿景，然后拆解为具体的年度目标。</p>
                            </div>

                            <div className="bg-white rounded-[2rem] p-6 shadow-soft border border-slate-100">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="flex-1 text-center md:text-right w-full">
                                        <div className="inline-block px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold mb-3">模糊愿景</div>
                                        <h4 className="text-xl md:text-2xl font-serif font-bold text-slate-800 px-2 leading-snug">"{TUTORIAL_EXAMPLES[domain]?.vague || '我的愿景'}"</h4>
                                    </div>
                                    <div className="text-indigo-300 hidden md:block">
                                        <ArrowRight size={32} />
                                    </div>
                                    <div className="flex-1 space-y-3 w-full">
                                        <div className="text-center md:text-left">
                                            <div className="inline-block px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-sm font-bold">孵化的年度目标</div>
                                        </div>
                                        <ul className="text-sm text-slate-600 space-y-2 mt-2 w-full max-w-[300px] mx-auto md:max-w-none md:mx-0">
                                            {TUTORIAL_EXAMPLES[domain]?.specific?.map((item, idx) => (
                                                <li key={idx} className="flex gap-2 items-start text-left">
                                                    <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="sticky bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#f8f9fa] via-[#f8f9fa] to-transparent pt-10">
                                <button
                                    onClick={() => setShowTutorial(false)}
                                    className="w-full py-4 gradient-primary text-white rounded-2xl font-bold text-lg shadow-soft-hover hover:scale-[1.02] transition-transform"
                                >
                                    我懂了，开始设置 {domain} 愿景
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 md:p-8 bg-[#f8f9fa]">
                            <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 mb-8">
                                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    我的 {domain} 愿景
                                    <span className="text-xs font-normal text-slate-400">已设置 ({domainGoals.length}/3)</span>
                                </h4>

                                <div className="space-y-3 mb-6">
                                    {domainGoals.map((g, i) => (
                                        <div key={g.id} className="relative flex items-center justify-between p-4 bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl group animate-in zoom-in-95 duration-200 shadow-[0_4px_16px_0_rgba(31,38,135,0.05)] overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 pointer-events-none" />
                                            {editingGoalId === g.id ? (
                                                <div className="relative flex items-center w-full z-10">
                                                    <input
                                                        type="text"
                                                        value={editingTitle}
                                                        onChange={(e) => setEditingTitle(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                if (editingTitle.trim()) {
                                                                    updateGoal(g.id, { title: editingTitle.trim() });
                                                                }
                                                                setEditingGoalId(null);
                                                            } else if (e.key === 'Escape') {
                                                                setEditingGoalId(null);
                                                            }
                                                        }}
                                                        autoFocus
                                                        className="w-full pl-3 pr-10 py-1.5 bg-white border border-indigo-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 text-sm"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            if (editingTitle.trim()) {
                                                                updateGoal(g.id, { title: editingTitle.trim() });
                                                            }
                                                            setEditingGoalId(null);
                                                        }}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-indigo-500 hover:text-indigo-600 transition"
                                                    >
                                                        <CheckCircle2 size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="font-bold text-slate-700 relative z-10 flex-1">
                                                        <span className="text-indigo-400 mr-2 text-sm">{i + 1}.</span>
                                                        {g.title}
                                                    </span>
                                                    <div className="relative z-10 flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => {
                                                                setEditingGoalId(g.id);
                                                                setEditingTitle(g.title);
                                                            }}
                                                            className="text-slate-400 hover:text-indigo-500 p-2 hover:bg-indigo-50/50 rounded-xl transition"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => removeGoal(g.id)}
                                                            className="text-red-300 hover:text-red-500 p-2 hover:bg-red-50/50 rounded-xl transition"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Loading Overlay */}
                                {isAiLoading && (
                                    <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center">
                                        <Loader2 size={32} className="text-indigo-500 animate-spin mb-4" />
                                        <p className="text-slate-800 font-bold text-lg">AI 智能规划师正在思考...</p>
                                        <p className="text-slate-500 text-sm mt-2 max-w-[80%] text-center">
                                            正在结合您的领域为您量身定制行动步骤，这可能需要约 10-15 秒的时间
                                        </p>
                                    </div>
                                )}

                                {domainGoals.length < 3 && (
                                    <div className="relative flex items-center shadow-sm group">
                                        <input
                                            type="text"
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                            placeholder="输入你自己的模糊愿景..."
                                            className="w-full pl-5 pr-14 py-4 bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white/80 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                                        />
                                        <button
                                            onClick={() => handleAdd()}
                                            disabled={!newTitle.trim() || isAiLoading}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 gradient-primary text-white rounded-xl hover:brightness-110 disabled:opacity-0 disabled:scale-75 transition-all duration-300 flex items-center justify-center shadow-lg shadow-indigo-200"
                                        >
                                            <Sparkles size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Slideable Cards (Carousel) for EXAMPLES */}
                            <div className="mt-4">
                                <button
                                    onClick={() => setShowVisionReference(!showVisionReference)}
                                    className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity w-full text-left"
                                >
                                    <Lightbulb size={20} className="text-amber-500" />
                                    <h4 className="font-bold text-slate-700">没有头绪？点击查看愿景参考</h4>
                                    <div className="ml-auto text-slate-400">
                                        {showVisionReference ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </button>

                                {showVisionReference && (
                                    <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbars -mx-6 px-6 animate-in slide-in-from-top-2 fade-in duration-300">
                                        {EXAMPLES[domain]?.map((ex, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleAdd(ex.vague)}
                                                disabled={domainGoals.length >= 3}
                                                className="relative bg-white/30 backdrop-blur-lg rounded-2xl p-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/50 flex flex-col items-center text-center justify-center group hover:border-white transition-all disabled:opacity-50 text-left active:scale-95 flex-shrink-0 w-[140px] md:w-[160px] snap-align-start overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 pointer-events-none" />
                                                <h5 className="font-bold font-serif text-sm text-slate-800 leading-tight mb-2 relative z-10">{ex.vague}</h5>
                                                <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity relative z-10">点击添加</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!showTutorial && (
                    <div className="px-6 py-4 md:py-6 border-t border-slate-200 bg-white">
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl transition text-lg"
                        >
                            完成 {domain} 设置
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                .hide-scrollbars::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbars {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
