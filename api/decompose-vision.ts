import { getDb } from './_firebase-admin.js';


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
        const db = getDb();
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
请按照以下思考步骤，输出恰好 5 个具体、可落地的相关行动目标，供用户选择。

要求：
1. 必须恰好提供 5 个选项。
2. 每个选项的字数严格限制在 12 个字以内。
3. 选项名称必须精简、一目了然（例如：“每周跑步三次”、“考取PMP证书”），绝对不要在选项名称中包含类似“在年底前”、“期限为”等有关截止时间的描述。
4. 请直接返回一个纯 JSON 数组，不要包含 Markdown 代码块符号或其他任何解释文本。

格式要求：["选项1", "选项2", "选项3", "选项4", "选项5"]`;

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
            const errText = await response.text();
            console.error("DeepSeek API Error:", errText);
            let parsedErr;
            try {
                parsedErr = JSON.parse(errText);
            } catch {
                parsedErr = { error: { message: errText } };
            }
            throw new Error(`请求 AI 服务器失败: ${parsedErr?.error?.message || errText}`);
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
