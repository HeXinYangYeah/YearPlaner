import { db } from './_firebase-admin';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: "访问码是必需的" });
    }

    const codeRef = db.collection("access_codes").doc(code);

    try {
        await db.runTransaction(async (t) => {
            const doc = await t.get(codeRef);
            if (!doc.exists) {
                throw new Error("无效的访问码");
            }

            const data = doc.data();
            if (!data || data.usagesLeft <= 0) {
                throw new Error("该访问码生成次数已用完");
            }

            if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
                throw new Error("该访问码已过期");
            }

            t.update(codeRef, { usagesLeft: data.usagesLeft - 1 });
        });

        return res.status(200).json({ data: { success: true } });

    } catch (e: any) {
        console.error("Error consuming usage:", e);
        return res.status(500).json({ error: e.message || "扣除使用次数失败" });
    }
}
