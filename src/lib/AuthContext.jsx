import { createContext, useState, useContext, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const docRef = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(docRef);

        if (!snap.exists()) {
          // First login: populate from Google account
          const profileData = {
            full_name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            photo_url: firebaseUser.photoURL || '',
            created_at: new Date().toISOString(),
          };
          await setDoc(docRef, profileData);
          setUser({ id: firebaseUser.uid, ...profileData });
        } else {
          setUser({ id: firebaseUser.uid, ...snap.data() });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const updateUser = async (data) => {
    if (!auth.currentUser) return;
    // Firestore rejects undefined values — strip them out
    const clean = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    );
    const docRef = doc(db, 'users', auth.currentUser.uid);
    await setDoc(docRef, clean, { merge: true });
    setUser(prev => ({ ...prev, ...clean }));
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isLoading,
      loginWithGoogle,
      updateUser,
      logout,
      isAuthenticated: !!user,
      isLoadingAuth: isLoading,
      isLoadingPublicSettings: false,
      authError: null,
      appPublicSettings: null,
      navigateToLogin: () => {},
      checkAppState: () => {},
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
