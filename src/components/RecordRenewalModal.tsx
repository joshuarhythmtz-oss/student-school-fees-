import React, { useState } from 'react';
import {
  X,
  RotateCcw,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  UserCheck
} from 'lucide-react';
import { Student, PaymentRecord, SchoolSettings, TeacherAccount } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface RecordRenewalModalProps {
  student: Student | null;
  settings: SchoolSettings;
  activeTeacher: TeacherAccount;
  onClose: () => void;
  onConfirmRenewal: (
    studentId: string,
    feePaid: number,
    teacherName: string,
    notes: string,
    paymentMethod: PaymentRecord['method']
  ) => void;
}

export const RecordRenewalModal: React.FC<RecordRenewalModalProps> = ({
  student,
  settings,
  activeTeacher,
  onClose,
  onConfirmRenewal,
}) => {
  const { t, language } = useLanguage();
  if (!student) return null;

  const [feePaid, setFeePaid] = useState<number>(
    Math.min(300000, student.outstandingBalance || 300000)
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentRecord['method']>('Cash');
  const [notes, setNotes] = useState(
    language === 'sw'
      ? 'Mzazi amefikia makubaliano ya kulipa ada na uongozi. Mwanafunzi amerejeshwa rasmi shuleni.'
      : 'Parent reached fee clearance agreement with administration. Re-admitted to active student roll.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmRenewal(
      student.id,
      Number(feePaid) || 0,
      activeTeacher.fullName,
      notes.trim(),
      paymentMethod
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:hidden">
      <div
        className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 dark:bg-[#090d16] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">{t.renewalTitle}</h2>
              <p className="text-xs text-slate-300 dark:text-slate-400">
                {t.renewalSubtitle}
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100">
          {/* Target Student Info Card */}
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-950 dark:text-rose-200 text-sm">{student.fullName}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 dark:bg-rose-900/80 text-rose-900 dark:text-rose-200">
                {t.currentlyEliminated}
              </span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              {t.colAdmissionNo}: <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{student.admissionNo}</span> • {t.colClass}:{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">{student.className}</span>
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300 flex justify-between pt-1 border-t border-rose-200/60 dark:border-rose-800/40 font-medium">
              <span>{t.colBalance}:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(student.outstandingBalance, settings.currency)}
              </span>
            </div>
          </div>

          {/* Fee Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.reinstatementFee} ({settings.currency}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="5000"
              required
              value={feePaid}
              onChange={e => setFeePaid(Number(e.target.value))}
              className="w-full px-3 py-2 border border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/40 rounded-lg text-slate-900 dark:text-white font-bold text-base focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Method Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.renewalPaymentMethod}
            </label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
            >
              <option value="Cash">{t.methodCash}</option>
              <option value="M-Pesa">{t.methodMpesa}</option>
              <option value="Tigo Pesa">{t.methodTigo}</option>
              <option value="Airtel Money">{t.methodAirtel}</option>
              <option value="Bank Transfer">{t.methodBank}</option>
              <option value="Cheque">{t.methodCheque}</option>
              <option value="Card">{t.methodCard}</option>
            </select>
          </div>

          {/* Agreement Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.renewalNotes}
            </label>
            <textarea
              rows={3}
              required
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
              id="btn-confirm-renewal"
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>{t.confirmRenewalBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
