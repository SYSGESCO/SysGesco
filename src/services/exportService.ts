import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, ClassRoom, Grade, Subject, Payment, Institution } from '../types';

export interface ExportFilterOptions {
  classId?: string;
  className?: string;
  term?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  subjectId?: string;
}

// Helper to format currency
const formatMoney = (amount: number): string => {
  return amount.toLocaleString('fr-FR') + ' FCFA';
};

// Helper for date formatting
const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('fr-FR');
  } catch {
    return dateStr;
  }
};

// ============================================================================
// EXCEL EXPORTS
// ============================================================================

/**
 * Export Students List to Excel (.xlsx)
 */
export const exportStudentsToExcel = (
  students: Student[],
  classes: ClassRoom[],
  institution: Institution,
  options?: ExportFilterOptions
) => {
  const filtered = options?.classId && options.classId !== 'all'
    ? students.filter((s) => s.classId === options.classId)
    : students;

  const classMap = new Map(classes.map((c) => [c.id, c.name]));

  const data = filtered.map((s, idx) => {
    const cName = classMap.get(s.classId) || 'Non assigné';
    const total = s.tuitionTotal || 350000;
    const paid = s.tuitionPaid || 0;
    const remaining = Math.max(0, total - paid);

    return {
      'N°': idx + 1,
      'Matricule': s.matricule,
      'Nom': s.lastName.toUpperCase(),
      'Prénoms': s.firstName,
      'Sexe': s.gender === 'F' ? 'Féminin' : 'Masculin',
      'Classe': cName,
      'Date Naissance': formatDate(s.birthDate || s.dateOfBirth),
      'Lieu Naissance': s.birthPlace || '',
      'Statut': s.status === 'active' ? 'Inscrit' : 'Inactif',
      'Scolarité Totale (FCFA)': total,
      'Scolarité Payée (FCFA)': paid,
      'Reste à Payer (FCFA)': remaining,
      'Taux Règlement': `${Math.round((paid / (total || 1)) * 100)}%`,
      'Nom Tuteur': s.guardianName || '',
      'Téléphone Tuteur': s.guardianPhone || '',
      'Adresse Tuteur': s.guardianAddress || '',
      'Identifiant Espace Élève': s.loginUsername || s.matricule.toLowerCase(),
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 5 },  // N°
    { wch: 15 }, // Matricule
    { wch: 18 }, // Nom
    { wch: 20 }, // Prénoms
    { wch: 10 }, // Sexe
    { wch: 12 }, // Classe
    { wch: 14 }, // Date Naissance
    { wch: 16 }, // Lieu
    { wch: 10 }, // Statut
    { wch: 22 }, // Scolarité Totale
    { wch: 22 }, // Payée
    { wch: 20 }, // Reste
    { wch: 14 }, // %
    { wch: 22 }, // Tuteur
    { wch: 18 }, // Téléphone
    { wch: 24 }, // Adresse
    { wch: 22 }, // Login
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Élèves');

  const classNameSuffix = options?.className ? `_${options.className.replace(/\s+/g, '_')}` : '';
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `SysGesco_Eleves${classNameSuffix}_${dateStr}.xlsx`);
};

/**
 * Export Grades / Evaluation to Excel (.xlsx)
 */
export const exportGradesToExcel = (
  grades: Grade[],
  students: Student[],
  classes: ClassRoom[],
  subjects: Subject[],
  options: {
    classId: string;
    term: string;
    subjectId?: string;
    evaluationTitle?: string;
    institution: Institution;
  }
) => {
  const classObj = classes.find((c) => c.id === options.classId);
  const classStudents = students.filter((s) => s.classId === options.classId);
  const subjectMap = new Map(subjects.map((sub) => [sub.id, sub.name]));

  // Filter grades for this class and term
  const relevantGrades = grades.filter((g) => {
    if (g.classId !== options.classId) return false;
    if (g.term !== options.term) return false;
    if (options.subjectId && options.subjectId !== 'all' && g.subjectId !== options.subjectId) return false;
    if (options.evaluationTitle && g.evaluationTitle !== options.evaluationTitle) return false;
    return true;
  });

  const studentMap = new Map(students.map((s) => [s.id, s]));

  const data = relevantGrades.map((g, idx) => {
    const student = studentMap.get(g.studentId);
    return {
      'N°': idx + 1,
      'Classe': classObj?.name || 'Classe',
      'Trimestre': g.term,
      'Matière': subjectMap.get(g.subjectId) || g.subjectId,
      'Évaluation': g.evaluationTitle,
      'Type': g.evaluationType || 'Devoir',
      'Date': formatDate(g.date),
      'Matricule': student?.matricule || '',
      'Nom': student ? student.lastName.toUpperCase() : '',
      'Prénoms': student ? student.firstName : '',
      'Note / 20': g.value,
      'Coeff.': g.coefficient,
      'Points (Note x Coeff)': Number((g.value * g.coefficient).toFixed(2)),
      'Statut': g.status?.startsWith('absent') ? 'Absent' : 'Présent',
      'Appréciation': g.comment || (g.value >= 16 ? 'Très Bien' : g.value >= 14 ? 'Bien' : g.value >= 12 ? 'Assez Bien' : g.value >= 10 ? 'Passable' : 'Insuffisant'),
    };
  });

  // If no specific evaluation, list all students with their grades
  const finalData = data.length > 0 ? data : classStudents.map((s, idx) => ({
    'N°': idx + 1,
    'Classe': classObj?.name || 'Classe',
    'Trimestre': options.term,
    'Matière': options.subjectId ? (subjectMap.get(options.subjectId) || options.subjectId) : 'Toutes',
    'Évaluation': options.evaluationTitle || 'Relevé de notes',
    'Type': 'Évaluation',
    'Date': new Date().toLocaleDateString('fr-FR'),
    'Matricule': s.matricule,
    'Nom': s.lastName.toUpperCase(),
    'Prénoms': s.firstName,
    'Note / 20': 0,
    'Coeff.': 1,
    'Points (Note x Coeff)': 0,
    'Statut': 'Non évalué',
    'Appréciation': '',
  }));

  const ws = XLSX.utils.json_to_sheet(finalData);

  ws['!cols'] = [
    { wch: 5 },  // N°
    { wch: 12 }, // Classe
    { wch: 10 }, // Trimestre
    { wch: 18 }, // Matière
    { wch: 22 }, // Évaluation
    { wch: 12 }, // Type
    { wch: 12 }, // Date
    { wch: 15 }, // Matricule
    { wch: 18 }, // Nom
    { wch: 20 }, // Prénoms
    { wch: 12 }, // Note
    { wch: 8 },  // Coeff
    { wch: 20 }, // Points
    { wch: 12 }, // Statut
    { wch: 24 }, // Appréciation
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Notes');

  const classTag = classObj ? classObj.name.replace(/\s+/g, '_') : 'Classe';
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `SysGesco_Notes_${classTag}_${options.term}_${dateStr}.xlsx`);
};

/**
 * Export Cashier / Finance Journal to Excel (.xlsx)
 */
export const exportCashierToExcel = (
  payments: Payment[],
  students: Student[],
  classes: ClassRoom[],
  institution: Institution,
  options?: ExportFilterOptions
) => {
  let filtered = [...payments];

  if (options?.classId && options.classId !== 'all') {
    filtered = filtered.filter((p) => p.classId === options.classId);
  }
  if (options?.paymentMethod && options.paymentMethod !== 'all') {
    filtered = filtered.filter((p) => p.paymentMethod === options.paymentMethod);
  }
  if (options?.startDate) {
    filtered = filtered.filter((p) => p.date >= (options.startDate as string));
  }
  if (options?.endDate) {
    filtered = filtered.filter((p) => p.date <= `${options.endDate} 23:59:59`);
  }

  // Sort descending by date
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let totalAmount = 0;

  const data = filtered.map((p, idx) => {
    totalAmount += p.amount || 0;
    return {
      'N°': idx + 1,
      'Réf. Reçu': p.receiptNumber,
      'Date & Heure': p.date,
      'Matricule': p.studentMatricule || '',
      'Nom de l’Élève': p.studentName,
      'Classe': p.className || '',
      'Montant Encaissé (FCFA)': p.amount,
      'Mode de Règlement': p.paymentMethod,
      'Caissier / Opérateur': p.cashierName || 'Caisse Centrale',
      'Solde Antérieur (FCFA)': p.previousBalance ?? '',
      'Reste Dû (FCFA)': p.newBalance ?? '',
      'Motif / Observation': p.observation || '',
      'Année Scolaire': p.academicYear || institution.academicYear,
    };
  });

  // Append Total summary row
  data.push({
    'N°': '' as any,
    'Réf. Reçu': 'TOTAL ENCAISSEMENTS' as any,
    'Date & Heure': `${data.length} transactions` as any,
    'Matricule': '',
    'Nom de l’Élève': '',
    'Classe': '',
    'Montant Encaissé (FCFA)': totalAmount,
    'Mode de Règlement': '' as any,
    'Caissier / Opérateur': '',
    'Solde Antérieur (FCFA)': '' as any,
    'Reste Dû (FCFA)': '' as any,
    'Motif / Observation': 'Clôture de journal exporté',
    'Année Scolaire': '',
  });

  const ws = XLSX.utils.json_to_sheet(data);

  ws['!cols'] = [
    { wch: 5 },  // N°
    { wch: 18 }, // Reçu
    { wch: 20 }, // Date
    { wch: 15 }, // Matricule
    { wch: 24 }, // Nom
    { wch: 12 }, // Classe
    { wch: 24 }, // Montant
    { wch: 16 }, // Mode
    { wch: 20 }, // Caissier
    { wch: 22 }, // Solde ant
    { wch: 20 }, // Reste
    { wch: 26 }, // Motif
    { wch: 14 }, // Année
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Livre de Caisse');

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `SysGesco_Journal_Caisse_${dateStr}.xlsx`);
};

// ============================================================================
// PDF EXPORTS (Official Printable Reports)
// ============================================================================

/**
 * Add official header to jsPDF document
 */
const addOfficialPdfHeader = (
  doc: jsPDF,
  institution: Institution,
  title: string,
  subTitle?: string
) => {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top Republic Header (Left & Right alignment)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  // Left: Ministry
  doc.text("RÉPUBLIQUE DE CÔTE D'IVOIRE", 14, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Union - Discipline - Travail", 14, 16);
  doc.text("MINISTÈRE DE L'ÉDUCATION NATIONALE", 14, 20);
  doc.text("ET DE L'ALPHABÉTISATION", 14, 24);

  // Right: Institution & Year
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 35, 111); // Brand Blue #1e3a5f
  doc.text(institution.name.toUpperCase(), pageWidth - 14, 12, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Année Scolaire : ${institution.academicYear}`, pageWidth - 14, 16, { align: 'right' });
  if (institution.code) {
    doc.text(`Code Établissement : ${institution.code}`, pageWidth - 14, 20, { align: 'right' });
  }
  doc.text(`Tél : ${institution.phone || '+225 27 20 00 00'}`, pageWidth - 14, 24, { align: 'right' });

  // Top dividing decorative line
  doc.setDrawColor(0, 35, 111);
  doc.setLineWidth(0.6);
  doc.line(14, 27, pageWidth - 14, 27);

  // Main Report Title Banner
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(14, 30, pageWidth - 28, 14, 'F');
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.2);
  doc.rect(14, 30, pageWidth - 28, 14, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 35, 111);
  doc.text(title.toUpperCase(), pageWidth / 2, 37, { align: 'center' });

  if (subTitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(subTitle, pageWidth / 2, 41.5, { align: 'center' });
  }
};

/**
 * Add official validation signatures and footer to jsPDF document
 */
const addOfficialPdfFooter = (doc: jsPDF, pageCount: number) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // If last page, print Signatures block
    if (i === pageCount) {
      const sigY = pageHeight - 34;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`Fait à Abidjan, le ${new Date().toLocaleDateString('fr-FR')}`, 14, sigY);

      doc.setFont('helvetica', 'bold');
      doc.text("L'Intendant / Comptable", 30, sigY + 6);
      doc.text("Le Chef d'Établissement / La Direction", pageWidth - 70, sigY + 6);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("(Signature & Cachet)", 33, sigY + 18);
      doc.text("(Signature & Cachet)", pageWidth - 58, sigY + 18);
    }

    // Bottom running footer
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(14, pageHeight - 10, pageWidth - 14, pageHeight - 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `SysGesco Côte d'Ivoire - Système Sécurisé de Gestion Scolaire • Document certifié conforme`,
      14,
      pageHeight - 6
    );
    doc.text(
      `Page ${i} sur ${pageCount}`,
      pageWidth - 14,
      pageHeight - 6,
      { align: 'right' }
    );
  }
};

