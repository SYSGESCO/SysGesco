import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, Payment, Student } from '../../types';
import {
  Wallet,
  CheckCircle2,
  Search,
  Receipt,
  Printer,
  Download,
  Calendar,
  CreditCard,
  Phone,
  QrCode,
  Sparkles,
  History,
  Coins,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const CashierView: React.FC = () => {
  const {
    activeInstitution,
    students,
    classes,
    payments,
    recordPayment,
    currentUser,
    showToast,
  } = useApp();

  // Search and selected student for rapid cash-in
  const [studentSearch, setStudentSearch] = useState('MAT-2026-0418');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(() => {
    return students.find((s) => s.matricule === 'MAT-2026-0418') || students[0] || null;
  });

  const [paymentAmount, setPaymentAmount] = useState<number>(150000);
  const [paymentMode, setPaymentMode] = useState<PaymentMethod>('Wave');
  const [observation, setObservation] = useState('Scolarité Trimestre 2');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Latest generated receipt for display
  const [activeReceipt, setActiveReceipt] = useState<Payment | null>(() => payments[0] || null);

  // Journal filter state
  const [journalFilterMode, setJournalFilterMode] = useState<string>('all');
  const [journalSearch, setJournalSearch] = useState('');

  // Daily statistics
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const todayPayments = useMemo(() => {
    return payments.filter((p) => p.date.startsWith(todayDateStr));
  }, [payments, todayDateStr]);

  const todayTotal = todayPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

  // Mode breakdowns
  const modeBreakdowns = useMemo(() => {
    const counts: Record<string, number> = {
      Espèce: 0,
      Wave: 0,
      'Orange Money': 0,
      'MTN Money': 0,
      'Moov Money': 0,
    };
    for (const p of todayPayments) {
      counts[p.paymentMethod] = (counts[p.paymentMethod] || 0) + (p.amount || 0);
    }
    return counts;
  }, [todayPayments]);

  // Handle student search
  const searchResults = useMemo(() => {
    if (!studentSearch.trim()) return [];
    const q = studentSearch.toLowerCase().trim();
    return students.filter(
      (s) =>
        s.matricule.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.firstName.toLowerCase().includes(q)
    );
  }, [students, studentSearch]);

  const handleSelectStudent = (s: Student) => {
    setSelectedStudent(s);
    const remaining = Math.max(0, s.tuitionTotal - s.tuitionPaid);
    setPaymentAmount(remaining > 0 ? remaining : 50000);
    setStudentSearch(`${s.matricule} - ${s.lastName} ${s.firstName}`);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      showToast('Veuillez sélectionner un élève valide.', 'error');
      return;
    }

    if (paymentAmount <= 0) {
      showToast('Le montant doit être supérieur à 0 FCFA.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newPayment = await recordPayment({
        studentId: selectedStudent.id,
        amount: paymentAmount,
        paymentMethod: paymentMode,
        observation: observation.trim() || `Règlement ${paymentMode}`,
      });

      setActiveReceipt(newPayment);

      // Refresh student reference
      const updated = students.find((s) => s.id === selectedStudent.id);
      if (updated) setSelectedStudent(updated);
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l’encaissement', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Journal
  const filteredJournal = useMemo(() => {
    return payments.filter((p) => {
      const matchesMode = journalFilterMode === 'all' || p.paymentMethod === journalFilterMode;
      const q = journalSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.studentName.toLowerCase().includes(q) ||
        p.studentMatricule.toLowerCase().includes(q) ||
        p.receiptNumber.toLowerCase().includes(q);
      return matchesMode && matchesSearch;
    });
  }, [payments, journalFilterMode, journalSearch]);

  return (
    <div className="space-y-4 pb-12">
      {/* Offline and Status Bar */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-100 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
          </span>
          <span className="text-xs font-bold text-slate-800">
            Caisse Locale • Guichet Central ({activeInstitution?.name})
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[#00236f] font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sync Auto Active</span>
        </div>
      </div>

      {/* Résumé Trésorerie du Jour (Section 43) */}
      <section className="relative overflow-hidden rounded-2xl bg-[#00236f] text-white p-5 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
            Total Encaissé Aujourd’hui
          </span>
          <span className="text-xs bg-[#1e3a8a] text-blue-100 px-2.5 py-0.5 rounded-full font-bold">
            {todayPayments.length} règlement{todayPayments.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 my-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
            {(todayTotal || 0).toLocaleString('fr-FR')}
          </span>
          <span className="text-sm font-bold text-blue-200">FCFA</span>
        </div>

        {/* Répartition Rapide Modes de Paiement */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3 pt-3 border-t border-white/10 text-xs">
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-blue-200 block font-medium">Wave</span>
            <span className="font-bold text-white font-mono text-sm block">
              {(modeBreakdowns['Wave'] || 0).toLocaleString('fr-FR')}
            </span>
            <span className="text-[9px] text-blue-300">FCFA</span>
          </div>

          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-blue-200 block font-medium">Orange Money</span>
            <span className="font-bold text-white font-mono text-sm block">
              {(modeBreakdowns['Orange Money'] || 0).toLocaleString('fr-FR')}
            </span>
            <span className="text-[9px] text-blue-300">FCFA</span>
          </div>

          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-blue-200 block font-medium">Espèces</span>
            <span className="font-bold text-white font-mono text-sm block">
              {(modeBreakdowns['Espèce'] || 0).toLocaleString('fr-FR')}
            </span>
            <span className="text-[9px] text-blue-300">FCFA</span>
          </div>

          <div className="bg-white/10 rounded-xl p-2 hidden sm:block">
            <span className="text-[10px] text-blue-200 block font-medium">MTN MoMo</span>
            <span className="font-bold text-white font-mono text-sm block">
              {(modeBreakdowns['MTN Money'] || 0).toLocaleString('fr-FR')}
            </span>
            <span className="text-[9px] text-blue-300">FCFA</span>
          </div>

          <div className="bg-white/10 rounded-xl p-2 hidden sm:block">
            <span className="text-[10px] text-blue-200 block font-medium">Moov Money</span>
            <span className="font-bold text-white font-mono text-sm block">
              {(modeBreakdowns['Moov Money'] || 0).toLocaleString('fr-FR')}
            </span>
            <span className="text-[9px] text-blue-300">FCFA</span>
          </div>
        </div>
      </section>

      {/* Grid: Encaissement Rapide + Reçu Actuel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Module D'encaissement Rapide (Section 30) */}
        <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Nouvel Encaissement</h2>
            </div>
            <span className="text-xs font-semibold text-slate-400 font-mono">
              Opérateur: {currentUser?.firstName || 'Caissière'}
            </span>
          </div>

          <form onSubmit={handlePaymentSubmit} className="space-y-3.5">
            {/* 1. Recherche Élève */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                1. Rechercher l’Élève ou Matricule
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Tapez nom, prénom ou MAT-2026-XXXX..."
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 focus:bg-white focus:border-[#00236f] focus:outline-none"
                />
              </div>

              {/* Live search dropdown results */}
              {searchResults.length > 0 && (
                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-1 bg-white shadow-lg space-y-1">
                  {searchResults.slice(0, 4).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectStudent(s)}
                      className="w-full text-left p-2 rounded-lg hover:bg-blue-50 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900">
                          {s.lastName} {s.firstName}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                          ({s.matricule})
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-semibold text-emerald-700">
                        Reste : {Math.max(0, (s.tuitionTotal ?? 0) - (s.tuitionPaid ?? 0)).toLocaleString('fr-FR')} F
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Situation Financière Immédiate */}
            {selectedStudent && (
              <div className="bg-[#f2f3ff] rounded-xl p-3.5 border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-[#00236f]">
                      {selectedStudent.lastName} {selectedStudent.firstName}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      {selectedStudent.matricule} •{' '}
                      {classes.find((c) => c.id === selectedStudent.classId)?.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Dossier Ouvert
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-[9px] font-sans text-slate-400 uppercase block font-semibold">
                      Total Dû
                    </span>
                    <span className="font-bold text-slate-800">
                      {(selectedStudent.tuitionTotal ?? 0).toLocaleString('fr-FR')} F
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-[9px] font-sans text-emerald-700 uppercase block font-semibold">
                      Déjà Versé
                    </span>
                    <span className="font-bold text-emerald-700">
                      {(selectedStudent.tuitionPaid ?? 0).toLocaleString('fr-FR')} F
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-rose-200">
                    <span className="text-[9px] font-sans text-rose-700 uppercase block font-semibold">
                      Reste Dû
                    </span>
                    <span className="font-bold text-rose-600">
                      {Math.max(
                        0,
                        (selectedStudent.tuitionTotal ?? 0) - (selectedStudent.tuitionPaid ?? 0)
                      ).toLocaleString('fr-FR')}{' '}
                      F
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Montant à Encaisser */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                2. Montant à Encaisser (FCFA) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1000"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-base font-extrabold font-mono text-slate-900 focus:outline-none focus:border-[#00236f]"
                />
                <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">
                  FCFA
                </span>
              </div>

              {/* Quick Amount Chips */}
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setPaymentAmount((prev) => prev + 50000)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                >
                  +50 000
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentAmount((prev) => prev + 100000)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                >
                  +100 000
                </button>
                {selectedStudent && (
                  <button
                    type="button"
                    onClick={() =>
                      setPaymentAmount(
                        Math.max(0, selectedStudent.tuitionTotal - selectedStudent.tuitionPaid)
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold"
                  >
                    Tout Solder (
                    {Math.max(
                      0,
                      (selectedStudent.tuitionTotal ?? 0) - (selectedStudent.tuitionPaid ?? 0)
                    ).toLocaleString('fr-FR')}{' '}
                    F)
                  </button>
                )}
              </div>
            </div>

            {/* 4. Mode de Règlement */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                3. Mode de Règlement <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {(['Wave', 'Orange Money', 'MTN Money', 'Moov Money', 'Espèce'] as PaymentMethod[]).map(
                  (mode) => {
                    const isSelected = paymentMode === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPaymentMode(mode)}
                        className={`p-2 rounded-xl text-center text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-[#00236f] text-white border-[#00236f] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {mode}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* 5. Observation */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Motif ou Observation</label>
              <input
                type="text"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="ex: Scolarité Trimestre 2, Frais d'examen..."
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#00236f]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting ? 'Enregistrement sécurisé...' : 'Valider l’encaissement & Générer Reçu'}
              </span>
            </button>
          </form>
        </section>

        {/* Reçu Officiel Actuel (Section 33) */}
        <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#00236f] flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Reçu Officiel de Caisse</h2>
                <span className="text-[11px] font-mono text-slate-400">
                  {activeReceipt ? activeReceipt.receiptNumber : 'En attente...'}
                </span>
              </div>
            </div>

            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Acquitté
            </span>
          </div>

          {activeReceipt ? (
            <div className="bg-[#faf8ff] rounded-2xl p-4 border border-slate-100 space-y-3 font-sans text-xs">
              <div className="flex items-start justify-between border-b border-slate-200/60 pb-3">
                <div>
                  <h3 className="font-extrabold text-[#00236f] text-sm">SYSGESCO AFRIQUE</h3>
                  <p className="text-[11px] font-semibold text-slate-700">
                    {activeInstitution?.name}
                  </p>
                  <p className="text-[10px] text-slate-400">{activeInstitution?.address || activeInstitution?.city}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Référence</span>
                  <span className="font-extrabold text-[#00236f] font-mono">{activeReceipt.receiptNumber}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{activeReceipt.date}</span>
                </div>
              </div>

              {/* Récépissé Content */}
              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Élève bénéficiaire :</span>
                  <span className="font-bold text-slate-900">{activeReceipt.studentName}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Matricule :</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {activeReceipt.studentMatricule}
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Classe :</span>
                  <span className="font-semibold text-slate-900">{activeReceipt.className}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Mode de règlement :</span>
                  <span className="font-semibold text-[#00236f]">{activeReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Motif :</span>
                  <span>{activeReceipt.observation || 'Scolarité'}</span>
                </div>
              </div>

              {/* Highlight Amount */}
              <div className="bg-white rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">Montant Encaissé</span>
                <span className="text-xl font-extrabold text-emerald-700 font-mono">
                  {(activeReceipt.amount ?? 0).toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              {/* Solde restant */}
              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>Nouveau solde restant à recouvrer :</span>
                <span className="font-bold text-slate-800 font-mono">
                  {(activeReceipt.newBalance ?? 0).toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              {/* Signature stamp */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>Caissière: {activeReceipt.cashierName}</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5" /> Authentifié SysGesco
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-8 text-center text-slate-400 text-xs">
              Aucun reçu sélectionné. Enregistrez un paiement pour générer un reçu officiel.
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => window.print()}
              className="h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-[#00236f]" />
              <span>Imprimer A4</span>
            </button>
            <button
              onClick={() => {
                showToast('Reçu PDF prêt pour téléchargement.', 'success');
              }}
              className="h-10 rounded-xl bg-[#00236f] hover:bg-[#1e3a8a] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger</span>
            </button>
          </div>
        </section>
      </div>

      {/* Journal des Encaissements (Section 32) */}
      <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#00236f]" />
            <h3 className="text-sm font-bold text-slate-900">
              Journal des Encaissements &amp; Règlements
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={journalFilterMode}
              onChange={(e) => setJournalFilterMode(e.target.value)}
              className="h-9 px-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
            >
              <option value="all">Tous les modes</option>
              <option value="Wave">Wave</option>
              <option value="Orange Money">Orange Money</option>
              <option value="MTN Money">MTN Money</option>
              <option value="Moov Money">Moov Money</option>
              <option value="Espèce">Espèces</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Référence</th>
                <th className="py-2.5 px-3">Élève &amp; Classe</th>
                <th className="py-2.5 px-3 text-right">Montant</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3">Caissière</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJournal.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                    {pay.date.slice(0, 16)}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-[#00236f]">
                    {pay.receiptNumber}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 block">{pay.studentName}</span>
                    <span className="text-[10px] text-slate-400">{pay.className}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-700">
                    {(pay.amount ?? 0).toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {pay.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{pay.cashierName}</td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => setActiveReceipt(pay)}
                      className="px-2 py-1 rounded bg-blue-50 text-[#00236f] hover:bg-blue-100 text-[11px] font-semibold"
                    >
                      Voir reçu
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
