import { Student, TeacherAccount, PaymentRecord, SchoolSettings, AcademicPeriod } from '../types';
import { initialSchoolSettings, initialAcademicPeriods, initialTeachers, initialStudents, initialPayments } from './seedData';
import { generateReceiptNumber, formatDateTime } from './formatters';

const STORAGE_KEYS = {
  SETTINGS: 'student_fee_mgmt_settings_v1',
  TEACHERS: 'student_fee_mgmt_teachers_v1',
  ACTIVE_TEACHER_ID: 'student_fee_mgmt_active_teacher_v1',
  STUDENTS: 'student_fee_mgmt_students_v1',
  PAYMENTS: 'student_fee_mgmt_payments_v1',
  PERIODS: 'student_fee_mgmt_periods_v1',
};

// Safe JSON parser
function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

// 1. Settings
export function loadSettings(): SchoolSettings {
  return safeGet<SchoolSettings>(STORAGE_KEYS.SETTINGS, initialSchoolSettings);
}

export function saveSettings(settings: SchoolSettings): void {
  safeSet(STORAGE_KEYS.SETTINGS, settings);
}

// 2. Teachers
export function loadTeachers(): TeacherAccount[] {
  return safeGet<TeacherAccount[]>(STORAGE_KEYS.TEACHERS, initialTeachers);
}

export function saveTeachers(teachers: TeacherAccount[]): void {
  safeSet(STORAGE_KEYS.TEACHERS, teachers);
}

export function getActiveTeacher(): TeacherAccount {
  const teachers = loadTeachers();
  const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_TEACHER_ID);
  const found = teachers.find(t => t.id === activeId);
  return found || teachers[0] || initialTeachers[0];
}

export function setActiveTeacherId(teacherId: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_TEACHER_ID, teacherId);
}

export function registerTeacher(teacher: Omit<TeacherAccount, 'id' | 'createdAt'>): TeacherAccount {
  const teachers = loadTeachers();
  const newTeacher: TeacherAccount = {
    ...teacher,
    id: `teacher-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
  };
  teachers.push(newTeacher);
  saveTeachers(teachers);
  setActiveTeacherId(newTeacher.id);
  return newTeacher;
}

export function updateTeacher(updated: TeacherAccount): void {
  const teachers = loadTeachers();
  const index = teachers.findIndex(t => t.id === updated.id);
  if (index !== -1) {
    teachers[index] = updated;
    saveTeachers(teachers);
  }
}

// 3. Students
export function loadStudents(): Student[] {
  return safeGet<Student[]>(STORAGE_KEYS.STUDENTS, initialStudents);
}

export function saveStudents(students: Student[]): void {
  safeSet(STORAGE_KEYS.STUDENTS, students);
}

export function getStudentsByClass(className: string): Student[] {
  const students = loadStudents();
  if (!className || className === 'All Classes') return students;
  return students.filter(s => s.className.toLowerCase() === className.toLowerCase());
}

export function addStudent(studentData: Omit<Student, 'id' | 'registrationDate' | 'eliminationHistory' | 'renewalHistory'>): Student {
  const students = loadStudents();
  const newStudent: Student = {
    ...studentData,
    id: `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    registrationDate: new Date().toISOString().split('T')[0],
    eliminationHistory: [],
    renewalHistory: [],
  };
  students.unshift(newStudent);
  saveStudents(students);
  return newStudent;
}

export function updateStudent(updatedStudent: Student): void {
  const students = loadStudents();
  const index = students.findIndex(s => s.id === updatedStudent.id);
  if (index !== -1) {
    students[index] = updatedStudent;
    saveStudents(students);
  }
}

export function deleteStudent(studentId: string): void {
  const students = loadStudents();
  const filtered = students.filter(s => s.id !== studentId);
  saveStudents(filtered);
  // Also remove associated payment records for clean re-registration
  const payments = loadPayments();
  const filteredPayments = payments.filter(p => p.studentId !== studentId);
  savePayments(filteredPayments);
}

// 4. Payments
export function loadPayments(): PaymentRecord[] {
  return safeGet<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, initialPayments);
}

export function savePayments(payments: PaymentRecord[]): void {
  safeSet(STORAGE_KEYS.PAYMENTS, payments);
}

