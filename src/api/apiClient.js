// Firestore-backed client — same interface as the previous localStorage version
import {
  collection, doc,
  getDocs, addDoc, updateDoc, deleteDoc, getDoc, setDoc,
  query, orderBy, limit as limitQuery, where,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

function stripUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

function getUid() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('User not authenticated');
  return uid;
}

function createEntity(entityName) {
  return {
    list: async (sortField = '-created_date', limitN = 100) => {
      const uid = getUid();
      const desc = sortField.startsWith('-');
      const field = desc ? sortField.slice(1) : sortField;
      const direction = desc ? 'desc' : 'asc';

      const q = query(
        collection(db, 'users', uid, entityName),
        orderBy(field, direction),
        limitQuery(limitN),
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    create: async (data) => {
      const uid = getUid();
      const newData = stripUndefined({ ...data, created_date: new Date().toISOString() });
      const docRef = await addDoc(collection(db, 'users', uid, entityName), newData);
      return { id: docRef.id, ...newData };
    },

    update: async (id, data) => {
      const uid = getUid();
      const clean = stripUndefined(data);
      const docRef = doc(db, 'users', uid, entityName, id);
      await updateDoc(docRef, clean);
      return { id, ...clean };
    },

    delete: async (id) => {
      const uid = getUid();
      await deleteDoc(doc(db, 'users', uid, entityName, id));
    },

    filter: async (queryObj) => {
      const uid = getUid();
      const constraints = Object.entries(queryObj).map(([k, v]) => where(k, '==', v));
      const q = query(collection(db, 'users', uid, entityName), ...constraints);
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
  };
}

const authApi = {
  me: async () => {
    if (!auth.currentUser) return null;
    const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
    return snap.exists() ? { id: auth.currentUser.uid, ...snap.data() } : null;
  },
  updateMe: async (data) => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    const docRef = doc(db, 'users', auth.currentUser.uid);
    await setDoc(docRef, data, { merge: true });
    return { id: auth.currentUser.uid, ...data };
  },
  logout: () => auth.signOut(),
  redirectToLogin: () => {},
};

const integrations = {
  Core: {
    UploadFile: async ({ file }) => ({ file_url: URL.createObjectURL(file) }),
    ExtractDataFromUploadedFile: async () => ({ status: 'error', output: null }),
  },
};

export const base44 = {
  entities: {
    BloodPressure: createEntity('BloodPressure'),
    BloodTest:     createEntity('BloodTest'),
    BodyMetric:    createEntity('BodyMetric'),
    Medication:    createEntity('Medication'),
    SymptomLog:    createEntity('SymptomLog'),
  },
  auth: authApi,
  integrations,
};
