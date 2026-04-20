import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCT82KbWMApIwMLU0Ugnx_yg_YgN0eRILc",
  authDomain: "vital-pulse-58be6.firebaseapp.com",
  projectId: "vital-pulse-58be6",
  storageBucket: "vital-pulse-58be6.firebasestorage.app",
  messagingSenderId: "472853865575",
  appId: "1:472853865575:web:40e2ef3ad3f1014fe420c2",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
