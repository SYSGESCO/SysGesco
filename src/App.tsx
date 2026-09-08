/**
 * SysGesco - ERP de Gestion Scolaire Offline-First Multi-Établissements
 * Interface inspirée de SysGesco AppMedo : Sidebar sombre, barre d'en-tête épurée, recherche globale
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Toast } from './components/common/Toast';
import { SysGescoLogo } from './components/common/SysGescoLogo';
import { X } from 'lucide-react';

import { DashboardView } from './components/dashboard/DashboardView';
import { StudentsView } from './components/students/StudentsView';
import { ClassesView } from './components/classes/ClassesView';
import { TeachersView } from './components/teachers/TeachersView';
import { CashierView } from './components/cashier/CashierView';
import { GradesView } from './components/grades/GradesView';
import { BulletinsView } from './components/bulletins/BulletinsView';
import { TimetableView } from './components/timetable/TimetableView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { HomeworkView } from './components/homework/HomeworkView';
import { StatsView } from './components/stats/StatsView';
import { SettingsView } from './components/settings/SettingsView';
import { SuperAdminView } from './components/superadmin/SuperAdminView';

const MainLayout: React.FC = () => {
  const { currentUser, activeInstitution, currentView, isLoading } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex flex-col items-center justify-center p-4 space-y-4">
        <div className="animate-pulse">
          <SysGescoLogo size="xl" />
        </div>
        <div className="flex flex-col items-center">
          <p className="text-base font-bold text-slate-800">
            Sys<span className="text-[#f97316]">Gesco</span>
          </p>
          <p className="text-xs text-slate-500">Chargement de votre espace de travail...</p>
        </div>
      </div>
    );
  }

  // Not authenticated -> show entry screen
  if (!currentUser || !activeInstitution) {
    return <AuthScreen />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'students':
        return <StudentsView />;
      case 'classes':
        return <ClassesView />;
      case 'teachers':
        return <TeachersView />;
      case 'cashier':
        return <CashierView />;
      case 'grades':
        return <GradesView />;
      case 'bulletins':
        return <BulletinsView />;
      case 'timetable':
        return <TimetableView />;
      case 'attendance':
        return <AttendanceView />;
      case 'homework':
        return <HomeworkView />;
      case 'stats':
        return <StatsView />;
      case 'settings':
        return <SettingsView />;
      case 'superadmin':
        return <SuperAdminView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f5f7fa] text-[#0f1d30] overflow-hidden antialiased">
      {/* 1. Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-full">
        <Sidebar />
      </aside>

      {/* 2. Mobile Slide-out Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#192333] shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="absolute top-3 right-3 z-20">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center h-8 w-8 rounded-full bg-[#243248] text-white hover:bg-slate-700 transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Sidebar onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* 3. Main Column (Header + Content) */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        {/* Sticky Top Header */}
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Scrollable Main Application Content */}
        <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto p-3 sm:p-5 lg:p-6 bg-[#f5f7fa]">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            {renderView()}
          </div>
        </main>
      </div>

      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
