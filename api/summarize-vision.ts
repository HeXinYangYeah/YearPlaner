import { getDb } from './_firebase-admin.js';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code, vision, domain } = req.body;

    if (!vision) {
        return res.status(400).json({ error: "愿景是必需的" });
    }

    try {
        if (code) {
            const db = getDb();
            const codeRef = db.collection("access_codes").doc(code);
            const codeDoc = await codeRef.get();

            if (codeDoc.exists) {
                const codeData = codeDoc.data();
                if (!codeData || codeData.usagesLeft <= 0) {
                    return res.status(403).json({ error: "该访问码生成次数已用完" });
                }
                if (codeData.expiresAt && codeData.expiresAt.toDate() < new Date()) {
                    return res.status(403).json({ error: "该访问码已过期" });
                }
            }
        }

        const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
        if (!DEEPSEEK_API_KEY) {
            console.error("Missing DEEPSEEK_API_KEY in Vercel environment variables.");
            return res.status(500).json({ error: "服务器后端未配置 DeepSeek API Key" });
        }

        const prompt = `你是一个总结助手。用户的原始年度愿景（属于 ${domain || '未知'} 领域）长文本是：【${vision}】
请将其总结为一个“2 到 4 个汉字”的极其精简的关键词，以便能够在空间极小的九宫格中展示。
要求：
1. 提取最核心的动词+名词，或者标志性缩写。
2. 绝对不能超过4个字。如果2个字能表达清楚就用2个字。
3. 直接返回包含该词语的纯文本，不要任何标点符号、解释或Markdown格式（如 \`\`\` 等）。例如：健身、考PMP、学英语。`;

        const response = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "user", content: prompt }
                ],
                temperature: 0.1
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("DeepSeek API Error:", errText);
            throw new Error(`请求 AI 服务器失败`);
        }

        const data = await response.json();
        const resultText = data.choices[0].message.content.trim();

        // Ensure stripping of quotes or markdown that might accidently be there
        let cleanedText = resultText.replace(/['"「」【】`]/g, '').trim();

        return res.status(200).json({ data: { shortTitle: cleanedText } });

    } catch (error: any) {
        console.error("Error in summarize-vision:", error);
        return res.status(500).json({ error: error.message || "总结愿景时发生错误" });
    }
}
