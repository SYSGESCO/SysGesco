import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Database,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  HardDrive,
  Wifi,
  WifiOff,
  ShieldCheck,
  ChevronDown,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';

export const SyncIndicator: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const {
    syncStatus,
    lastSavedAt,
    storageType,
    storageStats,
    isOnline,
    verifyLocalStorage,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs: number; storageType: string } | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await verifyLocalStorage();
      setTestResult(res);
    } finally {
      setTesting(false);
    }
  };

  // Format last save time
  const formatTime = (date: Date) => {
    try {
      return new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(date);
    } catch {
      return 'À l’instant';
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        id="btn-sync-indicator"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 rounded-lg transition-all border text-xs font-semibold select-none ${
          compact ? 'px-2 py-1' : 'px-2.5 py-1.5'
        } ${
          syncStatus === 'saving'
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 shadow-xs'
            : syncStatus === 'error'
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-300'
            : 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/80 shadow-xs'
        }`}
        title="Statut de persistance locale hors-ligne (Cliquez pour afficher les détails de la base)"
      >
        {syncStatus === 'saving' ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600 dark:text-amber-400" />
        ) : syncStatus === 'error' ? (
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </div>
        )}

        <span className="hidden md:inline font-medium">
          {syncStatus === 'saving'
            ? 'Sauvegarde locale...'
            : syncStatus === 'error'
            ? 'Erreur stockage'
            : 'Stocké localement'}
        </span>

        {syncStatus === 'synced' && (
          <span className="text-[10px] opacity-75 font-mono hidden lg:inline">
            {formatTime(lastSavedAt)}
          </span>
        )}

        <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {/* Popover Modal / Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-4 space-y-3.5 animate-in fade-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Persistance Locale & Hors-Ligne
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Moteur Offline-First SysGesco
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Status Summary Banner */}
            <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                  Technologie de stockage :
                </span>
                <span className="font-bold text-[#1e3a5f] dark:text-blue-400 font-mono text-[11px] bg-white dark:bg-slate-700 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600">
                  {storageType}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  {isOnline ? (
                    <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  État Réseau :
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    isOnline
                      ? 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-100/80 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  {isOnline ? 'Connecté (Hybride)' : '100% Hors-Ligne'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Dernière écriture locale :
                </span>
                <span className="font-bold font-mono text-[11px] text-slate-700 dark:text-slate-200">
                  {formatTime(lastSavedAt)}
                </span>
              </div>
            </div>

            {/* Offline-first Explanation Note */}
            <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-900 dark:text-blue-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1e3a5f] dark:text-blue-400" />
                <span>Garantie de continuité sans connexion</span>
              </div>
              <p className="text-[10.5px] leading-relaxed text-blue-800/90 dark:text-blue-300/90">
                Toutes vos actions (inscriptions, notes, paiements de frais, devoirs) sont immédiatement enregistrées dans la base de données locale sécurisée de votre terminal.
              </p>
            </div>

            {/* Storage Data Counts */}
            {storageStats && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3 text-slate-400" />
                    Enregistrements locaux
                  </span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                    {storageStats.totalRecords} éléments
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-slate-500">Élèves :</span>
                    <span className="font-bold font-mono text-slate-800 dark:text-white">
                      {storageStats.stores.students || 0}
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-slate-500">Classes :</span>
                    <span className="font-bold font-mono text-slate-800 dark:text-white">
                      {storageStats.stores.classes || 0}
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-slate-500">Paiements :</span>
                    <span className="font-bold font-mono text-slate-800 dark:text-white">
                      {storageStats.stores.payments || 0}
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-slate-500">Notes & Bul. :</span>
                    <span className="font-bold font-mono text-slate-800 dark:text-white">
                      {(storageStats.stores.grades || 0) + (storageStats.stores.reportCards || 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Diagnostic Test & Actions */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleTest}
                disabled={testing}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>Tester l’accès et la latence locale</span>
              </button>

              {testResult && (
                <div
                  className={`mt-2 p-2 rounded-lg text-center text-xs font-medium border ${
                    testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {testResult.success ? (
                    <div className="flex items-center justify-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        Base locale intègre ({testResult.storageType}) • Latence :{' '}
                        <strong>{testResult.latencyMs} ms</strong>
                      </span>
                    </div>
                  ) : (
                    <span>Erreur d’accès local</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
