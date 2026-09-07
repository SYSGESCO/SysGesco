import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  School,
  QrCode,
  Sparkles,
} from 'lucide-react';

export const BulletinsView: React.FC = () => {
  const { activeInstitution, classes, students, subjects, grades, showToast } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'cls-3a');
  const [selectedTerm, setSelectedTerm] = useState<'T1' | 'T2' | 'T3'>('T1');

  // Students in selected class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    classStudents[0]?.id || students[0]?.id || ''
  );

  const selectedStudent = useMemo(() => {
    return (
      students.find((s) => s.id === selectedStudentId) ||
      classStudents[0] ||
      students[0] ||
      null
    );
  }, [students, selectedStudentId, classStudents]);

  const selectedClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  // Compute realistic grades breakdown for the selected student
  const subjectRows = useMemo(() => {
    return (subjects || []).map((sub, index) => {
      // Look up if any real grade exists in context
      const realGrade = grades.find(
        (g) =>
          g.studentId === selectedStudent?.id &&
          g.subjectId === sub.id &&
          g.term === selectedTerm
      );

      // Default deterministic scores based on student id hash for demo realism
      const seed = (selectedStudent?.id.charCodeAt(index % (selectedStudent?.id.length || 1)) || 14) % 7;
      const baseNote = realGrade ? realGrade.value : Math.min(20, Math.max(8, 12 + seed - 1));
      const totalPoints = baseNote * sub.coefficient;

      const appreciations: Record<number, string> = {
        18: 'Excellent travail, continuez ainsi !',
        16: 'Très bon trimestre, travail sérieux et régulier.',
        14: 'Bon travail d’ensemble.',
        12: 'Travail satisfaisant, peut progresser.',
        10: 'Ensemble juste, intensifiez les efforts.',
        8: 'Insuffisant, manque de rigueur.',
      };

      const approxKey = Math.round(baseNote / 2) * 2;
      const appreciation =
        realGrade?.comment ||
        appreciations[approxKey] ||
        (baseNote >= 10 ? 'Travail régulier' : 'Doit redoubler d’efforts');

      return {
        subject: sub,
        grade: baseNote,
        totalPoints,
        classAvg: (12.2 + (index % 3) * 0.4).toFixed(1),
        minNote: (6.5 + (index % 2)).toFixed(1),
        maxNote: (18.5 - (index % 2)).toFixed(1),
        rank: `${(index % 4) + 1}e`,
        appreciation,
      };
    });
  }, [subjects, grades, selectedStudent, selectedTerm]);

  // General Totals
  const totalCoeffs = subjectRows.reduce((acc, r) => acc + r.subject.coefficient, 0);
  const totalPoints = subjectRows.reduce((acc, r) => acc + r.totalPoints, 0);
  const generalAverage = totalCoeffs > 0 ? (totalPoints / totalCoeffs).toFixed(2) : '0.00';
  const classAverage = '13.45';

  const getMention = (avg: number) => {
    if (avg >= 16) return 'Tableau d’Honneur avec Félicitations';
    if (avg >= 14) return 'Tableau d’Honneur avec Encouragements';
    if (avg >= 12) return 'Tableau d’Honneur';
    if (avg >= 10) return 'Passable';
    return 'Avertissement de travail';
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h1 className="text-base font-bold text-slate-900">Bulletins Trimestriels Officiels</h1>
          <p className="text-xs text-slate-500">Mise en page standardisée A4 et calculs pondérés</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Class Selector */}
          <select
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              const firstInClass = students.find((s) => s.classId === e.target.value);
              if (firstInClass) setSelectedStudentId(firstInClass.id);
            }}
            className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.room})
              </option>
            ))}
          </select>

          {/* Student Selector */}
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50"
          >
            {classStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.lastName} {s.firstName} ({s.matricule})
              </option>
            ))}
          </select>

          {/* Term Selector */}
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value as any)}
            className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-[#00236f] bg-blue-50"
          >
            <option value="T1">Trimestre 1</option>
            <option value="T2">Trimestre 2</option>
            <option value="T3">Trimestre 3</option>
          </select>

          {/* Print Button */}
          <button
            onClick={() => window.print()}
            className="h-10 px-4 bg-[#00236f] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer Bulletin A4</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BULLETIN TRIMESTRIEL OFFICIEL A4 (Prêt pour Impression) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-4xl mx-auto space-y-6 text-slate-900 print:shadow-none print:border-0 print:p-0 print:m-0 print:max-w-none">
        {/* En-Tête Officiel République & Établissement */}
        <div className="border-b-2 border-[#00236f] pb-4 flex items-start justify-between gap-4">
          <div className="text-left space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              RÉPUBLIQUE DE CÔTE D'IVOIRE
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">
              Union - Discipline - Travail
            </span>
            <span className="text-xs font-semibold text-slate-700 block">
              MINISTÈRE DE L’ÉDUCATION NATIONALE ET DE L’ALPHABÉTISATION
            </span>
          </div>

          {/* Logo & School Name */}
          <div className="text-center space-y-0.5">
            <img
              src="https://lh3.googleusercontent.com/aida/AEtjO1VOSubVXVMiB4gVuWCdnjJ1-Nh0XjetAyPJKk_ViA8jUlrk8WIoBdeYvHKknQsagq_BFxDRT_KUmkB1XRwgCU4TamdSO4XtZ5Tk4YLqWitohESEtU_Ml9wLDTQS1V7aDbAYZYf8lTnGLInpgb3YTxzLHh3OriGn8kkSnI2x-EdCm4axYHVUj15nQTDohuBPvdnmoiWVI3eAQPzisgxxenNSTeJiwT8FzArg-6W66h4lq3pqHNO7p9OLow"
              alt="Logo"
              className="h-10 mx-auto object-contain mb-1"
            />
            <h2 className="text-base font-extrabold text-[#00236f] uppercase tracking-tight">
              {activeInstitution?.name}
            </h2>
            <p className="text-[11px] text-slate-500 font-mono">
              Code Établissement : {activeInstitution?.code}
            </p>
          </div>

          <div className="text-right space-y-0.5">
            <span className="text-[11px] font-bold text-[#00236f] uppercase block">
              Année Scolaire {activeInstitution?.academicYear}
            </span>
            <span className="text-xs font-extrabold bg-[#00236f] text-white px-2 py-0.5 rounded uppercase inline-block">
              BULLETIN DU {selectedTerm === 'T1' ? '1ER' : selectedTerm === 'T2' ? '2ÈME' : '3ÈME'} TRIMESTRE
            </span>
          </div>
        </div>

        {/* Fiche de Renseignement Élève */}
        {selectedStudent && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#faf8ff] p-3.5 rounded-xl border border-blue-100 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Nom &amp; Prénoms</span>
              <span className="font-extrabold text-slate-900 text-sm">
                {selectedStudent.lastName} {selectedStudent.firstName}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Matricule Élève</span>
              <span className="font-mono font-bold text-[#00236f] text-sm">
                {selectedStudent.matricule}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Classe &amp; Effectif</span>
              <span className="font-bold text-slate-800">
                {selectedClass?.name} ({classStudents.length} élèves)
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Date Naissance</span>
              <span className="font-medium text-slate-700">{selectedStudent.dateOfBirth}</span>
            </div>
          </div>
        )}

        {/* Tableau Central des Notes & Matières */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200">
            <thead>
              <tr className="bg-[#f2f3ff] text-slate-800 border-b border-slate-200 text-[11px] font-bold uppercase">
                <th className="py-2 px-3 border-r border-slate-200">Discipline / Matière</th>
                <th className="py-2 px-2 border-r border-slate-200 text-center w-14">Moy/20</th>
                <th className="py-2 px-2 border-r border-slate-200 text-center w-12">Coeff</th>
                <th className="py-2 px-2 border-r border-slate-200 text-center w-16">Total</th>
                <th className="py-2 px-2 border-r border-slate-200 text-center w-12">Rang</th>
                <th className="py-2 px-2 border-r border-slate-200 text-center w-24">Classe (Min/Max)</th>
                <th className="py-2 px-3">Appréciations des Professeurs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {subjectRows.map((row) => (
                <tr key={row.subject.id} className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-800">
                    {row.subject.name}
                  </td>
                  <td
                    className={`py-2 px-2 border-r border-slate-200 text-center font-mono font-extrabold ${
                      (row.grade ?? 0) >= 10 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {(row.grade ?? 0).toFixed(2)}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-200 text-center font-mono font-semibold text-slate-600">
                    {row.subject.coefficient}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-200 text-center font-mono font-bold text-slate-900">
                    {(row.totalPoints ?? 0).toFixed(2)}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-200 text-center font-mono text-slate-600">
                    {row.rank}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-200 text-center text-[10px] text-slate-500 font-mono">
                    {row.minNote} / {row.maxNote}
                  </td>
                  <td className="py-2 px-3 text-[11px] text-slate-700 italic">
                    {row.appreciation}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Totaux */}
            <tfoot>
              <tr className="bg-[#f2f3ff] font-bold border-t-2 border-[#00236f]">
                <td className="py-2.5 px-3 border-r border-slate-200 uppercase font-extrabold text-slate-900">
                  Total Général
                </td>
                <td className="border-r border-slate-200"></td>
                <td className="py-2.5 px-2 border-r border-slate-200 text-center font-mono font-extrabold text-slate-900">
                  {totalCoeffs}
                </td>
                <td className="py-2.5 px-2 border-r border-slate-200 text-center font-mono font-extrabold text-[#00236f]">
                  {(totalPoints ?? 0).toFixed(2)}
                </td>
                <td colSpan={3} className="py-2.5 px-3 text-right text-xs">
                  Moyenne Générale :{' '}
                  <span className="text-base font-extrabold text-[#00236f] font-mono px-2 py-0.5 bg-white rounded border border-blue-200">
                    {generalAverage} / 20
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Bilan Général & Rangs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border border-slate-200 p-3.5 rounded-xl bg-slate-50/70 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Moyenne &amp; Rang Trimestriel
            </span>
            <p className="font-extrabold text-sm text-[#00236f] font-mono mt-0.5">
              {generalAverage} / 20 •{' '}
              <span className="text-emerald-700">2e sur {classStudents.length} élèves</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Moyenne de la classe : {classAverage} / 20</p>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Mention du Conseil des Maîtres
            </span>
            <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>{getMention(Number(generalAverage))}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Assiduité &amp; Conduite
            </span>
            <p className="text-xs text-slate-700 mt-0.5">
              Absences : <strong>0 heure</strong> • Retards : <strong>0</strong>
            </p>
            <p className="text-[10px] text-emerald-700 font-bold mt-1">Conduite irréprochable</p>
          </div>
        </div>

        {/* Signatures et Cachet */}
        <div className="grid grid-cols-3 gap-4 pt-4 text-center text-xs">
          <div className="space-y-12">
            <span className="font-bold text-slate-700 block">Le Professeur Principal</span>
            <span className="text-[10px] text-slate-400 italic block">Signature &amp; Date</span>
          </div>

          <div className="space-y-12">
            <span className="font-bold text-slate-700 block">Le Parent d'Élève</span>
            <span className="text-[10px] text-slate-400 italic block">Vu et pris connaissance</span>
          </div>

          <div className="space-y-12">
            <span className="font-bold text-[#00236f] block">Le Chef d'Établissement</span>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-slate-800 uppercase">
                {activeInstitution?.directorName}
              </span>
              <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                SysGesco Verified • Sceau officiel
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
