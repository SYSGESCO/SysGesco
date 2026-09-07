import React from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Building2, Users, Wallet, ArrowRight, CheckCircle2 } from 'lucide-react';

export const SuperAdminView: React.FC = () => {
  const { institutionsList, activeInstitution, switchInstitution, setCurrentView } = useApp();

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Plateforme Super Administrateur</h1>
            <p className="text-xs text-slate-500">Supervision du parc d'établissements SysGesco</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(institutionsList || []).map((inst) => {
          const isCurrent = activeInstitution?.id === inst.id;

          return (
            <div
              key={inst.id}
              className={`bg-white rounded-2xl p-5 border shadow-sm transition-all space-y-3 ${
                isCurrent ? 'border-[#00236f] ring-2 ring-blue-100' : 'border-slate-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold block">
                    {inst.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{inst.name}</h3>
                  <p className="text-xs text-slate-500">{inst.city} • {inst.type}</p>
                </div>
                {isCurrent && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#00236f] text-[10px] font-bold">
                    Actif
                  </span>
                )}
              </div>

              <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                <div className="flex justify-between">
                  <span>Directeur :</span>
                  <strong>{inst.directorName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Année scolaire :</span>
                  <strong>{inst.academicYear}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Contact :</span>
                  <span>{inst.phone}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  switchInstitution(inst.id);
                  setCurrentView('dashboard');
                }}
                className={`w-full h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isCurrent
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-[#00236f] hover:bg-[#1e3a8a] text-white shadow-xs'
                }`}
              >
                <span>{isCurrent ? 'Déjà sélectionné' : 'Basculer vers cet établissement'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
