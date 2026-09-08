import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  School,
  GraduationCap,
  Wallet,
  TrendingUp,
  AlertTriangle,
  Download,
  PlusCircle,
  FileEdit,
  Building2,
  Calendar,
  CheckCircle2,
  PieChart,
  Clock,
  BarChart3,
  Award,
  BookOpen,
  BookMarked,
  ClipboardList,
  Check,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  UserCheck,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    activeInstitution,
    currentUser,
    currentRole,
    students,
    classes,
    teachers,
    payments,
    grades,
    homework,
    attendance,
    timetable,
    activityLogs,
    setCurrentView,
    exportBackupJSON,
    showToast,
  } = useApp();

  // Financial Metrics Calculation
  const totalTuitionDue = students.reduce((acc, s) => acc + (s.tuitionTotal || 0), 0);
  const totalCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const remainingToCollect = Math.max(0, totalTuitionDue - totalCollected);
  const recoveryRate =
    totalTuitionDue > 0 ? ((totalCollected / totalTuitionDue) * 100).toFixed(1) : '100.0';

  // Payment methods breakdown
  const paymentBreakdown = payments.reduce((acc, p) => {
    acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + p.amount;
    return acc;
  }, {} as Record<string, number>);

  const methodPercentages: Record<string, number> = {
    Wave: totalCollected > 0 ? Math.round(((paymentBreakdown['Wave'] || 0) / totalCollected) * 100) : 38,
    'Orange Money':
      totalCollected > 0 ? Math.round(((paymentBreakdown['Orange Money'] || 0) / totalCollected) * 100) : 28,
    Espèce: totalCollected > 0 ? Math.round(((paymentBreakdown['Espèce'] || 0) / totalCollected) * 100) : 20,
    'MTN Money':
      totalCollected > 0 ? Math.round(((paymentBreakdown['MTN Money'] || 0) / totalCollected) * 100) : 10,
    'Moov Money':
      totalCollected > 0 ? Math.round(((paymentBreakdown['Moov Money'] || 0) / totalCollected) * 100) : 4,
  };

  // Find linked entities if any
  const currentTeacher = useMemo(() => {
    return (
      teachers.find((t) => t.id === currentUser?.linkedEntityId) ||
      teachers[0] || {
        id: 'tch-1',
        firstName: 'Moussa',
        lastName: 'Traoré',
        subject: 'Mathématiques',
        phone: '+225 07 12 34 56',
        classesAssigned: ['3ème A', '1ère D'],
      }
    );
  }, [teachers, currentUser]);

  const currentStudent = useMemo(() => {
    return (
      students.find((s) => s.id === currentUser?.linkedEntityId) ||
      students[0] || {
        id: 'std-1',
        matricule: 'CI-2026-0012',
        firstName: 'Kouassi Ange',
        lastName: 'Kouamé',
        className: '3ème A',
        classId: classes[0]?.id || 'cls-3a',
        tuitionTotal: 185000,
        tuitionPaid: 185000,
      }
    );
  }, [students, currentUser, classes]);

  // ==========================================
  // 1. VUE PROFESSEUR (Teacher Dashboard)
  // ==========================================
  if (currentRole === 'teacher') {
    const teacherClasses = classes.filter((c) =>
      currentTeacher.classesAssigned ? currentTeacher.classesAssigned.includes(c.name) : true
    );
    const teacherStudents = students.filter((s) =>
      teacherClasses.some((c) => c.id === s.classId)
    );

    return (
      <div className="space-y-4 pb-12">
        {/* Banner Teacher */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase bg-white/20 px-2.5 py-0.5 rounded-full font-mono">
                  Espace Enseignant
                </span>
                <span className="text-xs text-emerald-200">
                  Matière : {currentTeacher.subject || 'Mathématiques'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Bonjour, M. {currentUser?.lastName || currentTeacher.lastName} {currentUser?.firstName || currentTeacher.firstName}
              </h1>
              <p className="text-xs text-emerald-100 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 opacity-80" />
                <span>{activeInstitution?.name}</span>
                <span>•</span>
                <span>Année {activeInstitution?.academicYear}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold bg-white text-emerald-900 px-3 py-1.5 rounded-xl shadow-xs">
                {teacherClasses.length || 3} Classes Assignées
              </span>
            </div>
          </div>
        </div>

        {/* Quick Teacher Actions */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Actions Rapides Enseignant
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <button
              onClick={() => setCurrentView('attendance')}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-700 text-white shadow-xs hover:bg-emerald-800 active:scale-[0.98] transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <ClipboardList className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-tight">Faire l'Appel</p>
                <p className="text-[10px] text-emerald-100 truncate">Registre du jour</p>
              </div>
            </button>

            <button
              onClick={() => setCurrentView('grades')}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1e3a5f] text-white shadow-xs hover:bg-[#1e3a8a] active:scale-[0.98] transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <FileEdit className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-tight">Saisir des Notes</p>
                <p className="text-[10px] text-blue-100 truncate">Barème /20</p>
              </div>
            </button>

            <button
              onClick={() => setCurrentView('homework')}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-xs hover:bg-slate-50 active:scale-[0.98] transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <BookMarked className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-tight">Donner un Devoir</p>
                <p className="text-[10px] text-slate-500 truncate">Date d'échéance</p>
              </div>
            </button>

            <button
              onClick={() => setCurrentView('timetable')}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-xs hover:bg-slate-50 active:scale-[0.98] transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1e3a5f] flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-tight">Mon Emploi du Temps</p>
                <p className="text-[10px] text-slate-500 truncate">Créneaux horaires</p>
              </div>
            </button>

            <button
              onClick={() => setCurrentView('bulletins')}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-xs hover:bg-slate-50 active:scale-[0.98] transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-tight">Bulletins</p>
                <p className="text-[10px] text-slate-500 truncate">Génération PDF</p>
              </div>
            </button>
          </div>
        </div>

        {/* Teacher KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Classes Suivies</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{teacherClasses?.length || 3}</div>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
              {((teacherClasses || []).map((c) => c.name).slice(0, 2).join(', ')) || '3ème A, 1ère D'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Élèves</span>
            <div className="text-2xl font-extrabold text-[#1e3a5f] mt-1">{teacherStudents.length || 78}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Sur l'ensemble des niveaux</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Devoirs en Cours</span>
            <div className="text-2xl font-extrabold text-amber-700 mt-1">3</div>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">À corriger cette semaine</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Taux Présence Cours</span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">96.8%</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Assiduité satisfaisante</p>
          </div>
        </div>

        {/* Courses of the day */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Emploi du Temps du Jour</h3>
            </div>
            <button
              onClick={() => setCurrentView('timetable')}
              className="text-xs text-emerald-700 font-bold hover:underline"
            >
              Voir la semaine complète &rarr;
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg">
                  08h00 - 10h00
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900">3ème A • Mathématiques</p>
                  <p className="text-[11px] text-slate-500">Salle 12 • Chapitre : Théorème de Thalès</p>
                </div>
              </div>
              <button
                onClick={() => setCurrentView('attendance')}
                className="text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
              >
                Faire l'appel
              </button>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-blue-50 text-[#1e3a5f] px-2.5 py-1 rounded-lg">
                  10h15 - 12h15
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900">1ère D • Mathématiques</p>
                  <p className="text-[11px] text-slate-500">Salle 04 • Limites et Continuité</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                À venir
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. VUE ÉLÈVE (Student Dashboard)
  // ==========================================
  if (currentRole === 'student') {
    return (
      <div className="space-y-4 pb-12">
        {/* Banner Student */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e3a5f] to-blue-900 text-white p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase bg-white/20 px-2.5 py-0.5 rounded-full font-mono">
                  Espace Élève
                </span>
                <span className="text-xs text-blue-200">
                  Matricule : {currentStudent.matricule}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {currentStudent.firstName} {currentStudent.lastName}
              </h1>
              <p className="text-xs text-blue-100 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 opacity-80" />
                <span>Classe : <strong>{currentStudent.className}</strong></span>
                <span>•</span>
                <span>{activeInstitution?.name}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold bg-white text-[#1e3a5f] px-3 py-1.5 rounded-xl shadow-xs">
                Année {activeInstitution?.academicYear}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Student Actions */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Mes Outils Scolaires
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <button
              onClick={() => setCurrentView('grades')}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1e3a5f] text-white shadow-xs hover:bg-[#1e3a8a] active:scale-[0.98] transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-tight">Mes Notes</p>
                <p className="text-[10px] text-blue-100 truncate">Carnet d'évaluations</p>
              </div>
            </button>

            <button
              onClick={() => setCurrentView('bulletins')}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-700 text-white shadow-xs hover:bg-purple-800 active:scale-[0.98] transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-tight">Mon Bulletin</p>
                <p className="text-[10px] text-purple-100 truncate">Trimestre 1 officiel</p>
              </div>
            </button>

            <button
              onClick={() => setCurrentView('homework')}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-600 text-white shadow-xs hover:bg-amber-700 active:scale-[0.98] transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <BookMarked className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-tight">Mes Devoirs</p>
                <p className="text-[10px] text-amber-100 truncate">2 à rendre</p>
              </div>
            </button>

            <button
              onClick={() => setCurrentView('timetable')}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-xs hover:bg-slate-50 active:scale-[0.98] transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1e3a5f] flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-tight">Emploi du Temps</p>
                <p className="text-[10px] text-slate-500 truncate">Planning {currentStudent.className}</p>
              </div>
            </button>

            <button
              onClick={() => setCurrentView('cashier')}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-xs hover:bg-slate-50 active:scale-[0.98] transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-tight">Ma Scolarité</p>
                <p className="text-[10px] text-emerald-700 truncate">Reçus & Situation</p>
              </div>
            </button>
          </div>
        </div>

        {/* Student Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between text-amber-600 mb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Moyenne T1</span>
              <Award className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold text-[#1e3a5f] font-mono">15.42 / 20</div>
            <p className="text-[11px] text-emerald-700 font-bold mt-0.5">2e de la classe • Bien</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between text-emerald-600 mb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Assiduité</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-700 font-mono">98.5%</div>
            <p className="text-[11px] text-slate-500 mt-0.5">0 absence non justifiée</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between text-amber-600 mb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Devoirs à faire</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold text-amber-700 font-mono">2</div>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">Pour cette semaine</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between text-emerald-600 mb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Scolarité</span>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-700 font-mono">Soldée</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Reste à payer : 0 FCFA</p>
          </div>
        </div>

        {/* Homework list for student */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Devoirs à Rendre</h3>
            </div>
            <button
              onClick={() => setCurrentView('homework')}
              className="text-xs text-[#1e3a5f] font-bold hover:underline"
            >
              Ouvrir le cahier de textes &rarr;
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="py-2.5 flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1e3a5f] uppercase">
                  Mathématiques
                </span>
                <p className="text-xs font-bold text-slate-900 mt-1">
                  Exercices 12 à 15 page 84 (Théorème de Thalès)
                </p>
                <p className="text-[11px] text-slate-500">À rendre le Jeudi 22 Octobre 2026</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold shrink-0">
                Dans 2 jours
              </span>
            </div>

            <div className="py-2.5 flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 uppercase">
                  Français
                </span>
                <p className="text-xs font-bold text-slate-900 mt-1">
                  Dissertation : La poésie engagée au XXe siècle
                </p>
                <p className="text-[11px] text-slate-500">À rendre le Samedi 24 Octobre 2026</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold shrink-0">
                Dans 4 jours
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. VUE PARENT D'ÉLÈVE (Parent Dashboard)
  // ==========================================
  if (currentRole === 'parent') {
    return (
      <div className="space-y-4 pb-12">
        {/* Banner Parent */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase bg-white/20 px-2.5 py-0.5 rounded-full font-mono">
                  Portail Famille
                </span>
                <span className="text-xs text-purple-200">
                  Élève suivi : {currentStudent.firstName} {currentStudent.lastName}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Espace Parent • Famille Kouamé
              </h1>
              <p className="text-xs text-purple-100 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 opacity-80" />
                <span>Classe : <strong>{currentStudent.className}</strong></span>
                <span>•</span>
                <span>{activeInstitution?.name}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold bg-white text-purple-900 px-3 py-1.5 rounded-xl shadow-xs">
                Année {activeInstitution?.academicYear}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Parent Actions */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Accès Rapides Famille
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <button
              onClick={() => setCurrentView('cashier')}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-700 text-white shadow-xs hover:bg-emerald-800 active:scale-[0.98] transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-tight">Payer Scolarité</p>
                <p className="text-[10px] text-emerald-100 truncate">Wave / OM en ligne</p>
              </div>
            </button>

            <button
              onClick={() => setCurrentView('bulletins')}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-700 text-white shadow-xs hover:bg-purple-800 active:scale-[0.98] transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-tight">Bulletin Officiel</p>
                <p className="text-[10px] text-purple-100 truncate">Notes & Rang</p>
              </div>
            </button>

            <button
              onClick={() => setCurrentView('grades')}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-xs hover:bg-slate-50 active:scale-[0.98] transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1e3a5f] flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-tight">Évaluations</p>
                <p className="text-[10px] text-slate-500 truncate">Notes par matière</p>
              </div>
            </button>

            <button
              onClick={() => setCurrentView('attendance')}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-xs hover:bg-slate-50 active:scale-[0.98] transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <ClipboardList className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-tight">Suivi d'Appel</p>
                <p className="text-[10px] text-slate-500 truncate">Absences & Retards</p>
              </div>
            </button>

            <button
              onClick={() => setCurrentView('homework')}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-xs hover:bg-slate-50 active:scale-[0.98] transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                <BookMarked className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-tight">Cahier de Devoirs</p>
                <p className="text-[10px] text-slate-500 truncate">Vérifier le travail</p>
              </div>
            </button>
          </div>
        </div>

        {/* Parent Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Moyenne Enfant</span>
            <div className="text-2xl font-extrabold text-purple-900 font-mono mt-1">15.42 / 20</div>
            <p className="text-[11px] text-emerald-700 font-bold mt-0.5">Rang : 2e / 38 élèves</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Situation Caisse</span>
            <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">Soldée</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Aucun impayé en cours</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Assiduité</span>
            <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">0 Manquement</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Présence 100% cette semaine</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Devoirs Maison</span>
            <div className="text-2xl font-extrabold text-amber-700 font-mono mt-1">2 Programmés</div>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">Maths & Français</p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 4. VUE CAISSIÈRE (Cashier Dashboard)
  // ==========================================
  if (currentRole === 'cashier') {
    return (
      <div className="space-y-4 pb-12">
        {/* Banner Cashier */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-700 to-amber-900 text-white p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase bg-white/20 px-2.5 py-0.5 rounded-full font-mono">
                  Guichet &amp; Caisse
                </span>
                <span className="text-xs text-amber-200">
                  Opératrice : {currentUser?.firstName} {currentUser?.lastName}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Caisse Scolaire • {activeInstitution?.name}
              </h1>
              <p className="text-xs text-amber-100 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 opacity-80" />
                <span>Session {activeInstitution?.academicYear}</span>
                <span>•</span>
                <span>Recouvrement actif</span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setCurrentView('cashier')}
                className="text-xs font-bold bg-white text-amber-900 px-4 py-2 rounded-xl shadow-xs hover:bg-amber-50"
              >
                + Encaisser un versement
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions Cashier */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => setCurrentView('cashier')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-700 text-white shadow-xs hover:bg-emerald-800 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate leading-tight">Nouvel Encaissement</p>
              <p className="text-[10px] text-emerald-100 truncate">Reçu instantané</p>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('students')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-xs hover:bg-slate-50 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1e3a5f] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate leading-tight">Recherche Élève</p>
              <p className="text-[10px] text-slate-500 truncate">Vérifier le solde</p>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('stats')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-xs hover:bg-slate-50 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate leading-tight">Statistiques Caisse</p>
              <p className="text-[10px] text-slate-500 truncate">Taux de recouvrement</p>
            </div>
          </button>

          <button
            onClick={exportBackupJSON}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-xs hover:bg-slate-50 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate leading-tight">Export Grand Livre</p>
              <p className="text-[10px] text-slate-500 truncate">JSON & CSV</p>
            </div>
          </button>
        </div>

        {/* Cashier KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Encaissé</span>
            <div className="text-3xl font-extrabold text-[#1e3a5f] font-mono">
              {(totalCollected || 0).toLocaleString('fr-FR')} FCFA
            </div>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
              {recoveryRate}% de la scolarité globale
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Reste à Percevoir</span>
            <div className="text-3xl font-extrabold text-rose-700 font-mono">
              {(remainingToCollect || 0).toLocaleString('fr-FR')} FCFA
            </div>
            <p className="text-xs text-slate-500">Relances de scolarité à effectuer</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Paiements Enregistrés</span>
            <div className="text-3xl font-extrabold text-slate-900 font-mono">
              {payments.length} reçus
            </div>
            <p className="text-xs text-emerald-700 font-semibold">Toutes transactions validées</p>
          </div>
        </div>

        {/* Recent receipts */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1e3a5f]" />
              <h3 className="text-sm font-bold text-slate-900">Derniers Encaissements au Guichet</h3>
            </div>
            <button
              onClick={() => setCurrentView('cashier')}
              className="text-xs text-[#1e3a5f] font-bold hover:underline"
            >
              Historique complet &rarr;
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {(payments || []).slice(0, 4).map((pay) => (
              <div key={pay.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {pay.studentName} ({pay.className})
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {pay.receiptNumber} • {pay.paymentMethod}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-emerald-700 font-mono block">
                    +{(pay.amount ?? 0).toLocaleString('fr-FR')} FCFA
                  </span>
                  <span className="text-[10px] text-slate-400">{pay.date.slice(0, 10)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 5. VUE DIRECTION & SUPER ADMIN (Institutional Dashboard)
  // ==========================================
  return (
    <div className="space-y-4 pb-12">
      {/* Institution Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#f2f3ff] border border-blue-100 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                {activeInstitution?.code}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-[11px] font-semibold text-[#1e3a5f]">
                Session {activeInstitution?.academicYear}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1e3a5f] tracking-tight">
              {activeInstitution?.name}
            </h1>
            <p className="text-xs text-slate-600 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Direction : <strong>{activeInstitution?.directorName}</strong></span>
              <span>•</span>
              <span>{activeInstitution?.city}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-blue-100 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-700">Stockage Local Vérifié</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Strip */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Actions Prioritaires Direction
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            onClick={() => setCurrentView('cashier')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-700 text-white shadow-xs hover:bg-emerald-800 active:scale-[0.98] transition-all text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate leading-tight">Encaisser</p>
              <p className="text-[10px] text-emerald-100 truncate">Reçu instantané</p>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('students')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1e3a5f] text-white shadow-xs hover:bg-[#1e3a8a] active:scale-[0.98] transition-all text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate leading-tight">Inscrire Élève</p>
              <p className="text-[10px] text-blue-100 truncate">Matricule auto</p>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('grades')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-xs hover:bg-slate-50 active:scale-[0.98] transition-all text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1e3a5f] flex items-center justify-center shrink-0">
              <FileEdit className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate leading-tight">Saisie Notes</p>
              <p className="text-[10px] text-slate-500 truncate">Calcul auto</p>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('stats')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-blue-200 text-[#1e3a5f] shadow-xs hover:bg-blue-50/60 active:scale-[0.98] transition-all text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#1e3a5f] flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate leading-tight">Statistiques</p>
              <p className="text-[10px] text-slate-500 truncate">Tableau de bord</p>
            </div>
          </button>

          <button
            onClick={exportBackupJSON}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-xs hover:bg-slate-50 active:scale-[0.98] transition-all text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate leading-tight">Sauvegarde</p>
              <p className="text-[10px] text-slate-500 truncate">Export JSON</p>
            </div>
          </button>
        </div>
      </div>

      {/* Proactive Attention Alert Card */}
      <div className="rounded-2xl bg-rose-50 border border-rose-200/80 p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-rose-900">
                3 classes nécessitent votre attention
              </h3>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                Action requise
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-rose-800">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                <span><strong>3ème A :</strong> 7 relances de scolarité non soldées</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                <span><strong>1ère D :</strong> Saisie de notes T1 incomplète en Physique-Chimie (3 devoirs)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                <span><strong>5ème A :</strong> Taux d'assiduité en baisse (81% cette semaine)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Cash Collection Metric */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Finances &amp; Trésorerie Encaissée
            </span>
            <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{recoveryRate}% Recouvré</span>
            </div>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#1e3a5f] tracking-tight font-mono">
              {(totalCollected || 0).toLocaleString('fr-FR')}
            </span>
            <span className="text-sm font-bold text-slate-500">FCFA</span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Number(recoveryRate))}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 pt-0.5">
              <span>
                Reste à recouvrer : <strong className="text-rose-600 font-mono font-bold">{(remainingToCollect || 0).toLocaleString('fr-FR')} FCFA</strong>
              </span>
              <span className="font-semibold text-slate-700 font-mono">
                Total dû : {(totalTuitionDue || 0).toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>
        </div>

        {/* Count KPI Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#1e3a5f]">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Élèves</span>
              <Users className="w-4 h-4" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-extrabold text-slate-900">{students.length}</div>
              <p className="text-[11px] text-emerald-700 font-semibold">100% Inscrits</p>
            </div>
            <span className="text-[10px] text-slate-400">Dossiers conformes</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Classes</span>
              <School className="w-4 h-4" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-extrabold text-slate-900">{classes.length}</div>
              <p className="text-[11px] text-slate-600 font-medium">6ème à Terminale</p>
            </div>
            <span className="text-[10px] text-slate-400">{teachers.length} Professeurs</span>
          </div>
        </div>
      </div>

      {/* Payment Methods Distribution (Mobile Money & Cash) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#1e3a5f]" />
            <h3 className="text-sm font-bold text-slate-900">Répartition des Règlements (Canaux)</h3>
          </div>
          <span className="text-xs text-slate-400">Temps réel</span>
        </div>

        {/* Multi-segment Gauge */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
          <div className="bg-[#1e3a8a]" style={{ width: `${methodPercentages['Wave']}%` }} title="Wave"></div>
          <div className="bg-amber-600" style={{ width: `${methodPercentages['Orange Money']}%` }} title="Orange Money"></div>
          <div className="bg-emerald-600" style={{ width: `${methodPercentages['Espèce']}%` }} title="Espèces"></div>
          <div className="bg-yellow-500" style={{ width: `${methodPercentages['MTN Money']}%` }} title="MTN Money"></div>
          <div className="bg-blue-400" style={{ width: `${methodPercentages['Moov Money']}%` }} title="Moov Money"></div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-xs">
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
            <span className="w-2.5 h-2.5 rounded bg-[#1e3a8a] shrink-0"></span>
            <div>
              <p className="font-bold text-slate-800">Wave</p>
              <p className="text-[10px] text-slate-500">{methodPercentages['Wave']}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
            <span className="w-2.5 h-2.5 rounded bg-amber-600 shrink-0"></span>
            <div>
              <p className="font-bold text-slate-800">Orange Money</p>
              <p className="text-[10px] text-slate-500">{methodPercentages['Orange Money']}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
            <span className="w-2.5 h-2.5 rounded bg-emerald-600 shrink-0"></span>
            <div>
              <p className="font-bold text-slate-800">Espèces</p>
              <p className="text-[10px] text-slate-500">{methodPercentages['Espèce']}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
            <span className="w-2.5 h-2.5 rounded bg-yellow-500 shrink-0"></span>
            <div>
              <p className="font-bold text-slate-800">MTN Money</p>
              <p className="text-[10px] text-slate-500">{methodPercentages['MTN Money']}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
            <span className="w-2.5 h-2.5 rounded bg-blue-400 shrink-0"></span>
            <div>
              <p className="font-bold text-slate-800">Moov Money</p>
              <p className="text-[10px] text-slate-500">{methodPercentages['Moov Money']}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Operational Activity Stream */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1e3a5f]" />
            <h3 className="text-sm font-bold text-slate-900">Journal d'Activité Récente</h3>
          </div>
          <span className="text-xs text-emerald-700 font-semibold">Synchronisé en local</span>
        </div>

        <div className="divide-y divide-slate-100">
          {(payments || []).slice(0, 4).map((pay) => (
            <div key={pay.id} className="py-2.5 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {pay.studentName} ({pay.className})
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {pay.receiptNumber} • {pay.paymentMethod} • Caissière: {pay.cashierName}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-extrabold text-emerald-700 font-mono block">
                  +{(pay.amount ?? 0).toLocaleString('fr-FR')} FCFA
                </span>
                <span className="text-[10px] text-slate-400">{pay.date.slice(11, 16)}</span>
              </div>
            </div>
          ))}

          {(activityLogs || []).slice(0, 2).map((log) => (
            <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1e3a5f] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{log.action}</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {log.element} • {log.userName}
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
