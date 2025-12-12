import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TabBar } from './components/TabBar';
import { ToastProvider } from './components/Toast';
import { CaptureScreen } from './routes/CaptureScreen';
import { TaskListScreen } from './routes/TaskListScreen';
import { CalendarScreen } from './routes/CalendarScreen';
import { SettingsScreen } from './routes/SettingsScreen';
import { LoginScreen } from './routes/LoginScreen';
import { SignupScreen } from './routes/SignupScreen';
import { EditProfileScreen } from './routes/EditProfileScreen';
import { LandingScreen } from './routes/LandingScreen';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useSync } from './hooks/useSync';
import './styles/globals.css';

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <>
      {children}
      <TabBar />
    </>
  );
};

const PublicRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/capture" replace />;
  return children;
};

function App() {
  useSync();

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <ToastProvider>
        <Router>
          <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-[60px] transition-colors duration-300">
            <Routes>
              <Route path="/login" element={<PublicRoute><LoginScreen /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><SignupScreen /></PublicRoute>} />

              <Route path="/" element={<PublicRoute><LandingScreen /></PublicRoute>} />

              <Route path="/capture" element={<ProtectedRoute><CaptureScreen /></ProtectedRoute>} />
              <Route path="/tasks" element={<ProtectedRoute><TaskListScreen /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><CalendarScreen /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />
              <Route path="/settings/profile" element={<ProtectedRoute><EditProfileScreen /></ProtectedRoute>} />
            </Routes>
          </div>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
