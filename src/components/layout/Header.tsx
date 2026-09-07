import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Wifi,
  WifiOff,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Check,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { SyncIndicator } from '../common/SyncIndicator';
import { DataExportModal } from '../common/DataExportModal';

export const Header: React.FC = () => {
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
    resetDemoData,
    setCurrentView,
  } = useApp();

  const [showInstitutionMenu, setShowInstitutionMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const roleLabels: Record<string, { label: string; bg: string; icon: string; desc: string }> = {
    direction: { label: 'Direction', bg: 'bg-[#00236f] text-white', icon: '🎓', desc: 'Gestion complète & administrative' },
    cashier: { label: 'Caissière', bg: 'bg-amber-700 text-white', icon: '💼', desc: 'Encaissements, reçus & recouvrement' },
    teacher: { label: 'Professeur', bg: 'bg-emerald-700 text-white', icon: '👨‍🏫', desc: 'Notes, devoirs & appel de classe' },
    student: { label: 'Élève', bg: 'bg-blue-600 text-white', icon: '🎒', desc: 'Mon carnet, devoirs & planning' },
    parent: { label: 'Parent', bg: 'bg-purple-700 text-white', icon: '👨‍👩‍👧', desc: 'Suivi enfant, scolarité & bulletins' },
    superadmin: { label: 'Super Admin', bg: 'bg-rose-700 text-white', icon: '🛡️', desc: 'Supervision globale SysGesco' },
  };

  const roleInfo = roleLabels[currentRole] || {
    label: currentRole,
    bg: 'bg-slate-700 text-white',
    icon: '👤',
    desc: 'Utilisateur',
  };

  return (
    <header className="sticky top-0 z-40 bg-[#faf8ff]/95 backdrop-blur-md border-b border-slate-200/70 pt-safe">
      <div className="max-w-7xl mx-auto h-16 px-3 sm:px-6 flex items-center justify-between gap-2">
        {/* Left: Brand & Institution Context */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
          <div className="flex items-center gap-2 shrink-0">
            <img
              src="https://lh3.googleusercontent.com/aida/AEtjO1VOSubVXVMiB4gVuWCdnjJ1-Nh0XjetAyPJKk_ViA8jUlrk8WIoBdeYvHKknQsagq_BFxDRT_KUmkB1XRwgCU4TamdSO4XtZ5Tk4YLqWitohESEtU_Ml9wLDTQS1V7aDbAYZYf8lTnGLInpgb3YTxzLHh3OriGn8kkSnI2x-EdCm4axYHVUj15nQTDohuBPvdnmoiWVI3eAQPzisgxxenNSTeJiwT8FzArg-6W66h4lq3pqHNO7p9OLow"
              alt="SysGesco"
              className="h-7 sm:h-8 w-auto object-contain"
            />
            <span className="font-bold text-sm tracking-wider text-[#00236f] hidden sm:inline">
              SYSGESCO
            </span>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

          {/* Institution Selector dropdown */}
          <div className="relative min-w-0">
            <button
              id="btn-institution-dropdown"
              onClick={() => setShowInstitutionMenu(!showInstitutionMenu)}
              className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-slate-100/80 transition-colors text-left min-w-0"
              title="Changer d'établissement actif"
            >
              {activeInstitution?.logoUrl ? (
                <img
                  src={activeInstitution.logoUrl}
                  alt={activeInstitution.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-lg object-contain bg-white border border-slate-200 p-0.5 shadow-2xs shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-[#00236f]" />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-[#00236f] truncate max-w-[130px] sm:max-w-[220px]">
                    {activeInstitution?.name || 'Sélectionner...'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                  <span className="font-mono text-slate-600">{activeInstitution?.code}</span>
                  <span>•</span>
                  <span>{activeInstitution?.academicYear || '2026-2027'}</span>
                </div>
              </div>
            </button>

            {/* Institution Switcher Menu */}
            {showInstitutionMenu && (
              <div className="absolute left-0 top-full mt-1 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50">
                <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Changer d'établissement
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {(institutionsList || []).map((inst) => (
                    <button
                      key={inst.id}
                      onClick={() => {
                        switchInstitution(inst.id);
                        setShowInstitutionMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        activeInstitution?.id === inst.id
                          ? 'bg-blue-50 text-[#00236f] font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {inst.logoUrl ? (
                          <img
                            src={inst.logoUrl}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-6 h-6 rounded-md object-contain bg-white border border-slate-200 p-0.5 shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="truncate font-semibold">{inst.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {inst.code} {inst.isDemo ? '• Démo' : ''}
                          </div>
                        </div>
                      </div>
                      {activeInstitution?.id === inst.id && (
                        <Check className="w-4 h-4 text-[#00236f] shrink-0 ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Demo Badge */}
          {isDemoMode && (
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] uppercase tracking-wider shrink-0 shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-600" />
              MODE DÉMO
            </span>
          )}
        </div>

        {/* Right: Network status, Sync indicator, Role pill, PWA button, User profile & Logout */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Offline-first Local Database Sync Indicator */}
          <SyncIndicator compact />

          {/* Online / Offline badge */}
          <div
            className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                : 'bg-amber-50 text-amber-700 border border-amber-200/60 animate-pulse'
            }`}
          >
            {isOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>En ligne</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span>Hors-ligne</span>
              </>
            )}
          </div>

          {/* Central Export Center Button */}
          <button
            type="button"
            id="btn-header-export-center"
            onClick={() => setShowExportModal(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-[#00236f] shadow-2xs transition-colors"
            title="Centre d'exportation de données (Élèves, Notes, Caisse) en PDF et Excel"
          >
            <Download className="w-3.5 h-3.5 text-[#00236f]" />
            <span>Exports</span>
          </button>

          {/* Install PWA Button */}
          <PWAInstallButton compact />

          {/* Current User Role Badge & Quick Switcher */}
          <div className="relative">
            <button
              id="btn-switch-role"
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowUserMenu(false);
                setShowInstitutionMenu(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase shrink-0 shadow-2xs transition-all hover:opacity-95 ${roleInfo.bg}`}
              title="Changer de profil ou de rôle"
            >
              <span>{roleInfo.icon}</span>
              <span>{roleInfo.label}</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-xs space-y-1">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Changer de Profil
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Adapte immédiatement les accès et données
                  </p>
                </div>

                {Object.entries(roleLabels).map(([rKey, rData]) => {
                  const isCurrent = currentRole === rKey;
                  return (
                    <button
                      key={rKey}
                      id={`btn-role-select-${rKey}`}
                      onClick={() => {
                        switchRole(rKey as any);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                        isCurrent
                          ? 'bg-blue-50 text-[#00236f] font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base">{rData.icon}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold leading-tight">{rData.label}</div>
                          <div className="text-[10px] text-slate-500 truncate">{rData.desc}</div>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-[#00236f] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              id="btn-user-avatar"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-xl bg-[#00236f] text-white flex items-center justify-center hover:opacity-90 transition-all shadow-xs"
              title={`${currentUser?.firstName} ${currentUser?.lastName}`}
            >
              <UserIcon className="w-4 h-4" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-1 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-xs space-y-1">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-900 truncate">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">@{currentUser?.username}</p>
                </div>

                {isDemoMode && (
                  <button
                    onClick={() => {
                      resetDemoData();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-amber-800 hover:bg-amber-50 font-medium flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                    <span>Réinitialiser Démo</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setCurrentView('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Paramètres &amp; Sauvegardes
                </button>

                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Central Data Export Modal */}
      <DataExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </header>
  );
};
