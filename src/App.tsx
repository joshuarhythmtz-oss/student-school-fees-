import React, { useState, useEffect, useMemo } from 'react';
import {
  Student,
  TeacherAccount,
  PaymentRecord,
  SchoolSettings,
  AcademicPeriod,
  FilterCategory
} from './types';
import {
  loadSettings,
  saveSettings,
  loadTeachers,
  saveTeachers,
  getActiveTeacher,
  setActiveTeacherId,
  registerTeacher,
  loadStudents,
  saveStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  loadPayments,
  savePayments,
  recordPayment,
  eliminateStudent,
  renewStudentRecord,
  loadAcademicPeriods,
  startNewAcademicPeriod,
  exportStudentsToCSV,
  resetToDefaultData
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { StudentTable } from './components/StudentTable';
import { StudentProfileModal } from './components/StudentProfileModal';
import { RegisterStudentModal } from './components/RegisterStudentModal';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { RecordRenewalModal } from './components/RecordRenewalModal';
import { ReminderModal } from './components/ReminderModal';
import { AcademicPeriodModal } from './components/AcademicPeriodModal';
import { AuthModal } from './components/AuthModal';
import { DataBackupModal } from './components/DataBackupModal';
import { DeleteStudentModal } from './components/DeleteStudentModal';
import {
  AlertTriangle,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  UserX,
  CreditCard,
  RotateCcw,
  CheckCircle2,
  Calendar,
  School
} from 'lucide-react';
import { formatCurrency } from './utils/formatters';
import { useLanguage } from './context/LanguageContext';

export default function App() {
  const { t } = useLanguage();
  // Theme state ('dark' or 'light')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('student_fees_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // Default to "Sophisticated Dark" as requested
  });

  // Apply dark class to <html> element and persist in localStorage
  useEffect(() => {
    localStorage.setItem('student_fees_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Core application states
  const [settings, setSettings] = useState<SchoolSettings>(loadSettings);
  const [teachers, setTeachers] = useState<TeacherAccount[]>(loadTeachers);
  const [activeTeacher, setActiveTeacher] = useState<TeacherAccount>(getActiveTeacher);
  const [students, setStudents] = useState<Student[]>(loadStudents);
  const [payments, setPayments] = useState<PaymentRecord[]>(loadPayments);
  const [periods, setPeriods] = useState<AcademicPeriod[]>(loadAcademicPeriods);

  // Active filter category (All, Active, Pending Elimination, Eliminated, Full Paid, Finishing Soon)
  const [currentCategory, setCurrentCategory] = useState<FilterCategory>('all');

  // Modals state
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTargetStudent, setPaymentTargetStudent] = useState<Student | null>(null);
  const [activeReceiptPayment, setActiveReceiptPayment] = useState<PaymentRecord | null>(null);
  const [renewalTargetStudent, setRenewalTargetStudent] = useState<Student | null>(null);
  const [reminderTargetStudent, setReminderTargetStudent] = useState<Student | null>(null);
  const [isAcademicPeriodModalOpen, setIsAcademicPeriodModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [deleteTargetStudent, setDeleteTargetStudent] = useState<Student | null>(null);

  // Toast / notification banner state
  const [toastMessage, setToastMessage] = useState<{ title: string; type: 'success' | 'alert' | 'info' } | null>(null);

  const showToast = (title: string, type: 'success' | 'alert' | 'info' = 'success') => {
    setToastMessage({ title, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Reload all records from storage
  const reloadData = () => {
    setSettings(loadSettings());
    setTeachers(loadTeachers());
    setActiveTeacher(getActiveTeacher());
    setStudents(loadStudents());
    setPayments(loadPayments());
    setPeriods(loadAcademicPeriods());
  };

  // Switch active teacher & class
  const handleSwitchTeacher = (teacherId: string) => {
    setActiveTeacherId(teacherId);
    const teacher = teachers.find(t => t.id === teacherId);
    if (teacher) {
      setActiveTeacher(teacher);
      showToast(`Switched to ${teacher.fullName} (Class: ${teacher.className})`, 'info');
    }
  };

  // Teacher Login
  const handleTeacherLogin = (teacher: TeacherAccount) => {
    setActiveTeacherId(teacher.id);
    setActiveTeacher(teacher);
    if (teacher.schoolName) {
      const updatedSettings: SchoolSettings = {
        ...settings,
        schoolName: teacher.schoolName,
        address: teacher.schoolAddress || settings.address,
        poBox: teacher.poBox || settings.poBox,
        phone: teacher.phone || settings.phone,
        email: teacher.schoolEmail || settings.email,
      };
      saveSettings(updatedSettings);
      setSettings(updatedSettings);
    }
    showToast(`Welcome back, ${teacher.fullName}! Accessing ${teacher.className}`, 'success');
  };

  // Teacher Registration
  const handleTeacherRegister = (teacherData: Omit<TeacherAccount, 'id' | 'createdAt'>) => {
    const newTeacher = registerTeacher(teacherData);
    // Update school settings with registered school details
    const updatedSettings: SchoolSettings = {
      ...settings,
      schoolName: newTeacher.schoolName,
      address: newTeacher.schoolAddress || settings.address,
      poBox: newTeacher.poBox || settings.poBox,
      phone: newTeacher.phone || settings.phone,
      email: newTeacher.schoolEmail || newTeacher.email,
    };
    saveSettings(updatedSettings);
    setSettings(updatedSettings);
    setTeachers(loadTeachers());
    setActiveTeacher(newTeacher);
    showToast(`Teacher account created for ${newTeacher.fullName} (${newTeacher.className})`, 'success');
  };

  // Teacher Password Reset
  const handleResetPassword = (email: string, newPass: string) => {
    const updatedTeachers = teachers.map(t => {
      if (t.email.toLowerCase() === email.toLowerCase()) {
        return { ...t, password: newPass };
      }
      return t;
    });
    saveTeachers(updatedTeachers);
    setTeachers(updatedTeachers);
    showToast('Password updated successfully. You can now log in.', 'success');
  };

  // Register New Student
  const handleRegisterStudent = (studentData: any) => {
    const newStd = addStudent(studentData);
    setStudents(loadStudents());
    showToast(`Registered ${newStd.fullName} into ${newStd.className} successfully!`, 'success');

    // If initial payment was made during registration, log payment record
    if (newStd.amountPaid > 0) {
      const payRes = recordPayment({
        studentId: newStd.id,
        amount: newStd.amountPaid,
        method: 'Cash',
        referenceNumber: `REG-INIT-${Math.floor(100000 + Math.random() * 900000)}`,
        recordedByTeacher: activeTeacher.fullName,
        notes: 'Initial fee deposit upon registration',
        installmentPeriod: 'Initial Fee Payment',
      });
      setStudents(loadStudents());
      setPayments(loadPayments());
      setActiveReceiptPayment(payRes.payment);
    }
  };

  // Record Fee Payment
  const handlePaymentRecorded = (paymentData: {
    studentId: string;
    amount: number;
    method: PaymentRecord['method'];
    referenceNumber: string;
    recordedByTeacher: string;
    notes?: string;
    installmentPeriod?: string;
  }) => {
    const result = recordPayment(paymentData);
    setStudents(loadStudents());
    setPayments(loadPayments());

    // Update student in open profile if active
    if (selectedStudentForProfile && selectedStudentForProfile.id === result.updatedStudent.id) {
      setSelectedStudentForProfile(result.updatedStudent);
    }

    showToast(
      `Recorded payment of ${formatCurrency(paymentData.amount, settings.currency)} for ${result.updatedStudent.fullName}`,
      'success'
    );

    // Open official receipt modal immediately
    setActiveReceiptPayment(result.payment);
  };

  // Eliminate student (manual action with confirmation)
  const handleEliminateStudent = (student: Student) => {
    const reason = window.prompt(
      `Confirm elimination of ${student.fullName} from active class roll.\nEnter elimination reason:`,
      'Overdue fee payment deadline expired without settlement.'
    );

    if (reason !== null) {
      const updated = eliminateStudent(student.id, reason, activeTeacher.fullName);
      setStudents(loadStudents());
      if (selectedStudentForProfile && selectedStudentForProfile.id === student.id) {
        setSelectedStudentForProfile(updated);
      }
      showToast(`${student.fullName} has been moved to Eliminated Students. Records preserved.`, 'alert');
    }
  };

  // Permanently delete student handler
  const handleConfirmDeleteStudent = (student: Student) => {
    deleteStudent(student.id);
    setStudents(loadStudents());
    setPayments(loadPayments());
    if (selectedStudentForProfile && selectedStudentForProfile.id === student.id) {
      setSelectedStudentForProfile(null);
    }
    setDeleteTargetStudent(null);
    showToast(
      `${student.fullName} ${t.deleteStudentSuccess}`,
      'alert'
    );
  };

  // Perform Record Renewal for eliminated student
  const handleConfirmRenewal = (
    studentId: string,
    feePaid: number,
    teacherName: string,
    notes: string,
    paymentMethod: PaymentRecord['method']
  ) => {
    const res = renewStudentRecord(studentId, feePaid, teacherName, notes, paymentMethod);
    setStudents(loadStudents());
    setPayments(loadPayments());

    if (selectedStudentForProfile && selectedStudentForProfile.id === studentId) {
      setSelectedStudentForProfile(res.student);
    }

    showToast(`Record renewed for ${res.student.fullName}! Restored to Active student list.`, 'success');

    if (res.payment) {
      setActiveReceiptPayment(res.payment);
    }
  };

  // Start new academic period
  const handleStartNewPeriod = (name: string, startDate: string, endDate: string) => {
    startNewAcademicPeriod(name, startDate, endDate);
    reloadData();
    showToast(`Started ${name}. Previous session records safely archived.`, 'success');
  };

  // Save updated school settings
  const handleUpdateSettings = (newSettings: SchoolSettings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
    showToast('School preferences and currency updated.', 'success');
  };

  // Export CSV
  const handleExportCSV = () => {
    const classStudents = students.filter(
      s => s.className.toLowerCase() === activeTeacher.className.toLowerCase()
    );
    exportStudentsToCSV(classStudents, settings.schoolName, activeTeacher.className);
    showToast(`Exported CSV report for ${activeTeacher.className}`, 'info');
  };

  // Filter students belonging to active teacher's class
  const classStudents = useMemo(() => {
    return students.filter(
      s => s.className.toLowerCase() === activeTeacher.className.toLowerCase()
    );
  }, [students, activeTeacher.className]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#080808] text-slate-900 dark:text-zinc-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      {/* Toast message banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-2.5 text-xs font-bold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-700/80 shadow-emerald-950/50'
                : toastMessage.type === 'alert'
                ? 'bg-rose-950/90 text-rose-200 border-rose-700/80 shadow-rose-950/50'
                : 'bg-zinc-900/90 text-zinc-100 border-zinc-700 shadow-black/80'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : toastMessage.type === 'alert' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-teal-400" />
            )}
            <span>{toastMessage.title}</span>
          </div>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        activeTeacher={activeTeacher}
        teachers={teachers}
        settings={settings}
        students={students}
        periods={periods}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSwitchTeacher={handleSwitchTeacher}
        onOpenRegisterStudent={() => setIsRegisterModalOpen(true)}
        onOpenRecordPayment={() => {
          setPaymentTargetStudent(null);
          setIsPaymentModalOpen(true);
        }}
        onOpenAcademicPeriod={() => setIsAcademicPeriodModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSelectStudent={student => setSelectedStudentForProfile(student)}
        onFilterCategory={cat => setCurrentCategory(cat)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Dashboard 7 Key Metrics Cards */}
        <DashboardStats
          students={classStudents}
          currentCategory={currentCategory}
          onSelectCategory={cat => setCurrentCategory(cat)}
          settings={settings}
          className={activeTeacher.className}
        />

        {/* Student Management Table & Quick Action Controls */}
        <StudentTable
          students={classStudents}
          currentCategory={currentCategory}
          onSelectCategory={cat => setCurrentCategory(cat)}
          settings={settings}
          onSelectStudent={student => setSelectedStudentForProfile(student)}
          onOpenRegisterStudent={() => setIsRegisterModalOpen(true)}
          onOpenRecordPaymentForStudent={student => {
            setPaymentTargetStudent(student);
            setIsPaymentModalOpen(true);
          }}
          onOpenRenewalModal={student => setRenewalTargetStudent(student)}
          onOpenReminderModal={student => setReminderTargetStudent(student)}
          onOpenDeleteModal={student => setDeleteTargetStudent(student)}
          onExportCSV={handleExportCSV}
        />
      </main>

      {/* System Footer */}
      <footer className="bg-white dark:bg-[#0b0f19] border-t border-slate-200 dark:border-slate-800/80 py-6 mt-12 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
              <School className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">{t.appTitle}</span>
            <span>—</span>
            <span>{settings.schoolName}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium cursor-pointer transition-colors"
            >
              {t.footerSettings}
            </button>
            <span>•</span>
            <button
              onClick={() => setIsAcademicPeriodModalOpen(true)}
              className="text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium cursor-pointer transition-colors"
            >
              {t.footerPeriods}
            </button>
            <span>•</span>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium cursor-pointer transition-colors"
            >
              {t.footerTeachers}
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}

      {/* 1. Student Profile Modal */}
      {selectedStudentForProfile && (
        <StudentProfileModal
          student={selectedStudentForProfile}
          payments={payments}
          settings={settings}
          activeTeacher={activeTeacher}
          onClose={() => setSelectedStudentForProfile(null)}
          onOpenRecordPayment={std => {
            setPaymentTargetStudent(std);
            setIsPaymentModalOpen(true);
          }}
          onOpenRenewal={std => setRenewalTargetStudent(std)}
          onOpenReminder={std => setReminderTargetStudent(std)}
          onOpenReceipt={payment => setActiveReceiptPayment(payment)}
          onEliminateStudent={handleEliminateStudent}
          onOpenDeleteModal={std => setDeleteTargetStudent(std)}
        />
      )}

      {/* 2. Register Student Modal */}
      <RegisterStudentModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegister={handleRegisterStudent}
        settings={settings}
        activeTeacher={activeTeacher}
        existingCount={classStudents.length}
      />

      {/* 3. Record Fee Payment Modal */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        selectedStudent={paymentTargetStudent}
        students={classStudents.filter(s => s.status !== 'eliminated')}
        settings={settings}
        activeTeacher={activeTeacher}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentTargetStudent(null);
        }}
        onPaymentRecorded={handlePaymentRecorded}
      />

      {/* 4. Official Printable Receipt Modal */}
      <ReceiptModal
        payment={activeReceiptPayment}
        settings={settings}
        onClose={() => setActiveReceiptPayment(null)}
      />

      {/* 5. Record Renewal Modal (Re-admit eliminated student) */}
      <RecordRenewalModal
        student={renewalTargetStudent}
        settings={settings}
        activeTeacher={activeTeacher}
        onClose={() => setRenewalTargetStudent(null)}
        onConfirmRenewal={handleConfirmRenewal}
      />

      {/* 6. 10-Day Elimination Warning & Fee Reminder Modal */}
      <ReminderModal
        student={reminderTargetStudent}
        settings={settings}
        activeTeacher={activeTeacher}
        onClose={() => setReminderTargetStudent(null)}
      />

      {/* 7. Academic Period & Archiving Modal */}
      <AcademicPeriodModal
        isOpen={isAcademicPeriodModalOpen}
        periods={periods}
        settings={settings}
        onClose={() => setIsAcademicPeriodModalOpen(false)}
        onStartNewPeriod={handleStartNewPeriod}
      />

      {/* 8. Teacher Login / Register / Forgot Password Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        teachers={teachers}
        activeTeacher={activeTeacher}
        settings={settings}
        onLogin={handleTeacherLogin}
        onRegister={handleTeacherRegister}
        onResetPassword={handleResetPassword}
      />

      {/* 9. Data Backup & School Settings Modal */}
      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        settings={settings}
        students={classStudents}
        currentClass={activeTeacher.className}
        onUpdateSettings={handleUpdateSettings}
        onDataReloaded={reloadData}
      />

      {/* 10. Delete Student Permanently Confirmation Modal */}
      <DeleteStudentModal
        isOpen={!!deleteTargetStudent}
        student={deleteTargetStudent}
        settings={settings}
        onClose={() => setDeleteTargetStudent(null)}
        onConfirmDelete={handleConfirmDeleteStudent}
      />
    </div>
  );
}
