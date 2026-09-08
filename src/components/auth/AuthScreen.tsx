/**
 * SysGesco - Module d'Authentification & d'Accès Établissement
 * Conforme aux exigences :
 * - Liste des établissements inscrits
 * - Référentiel des villes de Côte d'Ivoire
 * - Communes et quartiers respectifs
 * - Rôle / Statut (Directeur, Caissière, Professeur, Élève, Parent)
 * - Année scolaire
 * - Identifiant & Mot de passe
 * - Inscription complète de l'établissement avec enregistrement de chaque rôle
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  COTE_D_IVOIRE_LOCATIONS,
  getAllCities,
  getCommunesForCity,
  getQuartiersForCommune,
  ROLE_DEFINITIONS,
  ACADEMIC_YEARS,
} from '../../data/coteDIvoireLocations';
import {
  Building2,
  LogIn,
  PlusCircle,
  Rocket,
  ShieldCheck,
  WifiOff,
  Coins,
  Copy,
  Check,
  School,
  ArrowRight,
  ArrowLeft,
  Lock,
  UserCheck,
  MapPin,
  Calendar,
  User,
  GraduationCap,
  Briefcase,
  Users,
  BookOpen,
  Eye,
  EyeOff,
  Search,
  Sparkles,
  ChevronDown,
  Info,
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const AuthScreen: React.FC = () => {
  const { login, registerInstitution, launchDemo, institutionsList, getInstitutionUsers } = useApp();

  // Navigation tab between Login and Register
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // =========================================================================
  // 1. ESPACE CONNEXION (STATE)
  // =========================================================================
  const [selectedInstId, setSelectedInstId] = useState<string>('');
  const [filterCity, setFilterCity] = useState<string>('Toutes les villes');
  const [filterCommune, setFilterCommune] = useState<string>('Toutes les communes');
  const [filterQuartier, setFilterQuartier] = useState<string>('Tous les quartiers');
  const [searchSchoolQuery, setSearchSchoolQuery] = useState<string>('');

  const [selectedRole, setSelectedRole] = useState<UserRole>('direction');
  const [selectedYear, setSelectedYear] = useState<string>('2026-2027');
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('admin123');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [institutionUsers, setInstitutionUsers] = useState<any[]>([]);

  // =========================================================================
  // 2. INSCRIPTION ÉTABLISSEMENT (STATE)
  // =========================================================================
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);
  const [regError, setRegError] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState<boolean>(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Étape 1: Établissement & Territoire
  const [regSchoolName, setRegSchoolName] = useState('');
  const [regSchoolType, setRegSchoolType] = useState('Collège & Lycée');
  const [regCity, setRegCity] = useState('Abidjan');
  const [regCommune, setRegCommune] = useState('Cocody');
  const [regQuartier, setRegQuartier] = useState('Deux-Plateaux');
  const [regAddress, setRegAddress] = useState('');
  const [regPhone, setRegPhone] = useState('+225 ');
  const [regEmail, setRegEmail] = useState('');
  const [regAcademicYear, setRegAcademicYear] = useState('2026-2027');

  // Étape 2: Inscription des 5 rôles requis
  const [activeRegRoleTab, setActiveRegRoleTab] = useState<'direction' | 'cashier' | 'teacher' | 'student' | 'parent'>('direction');

  // Rôle 1 : Direction
  const [dirFullName, setDirFullName] = useState('');
  const [dirPhone, setDirPhone] = useState('');
  const [dirEmail, setDirEmail] = useState('');
  const [dirUsername, setDirUsername] = useState('');
  const [dirPassword, setDirPassword] = useState('');

  // Rôle 2 : Caissière
  const [cashierFullName, setCashierFullName] = useState('');
  const [cashierPhone, setCashierPhone] = useState('');
  const [cashierUsername, setCashierUsername] = useState('');
  const [cashierPassword, setCashierPassword] = useState('');

  // Rôle 3 : Professeur
  const [teacherFullName, setTeacherFullName] = useState('');
  const [teacherSubject, setTeacherSubject] = useState('Mathématiques');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [teacherUsername, setTeacherUsername] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');

  // Rôle 4 : Élève
  const [studentFullName, setStudentFullName] = useState('');
  const [studentMatricule, setStudentMatricule] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentGender, setStudentGender] = useState<'M' | 'F'>('M');

  // Rôle 5 : Parent
  const [parentFullName, setParentFullName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentUsername, setParentUsername] = useState('');
  const [parentPassword, setParentPassword] = useState('');

  // Initial selection of first institution
  useEffect(() => {
    if (institutionsList.length > 0 && !selectedInstId) {
      const defaultInst = institutionsList[0];
      setSelectedInstId(defaultInst.id);
      setSelectedYear(defaultInst.academicYear || '2026-2027');
    }
  }, [institutionsList, selectedInstId]);

  // When selected institution changes, fetch its users for quick autocomplete/hints
  useEffect(() => {
    let isMounted = true;
    if (selectedInstId) {
      getInstitutionUsers(selectedInstId).then((users) => {
        if (isMounted) {
          setInstitutionUsers(users);
        }
      });
    } else {
      setInstitutionUsers([]);
    }
    return () => {
      isMounted = false;
    };
  }, [selectedInstId, getInstitutionUsers]);

  // Update commune and quartier lists when regCity or filterCity changes
  const allCities = useMemo(() => getAllCities(), []);

  // Filtered Communes for Login filter
  const loginFilterCommunes = useMemo(() => {
    if (filterCity === 'Toutes les villes') return [];
    return getCommunesForCity(filterCity);
  }, [filterCity]);

  // Filtered Quartiers for Login filter
  const loginFilterQuartiers = useMemo(() => {
    if (filterCity === 'Toutes les villes' || filterCommune === 'Toutes les communes') return [];
    return getQuartiersForCommune(filterCity, filterCommune);
  }, [filterCity, filterCommune]);

  // Communes for Registration step
  const regCommunes = useMemo(() => {
    return getCommunesForCity(regCity);
  }, [regCity]);

  // Quartiers for Registration step
  const regQuartiers = useMemo(() => {
    return getQuartiersForCommune(regCity, regCommune);
  }, [regCity, regCommune]);

  // Update default commune/quartier on city change in Registration
  const handleRegCityChange = (cityName: string) => {
    setRegCity(cityName);
    const comms = getCommunesForCity(cityName);
    if (comms.length > 0) {
      setRegCommune(comms[0].name);
      setRegQuartier(comms[0].quartiers[0] || '');
    } else {
      setRegCommune('');
      setRegQuartier('');
    }
  };

  const handleRegCommuneChange = (communeName: string) => {
    setRegCommune(communeName);
    const quarts = getQuartiersForCommune(regCity, communeName);
    setRegQuartier(quarts[0] || '');
  };

  // Filtered institutions list based on city, commune, and search query
  const filteredInstitutions = useMemo(() => {
    return institutionsList.filter((inst) => {
      // City filter
      if (filterCity !== 'Toutes les villes') {
        if ((inst.city || '').toLowerCase() !== filterCity.toLowerCase()) {
          return false;
        }
      }
      // Commune filter
      if (filterCommune !== 'Toutes les communes') {
        if ((inst.commune || '').toLowerCase() !== filterCommune.toLowerCase()) {
          return false;
        }
      }
      // Text search
      if (searchSchoolQuery.trim()) {
        const q = searchSchoolQuery.toLowerCase();
        const matchName = inst.name.toLowerCase().includes(q);
        const matchCode = inst.code.toLowerCase().includes(q);
        const matchCity = (inst.city || '').toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchCity) return false;
      }
      return true;
    });
  }, [institutionsList, filterCity, filterCommune, searchSchoolQuery]);

  // Selected Institution Object
  const currentSelectedInstitution = useMemo(() => {
    return institutionsList.find((inst) => inst.id === selectedInstId) || institutionsList[0] || null;
  }, [institutionsList, selectedInstId]);

  // Find users in this institution matching the selected role
  const roleUsersInSelectedSchool = useMemo(() => {
    return institutionUsers.filter((u) => u.role === selectedRole);
  }, [institutionUsers, selectedRole]);

  // Auto-fill demo or default credentials when changing role if institution is demo
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setLoginError(null);

    // Look for a user already registered with this role in the selected school
    const matchingUser = institutionUsers.find((u) => u.role === role);
    if (matchingUser) {
      setUsername(matchingUser.username);
      // If it's a known demo password
      if (matchingUser.passwordHash) {
        setPassword(matchingUser.passwordHash);
      }
    } else {
      // Fallback defaults for demo
      if (role === 'direction') {
        setUsername('admin');
        setPassword('admin123');
      } else if (role === 'cashier') {
        setUsername('caisse');
        setPassword('caisse123');
      } else if (role === 'teacher') {
        setUsername('traore');
        setPassword('prof123');
      } else if (role === 'student') {
        setUsername('ange');
        setPassword('eleve123');
      } else if (role === 'parent') {
        setUsername('parent');
        setPassword('parent123');
      }
    }
  };

  // When an institution is picked from the list, synchronize city/commune and defaults
  const handleInstitutionSelect = (instId: string) => {
    setSelectedInstId(instId);
    setLoginError(null);
    const inst = institutionsList.find((i) => i.id === instId);
    if (inst) {
      if (inst.academicYear) setSelectedYear(inst.academicYear);
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    if (!currentSelectedInstitution) {
      setLoginError('Veuillez sélectionner un établissement inscrit.');
      setLoginLoading(false);
      return;
    }

    try {
      const res = await login(
        currentSelectedInstitution.code,
        username,
        password,
        selectedRole,
        selectedYear
      );
      if (!res.success) {
        setLoginError(res.error || 'Identifiant ou mot de passe incorrect.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Auto-generate smart suggested credentials for registration Step 2
  const generateRoleDefaults = () => {
    const slug = (regSchoolName || 'ecole')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 8);

    if (!dirFullName) setDirFullName('Dr. KOUASSI Jérôme');
    if (!dirPhone) setDirPhone('+225 07 48 22 90 01');
    if (!dirEmail) setDirEmail(`direction@${slug}.ci`);
    if (!dirUsername) setDirUsername(`directeur.${slug}`);
    if (!dirPassword) setDirPassword('dir2026');

    if (!cashierFullName) setCashierFullName('Mme KOFFI Aminata');
    if (!cashierPhone) setCashierPhone('+225 05 06 14 78 20');
    if (!cashierUsername) setCashierUsername(`caisse.${slug}`);
    if (!cashierPassword) setCashierPassword('caisse2026');

    if (!teacherFullName) setTeacherFullName('M. BAMBA Souleymane');
    if (!teacherPhone) setTeacherPhone('+225 01 02 88 44 19');
    if (!teacherSubject) setTeacherSubject('Mathématiques');
    if (!teacherUsername) setTeacherUsername(`prof.${slug}`);
    if (!teacherPassword) setTeacherPassword('prof2026');

    if (!studentFullName) setStudentFullName('DIALLO Fatou');
    if (!studentMatricule) setStudentMatricule(`MAT-${Math.floor(1000 + Math.random() * 9000)}`);
    if (!studentPassword) setStudentPassword('eleve2026');

    if (!parentFullName) setParentFullName('M. DIALLO Mamadou');
    if (!parentPhone) setParentPhone('+225 07 11 22 33 44');
    if (!parentUsername) setParentUsername(`parent.${slug}`);
    if (!parentPassword) setParentPassword('parent2026');
  };

  // Handle Step 1 Next
  const handleStep1Next = () => {
    setRegError(null);
    if (!regSchoolName.trim()) {
      setRegError('Le nom de l’établissement est obligatoire.');
      return;
    }
    if (!regCity) {
      setRegError('Veuillez sélectionner la ville de l’établissement.');
      return;
    }
    generateRoleDefaults();
    setRegStep(2);
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    // Validation of Direction role
    if (!dirFullName.trim() || !dirUsername.trim() || !dirPassword) {
      setRegError('Le rôle Directeur (Nom, Identifiant, Mot de passe) est obligatoire.');
      setActiveRegRoleTab('direction');
      return;
    }

    // Validation of Cashier role
    if (!cashierFullName.trim() || !cashierUsername.trim() || !cashierPassword) {
      setRegError('Le rôle Caissière (Nom, Identifiant, Mot de passe) est obligatoire.');
      setActiveRegRoleTab('cashier');
      return;
    }

    // Validation of Teacher role
    if (!teacherFullName.trim() || !teacherUsername.trim() || !teacherPassword) {
      setRegError('Le rôle Professeur (Nom, Identifiant, Mot de passe) est obligatoire.');
      setActiveRegRoleTab('teacher');
      return;
    }

    // Validation of Student role
    if (!studentFullName.trim() || !studentMatricule.trim() || !studentPassword) {
      setRegError('Le rôle Élève (Nom, Matricule, Mot de passe) est obligatoire.');
      setActiveRegRoleTab('student');
      return;
    }

    // Validation of Parent role
    if (!parentFullName.trim() || !parentUsername.trim() || !parentPassword) {
      setRegError('Le rôle Parent (Nom, Identifiant, Mot de passe) est obligatoire.');
      setActiveRegRoleTab('parent');
      return;
    }

    setRegLoading(true);
    try {
      const payload = {
        name: regSchoolName,
        type: regSchoolType,
        city: regCity,
        commune: regCommune,
        neighborhood: regQuartier,
        address: regAddress,
        phone: regPhone,
        email: regEmail,
        academicYear: regAcademicYear,
        roles: {
          direction: {
            fullName: dirFullName.trim(),
            phone: dirPhone.trim(),
            email: dirEmail.trim(),
            username: dirUsername.trim(),
            password: dirPassword,
          },
          cashier: {
            fullName: cashierFullName.trim(),
            phone: cashierPhone.trim(),
            username: cashierUsername.trim(),
            password: cashierPassword,
          },
          teacher: {
            fullName: teacherFullName.trim(),
            subject: teacherSubject,
            phone: teacherPhone.trim(),
            username: teacherUsername.trim(),
            password: teacherPassword,
          },
          student: {
            fullName: studentFullName.trim(),
            className: '6ème A',
            matricule: studentMatricule.trim().toUpperCase(),
            password: studentPassword,
            gender: studentGender,
          },
          parent: {
            fullName: parentFullName.trim(),
            phone: parentPhone.trim(),
            username: parentUsername.trim(),
            password: parentPassword,
          },
        },
      };

      const result = await registerInstitution(payload);
      setGeneratedCode(result.institution.code);
      setSelectedInstId(result.institution.id);
      setRegStep(3);
    } catch (err: any) {
      setRegError(err.message || 'Erreur lors de l’inscription de l’établissement.');
    } finally {
      setRegLoading(false);
    }
  };

  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard?.writeText(generatedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[#131b2e] flex flex-col lg:flex-row antialiased">
      {/* LEFT COLUMN (Desktop): Branding, Pitch & KPI Stats matching appmedo design */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] xl:w-[480px] bg-[#1e3a5f] text-white p-10 xl:p-12 shrink-0 select-none shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

        {/* Top: Logo & Title */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#d97706] text-white flex items-center justify-center font-black text-base tracking-wider shadow-md">
              SG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white">SYSGESCO</span>
                <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                  ERP CI
                </span>
              </div>
              <span className="text-xs text-blue-200/80 block font-medium">
                Plateforme multi-établissements
              </span>
            </div>
          </div>
        </div>

        {/* Center: Pitch & Headline */}
        <div className="relative z-10 my-auto py-8 space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
            <GraduationCap className="w-7 h-7 text-amber-400" />
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl xl:text-3xl font-extrabold text-white leading-tight tracking-tight">
              Gestion scolaire simple, rapide et maîtrisée.
            </h1>
            <p className="text-sm text-blue-100/80 leading-relaxed font-normal">
              Gérez élèves, paiements, notes, bulletins et emplois du temps depuis un seul outil. Fonctionne hors connexion. Plusieurs établissements, un seul tableau de bord.
            </p>
          </div>

          {/* 3 Metric Badges */}
          <div className="grid grid-cols-3 gap-2.5 pt-4">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10 text-center">
              <span className="block text-lg font-black text-white">21+</span>
              <span className="text-[11px] text-blue-200 font-medium">Élèves</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10 text-center">
              <span className="block text-lg font-black text-white">7</span>
              <span className="text-[11px] text-blue-200 font-medium">Classes</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10 text-center">
              <span className="block text-lg font-black text-white">8</span>
              <span className="text-[11px] text-blue-200 font-medium">Professeurs</span>
            </div>
          </div>
        </div>

        {/* Bottom: Offline Guarantee */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-blue-200/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>100% Offline-First (Local)</span>
          </div>
          <span className="text-[11px] opacity-70">v2.4 CI</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Form & Multi-Establishment Registration */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-6 px-4 sm:px-8 lg:px-12 overflow-y-auto">
        {/* Mobile Header */}
        <header className="lg:hidden w-full max-w-4xl mx-auto mb-4">
          <div className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#d97706] text-white flex items-center justify-center font-extrabold text-sm tracking-wider">
                SG
              </div>
              <span className="font-extrabold text-base text-[#1e3a5f] tracking-wide">SYSGESCO</span>
            </div>
            <PWAInstallButton compact />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="w-full max-w-4xl mx-auto my-auto py-2">
          {/* Navigation Tabs (Connexion vs Inscription) */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-slate-200/80 p-1 rounded-xl inline-flex gap-1 shadow-inner">
              <button
                id="tab-btn-login"
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'login'
                    ? 'bg-[#1e3a5f] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Espace Connexion</span>
              </button>
              <button
                id="tab-btn-register"
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setRegStep(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'register'
                    ? 'bg-[#1e3a5f] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Inscrire mon établissement</span>
              </button>
            </div>
          </div>

          {/* =================================================================== */}
          {/* 1. ESPACE CONNEXION                                                 */}
          {/* =================================================================== */}
          {activeTab === 'login' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Colonne Gauche : Formulaire de Connexion Strict */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-[#1e3a5f]">
                    Connexion à votre espace dédié
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sélectionnez votre établissement, votre rôle et votre session scolaire
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1e3a5f] flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
              </div>

              {loginError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-medium flex items-start gap-2.5 animate-shake">
                  <div className="w-4 h-4 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    !
                  </div>
                  <div className="leading-relaxed">{loginError}</div>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* 1. LISTE DES ÉTABLISSEMENTS INSCRITS */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Établissement inscrit <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {institutionsList.length} établissement(s) répertorié(s)
                    </span>
                  </div>

                  <div className="relative">
                    <select
                      id="select-institution"
                      value={selectedInstId}
                      onChange={(e) => handleInstitutionSelect(e.target.value)}
                      className="w-full h-11 pl-10 pr-8 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-semibold focus:bg-white focus:border-[#1e3a5f] focus:outline-none transition-all appearance-none cursor-pointer"
                    >
                      {filteredInstitutions.length === 0 && (
                        <option value="">Aucun établissement ne correspond aux filtres</option>
                      )}
                      {filteredInstitutions.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name} ({inst.code}) — {inst.city} {inst.commune ? `• ${inst.commune}` : ''}
                        </option>
                      ))}
                    </select>
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* 2 & 3. LOCALISATION EN CÔTE D'IVOIRE (VILLES, COMMUNES, QUARTIERS) */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <MapPin className="w-3.5 h-3.5 text-[#1e3a5f]" />
                      Localisation Côte d’Ivoire (Filtre géographique)
                    </span>
                    {(filterCity !== 'Toutes les villes' || filterCommune !== 'Toutes les communes') && (
                      <button
                        type="button"
                        onClick={() => {
                          setFilterCity('Toutes les villes');
                          setFilterCommune('Toutes les communes');
                          setFilterQuartier('Tous les quartiers');
                        }}
                        className="text-[10px] text-blue-600 hover:underline font-semibold"
                      >
                        Réinitialiser
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Liste des villes de Côte d'Ivoire */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Ville (Côte d’Ivoire)
                      </label>
                      <select
                        id="select-filter-city"
                        value={filterCity}
                        onChange={(e) => {
                          setFilterCity(e.target.value);
                          setFilterCommune('Toutes les communes');
                          setFilterQuartier('Tous les quartiers');
                        }}
                        className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:border-[#1e3a5f] focus:outline-none"
                      >
                        <option value="Toutes les villes">Toutes les villes (National)</option>
                        {allCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Communes de la ville sélectionnée */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Commune
                      </label>
                      <select
                        id="select-filter-commune"
                        value={filterCommune}
                        onChange={(e) => {
                          setFilterCommune(e.target.value);
                          setFilterQuartier('Tous les quartiers');
                        }}
                        disabled={filterCity === 'Toutes les villes'}
                        className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:border-[#1e3a5f] focus:outline-none disabled:opacity-50"
                      >
                        <option value="Toutes les communes">
                          {filterCity === 'Toutes les villes' ? 'Choisir une ville' : 'Toutes les communes'}
                        </option>
                        {loginFilterCommunes.map((comm) => (
                          <option key={comm.name} value={comm.name}>
                            {comm.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quartiers de la commune sélectionnée */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Quartier
                      </label>
                      <select
                        id="select-filter-quartier"
                        value={filterQuartier}
                        onChange={(e) => setFilterQuartier(e.target.value)}
                        disabled={filterCommune === 'Toutes les communes' || filterCity === 'Toutes les villes'}
                        className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:border-[#1e3a5f] focus:outline-none disabled:opacity-50"
                      >
                        <option value="Tous les quartiers">
                          {filterCommune === 'Toutes les communes' ? 'Choisir une commune' : 'Tous les quartiers'}
                        </option>
                        {loginFilterQuartiers.map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. RÔLE OU STATUT */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Rôle ou Statut dans l’établissement <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {ROLE_DEFINITIONS.map((r) => {
                      const isSelected = selectedRole === r.key;
                      return (
                        <button
                          key={r.key}
                          id={`btn-role-${r.key}`}
                          type="button"
                          onClick={() => handleRoleSelect(r.key)}
                          className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#1e3a5f] bg-[#f2f3ff] ring-2 ring-[#1e3a5f]/20'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-base">
                              {r.key === 'direction' && '🎓'}
                              {r.key === 'cashier' && '💼'}
                              {r.key === 'teacher' && '👨‍🏫'}
                              {r.key === 'student' && '🎒'}
                              {r.key === 'parent' && '👨‍👩‍👧'}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#1e3a5f]" />}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 leading-tight">
                              {r.label}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                              {r.badge.split('&')[0]}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. ANNÉE SCOLAIRE */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Année Scolaire <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="select-academic-year"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full h-11 pl-9 pr-8 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#1e3a5f] focus:outline-none appearance-none cursor-pointer"
                      >
                        {ACADEMIC_YEARS.map((yr) => (
                          <option key={yr} value={yr}>
                            Session {yr}
                          </option>
                        ))}
                      </select>
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* 6. LOGIN / IDENTIFIANT */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Login / Identifiant <span className="text-rose-500">*</span>
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        id="input-login"
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Identifiant ou matricule"
                        className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#1e3a5f] focus:outline-none transition-all"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* 7. MOT DE PASSE */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Mot de passe <span className="text-rose-500">*</span>
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        id="input-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-11 pl-9 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#1e3a5f] focus:outline-none transition-all font-mono"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Suggestions de comptes détectés pour ce rôle dans cet établissement */}
                {roleUsersInSelectedSchool.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                      <Info className="w-3.5 h-3.5 text-[#1e3a5f]" />
                      <span>Comptes {selectedRole} enregistrés :</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {roleUsersInSelectedSchool.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setUsername(u.username);
                            if (u.passwordHash) setPassword(u.passwordHash);
                          }}
                          className="px-2 py-0.5 rounded-md bg-white border border-blue-200 text-[#1e3a5f] text-[10px] font-bold hover:bg-blue-100 transition-colors"
                        >
                          {u.username} ({u.firstName})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bouton de Connexion Principal */}
                <button
                  id="btn-submit-login"
                  type="submit"
                  disabled={loginLoading}
                  className="w-full h-12 bg-[#1e3a5f] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>
                    {loginLoading
                      ? 'Authentification locale...'
                      : `Accéder à l'espace ${
                          ROLE_DEFINITIONS.find((r) => r.key === selectedRole)?.label || 'Dédié'
                        }`}
                  </span>
                </button>
              </form>
            </div>

            {/* Colonne Droite : Carte Établissement Actuel & Découverte */}
            <div className="lg:col-span-4 space-y-4">
              {/* Carte Établissement Sélectionné */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Établissement sélectionné
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1e3a5f]">
                    {currentSelectedInstitution?.type || 'Scolaire'}
                  </span>
                </div>

                {currentSelectedInstitution ? (
                  <div className="space-y-2">
                    <h2 className="text-base font-bold text-slate-900 leading-snug">
                      {currentSelectedInstitution.name}
                    </h2>
                    <div className="text-xs text-slate-500 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#1e3a5f] bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {currentSelectedInstitution.code}
                        </span>
                        <span>{currentSelectedInstitution.academicYear}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {currentSelectedInstitution.city}
                          {currentSelectedInstitution.commune ? `, ${currentSelectedInstitution.commune}` : ''}
                          {currentSelectedInstitution.neighborhood ? ` (${currentSelectedInstitution.neighborhood})` : ''}
                        </span>
                      </div>
                      {currentSelectedInstitution.directorName && (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Directeur : {currentSelectedInstitution.directorName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Aucun établissement sélectionné.</p>
                )}
              </div>

              {/* Raccourci Démo Immédiate */}
              <div className="bg-gradient-to-br from-[#f2f3ff] to-[#eaedff] border border-blue-100 rounded-3xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Accès Démonstration
                    </span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    DEMO CI
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Explorez immédiatement l'établissement virtuel (St. Joseph Abidjan) avec tous ses rôles pré-remplis :
                </p>

                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => launchDemo('direction')}
                    className="p-2 bg-white rounded-xl text-left border border-slate-200/80 hover:border-[#1e3a5f] transition-all"
                  >
                    <div className="font-bold text-[#1e3a5f]">Directeur</div>
                    <div className="text-[10px] text-slate-400">admin / admin123</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => launchDemo('cashier')}
                    className="p-2 bg-white rounded-xl text-left border border-slate-200/80 hover:border-amber-700 transition-all"
                  >
                    <div className="font-bold text-amber-800">Caissière</div>
                    <div className="text-[10px] text-slate-400">caisse / caisse123</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => launchDemo('teacher')}
                    className="p-2 bg-white rounded-xl text-left border border-slate-200/80 hover:border-blue-700 transition-all"
                  >
                    <div className="font-bold text-blue-800">Professeur</div>
                    <div className="text-[10px] text-slate-400">traore / prof123</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => launchDemo('student')}
                    className="p-2 bg-white rounded-xl text-left border border-slate-200/80 hover:border-emerald-700 transition-all"
                  >
                    <div className="font-bold text-emerald-800">Élève</div>
                    <div className="text-[10px] text-slate-400">ange / eleve123</div>
                  </button>
                </div>
              </div>

              {/* Raccourci Inscription */}
              <div className="p-4 rounded-3xl bg-white border border-slate-200/80 space-y-2 text-center">
                <p className="text-xs text-slate-600">
                  Votre école n'est pas encore inscrite dans le système local ?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setRegStep(1);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1e3a5f] font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Créer un nouvel établissement</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 2. INSCRIPTION ÉTABLISSEMENT AVEC ENREGISTREMENT DE CHAQUE RÔLE     */}
        {/* =================================================================== */}
        {activeTab === 'register' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
            {/* Header Inscription */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Inscription d’un nouvel établissement
                  </h2>
                  <p className="text-xs text-slate-500">
                    Chaque rôle (Directeur, Caissière, Professeur, Élève, Parent) sera enregistré
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                Retour connexion
              </button>
            </div>

            {/* Stepper */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <div className={`h-1.5 rounded-full ${regStep >= 1 ? 'bg-[#1e3a5f]' : 'bg-slate-200'}`}></div>
                <span className="text-[10px] font-bold text-slate-500 block text-center">1. Établissement</span>
              </div>
              <div className="space-y-1">
                <div className={`h-1.5 rounded-full ${regStep >= 2 ? 'bg-[#1e3a5f]' : 'bg-slate-200'}`}></div>
                <span className="text-[10px] font-bold text-slate-500 block text-center">2. Les 5 Rôles</span>
              </div>
              <div className="space-y-1">
                <div className={`h-1.5 rounded-full ${regStep === 3 ? 'bg-emerald-600' : 'bg-slate-200'}`}></div>
                <span className="text-[10px] font-bold text-slate-500 block text-center">3. Confirmation</span>
              </div>
            </div>

            {regError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-medium leading-relaxed">
                {regError}
              </div>
            )}

            {/* ÉTAPE 1 : IDENTITÉ & LOCALISATION EN CÔTE D'IVOIRE */}
            {regStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#1e3a5f] uppercase tracking-wider block">
                    Étape 1 — Coordonnées de l'établissement
                  </span>
                  <span className="text-[11px] text-slate-400">Informations administratives</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom de l’établissement scolaire <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-reg-school-name"
                    type="text"
                    required
                    value={regSchoolName}
                    onChange={(e) => setRegSchoolName(e.target.value)}
                    placeholder="ex: Collège Moderne de l'Avenir"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-[#1e3a5f] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Type d'établissement <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={regSchoolType}
                      onChange={(e) => setRegSchoolType(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-[#1e3a5f] focus:outline-none"
                    >
                      <option value="Collège">Collège</option>
                      <option value="Lycée">Lycée</option>
                      <option value="Collège & Lycée">Collège &amp; Lycée</option>
                      <option value="Établissement primaire">Établissement primaire</option>
                      <option value="Groupe Scolaire (Maternelle, Primaire, Secondaire)">
                        Groupe Scolaire complet
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Année Scolaire de démarrage <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={regAcademicYear}
                      onChange={(e) => setRegAcademicYear(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-[#1e3a5f] focus:outline-none"
                    >
                      {ACADEMIC_YEARS.map((y) => (
                        <option key={y} value={y}>
                          Session {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Localisation Côte d'Ivoire */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-[#1e3a5f]" />
                    Localisation en Côte d’Ivoire
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Ville <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={regCity}
                        onChange={(e) => handleRegCityChange(e.target.value)}
                        className="w-full h-10 px-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#1e3a5f] focus:outline-none"
                      >
                        {allCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Commune <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={regCommune}
                        onChange={(e) => handleRegCommuneChange(e.target.value)}
                        className="w-full h-10 px-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#1e3a5f] focus:outline-none"
                      >
                        {regCommunes.map((comm) => (
                          <option key={comm.name} value={comm.name}>
                            {comm.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Quartier
                      </label>
                      <select
                        value={regQuartier}
                        onChange={(e) => setRegQuartier(e.target.value)}
                        className="w-full h-10 px-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#1e3a5f] focus:outline-none"
                      >
                        {regQuartiers.map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                      Adresse géographique ou repère
                    </label>
                    <input
                      type="text"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder="ex: Boulevard des Martyrs, près de la pharmacie"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#1e3a5f] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Téléphone de contact
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+225 27 00 00 00 00"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-[#1e3a5f] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email officiel de l'école
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="direction@ecole.ci"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-[#1e3a5f] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  id="btn-step1-next"
                  type="button"
                  onClick={handleStep1Next}
                  className="w-full h-12 bg-[#1e3a5f] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 mt-2 shadow-sm transition-all"
                >
                  <span>Passer à l'inscription des 5 rôles</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ÉTAPE 2 : CONFIGURATION DES 5 RÔLES (Directeur, Caissière, Professeur, Élève, Parent) */}
            {regStep === 2 && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-[#1e3a5f] uppercase tracking-wider block">
                      Étape 2 — Inscription obligatoire des 5 Rôles
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Chaque profil d'accès aura son compte actif dès la création
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={generateRoleDefaults}
                    className="text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg border border-blue-200 flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Suggestions rapides</span>
                  </button>
                </div>

                {/* Onglets des Rôles */}
                <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-2xl">
                  {ROLE_DEFINITIONS.map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => setActiveRegRoleTab(r.key)}
                      className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        activeRegRoleTab === r.key
                          ? 'bg-white text-[#1e3a5f] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>
                        {r.key === 'direction' && '🎓'}
                        {r.key === 'cashier' && '💼'}
                        {r.key === 'teacher' && '👨‍🏫'}
                        {r.key === 'student' && '🎒'}
                        {r.key === 'parent' && '👨‍👩‍👧'}
                      </span>
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>

                {/* 1. DIRECTEUR */}
                {activeRegRoleTab === 'direction' && (
                  <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/30 space-y-3">
                    <div className="flex items-center gap-2 text-[#1e3a5f] font-bold text-xs">
                      <GraduationCap className="w-4 h-4" />
                      <span>Rôle Directeur — Administrateur Général de l'établissement</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nom complet du Directeur <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={dirFullName}
                        onChange={(e) => setDirFullName(e.target.value)}
                        placeholder="ex: Dr. KOUASSI Jérôme"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#1e3a5f] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Téléphone Directeur <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={dirPhone}
                          onChange={(e) => setDirPhone(e.target.value)}
                          placeholder="+225 07 48 22 90"
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#1e3a5f] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Email Directeur
                        </label>
                        <input
                          type="email"
                          value={dirEmail}
                          onChange={(e) => setDirEmail(e.target.value)}
                          placeholder="directeur@ecole.ci"
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#1e3a5f] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Login Directeur <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={dirUsername}
                          onChange={(e) => setDirUsername(e.target.value)}
                          placeholder="ex: directeur"
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#1e3a5f] focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Mot de passe Directeur <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          value={dirPassword}
                          onChange={(e) => setDirPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#1e3a5f] focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. CAISSIÈRE */}
                {activeRegRoleTab === 'cashier' && (
                  <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50/30 space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <Coins className="w-4 h-4" />
                      <span>Rôle Caissière — Caisse &amp; Écolages (FCFA)</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nom complet de la Caissière / Comptable <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={cashierFullName}
                        onChange={(e) => setCashierFullName(e.target.value)}
                        placeholder="ex: Mme KOFFI Aminata"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#1e3a5f] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Téléphone Caissière
                      </label>
                      <input
                        type="tel"
                        value={cashierPhone}
                        onChange={(e) => setCashierPhone(e.target.value)}
                        placeholder="+225 05 06 14 78 20"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#1e3a5f] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Login Caissière <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={cashierUsername}
                          onChange={(e) => setCashierUsername(e.target.value)}
                          placeholder="ex: caisse"
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#1e3a5f] focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Mot de passe Caissière <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          value={cashierPassword}
                          onChange={(e) => setCashierPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#1e3a5f] focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. PROFESSEUR */}
                {activeRegRoleTab === 'teacher' && (
                  <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/30 space-y-3">
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                      <BookOpen className="w-4 h-4" />
                      <span>Rôle Professeur — Saisie des notes, devoirs &amp; présences</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nom du Professeur référent <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={teacherFullName}
                          onChange={(e) => setTeacherFullName(e.target.value)}
                          placeholder="ex: M. BAMBA Souleymane"
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#1e3a5f] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Matière enseignée <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={teacherSubject}
                          onChange={(e) => setTeacherSubject(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#1e3a5f] focus:outline-none"
                        >
                          <option value="Mathématiques">Mathématiques</option>
                          <option value="Français">Français</option>
                          <option value="Anglais">Anglais LV1</option>
                          <option value="Histoire-Géographie">Histoire-Géographie</option>
                          <option value="Physique-Chimie">Physique-Chimie</option>
                          <option value="SVT">Sciences de la Vie &amp; Terre</option>
                          <option value="Philosophie">Philosophie</option>
                          <option value="EPS">EPS &amp; Sport</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Login Professeur <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={teacherUsername}
                          onChange={(e) => setTeacherUsername(e.target.value)}
                          placeholder="ex: prof_maths"
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#1e3a5f] focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Mot de passe Professeur <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          value={teacherPassword}
                          onChange={(e) => setTeacherPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#1e3a5f] focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. ÉLÈVE */}
                {activeRegRoleTab === 'student' && (
                  <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                      <User className="w-4 h-4" />
                      <span>Rôle Élève — Consultation des bulletins &amp; devoirs</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nom complet de l’Élève <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={studentFullName}
                          onChange={(e) => setStudentFullName(e.target.value)}
                          placeholder="ex: DIALLO Fatou"
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#1e3a5f] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Genre
                        </label>
                        <select
                          value={studentGender}
                          onChange={(e) => setStudentGender(e.target.value as 'M' | 'F')}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#1e3a5f] focus:outline-none"
                        >
                          <option value="F">Féminin (F)</option>
                          <option value="M">Masculin (M)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Matricule / Login Élève <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={studentMatricule}
                          onChange={(e) => setStudentMatricule(e.target.value)}
                          placeholder="ex: MAT-2026-001"
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#1e3a5f] focus:outline-none font-mono uppercase"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Mot de passe Élève <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          value={studentPassword}
                          onChange={(e) => setStudentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#1e3a5f] focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. PARENT */}
                {activeRegRoleTab === 'parent' && (
                  <div className="p-4 rounded-2xl border border-purple-100 bg-purple-50/30 space-y-3">
                    <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                      <Users className="w-4 h-4" />
                      <span>Rôle Parent — Suivi des enfants, notes et reçus de scolarité</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nom complet du Parent tuteur <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={parentFullName}
                        onChange={(e) => setParentFullName(e.target.value)}
                        placeholder="ex: M. DIALLO Mamadou"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#1e3a5f] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Téléphone Parent <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        placeholder="+225 07 11 22 33 44"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#1e3a5f] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Login Parent <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={parentUsername}
                          onChange={(e) => setParentUsername(e.target.value)}
                          placeholder="ex: parent"
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#1e3a5f] focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Mot de passe Parent <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          value={parentPassword}
                          onChange={(e) => setParentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#1e3a5f] focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRegStep(1)}
                    className="w-1/3 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retour</span>
                  </button>
                  <button
                    id="btn-register-all-roles"
                    type="submit"
                    disabled={regLoading}
                    className="w-2/3 h-12 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>
                      {regLoading
                        ? 'Enregistrement de l’école & des 5 rôles...'
                        : 'Enregistrer l’établissement et les 5 rôles'}
                    </span>
                  </button>
                </div>
              </form>
            )}

            {/* ÉTAPE 3 : CONFIRMATION & RÉCAPITULATIF DES ACCÈS */}
            {regStep === 3 && (
              <div className="text-center py-4 space-y-5">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Check className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {regSchoolName} a été inscrit avec succès !
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Les 5 rôles ont été configurés et sont immédiatement utilisables hors-ligne.
                  </p>
                </div>

                {/* Code Box Unique */}
                <div className="bg-[#f2f3ff] border border-blue-200 p-4 rounded-2xl flex flex-col items-center space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Identifiant Établissement Unique
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-mono font-extrabold text-[#1e3a5f] tracking-wider">
                      {generatedCode}
                    </span>
                    <button
                      type="button"
                      onClick={copyCode}
                      className="p-2 rounded-lg bg-white hover:bg-blue-50 text-slate-700 border border-slate-200 shadow-xs active:scale-95 transition-all"
                      title="Copier l'identifiant"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {copiedCode && (
                    <span className="text-[11px] text-emerald-600 font-semibold">
                      Identifiant copié dans le presse-papiers !
                    </span>
                  )}
                </div>

                {/* Tableau récapitulatif des 5 rôles */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2.5">
                  <span className="text-xs font-bold text-slate-700 block">
                    Fiche des comptes d'accès enregistrés :
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <div className="font-bold text-[#1e3a5f] flex items-center gap-1.5">
                        <span>🎓 Directeur</span>
                      </div>
                      <div className="text-slate-600 text-[11px]">Login : <strong>{dirUsername}</strong></div>
                      <div className="text-slate-400 text-[10px] truncate">{dirFullName}</div>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <div className="font-bold text-amber-800 flex items-center gap-1.5">
                        <span>💼 Caissière</span>
                      </div>
                      <div className="text-slate-600 text-[11px]">Login : <strong>{cashierUsername}</strong></div>
                      <div className="text-slate-400 text-[10px] truncate">{cashierFullName}</div>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <div className="font-bold text-blue-800 flex items-center gap-1.5">
                        <span>👨‍🏫 Professeur</span>
                      </div>
                      <div className="text-slate-600 text-[11px]">Login : <strong>{teacherUsername}</strong> ({teacherSubject})</div>
                      <div className="text-slate-400 text-[10px] truncate">{teacherFullName}</div>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <span>🎒 Élève</span>
                      </div>
                      <div className="text-slate-600 text-[11px]">Matricule : <strong>{studentMatricule}</strong></div>
                      <div className="text-slate-400 text-[10px] truncate">{studentFullName}</div>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 sm:col-span-2">
                      <div className="font-bold text-purple-800 flex items-center gap-1.5">
                        <span>👨‍👩‍👧 Parent d'élève</span>
                      </div>
                      <div className="text-slate-600 text-[11px]">Login : <strong>{parentUsername}</strong></div>
                      <div className="text-slate-400 text-[10px] truncate">{parentFullName} ({parentPhone})</div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setUsername(dirUsername);
                    setPassword(dirPassword);
                    setSelectedRole('direction');
                  }}
                  className="w-full h-12 bg-[#1e3a5f] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Se connecter avec cet établissement</span>
                </button>
              </div>
            )}
          </div>
        )}
        </main>

        {/* Footer */}
        <footer className="max-w-4xl mx-auto w-full text-center text-xs text-slate-400 py-3">
          SysGesco ERP Scolaire Côte d’Ivoire • Données stockées localement en toute sécurité
        </footer>
      </div>
    </div>
  );
};
