import React from 'react';
import { useApp, ActiveView } from '../../context/AppContext';
import {
  LayoutDashboard,
  School,
  Wallet,
  BookOpen,
  Settings,
  Users,
  Calendar,
  ClipboardList,
  GraduationCap,
  FileSpreadsheet,
  BarChart3,
  Shield,
  BookMarked,
} from 'lucide-react';

interface NavItem {
  id: ActiveView;
  label: string;
  icon: React.ReactNode;
  allowedRoles: string[];
}

export const Navigation: React.FC = () => {
  const { currentView, setCurrentView, currentRole } = useApp();

  const allItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Tableau',
      icon: <LayoutDashboard className="w-5 h-5" />,
      allowedRoles: ['direction', 'cashier', 'teacher', 'student', 'parent', 'superadmin'],
    },
    {
      id: 'students',
      label: 'Élèves',
      icon: <Users className="w-5 h-5" />,
      allowedRoles: ['direction', 'teacher', 'cashier'],
    },
    {
      id: 'classes',
      label: 'Classes',
      icon: <School className="w-5 h-5" />,
      allowedRoles: ['direction', 'teacher', 'student', 'parent'],
    },
    {
      id: 'teachers',
      label: 'Professeurs',
      icon: <GraduationCap className="w-5 h-5" />,
      allowedRoles: ['direction', 'superadmin'],
    },
    {
      id: 'cashier',
      label: 'Caisse',
      icon: <Wallet className="w-5 h-5" />,
      allowedRoles: ['direction', 'cashier', 'parent', 'student'],
    },
    {
      id: 'grades',
      label: 'Notes',
      icon: <BookOpen className="w-5 h-5" />,
      allowedRoles: ['direction', 'teacher', 'student', 'parent'],
    },
    {
      id: 'bulletins',
      label: 'Bulletins',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      allowedRoles: ['direction', 'teacher', 'student', 'parent'],
    },
    {
      id: 'timetable',
      label: 'Planning',
      icon: <Calendar className="w-5 h-5" />,
      allowedRoles: ['direction', 'teacher', 'student', 'parent'],
    },
    {
      id: 'attendance',
      label: 'Appel',
      icon: <ClipboardList className="w-5 h-5" />,
      allowedRoles: ['direction', 'teacher', 'parent', 'student'],
    },
    {
      id: 'homework',
      label: 'Devoirs',
      icon: <BookMarked className="w-5 h-5" />,
      allowedRoles: ['direction', 'teacher', 'student', 'parent'],
    },
    {
      id: 'stats',
      label: 'Statistiques',
      icon: <BarChart3 className="w-5 h-5" />,
      allowedRoles: ['direction', 'superadmin', 'teacher', 'cashier'],
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: <Settings className="w-5 h-5" />,
      allowedRoles: ['direction', 'superadmin'],
    },
    {
      id: 'superadmin',
      label: 'Super Admin',
      icon: <Shield className="w-5 h-5" />,
      allowedRoles: ['superadmin'],
    },
  ];

  // Filter items visible to the current role
  const visibleItems = allItems.filter((item) =>
    item.allowedRoles.includes(currentRole)
  );

  return (
    <>
      {/* Desktop & Tablet Top Secondary Navigation Bar */}
      <nav aria-label="Navigation desktop" className="hidden md:block bg-white border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto py-1.5 no-scrollbar">
          {visibleItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#00236f] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#00236f] hover:bg-slate-100/70'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Fixed Bottom Navigation Bar (as demonstrated in HTML prototypes) */}
      <nav aria-label="Navigation mobile" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 pb-safe shadow-lg no-print">
        <div className="flex items-center justify-around h-16 px-1">
          {visibleItems.slice(0, 5).map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors ${
                  isActive ? 'text-[#00236f] font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {item.icon}
                <span className="text-[11px] tracking-tight mt-1 font-medium">{item.label}</span>
              </button>
            );
          })}

          {/* If there are more than 5 items, provide a quick dropdown / more button */}
          {visibleItems.length > 5 && (
            <button
              onClick={() => {
                if (currentView === 'settings' || currentView === 'stats') {
                  setCurrentView('dashboard');
                } else {
                  setCurrentView('settings');
                }
              }}
              className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors ${
                currentView === 'settings' || currentView === 'stats'
                  ? 'text-[#00236f] font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-[11px] tracking-tight mt-1 font-medium">Plus</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
};
