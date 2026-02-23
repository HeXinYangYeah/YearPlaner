import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyChHcgyCTob6j-5_s8cix6_kQrkl3jcZUY",
    authDomain: "goal-grid-planner.firebaseapp.com",
    projectId: "goal-grid-planner",
    storageBucket: "goal-grid-planner.firebasestorage.app",
    messagingSenderId: "547757757291",
    appId: "1:547757757291:web:5cbad82321a86f42bc322e",
    measurementId: "G-W34SQW0Q4K"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
