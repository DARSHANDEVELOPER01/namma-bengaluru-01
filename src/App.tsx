/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { WelcomeLoginModal } from './components/WelcomeLoginModal';
import { Navbar } from './components/Navbar';
import { CitizenDashboard } from './components/citizen/CitizenDashboard';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ThreeBackground } from './components/ThreeBackground';
import { AboutContactModal } from './components/AboutContactModal';
import { Sparkles, RefreshCw } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-red-600 to-amber-600 p-0.5 flex items-center justify-center mb-4 animate-pulse">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-amber-400 text-xl">
            ಬೆಂ
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>NAMMA BENGALURU</span>
        </div>
        <p className="text-xs text-slate-400">Loading Smart City Secure Gateway...</p>
      </div>
    );
  }

  // CRITICAL REQUIREMENT:
  // When someone opens the website, ONLY the main login/welcome page must appear.
  // No dashboard, home page, reports, admin info or citizen info is accessible before authentication.
  if (!user) {
    return (
      <div className="relative min-h-screen bg-slate-950 text-slate-100">
        <ThreeBackground intensity={1.2} />
        <WelcomeLoginModal />
      </div>
    );
  }

  // AUTHENTICATED USER: Role-Guarded Dashboards
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* 3D Background Particles */}
      <ThreeBackground intensity={0.6} />

      {/* Top Navigation */}
      <Navbar onOpenAboutModal={() => setIsAboutModalOpen(true)} />

      {/* Role-Specific Private Dashboard */}
      <main className="flex-1 relative z-10">
        {user.role === 'admin' && <AdminDashboard />}
        {user.role === 'citizen' && <CitizenDashboard />}
        {user.role === 'staff' && <StaffDashboard />}
      </main>

      {/* About & VS Code Setup Modal */}
      <AboutContactModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