export function recordPayment(paymentData: {
  studentId: string;
  amount: number;
  method: PaymentRecord['method'];
  referenceNumber: string;
  recordedByTeacher: string;
  notes?: string;
  installmentPeriod?: string;
}): { payment: PaymentRecord; updatedStudent: Student } {
  const students = loadStudents();
  const payments = loadPayments();

  const studentIndex = students.findIndex(s => s.id === paymentData.studentId);
  if (studentIndex === -1) {
    throw new Error('Student not found');
  }

  const student = students[studentIndex];
  const previousBalance = student.outstandingBalance;
  const newAmountPaid = student.amountPaid + paymentData.amount;
  const newRemainingBalance = Math.max(0, student.totalFees - newAmountPaid);

  // Update installments allocation if applicable
  let remainingAlloc = paymentData.amount;
  const updatedInstallments = student.installments.map(inst => {
    if (inst.status === 'paid') return inst;
    if (remainingAlloc <= 0) return inst;

    const needed = inst.amountDue - inst.paidAmount;
    if (remainingAlloc >= needed) {
      remainingAlloc -= needed;
      return {
        ...inst,
        paidAmount: inst.amountDue,
        status: 'paid' as const,
        paidDate: new Date().toISOString().split('T')[0],
      };
    } else {
      const newPaid = inst.paidAmount + remainingAlloc;
      remainingAlloc = 0;
      return {
        ...inst,
        paidAmount: newPaid,
        status: 'partial' as const,
        paidDate: new Date().toISOString().split('T')[0],
      };
    }
  });

  const updatedStudent: Student = {
    ...student,
    amountPaid: newAmountPaid,
    outstandingBalance: newRemainingBalance,
    installments: updatedInstallments,
  };

  students[studentIndex] = updatedStudent;
  saveStudents(students);

  const newPayment: PaymentRecord = {
    id: `pay-${Date.now()}`,
    studentId: student.id,
    studentName: student.fullName,
    admissionNo: student.admissionNo,
    className: student.className,
    amount: paymentData.amount,
    previousBalance,
    remainingBalance: newRemainingBalance,
    date: formatDateTime(new Date().toISOString()),
    method: paymentData.method,
    referenceNumber: paymentData.referenceNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
    receiptNumber: generateReceiptNumber(),
    recordedByTeacher: paymentData.recordedByTeacher,
    academicYear: student.academicYear,
    notes: paymentData.notes,
    installmentPeriod: paymentData.installmentPeriod || 'Fee Payment',
  };

  payments.unshift(newPayment);
  savePayments(payments);

  return { payment: newPayment, updatedStudent };
}

// 5. Elimination & Record Renewal
export function eliminateStudent(studentId: string, reason: string, teacherName: string): Student {
  const students = loadStudents();
  const index = students.findIndex(s => s.id === studentId);
  if (index === -1) throw new Error('Student not found');

  const student = students[index];
  const eliminationRecord = {
    id: `elim-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    reason: reason || 'Overdue fee payment deadline without settlement.',
    balanceAtElimination: student.outstandingBalance,
    eliminatedBy: teacherName,
  };

  const updated: Student = {
    ...student,
    status: 'eliminated',
    eliminationHistory: [eliminationRecord, ...(student.eliminationHistory || [])],
  };

  students[index] = updated;
  saveStudents(students);
  return updated;
}

export function renewStudentRecord(
  studentId: string,
  feePaidOnRenewal: number,
  renewedBy: string,
  notes: string,
  paymentMethod: PaymentRecord['method'] = 'Cash'
): { student: Student; payment?: PaymentRecord } {
  const students = loadStudents();
  const index = students.findIndex(s => s.id === studentId);
  if (index === -1) throw new Error('Student not found');

  const student = students[index];
  const renewalRecord = {
    id: `ren-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    feePaidOnRenewal,
    renewedBy,
    notes: notes || 'Student renewed after fee clearance.',
  };

  let newAmountPaid = student.amountPaid;
  let newBalance = student.outstandingBalance;
  let paymentResult: PaymentRecord | undefined;

  if (feePaidOnRenewal > 0) {
    const payRes = recordPayment({
      studentId: student.id,
      amount: feePaidOnRenewal,
      method: paymentMethod,
      referenceNumber: `RENEW-${Math.floor(100000 + Math.random() * 900000)}`,
      recordedByTeacher: renewedBy,
      notes: `Renewal fee payment: ${notes}`,
      installmentPeriod: 'Record Renewal Settlement',
    });
    newAmountPaid = payRes.updatedStudent.amountPaid;
    newBalance = payRes.updatedStudent.outstandingBalance;
    paymentResult = payRes.payment;
  }

  // Reload students after recordPayment
  const freshStudents = loadStudents();
  const freshIndex = freshStudents.findIndex(s => s.id === studentId);

  const updated: Student = {
    ...freshStudents[freshIndex],
    status: 'active',
    amountPaid: newAmountPaid,
    outstandingBalance: newBalance,
    renewalHistory: [renewalRecord, ...(student.renewalHistory || [])],
  };

  freshStudents[freshIndex] = updated;
  saveStudents(freshStudents);
  return { student: updated, payment: paymentResult };
}

