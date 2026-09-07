import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord } from '../../types';
import {
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Clock,
  Save,
  Check,
  Calendar,
  School,
  X,
  Printer,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const {
    classes,
    students,
    attendances,
    recordAttendanceList,
    showToast,
    currentRole,
    currentUser,
  } = useApp();

  const [forceTeacherMode, setForceTeacherMode] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'cls-3a');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedPeriod, setSelectedPeriod] = useState<string>('08h00 - 10h00');
  const [showJustifyModal, setShowJustifyModal] = useState(false);
  const [justifyReason, setJustifyReason] = useState('');
  const [justifyDate, setJustifyDate] = useState('2026-10-19');

  // Filter students for current class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Attendance status mapping for this session
  const [statusMap, setStatusMap] = useState<
    Record<string, { status: AttendanceRecord['status']; lateMinutes?: number; note?: string }>
  >(() => {
    const init: Record<string, { status: AttendanceRecord['status']; lateMinutes?: number; note?: string }> = {};
    for (const s of classStudents) {
      init[s.id] = { status: 'present' };
    }
    return init;
  });

  const handleStatusChange = (studentId: string, status: AttendanceRecord['status']) => {
    setStatusMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        lateMinutes: status === 'late' ? 15 : undefined,
      },
    }));
  };

  const markAllPresent = () => {
    const next: Record<string, { status: AttendanceRecord['status']; lateMinutes?: number; note?: string }> = {};
    for (const s of classStudents) {
      next[s.id] = { status: 'present' };
    }
    setStatusMap(next);
    showToast('Tous les élèves ont été marqués présents.', 'info');
  };

  const handleSaveAttendance = async () => {
    const records: AttendanceRecord[] = classStudents.map((s) => {
      const state = statusMap[s.id] || { status: 'present' };
      return {
        id: `att-${s.id}-${selectedDate}-${Date.now()}`,
        institutionId: s.institutionId,
        studentId: s.id,
        classId: selectedClassId,
        date: selectedDate,
        period: selectedPeriod,
        status: state.status,
        lateMinutes: state.lateMinutes,
        justified: state.status === 'absent_justified',
        note: state.note || '',
      };
    });

    await recordAttendanceList(records);
  };

  // Summary counts
  const counts = useMemo(() => {
    let p = 0;
    let au = 0;
    let aj = 0;
    let l = 0;
    for (const s of classStudents) {
      const st = statusMap[s.id]?.status || 'present';
      if (st === 'present') p++;
      else if (st === 'absent_unjustified') au++;
      else if (st === 'absent_justified') aj++;
      else if (st === 'late') l++;
    }
    const rate = classStudents.length > 0 ? ((p / classStudents.length) * 100).toFixed(1) : '100.0';
    return { p, au, aj, l, rate };
  }, [classStudents, statusMap]);

  // Student & Parent personal attendance view
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

    const attendanceLog = [
      { date: '19/10/2026', period: '08h00 - 10h00', subject: 'Mathématiques', status: 'present', note: 'À l\'heure' },
      { date: '19/10/2026', period: '10h15 - 12h15', subject: 'Français', status: 'present', note: 'Participation active' },
      { date: '18/10/2026', period: '14h00 - 16h00', subject: 'Physique-Chimie', status: 'present', note: 'Présent en TP' },
      { date: '17/10/2026', period: '08h00 - 10h00', subject: 'Histoire-Géo', status: 'late', note: 'Retard de 10 min (Embouteillage justifié)' },
      { date: '16/10/2026', period: '10h15 - 12h15', subject: 'Anglais', status: 'present', note: 'À l\'heure' },
      { date: '15/10/2026', period: '08h00 - 10h00', subject: 'SVT', status: 'present', note: 'À l\'heure' },
    ];

    const handleJustifySubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!justifyReason.trim()) return;
      showToast('Justificatif transmis avec succès au bureau de la vie scolaire.', 'success');
      setShowJustifyModal(false);
      setJustifyReason('');
    };

    return (
      <div className="space-y-4 pb-12">
        {/* Header Personal Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg shadow-2xs">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900">
                    Bilan d'Assiduité &amp; Ponctualité
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase font-mono">
                    Session 2026-2027
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
                onClick={() => setShowJustifyModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#00236f] text-white text-xs font-semibold shadow-xs hover:bg-[#1e3a8a] transition-all"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Justifier une absence</span>
              </button>
              <button
                onClick={() => setForceTeacherMode(true)}
                className="px-2.5 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50"
                title="Afficher la feuille d'appel enseignant"
              >
                Feuille d'appel classe
              </button>
            </div>
          </div>

          {/* Attendance Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Taux de Présence</span>
              <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-0.5">98.5%</div>
              <span className="text-[10px] text-emerald-800 font-medium">Excellente assiduité</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Séances Totales</span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">48</div>
              <span className="text-[10px] text-slate-500">Cours enregistrés</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Retards Constatés</span>
              <div className="text-2xl font-extrabold text-amber-700 font-mono mt-0.5">1</div>
              <span className="text-[10px] text-amber-800">10 min (justifié)</span>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Absences Injustifiées</span>
              <div className="text-2xl font-extrabold text-[#00236f] font-mono mt-0.5">0</div>
              <span className="text-[10px] text-blue-800 font-medium">Situation en règle</span>
            </div>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Historique des Derniers Cours Pointés
            </h3>
            <span className="text-xs text-slate-400">Registre officiel</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-3">Créneau</th>
                  <th className="py-3 px-3">Matière</th>
                  <th className="py-3 px-3">Statut</th>
                  <th className="py-3 px-4">Observation / Émargement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceLog.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{row.date}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{row.period}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{row.subject}</td>
                    <td className="py-3 px-3">
                      {row.status === 'present' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                          <Check className="w-3 h-3 text-emerald-600" /> Présent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-[10px]">
                          <Clock className="w-3 h-3 text-amber-600" /> Retard
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Justification */}
        {showJustifyModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-base font-bold text-slate-900">Justifier une Absence ou un Retard</h3>
                <button
                  onClick={() => setShowJustifyModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleJustifySubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date concernée</label>
                  <input
                    type="date"
                    value={justifyDate}
                    onChange={(e) => setJustifyDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Motif de l'absence / du retard <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={justifyReason}
                    onChange={(e) => setJustifyReason(e.target.value)}
                    placeholder="Ex: Raison médicale (certificat médical joint), urgence familiale..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#00236f]"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowJustifyModal(false)}
                    className="w-1/3 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 h-11 bg-[#00236f] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-semibold shadow-xs"
                  >
                    Envoyer à la Vie Scolaire
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Header & Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
        {forceTeacherMode && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-xl text-xs">
            <span>Mode Feuille d'Appel Enseignant activé manuellement.</span>
            <button
              onClick={() => setForceTeacherMode(false)}
              className="font-bold underline hover:text-amber-950"
            >
              Revenir au suivi personnel
            </button>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#00236f] flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">Feuille d'Appel &amp; Assiduité</h1>
              <span className="text-[11px] text-slate-500">
                Pointage en temps réel avec calcul automatique du taux de présence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllPresent}
              className="h-10 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Tous Présents</span>
            </button>

            <button
              onClick={handleSaveAttendance}
              className="h-10 px-4 bg-[#00236f] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Valider l'Appel</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Classe</label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                const nextStudents = students.filter((s) => s.classId === e.target.value);
                const nextMap: Record<string, any> = {};
                nextStudents.forEach((s) => (nextMap[s.id] = { status: 'present' }));
                setStatusMap(nextMap);
              }}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.room})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Séance / Créneau</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold"
            >
              <option value="07h30 - 09h30">07h30 - 09h30</option>
              <option value="08h00 - 10h00">08h00 - 10h00</option>
              <option value="10h15 - 12h15">10h15 - 12h15</option>
              <option value="14h00 - 16h00">14h00 - 16h00</option>
              <option value="15h00 - 17h00">15h00 - 17h00</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Taux Présence</span>
          <span className="text-xl font-extrabold text-emerald-700 font-mono">{counts.rate} %</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] text-emerald-700 font-semibold uppercase block">Présents</span>
          <span className="text-xl font-extrabold text-slate-900 font-mono">{counts.p}</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] text-rose-600 font-semibold uppercase block">Absents Injustifiés</span>
          <span className="text-xl font-extrabold text-rose-600 font-mono">{counts.au}</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] text-amber-600 font-semibold uppercase block">Absents Justifiés</span>
          <span className="text-xl font-extrabold text-amber-600 font-mono">{counts.aj}</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] text-blue-600 font-semibold uppercase block">Retards</span>
          <span className="text-xl font-extrabold text-blue-700 font-mono">{counts.l}</span>
        </div>
      </div>

      {/* Roster Call Sheet List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Élèves de la classe ({classStudents.length})
          </h3>
          <span className="text-xs text-slate-400">Cliquez pour modifier le statut</span>
        </div>

        <div className="divide-y divide-slate-100">
          {classStudents.map((student, idx) => {
            const st = statusMap[student.id]?.status || 'present';

            return (
              <div
                key={student.id}
                className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-slate-400 w-6">{idx + 1}.</span>
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-[#00236f] flex items-center justify-center font-bold text-xs shrink-0">
                    {student.firstName[0]}
                    {student.lastName[0]}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {student.lastName} {student.firstName}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      {student.matricule}
                    </span>
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'present')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      st === 'present'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Présent
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'absent_unjustified')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      st === 'absent_unjustified'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Abs. Injustifiée
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'absent_justified')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      st === 'absent_justified'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Abs. Justifiée
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'late')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      st === 'late'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Retard
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
