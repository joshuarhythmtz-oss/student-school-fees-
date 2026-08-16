import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  CreditCard,
  Phone,
  MessageSquare,
  AlertTriangle,
  RotateCcw,
  Eye,
  CheckCircle2,
  Hourglass,
  UserX,
  FileSpreadsheet,
  Calendar,
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import { Student, FilterCategory, SchoolSettings } from '../types';
import {
  formatCurrency,
  formatDate,
  getDaysUntilDeadline,
  isPendingElimination,
  isFinishingSoon
} from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface StudentTableProps {
  students: Student[];
  currentCategory: FilterCategory;
  onSelectCategory: (category: FilterCategory) => void;
  settings: SchoolSettings;
  onSelectStudent: (student: Student) => void;
  onOpenRegisterStudent: () => void;
  onOpenRecordPaymentForStudent: (student: Student) => void;
  onOpenRenewalModal: (student: Student) => void;
  onOpenReminderModal: (student: Student) => void;
  onOpenDeleteModal: (student: Student) => void;
  onExportCSV: () => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  currentCategory,
  onSelectCategory,
  settings,
  onSelectStudent,
  onOpenRegisterStudent,
  onOpenRecordPaymentForStudent,
  onOpenRenewalModal,
  onOpenReminderModal,
  onOpenDeleteModal,
  onExportCSV,
}) => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'balance' | 'paid' | 'deadline'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter students based on current category tab and search query
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Category filter
      if (currentCategory === 'active' && student.status !== 'active') return false;
      if (currentCategory === 'eliminated' && student.status !== 'eliminated') return false;
      if (
        currentCategory === 'pending_elimination' &&
        !isPendingElimination(student, settings.eliminationWarningDays)
      ) {
        return false;
      }
      if (
        currentCategory === 'full_paid' &&
        (student.status !== 'active' || student.outstandingBalance > 0)
      ) {
        return false;
      }
      if (
        currentCategory === 'finishing_soon' &&
        (!isFinishingSoon(
          student,
          settings.finishingSoonThresholdPercent,
          settings.finishingSoonThresholdAmount
        ) || student.outstandingBalance <= 0)
      ) {
        return false;
      }

      // Search query filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = student.fullName.toLowerCase().includes(query);
        const matchesAdm = student.admissionNo.toLowerCase().includes(query);
        const matchesPhone = student.parentPhone.toLowerCase().includes(query);
        const matchesParent = student.parentName.toLowerCase().includes(query);
        if (!matchesName && !matchesAdm && !matchesPhone && !matchesParent) {
          return false;
        }
      }

      return true;
    });
  }, [students, currentCategory, searchTerm, settings]);

  // Sort logic
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.fullName.localeCompare(b.fullName);
      } else if (sortBy === 'balance') {
        comparison = a.outstandingBalance - b.outstandingBalance;
      } else if (sortBy === 'paid') {
        comparison = a.amountPaid - b.amountPaid;
      } else if (sortBy === 'deadline') {
        comparison = (a.eliminationDeadline || '').localeCompare(b.eliminationDeadline || '');
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredStudents, sortBy, sortOrder]);

  const categories: { id: FilterCategory; label: string; count: number }[] = [
    { id: 'all', label: t.allStudents, count: students.length },
    { id: 'active', label: t.activeFilter, count: students.filter(s => s.status === 'active').length },
    {
      id: 'pending_elimination',
      label: t.pendingElimFilter,
      count: students.filter(s => isPendingElimination(s, settings.eliminationWarningDays)).length,
    },
    { id: 'eliminated', label: t.eliminatedFilter, count: students.filter(s => s.status === 'eliminated').length },
    {
      id: 'full_paid',
      label: t.fullPaidFilter,
      count: students.filter(s => s.status === 'active' && s.outstandingBalance <= 0).length,
    },
    {
      id: 'finishing_soon',
      label: t.partialFilter,
      count: students.filter(
        s =>
          isFinishingSoon(
            s,
            settings.finishingSoonThresholdPercent,
            settings.finishingSoonThresholdAmount
          ) && s.outstandingBalance > 0
      ).length,
    },
  ];

  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
      {/* Category Tabs Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0b0f19]/70 p-2 sm:p-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {categories.map(cat => {
            const isActive = currentCategory === cat.id;
            let badgeStyle = 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300';

            if (cat.id === 'eliminated' && cat.count > 0) {
              badgeStyle = isActive ? 'bg-rose-900 text-white' : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200';
            } else if (cat.id === 'pending_elimination' && cat.count > 0) {
              badgeStyle = isActive ? 'bg-amber-900 text-white' : 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200';
            } else if (cat.id === 'full_paid') {
              badgeStyle = isActive ? 'bg-teal-900 text-white' : 'bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200';
            } else if (isActive) {
              badgeStyle = 'bg-emerald-900 text-white';
            }

            return (
              <button
                key={cat.id}
                id={`tab-filter-${cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`whitespace-nowrap px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-xs ring-1 ring-slate-800 dark:ring-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${badgeStyle}`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="p-3 sm:p-4 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-students"
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#090d16] hover:bg-slate-100/60 dark:hover:bg-[#0d1322] focus:bg-white dark:focus:bg-[#090d16] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Right side controls (Sort & Export) */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#090d16] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>{language === 'sw' ? 'Panga:' : 'Sort:'}</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
            >
              <option value="name" className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">{t.colStudentName}</option>
              <option value="balance" className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">{t.outstandingBalance}</option>
              <option value="paid" className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">{t.colPaid}</option>
              <option value="deadline" className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">{t.colDeadline}</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-1 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold cursor-pointer"
              title="Toggle sort order"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <button
            onClick={onExportCSV}
            id="btn-export-csv"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Download CSV spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.exportCsv}</span>
          </button>

          <button
            onClick={onOpenRegisterStudent}
            id="btn-add-student-table"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.registerStudent}</span>
          </button>
        </div>
      </div>

      {/* Main Student List Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-[#0b0f19] text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <th className="py-3 px-4">{t.colStudentName}</th>
              <th className="py-3 px-4">{language === 'sw' ? 'Mawasiliano ya Mzazi' : 'Parent Contact'}</th>
              <th className="py-3 px-4">{t.colTotalFees}</th>
              <th className="py-3 px-4">{t.colPaid}</th>
              <th className="py-3 px-4">{t.outstandingBalance}</th>
              <th className="py-3 px-4">{language === 'sw' ? 'Hali ya Awamu' : 'Installment Status'}</th>
              <th className="py-3 px-4">{t.colStatus}</th>
              <th className="py-3 px-4 text-right">{t.colActions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {sortedStudents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <div className="max-w-xs mx-auto space-y-2">
                    <UserX className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">No students found</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {searchTerm
                        ? `No match for "${searchTerm}". Try a different name or admission number.`
                        : `There are currently no students in the "${categories.find(c => c.id === currentCategory)?.label}" category.`}
                    </p>
                    <button
                      onClick={onOpenRegisterStudent}
                      className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Register New Student
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              sortedStudents.map(student => {
                const isEliminated = student.status === 'eliminated';
                const isPendingElim = isPendingElimination(student, settings.eliminationWarningDays);
                const isFullyPaid = student.status === 'active' && student.outstandingBalance <= 0;
                const isFinishing =
                  isFinishingSoon(
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
                  <tr
                    key={student.id}
                    className={`transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/50 cursor-pointer ${
                      isEliminated
                        ? 'bg-rose-50/30 dark:bg-rose-950/20'
                        : isPendingElim
                        ? 'bg-amber-50/20 dark:bg-amber-950/20'
                        : isFullyPaid
                        ? 'bg-emerald-50/20 dark:bg-emerald-950/20'
                        : ''
                    }`}
                    onClick={() => onSelectStudent(student)}
                  >
                    {/* 1. Student Name & Adm */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isEliminated
                              ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                              : isPendingElim
                              ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
                              : isFullyPaid
                              ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {student.fullName
                            .split(' ')
                            .map(n => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div>
                          {/* Student's Name in bold red if eliminated per requirement */}
                          <div
                            className={`font-bold tracking-tight text-sm ${
                              isEliminated ? 'text-rose-600 dark:text-rose-400 line-through decoration-rose-400' : 'text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400'
                            }`}
                          >
                            {student.fullName}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            <span>{student.admissionNo}</span>
                            <span>•</span>
                            <span className="capitalize">{student.gender}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Parent Contact */}
                    <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {student.parentName}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{student.parentPhone}</span>
                        <button
                          onClick={() => onOpenReminderModal(student)}
                          title="Send SMS / WhatsApp Fee Reminder"
                          className="p-1 rounded text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* 3. Total Fees */}
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {formatCurrency(student.totalFees, settings.currency)}
                    </td>

                    {/* 4. Amount Paid + Progress bar */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(student.amountPaid, settings.currency)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-20 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isFullyPaid ? 'bg-emerald-500' : isEliminated ? 'bg-rose-400' : 'bg-teal-500'
                            }`}
                            style={{ width: `${paymentPercentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          {paymentPercentage}%
                        </span>
                      </div>
                    </td>

                    {/* 5. Outstanding Balance */}
                    <td className="py-3 px-4">
                      <div
                        className={`font-bold ${
                          student.outstandingBalance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {formatCurrency(student.outstandingBalance, settings.currency)}
                      </div>
                      {student.outstandingBalance === 0 && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Fully Cleared
                        </span>
                      )}
                    </td>

                    {/* 6. Installments Snapshot */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 flex-wrap max-w-[150px]">
                        {student.installments.map((inst, idx) => (
                          <span
                            key={inst.id || idx}
                            title={`${inst.name}: ${inst.status.toUpperCase()} (${formatCurrency(
                              inst.paidAmount,
                              settings.currency
                            )} / ${formatCurrency(inst.amountDue, settings.currency)})`}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              inst.status === 'paid'
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-transparent dark:border-emerald-800/50'
                                : inst.status === 'partial'
                                ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-transparent dark:border-teal-800/50'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-transparent dark:border-slate-700'
                            }`}
                          >
                            T{idx + 1}: {inst.status === 'paid' ? 'Paid' : 'Unpaid'}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* 7. Status & Warning Badges */}
                    <td className="py-3 px-4">
                      {isEliminated ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            <UserX className="w-3 h-3" /> {t.eliminatedFilter}
                          </span>
                          <div className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                            {language === 'sw' ? 'Kwa sababu ya ada' : 'Due to unpaid fees'}
                          </div>
                        </div>
                      ) : isPendingElim ? (
                        <div className="space-y-0.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              daysLeft <= 3
                                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse'
                                : 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            }`}
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            {daysLeft <= 0 ? t.dueToday : `${daysLeft} ${t.daysLeft}`}
                          </span>
                          <div className="text-[10px] text-amber-800 dark:text-amber-400 font-medium">
                            {t.warningWindow}
                          </div>
                        </div>
                      ) : isFullyPaid ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> {t.fullPaidFilter}
                        </span>
                      ) : isFinishing ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          <Hourglass className="w-3 h-3" /> {t.partialFilter}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-transparent dark:border-slate-700">
                          {t.activeFilter}
                        </span>
                      )}
                    </td>

                    {/* 8. Actions */}
                    <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {isEliminated ? (
                          <button
                            id={`btn-renew-student-${student.id}`}
                            onClick={() => onOpenRenewalModal(student)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                            title={t.reinstateStudent}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{t.reinstateStudent}</span>
                          </button>
                        ) : (
                          <button
                            id={`btn-pay-fee-${student.id}`}
                            onClick={() => onOpenRecordPaymentForStudent(student)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                            title={t.payFee}
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>{t.payFee}</span>
                          </button>
                        )}

                        <button
                          id={`btn-view-profile-${student.id}`}
                          onClick={() => onSelectStudent(student)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                          title={t.viewProfile}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          id={`btn-delete-student-${student.id}`}
                          onClick={() => onOpenDeleteModal(student)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 border border-transparent hover:border-rose-200 dark:hover:border-rose-800/60 transition cursor-pointer"
                          title={t.deleteStudentPermanently}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer / Summary */}
      <div className="p-3 bg-slate-50 dark:bg-[#0b0f19] border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          {language === 'sw' ? 'Inaonyesha' : 'Showing'} <span className="font-semibold text-slate-800 dark:text-slate-200">{sortedStudents.length}</span> {language === 'sw' ? 'kati ya' : 'of'}{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">{students.length}</span> {language === 'sw' ? 'wanafunzi katika' : 'students in'}{' '}
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">{categories.find(c => c.id === currentCategory)?.label}</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> {t.eliminatedFilter} (Red)
          </span>
          <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> {t.warningWindow} (Amber)
          </span>
          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> {t.fullPaidFilter} (Green)
          </span>
        </div>
      </div>
    </div>
  );
};
