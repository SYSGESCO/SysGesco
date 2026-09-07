import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import {
  Search,
  Plus,
  Filter,
  Phone,
  MessageCircle,
  User,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Calendar,
  CreditCard,
  GraduationCap,
  X,
  FileText,
  Hash,
  Sparkles,
  KeyRound,
  Copy,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  LogIn,
  ExternalLink,
  Download,
} from 'lucide-react';
import { DataExportModal } from '../common/DataExportModal';

export const StudentsView: React.FC = () => {
  const {
    students,
    classes,
    users,
    addStudent,
    updateStudent,
    deleteStudent,
    loginAsStudent,
    createOrUpdateStudentAccount,
    setSelectedStudentId,
    setCurrentView,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeStudentModal, setActiveStudentModal] = useState<Student | null>(null);

  // New Student Form State
  const [newMatricule, setNewMatricule] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newDateOfBirth, setNewDateOfBirth] = useState('2010-06-15');
  const [newGender, setNewGender] = useState<'M' | 'F'>('M');
  const [newClassId, setNewClassId] = useState(classes[0]?.id || 'cls-3a');
  const [newGuardianName, setNewGuardianName] = useState('');
  const [newGuardianPhone, setNewGuardianPhone] = useState('+225 ');
  const [newGuardianEmail, setNewGuardianEmail] = useState('');
  const [newGuardianAddress, setNewGuardianAddress] = useState('');
  const [newTuitionTotal, setNewTuitionTotal] = useState(350000);

  // Student portal credentials state
  const [newLoginUsername, setNewLoginUsername] = useState('');
  const [newLoginPassword, setNewLoginPassword] = useState('Eleve@2026');
  const [createStudentPortalAccount, setCreateStudentPortalAccount] = useState(true);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [copiedLogin, setCopiedLogin] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Modal: Post-creation Credentials Display
  const [createdStudentCredentials, setCreatedStudentCredentials] = useState<{
    student: Student;
    username: string;
    password: string;
  } | null>(null);

  // Reset password state inside activeStudentModal
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [customNewPassword, setCustomNewPassword] = useState('');

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const generated = `Elv@${rand}`;
    setNewLoginPassword(generated);
    showToast(`Mot de passe généré : ${generated}`, 'info');
  };

  const generateMatricule = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `CI-${year}-${rand}`;
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        s.lastName.toLowerCase().includes(q) ||
        s.firstName.toLowerCase().includes(q) ||
        s.matricule.toLowerCase().includes(q);

      const matchesClass = selectedClassId === 'all' || s.classId === selectedClassId;
      return matchesQuery && matchesClass;
    });
  }, [students, searchQuery, selectedClassId]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLastName.trim() || !newFirstName.trim()) {
      showToast('Veuillez saisir le nom et les prénoms de l’élève.', 'error');
      return;
    }
    if (!newGuardianPhone.trim()) {
      showToast('Le contact du parent/responsable est obligatoire.', 'error');
      return;
    }

    const matriculeToUse = newMatricule.trim() || generateMatricule();
    const loginToUse = (newLoginUsername.trim() || matriculeToUse).toLowerCase();
    const passwordToUse = newLoginPassword.trim() || 'Eleve@2026';

    try {
      const saved = await addStudent({
        matricule: matriculeToUse,
        firstName: newFirstName.trim(),
        lastName: newLastName.trim(),
        dateOfBirth: newDateOfBirth,
        gender: newGender,
        classId: newClassId,
        guardianName: newGuardianName.trim() || `Parent de ${newFirstName}`,
        guardianPhone: newGuardianPhone.trim(),
        guardianEmail: newGuardianEmail.trim(),
        guardianAddress: newGuardianAddress.trim(),
        tuitionTotal: newTuitionTotal,
        status: 'active',
        enrollmentDate: new Date().toISOString().slice(0, 10),
        loginUsername: loginToUse,
        loginPassword: passwordToUse,
        createStudentAccount: createStudentPortalAccount,
      });

      // Reset Form
      setNewMatricule('');
      setNewLastName('');
      setNewFirstName('');
      setNewGuardianName('');
      setNewGuardianPhone('+225 ');
      setNewLoginUsername('');
      setNewLoginPassword('Eleve@2026');
      setShowAddModal(false);

      if (createStudentPortalAccount) {
        setCreatedStudentCredentials({
          student: saved,
          username: loginToUse,
          password: passwordToUse,
        });
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l’inscription', 'error');
    }
  };

  const getFinancialBadge = (s: Student) => {
    const tuitionTotal = s.tuitionTotal ?? 0;
    const tuitionPaid = s.tuitionPaid ?? 0;
    const remaining = Math.max(0, tuitionTotal - tuitionPaid);
    if (remaining === 0 && tuitionTotal > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> À jour
        </span>
      );
    } else if (tuitionPaid > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
          <Clock className="w-3 h-3 text-amber-600" /> En cours ({(remaining || 0).toLocaleString('fr-FR')} FCFA)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
          <AlertTriangle className="w-3 h-3 text-rose-600" /> Impayé
        </span>
      );
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#00236f]">Dossiers Scolaires &amp; Élèves</h1>
          <p className="text-xs text-slate-500">
            {filteredStudents.length} élève{filteredStudents.length > 1 ? 's' : ''} répertorié{filteredStudents.length > 1 ? 's' : ''} dans l’établissement
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-export-students"
            onClick={() => setShowExportModal(true)}
            className="h-10 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200/60"
            title="Exporter les élèves au format PDF et Excel"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Exporter (PDF / Excel)</span>
          </button>

          <button
            id="btn-new-student"
            onClick={() => {
              setNewMatricule(generateMatricule());
              setShowAddModal(true);
            }}
            className="h-10 px-4 bg-[#00236f] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Inscrire un élève</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, prénom ou matricule..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00236f] shadow-xs"
          />
        </div>

        <div className="relative">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:border-[#00236f] shadow-xs"
          >
            <option value="all">Toutes les classes ({classes.length})</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.room})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredStudents.map((student) => {
          const studentClass = classes.find((c) => c.id === student.classId);
          const remainingTuition = Math.max(0, (student.tuitionTotal ?? 0) - (student.tuitionPaid ?? 0));

          return (
            <div
              key={student.id}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-blue-200 transition-all space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center font-bold text-[#00236f] text-sm">
                  {student.photoUrl ? (
                    <img src={student.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>
                      {student.firstName[0]}
                      {student.lastName[0]}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono text-slate-400">{student.matricule}</span>
                    {getFinancialBadge(student)}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                    {student.lastName} {student.firstName}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#00236f]" />
                    <span className="font-semibold text-slate-700">
                      {studentClass?.name || 'Classe non assignée'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="bg-[#faf8ff] p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 font-sans block">Payé</span>
                  <span className="font-bold text-emerald-700">
                    {(student.tuitionPaid ?? 0).toLocaleString('fr-FR')} F
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-sans block">Reste dû</span>
                  <span className="font-bold text-rose-600">
                    {(remainingTuition ?? 0).toLocaleString('fr-FR')} F
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => setActiveStudentModal(student)}
                  className="flex-1 h-9 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#00236f] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Fiche complète</span>
                </button>

                <button
                  type="button"
                  onClick={() => loginAsStudent(student.id)}
                  className="h-9 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Se connecter directement à l’Espace Élève"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Espace</span>
                </button>

                {student.guardianPhone && (
                  <a
                    href={`tel:${student.guardianPhone}`}
                    className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                    title={`Appeler le parent (${student.guardianName})`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}

        {filteredStudents.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-100 space-y-2">
            <User className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">Aucun élève ne correspond à votre recherche</p>
            <p className="text-xs text-slate-400">Vérifiez les filtres de classe ou le matricule saisi.</p>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL : NOUVELLE INSCRIPTION ÉLÈVE (Section 29)          */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#00236f] flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Inscription Directe Élève</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              {/* Numéro Matricule */}
              <div className="bg-[#faf8ff] p-3 rounded-xl border border-blue-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-[#00236f]" />
                    <span>Numéro Matricule de l’Élève</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const generated = generateMatricule();
                      setNewMatricule(generated);
                      showToast(`Nouveau matricule généré : ${generated}`, 'info');
                    }}
                    className="text-[11px] font-semibold text-[#00236f] hover:text-[#1e3a8a] flex items-center gap-1 hover:underline"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Régénérer auto</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={newMatricule}
                    onChange={(e) => setNewMatricule(e.target.value)}
                    placeholder="ex: CI-2026-4819 ou MAT-0082"
                    className="w-full h-10 pl-3 pr-24 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#00236f]"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                    Matricule
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Saisissez le matricule officiel national (MENA) ou conservez l’identifiant unique généré.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="ex: KOUASSI"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#00236f]"
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
                    placeholder="ex: Ange Michel"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#00236f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Genre</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#00236f]"
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Naissance</label>
                  <input
                    type="date"
                    value={newDateOfBirth}
                    onChange={(e) => setNewDateOfBirth(e.target.value)}
                    className="w-full h-10 px-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#00236f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Classe <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newClassId}
                    onChange={(e) => setNewClassId(e.target.value)}
                    className="w-full h-10 px-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#00236f]"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2.5">
                <span className="text-xs font-bold text-slate-600 block">Parent / Tuteur Légal</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nom du responsable</label>
                    <input
                      type="text"
                      value={newGuardianName}
                      onChange={(e) => setNewGuardianName(e.target.value)}
                      placeholder="M. KOUASSI Jérôme"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#00236f]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Téléphone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={newGuardianPhone}
                      onChange={(e) => setNewGuardianPhone(e.target.value)}
                      placeholder="+225 07 00 00 00"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#00236f]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse de résidence</label>
                  <input
                    type="text"
                    value={newGuardianAddress}
                    onChange={(e) => setNewGuardianAddress(e.target.value)}
                    placeholder="Commune, Quartier, Lot..."
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#00236f]"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Frais scolaires annuels dus (FCFA)
                </label>
                <input
                  type="number"
                  step="5000"
                  value={newTuitionTotal}
                  onChange={(e) => setNewTuitionTotal(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-[#00236f]"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Matricule et situation financière initiale générés automatiquement.
                </span>
              </div>

              {/* Attribution Espace Élève (Login & Mot de passe) */}
              <div className="border-t border-slate-100 pt-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#00236f]" />
                    <span className="text-xs font-bold text-slate-800">Espace Élève & Accès Dédié</span>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-[#00236f] select-none">
                    <input
                      type="checkbox"
                      checked={createStudentPortalAccount}
                      onChange={(e) => setCreateStudentPortalAccount(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#00236f] focus:ring-[#00236f]"
                    />
                    <span>Attribuer un compte personnel</span>
                  </label>
                </div>

                {createStudentPortalAccount && (
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
                            placeholder={newMatricule.trim() || 'Matricule auto'}
                            className="w-full h-9 pl-7 pr-2 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#00236f]"
                          />
                          <User className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5 pointer-events-none" />
                        </div>
                        <span className="text-[9.5px] text-slate-500 mt-0.5 block">
                          Par défaut : matricule de l’élève
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
                            placeholder="Eleve@2026"
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
                          Par défaut : Eleve@2026
                        </span>
                      </div>
                    </div>

                    <p className="text-[10.5px] text-blue-900 leading-snug">
                      ℹ️ L’élève pourra se connecter en toute autonomie en choisissant le rôle <strong>Élève</strong> pour consulter son emploi du temps, ses devoirs, ses notes et ses bulletins.
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
                  Valider l’inscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL : FICHE COMPLÈTE ÉLÈVE (Section 28)                */}
      {/* ======================================================== */}
      {activeStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#00236f] flex items-center justify-center font-bold text-base">
                  {activeStudentModal.firstName[0]}
                  {activeStudentModal.lastName[0]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {activeStudentModal.lastName} {activeStudentModal.firstName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {activeStudentModal.matricule} • Inscrit le {activeStudentModal.enrollmentDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveStudentModal(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Fiche Sections */}
            <div className="space-y-3 text-xs">
              {/* Identité & Scolarité */}
              <div className="bg-[#faf8ff] p-3 rounded-xl border border-slate-100 space-y-1.5">
                <h4 className="font-bold text-[#00236f] text-xs uppercase tracking-wider">
                  Identité &amp; Scolarité
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Date de naissance :</span>
                    <span className="font-semibold">{activeStudentModal.dateOfBirth}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Genre :</span>
                    <span className="font-semibold">
                      {activeStudentModal.gender === 'M' ? 'Masculin' : 'Féminin'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Classe active :</span>
                    <span className="font-semibold text-[#00236f]">
                      {classes.find((c) => c.id === activeStudentModal.classId)?.name || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Statut :</span>
                    <span className="font-semibold text-emerald-700">Actif / Régulier</span>
                  </div>
                </div>
              </div>

              {/* Responsable Légal */}
              <div className="bg-[#faf8ff] p-3 rounded-xl border border-slate-100 space-y-1.5">
                <h4 className="font-bold text-[#00236f] text-xs uppercase tracking-wider">
                  Responsable / Tuteur
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nom complet :</span>
                    <span className="font-semibold">{activeStudentModal.guardianName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Téléphone :</span>
                    <a
                      href={`tel:${activeStudentModal.guardianPhone}`}
                      className="font-semibold text-[#00236f] underline font-mono"
                    >
                      {activeStudentModal.guardianPhone}
                    </a>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Adresse :</span>
                    <span>{activeStudentModal.guardianAddress || 'Non renseignée'}</span>
                  </div>
                </div>
              </div>

              {/* Situation Financière */}
              <div className="bg-[#faf8ff] p-3 rounded-xl border border-slate-100 space-y-1.5">
                <h4 className="font-bold text-[#00236f] text-xs uppercase tracking-wider">
                  Situation Financière FCFA
                </h4>
                <div className="grid grid-cols-3 gap-2 p-2 bg-white rounded-lg border border-slate-100 text-center font-mono">
                  <div>
                    <span className="text-[10px] font-sans text-slate-400 block">Frais Dus</span>
                    <span className="font-bold text-slate-800">
                      {(activeStudentModal.tuitionTotal ?? 0).toLocaleString('fr-FR')} F
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans text-slate-400 block">Total Versé</span>
                    <span className="font-bold text-emerald-700">
                      {(activeStudentModal.tuitionPaid ?? 0).toLocaleString('fr-FR')} F
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans text-slate-400 block">Reste Dû</span>
                    <span className="font-bold text-rose-600">
                      {Math.max(
                        0,
                        (activeStudentModal.tuitionTotal ?? 0) - (activeStudentModal.tuitionPaid ?? 0)
                      ).toLocaleString('fr-FR')}{' '}
                      F
                    </span>
                  </div>
                </div>
              </div>

              {/* Accès Espace Personnel Élève */}
              <div className="bg-[#faf8ff] p-3 rounded-xl border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#00236f]" />
                    <h4 className="font-bold text-[#00236f] text-xs uppercase tracking-wider">
                      Accès Espace Personnel Élève
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      loginAsStudent(activeStudentModal.id);
                      setActiveStudentModal(null);
                    }}
                    className="px-2.5 py-1 bg-[#00236f] hover:bg-[#1e3a8a] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs"
                    title="Basculer et tester l'espace de cet élève"
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
                        {activeStudentModal.loginUsername || activeStudentModal.matricule.toLowerCase()}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            activeStudentModal.loginUsername || activeStudentModal.matricule.toLowerCase()
                          );
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
                        {activeStudentModal.loginPassword || 'Eleve@2026'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            activeStudentModal.loginPassword || 'Eleve@2026'
                          );
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
                        await createOrUpdateStudentAccount(
                          activeStudentModal.id,
                          activeStudentModal.loginUsername || activeStudentModal.matricule.toLowerCase(),
                          customNewPassword.trim()
                        );
                        setActiveStudentModal({
                          ...activeStudentModal,
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
                      Rôle associé : <strong className="text-slate-600">Élève</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(true);
                        setCustomNewPassword(activeStudentModal.loginPassword || 'Eleve@2026');
                      }}
                      className="text-[#00236f] font-semibold hover:underline flex items-center gap-1"
                    >
                      <KeyRound className="w-3 h-3" /> Modifier le mot de passe
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
              <button
                onClick={() => {
                  window.print();
                }}
                className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer fiche A4</span>
              </button>

              <button
                onClick={() => setActiveStudentModal(null)}
                className="h-10 px-5 bg-[#00236f] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL : FICHE IDENTIFIANTS ESPACE ÉLÈVE ATTRIBUÉ        */}
      {/* ======================================================== */}
      {createdStudentCredentials && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-13 h-13 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Espace Élève Attribué &amp; Prêt !
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                L’élève <strong>{createdStudentCredentials.student.firstName} {createdStudentCredentials.student.lastName}</strong> dispose désormais d’un accès personnel à son portail.
              </p>
            </div>

            {/* Identifiants Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500">Matricule officiel :</span>
                <span className="font-mono font-bold text-slate-800">
                  {createdStudentCredentials.student.matricule}
                </span>
              </div>

              {/* Login */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Identifiant (Login)
                </span>
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200">
                  <span className="font-mono font-bold text-sm text-[#00236f]">
                    {createdStudentCredentials.username}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdStudentCredentials.username);
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
                    {createdStudentCredentials.password}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdStudentCredentials.password);
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
              💡 Transmettez ces identifiants à l’élève ou à son parent. Il lui suffira de choisir le profil <strong>Élève</strong> sur SysGesco pour consulter ses notes, son carnet et ses devoirs.
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  loginAsStudent(createdStudentCredentials.student.id);
                  setCreatedStudentCredentials(null);
                }}
                className="w-full h-11 bg-[#00236f] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Tester et basculer sur son espace élève</span>
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
                  onClick={() => setCreatedStudentCredentials(null)}
                  className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Central Data Export Modal (defaultTab = students) */}
      <DataExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        defaultTab="students"
      />
    </div>
  );
};
