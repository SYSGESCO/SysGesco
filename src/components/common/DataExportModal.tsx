import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  exportStudentsToExcel,
  exportStudentsToPdf,
  exportGradesToExcel,
  exportGradesToPdf,
  exportCashierToExcel,
  exportCashierToPdf,
} from '../../services/exportService';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  Download,
  Users,
  BookOpen,
  Wallet,
  X,
  CheckCircle2,
  Calendar,
  Filter,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface DataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'students' | 'grades' | 'cashier';
}

export const DataExportModal: React.FC<DataExportModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'students',
}) => {
  const {
    activeInstitution,
    students,
    classes,
    subjects,
    grades,
    payments,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'students' | 'grades' | 'cashier'>(defaultTab);

  // Filters for Students
  const [studentClassId, setStudentClassId] = useState<string>('all');

  // Filters for Grades
  const [gradeClassId, setGradeClassId] = useState<string>(classes[0]?.id || '');
  const [gradeTerm, setGradeTerm] = useState<'T1' | 'T2' | 'T3'>('T1');
  const [gradeSubjectId, setGradeSubjectId] = useState<string>('all');

  // Filters for Cashier
  const [cashierClassId, setCashierClassId] = useState<string>('all');
  const [cashierMethod, setCashierMethod] = useState<string>('all');
  const [cashierStartDate, setCashierStartDate] = useState<string>('');
  const [cashierEndDate, setCashierEndDate] = useState<string>('');

  const [isExporting, setIsExporting] = useState<string | null>(null);

  if (!isOpen || !activeInstitution) return null;

  // Students Preview Stats
  const filteredStudents = studentClassId === 'all'
    ? students
    : students.filter((s) => s.classId === studentClassId);

  // Grades Preview Stats
  const relevantGrades = grades.filter((g) => {
    if (g.classId !== gradeClassId) return false;
    if (g.term !== gradeTerm) return false;
    if (gradeSubjectId !== 'all' && g.subjectId !== gradeSubjectId) return false;
    return true;
  });
  const selectedClassStudents = students.filter((s) => s.classId === gradeClassId);

  // Cashier Preview Stats
  const filteredPayments = payments.filter((p) => {
    if (cashierClassId !== 'all' && p.classId !== cashierClassId) return false;
    if (cashierMethod !== 'all' && p.paymentMethod !== cashierMethod) return false;
    if (cashierStartDate && p.date < cashierStartDate) return false;
    if (cashierEndDate && p.date > `${cashierEndDate} 23:59:59`) return false;
    return true;
  });
  const totalCashAmount = filteredPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

  // --------------------------------------------------------------------------
  // Export Handlers
  // --------------------------------------------------------------------------

  const handleExportStudentsExcel = () => {
    try {
      setIsExporting('students-excel');
      const selectedClass = classes.find((c) => c.id === studentClassId);
      exportStudentsToExcel(students, classes, activeInstitution, {
        classId: studentClassId,
        className: selectedClass?.name,
      });
      showToast(`Export Excel généré : ${filteredStudents.length} élèves exportés`, 'success');
    } catch (err: any) {
      showToast(err.message || "Erreur lors de l'export Excel", 'error');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportStudentsPdf = () => {
    try {
      setIsExporting('students-pdf');
      const selectedClass = classes.find((c) => c.id === studentClassId);
      exportStudentsToPdf(students, classes, activeInstitution, {
        classId: studentClassId,
        className: selectedClass?.name,
      });
      showToast(`Rapport PDF officiel généré : ${filteredStudents.length} élèves`, 'success');
    } catch (err: any) {
      showToast(err.message || "Erreur lors de l'export PDF", 'error');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportGradesExcel = () => {
    try {
      setIsExporting('grades-excel');
      exportGradesToExcel(grades, students, classes, subjects, {
        classId: gradeClassId,
        term: gradeTerm,
        subjectId: gradeSubjectId,
        institution: activeInstitution,
      });
      showToast('Export Excel des notes généré avec succès', 'success');
    } catch (err: any) {
      showToast(err.message || "Erreur lors de l'export Excel", 'error');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportGradesPdf = () => {
    try {
      setIsExporting('grades-pdf');
      exportGradesToPdf(grades, students, classes, subjects, {
        classId: gradeClassId,
        term: gradeTerm,
        subjectId: gradeSubjectId,
        institution: activeInstitution,
      });
      showToast('Procès-Verbal officiel PDF généré', 'success');
    } catch (err: any) {
      showToast(err.message || "Erreur lors de l'export PDF", 'error');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportCashierExcel = () => {
    try {
      setIsExporting('cashier-excel');
      exportCashierToExcel(payments, students, classes, activeInstitution, {
        classId: cashierClassId,
        paymentMethod: cashierMethod,
        startDate: cashierStartDate,
        endDate: cashierEndDate,
      });
      showToast(`Journal de caisse Excel généré (${filteredPayments.length} opérations)`, 'success');
    } catch (err: any) {
      showToast(err.message || "Erreur lors de l'export Excel", 'error');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportCashierPdf = () => {
    try {
      setIsExporting('cashier-pdf');
      exportCashierToPdf(payments, students, classes, activeInstitution, {
        classId: cashierClassId,
        paymentMethod: cashierMethod,
        startDate: cashierStartDate,
        endDate: cashierEndDate,
      });
      showToast('Rapport financier de caisse PDF généré', 'success');
    } catch (err: any) {
      showToast(err.message || "Erreur lors de l'export PDF", 'error');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#00236f] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Centre d'Exportation &amp; Rapports</h2>
              <p className="text-xs text-blue-200">
                Génération instantanée de documents officiels au format PDF et Excel
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-4 border-b border-slate-100 flex gap-2 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'students'
                ? 'border-[#00236f] text-[#00236f]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Fichiers Élèves</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {students.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('grades')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'grades'
                ? 'border-[#00236f] text-[#00236f]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Notes &amp; Procès-Verbaux</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {grades.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cashier')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'cashier'
                ? 'border-[#00236f] text-[#00236f]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Livre de Caisse &amp; Finances</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {payments.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* ========================================================== */}
          {/* TAB 1: STUDENTS                                            */}
          {/* ========================================================== */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 flex items-start gap-3">
                <Users className="w-5 h-5 text-[#00236f] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Exportation des listes d'élèves et état des scolarités
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Comprend le matricule, nom, prénoms, sexe, date de naissance, tuteur légal, contacts, scolarité payée/due, et identifiants d'accès Espace Élève.
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Filtrer par Classe
                  </label>
                  <select
                    value={studentClassId}
                    onChange={(e) => setStudentClassId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:border-[#00236f]"
                  >
                    <option value="all">Toutes les classes ({students.length} élèves)</option>
                    {classes.map((c) => {
                      const count = students.filter((s) => s.classId === c.id).length;
                      return (
                        <option key={c.id} value={c.id}>
                          {c.name} ({count} élèves)
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Élèves sélectionnés :</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      {filteredStudents.length} élèves
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Excel Option */}
                <div className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70 transition-all space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-800">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold">Format Excel (.xlsx)</h5>
                        <span className="text-[10px] text-emerald-700">Tableur éditable &amp; complet</span>
                      </div>
                    </div>
                    <ul className="text-[11px] text-slate-600 mt-3 space-y-1">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Colonnes formatées avec largeurs auto</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Détail complet des règlements et restes</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Compatible Microsoft Excel, Google Sheets</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportStudentsExcel}
                    disabled={isExporting === 'students-excel'}
                    className="w-full h-10 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExporting === 'students-excel' ? 'Exportation...' : 'Télécharger en Excel (.xlsx)'}</span>
                  </button>
                </div>

                {/* PDF Option */}
                <div className="p-4 rounded-xl border-2 border-rose-200 bg-rose-50/40 hover:bg-rose-50/70 transition-all space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-rose-800">
                      <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold">Rapport PDF Imprimable</h5>
                        <span className="text-[10px] text-rose-700">Format Paysage A4 Officiel</span>
                      </div>
                    </div>
                    <ul className="text-[11px] text-slate-600 mt-3 space-y-1">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>En-tête officiel Ministère et Établissement</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Blocs de signatures &amp; pagination certifiée</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Parfait pour affichage et archives physiques</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportStudentsPdf}
                    disabled={isExporting === 'students-pdf'}
                    className="w-full h-10 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExporting === 'students-pdf' ? 'Génération...' : 'Générer le PDF Officiel (.pdf)'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 2: GRADES & PV                                         */}
          {/* ========================================================== */}
          {activeTab === 'grades' && (
            <div className="space-y-4">
              <div className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100 flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Procès-Verbaux de notes et relevés d'évaluations
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Génère des fiches de notes avec coefficients, calcul des points, moyenne générale de classe, taux de réussite et appréciations officielles.
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Classe à exporter <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={gradeClassId}
                    onChange={(e) => setGradeClassId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:border-[#00236f]"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({students.filter((s) => s.classId === c.id).length} élèves)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trimestre
                  </label>
                  <select
                    value={gradeTerm}
                    onChange={(e) => setGradeTerm(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:border-[#00236f]"
                  >
                    <option value="T1">Trimestre 1 (T1)</option>
                    <option value="T2">Trimestre 2 (T2)</option>
                    <option value="T3">Trimestre 3 (T3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Matière
                  </label>
                  <select
                    value={gradeSubjectId}
                    onChange={(e) => setGradeSubjectId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:border-[#00236f]"
                  >
                    <option value="all">Toutes les matières</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} (Coeff {sub.coefficient})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Excel Option */}
                <div className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70 transition-all space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-800">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold">Tableau de Notes Excel (.xlsx)</h5>
                        <span className="text-[10px] text-emerald-700">Pour calculs et archivage</span>
                      </div>
                    </div>
                    <ul className="text-[11px] text-slate-600 mt-3 space-y-1">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Détail par élève avec coefficients et points</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Formules prêtes pour moyennes personnalisées</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportGradesExcel}
                    disabled={isExporting === 'grades-excel'}
                    className="w-full h-10 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExporting === 'grades-excel' ? 'Exportation...' : 'Exporter Relevé Excel (.xlsx)'}</span>
                  </button>
                </div>

                {/* PDF Option */}
                <div className="p-4 rounded-xl border-2 border-rose-200 bg-rose-50/40 hover:bg-rose-50/70 transition-all space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-rose-800">
                      <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold">Procès-Verbal PDF Imprimable</h5>
                        <span className="text-[10px] text-rose-700">Format A4 Portrait Conforme</span>
                      </div>
                    </div>
                    <ul className="text-[11px] text-slate-600 mt-3 space-y-1">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Bandeau statistique : moyenne classe et taux de réussite</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Cadres signatures Professeur &amp; Directeur des Études</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportGradesPdf}
                    disabled={isExporting === 'grades-pdf'}
                    className="w-full h-10 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExporting === 'grades-pdf' ? 'Génération...' : 'Générer le PV Officiel (.pdf)'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 3: CASHIER & FINANCES                                  */}
          {/* ========================================================== */}
          {activeTab === 'cashier' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100 flex items-start gap-3">
                <Wallet className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Journal de caisse, état des recouvrements &amp; paiements
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Historique chronologique certifié des encaissements par mode (Espèce, Wave, OM, MTN), avec identification du caissier et reliquats restants.
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mode de Règlement
                  </label>
                  <select
                    value={cashierMethod}
                    onChange={(e) => setCashierMethod(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:border-[#00236f]"
                  >
                    <option value="all">Tous les modes ({payments.length} reçus)</option>
                    <option value="Espèce">Espèce</option>
                    <option value="Wave">Wave</option>
                    <option value="Orange Money">Orange Money</option>
                    <option value="MTN Money">MTN Money</option>
                    <option value="Moov Money">Moov Money</option>
                    <option value="Virement">Virement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={cashierStartDate}
                    onChange={(e) => setCashierStartDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={cashierEndDate}
                    onChange={(e) => setCashierEndDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium"
                  />
                </div>
              </div>

              {/* Summary Stats */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Transactions sélectionnées : <strong>{filteredPayments.length} reçus</strong>
                </span>
                <span className="text-emerald-700 font-bold font-mono text-sm">
                  Total : {totalCashAmount.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Excel Option */}
                <div className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70 transition-all space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-800">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold">Livre de Caisse Excel (.xlsx)</h5>
                        <span className="text-[10px] text-emerald-700">Pour comptabilité et audit</span>
                      </div>
                    </div>
                    <ul className="text-[11px] text-slate-600 mt-3 space-y-1">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Détail avec N° Reçu, date précise, élève et solde</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Ligne de totalisation automatique des encaissements</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportCashierExcel}
                    disabled={isExporting === 'cashier-excel'}
                    className="w-full h-10 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExporting === 'cashier-excel' ? 'Exportation...' : 'Télécharger Journal Excel (.xlsx)'}</span>
                  </button>
                </div>

                {/* PDF Option */}
                <div className="p-4 rounded-xl border-2 border-rose-200 bg-rose-50/40 hover:bg-rose-50/70 transition-all space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-rose-800">
                      <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold">Journal Caisse PDF Imprimable</h5>
                        <span className="text-[10px] text-rose-700">Format Paysage A4 Officiel</span>
                      </div>
                    </div>
                    <ul className="text-[11px] text-slate-600 mt-3 space-y-1">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Bordereau certifié avec cachets de l'intendant</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Total général certifié et arrêté des écritures</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportCashierPdf}
                    disabled={isExporting === 'cashier-pdf'}
                    className="w-full h-10 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExporting === 'cashier-pdf' ? 'Génération...' : 'Générer le PDF de Caisse (.pdf)'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Établissement : <strong className="text-slate-700">{activeInstitution.name}</strong> • Année : {activeInstitution.academicYear}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