/**
 * Export Students List to Printable PDF
 */
export const exportStudentsToPdf = (
  students: Student[],
  classes: ClassRoom[],
  institution: Institution,
  options?: ExportFilterOptions
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const filtered = options?.classId && options.classId !== 'all'
    ? students.filter((s) => s.classId === options.classId)
    : students;

  const classObj = classes.find((c) => c.id === options?.classId);
  const classTitle = classObj ? `CLASSE : ${classObj.name}` : 'TOUTES LES CLASSES';
  const subTitle = `${classTitle} • EFFECTIF TOTAL : ${filtered.length} ÉLÈVES • DOCUMENT OFFICIEL`;

  addOfficialPdfHeader(doc, institution, 'LISTE OFFICIELLE DES ÉLÈVES INSCRITS', subTitle);

  const classMap = new Map(classes.map((c) => [c.id, c.name]));

  // Table Body
  const tableRows = filtered.map((s, idx) => {
    const cName = classMap.get(s.classId) || '-';
    const total = s.tuitionTotal || 350000;
    const paid = s.tuitionPaid || 0;
    const remaining = Math.max(0, total - paid);

    return [
      idx + 1,
      s.matricule,
      s.lastName.toUpperCase(),
      s.firstName,
      s.gender || 'M',
      cName,
      formatDate(s.birthDate || s.dateOfBirth),
      s.guardianName || '-',
      s.guardianPhone || '-',
      formatMoney(paid),
      formatMoney(remaining),
      s.loginUsername || s.matricule.toLowerCase(),
    ];
  });

  autoTable(doc, {
    startY: 48,
    head: [[
      'N°',
      'Matricule',
      'Nom',
      'Prénoms',
      'Sexe',
      'Classe',
      'Né(e) le',
      'Tuteur Légal',
      'Contact',
      'Payé',
      'Reste Dû',
      'Login Accès',
    ]],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 1.8,
      lineColor: [226, 232, 240],
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [0, 35, 111],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { fontStyle: 'bold', halign: 'center', cellWidth: 26 },
      2: { fontStyle: 'bold', cellWidth: 28 },
      3: { cellWidth: 32 },
      4: { halign: 'center', cellWidth: 10 },
      5: { halign: 'center', cellWidth: 18 },
      6: { halign: 'center', cellWidth: 20 },
      7: { cellWidth: 28 },
      8: { halign: 'center', cellWidth: 24 },
      9: { halign: 'right', cellWidth: 24, textColor: [16, 149, 106] },
      10: { halign: 'right', cellWidth: 24, textColor: [225, 29, 72] },
      11: { fontStyle: 'bold', halign: 'center', cellWidth: 24 },
    },
    margin: { left: 14, right: 14, bottom: 42 },
  });

  const pageCount = (doc as any).internal.getNumberOfPages();
  addOfficialPdfFooter(doc, pageCount);

  const classNameSuffix = options?.className ? `_${options.className.replace(/\s+/g, '_')}` : '';
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`SysGesco_Liste_Eleves${classNameSuffix}_${dateStr}.pdf`);
};

