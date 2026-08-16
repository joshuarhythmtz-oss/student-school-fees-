import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Hourglass,
  UserX,
  FileText,
  Printer,
  History,
  Clock,
  Send,
  Trash2
} from 'lucide-react';
import { Student, PaymentRecord, SchoolSettings, TeacherAccount } from '../types';
import {
  formatCurrency,
  formatDate,
  getDaysUntilDeadline,
  isPendingElimination,
  isFinishingSoon
} from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface StudentProfileModalProps {
  student: Student | null;
  payments: PaymentRecord[];
  settings: SchoolSettings;
  activeTeacher: TeacherAccount;
  onClose: () => void;
  onOpenRecordPayment: (student: Student) => void;
  onOpenRenewal: (student: Student) => void;
  onOpenReminder: (student: Student) => void;
  onOpenReceipt: (payment: PaymentRecord) => void;
  onEliminateStudent: (student: Student) => void;
  onOpenDeleteModal: (student: Student) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  payments,
  settings,
  activeTeacher,
  onClose,
  onOpenRecordPayment,
  onOpenRenewal,
  onOpenReminder,
  onOpenReceipt,
  onEliminateStudent,
  onOpenDeleteModal,
}) => {
  const { t, language } = useLanguage();
  if (!student) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'installments' | 'ledger' | 'history'>('overview');

  const studentPayments = payments.filter(p => p.studentId === student.id);
  const isEliminated = student.status === 'eliminated';
  const isPendingElim = isPendingElimination(student, settings.eliminationWarningDays);
  const isFullyPaid = student.status === 'active' && student.outstandingBalance <= 0;
  const isFinishing = isFinishingSoon(
    student,
    settings.finishingSoonThresholdPercent,
    settings.finishingSoonThresholdAmount
  ) && student.outstandingBalance > 0;
  const daysLeft = getDaysUntilDeadline(student.eliminationDeadline);
  const paymentPercentage = Math.min(
    100,
    Math.round(((student.amountPaid || 0) / (student.totalFees || 1)) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className={`p-4 sm:p-5 text-white flex items-start justify-between ${
          isEliminated ? 'bg-rose-900 dark:bg-rose-950' : 'bg-slate-900 dark:bg-[#090d16]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base ${
              isEliminated ? 'bg-rose-800 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {student.fullName
                .split(' ')
                .map(n => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  {student.fullName}
                </h2>
                {isEliminated && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white border border-rose-300">
                    {t.statusEliminated}
                  </span>
                )}
                {isPendingElim && !isEliminated && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950 border border-amber-300 animate-pulse">
                    ⚠️ {t.badge10DayWarning}
                  </span>
                )}
                {isFullyPaid && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white border border-emerald-300">
                    {t.statusPaid}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 dark:text-slate-400 mt-0.5">
                {t.colAdmissionNo}: <span className="font-semibold text-white">{student.admissionNo}</span> • {t.colClass}:{' '}
                <span className="font-semibold text-white">{student.className}</span> • {t.academicPeriod}:{' '}
                <span className="text-emerald-300 font-medium">{student.academicYear}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 10-Day Elimination Warning Alert Banner if active */}
        {isPendingElim && !isEliminated && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 px-4 py-2.5 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>{language === 'sw' ? 'Onyo:' : 'Warning:'}</strong> {language === 'sw' 
                  ? `Tarehe ya usitishwaji wa masomo inakaribia (${formatDate(student.eliminationDeadline)}). ${daysLeft <= 0 ? 'Muda wa kulipa umekwisha!' : `Zimebaki siku ${daysLeft} kabla ya kusitishwa.`}`
                  : `Elimination deadline is approaching (${formatDate(student.eliminationDeadline)}). ${daysLeft <= 0 ? 'Payment is overdue!' : `${daysLeft} days remaining before auto-elimination.`}`}
              </span>
            </div>
            <button
              onClick={() => onOpenReminder(student)}
              className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer shrink-0"
            >
              {t.sendSmsNotice}
            </button>
          </div>
        )}

        {/* Navigation Tabs inside modal */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b0f19] px-4 pt-2 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t.tabProfileFinancials}</span>
          </button>

          <button
            onClick={() => setActiveTab('installments')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'installments'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{t.tabInstallments} ({student.installments?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ledger'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{t.tabLedger} ({studentPayments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{t.tabElimRenewalLogs}</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.colTotalFees}:</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {formatCurrency(student.totalFees, settings.currency)}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                  <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">{t.amountPaidToDate}:</div>
                  <div className="text-lg font-bold text-emerald-950 dark:text-emerald-200 mt-1">
                    {formatCurrency(student.amountPaid, settings.currency)}
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {paymentPercentage}% {language === 'sw' ? 'ya ada imekamilika' : 'of total fees cleared'}
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border ${
                  student.outstandingBalance > 0
                    ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60'
                    : 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                }`}>
                  <div className={`text-xs font-medium ${
                    student.outstandingBalance > 0 ? 'text-rose-800 dark:text-rose-300' : 'text-emerald-800 dark:text-emerald-300'
                  }`}>
                    {t.currentBalance}:
                  </div>
                  <div className={`text-lg font-bold mt-1 ${
                    student.outstandingBalance > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-800 dark:text-emerald-300'
                  }`}>
                    {formatCurrency(student.outstandingBalance, settings.currency)}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {student.outstandingBalance === 0 ? t.fullyClearedMsg : `${t.colDeadline}: ${formatDate(student.eliminationDeadline)}`}
                  </div>
                </div>
              </div>

              {/* Biographical and Parent Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Student Details Card */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {t.secStudentInfo}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500">{t.fullName}:</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{student.fullName}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500">{t.gender}:</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                        {student.gender === 'Male' ? t.genderMale : t.genderFemale}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500">{t.colAdmissionNo}:</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{student.admissionNo}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500">{t.regDate}:</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(student.registrationDate)}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 dark:text-slate-500">{t.eliminationDeadlineLabel}:</span>
                      <p className={`font-semibold ${isPendingElim ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
                        {formatDate(student.eliminationDeadline)} ({daysLeft <= 0 ? t.dueToday : `${daysLeft} ${t.daysLeft}`})
                      </p>
                    </div>
                    {student.notes && (
                      <div className="col-span-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-700 mt-1">
                        <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">{t.notesLabel}:</span>
                        <p className="text-slate-700 dark:text-slate-300 italic">{student.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Parent / Guardian Card */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {t.secParentInfo}
                    </h3>
                    <button
                      onClick={() => onOpenReminder(student)}
                      className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t.contactParent}</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 text-[11px]">{t.parentGuardianName}:</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{student.parentName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 text-[11px]">{t.phone}:</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{student.parentPhone}</p>
                      </div>
                    </div>

                    {student.parentEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 text-[11px]">{t.parentEmail}:</span>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{student.parentEmail}</p>
                        </div>
                      </div>
                    )}

                    {student.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 text-[11px]">{t.address}:</span>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{student.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INSTALLMENTS */}
          {activeTab === 'installments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.installmentScheduleTitle}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {language === 'sw' 
                      ? 'Fuatilia awamu zilizolipwa na awamu ambazo bado hazijalipwa.' 
                      : 'Track which payment periods have been paid and which ones are still outstanding.'}
                  </p>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {student.installments.filter(i => i.status === 'paid').length} {t.of} {student.installments.length} {t.statusPaid}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {student.installments.map((inst, index) => {
                  const isPaid = inst.status === 'paid';
                  const isPartial = inst.status === 'partial';
                  const isOverdue = !isPaid && new Date(inst.dueDate).getTime() < new Date().getTime();

                  return (
                    <div
                      key={inst.id || index}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isPaid
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                          : isPartial
                          ? 'bg-teal-50/40 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800/60'
                          : isOverdue
                          ? 'bg-rose-50/40 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isPaid
                            ? 'bg-emerald-600 text-white'
                            : isPartial
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {inst.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {t.colDeadline}: <span className="font-medium text-slate-700 dark:text-slate-300">{formatDate(inst.dueDate)}</span>
                            {inst.paidDate && ` • ${t.statusPaid}: ${formatDate(inst.paidDate)}`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {formatCurrency(inst.amountDue, settings.currency)}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {t.amountPaidToDate}: <span className="font-semibold text-emerald-700 dark:text-emerald-400">{formatCurrency(inst.paidAmount, settings.currency)}</span>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          isPaid
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : isPartial
                            ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                            : isOverdue
                            ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {isPaid ? t.statusPaid : isPartial ? (language === 'sw' ? 'Imelipwa Kiasi' : 'Partially Paid') : isOverdue ? t.statusOverdue : (language === 'sw' ? 'Haijalipwa' : 'Not Paid')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: LEDGER */}
          {activeTab === 'ledger' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.paymentLedgerTitle}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {language === 'sw' 
                      ? 'Daftari rasmi la miamala ya fedha inayoonyesha kila awamu ya ada iliyopokelewa.' 
                      : 'Official financial transaction log showing every fee installment received.'}
                  </p>
                </div>
                {!isEliminated && (
                  <button
                    onClick={() => onOpenRecordPayment(student)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{t.recordNewPayment}</span>
                  </button>
                )}
              </div>

              {studentPayments.length === 0 ? (
                <div className="p-8 text-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 text-xs">
                  {t.noTransactionsRecorded}
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-[#0b0f19] text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                        <th className="py-2.5 px-3">{t.receiptNo}</th>
                        <th className="py-2.5 px-3">{t.date}</th>
                        <th className="py-2.5 px-3">{t.paymentAmount}</th>
                        <th className="py-2.5 px-3">{t.methodAndRef}</th>
                        <th className="py-2.5 px-3">{t.balanceAfter}</th>
                        <th className="py-2.5 px-3">{t.recordedBy}</th>
                        <th className="py-2.5 px-3 text-right">{t.actionReceipt}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {studentPayments.map(payment => (
                        <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                            {payment.receiptNumber}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{payment.date}</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-700 dark:text-emerald-400">
                            {formatCurrency(payment.amount, settings.currency)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{payment.method}</span>
                            <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                              {payment.referenceNumber}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                            {formatCurrency(payment.remainingBalance, settings.currency)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">{payment.recordedByTeacher}</td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => onOpenReceipt(payment)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                              title={t.viewReceipt}
                            >
                              <Printer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>{t.actionReceipt}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HISTORY & AUDIT LOGS */}
          {activeTab === 'history' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.tabElimRenewalLogs}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'sw' 
                    ? 'Kumbukumbu rasmi inayoonyesha usitishwaji wa kihistoria na urejeshwaji wa mwanafunzi.' 
                    : 'Audit trail showing historical eliminations and record renewals. Information is securely preserved.'}
                </p>
              </div>

              {/* Elimination Records */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserX className="w-3.5 h-3.5" />
                  <span>{t.eliminationRecords} ({student.eliminationHistory?.length || 0})</span>
                </h4>
                {(!student.eliminationHistory || student.eliminationHistory.length === 0) ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    {t.noEliminationRecords}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {student.eliminationHistory.map(rec => (
                      <div key={rec.id} className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs">
                        <div className="flex items-center justify-between font-semibold text-rose-900 dark:text-rose-200">
                          <span>{t.eliminatedOn}: {formatDate(rec.date)}</span>
                          <span>{t.unpaidBalance}: {formatCurrency(rec.balanceAtElimination, settings.currency)}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 mt-1">{t.reasonLabel}: {rec.reason}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.eliminatedBy}: {rec.eliminatedBy}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Renewal Records */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.renewalRecords} ({student.renewalHistory?.length || 0})</span>
                </h4>
                {(!student.renewalHistory || student.renewalHistory.length === 0) ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    {t.noRenewalRecords}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {student.renewalHistory.map(rec => (
                      <div key={rec.id} className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                        <div className="flex items-center justify-between font-semibold text-emerald-900 dark:text-emerald-200">
                          <span>{t.renewedOn}: {formatDate(rec.date)}</span>
                          <span>{t.renewalPayment}: {formatCurrency(rec.feePaidOnRenewal, settings.currency)}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 mt-1">{t.notesLabel}: {rec.notes}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.renewedBy}: {rec.renewedBy}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 bg-slate-50 dark:bg-[#0b0f19] border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!isEliminated && (
              <button
                onClick={() => onEliminateStudent(student)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold cursor-pointer transition"
                title="Mark student as eliminated due to unpaid fees"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>{t.actionEliminate}</span>
              </button>
            )}

            <button
              onClick={() => onOpenReminder(student)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer transition"
            >
              <Send className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t.sendSmsNotice}</span>
            </button>

            <button
              id="btn-profile-delete-student"
              onClick={() => onOpenDeleteModal(student)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold cursor-pointer transition"
              title={t.deleteStudentPermanently}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>{t.deleteStudent}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
            >
              {t.closeProfile}
            </button>

            {isEliminated ? (
              <button
                onClick={() => onOpenRenewal(student)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t.performRenewal}</span>
              </button>
            ) : (
              <button
                onClick={() => onOpenRecordPayment(student)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>{t.recordFeePayment}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
