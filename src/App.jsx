import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import BloodPressure from './pages/BloodPressure';
import BloodTests from './pages/BloodTests';
import BodyMetrics from './pages/BodyMetrics';
import Medications from './pages/Medications';
import Symptoms from './pages/Symptoms';
import Profile from './pages/Profile';

const AppRoutes = () => {
  const { isLoading, isLoggedIn } = useAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/blood-pressure" element={<BloodPressure />} />
        <Route path="/blood-tests" element={<BloodTests />} />
        <Route path="/body-metrics" element={<BodyMetrics />} />
        <Route path="/medications" element={<Medications />} />
        <Route path="/symptoms" element={<Symptoms />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AppRoutes />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
