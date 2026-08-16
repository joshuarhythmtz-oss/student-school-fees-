import React, { useState } from 'react';
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
  AlertCircle
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
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('+255 ');
  const [parentEmail, setParentEmail] = useState('');
  const [address, setAddress] = useState('');
  const [totalFees, setTotalFees] = useState<number>(1000000);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [eliminationDeadline, setEliminationDeadline] = useState(in30Days);
  const [planType, setPlanType] = useState<'termly' | 'monthly' | 'custom'>('termly');
  const [notes, setNotes] = useState('');

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

    // Generate installment structure based on total fees and plan type
    let installments: Installment[] = [];
    const fees = Number(totalFees) || 1000000;
    const initialPaid = Number(amountPaid) || 0;
    let alloc = initialPaid;

    if (planType === 'termly') {
      const term1Amount = Math.round(fees * 0.4);
      const term2Amount = Math.round(fees * 0.35);
      const term3Amount = fees - term1Amount - term2Amount;

      const terms = [
        { name: language === 'sw' ? 'Muhula 1 (Jan - Apr)' : 'Term 1 (Jan - Apr)', amount: term1Amount, due: '2026-01-30' },
        { name: language === 'sw' ? 'Muhula 2 (Mei - Ago)' : 'Term 2 (May - Aug)', amount: term2Amount, due: '2026-05-30' },
        { name: language === 'sw' ? 'Muhula 3 (Sep - Des)' : 'Term 3 (Sep - Dec)', amount: term3Amount, due: '2026-09-30' },
      ];

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
      // Monthly 10 installments
      const monthlyAmount = Math.round(fees / 10);
      const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
      const monthsSw = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt'];
      const months = language === 'sw' ? monthsSw : monthsEn;

      installments = months.map((m, idx) => {
        const amt = idx === 9 ? fees - monthlyAmount * 9 : monthlyAmount;
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
        return {
          id: `inst-m-${Date.now()}-${idx}`,
          name: language === 'sw' ? `Awamu ya ${m}` : `${m} Installment`,
          amountDue: amt,
          dueDate: `2026-${String(idx + 1).padStart(2, '0')}-28`,
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
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
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
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.gender}</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="Male">{t.genderMale}</option>
                  <option value="Female">{t.genderFemale}</option>
                </select>
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
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="termly">{t.planTermly}</option>
                  <option value="monthly">{t.planMonthly}</option>
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
