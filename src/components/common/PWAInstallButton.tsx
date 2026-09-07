import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        id="btn-pwa-install"
        onClick={install}
        className={`flex items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs shadow-sm transition-all active:scale-95 ${
          compact ? 'px-2 py-1' : 'px-3 py-1.5'
        }`}
        title="Installer l'application sur votre appareil pour un usage 100% hors-ligne"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Installer PWA</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          id="btn-pwa-ios"
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 transition-all ${
            compact ? 'px-2 py-1' : 'px-3 py-1.5'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-800" />
          <span>Installer sur iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Installer SysGesco sur iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                1. Touchez l’icône <strong>Partager</strong> <span className="inline-block px-1 bg-slate-100 rounded text-[11px]">⎋</span> dans la barre Safari.<br />
                2. Faites défiler vers le bas et sélectionnez <strong>Sur l’écran d’accueil</strong>.<br />
                3. SysGesco fonctionnera comme une application native 100% autonome et hors-ligne.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full h-10 rounded-xl bg-blue-900 text-white text-xs font-semibold"
              >
                Compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
