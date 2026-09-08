import React from 'react';
import { useApp, ActiveView } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  School,
  GraduationCap,
  HeartHandshake,
  CreditCard,
  Wallet,
  BookOpen,
  FileSpreadsheet,
  BookMarked,
  Calendar,
  ClipboardList,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Building2,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

interface NavMenuItem {
  id: ActiveView;
  label: string;
  icon: React.ReactNode;
  allowedRoles: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const {
    currentView,
    setCurrentView,
    currentUser,
    currentRole,
    activeInstitution,
    institutionsList,
    switchInstitution,
    logout,
    isOnline,
  } = useApp();

  const menuItems: NavMenuItem[] = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      allowedRoles: ['direction', 'cashier', 'teacher', 'student', 'parent', 'superadmin'],
    },
    {
      id: 'students',
      label: 'Élèves',
      icon: <Users className="w-4 h-4 shrink-0" />,
      allowedRoles: ['direction', 'teacher', 'cashier', 'superadmin'],
    },
    {
      id: 'classes',
      label: 'Classes',
      icon: <School className="w-4 h-4 shrink-0" />,
      allowedRoles: ['direction', 'teacher', 'student', 'parent', 'superadmin'],
    },
    {
      id: 'teachers',
      label: 'Professeurs',
      icon: <GraduationCap className="w-4 h-4 shrink-0" />,
      allowedRoles: ['direction', 'superadmin'],
    },
    {
      id: 'cashier',
      label: 'Paiements & Caisse',
      icon: <CreditCard className="w-4 h-4 shrink-0" />,
      allowedRoles: ['direction', 'cashier', 'superadmin', 'parent'],
    },
    {
      id: 'grades',
      label: 'Notes',
      icon: <BookOpen className="w-4 h-4 shrink-0" />,
      allowedRoles: ['direction', 'teacher', 'student', 'parent', 'superadmin'],
    },
    {
      id: 'bulletins',
      label: 'Bulletins',
      icon: <FileSpreadsheet className="w-4 h-4 shrink-0" />,
      allowedRoles: ['direction', 'teacher', 'student', 'parent', 'superadmin'],
    },
    {
      id: 'homework',
      label: 'Devoirs',
      icon: <BookMarked className="w-4 h-4 shrink-0" />,
      allowedRoles: ['direction', 'teacher', 'student', 'parent', 'superadmin'],
    },
    {
      id: 'timetable',
      label: 'Emploi du temps',
      icon: <Calendar className="w-4 h-4 shrink-0" />,
      allowedRoles: ['direction', 'teacher', 'student', 'parent', 'superadmin'],
    },
    {
      id: 'attendance',
      label: 'Assiduité',
      icon: <ClipboardList className="w-4 h-4 shrink-0" />,
      allowedRoles: ['direction', 'teacher', 'parent', 'student', 'superadmin'],
    },
    {
      id: 'stats',
      label: 'Statistiques',
      icon: <BarChart3 className="w-4 h-4 shrink-0" />,
      allowedRoles: ['direction', 'superadmin', 'cashier', 'teacher'],
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: <Settings className="w-4 h-4 shrink-0" />,
      allowedRoles: ['direction', 'superadmin'],
    },
    {
      id: 'superadmin',
      label: 'Administration',
      icon: <ShieldCheck className="w-4 h-4 shrink-0" />,
      allowedRoles: ['superadmin'],
    },
  ];

  const visibleMenuItems = menuItems.filter((item) =>
    item.allowedRoles.includes(currentRole)
  );

  const roleLabels: Record<string, string> = {
    direction: 'Direction',
    cashier: 'Caissière',
    teacher: 'Professeur',
    student: 'Élève',
    parent: 'Parent d’élève',
    superadmin: 'Super Admin',
  };

  const handleNavClick = (viewId: ActiveView) => {
    setCurrentView(viewId);
    if (onClose) onClose();
  };

  const userDisplayName = currentUser
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username
    : 'Utilisateur';

  const userInitial = userDisplayName ? userDisplayName.charAt(0).toUpperCase() : 'U';

  return (
    <div className="flex h-full w-64 flex-col bg-[#192333] text-[#c9d5e4] border-r border-[#222f42] select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[#222f42]">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d97706] text-white font-bold text-sm shrink-0 shadow-xs">
          SG
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-white text-base leading-tight">SysGesco</p>
          <p className="text-xs text-[#94a3b8] truncate">
            {activeInstitution?.academicYear || '2026-2027'} • {activeInstitution?.name || 'Établissement'}
          </p>
        </div>
      </div>

      {/* User Session Mini Profile */}
      <div className="px-4 py-3 border-b border-[#222f42] bg-[#16202e]/60">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-[#243248] text-white flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-white/10">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">
              {userDisplayName}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-[#94a3b8]">
              <span className="truncate">{roleLabels[currentRole] || currentRole}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {isOnline ? (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                ) : (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                )}
                {isOnline ? 'En ligne' : 'Hors-ligne'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-2.5 px-2 space-y-0.5">
        {visibleMenuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs sm:text-sm font-medium transition-colors text-left ${
                isActive
                  ? 'bg-[#f97316] text-white shadow-xs'
                  : 'text-[#c9d5e4] hover:bg-[#243248] hover:text-white'
              }`}
            >
              {item.icon}
              <span className="flex-1 truncate">{item.label}</span>
              {isActive && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-70" />}
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-2 border-t border-[#222f42] space-y-1 bg-[#16202e]/80">
        {/* Quick Institution Switcher */}
        {institutionsList && institutionsList.length > 1 && (
          <div className="px-2 py-1">
            <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
              Établissement
            </label>
            <select
              value={activeInstitution?.id || ''}
              onChange={(e) => switchInstitution(e.target.value)}
              className="w-full bg-[#1e2c3f] border border-[#2d3f57] rounded text-xs text-slate-200 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {institutionsList.map((inst) => (
                <option key={inst.id} value={inst.id} className="bg-[#192333] text-white">
                  {inst.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Déconnexion */}
        <button
          onClick={() => {
            logout();
            if (onClose) onClose();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-[#94a3b8] hover:bg-[#243248] hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};