/**
 * Export Grades / Procès-Verbal to Printable PDF
 */
export const exportGradesToPdf = (
  grades: Grade[],
  students: Student[],
  classes: ClassRoom[],
  subjects: Subject[],
  options: {
    classId: string;
    term: string;
    subjectId?: string;
    evaluationTitle?: string;
    institution: Institution;
  }
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const classObj = classes.find((c) => c.id === options.classId);
  const classStudents = students.filter((s) => s.classId === options.classId);
  const subjectMap = new Map(subjects.map((sub) => [sub.id, sub.name]));
  const subjectName = options.subjectId ? (subjectMap.get(options.subjectId) || options.subjectId) : 'Toutes matières';

  const subTitle = `CLASSE : ${classObj?.name || 'Classe'} • ${options.term} • MATIÈRE : ${subjectName.toUpperCase()} • ÉVALUATION : ${options.evaluationTitle || 'Relevé général'}`;

  addOfficialPdfHeader(doc, options.institution, 'PROCÈS-VERBAL RÉCAPITULATIF DES NOTES', subTitle);

  // Relevant grades
  const relevantGrades = grades.filter((g) => {
    if (g.classId !== options.classId) return false;
    if (g.term !== options.term) return false;
    if (options.subjectId && options.subjectId !== 'all' && g.subjectId !== options.subjectId) return false;
    if (options.evaluationTitle && g.evaluationTitle !== options.evaluationTitle) return false;
    return true;
  });

  const gradeMap = new Map(relevantGrades.map((g) => [g.studentId, g]));

  // Build rows for each student in class
  let noteSum = 0;
  let countNotes = 0;
  let admittedCount = 0;

  const tableRows = classStudents.map((s, idx) => {
    const g = gradeMap.get(s.id);
    const noteVal = g ? g.value : 0;
    const isPresent = g ? !g.status?.startsWith('absent') : false;

    if (g && isPresent) {
      noteSum += noteVal;
      countNotes++;
      if (noteVal >= 10) admittedCount++;
    }

    const apprec = !g
      ? 'Non évalué'
      : !isPresent
      ? 'Absent Justifié'
      : noteVal >= 16
      ? 'Très Bien'
      : noteVal >= 14
      ? 'Bien'
      : noteVal >= 12
      ? 'Assez Bien'
      : noteVal >= 10
      ? 'Passable'
      : noteVal >= 8
      ? 'Insuffisant'
      : 'Faible';

    return [
      idx + 1,
      s.matricule,
      s.lastName.toUpperCase(),
      s.firstName,
      g && isPresent ? `${noteVal.toFixed(2)} / 20` : (g?.status?.startsWith('absent') ? 'ABS' : '-'),
      g ? g.coefficient : 1,
      g && isPresent ? (noteVal * (g.coefficient || 1)).toFixed(2) : '-',
      g?.status?.startsWith('absent') ? 'Absent' : 'Présent',
      apprec,
    ];
  });

  // Calculate Average
  const classAvg = countNotes > 0 ? (noteSum / countNotes).toFixed(2) : '0.00';
  const successRate = countNotes > 0 ? `${Math.round((admittedCount / countNotes) * 100)}%` : '0%';

  // Summary box before table
  doc.setFillColor(238, 242, 255); // indigo-50
  doc.rect(14, 47, doc.internal.pageSize.getWidth() - 28, 8, 'F');
  doc.setDrawColor(199, 210, 254);
  doc.rect(14, 47, doc.internal.pageSize.getWidth() - 28, 8, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(49, 46, 129);
  doc.text(
    `Statistiques : Effectif évalué : ${countNotes}/${classStudents.length}  |  Moyenne de classe : ${classAvg} / 20  |  Taux de réussite (>=10/20) : ${successRate}`,
    18,
    52
  );

  autoTable(doc, {
    startY: 58,
    head: [[
      'N°',
      'Matricule',
      'Nom',
      'Prénoms',
      'Note',
      'Coeff',
      'Points',
      'Présence',
      'Appréciation',
    ]],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [226, 232, 240],
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [0, 35, 111],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { fontStyle: 'bold', halign: 'center', cellWidth: 30 },
      2: { fontStyle: 'bold', cellWidth: 35 },
      3: { cellWidth: 40 },
      4: { fontStyle: 'bold', halign: 'center', cellWidth: 20 },
      5: { halign: 'center', cellWidth: 12 },
      6: { halign: 'right', cellWidth: 18 },
      7: { halign: 'center', cellWidth: 18 },
      8: { cellWidth: 30 },
    },
    margin: { left: 14, right: 14, bottom: 42 },
  });

  const pageCount = (doc as any).internal.getNumberOfPages();
  addOfficialPdfFooter(doc, pageCount);

  const classTag = classObj ? classObj.name.replace(/\s+/g, '_') : 'Classe';
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`SysGesco_PV_Notes_${classTag}_${options.term}_${dateStr}.pdf`);
};

