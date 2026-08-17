export type StudentStatus = 'active' | 'eliminated' | 'graduated' | 'transferred';

export type Language = 'en' | 'sw';

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'M-Pesa' | 'Tigo Pesa' | 'Airtel Money' | 'Cheque' | 'Card';

export interface PaymentRecord {
  id: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  className: string;
  amount: number;
  previousBalance: number;
  remainingBalance: number;
  date: string;
  method: PaymentMethod;
  referenceNumber: string;
  receiptNumber: string;
  recordedByTeacher: string;
  academicYear: string;
  notes?: string;
  installmentPeriod?: string;
}

export interface Installment {
  id: string;
  name: string; // e.g. "January", "February", "Term 1", "Term 2"
  amountDue: number;
  dueDate: string;
  status: 'paid' | 'partial' | 'unpaid' | 'overdue';
  paidAmount: number;
  paidDate?: string;
}

export interface EliminationRecord {
  id: string;
  date: string;
  reason: string;
  balanceAtElimination: number;
  eliminatedBy: string;
}

export interface RenewalRecord {
  id: string;
  date: string;
  feePaidOnRenewal: number;
  renewedBy: string;
  notes: string;
}

export interface Student {
  id: string;
  admissionNo: string;
  fullName: string;
  gender: 'Male' | 'Female';
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  address?: string;
  className: string;
  academicYear: string;
  enrollmentMonth?: number; // 1 = January, 6 = June, etc.
  enrollmentMonthName?: string; // e.g. "June"
  totalFees: number;
  amountPaid: number;
  outstandingBalance: number;
  status: StudentStatus;
  eliminationDeadline: string; // YYYY-MM-DD
  registrationDate: string;
  notes?: string;
  installments: Installment[];
  eliminationHistory: EliminationRecord[];
  renewalHistory: RenewalRecord[];
}

export interface TeacherAccount {
  id: string;
  fullName: string; // Teacher's Full Name
  email: string; // Teacher's login email
  schoolEmail?: string; // School's official email for receipts
  schoolName: string;
  schoolAddress?: string;
  poBox?: string;
  phone?: string; // School / Teacher Phone Number
  password?: string;
  className: string; // e.g. "Form 2 A"
  role: 'teacher' | 'head_teacher' | 'bursar';
  createdAt: string;
}

export interface SchoolSettings {
  schoolName: string;
  motto: string;
  address: string;
  poBox?: string;
  phone: string;
  email: string; // School official email
  currency: string; // e.g. "TZS", "USD", "KES", "UGX"
  currentAcademicYear: string; // e.g. "2026/2027"
  eliminationWarningDays: number; // default 10 days
  finishingSoonThresholdPercent: number; // e.g. 15%
  finishingSoonThresholdAmount: number; // e.g. 150000 TZS
}

export interface AcademicPeriod {
  id: string;
  name: string; // e.g. "Academic Year 2026", "Academic Year 2025 (Archived)"
  isCurrent: boolean;
  startDate: string;
  endDate: string;
  archivedAt?: string;
  totalStudentsCount?: number;
  totalFeesCollected?: number;
}

export type FilterCategory = 'all' | 'active' | 'pending_elimination' | 'eliminated' | 'full_paid' | 'finishing_soon';
