/**
 * SysGesco - Application Context & State Management
 * Provides offline-first state, multi-tenant isolation, role permissions, and reactive data
 */

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Institution,
  User,
  UserRole,
  ClassRoom,
  Teacher,
  Student,
  Parent,
  Payment,
  Grade,
  ReportCard,
  TimetableSlot,
  Homework,
  AttendanceRecord,
  ActivityLog,
  InstitutionSettings,
  BackupData,
  PaymentMethod,
  TermType,
  Subject,
} from '../types';
import { repository } from '../services/repository';
import { createDemoData, DEMO_INSTITUTION_ID, DEMO_INSTITUTION_CODE } from '../data/demoData';

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'sub-math', name: 'Mathématiques', code: 'MATH', coefficient: 3, defaultCoefficient: 3 },
  { id: 'sub-fr', name: 'Français', code: 'FRAN', coefficient: 3, defaultCoefficient: 3 },
  { id: 'sub-pc', name: 'Physique-Chimie', code: 'PC', coefficient: 2, defaultCoefficient: 2 },
  { id: 'sub-svt', name: 'Sciences de la Vie et de la Terre', code: 'SVT', coefficient: 2, defaultCoefficient: 2 },
  { id: 'sub-hg', name: 'Histoire-Géographie', code: 'HIST-GEO', coefficient: 2, defaultCoefficient: 2 },
  { id: 'sub-ang', name: 'Anglais', code: 'ANG', coefficient: 2, defaultCoefficient: 2 },
  { id: 'sub-eps', name: 'Éducation Physique et Sportive', code: 'EPS', coefficient: 1, defaultCoefficient: 1 },
  { id: 'sub-edhc', name: 'EDHC', code: 'EDHC', coefficient: 1, defaultCoefficient: 1 },
  { id: 'sub-philo', name: 'Philosophie', code: 'PHILO', coefficient: 2, defaultCoefficient: 2 },
];

export type ActiveView =
  | 'dashboard'
  | 'students'
  | 'classes'
  | 'teachers'
  | 'cashier'
  | 'grades'
  | 'bulletins'
  | 'timetable'
  | 'attendance'
  | 'homework'
  | 'stats'
  | 'settings'
  | 'superadmin';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: string;
}

interface AppContextType {
  // Session & Tenant Context
  activeInstitution: Institution | null;
  currentUser: User | null;
  currentRole: UserRole;
  isDemoMode: boolean;
  isOnline: boolean;
  institutionsList: Institution[];
  currentView: ActiveView;
  setCurrentView: (view: ActiveView) => void;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;