/**
 * Export Cashier / Finance Journal to Printable PDF
 */
export const exportCashierToPdf = (
  payments: Payment[],
  students: Student[],
  classes: ClassRoom[],
  institution: Institution,
  options?: ExportFilterOptions
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  let filtered = [...payments];

  if (options?.classId && options.classId !== 'all') {
    filtered = filtered.filter((p) => p.classId === options.classId);
  }
  if (options?.paymentMethod && options.paymentMethod !== 'all') {
    filtered = filtered.filter((p) => p.paymentMethod === options.paymentMethod);
  }
  if (options?.startDate) {
    filtered = filtered.filter((p) => p.date >= (options.startDate as string));
  }
  if (options?.endDate) {
    filtered = filtered.filter((p) => p.date <= `${options.endDate} 23:59:59`);
  }

  // Sort descending by date
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalCash = filtered.reduce((acc, p) => acc + (p.amount || 0), 0);
  const subTitle = `PÉRIODE : ${options?.startDate ? formatDate(options.startDate) : 'Origine'} AU ${options?.endDate ? formatDate(options.endDate) : new Date().toLocaleDateString('fr-FR')} • TOTAL ENCAISSÉ : ${formatMoney(totalCash)} • TRANSACTIONS : ${filtered.length}`;

  addOfficialPdfHeader(doc, institution, 'JOURNAL GÉNÉRAL DE LA CAISSE ET DES RECOUVREMENTS', subTitle);

  // Table Body
  const tableRows = filtered.map((p, idx) => {
    return [
      idx + 1,
      p.receiptNumber,
      p.date.slice(0, 16),
      p.studentMatricule || '-',
      p.studentName,
      p.className || '-',
      formatMoney(p.amount),
      p.paymentMethod,
      p.cashierName || 'Caisse Centrale',
      p.newBalance !== undefined ? formatMoney(p.newBalance) : '-',
      p.observation || '-',
    ];
  });

  autoTable(doc, {
    startY: 48,
    head: [[
      'N°',
      'N° Reçu',
      'Date & Heure',
      'Matricule',
      'Élève',
      'Classe',
      'Montant Encaissé',
      'Mode',
      'Caissier',
      'Reste Scolarité',
      'Motif / Observation',
    ]],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 1.8,
      lineColor: [226, 232, 240],
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [0, 35, 111],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { fontStyle: 'bold', halign: 'center', cellWidth: 26 },
      2: { halign: 'center', cellWidth: 24 },
      3: { halign: 'center', cellWidth: 24 },
      4: { fontStyle: 'bold', cellWidth: 32 },
      5: { halign: 'center', cellWidth: 16 },
      6: { fontStyle: 'bold', halign: 'right', cellWidth: 26, textColor: [16, 149, 106] },
      7: { halign: 'center', cellWidth: 22 },
      8: { cellWidth: 26 },
      9: { halign: 'right', cellWidth: 24 },
      10: { cellWidth: 38 },
    },
    margin: { left: 14, right: 14, bottom: 42 },
  });

  const pageCount = (doc as any).internal.getNumberOfPages();
  addOfficialPdfFooter(doc, pageCount);

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`SysGesco_Journal_Caisse_${dateStr}.pdf`);
};
