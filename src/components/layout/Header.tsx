import React, { useState, useEffect, useRef } from 'react';
import { useApp, ActiveView } from '../../context/AppContext';
import {
  Menu,
  Search,
  X,
  Bell,
  Building2,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Wifi,
  WifiOff,
  Sparkles,
  Download,
  CreditCard,
  GraduationCap,
  Users,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { SyncIndicator } from '../common/SyncIndicator';
import { DataExportModal } from '../common/DataExportModal';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const {
    activeInstitution,
    currentUser,
    currentRole,
    isDemoMode,
    isOnline,
    institutionsList,
    switchInstitution,
    switchRole,
    logout,
    students,
    payments,
    setCurrentView,
  } = useApp();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Dropdown states
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showInstitutionMenu, setShowInstitutionMenu] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered students & payments for quick search
  const filteredStudents = searchQuery.trim().length >= 2
    ? students
        .filter((s) => {
          const q = searchQuery.toLowerCase();
          return (
            s.firstName?.toLowerCase().includes(q) ||
            s.lastName?.toLowerCase().includes(q) ||
            s.matricule?.toLowerCase().includes(q)
          );
        })
        .slice(0, 5)
    : [];

  const filteredPayments = searchQuery.trim().length >= 2
    ? payments
        .filter((p) => {
          const q = searchQuery.toLowerCase();
          return (
            p.receiptNumber?.toLowerCase().includes(q) ||
            p.studentName?.toLowerCase().includes(q) ||
            p.id?.toLowerCase().includes(q)
          );
        })
        .slice(0, 4)
    : [];

  const roleLabels: Record<string, { label: string; badge: string }> = {
    direction: { label: 'Direction', badge: 'bg-[#1e3a5f] text-white' },
    cashier: { label: 'Caissière', badge: 'bg-amber-600 text-white' },
    teacher: { label: 'Professeur', badge: 'bg-emerald-600 text-white' },
    student: { label: 'Élève', badge: 'bg-blue-600 text-white' },
    parent: { label: 'Parent', badge: 'bg-purple-600 text-white' },
    superadmin: { label: 'Super Admin', badge: 'bg-rose-600 text-white' },
  };

  const userDisplayName = currentUser
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username
    : 'Utilisateur';

  const userInitial = userDisplayName ? userDisplayName.charAt(0).toUpperCase() : 'U';

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-3 sm:px-5 shrink-0 select-none shadow-2xs">
        {/* Mobile Menu Button & Mobile Logo */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onMenuClick}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1.5 font-bold text-[#1e3a5f] text-base">
            <span className="w-6 h-6 rounded bg-[#d97706] text-white flex items-center justify-center text-xs font-black">
              SG
            </span>
            <span>SysGesco</span>
          </div>
        </div>

        {/* Global Live Search Bar */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-md ml-auto md:ml-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher élève, matricule, reçu..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => searchQuery.trim().length >= 2 && setIsSearchOpen(true)}
              className="w-full h-9 pl-9 pr-8 rounded-lg bg-slate-100 border-0 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Results Popup */}
          {isSearchOpen && searchQuery.trim().length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in-50">
              {filteredStudents.length === 0 && filteredPayments.length === 0 && (
                <p className="px-3 py-3 text-xs text-slate-500 text-center">
                  Aucun résultat pour "{searchQuery}"
                </p>
              )}

              {/* Matching Students */}
              {filteredStudents.length > 0 && (
                <div>
                  <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                    Élèves trouvés
                  </p>
                  {filteredStudents.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setCurrentView('students');
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 text-left transition-colors border-b border-slate-50 last:border-0"
                    >
                      <div className="h-7 w-7 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] flex items-center justify-center font-bold text-xs shrink-0">
                        {s.firstName?.[0] || 'E'}
                        {s.lastName?.[0] || ''}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {s.firstName} {s.lastName}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {s.matricule} • {s.gender === 'F' ? 'Fille' : 'Garçon'}
                        </p>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                        Élève
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Matching Receipts */}
              {filteredPayments.length > 0 && (
                <div>
                  <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                    Reçus & Paiements
                  </p>
                  {filteredPayments.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setCurrentView('cashier');
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 text-left transition-colors border-b border-slate-50 last:border-0"
                    >
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-bold text-[#d97706]">
                          {p.receiptNumber}
                        </span>
                        <p className="text-[11px] text-slate-600 truncate">{p.studentName}</p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {p.amount?.toLocaleString('fr-FR')} FCFA
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Header Navigation Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 ml-auto">
          {/* Quick Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
              title="Changer de rôle actif (Démo / Mode)"
            >
              <span className="w-2 h-2 rounded-full bg-[#f97316]"></span>
              <span className="hidden sm:inline text-slate-500">Rôle:</span>
              <span className="text-[#1e3a5f] font-bold">
                {roleLabels[currentRole]?.label || currentRole}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in-50">
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Changer de vue / rôle
                </div>
                {Object.entries(roleLabels).map(([roleKey, info]) => (
                  <button
                    key={roleKey}
                    onClick={() => {
                      switchRole(roleKey as any);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                      currentRole === roleKey
                        ? 'bg-[#1e3a5f] text-white font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{info.label}</span>
                    {currentRole === roleKey && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Data Modal Trigger */}
          <button
            onClick={() => setShowExportModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
            title="Exporter données (Excel/CSV)"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exports</span>
          </button>

          {/* Sync & Offline Status */}
          <SyncIndicator />
          <PWAInstallButton />

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-80 transition-opacity"
            >
              <div className="h-7 w-7 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                {userInitial}
              </div>
              <div className="hidden lg:block text-left min-w-0">
                <p className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[120px]">
                  {userDisplayName}
                </p>
                <p className="text-[10px] text-slate-500">
                  {roleLabels[currentRole]?.label || currentRole}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in-50">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">
                    {userDisplayName}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {currentUser?.username} • {activeInstitution?.name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCurrentView('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-left mt-1"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Configuration école</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Data Export Modal */}
      <DataExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
    </>
  );
};
