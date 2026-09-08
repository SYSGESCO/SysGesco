import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Settings,
  Download,
  Upload,
  Database,
  RotateCcw,
  Shield,
  Building2,
  Smartphone,
  HardDrive,
  Users,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  Trash2,
  Camera,
  Check,
  Sparkles,
  School,
  Globe,
  Phone,
  Mail,
  UserCheck,
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';

// Sample educational logos presets
const PRESET_LOGOS = [
  {
    name: 'Blason Doré Classique',
    url: 'https://lh3.googleusercontent.com/aida/AEtjO1VOSubVXVMiB4gVuWCdnjJ1-Nh0XjetAyPJKk_ViA8jUlrk8WIoBdeYvHKknQsagq_BFxDRT_KUmkB1XRwgCU4TamdSO4XtZ5Tk4YLqWitohESEtU_Ml9wLDTQS1V7aDbAYZYf8lTnGLInpgb3YTxzLHh3OriGn8kkSnI2x-EdCm4axYHVUj15nQTDohuBPvdnmoiWVI3eAQPzisgxxenNSTeJiwT8FzArg-6W66h4lq3pqHNO7p9OLow',
  },
  {
    name: 'Écusson Académique Étoilé',
    url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=160&auto=format&fit=crop&q=80',
  },
  {
    name: 'Armoiries Scolaires Modernes',
    url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop&q=80',
  },
];

