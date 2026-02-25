// Script to create access codes in Firestore
// Run: node create-access-codes.cjs
// Requires: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY env vars
// Or place your serviceAccountKey.json in the same directory

const admin = require('firebase-admin');
const path = require('path');

// Try to load from serviceAccountKey.json first, then fall back to env vars
let credential;
try {
    const serviceAccount = require('./serviceAccountKey.json');
    credential = admin.credential.cert(serviceAccount);
    console.log('Using serviceAccountKey.json');
} catch {
    console.log('No serviceAccountKey.json found, using env vars...');
    if (!process.env.FIREBASE_PROJECT_ID) {
        console.error('Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY env vars');
        console.error('Or place serviceAccountKey.json in this directory.');
        process.exit(1);
    }
    credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    });
}

admin.initializeApp({ credential });
const db = admin.firestore();

// Define access codes to create
const ACCESS_CODES = [
    { code: 'OWNER2026', usagesLeft: 999, label: 'Owner unlimited' },
    { code: 'DEMO2026', usagesLeft: 5, label: 'Demo code' },
];

async function createAccessCodes() {
    const expiresAt = new Date('2027-01-01T00:00:00Z');

    for (const { code, usagesLeft, label } of ACCESS_CODES) {
        await db.collection('access_codes').doc(code).set({
            usagesLeft,
            label,
            expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`✅ Created code: ${code} (${usagesLeft} uses, expires ${expiresAt.toDateString()})`);
    }

    console.log('\n🎉 Done! Access codes created in Firestore.');
    console.log('Your app URL should be: https://year-planer.vercel.app?code=OWNER2026');
    process.exit(0);
}

createAccessCodes().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
