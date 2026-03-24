import React, { createContext, useState, useContext, useEffect } from 'react';

const USER_KEY = 'vitalpulse_user';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch { /* ignore */ }
    setIsLoading(false);
  }, []);

  const login = ({ full_name, email }) => {
    const newUser = {
      id: crypto.randomUUID(),
      full_name: full_name.trim(),
      email: email?.trim() || '',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    setUser(updated);
  };

  const logout = () => {
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isLoading,
      login,
      updateUser,
      logout,
      // Legacy props used by App.jsx
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