export const SettingsView: React.FC = () => {
  const {
    activeInstitution,
    currentRole,
    switchRole,
    isDemoMode,
    resetDemoData,
    exportBackupJSON,
    restoreBackupJSON,
    updateInstitutionInfo,
    showToast,
    students,
    payments,
    classes,
  } = useApp();

  const [importFile, setImportFile] = useState<File | null>(null);

  // Institution Identity & Logo State
  const [schoolName, setSchoolName] = useState(activeInstitution?.name || '');
  const [schoolType, setSchoolType] = useState(activeInstitution?.type || 'Collège & Lycée');
  const [schoolPhone, setSchoolPhone] = useState(activeInstitution?.phone || '');
  const [schoolEmail, setSchoolEmail] = useState(activeInstitution?.email || '');
  const [schoolCity, setSchoolCity] = useState(activeInstitution?.city || 'Abidjan');
  const [schoolCommune, setSchoolCommune] = useState(activeInstitution?.commune || 'Cocody');
  const [schoolDirector, setSchoolDirector] = useState(activeInstitution?.directorName || '');
  const [logoPreview, setLogoPreview] = useState<string>(activeInstitution?.logoUrl || '');
  const [isSavingIdentity, setIsSavingIdentity] = useState(false);

  useEffect(() => {
    if (activeInstitution) {
      setSchoolName(activeInstitution.name || '');
      setSchoolType(activeInstitution.type || 'Collège & Lycée');
      setSchoolPhone(activeInstitution.phone || '');
      setSchoolEmail(activeInstitution.email || '');
      setSchoolCity(activeInstitution.city || 'Abidjan');
      setSchoolCommune(activeInstitution.commune || 'Cocody');
      setSchoolDirector(activeInstitution.directorName || '');
      setLogoPreview(activeInstitution.logoUrl || '');
    }
  }, [activeInstitution]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2.5 * 1024 * 1024) {
        showToast('Le logo ne doit pas dépasser 2.5 Mo.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setLogoPreview(base64);
        showToast('Logo importé. N’oubliez pas de cliquer sur « Enregistrer l’Identité & Logo » ci-dessous.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim()) {
      showToast('Le nom de l’établissement est obligatoire.', 'error');
      return;
    }
    setIsSavingIdentity(true);
    try {
      await updateInstitutionInfo({
        name: schoolName.trim(),
        type: schoolType,
        phone: schoolPhone.trim(),
        email: schoolEmail.trim(),
        city: schoolCity.trim(),
        commune: schoolCommune.trim(),
        directorName: schoolDirector.trim(),
        logoUrl: logoPreview.trim(),
      });
      showToast('Logo et coordonnées de l’établissement enregistrés avec succès !', 'success', 'Mise à jour réussie');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour.', 'error');
    } finally {
      setIsSavingIdentity(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      showToast('Veuillez sélectionner un fichier JSON de sauvegarde.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonContent = event.target?.result as string;
        await restoreBackupJSON(jsonContent);
        setImportFile(null);
      } catch (err: any) {
        showToast(err.message || 'Fichier de sauvegarde invalide.', 'error');
      }
    };
    reader.readAsText(importFile);
  };

  const roles: { role: UserRole; title: string; desc: string }[] = [
    {
      role: 'direction',
      title: 'Direction / Principal',
      desc: 'Vue globale : scolarité, caisse, notes, bulletins, statistiques et configuration.',
    },
    {
      role: 'cashier',
      title: 'Caissière Centrale',
      desc: 'Encaissements rapides, reçu officiel, récapitulatif journalier FCFA.',
    },
    {
      role: 'teacher',
      title: 'Professeur',
      desc: 'Emploi du temps, saisie des devoirs, notes et feuille d’appel de classe.',
    },
    {
      role: 'student',
      title: 'Élève',
      desc: 'Consultation de mes résultats, moyennes, devoirs et bulletin.',
    },
    {
      role: 'parent',
      title: 'Parent d’Élève',
      desc: 'Suivi de mes enfants, assiduité, notes et situation financière.',
    },
    {
      role: 'superadmin',
      title: 'Super Administrateur',
      desc: 'Supervision multi-établissements, maintenance et bases locales.',
    },
  ];

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1e3a5f] flex items-center justify-center">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Paramètres &amp; Identité Scolaire</h1>
            <p className="text-xs text-slate-500">
              Personnalisation du logo de l’établissement, profil utilisateur et sauvegardes locales
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1 : LOGO & IDENTITÉ OFFICIELLE DE L'ÉTABLISSEMENT */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Logo &amp; Identité Visuelle de l’Établissement
              </h2>
              <p className="text-[11px] text-slate-500">
                Chaque école peut définir son propre logo officiel. Il apparaîtra sur l'en-tête, les bulletins de notes et les reçus de caisse.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
            {activeInstitution?.code}
          </span>
        </div>

        <form onSubmit={handleSaveIdentity} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* Logo Preview & Uploader (Left Column) */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-center space-y-3">
              <span className="text-xs font-bold text-slate-700">Aperçu du Logo</span>
              
              <div className="relative group w-28 h-28 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shadow-xs">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt={schoolName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain p-1.5"
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 p-2">
                    <Building2 className="w-8 h-8 stroke-1" />
                    <span className="text-[10px] mt-1 font-medium">Aucun logo</span>
                  </div>
                )}

                {/* Overlay hover */}
                <label className="absolute inset-0 bg-slate-900/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold">Changer</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Upload & Clear buttons */}
              <div className="w-full space-y-2">
                <label className="w-full h-9 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1e3a5f] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Importer une image (PNG / JPG)</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>

                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => setLogoPreview('')}
                    className="w-full h-8 px-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Retirer le logo actuel</span>
                  </button>
                )}
              </div>

              {/* Quick Presets */}
              <div className="w-full pt-2 border-t border-slate-200/60 text-left">
                <span className="text-[10px] font-bold text-slate-500 block mb-1.5 uppercase">
                  Exemples d'armoiries scolaires
                </span>
                <div className="flex gap-2 justify-center">
                  {PRESET_LOGOS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setLogoPreview(p.url);
                        showToast(`Logo « ${p.name} » sélectionné.`, 'info');
                      }}
                      title={p.name}
                      className={`w-9 h-9 rounded-lg border p-0.5 overflow-hidden transition-all ${
                        logoPreview === p.url
                          ? 'border-[#1e3a5f] ring-2 ring-blue-300'
                          : 'border-slate-200 hover:border-slate-400 bg-white'
                      }`}
                    >
                      <img src={p.url} alt={p.name} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* School Details Fields (Right Column) */}
            <div className="md:col-span-8 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom Officiel de l’Établissement <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="ex: Collège Moderne de l'Est"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#1e3a5f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type d’Établissement</label>
                  <select
                    value={schoolType}
                    onChange={(e) => setSchoolType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#1e3a5f]"
                  >
                    <option value="Collège">Collège</option>
                    <option value="Lycée">Lycée</option>
                    <option value="Collège & Lycée">Collège &amp; Lycée</option>
                    <option value="Établissement primaire">Établissement primaire</option>
                    <option value="Groupe Scolaire">Groupe Scolaire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Directeur / Principal</label>
                  <input
                    type="text"
                    value={schoolDirector}
                    onChange={(e) => setSchoolDirector(e.target.value)}
                    placeholder="Nom du Chef d'établissement"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#1e3a5f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ville</label>
                  <input
                    type="text"
                    value={schoolCity}
                    onChange={(e) => setSchoolCity(e.target.value)}
                    placeholder="Abidjan, Bouaké, San Pedro..."
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#1e3a5f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Commune / Quartier</label>
                  <input
                    type="text"
                    value={schoolCommune}
                    onChange={(e) => setSchoolCommune(e.target.value)}
                    placeholder="Cocody, Yopougon, Plateau..."
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#1e3a5f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone de l'Établissement</label>
                  <input
                    type="tel"
                    value={schoolPhone}
                    onChange={(e) => setSchoolPhone(e.target.value)}
                    placeholder="+225 27 00 00 00 00"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#1e3a5f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Officiel</label>
                  <input
                    type="email"
                    value={schoolEmail}
                    onChange={(e) => setSchoolEmail(e.target.value)}
                    placeholder="direction@ecole.ci"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#1e3a5f]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    URL directe du logo (Optionnelle)
                  </label>
                  <input
                    type="url"
                    value={logoPreview.startsWith('data:') ? '' : logoPreview}
                    onChange={(e) => setLogoPreview(e.target.value)}
                    placeholder="https://mon-ecole.com/logo.png"
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 focus:outline-none focus:border-[#1e3a5f]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Vous pouvez téléverser un fichier local (bouton à gauche) ou coller directement un lien web sécurisé.
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingIdentity}
                  className="h-10 px-5 bg-[#1e3a5f] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingIdentity ? 'Enregistrement...' : 'Enregistrer l’Identité & le Logo'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Rôle Switcher for Testing (Section 26 & Role-based Access) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#1e3a5f]" />
            <h2 className="text-sm font-bold text-slate-900">
              Simulateur d'Espace &amp; Profils de Rôle
            </h2>
          </div>
          <span className="text-xs bg-blue-50 text-[#1e3a5f] font-bold px-2 py-0.5 rounded-full uppercase">
            Actif : {currentRole}
          </span>
        </div>

        <p className="text-xs text-slate-600">
          Changez instantanément de profil pour tester les interfaces adaptées à chaque métier :
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {roles.map((r) => {
            const isSelected = currentRole === r.role;
            return (
              <button
                key={r.role}
                onClick={() => switchRole(r.role)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{r.title}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <p
                  className={`text-[11px] mt-1 leading-snug ${
                    isSelected ? 'text-blue-100' : 'text-slate-500'
                  }`}
                >
                  {r.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sauvegardes & Restauration (Section 4 Offline-First Engine) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Export Backup Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-700" />
              <h2 className="text-sm font-bold text-slate-900">Sauvegarde Complète (Offline-First)</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Téléchargez une archive JSON chiffrée contenant la totalité des données de votre école :
              élèves ({students.length}), caisse ({payments.length} reçus), notes et emplois du temps.
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs font-mono text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Établissement :</span>
              <span className="font-bold">{activeInstitution?.code}</span>
            </div>
            <div className="flex justify-between">
              <span>Format :</span>
              <span className="font-bold">JSON Intégral SysGesco</span>
            </div>
          </div>

          <button
            onClick={exportBackupJSON}
            className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger la Sauvegarde Locale</span>
          </button>
        </div>

        {/* Restore Backup Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#1e3a5f]" />
              <h2 className="text-sm font-bold text-slate-900">Restauration depuis un Fichier JSON</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Importez une sauvegarde pour transférer votre établissement sur une autre machine ou récupérer un état antérieur.
            </p>
          </div>

          <div className="space-y-2">
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#1e3a5f] hover:file:bg-blue-100"
            />
            {importFile && (
              <span className="text-[11px] text-emerald-700 font-medium block">
                Fichier prêt : {importFile.name}
              </span>
            )}
          </div>

          <button
            onClick={handleImportSubmit}
            disabled={!importFile}
            className="w-full h-11 bg-[#1e3a5f] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>Restaurer les données</span>
          </button>
        </div>
      </div>

      {/* PWA, Offline & Device Setup */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-slate-900">Installation PWA &amp; Hors-ligne</h2>
          </div>
          <PWAInstallButton />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl">
            <span className="font-bold text-slate-800 block">Stockage Local</span>
            <span className="text-[11px] text-slate-500">IndexedDB v2 + LocalStorage</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl">
            <span className="font-bold text-slate-800 block">Autonomie Réseau</span>
            <span className="text-[11px] text-slate-500">100% Fonctionnel hors-connexion</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl">
            <span className="font-bold text-slate-800 block">Devise &amp; Territoire</span>
            <span className="text-[11px] text-slate-500">FCFA (Zone UEMOA / CEMAC)</span>
          </div>
        </div>

        {isDemoMode && (
          <div className="pt-2 border-t flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Réinitialiser l'établissement de démonstration à son état usine.
            </span>
            <button
              onClick={resetDemoData}
              className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser Démo</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
