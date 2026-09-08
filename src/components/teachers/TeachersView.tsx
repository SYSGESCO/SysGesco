import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Teacher } from '../../types';
import {
  GraduationCap,
  Plus,
  Phone,
  Mail,
  Calendar,
  BookOpen,
  X,
  CheckCircle2,
  KeyRound,
  Copy,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  LogIn,
  Printer,
  Sparkles,
  User,
} from 'lucide-react';

export const TeachersView: React.FC = () => {
  const {
    teachers,
    addTeacher,
    createOrUpdateTeacherAccount,
    loginAsTeacher,
    showToast,
    setCurrentView,
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [newLastName, setNewLastName] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('Mathématiques');
  const [newPhone, setNewPhone] = useState('+225 ');
  const [newEmail, setNewEmail] = useState('');
  const [newHours, setNewHours] = useState(18);

  // Teacher portal credentials state
  const [newLoginUsername, setNewLoginUsername] = useState('');
  const [newLoginPassword, setNewLoginPassword] = useState('Prof@2026');
  const [createTeacherPortalAccount, setCreateTeacherPortalAccount] = useState(true);
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  // Modal: Post-creation Credentials Display
  const [createdTeacherCredentials, setCreatedTeacherCredentials] = useState<{
    teacher: Teacher;
    username: string;
    password: string;
  } | null>(null);

  const [copiedLogin, setCopiedLogin] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // State for active teacher details/password modal
  const [activeTeacherModal, setActiveTeacherModal] = useState<Teacher | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [customNewPassword, setCustomNewPassword] = useState('');

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const generated = `Prf@${rand}`;
    setNewLoginPassword(generated);
    showToast(`Mot de passe généré : ${generated}`, 'info');
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLastName.trim() || !newFirstName.trim()) {
      showToast('Le nom et le prénom du professeur sont requis.', 'error');
      return;
    }
    if (!newPhone.trim()) {
      showToast('Le numéro de téléphone est obligatoire.', 'error');
      return;
    }

    const cleanLast = newLastName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanFirst = newFirstName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const loginToUse = (newLoginUsername.trim() || `prof.${cleanLast || cleanFirst}`).toLowerCase();
    const passwordToUse = newLoginPassword.trim() || 'Prof@2026';

    try {
      const saved = await addTeacher({
        firstName: newFirstName.trim(),
        lastName: newLastName.trim(),
        phone: newPhone.trim(),
        email: newEmail.trim() || `${loginToUse}@ecole.ci`,
        subject: newSpecialty,
        specialty: newSpecialty,
        weeklyHours: newHours,
        assignedClassIds: [],
        status: 'active',
        loginUsername: loginToUse,
        loginPassword: passwordToUse,
        createTeacherAccount: createTeacherPortalAccount,
      });

      // Reset form
      setNewLastName('');
      setNewFirstName('');
      setNewEmail('');
      setNewPhone('+225 ');
      setNewLoginUsername('');
      setNewLoginPassword('Prof@2026');
      setShowAddModal(false);

      if (createTeacherPortalAccount) {
        setCreatedTeacherCredentials({
          teacher: saved,
          username: loginToUse,
          password: passwordToUse,
        });
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l’ajout du professeur', 'error');
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-900">Corps Professoral &amp; Enseignants</h1>
          <p className="text-xs text-slate-500">
            {teachers.length} professeurs enregistrés avec identifiants d'accès Espace Enseignant
          </p>
        </div>

        <button
          onClick={() => {
            setNewLoginUsername('');
            setNewLoginPassword('Prof@2026');
            setShowAddModal(true);
          }}
          className="h-10 px-4 bg-[#00236f] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un professeur</span>
        </button>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {teachers.map((teacher) => {
          const login = teacher.loginUsername || `prof.${teacher.lastName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

          return (
            <div
              key={teacher.id}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-blue-200 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                    {teacher.firstName[0]}
                    {teacher.lastName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                        {teacher.specialty}
                      </span>
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Espace actif
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 truncate mt-1">
                      {teacher.lastName} {teacher.firstName}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                      {teacher.weeklyHours}h / semaine
                    </p>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`tel:${teacher.phone}`} className="hover:underline font-mono">
                      {teacher.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                </div>

                {/* Login Info Pill */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px]">
                  <div className="flex items-center gap-1 text-slate-700 truncate">
                    <User className="w-3.5 h-3.5 text-[#00236f] shrink-0" />
                    <span className="font-mono font-bold text-[#00236f] truncate">{login}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTeacherModal(teacher);
                      setIsChangingPassword(false);
                      setCustomNewPassword(teacher.loginPassword || 'Prof@2026');
                    }}
                    className="text-[10px] font-bold text-[#00236f] hover:underline flex items-center gap-0.5 shrink-0"
                  >
                    <KeyRound className="w-3 h-3" /> Accès
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => loginAsTeacher(teacher.id)}
                  className="flex-1 h-9 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  title="Se connecter et basculer sur l'espace de ce professeur"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Espace Professeur</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentView('timetable')}
                  className="h-9 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#00236f] text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  title="Consulter l'emploi du temps"
                >
                  <Calendar className="w-3.5 h-3.5" />
                </button>

                <a
                  href={`tel:${teacher.phone}`}
                  className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                  title="Appeler"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* MODAL : AJOUTER PROFESSEUR                               */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#00236f]/10 text-[#00236f] flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Nouveau Professeur</h3>
                  <p className="text-[11px] text-slate-500">Enregistrement et attribution d'accès Espace Enseignant</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newLastName}
                    onChange={(e) => {
                      setNewLastName(e.target.value);
                      if (!newLoginUsername) {
                        const clean = e.target.value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                        if (clean) setNewLoginUsername(`prof.${clean}`);
                      }
                    }}
                    placeholder="ex: KOUAME"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prénoms <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="ex: Yao Jean"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Matière d'enseignement / Spécialité
                </label>
                <select
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="Mathématiques">Mathématiques</option>
                  <option value="Français">Français</option>
                  <option value="Physique-Chimie">Physique-Chimie</option>
                  <option value="SVT">SVT (Sciences de la Vie et de la Terre)</option>
                  <option value="Anglais">Anglais</option>
                  <option value="Histoire-Géographie">Histoire-Géographie</option>
                  <option value="Philosophie">Philosophie</option>
                  <option value="EPS">EPS (Éducation Physique)</option>
                  <option value="Informatique">Informatique</option>
                  <option value="Espagnol">Espagnol</option>
                  <option value="Allemand">Allemand</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Téléphone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+225 07 00 00 00"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Volume horaire / sem
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={newHours}
                    onChange={(e) => setNewHours(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="prof@ecole.ci"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              {/* Attribution Espace Enseignant (Login & Mot de passe) */}
              <div className="border-t border-slate-100 pt-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#00236f]" />
                    <span className="text-xs font-bold text-slate-800">Espace Enseignant &amp; Accès Dédié</span>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-[#00236f] select-none">
                    <input
                      type="checkbox"
                      checked={createTeacherPortalAccount}
                      onChange={(e) => setCreateTeacherPortalAccount(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#00236f] focus:ring-[#00236f]"
                    />
                    <span>Attribuer un compte</span>
                  </label>
                </div>

                {createTeacherPortalAccount && (
                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 space-y-2.5">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Identifiant (Login)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={newLoginUsername}
                            onChange={(e) => setNewLoginUsername(e.target.value)}
                            placeholder="ex: prof.kouame"
                            className="w-full h-9 pl-7 pr-2 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#00236f]"
                          />
                          <User className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5 pointer-events-none" />
                        </div>
                        <span className="text-[9.5px] text-slate-500 mt-0.5 block">
                          Par défaut : prof.nom
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-semibold text-slate-700">
                            Mot de passe
                          </label>
                          <button
                            type="button"
                            onClick={generateRandomPassword}
                            className="text-[10px] text-[#00236f] font-bold hover:underline flex items-center gap-0.5"
                          >
                            <Sparkles className="w-2.5 h-2.5" /> Générer
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type={showPasswordInput ? 'text' : 'password'}
                            value={newLoginPassword}
                            onChange={(e) => setNewLoginPassword(e.target.value)}
                            placeholder="Prof@2026"
                            className="w-full h-9 pl-7 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#00236f]"
                          />
                          <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5 pointer-events-none" />
                          <button
                            type="button"
                            onClick={() => setShowPasswordInput(!showPasswordInput)}
                            className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                          >
                            {showPasswordInput ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <span className="text-[9.5px] text-slate-500 mt-0.5 block">
                          Par défaut : Prof@2026
                        </span>
                      </div>
                    </div>

                    <p className="text-[10.5px] text-blue-900 leading-snug">
                      ℹ️ L’enseignant pourra se connecter avec le rôle <strong>Enseignant</strong> pour saisir les notes, consigner les devoirs et enregistrer les présences/absences.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/3 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-2/3 h-11 bg-[#00236f] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Enregistrer et générer accès
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL : FICHE IDENTIFIANTS ENSEIGNANT CRÉÉ               */}
      {/* ======================================================== */}
      {createdTeacherCredentials && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-13 h-13 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Compte Enseignant Attribué &amp; Prêt !
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Le professeur <strong>{createdTeacherCredentials.teacher.lastName} {createdTeacherCredentials.teacher.firstName}</strong> ({createdTeacherCredentials.teacher.specialty}) dispose d’un accès personnel à son espace de travail.
              </p>
            </div>

            {/* Identifiants Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500">Matière enseignée :</span>
                <span className="font-bold text-slate-800">
                  {createdTeacherCredentials.teacher.specialty}
                </span>
              </div>

              {/* Login */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Identifiant (Login)
                </span>
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200">
                  <span className="font-mono font-bold text-sm text-[#00236f]">
                    {createdTeacherCredentials.username}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdTeacherCredentials.username);
                      setCopiedLogin(true);
                      setTimeout(() => setCopiedLogin(false), 2000);
                      showToast('Identifiant copié !', 'success');
                    }}
                    className="text-xs font-semibold text-[#00236f] hover:underline flex items-center gap-1"
                  >
                    {copiedLogin ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLogin ? 'Copié' : 'Copier'}</span>
                  </button>
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Mot de passe provisoire
                </span>
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200">
                  <span className="font-mono font-bold text-sm text-slate-800">
                    {createdTeacherCredentials.password}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdTeacherCredentials.password);
                      setCopiedPassword(true);
                      setTimeout(() => setCopiedPassword(false), 2000);
                      showToast('Mot de passe copié !', 'success');
                    }}
                    className="text-xs font-semibold text-[#00236f] hover:underline flex items-center gap-1"
                  >
                    {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPassword ? 'Copié' : 'Copier'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-blue-900 leading-snug">
              💡 Transmettez ces identifiants au professeur. Il lui suffira de choisir le profil <strong>Enseignant</strong> sur SysGesco pour saisir ses notes, vérifier les absences et gérer ses classes.
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  loginAsTeacher(createdTeacherCredentials.teacher.id);
                  setCreatedTeacherCredentials(null);
                }}
                className="w-full h-11 bg-[#00236f] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Tester et basculer sur l'espace professeur</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer fiche</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreatedTeacherCredentials(null)}
                  className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL : FICHE & MODIFICATION ACCÈS ENSEIGNANT EXISTANT   */}
      {/* ======================================================== */}
      {activeTeacherModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#00236f] flex items-center justify-center font-bold text-xs">
                  {activeTeacherModal.firstName[0]}{activeTeacherModal.lastName[0]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {activeTeacherModal.lastName} {activeTeacherModal.firstName}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {activeTeacherModal.specialty} • {activeTeacherModal.phone}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTeacherModal(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Accès Espace Enseignant */}
            <div className="bg-[#faf8ff] p-3 rounded-xl border border-blue-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#00236f]" />
                  <h4 className="font-bold text-[#00236f] text-xs uppercase tracking-wider">
                    Accès Espace Personnel Enseignant
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    loginAsTeacher(activeTeacherModal.id);
                    setActiveTeacherModal(null);
                  }}
                  className="px-2.5 py-1 bg-[#00236f] hover:bg-[#1e3a8a] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs"
                  title="Basculer et tester l'espace de ce professeur"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Ouvrir son espace</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Identifiant (Login) :</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono font-bold text-xs text-slate-800">
                      {activeTeacherModal.loginUsername || `prof.${activeTeacherModal.lastName.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const val = activeTeacherModal.loginUsername || `prof.${activeTeacherModal.lastName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
                        navigator.clipboard.writeText(val);
                        showToast('Identifiant copié !', 'success');
                      }}
                      className="p-1 text-slate-400 hover:text-[#00236f]"
                      title="Copier l'identifiant"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Mot de passe :</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono font-bold text-xs text-slate-800">
                      {activeTeacherModal.loginPassword || 'Prof@2026'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(activeTeacherModal.loginPassword || 'Prof@2026');
                        showToast('Mot de passe copié !', 'success');
                      }}
                      className="p-1 text-slate-400 hover:text-[#00236f]"
                      title="Copier le mot de passe"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Modification du mot de passe */}
              {isChangingPassword ? (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={customNewPassword}
                    onChange={(e) => setCustomNewPassword(e.target.value)}
                    placeholder="Nouveau mot de passe..."
                    className="flex-1 h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-[#00236f]"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!customNewPassword.trim()) {
                        showToast('Saisissez un mot de passe', 'error');
                        return;
                      }
                      const login = activeTeacherModal.loginUsername || `prof.${activeTeacherModal.lastName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
                      await createOrUpdateTeacherAccount(
                        activeTeacherModal.id,
                        login,
                        customNewPassword.trim()
                      );
                      setActiveTeacherModal({
                        ...activeTeacherModal,
                        loginPassword: customNewPassword.trim(),
                      });
                      setIsChangingPassword(false);
                      setCustomNewPassword('');
                    }}
                    className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="h-8 px-2.5 text-slate-500 hover:text-slate-700 text-xs"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <span className="text-slate-400">
                    Rôle associé : <strong className="text-slate-600">Enseignant (teacher)</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(true);
                      setCustomNewPassword(activeTeacherModal.loginPassword || 'Prof@2026');
                    }}
                    className="text-[#00236f] font-semibold hover:underline flex items-center gap-1"
                  >
                    <KeyRound className="w-3 h-3" /> Modifier le mot de passe
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTeacherModal(null)}
                className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
