import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  User,
  ArrowRight
} from 'lucide-react';
import { Student, PaymentRecord, SchoolSettings, TeacherAccount } from '../types';
import { formatCurrency, formatDateTime, generateReceiptNumber } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface RecordPaymentModalProps {
  isOpen: boolean;
  selectedStudent: Student | null;
  students: Student[];
  settings: SchoolSettings;
  activeTeacher: TeacherAccount;
  onClose: () => void;
  onPaymentRecorded: (paymentData: {
    studentId: string;
    amount: number;
    method: PaymentRecord['method'];
    referenceNumber: string;
    recordedByTeacher: string;
    notes?: string;
    installmentPeriod?: string;
  }) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  selectedStudent,
  students,
  settings,
  activeTeacher,
  onClose,
  onPaymentRecorded,
}) => {
  const { t, language } = useLanguage();
  if (!isOpen) return null;

  const [studentId, setStudentId] = useState<string>(selectedStudent?.id || (students[0]?.id || ''));
  const [amount, setAmount] = useState<number>(400000);
  const [method, setMethod] = useState<PaymentRecord['method']>('M-Pesa');
  const [referenceNumber, setReferenceNumber] = useState(`REF-${Math.floor(100000 + Math.random() * 900000)}`);
  const [installmentPeriod, setInstallmentPeriod] = useState(
    language === 'sw' ? 'Ada ya Muhula / Awamu' : 'Term Fee Installment'
  );
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (selectedStudent) {
      setStudentId(selectedStudent.id);
      // default amount to either 400000 or outstanding balance if smaller
      if (selectedStudent.outstandingBalance > 0) {
        setAmount(Math.min(400000, selectedStudent.outstandingBalance));
      }
    }
  }, [selectedStudent]);

  const targetStudent = students.find(s => s.id === studentId);
  const currentOutstanding = targetStudent ? targetStudent.outstandingBalance : 0;
  const currentTotalPaid = targetStudent ? targetStudent.amountPaid : 0;
  const totalFees = targetStudent ? targetStudent.totalFees : 0;

  // Live calculation
  const newRemainingBalance = Math.max(0, currentOutstanding - (Number(amount) || 0));
  const newTotalPaid = currentTotalPaid + (Number(amount) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudent) {
      alert(language === 'sw' ? 'Tafadhali chagua mwanafunzi sahihi.' : 'Please select a valid student.');
      return;
    }
    if (amount <= 0) {
      alert(language === 'sw' ? 'Kiasi cha malipo lazima kiwe zaidi ya 0.' : 'Payment amount must be greater than 0.');
      return;
    }

    onPaymentRecorded({
      studentId: targetStudent.id,
      amount: Number(amount),
      method,
      referenceNumber: referenceNumber.trim(),
      recordedByTeacher: activeTeacher.fullName,
      notes: notes.trim(),
      installmentPeriod,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 dark:bg-[#090d16] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">{t.recordPayTitle}</h2>
              <p className="text-xs text-slate-300 dark:text-slate-400">
                {t.signedInAs}: <span className="text-emerald-400 font-semibold">{activeTeacher.fullName}</span> ({activeTeacher.className})
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100">
          {/* 1. Student Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.selectStudent} <span className="text-rose-500">*</span>
            </label>
            <select
              value={studentId}
              onChange={e => {
                const sId = e.target.value;
                setStudentId(sId);
                const s = students.find(item => item.id === sId);
                if (s && s.outstandingBalance > 0) {
                  setAmount(Math.min(400000, s.outstandingBalance));
                }
              }}
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.admissionNo}) — {t.colBalance}: {formatCurrency(s.outstandingBalance, settings.currency)} {s.status === 'eliminated' ? `[${t.statusEliminated.toUpperCase()}]` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Student Balance Card */}
          {targetStudent && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{t.colTotalFees}:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(totalFees, settings.currency)}</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{t.amountPaidToDate}:</span>
                <p className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(currentTotalPaid, settings.currency)}</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{t.currentBalance}:</span>
                <p className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(currentOutstanding, settings.currency)}</p>
              </div>
            </div>
          )}

          {/* 2. Amount & Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.paymentAmount} ({settings.currency}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1000"
                step="1000"
                required
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/30 rounded-lg text-slate-900 dark:text-white font-bold text-base focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.paymentMethod}</label>
              <select
                value={method}
                onChange={e => setMethod(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
              >
                <option value="M-Pesa">{t.methodMpesa}</option>
                <option value="Tigo Pesa">{t.methodTigo}</option>
                <option value="Airtel Money">{t.methodAirtel}</option>
                <option value="Bank Transfer">{t.methodBank}</option>
                <option value="Cash">{t.methodCash}</option>
                <option value="Cheque">{t.methodCheque}</option>
                <option value="Card">{t.methodCard}</option>
              </select>
            </div>
          </div>

          {/* 3. Transaction Reference & Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.transactionRef}
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={e => setReferenceNumber(e.target.value)}
                placeholder={t.transactionRefPlaceholder}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.paymentPeriod}
              </label>
              <input
                type="text"
                value={installmentPeriod}
                onChange={e => setInstallmentPeriod(e.target.value)}
                placeholder={t.paymentPeriodPlaceholder}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Real-time Calculation Preview Box */}
          <div className="p-3.5 rounded-xl bg-emerald-900 dark:bg-emerald-950 text-white shadow-inner space-y-2 border border-emerald-800">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              {t.liveBalanceCalc}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-emerald-950/60 dark:bg-emerald-900/40 p-2 rounded-lg">
                <span className="text-[10px] text-slate-300 block">{t.colTotalFees}:</span>
                <span className="font-bold text-white">
                  {formatCurrency(totalFees, settings.currency)}
                </span>
              </div>
              <div className="bg-emerald-950/60 dark:bg-emerald-900/40 p-2 rounded-lg">
                <span className="text-[10px] text-emerald-300 block">{t.amountBeingPaid}:</span>
                <span className="font-bold text-teal-300">
                  {formatCurrency(amount || 0, settings.currency)}
                </span>
              </div>
              <div className="bg-emerald-950/60 dark:bg-emerald-900/40 p-2 rounded-lg border border-emerald-500/40">
                <span className="text-[10px] text-amber-300 block">{t.newRemainingBalance}:</span>
                <span className="font-bold text-amber-300">
                  {formatCurrency(newRemainingBalance, settings.currency)}
                </span>
              </div>
            </div>
            {newRemainingBalance === 0 && (
              <div className="text-[11px] text-emerald-200 text-center font-semibold pt-1 flex items-center justify-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                {t.fullyClearedMsg}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.paymentNotes}
            </label>
            <input
              type="text"
              placeholder={t.paymentNotesPlaceholder}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Footer */}
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
              id="btn-submit-payment"
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{t.confirmAndGenerateReceipt}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
