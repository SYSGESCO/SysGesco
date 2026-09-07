/**
 * SysGesco - ERP Scolaire Offline-First
 * Repository / Data Access Layer
 * Decoupled storage interface (IndexedDB now, SQLite/Electron ready)
 */

import {
  Institution,
  User,
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
} from '../types';

export interface IRepository {
  init(): Promise<void>;
  
  // Institutions
  getInstitutions(): Promise<Institution[]>;
  getInstitutionById(id: string): Promise<Institution | null>;
  getInstitutionByCode(code: string): Promise<Institution | null>;
  saveInstitution(institution: Institution): Promise<Institution>;
  deleteInstitution(id: string): Promise<void>;

  // Users
  getUsers(institutionId: string): Promise<User[]>;
  getUserByCredentials(institutionId: string, username: string): Promise<User | null>;
  saveUser(user: User): Promise<User>;
  deleteUser(institutionId: string, userId: string): Promise<void>;

  // Classes
  getClasses(institutionId: string): Promise<ClassRoom[]>;
  saveClass(classRoom: ClassRoom): Promise<ClassRoom>;
  deleteClass(institutionId: string, classId: string): Promise<void>;

  // Teachers
  getTeachers(institutionId: string): Promise<Teacher[]>;
  saveTeacher(teacher: Teacher): Promise<Teacher>;
  deleteTeacher(institutionId: string, teacherId: string): Promise<void>;

  // Students
  getStudents(institutionId: string): Promise<Student[]>;
  getStudentById(institutionId: string, studentId: string): Promise<Student | null>;
  saveStudent(student: Student): Promise<Student>;
  deleteStudent(institutionId: string, studentId: string): Promise<void>;

  // Parents
  getParents(institutionId: string): Promise<Parent[]>;
  saveParent(parent: Parent): Promise<Parent>;

  // Payments & Cashier
  getPayments(institutionId: string): Promise<Payment[]>;
  savePayment(payment: Payment): Promise<Payment>;
  deletePayment(institutionId: string, paymentId: string): Promise<void>;

  // Grades & Academic
  getGrades(institutionId: string): Promise<Grade[]>;
  saveGrade(grade: Grade): Promise<Grade>;
  deleteGrade(institutionId: string, gradeId: string): Promise<void>;

  // Report Cards (Bulletins)
  getReportCards(institutionId: string): Promise<ReportCard[]>;
  saveReportCard(reportCard: ReportCard): Promise<ReportCard>;

  // Timetable
  getTimetable(institutionId: string): Promise<TimetableSlot[]>;
  saveTimetableSlot(slot: TimetableSlot): Promise<TimetableSlot>;
  deleteTimetableSlot(institutionId: string, slotId: string): Promise<void>;

  // Homework
  getHomework(institutionId: string): Promise<Homework[]>;
  saveHomework(homework: Homework): Promise<Homework>;
  deleteHomework(institutionId: string, homeworkId: string): Promise<void>;

  // Attendance
  getAttendance(institutionId: string): Promise<AttendanceRecord[]>;
  saveAttendance(record: AttendanceRecord): Promise<AttendanceRecord>;

  // Activity Logs
  getActivityLogs(institutionId: string): Promise<ActivityLog[]>;
  logActivity(log: ActivityLog): Promise<void>;

  // Settings
  getSettings(institutionId: string): Promise<InstitutionSettings | null>;
  saveSettings(settings: InstitutionSettings): Promise<InstitutionSettings>;

  // Backup & Restore
  exportInstitutionData(institutionId: string): Promise<BackupData>;
  restoreInstitutionData(backup: BackupData): Promise<void>;
  resetInstitutionData(institutionId: string): Promise<void>;
}

const DB_NAME = 'sysgesco_offline_db';
const DB_VERSION = 1;

class LocalIndexedDBRepository implements IRepository {
  private db: IDBDatabase | null = null;
  private isFallback = false;
  private fallbackStore: Record<string, any[]> = {};
  private listeners: Array<(event: { store: string; action: 'put' | 'delete'; timestamp: Date }) => void> = [];

