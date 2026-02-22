const fs = require('fs');
const p = 'src/store/useStore.ts';
let content = fs.readFileSync(p, 'utf8');
content = content.replace(/'职业发展' \| '财务' \| '健康' \| '家庭'/, "'学习成长' | '体验突破' | '休闲娱乐' | '工作事业'");
content = content.replace(/'社交' \| '学习' \| '休闲' \| '个人成长'/, "'家庭生活' | '身体健康' | '财务理财' | '人际社群'");
fs.writeFileSync(p, content);
console.log("Replaced domains in useStore.ts");
