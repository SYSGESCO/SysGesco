import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { GradeEntry } from '../../types';
import {
  BookOpen,
  Save,
  CheckCircle2,
  TrendingUp,
  Award,
  AlertCircle,
  FileSpreadsheet,
  Printer,
  Calendar,
  Layers,
  Download,
} from 'lucide-react';
import { DataExportModal } from '../common/DataExportModal';

export const GradesView: React.FC = () => {
  const {
    classes,
    students,
    subjects,
    grades,
    saveEvaluationGrades,
    showToast,
    currentRole,
    currentUser,
    setCurrentView,
  } = useApp();

  const [forceTeacherMode, setForceTeacherMode] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'cls-3a');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sub-math');
  const [selectedTerm, setSelectedTerm] = useState<'T1' | 'T2' | 'T3'>('T1');
  const [evaluationTitle, setEvaluationTitle] = useState('Devoir Surveillé N°1');
  const [evaluationType, setEvaluationType] = useState('Devoir');
  const [coefficient, setCoefficient] = useState<number>(3);
  const [evaluationDate, setEvaluationDate] = useState('2026-10-18');

  // Filter students in selected class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Local state for grade entries in current session
  const [entries, setEntries] = useState<Record<string, { value: number | ''; status: string; comment: string }>>(() => {
    const initial: Record<string, { value: number | ''; status: string; comment: string }> = {};
    for (const s of classStudents) {
      initial[s.id] = { value: 14, status: 'present', comment: 'Bon travail' };
    }
    return initial;
  });

  // Re-sync when class or subject changes
  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    const newStudents = students.filter((s) => s.classId === classId);
    const newEntries: Record<string, { value: number | ''; status: string; comment: string }> = {};
    for (const s of newStudents) {
      // Check if existing grade in context
      const existing = grades.find(
        (g) =>
          g.studentId === s.id &&
          g.subjectId === selectedSubjectId &&
          g.term === selectedTerm &&
          g.evaluationTitle === evaluationTitle
      );
      newEntries[s.id] = {
        value: existing ? existing.value : 12,
        status: existing?.status || 'present',
        comment: existing?.comment || 'Travail régulier',
      };
    }
    setEntries(newEntries);
  };

  const handleGradeChange = (studentId: string, valStr: string) => {
    if (valStr === '') {
      setEntries((prev) => ({
        ...prev,
        [studentId]: { ...prev[studentId], value: '' },
      }));
      return;
    }
    const num = parseFloat(valStr);
    if (isNaN(num)) return;
    const clamped = Math.max(0, Math.min(20, num));
    setEntries((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], value: clamped },
    }));
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        value: status === 'absent_unjustified' ? 0 : prev[studentId]?.value || 0,
      },
    }));
  };

  const handleCommentChange = (studentId: string, comment: string) => {
    setEntries((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], comment },
    }));
  };

  // Dynamic Statistics
  const validValues = useMemo(() => {
    return (Object.values(entries) as { value: number | ''; status: string; comment: string }[])
      .map((e) => e.value)
      .filter((v): v is number => typeof v === 'number' && !isNaN(v));
  }, [entries]);

  const stats = useMemo(() => {
    if (validValues.length === 0) {
      return { avg: '0.00', max: '0.00', min: '0.00', passRate: '0.0' };
    }
    const sum = validValues.reduce((a, b) => a + b, 0);
    const avg = (sum / validValues.length).toFixed(2);
    const max = Math.max(...validValues).toFixed(2);
    const min = Math.min(...validValues).toFixed(2);
    const passed = validValues.filter((v) => v >= 10).length;
    const passRate = ((passed / validValues.length) * 100).toFixed(1);
    return { avg, max, min, passRate };
  }, [validValues]);

  const handleSaveGrades = async () => {
    const list: GradeEntry[] = classStudents.map((s) => {
      const entry = entries[s.id] || { value: 10, status: 'present', comment: '' };
      return {
        id: `grd-${s.id}-${selectedSubjectId}-${Date.now()}`,
        institutionId: s.institutionId,
        studentId: s.id,
        studentMatricule: s.matricule,
        studentName: `${s.lastName} ${s.firstName}`,
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        evaluationTitle,
        evaluationType,
        term: selectedTerm,
        date: evaluationDate,
        coefficient,
        maxScore: 20,
        value: typeof entry.value === 'number' ? entry.value : 0,
        status: (entry.status as any) || 'present',
        comment: entry.comment,
      };
    });

    await saveEvaluationGrades(list);
  };

  // Personal Gradebook view for Student & Parent
  if ((currentRole === 'student' || currentRole === 'parent') && !forceTeacherMode) {
    const studentUser =
      students.find((s) => s.id === currentUser?.linkedEntityId) ||
      students[0] || {
        id: 'std-1',
        matricule: 'CI-2026-0012',
        firstName: 'Kouassi Ange',
        lastName: 'Kouamé',
        className: '3ème A',
      };

    const subjectGradesList = [
      { name: 'Mathématiques', coeff: 3, interro: 16.0, devoir: 15.0, avg: 15.33, comment: 'Très bon travail, régulier et rigoureux' },
      { name: 'Français', coeff: 3, interro: 14.5, devoir: 14.0, avg: 14.17, comment: 'Bonne expression écrite, poursuivre ainsi' },
      { name: 'Physique-Chimie', coeff: 2, interro: 17.0, devoir: 16.5, avg: 16.67, comment: 'Excellente démarche d\'analyse scientifique' },
      { name: 'SVT', coeff: 2, interro: 15.0, devoir: 15.5, avg: 15.33, comment: 'Bonne assimilation des cours' },
      { name: 'Histoire-Géographie', coeff: 2, interro: 16.0, devoir: 16.0, avg: 16.0, comment: 'Très attentif et curieux en classe' },
      { name: 'Anglais', coeff: 2, interro: 15.0, devoir: 16.0, avg: 15.67, comment: 'Bonne participation active à l\'oral' },
      { name: 'EPS', coeff: 1, interro: 17.0, devoir: 17.0, avg: 17.0, comment: 'Dynamique et très bon esprit d\'équipe' },
    ];

    const totalCoeff = subjectGradesList.reduce((acc, s) => acc + s.coeff, 0);
    const totalPoints = subjectGradesList.reduce((acc, s) => acc + s.avg * s.coeff, 0);
    const overallAvg = (totalPoints / totalCoeff).toFixed(2);

    return (
      <div className="space-y-4 pb-12">
        {/* Header Personal Gradebook */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1e3a5f] flex items-center justify-center font-bold text-lg shadow-2xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900">
                    Carnet de Notes &amp; Évaluations
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1e3a5f] uppercase font-mono">
                    Trimestre 1
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Élève : <strong>{studentUser.firstName} {studentUser.lastName}</strong> • Matricule :{' '}
                  <span className="font-mono">{studentUser.matricule}</span> • Classe : <strong>{studentUser.className}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                title="Exporter les notes et bulletins en PDF / Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exporter (PDF / Excel)</span>
              </button>
              <button
                onClick={() => setCurrentView('bulletins')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1e3a5f] text-white text-xs font-semibold shadow-xs hover:bg-[#1e3a8a] transition-all"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Bulletin Officiel</span>
              </button>
              <button
                onClick={() => setForceTeacherMode(true)}
                className="px-2.5 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50"
                title="Afficher la grille de saisie professeur"
              >
                Grille de saisie
              </button>
            </div>
          </div>

          {/* Academic KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Moyenne Générale</span>
              <div className="text-2xl font-extrabold text-[#1e3a5f] font-mono mt-0.5">{overallAvg} / 20</div>
              <span className="text-[10px] text-emerald-700 font-bold">Mention Bien</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Classement</span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">2e <span className="text-sm font-normal text-slate-400">/ 38</span></div>
              <span className="text-[10px] text-slate-500">Rang de la classe</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Points</span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">{totalPoints.toFixed(1)}</div>
              <span className="text-[10px] text-slate-500">Coefficients cumulés : {totalCoeff}</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-[11px] font-bold text-emerald-800 uppercase block">Appréciation Globale</span>
              <div className="text-xs font-bold text-emerald-900 mt-1">Tableau d'Honneur</div>
              <span className="text-[10px] text-emerald-700">Félicitations du Conseil</span>
            </div>
          </div>
        </div>

        {/* Detailed Grades Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Détail des Matières &amp; Évaluations
            </h3>
            <span className="text-xs text-slate-400">Barème officiel /20</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Discipline</th>
                  <th className="py-3 px-3 text-center">Coeff</th>
                  <th className="py-3 px-3 text-center">Interrogation</th>
                  <th className="py-3 px-3 text-center">Devoir Surveillé</th>
                  <th className="py-3 px-3 text-center">Moyenne /20</th>
                  <th className="py-3 px-4">Appréciation de l'Enseignant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjectGradesList.map((sub, i) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{sub.name}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-600">{sub.coeff}</td>
                    <td className="py-3 px-3 text-center font-mono text-slate-700">{sub.interro.toFixed(1)}</td>
                    <td className="py-3 px-3 text-center font-mono text-slate-700">{sub.devoir.toFixed(1)}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-mono font-extrabold text-sm text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg inline-block">
                        {sub.avg.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 italic">{sub.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Header & Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
        {forceTeacherMode && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-xl text-xs">
            <span>Mode Saisie Enseignant activé manuellement.</span>
            <button
              onClick={() => setForceTeacherMode(false)}
              className="font-bold underline hover:text-amber-950"
            >
              Revenir au carnet personnel
            </button>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1e3a5f] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">Saisie &amp; Gestion des Notes</h1>
              <span className="text-[11px] text-slate-500">
                Barème officiel /20 avec calcul automatique de la moyenne
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="h-10 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200/60"
              title="Exporter le Procès-Verbal et relevés de notes en PDF et Excel"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Exporter PV (PDF / Excel)</span>
            </button>

            <button
              onClick={handleSaveGrades}
              className="h-10 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer l'évaluation</span>
            </button>
          </div>
        </div>

        {/* Evaluation Configuration Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Classe</label>
            <select
              value={selectedClassId}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full h-9 px-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Matière</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full h-9 px-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold"
            >
              {(subjects || []).map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} (Coeff {sub.coefficient})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Trimestre</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value as any)}
              className="w-full h-9 px-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold"
            >
              <option value="T1">Trimestre 1</option>
              <option value="T2">Trimestre 2</option>
              <option value="T3">Trimestre 3</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Type</label>
            <select
              value={evaluationType}
              onChange={(e) => setEvaluationType(e.target.value)}
              className="w-full h-9 px-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
            >
              <option value="Interrogation">Interrogation</option>
              <option value="Devoir">Devoir Surveillé</option>
              <option value="Examen Blanc">Examen Blanc</option>
              <option value="TP / Oral">TP / Oral</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Coefficient</label>
            <input
              type="number"
              min="1"
              max="10"
              value={coefficient}
              onChange={(e) => setCoefficient(Number(e.target.value))}
              className="w-full h-9 px-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Date</label>
            <input
              type="date"
              value={evaluationDate}
              onChange={(e) => setEvaluationDate(e.target.value)}
              className="w-full h-9 px-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Summary Statistics Strip (Section 42) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1e3a5f] flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">
              Moyenne Classe
            </span>
            <span className="text-lg font-extrabold text-[#1e3a5f] font-mono">{stats.avg} / 20</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">
              Meilleure Note
            </span>
            <span className="text-lg font-extrabold text-emerald-700 font-mono">{stats.max} / 20</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">
              Plus Basse Note
            </span>
            <span className="text-lg font-extrabold text-rose-600 font-mono">{stats.min} / 20</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">
              Taux Réussite (&gt;=10)
            </span>
            <span className="text-lg font-extrabold text-slate-900 font-mono">{stats.passRate} %</span>
          </div>
        </div>
      </div>

      {/* Interactive Grade Grid */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#1e3a5f]" />
            <h3 className="text-sm font-bold text-slate-900">
              Liste d’évaluation des élèves ({classStudents.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Barème officiel / 20</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-4 w-12">N°</th>
                <th className="py-2.5 px-4">Matricule</th>
                <th className="py-2.5 px-4">Nom &amp; Prénoms</th>
                <th className="py-2.5 px-4 w-32">Statut</th>
                <th className="py-2.5 px-4 w-28 text-center">Note / 20</th>
                <th className="py-2.5 px-4">Appréciation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((student, idx) => {
                const entry = entries[student.id] || {
                  value: 12,
                  status: 'present',
                  comment: '',
                };

                return (
                  <tr key={student.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">{student.matricule}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {student.lastName} {student.firstName}
                    </td>
                    <td className="py-2.5 px-4">
                      <select
                        value={entry.status}
                        onChange={(e) => handleStatusChange(student.id, e.target.value)}
                        className="w-full h-8 px-2 rounded-lg border border-slate-200 text-[11px] bg-white font-medium"
                      >
                        <option value="present">Présent</option>
                        <option value="absent_justified">Abs. Justifiée</option>
                        <option value="absent_unjustified">Abs. Non Justifiée</option>
                        <option value="dispensed">Dispensé</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        max="20"
                        disabled={entry.status === 'dispensed'}
                        value={entry.value}
                        onChange={(e) => handleGradeChange(student.id, e.target.value)}
                        className={`w-20 h-9 px-2 rounded-lg border text-center font-mono font-bold text-sm focus:outline-none transition-all ${
                          typeof entry.value === 'number' && entry.value >= 10
                            ? 'border-emerald-300 text-emerald-800 bg-emerald-50/40 focus:border-emerald-600'
                            : 'border-rose-300 text-rose-700 bg-rose-50/40 focus:border-rose-600'
                        }`}
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        type="text"
                        value={entry.comment}
                        onChange={(e) => handleCommentChange(student.id, e.target.value)}
                        placeholder="Observation du professeur..."
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#1e3a5f]"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DataExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        defaultTab="grades"
      />
    </div>
  );
};
