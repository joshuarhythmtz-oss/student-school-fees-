import React from 'react';
import { AlertTriangle, Trash2, X, User, GraduationCap, ShieldAlert } from 'lucide-react';
import { Student, SchoolSettings } from '../types';
import { formatCurrency } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface DeleteStudentModalProps {
  isOpen: boolean;
  student: Student | null;
  settings: SchoolSettings;
  onClose: () => void;
  onConfirmDelete: (student: Student) => void;
}

export const DeleteStudentModal: React.FC<DeleteStudentModalProps> = ({
  isOpen,
  student,
  settings,
  onClose,
  onConfirmDelete,
}) => {
  const { t, language } = useLanguage();

  if (!isOpen || !student) return null;

  const handleConfirm = () => {
    onConfirmDelete(student);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-900/50 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-rose-600 dark:bg-rose-950/80 text-white flex items-center justify-between border-b border-rose-700 dark:border-rose-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="delete-modal-title" className="text-base font-bold text-white">
                {t.deleteStudentPermanently}
              </h2>
              <p className="text-xs text-rose-100 dark:text-rose-300">
                {student.className} • {student.admissionNo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/10 hover:bg-black/20 text-white transition cursor-pointer"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs sm:text-sm bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100">
          {/* Prompt Question Box */}
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-rose-950 dark:text-rose-200 leading-snug">
                {t.deleteStudentPrompt} <span className="underline decoration-rose-500 underline-offset-2">{student.fullName}</span>?
              </h3>
              <p className="text-xs text-rose-800 dark:text-rose-300/90 leading-relaxed">
                {t.deleteStudentDesc}
              </p>
            </div>
          </div>

          {/* Student Quick Summary Card */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">{t.fullName}:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{student.fullName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">{t.admissionNo}:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{student.admissionNo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">{t.classLabel}:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{student.className}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">{t.colBalance}:</span>
              <span className="font-bold font-mono text-rose-600 dark:text-rose-400">
                {formatCurrency(student.outstandingBalance, settings.currency)}
              </span>
            </div>
          </div>

          {/* Teacher Re-registration assurance note */}
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-[11px] text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {language === 'sw'
                ? 'Baada ya kumfuta, unaweza kumsajili mwanafunzi huyu tena wakati wowote na kuandika rekodi mpya ya ada.'
                : 'After deleting, the teacher can register this student again at any time and write fresh fee records.'}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-[#0b0f19] border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            id="btn-confirm-delete-student"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.yesDelete}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
