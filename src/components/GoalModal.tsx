import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { Domain } from '../store/useStore';
import { X, Plus, Trash2, ArrowRight, Lightbulb, CheckCircle2 } from 'lucide-react';

interface GoalModalProps {
    domain: Domain;
    isOpen: boolean;
    onClose: () => void;
}

const EXAMPLES: Record<Domain, { vague: string, specific: string[] }[]> = {
    '学习成长': [
        { vague: '能流利地和外国人交流', specific: ['完成一门英语口语课程（如Cambly 50节课)', '每周参加一次英语角', '每天背20个单词，年底词汇量达到8000', '看完5部无字幕英文电影并复述'] },
        { vague: '成为心理学领域的业余专家', specific: ['读完12本心理学经典书籍并写读书笔记', '报名心理咨询师基础培训并考试', '每月在知乎/公众号发布一篇心理学文章'] },
        { vague: '能写一手漂亮的硬笔字', specific: ['每天临摹字帖20分钟', '完成3本名家字帖', '年底能用钢笔写出一封美观的信'] },
        { vague: '能听懂古典音乐', specific: ['每周听一场古典音乐会/线上音乐会', '看完《耶鲁大学公开课：聆听音乐》', '能够分辨并叫出20首经典曲目和作曲家'] },
        { vague: '能用 Python 编写自动化脚本', specific: ['学完 Python 自动化办公教程', '编写3个能实际应用到工作中的脚本（如报表处理、网页抓取）'] }
    ],
    '体验突破': [
        { vague: '在南极看到了极光', specific: ['存下 5 万南极旅行基金', '完成签证和路线规划，预定年底行程'] },
        { vague: '学会冲浪并在海上驰骋', specific: ['去海南参加一个为期7天的冲浪训练营', '能够独立抓浪并站立10秒以上'] },
        { vague: '出了一本书（哪怕自费）', specific: ['确定书的主题和目录', '每周写 5000 字，完成 10 万字初稿', '联系出版机构或自费印刷 100 本'] },
        { vague: '体验了高空跳伞', specific: ['存下 3000 元跳伞基金', '预定并完成一次双人高空跳伞'] },
        { vague: '学会木工并亲手制作家具', specific: ['报名参加周末木工基础班', '亲手制作一把木椅或一个边几'] }
    ],
    '休闲娱乐': [
        { vague: '玩遍全中国的迪士尼/环球影城', specific: ['上半年去上海迪士尼', '下半年去北京环球影城'] },
        { vague: '收集了 100 张黑胶唱片', specific: ['每月购买 8 张黑胶唱片', '购买并布置一个心仪的黑胶唱片机角'] },
        { vague: '成为剧本杀高阶玩家', specific: ['每月玩 2 次高质量剧本杀', '尝试做一次 DM（主持人）'] },
        { vague: '能用钢琴弹奏《致爱丽丝》', specific: ['报名钢琴成人班', '每周练习 3 小时，年底能熟练盲弹'] },
        { vague: '养成每周爬山的习惯', specific: ['加入同城户外徒步群', '完成 20 次周末周边山脉徒步'] }
    ],
    '工作事业': [
        { vague: '成为部门经理', specific: ['主导完成 2 个跨部门S级项目', '带领 2 位新人转正并独立接活', '完成管理能力提升课程'] },
        { vague: '实现从技术到产品的转型', specific: ['考取 PMP / NPDP 证书', '独立输出 3 份完整的 PRD 需求文档并落地'] },
        { vague: '副业收入超过主业', specific: ['副业项目月流水达到 2 万', '每天投入 2 小时到副业建设中'] },
        { vague: '在公司内部创业成功', specific: ['新产品线 Q3 实现盈亏平衡', '年营收突破 1000 万'] },
        { vague: '成为行业里有名的讲师', specific: ['受邀参加 3 次行业大会并做主题演讲', '开设一门线上专栏课程，订阅破千'] }
    ],
    '家庭生活': [
        { vague: '全家人一起去了趟欧洲', specific: ['存下 8 万家庭旅行基金', '做攻略，完成全家申根签证', '国庆节带全家去欧洲旅行 10 天'] },
        { vague: '和伴侣每周都有约会夜', specific: ['每周五晚上不安排工作，雷打不动地约会', '每月打卡 1 家人均300+的黑珍珠餐厅'] },
        { vague: '为孩子建立成长记录册', specific: ['每周为孩子拍一条 1 分钟短视频', '每月整理并打印 30 张精选照片入册'] },
        { vague: '学会做爸妈最爱吃的菜', specific: ['学会做红烧肉和清蒸鱼', '母亲节/父亲节亲自下厨做一桌菜'] },
        { vague: '搬进了理想中的家', specific: ['存够首付/装修款', '完成新房装修并通风半年', '在年底前正式入住'] }
    ],
    '身体健康': [
        { vague: '体脂率降到 15%（练出腹肌）', specific: ['每周去健身房力量训练 4 次', '戒掉所有的含糖饮料和宵夜', '体脂率从目前的 22% 降到 15%'] },
        { vague: '完成了全程马拉松', specific: ['前半年完成 2 次半马', '按照全马训练计划每周跑量达到 30km', '下半年报名并完赛一次全马'] },
        { vague: '学会了游泳', specific: ['报班学会蛙泳和自由泳，能在深水区游 1000 米'] },
        { vague: '每天都能精力充沛', specific: ['坚持晚上 11:30 前睡觉，保证 7.5 小时睡眠', '早起一杯黑咖啡+ 15 分钟冥想'] },
        { vague: '摆脱了颈椎/腰椎问题', specific: ['每周 2 次普拉提或恢复性瑜伽', '工作时设定番茄钟，每 45 分钟起身活动 5 分钟'] }
    ],
    '财务理财': [
        { vague: '实现了“咖啡自由”', specific: ['被动收入（理财/股息）每月超过 1500 元'] },
        { vague: '存够了买房首付', specific: ['年终存款余额增加 30 万', '每月工资到手先雷打不动定存 15000 元'] },
        { vague: '建立了家庭应急基金', specific: ['在活期/货币基金里存入能覆盖家庭 6 个月支出的钱（约 10 万）'] },
        { vague: '学会了基金投资', specific: ['读完 5 本经典理财书籍（如《穷爸爸富爸爸》、《小狗钱钱》等）', '拿 1 万块钱进行实盘定投，年化收益率跑赢沪深 300'] },
        { vague: '拥有了一个“钱生钱”系统', specific: ['建立个人的资产负债表，每月复盘', '配置并持有高分红蓝筹股或指数基金，吃分红'] }
    ],
    '人际社群': [
        { vague: '拥有一个高质量的智囊团', specific: ['结识 3 位比自己高两个 level 的前辈', '每月请一位行业牛人喝咖啡/吃饭'] },
        { vague: '每年能和大学室友聚一次', specific: ['定在 5 月份去室友的城市找TA玩一整天', '报销TA来的机酒费用'] },
        { vague: '加入公益组织并成为核心成员', specific: ['加入一个环保/支教公益组织', '全年参与 10 次线下志愿活动'] },
        { vague: '帮助 10 个人实现小目标', specific: ['在社群或朋友圈进行分享打卡', '一对一担任 10 个人的监督者或导师'] },
        { vague: '成为某个兴趣社群的群主', specific: ['建立一个 200 人活跃的阅读/运动群', '每周组织 1 次线上/线下共读或打卡活动'] }
    ]
};

