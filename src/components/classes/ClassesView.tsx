import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SchoolClass } from '../../types';
import {
  School,
  Plus,
  Users,
  GraduationCap,
  DoorOpen,
  Coins,
  Printer,
  ChevronRight,
  X,
  CheckCircle2,
} from 'lucide-react';

export const ClassesView: React.FC = () => {
  const { classes, students, teachers, addClass, showToast } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClassDetail, setSelectedClassDetail] = useState<SchoolClass | null>(null);

  // Form
  const [newName, setNewName] = useState('');
  const [newLevel, setNewLevel] = useState('Collège');
  const [newRoom, setNewRoom] = useState('Salle 14');
  const [newMainTeacherId, setNewMainTeacherId] = useState(teachers[0]?.id || '');
  const [newTuitionFee, setNewTuitionFee] = useState(350000);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('Le nom de la classe est requis.', 'error');
      return;
    }

    try {
      await addClass({
        name: newName.trim(),
        level: newLevel,
        academicYear: '2026-2027',
        mainTeacherId: newMainTeacherId,
        room: newRoom,
        capacity: 45,
        tuitionFee: newTuitionFee,
      });

      setNewName('');
      setShowAddModal(false);
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la création de la classe', 'error');
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-900">Structure des Classes &amp; Divisions</h1>
          <p className="text-xs text-slate-500">
            {classes.length} classes configurées pour l'année scolaire en cours
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="h-10 px-4 bg-[#1e3a5f] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Créer une classe</span>
        </button>
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {classes.map((c) => {
          const classStudents = students.filter((s) => s.classId === c.id);
          const teacher = teachers.find((t) => t.id === c.mainTeacherId);
          const totalCollected = classStudents.reduce((acc, s) => acc + (s.tuitionPaid || 0), 0);
          const totalDue = classStudents.reduce((acc, s) => acc + (s.tuitionTotal || 0), 0);
          const rate = totalDue > 0 ? ((totalCollected / totalDue) * 100).toFixed(0) : '100';

          return (
            <div
              key={c.id}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-blue-200 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {c.level}
                  </span>
                  <h3 className="text-lg font-extrabold text-[#1e3a5f]">{c.name}</h3>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <span>{rate}% payé</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-[#1e3a5f]" />
                  <span>
                    Effectif : <strong>{classStudents.length} élèves</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-[#1e3a5f]" />
                  <span>
                    Prof. Principal :{' '}
                    <strong>
                      {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Non assigné'}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <DoorOpen className="w-3.5 h-3.5 text-[#1e3a5f]" />
                  <span>
                    Salle : <strong>{c.room || 'Salle principale'}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Coins className="w-3.5 h-3.5 text-emerald-700" />
                  <span>
                    Frais scolaires :{' '}
                    <strong className="font-mono">{(c.tuitionFee ?? 350000).toLocaleString('fr-FR')} FCFA</strong>
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setSelectedClassDetail(c)}
                  className="flex-1 h-9 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1e3a5f] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Liste des élèves ({classStudents.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* MODAL : LISTE DES ÉLÈVES D'UNE CLASSE                    */}
      {/* ======================================================== */}
      {selectedClassDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Classe : {selectedClassDetail.name} ({selectedClassDetail.room})
                </h3>
                <span className="text-xs text-slate-500">
                  {students.filter((s) => s.classId === selectedClassDetail.id).length} élèves inscrits
                </span>
              </div>
              <button
                onClick={() => setSelectedClassDetail(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {students
                .filter((s) => s.classId === selectedClassDetail.id)
                .map((student, idx) => (
                  <div key={student.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-slate-400 w-5">{idx + 1}.</span>
                      <div>
                        <p className="font-bold text-slate-900">
                          {student.lastName} {student.firstName}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">{student.matricule}</p>
                      </div>
                    </div>
                    <span className="font-mono text-emerald-700 font-bold">
                      {(student.tuitionPaid ?? 0).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                ))}
            </div>

            <div className="pt-2 flex items-center justify-between border-t">
              <button
                onClick={() => window.print()}
                className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer liste de classe A4</span>
              </button>
              <button
                onClick={() => setSelectedClassDetail(null)}
                className="h-10 px-5 bg-[#1e3a5f] text-white rounded-xl text-xs font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL : CRÉER UNE NOUVELLE CLASSE                        */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Ajouter une Division</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddClass} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom de la classe <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="ex: 2nde C2"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cycle / Niveau</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="Collège">Collège</option>
                    <option value="Lycée">Lycée</option>
                    <option value="Primaire">Primaire</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salle</label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    placeholder="Salle 15"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Professeur Principal</label>
                <select
                  value={newMainTeacherId}
                  onChange={(e) => setNewMainTeacherId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} ({t.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Frais de scolarité annuels (FCFA)
                </label>
                <input
                  type="number"
                  step="5000"
                  value={newTuitionFee}
                  onChange={(e) => setNewTuitionFee(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
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
                  className="w-2/3 h-11 bg-[#1e3a5f] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Créer la classe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