  onDatabaseChange(callback: (event: { store: string; action: 'put' | 'delete'; timestamp: Date }) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyChange(store: string, action: 'put' | 'delete') {
    const event = { store, action, timestamp: new Date() };
    this.listeners.forEach((cb) => {
      try {
        cb(event);
      } catch (err) {
        console.error('Error in db listener', err);
      }
    });
  }

  isUsingIndexedDB(): boolean {
    return !this.isFallback && !!this.db;
  }

  getStorageType(): 'IndexedDB' | 'LocalStorage' {
    return this.isUsingIndexedDB() ? 'IndexedDB' : 'LocalStorage';
  }

  async getStorageStats(): Promise<{ totalRecords: number; storageType: string; isIndexedDB: boolean; stores: Record<string, number> }> {
    await this.init();
    const stores = [
      'institutions',
      'users',
      'classes',
      'teachers',
      'students',
      'parents',
      'payments',
      'grades',
      'reportCards',
      'timetable',
      'homework',
      'attendance',
      'activityLogs',
      'settings',
    ];
    const counts: Record<string, number> = {};
    let total = 0;
    for (const s of stores) {
      try {
        const items = await this.getAllFromStore(s);
        counts[s] = items.length;
        total += items.length;
      } catch {
        counts[s] = 0;
      }
    }
    return {
      totalRecords: total,
      storageType: this.getStorageType(),
      isIndexedDB: this.isUsingIndexedDB(),
      stores: counts,
    };
  }

  async testDatabaseWrite(): Promise<{ success: boolean; latencyMs: number; storageType: string }> {
    const start = performance.now();
    try {
      await this.init();
      // Test read-write with a dummy verification key in settings or temp log
      const testLog = {
        id: `__test_ping_${Date.now()}`,
        institutionId: '__sys__',
        timestamp: new Date().toISOString(),
        userId: 'ping',
        userName: 'System Ping',
        userRole: 'superadmin' as any,
        action: 'DB_PING',
        element: 'HealthCheck',
      };
      await this.putInStore('activityLogs', testLog);
      await this.deleteFromStore('activityLogs', testLog.id);
      const latency = Math.round(performance.now() - start);
      return { success: true, latencyMs: Math.max(1, latency), storageType: this.getStorageType() };
    } catch {
      return { success: false, latencyMs: Math.round(performance.now() - start), storageType: this.getStorageType() };
    }
  }

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        this.useFallback();
        resolve();
        return;
      }

      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const stores = [
            'institutions',
            'users',
            'classes',
            'teachers',
            'students',
            'parents',
            'payments',
            'grades',
            'reportCards',
            'timetable',
            'homework',
            'attendance',
            'activityLogs',
            'settings',
          ];

