/**
 * SysGesco - ERP de Gestion Scolaire Offline-First Multi-Établissements
 * Scolarité • Caisse FCFA • Notes & Bulletins • Emplois du Temps • Assiduité
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { Toast } from './components/common/Toast';

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8ff] flex flex-col items-center justify-center p-4 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#00236f] text-white flex items-center justify-center animate-pulse shadow-md">
          <span className="font-extrabold text-sm tracking-wider">SG</span>
        </div>
        <p className="text-xs font-semibold text-slate-600">Chargement de la base locale SysGesco...</p>
      </div>
    );
  }

  // Not authenticated -> show entry screen (Section 7-12)
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
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex flex-col font-sans selection:bg-[#00236f] selection:text-white pb-20 md:pb-6">
      <Header />
      <Navigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
        {renderView()}
      </main>

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
