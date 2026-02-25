import { db } from './_firebase-admin';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code, vision, domain } = req.body;

    if (!code) {
        return res.status(400).json({ error: "访问码是必需的" });
    }

    if (!vision || !domain) {
        return res.status(400).json({ error: "愿景和领域是必需的" });
    }

    try {
        // 1. Verify code validity in Firestore (without decrementing)
        const codeRef = db.collection("access_codes").doc(code);
        const codeDoc = await codeRef.get();

        if (!codeDoc.exists) {
            return res.status(403).json({ error: "无效的访问码" });
        }

        const codeData = codeDoc.data();

        if (!codeData || codeData.usagesLeft <= 0) {
            return res.status(403).json({ error: "该访问码生成次数已用完" });
        }

        if (codeData.expiresAt && codeData.expiresAt.toDate() < new Date()) {
            return res.status(403).json({ error: "该访问码已过期" });
        }

        // 2. Call DeepSeek API
        const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
        if (!DEEPSEEK_API_KEY) {
            console.error("Missing DEEPSEEK_API_KEY in Vercel environment variables.");
            return res.status(500).json({ error: "服务器后端未配置 DeepSeek API Key" });
        }

        const prompt = `你是一个目标管理和行动拆解大师。用户的年度愿景是：【${vision}】（属于 ${domain} 领域）。
请按照以下三个步骤进行思考，并最终输出 3-5 个具体、可落地、高回报的今年行动任务。

第一步：定义（Define）
将模糊的感性词汇翻译成清晰、可衡量的定义。

第二步：规划（Plan）
根据定义算出所需的资源，列出几种可能的实现方式。

第三步：目标（Target）
从路径中选择一个可行方向，设定今年内可执行、有截止时间的具体目标。

请直接返回一个纯 JSON 格式的结果，不要包含 Markdown 代码块符号或其他解释文本。
格式要求：["目标1: xxx", "目标2: xxx", "目标3: xxx"]`;

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
                temperature: 0.3
            })
        });

        if (!response.ok) {
            console.error("DeepSeek API Error:", await response.text());
            return res.status(502).json({ error: "请求 AI 服务器失败" });
        }

        const data = await response.json();
        const resultText = data.choices[0].message.content.trim();

        // Try to parse the result as JSON
        let cleanedText = resultText;
        if (cleanedText.startsWith("```json")) {
            cleanedText = cleanedText.replace(/^```json\n/, "").replace(/\n```$/, "");
        } else if (cleanedText.startsWith("```")) {
            cleanedText = cleanedText.replace(/^```\n/, "").replace(/\n```$/, "");
        }

        const tasks = JSON.parse(cleanedText);
        if (!Array.isArray(tasks)) {
            throw new Error("AI did not return an array, returned: " + resultText);
        }

        return res.status(200).json({ data: { tasks } });

    } catch (error: any) {
        console.error("Error in decompose-vision:", error);
        return res.status(500).json({ error: error.message || "拆解愿景时发生错误" });
    }
}