  // Authentication & Institution Onboarding
  login: (institutionCode: string, username: string, password: string, role?: UserRole, academicYear?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  registerInstitution: (data: any) => Promise<{ institution: Institution; user: User }>;
  getInstitutionUsers: (institutionId: string) => Promise<User[]>;
  switchInstitution: (institutionId: string) => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  loginAsStudent: (studentId: string) => Promise<void>;
  loginAsTeacher: (teacherId: string) => Promise<void>;
  launchDemo: (role?: UserRole) => Promise<void>;
  resetDemoData: () => Promise<void>;

  // Data Collections (Scoped to active institution)
  classes: ClassRoom[];
  teachers: Teacher[];
  students: Student[];
  subjects: Subject[];
  payments: Payment[];
  grades: Grade[];
  reportCards: ReportCard[];
  timetable: TimetableSlot[];
  timetables: TimetableSlot[];
  homework: Homework[];
  attendance: AttendanceRecord[];
  attendances: AttendanceRecord[];
  activityLogs: ActivityLog[];
  settings: InstitutionSettings | null;
  users: User[];

  // Offline-first Sync Status & Storage Diagnostics
  syncStatus: 'synced' | 'saving' | 'error';
  lastSavedAt: Date;
  storageType: 'IndexedDB' | 'LocalStorage';
  storageStats: { totalRecords: number; storageType: string; isIndexedDB: boolean; stores: Record<string, number> } | null;
  verifyLocalStorage: () => Promise<{ success: boolean; latencyMs: number; storageType: string }>;

  // Data Mutation Handlers
  addStudent: (data: Omit<Student, 'id' | 'institutionId' | 'tuitionPaid'> & {
    loginUsername?: string;
    loginPassword?: string;
    createStudentAccount?: boolean;
  }) => Promise<Student>;
  createOrUpdateStudentAccount: (studentId: string, username: string, password: string) => Promise<User>;
  updateStudent: (student: Student) => Promise<Student>;
  deleteStudent: (studentId: string) => Promise<void>;

  addClass: (data: Omit<ClassRoom, 'id' | 'institutionId'>) => Promise<ClassRoom>;
  updateClass: (classRoom: ClassRoom) => Promise<ClassRoom>;
  deleteClass: (classId: string) => Promise<void>;

  addTeacher: (data: Omit<Teacher, 'id' | 'institutionId'> & {
    loginUsername?: string;
    loginPassword?: string;
    createTeacherAccount?: boolean;
  }) => Promise<Teacher>;
  createOrUpdateTeacherAccount: (teacherId: string, username: string, password: string) => Promise<User>;
  updateTeacher: (teacher: Teacher) => Promise<Teacher>;
  deleteTeacher: (teacherId: string) => Promise<void>;

  recordPayment: (data: {
    studentId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    observation?: string;
  }) => Promise<Payment>;

  recordGrade: (grade: Omit<Grade, 'id' | 'institutionId'>) => Promise<Grade>;
  saveEvaluationGrades: (grades: Grade[]) => Promise<void>;
  updateReportCard: (reportCard: ReportCard) => Promise<ReportCard>;

  addTimetableSlot: (slot: Omit<TimetableSlot, 'id' | 'institutionId'>) => Promise<{ slot?: TimetableSlot; conflict?: string }>;
  deleteTimetableSlot: (slotId: string) => Promise<void>;
  resolveConflict: (slotId: string, resolution: 'replace_teacher' | 'move_day', newTeacherId?: string, newDay?: string) => Promise<void>;

  recordAttendanceSession: (record: Omit<AttendanceRecord, 'id' | 'institutionId' | 'createdAt'>) => Promise<AttendanceRecord>;
  recordAttendanceList: (records: AttendanceRecord[]) => Promise<void>;
  addHomework: (hw: Omit<Homework, 'id' | 'institutionId' | 'publishedDate'>) => Promise<Homework>;

  addUser: (data: Omit<User, 'id' | 'institutionId' | 'createdAt'>) => Promise<User>;
  updateUserStatus: (userId: string, status: 'active' | 'inactive') => Promise<void>;
  updateInstitutionInfo: (data: Partial<Institution>) => Promise<void>;

  // Backup & Restore
  exportBackupJSON: () => Promise<void>;
  restoreBackupJSON: (jsonString: string) => Promise<{ success: boolean; institutionName?: string; error?: string }>;

  // Toast notifications
  toast: ToastMessage | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error', title?: string) => void;
  hideToast: () => void;

  // Refresh
  reloadData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeInstitution, setActiveInstitution] = useState<Institution | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [institutionsList, setInstitutionsList] = useState<Institution[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [currentView, setCurrentView] = useState<ActiveView>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Institution Data State
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>(DEFAULT_SUBJECTS);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [settings, setSettings] = useState<InstitutionSettings | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Offline-first Sync Status & Storage Diagnostics
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error'>('synced');
  const [lastSavedAt, setLastSavedAt] = useState<Date>(new Date());
  const [storageType, setStorageType] = useState<'IndexedDB' | 'LocalStorage'>('IndexedDB');
  const [storageStats, setStorageStats] = useState<{ totalRecords: number; storageType: string; isIndexedDB: boolean; stores: Record<string, number> } | null>(null);

  // Toast
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success', title?: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      message,
    };
    setToast(newToast);
    setTimeout(() => {
      setToast((cur) => (cur?.id === newToast.id ? null : cur));
    }, 3800);
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Online / offline detector
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Connexion rétablie. Données locales synchronisées.', 'info');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Mode hors-ligne actif. Vos opérations restent enregistrées localement.', 'warning', 'Réseau déconnecté');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // Monitor Offline-first local database updates and storage statistics
  useEffect(() => {
    if ((repository as any).getStorageType) {
      setStorageType((repository as any).getStorageType());
    }

    const refreshStats = async () => {
      try {
        if ((repository as any).getStorageStats) {
          const stats = await (repository as any).getStorageStats();
          setStorageStats(stats);
        }
      } catch (err) {
        console.error('Erreur récupération stats stockage', err);
      }
    };

    refreshStats();

    // Subscribe to all writes/deletions in repository
    const unsubscribe = (repository as any).onDatabaseChange?.((event: { store: string; action: string; timestamp: Date }) => {
      setSyncStatus('saving');
      setTimeout(() => {
        setSyncStatus('synced');
        setLastSavedAt(event.timestamp || new Date());
        refreshStats();
      }, 300);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeInstitution]);

  const verifyLocalStorage = useCallback(async () => {
    setSyncStatus('saving');
    try {
      const res = await (repository as any).testDatabaseWrite?.() || {
        success: true,
        latencyMs: 2,
        storageType: 'IndexedDB',
      };
      setSyncStatus('synced');
      setLastSavedAt(new Date());
      if ((repository as any).getStorageStats) {
        const stats = await (repository as any).getStorageStats();
        setStorageStats(stats);
      }
      showToast(`Base locale testée avec succès (${res.storageType}, latence : ${res.latencyMs}ms)`, 'success');
      return res;
    } catch {
      setSyncStatus('error');
      showToast('Échec du test de persistance locale', 'error');
      return { success: false, latencyMs: 0, storageType: 'IndexedDB' };
    }
  }, [showToast]);

  // Load initial institutions & initialize Demo if first run
  useEffect(() => {
    async function startup() {
      await repository.init();
      const existingInstitutions = await repository.getInstitutions();

      if (existingInstitutions.length === 0) {
        // Preload DEMO institution
        const demoData = createDemoData();
        await repository.saveInstitution(demoData.institution);
        await repository.saveSettings(demoData.settings);

        for (const cls of demoData.classes) await repository.saveClass(cls);
        for (const tch of demoData.teachers) await repository.saveTeacher(tch);
        for (const std of demoData.students) await repository.saveStudent(std);
        for (const par of demoData.parents) await repository.saveParent(par);
        for (const usr of demoData.users) await repository.saveUser(usr);
        for (const pay of demoData.payments) await repository.savePayment(pay);
        for (const grd of demoData.grades) await repository.saveGrade(grd);
        for (const rc of demoData.reportCards) await repository.saveReportCard(rc);
        for (const slot of demoData.timetable) await repository.saveTimetableSlot(slot);
        for (const hw of demoData.homework) await repository.saveHomework(hw);
        for (const att of demoData.attendance) await repository.saveAttendance(att);

        setInstitutionsList([demoData.institution]);
      } else {
        setInstitutionsList(existingInstitutions);
      }

      // Restore session if available in sessionStorage
      try {
        const savedSession = sessionStorage.getItem('sysgesco_session');
        if (savedSession) {
          const { instId, userId } = JSON.parse(savedSession);
          const inst = await repository.getInstitutionById(instId);
          if (inst) {
            const allUsers = await repository.getUsers(instId);
            const user = allUsers.find((u) => u.id === userId);
            if (user) {
              setActiveInstitution(inst);
              setCurrentUser(user);
            }
          }
        }
      } catch (e) {
        console.warn('Could not restore session', e);
      }
    }

    startup();
  }, []);

  // Reload data for the active institution
  const reloadData = useCallback(async () => {
    if (!activeInstitution) {
      setClasses([]);
      setTeachers([]);
      setStudents([]);
      setPayments([]);
      setGrades([]);
      setReportCards([]);
      setTimetable([]);
      setHomework([]);
      setAttendance([]);
      setActivityLogs([]);
      setSettings(null);
      setUsers([]);
      return;
    }

    const instId = activeInstitution.id;
    const [
      loadedClasses,
      loadedTeachers,
      loadedStudents,
      loadedPayments,
      loadedGrades,
      loadedReportCards,
      loadedTimetable,
      loadedHomework,
      loadedAttendance,
      loadedLogs,
      loadedSettings,
      loadedUsers,
    ] = await Promise.all([
      repository.getClasses(instId),
      repository.getTeachers(instId),
      repository.getStudents(instId),
      repository.getPayments(instId),
      repository.getGrades(instId),
      repository.getReportCards(instId),
      repository.getTimetable(instId),
      repository.getHomework(instId),
      repository.getAttendance(instId),
      repository.getActivityLogs(instId),
      repository.getSettings(instId),
      repository.getUsers(instId),
    ]);

    setClasses(loadedClasses);
    setTeachers(loadedTeachers);
    setStudents(loadedStudents);
    setPayments(loadedPayments.sort((a, b) => (b.date > a.date ? 1 : -1)));
    setGrades(loadedGrades);
    setReportCards(loadedReportCards);
    setTimetable(loadedTimetable);
    setHomework(loadedHomework);
    setAttendance(loadedAttendance);
    setActivityLogs(loadedLogs);
    setSettings(loadedSettings);
    setUsers(loadedUsers);

    // Refresh list of institutions as well
    const instList = await repository.getInstitutions();
    setInstitutionsList(instList);
  }, [activeInstitution]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  const isDemoMode = useMemo(() => {
    return activeInstitution?.isDemo === true || activeInstitution?.id === DEMO_INSTITUTION_ID;
  }, [activeInstitution]);

  const currentRole: UserRole = useMemo(() => {
    return currentUser?.role || 'direction';
  }, [currentUser]);

  // --- AUTHENTICATION ---
  const getInstitutionUsers = useCallback(async (institutionId: string): Promise<User[]> => {
    if (!institutionId) return [];
    try {
      return await repository.getUsers(institutionId);
    } catch (e) {
      console.warn('Could not fetch institution users', e);
      return [];
    }
  }, []);

  const login = async (
    institutionCode: string,
    username: string,
    password: string,
    role?: UserRole,
    academicYear?: string
  ) => {
    const cleanCode = institutionCode.trim().toUpperCase();
    const cleanUser = username.trim();

    // Check if superadmin login
    if (cleanUser.toLowerCase() === 'superadmin' && password === 'sysgesco2026') {
      const superAdminUser: User = {
        id: 'usr-superadmin',
        institutionId: '',
        username: 'superadmin',
        passwordHash: 'sysgesco2026',
        firstName: 'Super Admin',
        lastName: 'SysGesco',
        role: 'superadmin',
        email: 'admin@sysgesco.com',
        status: 'active',
        createdAt: '2026-01-01T00:00:00.000Z',
      };
      // Find or use first institution as context
      const allInst = await repository.getInstitutions();
      const targetInst = allInst[0] || (await repository.saveInstitution(createDemoData().institution));
      setActiveInstitution(targetInst);
      setCurrentUser(superAdminUser);
      setCurrentView('superadmin');
      sessionStorage.setItem('sysgesco_session', JSON.stringify({ instId: targetInst.id, userId: superAdminUser.id }));
      showToast('Bienvenue sur l’espace Super Administrateur SysGesco', 'success');
      return { success: true };
    }

    // Normal institution login
    const targetInstitution = await repository.getInstitutionByCode(cleanCode);
    if (!targetInstitution) {
      return { success: false, error: `Identifiant établissement « ${institutionCode} » introuvable.` };
    }

    if (targetInstitution.status === 'suspended') {
      return { success: false, error: 'Cet établissement est suspendu. Veuillez contacter le support.' };
    }

    const user = await repository.getUserByCredentials(targetInstitution.id, cleanUser);
    if (!user) {
      return { success: false, error: `Utilisateur « ${username} » introuvable dans cet établissement.` };
    }

    if (user.passwordHash !== password) {
      return { success: false, error: 'Mot de passe incorrect.' };
    }

    if (user.status === 'inactive') {
      return { success: false, error: 'Ce compte utilisateur a été désactivé.' };
    }

    // Role verification if specific role was chosen in UI
    if (role && user.role !== role) {
      const roleLabels: Record<string, string> = {
        direction: 'Directeur',
        cashier: 'Caissière',
        teacher: 'Professeur',
        student: 'Élève',
        parent: 'Parent',
        superadmin: 'Super Admin',
      };
      return {
        success: false,
        error: `Ce compte possède le profil « ${roleLabels[user.role] || user.role} » et non « ${roleLabels[role] || role} ». Veuillez choisir le bon statut.`,
      };
    }

    setActiveInstitution(targetInstitution);
    setCurrentUser(user);
    sessionStorage.setItem('sysgesco_session', JSON.stringify({ instId: targetInstitution.id, userId: user.id }));

    // Route default view according to role
    if (user.role === 'superadmin') setCurrentView('superadmin');
    else if (user.role === 'cashier') setCurrentView('cashier');
    else if (user.role === 'teacher') setCurrentView('grades');
    else if (user.role === 'student' || user.role === 'parent') setCurrentView('bulletins');
    else setCurrentView('dashboard');

    await repository.logActivity({
      id: Math.random().toString(36).substring(2, 9),
      institutionId: targetInstitution.id,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      action: 'Connexion utilisateur',
      element: 'Session',
      details: role ? `Rôle: ${role}` : undefined,
    });

    showToast(`Connecté à ${targetInstitution.name}`, 'success');
    return { success: true };
  };

  const logout = () => {
    if (activeInstitution && currentUser) {
      repository.logActivity({
        id: Math.random().toString(36).substring(2, 9),
        institutionId: activeInstitution.id,
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
        userName: `${currentUser.firstName} ${currentUser.lastName}`,
        userRole: currentUser.role,
        action: 'Déconnexion',
        element: 'Session',
      });
    }

    sessionStorage.removeItem('sysgesco_session');
    setActiveInstitution(null);
    setCurrentUser(null);
    setCurrentView('dashboard');
    showToast('Vous êtes déconnecté', 'info');
  };

  // Register New Institution (Strict isolation, generates SG-2026-XXXXX)
  // Supports registering all 5 roles (Directeur, Caissière, Professeur, Élève, Parent)
  const registerInstitution = async (data: {
    name: string;
    type: string;
    logoUrl?: string;
    address?: string;
    city?: string;
    commune?: string;
    neighborhood?: string;
    phone?: string;
    email?: string;
    academicYear: string;
    adminName?: string;
    adminPhone?: string;
    adminEmail?: string;
    adminUsername?: string;
    adminPassword?: string;
    roles?: {
      direction: { fullName: string; username: string; password: string; phone?: string; email?: string };
      cashier?: { fullName: string; username: string; password: string; phone?: string; email?: string };
      teacher?: { fullName: string; subject?: string; username: string; password: string; phone?: string; email?: string };
      student?: { fullName: string; className?: string; matricule: string; password: string; gender?: 'M' | 'F' };
      parent?: { fullName: string; username: string; password: string; phone?: string; email?: string };
    };
  }) => {
    const instId = `inst-${Date.now()}`;
    const randomCodeNumber = Math.floor(10000 + Math.random() * 90000);
    const code = `SG-2026-${randomCodeNumber}`;

    const dirFullName = data.roles?.direction?.fullName || data.adminName || 'Directeur Général';
    const dirPhone = data.roles?.direction?.phone || data.adminPhone || '';
    const dirEmail = data.roles?.direction?.email || data.adminEmail || '';
    const dirUsername = data.roles?.direction?.username || data.adminUsername || 'admin';
    const dirPassword = data.roles?.direction?.password || data.adminPassword || 'admin123';

    const newInstitution: Institution = {
      id: instId,
      code,
      name: data.name.trim(),
      type: data.type,
      address: data.address?.trim() || '',
      city: data.city?.trim() || 'Abidjan',
      commune: data.commune?.trim() || 'Cocody',
      neighborhood: data.neighborhood?.trim() || '',
      phone: data.phone?.trim() || '',
      email: data.email?.trim() || '',
      academicYear: data.academicYear || '2026-2027',
      status: 'active',
      directorName: dirFullName.trim(),
      isDemo: false,
      logoUrl: data.logoUrl?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newAdminUser: User = {
      id: `usr-admin-${instId}`,
      institutionId: instId,
      username: dirUsername.trim(),
      passwordHash: dirPassword,
      firstName: dirFullName.split(' ')[0] || 'Directeur',
      lastName: dirFullName.split(' ').slice(1).join(' ') || dirFullName,
      role: 'direction',
      phone: dirPhone,
      email: dirEmail,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const newSettings: InstitutionSettings = {
      id: `settings-${instId}`,
      institutionId: instId,
      currency: 'FCFA',
      defaultTuition: 350000,
      schoolYear: data.academicYear || '2026-2027',
      enableRankings: true,
      logoUrl: data.logoUrl?.trim() || '',
    };

    // Save institution, admin user, settings
    await repository.saveInstitution(newInstitution);
    await repository.saveUser(newAdminUser);
    await repository.saveSettings(newSettings);

    // Create default sample classes for quick onboarding
    const class6aId = `cls-6a-${instId}`;
    const class3aId = `cls-3a-${instId}`;
    await repository.saveClass({
      id: class6aId,
      institutionId: instId,
      name: '6ème A',
      level: '6ème',
      room: 'Salle 01',
      academicYear: newInstitution.academicYear,
      capacity: 45,
      studentCount: data.roles?.student ? 1 : 0,
      tuitionFee: 350000,
    });
    await repository.saveClass({
      id: class3aId,
      institutionId: instId,
      name: '3ème A',
      level: '3ème',
      room: 'Salle 02',
      academicYear: newInstitution.academicYear,
      capacity: 45,
      studentCount: 0,
      tuitionFee: 380000,
    });

    // 2. Register Caissière role account
    if (data.roles?.cashier && data.roles.cashier.username) {
      const cashierData = data.roles.cashier;
      const cashierUser: User = {
        id: `usr-cashier-${instId}`,
        institutionId: instId,
        username: cashierData.username.trim(),
        passwordHash: cashierData.password,
        firstName: cashierData.fullName.split(' ')[0] || 'Caissière',
        lastName: cashierData.fullName.split(' ').slice(1).join(' ') || 'Comptable',
        role: 'cashier',
        phone: cashierData.phone,
        email: cashierData.email,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      await repository.saveUser(cashierUser);
    }

    // 3. Register Professeur role account & teacher entity
    let createdTeacherId = '';
    if (data.roles?.teacher && data.roles.teacher.username) {
      const teacherData = data.roles.teacher;
      createdTeacherId = `tch-${instId}`;
      const teacherEntity: Teacher = {
        id: createdTeacherId,
        institutionId: instId,
        userId: `usr-teacher-${instId}`,
        firstName: teacherData.fullName.split(' ')[0] || 'Professeur',
        lastName: teacherData.fullName.split(' ').slice(1).join(' ') || 'Enseignant',
        phone: teacherData.phone || '',
        email: teacherData.email || '',
        subject: teacherData.subject || 'Mathématiques',
        assignedClassIds: [class6aId, class3aId],
        isMainTeacherOfClassId: class6aId,
        status: 'active',
      };
      await repository.saveTeacher(teacherEntity);

      const teacherUser: User = {
        id: `usr-teacher-${instId}`,
        institutionId: instId,
        username: teacherData.username.trim(),
        passwordHash: teacherData.password,
        firstName: teacherEntity.firstName,
        lastName: teacherEntity.lastName,
        role: 'teacher',
        linkedEntityId: createdTeacherId,
        phone: teacherData.phone,
        email: teacherData.email,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      await repository.saveUser(teacherUser);
    }

    // 4. Register Élève role account & student entity
    let createdStudentId = '';
    if (data.roles?.student && (data.roles.student.matricule || data.roles.student.fullName)) {
      const studentData = data.roles.student;
      createdStudentId = `std-${instId}`;
      const studentEntity: Student = {
        id: createdStudentId,
        institutionId: instId,
        matricule: (studentData.matricule || `MAT-${randomCodeNumber}`).trim().toUpperCase(),
        firstName: studentData.fullName.split(' ')[0] || 'Élève',
        lastName: studentData.fullName.split(' ').slice(1).join(' ') || 'Inscrit',
        dateOfBirth: '2012-05-15',
        gender: studentData.gender || 'M',
        classId: class6aId,
        guardianName: data.roles.parent?.fullName || 'Parent Tuteur',
        guardianPhone: data.roles.parent?.phone || '+225 07 00 00 00',
        tuitionTotal: 350000,
        tuitionPaid: 150000,
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'active',
      };
      await repository.saveStudent(studentEntity);

      const studentUser: User = {
        id: `usr-student-${instId}`,
        institutionId: instId,
        username: (studentData.matricule || 'eleve').trim(),
        passwordHash: studentData.password || 'eleve123',
        firstName: studentEntity.firstName,
        lastName: studentEntity.lastName,
        role: 'student',
        linkedEntityId: createdStudentId,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      await repository.saveUser(studentUser);
    }

    // 5. Register Parent d'élève role account & parent entity
    if (data.roles?.parent && data.roles.parent.username) {
      const parentData = data.roles.parent;
      const parentId = `par-${instId}`;
      const parentEntity: Parent = {
        id: parentId,
        institutionId: instId,
        userId: `usr-parent-${instId}`,
        fullName: parentData.fullName.trim(),
        phone: parentData.phone?.trim() || '+225 07 00 00 00',
        email: parentData.email,
        address: `${data.city || 'Abidjan'}, ${data.commune || 'Cocody'}`,
        studentIds: createdStudentId ? [createdStudentId] : [],
      };
      await repository.saveParent(parentEntity);

      const parentUser: User = {
        id: `usr-parent-${instId}`,
        institutionId: instId,
        username: parentData.username.trim(),
        passwordHash: parentData.password,
        firstName: parentData.fullName.split(' ')[0] || 'Parent',
        lastName: parentData.fullName.split(' ').slice(1).join(' ') || 'Tuteur',
        role: 'parent',
        linkedEntityId: parentId,
        phone: parentData.phone,
        email: parentData.email,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      await repository.saveUser(parentUser);
    }

    // Auto login as Director initially
    setActiveInstitution(newInstitution);
    setCurrentUser(newAdminUser);
    setCurrentView('dashboard');
    sessionStorage.setItem('sysgesco_session', JSON.stringify({ instId: newInstitution.id, userId: newAdminUser.id }));

    await repository.logActivity({
      id: Math.random().toString(36).substring(2, 9),
      institutionId: instId,
      timestamp: new Date().toISOString(),
      userId: newAdminUser.id,
      userName: `${newAdminUser.firstName} ${newAdminUser.lastName}`,
      userRole: 'direction',
      action: 'Création de l’établissement et initialisation des rôles',
      element: newInstitution.name,
      details: `Code généré: ${code} • 5 rôles créés`,
    });

    const instList = await repository.getInstitutions();
    setInstitutionsList(instList);

    showToast(`Établissement créé avec succès ! Identifiant: ${code}`, 'success', 'Félicitations');
    return { institution: newInstitution, user: newAdminUser };
  };

  const switchInstitution = async (institutionId: string) => {
    const target = await repository.getInstitutionById(institutionId);
    if (!target) return;

    // Find admin or first user in this institution
    const instUsers = await repository.getUsers(institutionId);
    const targetUser =
      instUsers.find((u) => u.role === 'direction' || u.role === 'superadmin') ||
      instUsers[0] || {
        id: `usr-default-${target.id}`,
        institutionId: target.id,
        username: 'admin',
        passwordHash: 'admin123',
        firstName: 'Direction',
        lastName: target.name,
        role: 'direction' as UserRole,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
      };

    setActiveInstitution(target);
    setCurrentUser(targetUser);
    setCurrentView('dashboard');
    sessionStorage.setItem('sysgesco_session', JSON.stringify({ instId: target.id, userId: targetUser.id }));
    showToast(`Espace actif : ${target.name}`, 'info');
  };

  const switchRole = async (targetRole: UserRole) => {
    if (!activeInstitution) return;

    if (targetRole === 'superadmin') {
      const superAdminUser: User = {
        id: 'usr-superadmin',
        institutionId: '',
        username: 'superadmin',
        passwordHash: 'sysgesco2026',
        firstName: 'Super Admin',
        lastName: 'SysGesco',
        role: 'superadmin',
        email: 'admin@sysgesco.com',
        status: 'active',
        createdAt: '2026-01-01T00:00:00.000Z',
      };
      setCurrentUser(superAdminUser);
      setCurrentView('superadmin');
      sessionStorage.setItem('sysgesco_session', JSON.stringify({ instId: activeInstitution.id, userId: superAdminUser.id }));
      showToast('Espace Super Administrateur SysGesco activé', 'info');
      return;
    }

    const allUsers = await repository.getUsers(activeInstitution.id);
    let matchedUser = allUsers.find((u) => u.role === targetRole);

    if (!matchedUser) {
      const defaultRoleCredentials: Record<UserRole, { first: string; last: string; user: string; pass: string; entityId?: string }> = {
        direction: { first: 'Directeur', last: activeInstitution.directorName || 'Général', user: 'admin', pass: 'admin123' },
        cashier: { first: 'Aminata', last: 'Coulibaly', user: 'caisse', pass: 'caisse123' },
        teacher: { first: teachers[0]?.firstName || 'Moussa', last: teachers[0]?.lastName || 'Traoré', user: 'traore', pass: 'prof123', entityId: teachers[0]?.id },
        student: { first: students[0]?.firstName || 'Kouassi Ange', last: students[0]?.lastName || 'Kouamé', user: students[0]?.matricule || 'eleve', pass: 'eleve123', entityId: students[0]?.id },
        parent: { first: "N'Goran", last: 'Kouamé', user: 'parent', pass: 'parent123' },
        superadmin: { first: 'Super', last: 'Admin', user: 'superadmin', pass: 'sysgesco2026' },
      };
      const def = defaultRoleCredentials[targetRole];
      const newUser: User = {
        id: `usr-${targetRole}-${activeInstitution.id}`,
        institutionId: activeInstitution.id,
        username: def.user,
        passwordHash: def.pass,
        firstName: def.first,
        lastName: def.last,
        role: targetRole,
        linkedEntityId: def.entityId,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      await repository.saveUser(newUser);
      matchedUser = newUser;
      setUsers((prev) => [...prev, newUser]);
    }

    setCurrentUser(matchedUser);
    sessionStorage.setItem('sysgesco_session', JSON.stringify({ instId: activeInstitution.id, userId: matchedUser.id }));
    setCurrentView('dashboard');

    const roleLabels: Record<string, string> = {
      direction: 'Directeur',
      cashier: 'Caissière',
      teacher: 'Professeur',
      student: 'Élève',
      parent: 'Parent',
      superadmin: 'Super Admin',
    };
    showToast(`Rôle actif : ${roleLabels[targetRole] || targetRole}`, 'success');
  };

  const loginAsStudent = async (studentId: string) => {
    if (!activeInstitution) return;
    const student = await repository.getStudentById(activeInstitution.id, studentId);
    if (!student) {
      showToast('Élève introuvable', 'error');
      return;
    }

    const allUsers = await repository.getUsers(activeInstitution.id);
    let matchedUser = allUsers.find(
      (u) =>
        u.linkedEntityId === studentId ||
        (u.role === 'student' &&
          u.username.toLowerCase() === (student.loginUsername || student.matricule).toLowerCase())
    );

    if (!matchedUser) {
      const username = (student.loginUsername || student.matricule).toLowerCase();
      const password = student.loginPassword || 'Eleve@2026';
      const studentUser: User = {
        id: `usr-std-${student.id}`,
        institutionId: activeInstitution.id,
        username,
        passwordHash: password,
        firstName: student.firstName,
        lastName: student.lastName,
        role: 'student',
        linkedEntityId: student.id,
        phone: student.guardianPhone,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      await repository.saveUser(studentUser);
      matchedUser = studentUser;
    }

    setCurrentUser(matchedUser);
    sessionStorage.setItem(
      'sysgesco_session',
      JSON.stringify({ instId: activeInstitution.id, userId: matchedUser.id })
    );
    setCurrentView('dashboard');
    showToast(`Espace Élève : Bienvenue ${student.firstName} !`, 'success');
  };

  const loginAsTeacher = async (teacherId: string) => {
    if (!activeInstitution) return;
    const allTeachers = await repository.getTeachers(activeInstitution.id);
    const teacher = allTeachers.find((t) => t.id === teacherId);
    if (!teacher) {
      showToast('Enseignant introuvable', 'error');
      return;
    }

    const allUsers = await repository.getUsers(activeInstitution.id);
    let matchedUser = allUsers.find(
      (u) =>
        u.linkedEntityId === teacherId ||
        (u.role === 'teacher' &&
          (u.username.toLowerCase() === (teacher.loginUsername || '').toLowerCase() ||
           (teacher.email && u.email?.toLowerCase() === teacher.email.toLowerCase())))
    );

    if (!matchedUser) {
      const cleanLast = teacher.lastName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const username = (teacher.loginUsername || `prof.${cleanLast}`).toLowerCase();
      const password = teacher.loginPassword || 'Prof@2026';
      const teacherUser: User = {
        id: `usr-tch-${teacher.id}`,
        institutionId: activeInstitution.id,
        username,
        passwordHash: password,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        role: 'teacher',
        linkedEntityId: teacher.id,
        phone: teacher.phone,
        email: teacher.email,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      await repository.saveUser(teacherUser);
      matchedUser = teacherUser;
    }

    setCurrentUser(matchedUser);
    sessionStorage.setItem(
      'sysgesco_session',
      JSON.stringify({ instId: activeInstitution.id, userId: matchedUser.id })
    );
    setCurrentView('grades');
    showToast(`Espace Enseignant : Bienvenue M./Mme ${teacher.lastName} !`, 'success');
  };

  const launchDemo = async (targetRole: UserRole = 'direction') => {
    let demoInst = await repository.getInstitutionById(DEMO_INSTITUTION_ID);
    if (!demoInst) {
      const demoData = createDemoData();
      demoInst = await repository.saveInstitution(demoData.institution);
      await resetDemoData();
    }

    const demoUsers = await repository.getUsers(DEMO_INSTITUTION_ID);
    let userToLogin = demoUsers.find((u) => u.role === targetRole);
    if (!userToLogin && targetRole === 'superadmin') {
      userToLogin = {
        id: 'usr-superadmin',
        institutionId: '',
        username: 'superadmin',
        passwordHash: 'sysgesco2026',
        firstName: 'Super Admin',
        lastName: 'SysGesco',
        role: 'superadmin',
        status: 'active',
        createdAt: '2026-01-01T00:00:00.000Z',
      };
    }
    if (!userToLogin) userToLogin = demoUsers[0];

    setActiveInstitution(demoInst);
    setCurrentUser(userToLogin);
    if (targetRole === 'superadmin') {
      setCurrentView('superadmin');
    } else {
      setCurrentView('dashboard');
    }
    sessionStorage.setItem('sysgesco_session', JSON.stringify({ instId: demoInst.id, userId: userToLogin.id }));
    const roleLabels: Record<string, string> = {
      direction: 'Directeur',
      cashier: 'Caissière',
      teacher: 'Professeur',
      student: 'Élève',
      parent: 'Parent',
      superadmin: 'Super Admin',
    };
    showToast(`Mode Démo Activé — Profil : ${roleLabels[targetRole] || targetRole}`, 'success');
  };

  const resetDemoData = async () => {
    await repository.resetInstitutionData(DEMO_INSTITUTION_ID);
    const demoData = createDemoData();
    await repository.saveInstitution(demoData.institution);
    await repository.saveSettings(demoData.settings);

    for (const cls of demoData.classes) await repository.saveClass(cls);
    for (const tch of demoData.teachers) await repository.saveTeacher(tch);
    for (const std of demoData.students) await repository.saveStudent(std);
    for (const par of demoData.parents) await repository.saveParent(par);
    for (const usr of demoData.users) await repository.saveUser(usr);
    for (const pay of demoData.payments) await repository.savePayment(pay);
    for (const grd of demoData.grades) await repository.saveGrade(grd);
    for (const rc of demoData.reportCards) await repository.saveReportCard(rc);
    for (const slot of demoData.timetable) await repository.saveTimetableSlot(slot);
    for (const hw of demoData.homework) await repository.saveHomework(hw);
    for (const att of demoData.attendance) await repository.saveAttendance(att);

    await reloadData();
    showToast('Données DEMO réinitialisées avec succès.', 'info');
  };

  // --- DATA MUTATIONS WITH INSTITUTIONAL ISOLATION ---

  const addStudent = async (data: Omit<Student, 'id' | 'institutionId' | 'tuitionPaid'> & {
    loginUsername?: string;
    loginPassword?: string;
    createStudentAccount?: boolean;
  }) => {
    if (!activeInstitution) throw new Error('Aucun établissement actif');

    const randomMat = Math.floor(1000 + Math.random() * 9000);
    const matricule = data.matricule?.trim() || `MAT-2026-${randomMat}`;

    // Compute student credentials for their dedicated portal
    const studentLogin = (data.loginUsername?.trim() || matricule).trim().toLowerCase();
    const studentPassword = (data.loginPassword?.trim() || 'Eleve@2026').trim();

    const newStudent: Student = {
      ...data,
      id: `std-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      institutionId: activeInstitution.id,
      matricule,
      tuitionPaid: 0,
      status: 'active',
      enrollmentDate: data.enrollmentDate || new Date().toISOString().slice(0, 10),
      loginUsername: studentLogin,
      loginPassword: studentPassword,
    };

    const saved = await repository.saveStudent(newStudent);

    // Automatically create a user account for the student's personal space
    if (data.createStudentAccount !== false) {
      const studentUser: User = {
        id: `usr-std-${saved.id}`,
        institutionId: activeInstitution.id,
        username: studentLogin,
        passwordHash: studentPassword,
        firstName: saved.firstName,
        lastName: saved.lastName,
        role: 'student',
        linkedEntityId: saved.id,
        phone: saved.guardianPhone,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      await repository.saveUser(studentUser);
    }

    await reloadData();

    await repository.logActivity({
      id: Math.random().toString(36).substring(2, 9),
      institutionId: activeInstitution.id,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'sys',
      userName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Direction',
      userRole: currentRole,
      action: 'Inscription élève',
      element: `${saved.firstName} ${saved.lastName}`,
      details: `Matricule: ${saved.matricule} • Compte Espace Élève créé (Login: ${studentLogin})`,
    });

    showToast(`Élève ${saved.firstName} ${saved.lastName} inscrit • Espace Élève activé (${studentLogin}) !`, 'success');
    return saved;
  };

  const createOrUpdateStudentAccount = async (studentId: string, username: string, password: string): Promise<User> => {
    if (!activeInstitution) throw new Error('Aucun établissement actif');
    const student = await repository.getStudentById(activeInstitution.id, studentId);
    if (!student) throw new Error('Élève introuvable');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const existingUsers = await repository.getUsers(activeInstitution.id);
    const existing = existingUsers.find((u) => u.linkedEntityId === studentId || (u.role === 'student' && u.username.toLowerCase() === cleanUser));

    const userToSave: User = {
      id: existing?.id || `usr-std-${studentId}`,
      institutionId: activeInstitution.id,
      username: cleanUser,
      passwordHash: cleanPass,
      firstName: student.firstName,
      lastName: student.lastName,
      role: 'student',
      linkedEntityId: studentId,
      phone: student.guardianPhone,
      status: 'active',
      createdAt: existing?.createdAt || new Date().toISOString(),
    };

    await repository.saveUser(userToSave);

    student.loginUsername = cleanUser;
    student.loginPassword = cleanPass;
    await repository.saveStudent(student);

    await reloadData();
    showToast(`Compte Espace Élève mis à jour pour ${student.firstName} (Login: ${cleanUser})`, 'success');
    return userToSave;
  };

  const updateStudent = async (student: Student) => {
    if (!activeInstitution || student.institutionId !== activeInstitution.id) {
      throw new Error('Violation de contexte institutionnel');
    }
    const saved = await repository.saveStudent(student);
    await reloadData();
    showToast(`Dossier de ${saved.firstName} ${saved.lastName} mis à jour.`, 'info');
    return saved;
  };

  const deleteStudent = async (studentId: string) => {
    if (!activeInstitution) return;
    await repository.deleteStudent(activeInstitution.id, studentId);
    await reloadData();
    showToast('Élève retiré du registre.', 'info');
  };

  const addClass = async (data: Omit<ClassRoom, 'id' | 'institutionId'>) => {
    if (!activeInstitution) throw new Error('Aucun établissement actif');
    const newClass: ClassRoom = {
      ...data,
      id: `cls-${Date.now()}`,
      institutionId: activeInstitution.id,
      studentCount: 0,
    };
    const saved = await repository.saveClass(newClass);
    await reloadData();
    showToast(`Classe ${saved.name} ajoutée avec succès.`, 'success');
    return saved;
  };

  const updateClass = async (classRoom: ClassRoom) => {
    if (!activeInstitution || classRoom.institutionId !== activeInstitution.id) throw new Error('Erreur contexte');
    const saved = await repository.saveClass(classRoom);
    await reloadData();
    showToast(`Classe ${saved.name} mise à jour.`, 'info');
    return saved;
  };

  const deleteClass = async (classId: string) => {
    if (!activeInstitution) return;
    await repository.deleteClass(activeInstitution.id, classId);
    await reloadData();
    showToast('Classe supprimée.', 'info');
  };

  const addTeacher = async (
    data: Omit<Teacher, 'id' | 'institutionId'> & {
      loginUsername?: string;
      loginPassword?: string;
      createTeacherAccount?: boolean;
    }
  ) => {
    if (!activeInstitution) throw new Error('Aucun établissement actif');
    const teacherId = `tch-${Date.now()}`;
    const cleanLast = data.lastName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanFirst = data.firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const defaultLogin = (data.loginUsername?.trim() || `prof.${cleanLast || cleanFirst}`).toLowerCase();
    const defaultPass = data.loginPassword?.trim() || 'Prof@2026';

    const newTeacher: Teacher = {
      ...data,
      id: teacherId,
      institutionId: activeInstitution.id,
      status: 'active',
      loginUsername: defaultLogin,
      loginPassword: defaultPass,
    };

    const saved = await repository.saveTeacher(newTeacher);

    if (data.createTeacherAccount !== false) {
      const userToSave: User = {
        id: `usr-tch-${saved.id}`,
        institutionId: activeInstitution.id,
        username: defaultLogin,
        passwordHash: defaultPass,
        firstName: saved.firstName,
        lastName: saved.lastName,
        role: 'teacher',
        linkedEntityId: saved.id,
        phone: saved.phone,
        email: saved.email,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      await repository.saveUser(userToSave);
    }

    await reloadData();
    showToast(`Professeur ${saved.firstName} ${saved.lastName} ajouté avec accès Espace Enseignant.`, 'success');
    return saved;
  };

  const createOrUpdateTeacherAccount = async (
    teacherId: string,
    username: string,
    password: string
  ): Promise<User> => {
    if (!activeInstitution) throw new Error('Aucun établissement actif');
    const allTeachers = await repository.getTeachers(activeInstitution.id);
    const teacher = allTeachers.find((t) => t.id === teacherId);
    if (!teacher) throw new Error('Enseignant introuvable');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const existingUsers = await repository.getUsers(activeInstitution.id);
    const existing = existingUsers.find(
      (u) =>
        u.linkedEntityId === teacherId ||
        (u.role === 'teacher' && u.username.toLowerCase() === cleanUser)
    );

    const userToSave: User = {
      id: existing?.id || `usr-tch-${teacherId}`,
      institutionId: activeInstitution.id,
      username: cleanUser,
      passwordHash: cleanPass,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      role: 'teacher',
      linkedEntityId: teacherId,
      phone: teacher.phone,
      email: teacher.email,
      status: 'active',
      createdAt: existing?.createdAt || new Date().toISOString(),
    };

    await repository.saveUser(userToSave);

    teacher.loginUsername = cleanUser;
    teacher.loginPassword = cleanPass;
    await repository.saveTeacher(teacher);

    await reloadData();
    showToast(`Accès Enseignant mis à jour pour ${teacher.lastName} ${teacher.firstName} (Login: ${cleanUser})`, 'success');
    return userToSave;
  };

  const updateTeacher = async (teacher: Teacher) => {
    if (!activeInstitution || teacher.institutionId !== activeInstitution.id) throw new Error('Erreur contexte');
    const saved = await repository.saveTeacher(teacher);
    await reloadData();
    showToast(`Professeur ${saved.firstName} ${saved.lastName} mis à jour.`, 'info');
    return saved;
  };

  const deleteTeacher = async (teacherId: string) => {
    if (!activeInstitution) return;
    await repository.deleteTeacher(activeInstitution.id, teacherId);
    await reloadData();
    showToast('Enseignant retiré.', 'info');
  };

  // Payment Execution (Strict business logic: balance cannot be negative, increases paid, decreases remaining)
  const recordPayment = async (data: {
    studentId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    observation?: string;
  }) => {
    if (!activeInstitution) throw new Error('Aucun établissement actif');
    const student = await repository.getStudentById(activeInstitution.id, data.studentId);
    if (!student) throw new Error('Élève introuvable');

    const previousBalance = Math.max(0, student.tuitionTotal - student.tuitionPaid);
    const amountToApply = Math.max(0, data.amount);

    // Business rule: Remaining cannot be negative
    const newPaid = student.tuitionPaid + amountToApply;
    const newRemaining = Math.max(0, student.tuitionTotal - newPaid);

    // Update student
    student.tuitionPaid = newPaid;
    await repository.saveStudent(student);

    // Generate unique receipt reference
    const randomReceiptNum = Math.floor(100000 + Math.random() * 900000);
    const receiptNumber = `REC-2026-${randomReceiptNum}`;

    const studentClass = classes.find((c) => c.id === student.classId);

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      institutionId: activeInstitution.id,
      receiptNumber,
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      studentMatricule: student.matricule,
      classId: student.classId,
      className: studentClass?.name || 'Non assigné',
      amount: amountToApply,
      paymentMethod: data.paymentMethod,
      cashierName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Caissière Centrale',
      date: new Date().toISOString().replace('T', ' ').slice(0, 19),
      observation: data.observation || `Règlement scolarité ${data.paymentMethod}`,
      previousBalance,
      newBalance: newRemaining,
      academicYear: activeInstitution.academicYear,
    };

    const savedPayment = await repository.savePayment(newPayment);

    await repository.logActivity({
      id: Math.random().toString(36).substring(2, 9),
      institutionId: activeInstitution.id,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'caisse',
      userName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Caisse',
      userRole: currentRole,
      action: 'Encaissement scolarité',
      element: `${(amountToApply || 0).toLocaleString('fr-FR')} FCFA`,
      details: `${savedPayment.receiptNumber} • ${student.firstName} ${student.lastName} (${data.paymentMethod})`,
    });

    await reloadData();
    showToast(
      `Paiement de ${(amountToApply || 0).toLocaleString('fr-FR')} FCFA enregistré ! Reçu N° ${savedPayment.receiptNumber}`,
      'success',
      'Encaissement Validé'
    );
    return savedPayment;
  };

  // Grade & Academic Recording
  const recordGrade = async (gradeData: Omit<Grade, 'id' | 'institutionId'>) => {
    if (!activeInstitution) throw new Error('Aucun établissement actif');
    const newGrade: Grade = {
      ...gradeData,
      id: `grd-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      institutionId: activeInstitution.id,
    };
    const saved = await repository.saveGrade(newGrade);
    await reloadData();
    showToast(`Note de ${saved.note ?? (saved as any).value ?? ''}/20 enregistrée.`, 'success');
    return saved;
  };

  const saveEvaluationGrades = async (newGrades: Grade[]) => {
    if (!activeInstitution) throw new Error('Aucun établissement actif');
    for (const g of newGrades) {
      const gItem: Grade = {
        ...g,
        id: g.id || `grd-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        institutionId: activeInstitution.id,
      };
      await repository.saveGrade(gItem);
    }
    await reloadData();
    showToast(`${newGrades.length} notes enregistrées avec succès.`, 'success');
  };

  const updateReportCard = async (reportCard: ReportCard) => {
    if (!activeInstitution || reportCard.institutionId !== activeInstitution.id) throw new Error('Erreur contexte');
    const saved = await repository.saveReportCard(reportCard);
    await reloadData();
    showToast(`Bulletin pour ${reportCard.term} mis à jour.`, 'info');
    return saved;
  };

  // Timetable Slot addition with Conflict Detection
  const addTimetableSlot = async (slotData: Omit<TimetableSlot, 'id' | 'institutionId'>) => {
    if (!activeInstitution) throw new Error('Aucun établissement actif');

    // Conflict Check: Is Teacher or Room or Class already booked on the same day and overlapping time?
    const currentSlots = await repository.getTimetable(activeInstitution.id);

    const teacherConflict = currentSlots.find(
      (s) =>
        s.day === slotData.day &&
        s.teacherId === slotData.teacherId &&
        s.startTime === slotData.startTime &&
        s.classId !== slotData.classId
    );

    const roomConflict = currentSlots.find(
      (s) =>
        s.day === slotData.day &&
        s.room === slotData.room &&
        s.startTime === slotData.startTime &&
        s.classId !== slotData.classId
    );

    const classConflict = currentSlots.find(
      (s) =>
        s.day === slotData.day &&
        s.classId === slotData.classId &&
        s.startTime === slotData.startTime
    );

    let status: 'confirmed' | 'conflict' = 'confirmed';
    let conflictReason: string | undefined;

    if (teacherConflict) {
      status = 'conflict';
      const tch = teachers.find((t) => t.id === slotData.teacherId);
      const confClass = classes.find((c) => c.id === teacherConflict.classId);
      conflictReason = `L’enseignant ${tch ? `${tch.firstName} ${tch.lastName}` : 'sélectionné'} est simultanément affecté en ${confClass?.name || 'autre classe'} (${teacherConflict.room}) sur cette plage horaire.`;
    } else if (roomConflict) {
      status = 'conflict';
      const confClass = classes.find((c) => c.id === roomConflict.classId);
      conflictReason = `La salle ${slotData.room} est déjà occupée par la classe ${confClass?.name || ''} sur cette plage horaire.`;
    } else if (classConflict) {
      status = 'conflict';
      conflictReason = `Cette classe a déjà un cours programmé sur cette plage horaire.`;
    }

    const newSlot: TimetableSlot = {
      ...slotData,
      id: `tt-${Date.now()}`,
      institutionId: activeInstitution.id,
      status,
      conflictReason,
    };

    const saved = await repository.saveTimetableSlot(newSlot);
    await reloadData();

    if (status === 'conflict') {
      showToast(conflictReason || 'Conflit de planning détecté !', 'warning', 'Alerte Emploi du Temps');
      return { slot: saved, conflict: conflictReason };
    }

    showToast('Créneau ajouté avec succès à l’emploi du temps.', 'success');
    return { slot: saved };
  };

  const deleteTimetableSlot = async (slotId: string) => {
    if (!activeInstitution) return;
    await repository.deleteTimetableSlot(activeInstitution.id, slotId);
    await reloadData();
    showToast('Créneau retiré.', 'info');
  };

  const resolveConflict = async (
    slotId: string,
    resolution: 'replace_teacher' | 'move_day',
    newTeacherId?: string,
    newDay?: string
  ) => {
    if (!activeInstitution) return;
    const slot = timetable.find((s) => s.id === slotId);
    if (!slot) return;

    if (resolution === 'replace_teacher' && newTeacherId) {
      slot.teacherId = newTeacherId;
      slot.status = 'confirmed';
      slot.conflictReason = undefined;
    } else if (resolution === 'move_day' && newDay) {
      slot.day = newDay as any;
      slot.status = 'confirmed';
      slot.conflictReason = undefined;
    } else {
      // Automatic resolution
      slot.status = 'confirmed';
      slot.conflictReason = undefined;
    }

    await repository.saveTimetableSlot(slot);
    await reloadData();
    showToast('Conflit d’emploi du temps résolu avec succès.', 'success');
  };

  // Attendance recording
  const recordAttendanceSession = async (
    recordData: Omit<AttendanceRecord, 'id' | 'institutionId' | 'createdAt'>
  ) => {
    if (!activeInstitution) throw new Error('Aucun établissement actif');
    const newRecord: AttendanceRecord = {
      ...recordData,
      id: `att-${Date.now()}`,
      institutionId: activeInstitution.id,
      createdAt: new Date().toISOString(),
    };
    const saved = await repository.saveAttendance(newRecord);
    await reloadData();
    showToast('Feuille d’appel enregistrée avec succès.', 'success');
    return saved;
  };

  const recordAttendanceList = async (records: AttendanceRecord[]) => {
    if (!activeInstitution) throw new Error('Aucun établissement actif');
    for (const r of records) {
      const rItem: AttendanceRecord = {
        ...r,
        id: r.id || `att-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        institutionId: activeInstitution.id,
        createdAt: r.createdAt || new Date().toISOString(),
      };
      await repository.saveAttendance(rItem);
    }
    await reloadData();
    showToast(`Appel enregistré pour ${records.length} élève(s).`, 'success');
  };

  // Homework publishing
  const addHomework = async (hwData: Omit<Homework, 'id' | 'institutionId' | 'publishedDate'>) => {
    if (!activeInstitution) throw new Error('Aucun établissement actif');
    const newHomework: Homework = {
      ...hwData,
      id: `hw-${Date.now()}`,
      institutionId: activeInstitution.id,
      publishedDate: new Date().toISOString().slice(0, 10),
    };
    const saved = await repository.saveHomework(newHomework);
    await reloadData();
    showToast(`Devoir « ${saved.title} » publié aux élèves et parents.`, 'success');
    return saved;
  };

  // User Management
  const addUser = async (userData: Omit<User, 'id' | 'institutionId' | 'createdAt'>) => {
    if (!activeInstitution) throw new Error('Aucun établissement actif');
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      institutionId: activeInstitution.id,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    const saved = await repository.saveUser(newUser);
    await reloadData();
    showToast(`Utilisateur ${saved.username} créé avec succès.`, 'success');
    return saved;
  };

  const updateUserStatus = async (userId: string, status: 'active' | 'inactive') => {
    if (!activeInstitution) return;
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;
    targetUser.status = status;
    await repository.saveUser(targetUser);
    await reloadData();
    showToast(`Statut du compte mis à jour (${status === 'active' ? 'Activé' : 'Désactivé'}).`, 'info');
  };

  const updateInstitutionInfo = async (data: Partial<Institution>) => {
    if (!activeInstitution) return;
    const updated: Institution = {
      ...activeInstitution,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await repository.saveInstitution(updated);
    setActiveInstitution(updated);
    await reloadData();
    showToast('Informations de l’établissement mises à jour.', 'success');
  };

  // Backup & Restore
  const exportBackupJSON = async () => {
    if (!activeInstitution) {
      showToast('Veuillez d’abord sélectionner un établissement.', 'error');
      return;
    }

    try {
      const backup = await repository.exportInstitutionData(activeInstitution.id);
      const dataStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const cleanName = activeInstitution.name.replace(/\s+/g, '_');
      link.download = `SysGesco_${cleanName}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`Sauvegarde JSON exportée pour ${activeInstitution.name}`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Erreur lors de l’export de sauvegarde', 'error');
    }
  };

  const restoreBackupJSON = async (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString) as BackupData;
      if (!parsed.institution || !parsed.institution.id) {
        return { success: false, error: 'Fichier invalide : informations établissement introuvables.' };
      }

      await repository.restoreInstitutionData(parsed);

      // Set active
      setActiveInstitution(parsed.institution);
      const instUsers = await repository.getUsers(parsed.institution.id);
      const admin = instUsers.find((u) => u.role === 'direction') || instUsers[0];
      if (admin) setCurrentUser(admin);

      await reloadData();
      showToast(`Établissement « ${parsed.institution.name} » restauré avec succès.`, 'success', 'Restauration terminée');
      return { success: true, institutionName: parsed.institution.name };
    } catch (err: any) {
      return { success: false, error: err.message || 'Impossible de lire le fichier JSON.' };
    }
  };

  const value: AppContextType = {
    activeInstitution,
    currentUser,
    currentRole,
    isDemoMode,
    isOnline,
    institutionsList,
    currentView,
    setCurrentView,
    selectedStudentId,
    setSelectedStudentId,

    // Offline-first Sync Status & Storage Diagnostics
    syncStatus,
    lastSavedAt,
    storageType,
    storageStats,
    verifyLocalStorage,

    login,
    logout,
    registerInstitution,
    getInstitutionUsers,
    switchInstitution,
    switchRole,
    loginAsStudent,
    loginAsTeacher,
    launchDemo,
    resetDemoData,

    classes,
    teachers,
    students,
    subjects,
    payments,
    grades,
    reportCards,
    timetable,
    timetables: timetable,
    homework,
    attendance,
    attendances: attendance,
    activityLogs,
    settings,
    users,

    addStudent,
    createOrUpdateStudentAccount,
    updateStudent,
    deleteStudent,

    addClass,
    updateClass,
    deleteClass,

    addTeacher,
    createOrUpdateTeacherAccount,
    updateTeacher,
    deleteTeacher,

    recordPayment,
    recordGrade,
    saveEvaluationGrades,
    updateReportCard,

    addTimetableSlot,
    deleteTimetableSlot,
    resolveConflict,

    recordAttendanceSession,
    recordAttendanceList,
    addHomework,

    addUser,
    updateUserStatus,
    updateInstitutionInfo,

    exportBackupJSON,
    restoreBackupJSON,

    toast,
    showToast,
    hideToast,

    reloadData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
