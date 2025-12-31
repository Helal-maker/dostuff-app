
import React, { useState, useContext } from 'react';
// Use namespace import for react-router-dom to resolve "no exported member" issues in some environments
import * as Router from 'react-router-dom';
import { User, AuthContext } from './types';
import Login from './views/Login';
import VerifyEmail from './views/VerifyEmail';
import ProfileSetup from './views/ProfileSetup';
import Dashboard from './views/Dashboard';
import CreateExam from './views/CreateExam';
import Results from './views/Results';
import HowItWorks from './views/HowItWorks';
import ExamsList from './views/ExamsList';
import Settings from './views/Settings';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';

const { HashRouter, Routes, Route, Navigate, useLocation } = Router;

const AppContent: React.FC = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  
  const isAuthPage = ['/login', '/verify-email', '/profile-setup'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      {!isAuthPage && <Sidebar />}

      <main className={`flex-1 flex flex-col min-h-screen ${!isAuthPage ? 'md:pl-0' : ''}`}>
        <div className={`flex-1 w-full mx-auto ${!isAuthPage && location.pathname !== '/results' && location.pathname !== '/create-exam' ? 'max-w-7xl px-4 py-6 md:px-8' : ''}`}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-exam" element={user?.role === 'teacher' ? <CreateExam /> : <Navigate to="/dashboard" />} />
            <Route path="/results" element={<Results />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/exams" element={<ExamsList />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
        
        {/* Bottom Nav for Mobile */}
        {!isAuthPage && <BottomNav />}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AuthContext.Provider>
  );
};

export default App;