// 6. Academic Periods & Archiving
export function loadAcademicPeriods(): AcademicPeriod[] {
  return safeGet<AcademicPeriod[]>(STORAGE_KEYS.PERIODS, initialAcademicPeriods);
}

export function saveAcademicPeriods(periods: AcademicPeriod[]): void {
  safeSet(STORAGE_KEYS.PERIODS, periods);
}

export function startNewAcademicPeriod(newPeriodName: string, startDate: string, endDate: string): void {
  const periods = loadAcademicPeriods();
  const students = loadStudents();
  const payments = loadPayments();

  // Archive current
  const updatedPeriods = periods.map(p => {
    if (p.isCurrent) {
      const currentYearPayments = payments.filter(pay => pay.academicYear === p.name);
      const totalCollected = currentYearPayments.reduce((acc, curr) => acc + curr.amount, 0);
      return {
        ...p,
        isCurrent: false,
        archivedAt: new Date().toISOString().split('T')[0],
        totalStudentsCount: students.filter(s => s.academicYear === p.name).length,
        totalFeesCollected: totalCollected,
      };
    }
    return p;
  });

  const newPeriod: AcademicPeriod = {
    id: `acad-${Date.now()}`,
    name: newPeriodName,
    isCurrent: true,
    startDate,
    endDate,
    totalStudentsCount: 0,
    totalFeesCollected: 0,
  };

  updatedPeriods.unshift(newPeriod);
  saveAcademicPeriods(updatedPeriods);

  // Update settings current academic year
  const settings = loadSettings();
  settings.currentAcademicYear = newPeriodName;
  saveSettings(settings);
}

// 7. Backup & Export / Reset
export function exportDataBackup(): string {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    settings: loadSettings(),
    teachers: loadTeachers(),
    students: loadStudents(),
    payments: loadPayments(),
    periods: loadAcademicPeriods(),
  };
  return JSON.stringify(data, null, 2);
}

export function importDataBackup(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !parsed.students || !parsed.teachers) {
      throw new Error('Invalid backup format');
    }
    if (parsed.settings) saveSettings(parsed.settings);
    if (parsed.teachers) saveTeachers(parsed.teachers);
    if (parsed.students) saveStudents(parsed.students);
    if (parsed.payments) savePayments(parsed.payments);
    if (parsed.periods) saveAcademicPeriods(parsed.periods);
    return true;
  } catch (err) {
    console.error('Import failed:', err);
    return false;
  }
}

export function resetToDefaultData(): void {
  saveSettings(initialSchoolSettings);
  saveTeachers(initialTeachers);
  saveStudents(initialStudents);
  savePayments(initialPayments);
  saveAcademicPeriods(initialAcademicPeriods);
  localStorage.setItem(STORAGE_KEYS.ACTIVE_TEACHER_ID, initialTeachers[0].id);
}

export function exportStudentsToCSV(students: Student[], schoolName: string, className: string): void {
  const headers = [
    'Admission No',
    'Full Name',
    'Gender',
    'Class',
    'Parent/Guardian Name',
    'Parent Phone',
    'Total Fees (TZS)',
    'Amount Paid (TZS)',
    'Outstanding Balance (TZS)',
    'Status',
    'Elimination Deadline',
    'Registration Date',
  ];

  const rows = students.map(s => [
    `"${s.admissionNo}"`,
    `"${s.fullName}"`,
    `"${s.gender}"`,
    `"${s.className}"`,
    `"${s.parentName}"`,
    `"${s.parentPhone}"`,
    s.totalFees,
    s.amountPaid,
    s.outstandingBalance,
    `"${s.status.toUpperCase()}"`,
    `"${s.eliminationDeadline}"`,
    `"${s.registrationDate}"`,
  ]);

  const csvContent = [
    `"STUDENT SCHOOL FEES REPORT - ${schoolName.toUpperCase()} - ${className.toUpperCase()}"`,
    `"Generated on: ${new Date().toLocaleString()}"`,
    '',
    headers.join(','),
    ...rows.map(r => r.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Student_Fees_${className.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
