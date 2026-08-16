import React from 'react';
import {
  Users,
  UserCheck,
  AlertTriangle,
  UserX,
  CheckCircle2,
  Hourglass,
  DollarSign,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { Student, FilterCategory, SchoolSettings } from '../types';
import { formatCurrency, isPendingElimination, isFinishingSoon } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface DashboardStatsProps {
  students: Student[];
  currentCategory: FilterCategory;
  onSelectCategory: (category: FilterCategory) => void;
  settings: SchoolSettings;
  className: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  students,
  currentCategory,
  onSelectCategory,
  settings,
  className,
}) => {
  const { t } = useLanguage();

  // Compute counts & financial metrics for the current teacher's class
  const totalStudents = students.length;

  const activeStudents = students.filter(s => s.status === 'active').length;

  const pendingEliminationList = students.filter(s =>
    isPendingElimination(s, settings.eliminationWarningDays)
  );
  const pendingEliminationCount = pendingEliminationList.length;

  const eliminatedCount = students.filter(s => s.status === 'eliminated').length;

  const fullPaidCount = students.filter(
    s => s.status === 'active' && s.outstandingBalance <= 0
  ).length;

  const finishingSoonList = students.filter(
    s =>
      isFinishingSoon(
        s,
        settings.finishingSoonThresholdPercent,
        settings.finishingSoonThresholdAmount
      ) && s.outstandingBalance > 0
  );
  const finishingSoonCount = finishingSoonList.length;

  const totalMoneyExpected = students.reduce((acc, s) => acc + (s.totalFees || 0), 0);
  const totalMoneyCollected = students.reduce((acc, s) => acc + (s.amountPaid || 0), 0);
  const totalOutstanding = students.reduce((acc, s) => acc + (s.outstandingBalance || 0), 0);

  const collectionRate = totalMoneyExpected > 0
    ? Math.round((totalMoneyCollected / totalMoneyExpected) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Top Banner / Class Overview Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t.assignedClass}: <span className="text-emerald-600 dark:text-emerald-400">{className}</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {totalStudents} {t.totalEnrolled}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.studentsInClass}
          </p>
        </div>

        {/* Financial Quick Summary Badge */}
        <div className="flex items-center gap-3 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 px-3.5 py-2 rounded-lg text-xs">
          <div className="text-right">
            <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">{t.feesCollected}:</div>
            <div className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
              {formatCurrency(totalMoneyCollected, settings.currency)}
            </div>
          </div>
          <div className="h-7 w-px bg-emerald-200 dark:bg-emerald-800/60" />
          <div className="text-left">
            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{t.outstandingBalance}:</div>
            <div className="text-sm font-bold text-rose-700 dark:text-rose-400">
              {formatCurrency(totalOutstanding, settings.currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of the 7 Key Interactive Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* 1. All Students */}
        <button
          id="stat-all-students"
          onClick={() => onSelectCategory('all')}
          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            currentCategory === 'all'
              ? 'bg-slate-900 dark:bg-slate-800 text-white border-slate-900 dark:border-slate-700 shadow-md ring-2 ring-slate-800/50 dark:ring-emerald-500/40'
              : 'bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`p-2 rounded-lg ${currentCategory === 'all' ? 'bg-slate-800 dark:bg-slate-700 text-slate-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
              <Users className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold opacity-75">All</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight">{totalStudents}</div>
            <div className="text-[11px] font-medium opacity-80 mt-0.5">{t.allStudents}</div>
          </div>
        </button>

        {/* 2. Active Students */}
        <button
          id="stat-active-students"
          onClick={() => onSelectCategory('active')}
          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            currentCategory === 'active'
              ? 'bg-emerald-700 dark:bg-emerald-600 text-white border-emerald-700 dark:border-emerald-500 shadow-md ring-2 ring-emerald-600/50 dark:ring-emerald-400/40'
              : 'bg-white dark:bg-[#0f172a] hover:bg-emerald-50/50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`p-2 rounded-lg ${currentCategory === 'active' ? 'bg-emerald-800 dark:bg-emerald-700 text-white' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'}`}>
              <UserCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold opacity-75">
              {totalStudents > 0 ? `${Math.round((activeStudents / totalStudents) * 100)}%` : '0%'}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight">{activeStudents}</div>
            <div className="text-[11px] font-medium opacity-80 mt-0.5">{t.activeFilter}</div>
          </div>
        </button>

        {/* 3. Pending Elimination (10-day warning) */}
        <button
          id="stat-pending-elimination"
          onClick={() => onSelectCategory('pending_elimination')}
          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            currentCategory === 'pending_elimination'
              ? 'bg-amber-600 dark:bg-amber-600 text-white border-amber-600 dark:border-amber-500 shadow-md ring-2 ring-amber-500/50 dark:ring-amber-400/40'
              : pendingEliminationCount > 0
              ? 'bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 text-slate-900 dark:text-amber-200 border-amber-300/80 dark:border-amber-700/60 shadow-xs ring-1 ring-amber-300/40 dark:ring-amber-600/30'
              : 'bg-white dark:bg-[#0f172a] hover:bg-amber-50/40 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`p-2 rounded-lg ${
              currentCategory === 'pending_elimination'
                ? 'bg-amber-700 dark:bg-amber-700 text-white'
                : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </span>
            {pendingEliminationCount > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                currentCategory === 'pending_elimination'
                  ? 'bg-amber-800 text-amber-100'
                  : 'bg-amber-200 dark:bg-amber-800/60 text-amber-900 dark:text-amber-200'
              }`}>
                {t.warningWindow}
              </span>
            )}
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-amber-950 dark:text-amber-300">
              {pendingEliminationCount}
            </div>
            <div className="text-[11px] font-medium opacity-90 mt-0.5">{t.pendingElimFilter}</div>
          </div>
        </button>

        {/* 4. Eliminated Students (Red styling) */}
        <button
          id="stat-eliminated-students"
          onClick={() => onSelectCategory('eliminated')}
          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            currentCategory === 'eliminated'
              ? 'bg-rose-700 dark:bg-rose-600 text-white border-rose-700 dark:border-rose-500 shadow-md ring-2 ring-rose-600/50 dark:ring-rose-400/40'
              : eliminatedCount > 0
              ? 'bg-rose-50/80 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-950 dark:text-rose-200 border-rose-300 dark:border-rose-800/60 shadow-xs'
              : 'bg-white dark:bg-[#0f172a] hover:bg-rose-50/40 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`p-2 rounded-lg ${
              currentCategory === 'eliminated' ? 'bg-rose-800 dark:bg-rose-700 text-white' : 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
            }`}>
              <UserX className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold opacity-75">{t.unpaid}</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-rose-950 dark:text-rose-300">{eliminatedCount}</div>
            <div className="text-[11px] font-medium opacity-80 mt-0.5">{t.eliminatedFilter}</div>
          </div>
        </button>

        {/* 5. Full Paid Students */}
        <button
          id="stat-full-paid-students"
          onClick={() => onSelectCategory('full_paid')}
          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            currentCategory === 'full_paid'
              ? 'bg-teal-700 dark:bg-teal-600 text-white border-teal-700 dark:border-teal-500 shadow-md ring-2 ring-teal-600/50 dark:ring-teal-400/40'
              : 'bg-white dark:bg-[#0f172a] hover:bg-teal-50/50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`p-2 rounded-lg ${
              currentCategory === 'full_paid' ? 'bg-teal-800 dark:bg-teal-700 text-white' : 'bg-teal-100 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100/80 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200">
              100%
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight">{fullPaidCount}</div>
            <div className="text-[11px] font-medium opacity-80 mt-0.5">{t.fullPaidFilter}</div>
          </div>
        </button>

        {/* 6. Finishing Soon */}
        <button
          id="stat-finishing-soon"
          onClick={() => onSelectCategory('finishing_soon')}
          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            currentCategory === 'finishing_soon'
              ? 'bg-indigo-700 dark:bg-indigo-600 text-white border-indigo-700 dark:border-indigo-500 shadow-md ring-2 ring-indigo-600/50 dark:ring-indigo-400/40'
              : 'bg-white dark:bg-[#0f172a] hover:bg-indigo-50/50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`p-2 rounded-lg ${
              currentCategory === 'finishing_soon' ? 'bg-indigo-800 dark:bg-indigo-700 text-white' : 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300'
            }`}>
              <Hourglass className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold opacity-75">~100%</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight">{finishingSoonCount}</div>
            <div className="text-[11px] font-medium opacity-80 mt-0.5">{t.partialFilter}</div>
          </div>
        </button>

        {/* 7. Money Collected Metric Card */}
        <div
          id="stat-money-collected"
          className="col-span-2 sm:col-span-3 lg:col-span-1 p-3.5 rounded-xl bg-linear-to-br from-slate-900 to-slate-800 dark:from-[#0b0f19] dark:to-[#131c31] text-white border border-slate-700 dark:border-slate-800 shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <TrendingUp className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-200">
              {collectionRate}%
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xs text-slate-400 font-medium">{t.feesCollected}:</div>
            <div className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
              {formatCurrency(totalMoneyCollected, settings.currency)}
            </div>
            {/* Progress mini bar */}
            <div className="w-full bg-slate-700 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, collectionRate)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
