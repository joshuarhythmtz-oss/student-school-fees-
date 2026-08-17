import React, { useState, useMemo } from 'react';
import {
  X,
  UserPlus,
  DollarSign,
  Calendar,
  Phone,
  User,
  Mail,
  MapPin,
  FileText,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Student, SchoolSettings, TeacherAccount, Installment } from '../types';
import { formatCurrency, generateAdmissionNumber } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface RegisterStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (studentData: any) => void;
  settings: SchoolSettings;
  activeTeacher: TeacherAccount;
  existingCount: number;
}

export const RegisterStudentModal: React.FC<RegisterStudentModalProps> = ({
  isOpen,
  onClose,
  onRegister,
  settings,
  activeTeacher,
  existingCount,
}) => {
  const { t, language } = useLanguage();
  if (!isOpen) return null;

  const defaultAdmissionNo = generateAdmissionNumber(existingCount);
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [fullName, setFullName] = useState('');
  const [admissionNo, setAdmissionNo] = useState(defaultAdmissionNo);
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [enrollmentMonth, setEnrollmentMonth] = useState<number>(1);
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('+255 ');
  const [parentEmail, setParentEmail] = useState('');
  const [address, setAddress] = useState('');
  const [totalFees, setTotalFees] = useState<number>(1000000);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [eliminationDeadline, setEliminationDeadline] = useState(in30Days);
  const [planType, setPlanType] = useState<'termly' | 'monthly'>('termly');
  const [notes, setNotes] = useState('');

  const monthOptionsEn = [
    { value: 1, label: 'Month 1 - January (Start of Academic Year)' },
    { value: 2, label: 'Month 2 - February' },
    { value: 3, label: 'Month 3 - March' },
    { value: 4, label: 'Month 4 - April' },
    { value: 5, label: 'Month 5 - May (Term 2 Start)' },
    { value: 6, label: 'Month 6 - June (Mid-Year)' },
    { value: 7, label: 'Month 7 - July' },
    { value: 8, label: 'Month 8 - August' },
    { value: 9, label: 'Month 9 - September (Term 3 Start)' },
    { value: 10, label: 'Month 10 - October' },
    { value: 11, label: 'Month 11 - November' },
    { value: 12, label: 'Month 12 - December (End of Year)' },
  ];

  const monthOptionsSw = [
    { value: 1, label: 'Mwezi 1 - Januari (Mwanzo wa Mwaka wa Masomo)' },
    { value: 2, label: 'Mwezi 2 - Februari' },
    { value: 3, label: 'Mwezi 3 - Machi' },
    { value: 4, label: 'Mwezi 4 - Aprili' },
    { value: 5, label: 'Mwezi 5 - Mei (Mwanzo wa Muhula wa 2)' },
    { value: 6, label: 'Mwezi 6 - Juni (Katikati ya Mwaka)' },
    { value: 7, label: 'Mwezi 7 - Julai' },
    { value: 8, label: 'Mwezi 8 - Agosti' },
    { value: 9, label: 'Mwezi 9 - Septemba (Mwanzo wa Muhula wa 3)' },
    { value: 10, label: 'Mwezi 10 - Oktoba' },
    { value: 11, label: 'Mwezi 11 - Novemba' },
    { value: 12, label: 'Mwezi 12 - Desemba (Mwisho wa Mwaka)' },
  ];

  const monthNames = language === 'sw'
    ? ['Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const monthOptions = language === 'sw' ? monthOptionsSw : monthOptionsEn;

  // Automatically calculate outstanding balance
  const outstandingBalance = Math.max(0, (totalFees || 0) - (amountPaid || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !parentName.trim() || !parentPhone.trim()) {
      alert(language === 'sw' 
        ? 'Tafadhali jaza Jina la Mwanafunzi, Jina la Mzazi, na Namba ya Simu.' 
        : 'Please fill in Student Name, Parent Name, and Parent Phone Number.');
      return;
    }

    // Generate installment structure based on total fees, plan type, and enrollment month
    let installments: Installment[] = [];
    const fees = Number(totalFees) || 1000000;
    const initialPaid = Number(amountPaid) || 0;
    let alloc = initialPaid;
    const startM = Number(enrollmentMonth) || 1;

    if (planType === 'termly') {
      let terms: { name: string; amount: number; due: string }[] = [];

      if (startM <= 4) {
        // Enrolled during Term 1: All 3 terms
        const t1 = Math.round(fees * 0.4);
        const t2 = Math.round(fees * 0.35);
        const t3 = fees - t1 - t2;
        terms = [
          { name: language === 'sw' ? 'Muhula 1 (Jan - Apr)' : 'Term 1 (Jan - Apr)', amount: t1, due: '2026-01-30' },
          { name: language === 'sw' ? 'Muhula 2 (Mei - Ago)' : 'Term 2 (May - Aug)', amount: t2, due: '2026-05-30' },
          { name: language === 'sw' ? 'Muhula 3 (Sep - Des)' : 'Term 3 (Sep - Dec)', amount: t3, due: '2026-09-30' },
        ];
      } else if (startM <= 8) {
        // Enrolled mid-year (Term 2): 2 terms only
        const t2 = Math.round(fees * 0.55);
        const t3 = fees - t2;
        terms = [
          { name: language === 'sw' ? 'Muhula 2 (Mei - Ago)' : 'Term 2 (May - Aug)', amount: t2, due: '2026-05-30' },
          { name: language === 'sw' ? 'Muhula 3 (Sep - Des)' : 'Term 3 (Sep - Dec)', amount: t3, due: '2026-09-30' },
        ];
      } else {
        // Enrolled late year (Term 3): 1 term only
        terms = [
          { name: language === 'sw' ? 'Muhula 3 (Sep - Des)' : 'Term 3 (Sep - Dec)', amount: fees, due: '2026-09-30' },
        ];
      }

      installments = terms.map((term, idx) => {
        let paid = 0;
        let status: 'paid' | 'partial' | 'unpaid' = 'unpaid';
        if (alloc >= term.amount) {
          paid = term.amount;
          alloc -= term.amount;
          status = 'paid';
        } else if (alloc > 0) {
          paid = alloc;
          alloc = 0;
          status = 'partial';
        }
        return {
          id: `inst-${Date.now()}-${idx}`,
          name: term.name,
          amountDue: term.amount,
          dueDate: term.due,
          status,
          paidAmount: paid,
          paidDate: paid > 0 ? new Date().toISOString().split('T')[0] : undefined,
        };
      });
    } else {
      // Monthly installments starting from enrollmentMonth through December (Month 12)
      const remainingMonthsCount = 12 - startM + 1;
      const count = Math.max(1, remainingMonthsCount);
      const monthlyAmount = Math.round(fees / count);

      const generatedMonths: number[] = [];
      for (let m = startM; m <= 12; m++) {
        generatedMonths.push(m);
      }

      installments = generatedMonths.map((mNum, idx) => {
        const amt = idx === generatedMonths.length - 1 ? fees - monthlyAmount * (count - 1) : monthlyAmount;
        let paid = 0;
        let status: 'paid' | 'partial' | 'unpaid' = 'unpaid';
        if (alloc >= amt) {
          paid = amt;
          alloc -= amt;
          status = 'paid';
        } else if (alloc > 0) {
          paid = alloc;
          alloc = 0;
          status = 'partial';
        }
        const mLabel = monthNames[mNum - 1];
        return {
          id: `inst-m-${Date.now()}-${idx}`,
          name: language === 'sw' ? `Awamu ya ${mLabel}` : `${mLabel} Installment`,
          amountDue: amt,
          dueDate: `2026-${String(mNum).padStart(2, '0')}-28`,
          status,
          paidAmount: paid,
          paidDate: paid > 0 ? new Date().toISOString().split('T')[0] : undefined,
        };
      });
    }

    onRegister({
      admissionNo: admissionNo.trim(),
      fullName: fullName.trim(),
      gender,
      enrollmentMonth: Number(enrollmentMonth),
      enrollmentMonthName: monthNames[Number(enrollmentMonth) - 1],
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      parentEmail: parentEmail.trim(),
      address: address.trim(),
      className: activeTeacher.className,
      academicYear: settings.currentAcademicYear,
      totalFees: Number(totalFees),
      amountPaid: Number(amountPaid),
      outstandingBalance,
      status: 'active',
      eliminationDeadline,
      notes: notes.trim(),
      installments,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 dark:bg-[#090d16] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">{t.regTitle}</h2>
              <p className="text-xs text-slate-300 dark:text-slate-400">
                {t.assignedClass}: <span className="text-emerald-400 font-semibold">{activeTeacher.className}</span> • {settings.schoolName}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100">
          {/* Section 1: Student Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              {t.secStudentInfo}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.fullName} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.fullNamePlaceholder}
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.admissionNo} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={admissionNo}
                  onChange={e => setAdmissionNo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.gender}</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer font-medium"
                >
                  <option value="Male">{t.genderMale}</option>
                  <option value="Female">{t.genderFemale}</option>
                </select>
              </div>

              {/* Enrollment Month Selector */}
              <div className="sm:col-span-2 bg-emerald-50/60 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900">
                <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t.enrollmentMonthLabel || 'Enrollment Month (Start Schedule)'}</span> <span className="text-rose-500">*</span>
                </label>
                <select
                  value={enrollmentMonth}
                  onChange={e => setEnrollmentMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer font-semibold"
                >
                  {monthOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-400 mt-1 font-medium">
                  {t.enrollmentMonthHint || 'The fee installment schedule will start from this selected month onward.'}
                  {enrollmentMonth > 1 && (
                    <span className="block font-bold mt-0.5 text-emerald-700 dark:text-emerald-300">
                      ✓ {language === 'sw' ? `Ratiba itaanza mwezi wa ${monthNames[enrollmentMonth - 1]} hadi mwisho wa mwaka bila madeni ya miezi ya nyuma.` : `Schedule starts from ${monthNames[enrollmentMonth - 1]} to end of year without ghost historical debts.`}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Parent / Guardian Info */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              {t.secParentInfo}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.parentGuardianName} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.parentGuardianPlaceholder}
                  value={parentName}
                  onChange={e => setParentName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.parentPhone} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+255 754 123 456"
                  value={parentPhone}
                  onChange={e => setParentPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.parentEmail}</label>
                <input
                  type="email"
                  placeholder={t.parentEmailPlaceholder}
                  value={parentEmail}
                  onChange={e => setParentEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.address}</label>
                <input
                  type="text"
                  placeholder={t.addressPlaceholder}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Fees & Automatic Calculation */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              {t.secFeeSchedule}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.totalFeesLabel} ({settings.currency}) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  required
                  value={totalFees}
                  onChange={e => setTotalFees(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.initialPaymentLabel} ({settings.currency})
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalFees}
                  step="5000"
                  value={amountPaid}
                  onChange={e => setAmountPaid(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/40 rounded-lg text-emerald-800 dark:text-emerald-300 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Automatic Calculated Outstanding Balance */}
              <div className="bg-slate-100 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  {t.balanceToCollect}:
                </span>
                <span className="text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                  {formatCurrency(outstandingBalance, settings.currency)}
                </span>
              </div>
            </div>

            {/* Fee Schedule / Installment Plan Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.planTypeLabel}
                </label>
                <select
                  value={planType}
                  onChange={e => setPlanType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer font-medium"
                >
                  <option value="termly">{t.planTermly} ({language === 'sw' ? 'Kulingana na Muhula wa Kujiunga' : 'Based on Enrollment Term'})</option>
                  <option value="monthly">{t.planMonthly} ({language === 'sw' ? 'Kuanzia Mwezi Uliochaguliwa' : 'Starting from Chosen Month'})</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.eliminationDeadlineLabel}
                </label>
                <input
                  type="date"
                  value={eliminationDeadline}
                  onChange={e => setEliminationDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                  {language === 'sw' 
                    ? 'Onyo la siku 10 litawashwa kiotomatiki kabla ya tarehe hii.' 
                    : '10-day warning will trigger automatically 10 days before this date.'}
                </span>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.notesLabel}
              </label>
              <textarea
                rows={2}
                placeholder={t.notesPlaceholder}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
            >
              {t.cancel}
            </button>

            <button
              type="submit"
              id="btn-submit-register-student"
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition"
            >
              {t.registerStudent}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