          for (const store of stores) {
            if (!db.objectStoreNames.contains(store)) {
              db.createObjectStore(store, { keyPath: 'id' });
            }
          }
        };

        request.onsuccess = (event: Event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          resolve();
        };

        request.onerror = () => {
          console.warn('IndexedDB unavailable, falling back to LocalStorage');
          this.useFallback();
          resolve();
        };
      } catch (err) {
        console.warn('IndexedDB init error, fallback active', err);
        this.useFallback();
        resolve();
      }
    });
  }

  private useFallback() {
    this.isFallback = true;
    try {
      const saved = localStorage.getItem('sysgesco_fallback_data');
      if (saved) {
        this.fallbackStore = JSON.parse(saved);
      }
    } catch {
      this.fallbackStore = {};
    }
  }

  private persistFallback() {
    try {
      localStorage.setItem('sysgesco_fallback_data', JSON.stringify(this.fallbackStore));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }
  }

  private async getAllFromStore<T>(storeName: string): Promise<T[]> {
    await this.init();
    if (this.isFallback || !this.db) {
      return (this.fallbackStore[storeName] || []) as T[];
    }

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db!.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result as T[]);
        req.onerror = () => reject(req.error);
      } catch (e) {
        resolve((this.fallbackStore[storeName] || []) as T[]);
      }
    });
  }

  private async putInStore<T extends { id: string }>(storeName: string, item: T): Promise<T> {
    await this.init();
    if (this.isFallback || !this.db) {
      const list = this.fallbackStore[storeName] || [];
      const index = list.findIndex((i: any) => i.id === item.id);
      if (index >= 0) {
        list[index] = item;
      } else {
        list.push(item);
      }
      this.fallbackStore[storeName] = list;
      this.persistFallback();
      this.notifyChange(storeName, 'put');
      return item;
    }

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db!.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.put(item);
        req.onsuccess = () => {
          this.notifyChange(storeName, 'put');
          resolve(item);
        };
        req.onerror = () => reject(req.error);
      } catch (e) {
        // Fallback gracefully
        this.useFallback();
        this.putInStore(storeName, item).then(resolve).catch(reject);
      }
    });
  }

  private async deleteFromStore(storeName: string, id: string): Promise<void> {
    await this.init();
    if (this.isFallback || !this.db) {
      const list = this.fallbackStore[storeName] || [];
      this.fallbackStore[storeName] = list.filter((i: any) => i.id !== id);
      this.persistFallback();
      this.notifyChange(storeName, 'delete');
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db!.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.delete(id);
        req.onsuccess = () => {
          this.notifyChange(storeName, 'delete');
          resolve();
        };
        req.onerror = () => reject(req.error);
      } catch (e) {
        resolve();
      }
    });
  }

  // --- INSTITUTIONS ---
  async getInstitutions(): Promise<Institution[]> {
    return this.getAllFromStore<Institution>('institutions');
  }

  async getInstitutionById(id: string): Promise<Institution | null> {
    const list = await this.getInstitutions();
    return list.find((i) => i.id === id) || null;
  }

  async getInstitutionByCode(code: string): Promise<Institution | null> {
    const list = await this.getInstitutions();
    return list.find((i) => i.code.trim().toUpperCase() === code.trim().toUpperCase()) || null;
  }

  async saveInstitution(institution: Institution): Promise<Institution> {
    return this.putInStore<Institution>('institutions', institution);
  }

  async deleteInstitution(id: string): Promise<void> {
    await this.deleteFromStore('institutions', id);
    // Also remove related data
    await this.resetInstitutionData(id);
  }

  // --- USERS ---
  async getUsers(institutionId: string): Promise<User[]> {
    const all = await this.getAllFromStore<User>('users');
    return all.filter((u) => u.institutionId === institutionId || u.role === 'superadmin');
  }

  async getUserByCredentials(institutionId: string, username: string): Promise<User | null> {
    const users = await this.getAllFromStore<User>('users');
    const cleanUsername = username.trim().toLowerCase();
    
    // Super admins can log in from any context
    const superAdmin = users.find(
      (u) => u.role === 'superadmin' && u.username.toLowerCase() === cleanUsername
    );
    if (superAdmin) return superAdmin;

    return (
      users.find(
        (u) =>
          u.institutionId === institutionId &&
          u.username.toLowerCase() === cleanUsername
      ) || null
    );
  }

  async saveUser(user: User): Promise<User> {
    return this.putInStore<User>('users', user);
  }

  async deleteUser(_institutionId: string, userId: string): Promise<void> {
    return this.deleteFromStore('users', userId);
  }

  // --- CLASSES ---
  async getClasses(institutionId: string): Promise<ClassRoom[]> {
    const all = await this.getAllFromStore<ClassRoom>('classes');
    return all.filter((c) => c.institutionId === institutionId);
  }

  async saveClass(classRoom: ClassRoom): Promise<ClassRoom> {
    return this.putInStore<ClassRoom>('classes', classRoom);
  }

  async deleteClass(_institutionId: string, classId: string): Promise<void> {
    return this.deleteFromStore('classes', classId);
  }

  // --- TEACHERS ---
  async getTeachers(institutionId: string): Promise<Teacher[]> {
    const all = await this.getAllFromStore<Teacher>('teachers');
    return all.filter((t) => t.institutionId === institutionId);
  }

  async saveTeacher(teacher: Teacher): Promise<Teacher> {
    return this.putInStore<Teacher>('teachers', teacher);
  }

  async deleteTeacher(_institutionId: string, teacherId: string): Promise<void> {
    return this.deleteFromStore('teachers', teacherId);
  }

  // --- STUDENTS ---
  async getStudents(institutionId: string): Promise<Student[]> {
    const all = await this.getAllFromStore<Student>('students');
    return all.filter((s) => s.institutionId === institutionId);
  }

  async getStudentById(institutionId: string, studentId: string): Promise<Student | null> {
    const all = await this.getStudents(institutionId);
    return all.find((s) => s.id === studentId) || null;
  }

  async saveStudent(student: Student): Promise<Student> {
    return this.putInStore<Student>('students', student);
  }

  async deleteStudent(_institutionId: string, studentId: string): Promise<void> {
    return this.deleteFromStore('students', studentId);
  }

  // --- PARENTS ---
  async getParents(institutionId: string): Promise<Parent[]> {
    const all = await this.getAllFromStore<Parent>('parents');
    return all.filter((p) => p.institutionId === institutionId);
  }

  async saveParent(parent: Parent): Promise<Parent> {
    return this.putInStore<Parent>('parents', parent);
  }

  // --- PAYMENTS & CAISSE ---
  async getPayments(institutionId: string): Promise<Payment[]> {
    const all = await this.getAllFromStore<Payment>('payments');
    return all.filter((p) => p.institutionId === institutionId);
  }

  async savePayment(payment: Payment): Promise<Payment> {
    return this.putInStore<Payment>('payments', payment);
  }

  async deletePayment(_institutionId: string, paymentId: string): Promise<void> {
    return this.deleteFromStore('payments', paymentId);
  }

  // --- GRADES & ACADEMIC ---
  async getGrades(institutionId: string): Promise<Grade[]> {
    const all = await this.getAllFromStore<Grade>('grades');
    return all.filter((g) => g.institutionId === institutionId);
  }

  async saveGrade(grade: Grade): Promise<Grade> {
    return this.putInStore<Grade>('grades', grade);
  }

  async deleteGrade(_institutionId: string, gradeId: string): Promise<void> {
    return this.deleteFromStore('grades', gradeId);
  }

  // --- REPORT CARDS ---
  async getReportCards(institutionId: string): Promise<ReportCard[]> {
    const all = await this.getAllFromStore<ReportCard>('reportCards');
    return all.filter((r) => r.institutionId === institutionId);
  }

  async saveReportCard(reportCard: ReportCard): Promise<ReportCard> {
    return this.putInStore<ReportCard>('reportCards', reportCard);
  }

  // --- TIMETABLE ---
  async getTimetable(institutionId: string): Promise<TimetableSlot[]> {
    const all = await this.getAllFromStore<TimetableSlot>('timetable');
    return all.filter((t) => t.institutionId === institutionId);
  }

  async saveTimetableSlot(slot: TimetableSlot): Promise<TimetableSlot> {
    return this.putInStore<TimetableSlot>('timetable', slot);
  }

  async deleteTimetableSlot(_institutionId: string, slotId: string): Promise<void> {
    return this.deleteFromStore('timetable', slotId);
  }

  // --- HOMEWORK ---
  async getHomework(institutionId: string): Promise<Homework[]> {
    const all = await this.getAllFromStore<Homework>('homework');
    return all.filter((h) => h.institutionId === institutionId);
  }

  async saveHomework(homework: Homework): Promise<Homework> {
    return this.putInStore<Homework>('homework', homework);
  }

  async deleteHomework(_institutionId: string, homeworkId: string): Promise<void> {
    return this.deleteFromStore('homework', homeworkId);
  }

  // --- ATTENDANCE ---
  async getAttendance(institutionId: string): Promise<AttendanceRecord[]> {
    const all = await this.getAllFromStore<AttendanceRecord>('attendance');
    return all.filter((a) => a.institutionId === institutionId);
  }

  async saveAttendance(record: AttendanceRecord): Promise<AttendanceRecord> {
    return this.putInStore<AttendanceRecord>('attendance', record);
  }

  // --- ACTIVITY LOGS ---
  async getActivityLogs(institutionId: string): Promise<ActivityLog[]> {
    const all = await this.getAllFromStore<ActivityLog>('activityLogs');
    return all.filter((l) => l.institutionId === institutionId).sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
  }

  async logActivity(log: ActivityLog): Promise<void> {
    await this.putInStore<ActivityLog>('activityLogs', log);
  }

  // --- SETTINGS ---
  async getSettings(institutionId: string): Promise<InstitutionSettings | null> {
    const all = await this.getAllFromStore<InstitutionSettings>('settings');
    return all.find((s) => s.institutionId === institutionId) || null;
  }

  async saveSettings(settings: InstitutionSettings): Promise<InstitutionSettings> {
    return this.putInStore<InstitutionSettings>('settings', settings);
  }

  // --- BACKUP & RESTORE ---
  async exportInstitutionData(institutionId: string): Promise<BackupData> {
    const institution = await this.getInstitutionById(institutionId);
    if (!institution) {
      throw new Error(`Établissement introuvable (ID: ${institutionId})`);
    }

    const [
      users,
      classes,
      teachers,
      students,
      parents,
      payments,
      grades,
      reportCards,
      timetable,
      homework,
      attendance,
      activityLogs,
      settings,
    ] = await Promise.all([
      this.getUsers(institutionId),
      this.getClasses(institutionId),
      this.getTeachers(institutionId),
      this.getStudents(institutionId),
      this.getParents(institutionId),
      this.getPayments(institutionId),
      this.getGrades(institutionId),
      this.getReportCards(institutionId),
      this.getTimetable(institutionId),
      this.getHomework(institutionId),
      this.getAttendance(institutionId),
      this.getActivityLogs(institutionId),
      this.getSettings(institutionId),
    ]);

    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      institution,
      users,
      classes,
      teachers,
      students,
      parents,
      payments,
      grades,
      reportCards,
      timetable,
      homework,
      attendance,
      activityLogs,
      settings: settings || {
        id: `settings-${institutionId}`,
        institutionId,
        currency: 'FCFA',
        defaultTuition: 350000,
        schoolYear: institution.academicYear,
        enableRankings: true,
      },
    };
  }

  async restoreInstitutionData(backup: BackupData): Promise<void> {
    if (!backup.institution || !backup.institution.id) {
      throw new Error('Fichier de sauvegarde invalide ou corrompu.');
    }

    const instId = backup.institution.id;
    // Wipe existing data for this institution only to prevent cross-leakage
    await this.resetInstitutionData(instId);

    // Save institution
    await this.saveInstitution(backup.institution);

    // Bulk save collections
    const putAll = async <T extends { id: string }>(storeName: string, items: T[]) => {
      for (const item of items) {
        await this.putInStore(storeName, item);
      }
    };

    if (backup.users) await putAll('users', backup.users);
    if (backup.classes) await putAll('classes', backup.classes);
    if (backup.teachers) await putAll('teachers', backup.teachers);
    if (backup.students) await putAll('students', backup.students);
    if (backup.parents) await putAll('parents', backup.parents);
    if (backup.payments) await putAll('payments', backup.payments);
    if (backup.grades) await putAll('grades', backup.grades);
    if (backup.reportCards) await putAll('reportCards', backup.reportCards);
    if (backup.timetable) await putAll('timetable', backup.timetable);
    if (backup.homework) await putAll('homework', backup.homework);
    if (backup.attendance) await putAll('attendance', backup.attendance);
    if (backup.activityLogs) await putAll('activityLogs', backup.activityLogs);
    if (backup.settings) await this.saveSettings(backup.settings);
  }

  async resetInstitutionData(institutionId: string): Promise<void> {
    const stores = [
      'users',
      'classes',
      'teachers',
      'students',
      'parents',
      'payments',
      'grades',
      'reportCards',
      'timetable',
      'homework',
      'attendance',
      'activityLogs',
      'settings',
    ];

    for (const storeName of stores) {
      const items = await this.getAllFromStore<any>(storeName);
      const toDelete = items.filter((i) => i.institutionId === institutionId);
      for (const item of toDelete) {
        await this.deleteFromStore(storeName, item.id);
      }
    }
  }
}

// Singleton repository instance
export const repository: IRepository = new LocalIndexedDBRepository();
