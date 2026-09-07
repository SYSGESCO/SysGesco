/**
 * SysGesco - ERP Scolaire Offline-First Multi-Établissements
 * Core Domain Types & Data Contracts
 */

export type UserRole = 'direction' | 'teacher' | 'cashier' | 'student' | 'parent' | 'superadmin';

export type PaymentMethod = 'Orange Money' | 'MTN Money' | 'Moov Money' | 'Wave' | 'Espèce';

export type TermType = 'T1' | 'T2' | 'T3';

export type AttendanceStatus = 'present' | 'absent_unjustified' | 'absent_justified' | 'late';

export type ReportCardStatus = 'preparation' | 'valide' | 'publie';

export interface Institution {
  id: string;
  code: string; // e.g., 'SG-2026-00001'
  name: string;
  type: string; // 'Collège' | 'Lycée' | 'Collège & Lycée' | 'Établissement primaire' | 'Établissement secondaire' | 'Autre'
  address: string;
  city: string;
  commune?: string;
  neighborhood?: string;
  phone: string;
  email: string;
  academicYear: string; // e.g. '2026-2027'
  status: 'active' | 'suspended' | 'archived';
  directorName: string;
  isDemo?: boolean;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoleAccountConfig {
  fullName: string;
  username: string;
  password: string;
  phone?: string;
  email?: string;
  speciality?: string;
  className?: string;
}

export interface InstitutionRegistrationPayload {
  name: string;
  type: string;
  logoUrl?: string;
  address?: string;
  city: string;
  commune?: string;
  neighborhood?: string;
  phone?: string;
  email?: string;
  academicYear: string;
  roles: {
    direction: {
      fullName: string;
      username: string;
      password: string;
      phone?: string;
      email?: string;
    };
    cashier: {
      fullName: string;
      username: string;
      password: string;
      phone?: string;
      email?: string;
    };
    teacher: {
      fullName: string;
      subject: string;
      username: string;
      password: string;
      phone?: string;
      email?: string;
    };
    student: {
      fullName: string;
      className: string;
      matricule: string;
      password: string;
      gender?: 'M' | 'F';
    };
    parent: {
      fullName: string;
      username: string;
      password: string;
      phone: string;
      email?: string;
    };
  };
}

export interface User {
  id: string;
  institutionId: string; // Critical for multi-tenant isolation
  username: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  email?: string;
  linkedEntityId?: string; // Teacher ID, Student ID, or Parent ID
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface ClassRoom {
  id: string;
  institutionId: string;
  name: string; // e.g. '3ème A', '6ème A'
  level: string; // '6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'
  room: string; // e.g. 'Salle 14 (Bât. B)'
  mainTeacherId?: string;
  academicYear: string;
  capacity: number;
  studentCount?: number;
  tuitionFee?: number;
}

export interface Subject {
  id: string;
  institutionId?: string;
  name: string;
  code: string;
  coefficient: number;
  defaultCoefficient?: number;
}

export interface Teacher {
  id: string;
  institutionId: string;
  userId?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  subject: string;
  specialty?: string;
  weeklyHours?: number;
  assignedClassIds: string[];
  isMainTeacherOfClassId?: string;
  status: 'active' | 'inactive';
  loginUsername?: string; // Login espace professeur
  loginPassword?: string; // Mot de passe espace professeur
}

export interface Student {
  id: string;
  institutionId: string;
  matricule: string; // e.g. 'MAT-2026-0418'
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
  classId: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  guardianAddress?: string;
  tuitionTotal: number; // Total frais dus in FCFA
  tuitionPaid: number;  // Total payé in FCFA
  enrollmentDate: string;
  status: 'active' | 'transferred' | 'suspended';
  photoUrl?: string;
  loginUsername?: string; // Login espace élève
  loginPassword?: string; // Mot de passe espace élève
}

export interface Parent {
  id: string;
  institutionId: string;
  userId?: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  studentIds: string[];
}

export interface Payment {
  id: string;
  institutionId: string;
  receiptNumber: string; // e.g. 'REC-2026-000001'
  studentId: string;
  studentName: string;
  studentMatricule: string;
  classId: string;
  className: string;
  amount: number; // in FCFA
  paymentMethod: PaymentMethod;
  cashierName: string;
  date: string; // ISO date or 'YYYY-MM-DD HH:mm'
  observation?: string;
  previousBalance: number;
  newBalance: number;
  academicYear: string;
}

export type SchoolClass = ClassRoom;

export interface Grade {
  id: string;
  institutionId: string;
  studentId: string;
  studentMatricule?: string;
  studentName?: string;
  classId: string;
  subjectId: string;
  teacherId?: string;
  term: TermType;
  type?: 'interro' | 'devoir' | 'compo' | string;
  evaluationTitle?: string;
  evaluationType?: string;
  title?: string;
  note?: number;
  value?: number; // e.g. 16.5
  maxScale?: number; // 20
  maxScore?: number; // 20
  coefficient: number;
  date: string;
  status?: 'present' | 'absent_justified' | 'absent_unjustified' | 'dispensed';
  comment?: string;
  observation?: string;
}

export type GradeEntry = Grade;

export interface ReportCardSubjectSummary {
  subjectId: string;
  subjectName: string;
  coefficient: number;
  termAverage: number;
  totalPoints: number;
  classRank: number;
  teacherName: string;
  teacherAppreciation: string;
}

export interface ReportCard {
  id: string;
  institutionId: string;
  studentId: string;
  term: TermType;
  academicYear: string;
  generalAverage: number;
  classRank: number;
  classTotalStudents: number;
  classAverage: number;
  totalPoints: number;
  totalCoefficients: number;
  subjects: ReportCardSubjectSummary[];
  conductAppreciation: string;
  councilDecision: string;
  mainTeacherAppreciation: string;
  status: ReportCardStatus;
  isLocked: boolean;
  generatedAt: string;
}

export type DayOfWeek = 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi';

export interface TimetableSlot {
  id: string;
  institutionId: string;
  day: DayOfWeek;
  dayOfWeek?: DayOfWeek;
  startTime: string; // '08:00'
  endTime: string;   // '10:00'
  classId: string;
  subjectId: string;
  teacherId: string;
  room: string;
  status?: 'confirmed' | 'conflict';
  conflictReason?: string;
}

export interface Homework {
  id: string;
  institutionId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  title: string;
  instructions?: string;
  dueDate: string;
  publishedDate?: string;
  status: 'todo' | 'late' | 'done' | 'pending';
}

export interface AttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceRecord {
  id: string;
  institutionId: string;
  studentId?: string;
  classId: string;
  date: string; // YYYY-MM-DD
  timeSlot?: string;
  period?: string;
  teacherId?: string;
  subjectId?: string;
  status?: AttendanceStatus;
  lateMinutes?: number;
  justified?: boolean;
  note?: string;
  entries?: AttendanceEntry[];
  observation?: string;
  createdAt?: string;
}

export interface ActivityLog {
  id: string;
  institutionId: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  element: string;
  details?: string;
}

export interface InstitutionSettings {
  id: string;
  institutionId: string;
  currency: string; // 'FCFA'
  defaultTuition: number;
  schoolYear: string;
  enableRankings: boolean;
  logoUrl?: string;
}

export interface BackupData {
  version: string;
  exportDate: string;
  institution: Institution;
  users: User[];
  classes: ClassRoom[];
  teachers: Teacher[];
  students: Student[];
  parents: Parent[];
  payments: Payment[];
  grades: Grade[];
  reportCards: ReportCard[];
  timetable: TimetableSlot[];
  homework: Homework[];
  attendance: AttendanceRecord[];
  activityLogs: ActivityLog[];
  settings: InstitutionSettings;
}