export default function GoalModal({ domain, isOpen, onClose }: GoalModalProps) {
    const { goals, addGoal, removeGoal, setActiveModal } = useStore();
    const [newTitle, setNewTitle] = useState('');

    // Tutorial state - show if no goals in this domain yet
    const domainGoals = goals.filter(g => g.domain === domain);
    const [showTutorial, setShowTutorial] = useState(domainGoals.length === 0);

    // Sync with global modal state and lock body scroll
    useEffect(() => {
        if (isOpen) {
            setActiveModal(`goal-${domain}`);

            // "Nuclear" scroll lock for mobile to prevent all wobble
            const scrollY = window.scrollY;
            const originalStyle = document.body.style.overflow;
            const originalPosition = document.body.style.position;
            const originalTop = document.body.style.top;
            const originalWidth = document.body.style.width;

            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
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

    const handleAdd = (customTitle?: string) => {
        const titleToAdd = customTitle || newTitle.trim();
        if (!titleToAdd) return;
        if (domainGoals.length >= 3) return;
        addGoal({ domain, title: titleToAdd });
        setNewTitle('');
    };

    return (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end md:items-center md:justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-md transition-all overflow-x-hidden">
            <div className="bg-[#f8f9fa] rounded-t-3xl md:rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh] animate-in slide-in-from-bottom-5 md:zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-white">
                    <h2 className="text-xl md:text-2xl font-bold font-serif text-slate-800">{domain} 目标设置</h2>
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
                                    <div className="flex-1 text-center md:text-right">
                                        <div className="inline-block px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold mb-3">模糊愿景</div>
                                        <h4 className="text-2xl font-serif font-bold text-slate-800">"财务自由"</h4>
                                    </div>
                                    <div className="text-indigo-300 hidden md:block">
                                        <ArrowRight size={32} />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="inline-block px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-sm font-bold">孵化的年度目标</div>
                                        <ul className="text-sm text-slate-600 space-y-2">
                                            <li className="flex gap-2 items-start"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" /> 3月份把房子租出去（租金收入）</li>
                                            <li className="flex gap-2 items-start"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" /> 11月前完成一本时间管理的书</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="sticky bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#f8f9fa] via-[#f8f9fa] to-transparent pt-10">
                                <button
                                    onClick={() => setShowTutorial(false)}
                                    className="w-full py-4 gradient-primary text-white rounded-2xl font-bold text-lg shadow-soft-hover hover:scale-[1.02] transition-transform"
                                >
                                    我懂了，开始设置 {domain} 目标
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 md:p-8 bg-[#f8f9fa]">
                            {/* Slideable Cards (Carousel) for EXAMPLES */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <Lightbulb size={20} className="text-amber-500" />
                                    <h4 className="font-bold text-slate-700">愿景参考：点击直接添加</h4>
                                </div>
                                <div className="flex gap-3 mb-6 overflow-x-auto pb-4 snap-x hide-scrollbars -mx-6 px-6">
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
                            </div>

                            <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100">
                                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    我的 {domain} 愿景
                                    <span className="text-xs font-normal text-slate-400">已设置 ({domainGoals.length}/3)</span>
                                </h4>

                                <div className="space-y-3 mb-6">
                                    {domainGoals.map((g, i) => (
                                        <div key={g.id} className="relative flex items-center justify-between p-4 bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl group animate-in zoom-in-95 duration-200 shadow-[0_4px_16px_0_rgba(31,38,135,0.05)] overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 pointer-events-none" />
                                            <span className="font-bold text-slate-700 relative z-10">
                                                <span className="text-indigo-400 mr-2 text-sm">{i + 1}.</span>
                                                {g.title}
                                            </span>
                                            <button
                                                onClick={() => removeGoal(g.id)}
                                                className="relative z-10 text-red-300 hover:text-red-500 p-2 hover:bg-red-50/50 rounded-xl transition opacity-100 md:opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

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
                                            disabled={!newTitle.trim()}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 gradient-primary text-white rounded-xl hover:brightness-110 disabled:opacity-0 disabled:scale-75 transition-all duration-300 flex items-center justify-center shadow-lg shadow-indigo-200"
                                        >
                                            <Plus size={20} />
                                        </button>
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
