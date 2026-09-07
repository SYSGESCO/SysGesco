import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TimetableSlot } from '../../types';
import {
  Calendar,
  Clock,
  Printer,
  Plus,
  School,
  User,
  AlertTriangle,
  CheckCircle2,
  X,
  Layers,
} from 'lucide-react';

export const TimetableView: React.FC = () => {
  const { classes, teachers, subjects, timetables, addTimetableSlot, showToast } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'cls-3a');
  const [filterMode, setFilterMode] = useState<'class' | 'teacher'>('class');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');
  const [showAddModal, setShowAddModal] = useState(false);

  // New slot form
  const [newDay, setNewDay] = useState<TimetableSlot['dayOfWeek']>('Lundi');
  const [newStartTime, setNewStartTime] = useState('08:00');
  const [newEndTime, setNewEndTime] = useState('10:00');
  const [newSubjectId, setNewSubjectId] = useState(subjects?.[0]?.id || 'sub-math');
  const [newTeacherId, setNewTeacherId] = useState(teachers[0]?.id || '');
  const [newRoom, setNewRoom] = useState('Salle 12');

  const days: TimetableSlot['dayOfWeek'][] = [
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
  ];

  const timeSlots = [
    { start: '07:30', end: '08:30' },
    { start: '08:30', end: '09:30' },
    { start: '09:30', end: '10:30' },
    { start: '10:45', end: '11:45' },
    { start: '11:45', end: '12:45' },
    { start: '14:00', end: '15:00' },
    { start: '15:00', end: '16:00' },
    { start: '16:00', end: '17:00' },
  ];

  // Filtered slots for current view
  const activeSlots = useMemo(() => {
    return (timetables || []).filter((slot) => {
      if (filterMode === 'class') {
        return slot.classId === selectedClassId;
      } else {
        return slot.teacherId === selectedTeacherId;
      }
    });
  }, [timetables, filterMode, selectedClassId, selectedTeacherId]);

  const handleAddSlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Conflict Check: is teacher or room already booked on that day/hour?
    const hasConflict = (timetables || []).some(
      (s) =>
        s.dayOfWeek === newDay &&
        ((s.startTime <= newStartTime && s.endTime > newStartTime) ||
          (s.startTime < newEndTime && s.endTime >= newEndTime)) &&
        (s.teacherId === newTeacherId || (s.room === newRoom && s.classId !== selectedClassId))
    );

    if (hasConflict) {
      showToast('Alerte Conflit : Ce professeur ou cette salle est déjà occupé(e) sur ce créneau !', 'warning');
    }

    try {
      await addTimetableSlot({
        classId: selectedClassId,
        subjectId: newSubjectId,
        teacherId: newTeacherId,
        dayOfWeek: newDay,
        startTime: newStartTime,
        endTime: newEndTime,
        room: newRoom,
      });

      setShowAddModal(false);
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l’ajout du cours', 'error');
    }
  };

  const getSubjectColor = (name: string) => {
    if (name.includes('Math')) return 'bg-blue-50 border-blue-200 text-blue-900';
    if (name.includes('Franç')) return 'bg-emerald-50 border-emerald-200 text-emerald-900';
    if (name.includes('Phys')) return 'bg-amber-50 border-amber-200 text-amber-900';
    if (name.includes('Angl')) return 'bg-purple-50 border-purple-200 text-purple-900';
    if (name.includes('SVT')) return 'bg-teal-50 border-teal-200 text-teal-900';
    return 'bg-slate-50 border-slate-200 text-slate-900';
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header & Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#00236f] flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Emploi du Temps Hebdomadaire</h1>
            <p className="text-xs text-slate-500">Planification des cours et détection des conflits</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mode switch: par classe ou par prof */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilterMode('class')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterMode === 'class' ? 'bg-white text-[#00236f] shadow-xs' : 'text-slate-600'
              }`}
            >
              Par Classe
            </button>
            <button
              onClick={() => setFilterMode('teacher')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterMode === 'teacher' ? 'bg-white text-[#00236f] shadow-xs' : 'text-slate-600'
              }`}
            >
              Par Professeur
            </button>
          </div>

          {filterMode === 'class' ? (
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.room})
                </option>
              ))}
            </select>
          ) : (
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName} ({t.specialty})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="h-10 px-3 bg-[#00236f] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter cours</span>
          </button>

          <button
            onClick={() => window.print()}
            className="h-10 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimer A4</span>
          </button>
        </div>
      </div>

      {/* Timetable Weekly Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm overflow-x-auto print:border-0 print:p-0">
        <div className="text-center pb-3 border-b border-slate-100 mb-4 hidden print:block">
          <h2 className="text-lg font-bold text-[#00236f]">
            EMPLOI DU TEMPS - {classes.find((c) => c.id === selectedClassId)?.name}
          </h2>
          <p className="text-xs text-slate-500">Année Scolaire 2026-2027 • SysGesco</p>
        </div>

        <div className="min-w-[760px] grid grid-cols-7 gap-2">
          {/* Header Row */}
          <div className="p-2 font-bold text-xs text-slate-400 uppercase text-center">Horaires</div>
          {days.map((day) => (
            <div
              key={day}
              className="p-2.5 rounded-xl bg-slate-50 text-[#00236f] font-bold text-xs uppercase text-center border border-slate-100"
            >
              {day}
            </div>
          ))}

          {/* Time Rows */}
          {timeSlots.map((slot) => (
            <React.Fragment key={slot.start}>
              {/* Time Column */}
              <div className="p-2 flex flex-col justify-center items-center font-mono text-[11px] text-slate-500 font-semibold border-r border-slate-100">
                <span>{slot.start}</span>
                <span className="text-[9px] text-slate-300">|</span>
                <span>{slot.end}</span>
              </div>

              {/* Days Columns */}
              {days.map((day) => {
                const match = activeSlots.find(
                  (s) =>
                    s.dayOfWeek === day &&
                    s.startTime <= slot.start &&
                    s.endTime >= slot.end
                );

                const subject = subjects.find((sub) => sub.id === match?.subjectId);
                const teacher = teachers.find((t) => t.id === match?.teacherId);

                return (
                  <div
                    key={day + slot.start}
                    className="min-h-[72px] p-1.5 rounded-xl border border-slate-100/80 bg-slate-50/30 flex flex-col justify-center"
                  >
                    {match && subject ? (
                      <div
                        className={`w-full h-full p-2 rounded-lg border text-left flex flex-col justify-between shadow-2xs ${getSubjectColor(
                          subject.name
                        )}`}
                      >
                        <div>
                          <p className="font-bold text-xs leading-tight truncate">
                            {subject.name}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {teacher ? `${teacher.firstName[0]}. ${teacher.lastName}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-1 border-t border-black/5">
                          <span>{match.room}</span>
                          <span>
                            {match.startTime}-{match.endTime}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-300">
                        —
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL : AJOUTER UN COURS                                 */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Programmer un Cours</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSlotSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Matière</label>
                <select
                  value={newSubjectId}
                  onChange={(e) => setNewSubjectId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  {(subjects || []).map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Professeur</label>
                <select
                  value={newTeacherId}
                  onChange={(e) => setNewTeacherId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} ({t.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jour</label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salle</label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    placeholder="Salle 12"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Début</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fin</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
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
                  Enregistrer le cours
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
