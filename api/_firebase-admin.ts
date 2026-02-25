import admin from 'firebase-admin';

let db: ReturnType<typeof admin.firestore>;

export const getDb = () => {
    if (!admin.apps.length) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        // Normalize private key: handle both \n literal strings AND missing newlines
        // Vercel may store with actual newlines OR with \n escape sequences
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        if (privateKey) {
            // Replace literal \n sequences with actual newlines (if stored that way)
            privateKey = privateKey.replace(/\\n/g, '\n');
            // Trim any surrounding whitespace
            privateKey = privateKey.trim();
        }

        if (!projectId || !clientEmail || !privateKey) {
            const missing = [
                !projectId && 'FIREBASE_PROJECT_ID',
                !clientEmail && 'FIREBASE_CLIENT_EMAIL',
                !privateKey && 'FIREBASE_PRIVATE_KEY',
            ].filter(Boolean).join(', ');
            throw new Error(`缺少 Vercel 环境变量: ${missing}`);
        }

        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
        } catch (error: any) {
            console.error('Firebase admin initialization error', error);
            // Expose the real error message for debugging
            throw new Error(`Firebase 初始化失败: ${error.message}`);
        }
    }
    if (!db) {
        db = admin.firestore();
    }
    return db;
};
