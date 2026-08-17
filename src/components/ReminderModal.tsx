import React, { useState } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Phone,
  Copy,
  Check,
  AlertTriangle,
  ExternalLink,
  Languages
} from 'lucide-react';
import { Student, SchoolSettings, TeacherAccount } from '../types';
import { formatCurrency, formatDate, getDaysUntilDeadline } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface ReminderModalProps {
  student: Student | null;
  settings: SchoolSettings;
  activeTeacher: TeacherAccount;
  onClose: () => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  student,
  settings,
  activeTeacher,
  onClose,
}) => {
  const { t, language: appLanguage } = useLanguage();
  if (!student) return null;

  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<'sw' | 'en'>(appLanguage);

  const daysLeft = getDaysUntilDeadline(student.eliminationDeadline);
  const formattedBalance = formatCurrency(student.outstandingBalance, settings.currency);
  const formattedDeadline = formatDate(student.eliminationDeadline);

  // Template generation
  const swahiliMessage = `HABARI YA LEO NDUGU MZAZI/MLEZI WA ${student.fullName.toUpperCase()} (${student.admissionNo}):\n\nUongozi wa ${settings.schoolName} (${activeTeacher.className}) unakukumbusha kulipa baki ya ada ya shule kiasi cha ${formattedBalance} kabla ya tarehe ${formattedDeadline} (${daysLeft <= 0 ? 'Muda umepita!' : `Zimebaki siku ${daysLeft}`}) ili kuepuka usitishwaji wa masomo (Elimination).\n\nMalipo yafanyike kupitia akaunti ya shule au ofisi ya bursar. Kwa mawasiliano piga ${settings.phone}.\n\nAsante,\nMwalimu ${activeTeacher.fullName}.`;

  const englishMessage = `DEAR PARENT/GUARDIAN OF ${student.fullName.toUpperCase()} (${student.admissionNo}):\n\nThis is an official fee reminder from ${settings.schoolName} (${activeTeacher.className}). Please settle the outstanding school fee balance of ${formattedBalance} before the deadline on ${formattedDeadline} (${daysLeft <= 0 ? 'Overdue!' : `${daysLeft} days remaining`}) to ensure uninterrupted studies.\n\nPlease remit payment to the school bursar or official bank account. Inquiries: ${settings.phone}.\n\nThank you,\nTeacher ${activeTeacher.fullName}.`;

  const currentMessage = lang === 'sw' ? swahiliMessage : englishMessage;

  const cleanPhone = student.parentPhone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(currentMessage)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">{t.reminderTitle}</h2>
              <p className="text-xs text-slate-300 dark:text-slate-400">
                {t.recipientParent}: <span className="text-emerald-400 font-semibold">{student.fullName}</span>
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

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100">
          {/* Target Parent Details */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">{t.recipientParent}:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{student.parentName}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">{t.phone}:</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{student.parentPhone}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">{t.colBalance}:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">{formattedBalance}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">{t.colDeadline}:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {formattedDeadline} ({daysLeft <= 0 ? t.dueToday : `${daysLeft} ${t.daysLeft}`})
              </span>
            </div>
          </div>

          {/* Language Switch for Message */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.smsLanguage}:</span>
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setLang('sw')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                  lang === 'sw'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Kiswahili (SW)
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                  lang === 'en'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                English (EN)
              </button>
            </div>
          </div>

          {/* Message Preview Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.smsPreview}
            </label>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono whitespace-pre-wrap text-slate-800 dark:text-slate-200 max-h-48 overflow-y-auto leading-relaxed select-all">
              {currentMessage}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              id="btn-copy-sms"
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>{t.copySms}</span>
                </>
              )}
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t.openWhatsApp}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer transition"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
