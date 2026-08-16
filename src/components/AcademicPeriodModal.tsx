import React, { useState } from 'react';
import {
  X,
  Calendar,
  Archive,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  History,
  Sparkles
} from 'lucide-react';
import { AcademicPeriod, SchoolSettings } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface AcademicPeriodModalProps {
  isOpen: boolean;
  periods: AcademicPeriod[];
  settings: SchoolSettings;
  onClose: () => void;
  onStartNewPeriod: (name: string, startDate: string, endDate: string) => void;
}

export const AcademicPeriodModal: React.FC<AcademicPeriodModalProps> = ({
  isOpen,
  periods,
  settings,
  onClose,
  onStartNewPeriod,
}) => {
  const { t, language } = useLanguage();
  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  const [periodName, setPeriodName] = useState(
    language === 'sw' ? `Mwaka wa Masomo ${nextYear}` : `Academic Year ${nextYear}`
  );
  const [startDate, setStartDate] = useState(`${nextYear}-01-10`);
  const [endDate, setEndDate] = useState(`${nextYear}-12-10`);
  const [showWizard, setShowWizard] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodName.trim()) return;
    onStartNewPeriod(periodName.trim(), startDate, endDate);
    setShowWizard(false);
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
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">{t.academicPeriodTitle}</h2>
              <p className="text-xs text-slate-300 dark:text-slate-400">
                {t.academicPeriodSubtitle}
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
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs sm:text-sm bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100">
          {/* Explanation Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs space-y-1">
            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Archive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t.nonDestructiveArchiving}</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              {t.nonDestructiveArchivingDesc}
            </p>
          </div>

          {/* New Period Trigger / Form */}
          {!showWizard ? (
            <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
              <div>
                <h4 className="font-bold text-emerald-950 dark:text-emerald-300 text-xs">{t.readyNextYear}</h4>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-400">{t.readyNextYearDesc}</p>
              </div>
              <button
                onClick={() => setShowWizard(true)}
                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs cursor-pointer transition"
              >
                + {t.startNewPeriodBtn}
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 dark:text-emerald-300 text-xs">{t.configureNewPeriod}</span>
                <button
                  type="button"
                  onClick={() => setShowWizard(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {t.cancel}
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.academicPeriodName} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={periodName}
                  onChange={e => setPeriodName(e.target.value)}
                  placeholder={language === 'sw' ? 'mf. Mwaka wa Masomo 2027' : 'e.g. Academic Year 2027'}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.startDate}</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.endDate}</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer transition"
              >
                {t.archiveCurrentAndInit} {periodName}
              </button>
            </form>
          )}

          {/* Periods List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t.academicPeriodsDirectory}
            </h4>
            <div className="space-y-2">
              {periods.map(period => (
                <div
                  key={period.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                    period.isCurrent
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 ring-1 ring-emerald-400/40'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-90'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      period.isCurrent ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {period.isCurrent ? <CheckCircle2 className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>{period.name}</span>
                        {period.isCurrent ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200">
                            {t.currentActiveBadge}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {t.archivedBadge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {t.duration}: {formatDate(period.startDate)} — {formatDate(period.endDate)}
                        {period.archivedAt && ` • ${t.archivedOn} ${formatDate(period.archivedAt)}`}
                      </div>
                    </div>
                  </div>

                  {period.totalFeesCollected !== undefined && period.totalFeesCollected > 0 && (
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(period.totalFeesCollected, settings.currency)}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{t.archivedTotal}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#0b0f19] border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
