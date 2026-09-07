import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookMarked, Plus, Calendar, CheckCircle2, Clock, X } from 'lucide-react';

export const HomeworkView: React.FC = () => {
  const { classes, subjects, showToast, currentRole } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'cls-3a');
  const [showAddModal, setShowAddModal] = useState(false);

  // Demo homework entries
  const [homeworkList, setHomeworkList] = useState([
    {
      id: 'hw-1',
      classId: 'cls-3a',
      subject: 'Mathématiques',
      title: 'Exercices 12 à 15 page 84 (Théorème de Thalès)',
      dueDate: '2026-10-22',
      status: 'pending',
    },
    {
      id: 'hw-2',
      classId: 'cls-3a',
      subject: 'Français',
      title: 'Dissertation : La poésie engagée au XXe siècle',
      dueDate: '2026-10-24',
      status: 'pending',
    },
    {
      id: 'hw-3',
      classId: 'cls-1d',
      subject: 'Physique-Chimie',
      title: 'Compte-rendu de TP n°3 : Dosage acido-basique',
      dueDate: '2026-10-25',
      status: 'completed',
    },
  ]);

  const toggleStatus = (id: string) => {
    setHomeworkList((prev) =>
      prev.map((hw) => {
        if (hw.id === id) {
          const next = hw.status === 'completed' ? 'pending' : 'completed';
          showToast(
            next === 'completed' ? 'Devoir marqué comme terminé !' : 'Devoir marqué à rendre.',
            'info'
          );
          return { ...hw, status: next };
        }
        return hw;
      })
    );
  };

  const [newSubject, setNewSubject] = useState('Mathématiques');
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('2026-10-26');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setHomeworkList((prev) => [
      {
        id: `hw-${Date.now()}`,
        classId: selectedClassId,
        subject: newSubject,
        title: newTitle.trim(),
        dueDate: newDueDate,
        status: 'pending',
      },
      ...prev,
    ]);

    setNewTitle('');
    setShowAddModal(false);
    showToast('Devoir publié avec succès dans le cahier de textes.', 'success');
  };

  const filteredList = homeworkList.filter((h) => h.classId === selectedClassId);

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#00236f] flex items-center justify-center">
            <BookMarked className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Cahier de Textes &amp; Devoirs</h1>
            <p className="text-xs text-slate-500">Planification des travaux et devoirs à la maison</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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

          {(currentRole === 'teacher' || currentRole === 'direction' || currentRole === 'superadmin') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="h-10 px-4 bg-[#00236f] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Donner un devoir</span>
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredList.map((hw) => {
          const isDone = hw.status === 'completed';
          return (
            <div
              key={hw.id}
              className={`bg-white rounded-2xl p-4 border transition-all shadow-sm flex items-start justify-between gap-3 ${
                isDone ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-100'
              }`}
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#00236f] bg-blue-50 px-2.5 py-0.5 rounded-full uppercase">
                  {hw.subject}
                </span>
                <h3 className={`text-sm font-bold pt-1 ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                  {hw.title}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pour le : <strong>{hw.dueDate}</strong></span>
                </p>
              </div>

              <button
                onClick={() => toggleStatus(hw.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  isDone
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                }`}
                title="Cliquez pour changer le statut"
              >
                {isDone ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Terminé</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>À rendre</span>
                  </>
                )}
              </button>
            </div>
          );
        })}

        {filteredList.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-xs">
            Aucun devoir assigné pour cette classe actuellement.
          </div>
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Programmer un Devoir</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Matière</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  {(subjects || []).map((sub) => (
                    <option key={sub.id} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Énoncé ou Consignes <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="ex: Rédaction p. 45, exercices 3 et 4..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#00236f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date d'échéance / de rendu
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
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
                  className="w-2/3 h-11 bg-[#00236f] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Publier le devoir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
