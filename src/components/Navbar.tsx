import React, { useState } from 'react';
import {
  GraduationCap,
  Bell,
  User,
  LogOut,
  PlusCircle,
  CreditCard,
  Download,
  Calendar,
  AlertTriangle,
  ChevronDown,
  Layers,
  Sparkles,
  School,
  Sun,
  Moon,
  Check,
  Globe,
  Languages
} from 'lucide-react';
import { TeacherAccount, SchoolSettings, Student, AcademicPeriod } from '../types';
import { formatCurrency, getDaysUntilDeadline } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  activeTeacher: TeacherAccount;
  teachers: TeacherAccount[];
  settings: SchoolSettings;
  students: Student[];
  periods: AcademicPeriod[];
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onSwitchTeacher: (teacherId: string) => void;
  onOpenRegisterStudent: () => void;
  onOpenRecordPayment: () => void;
  onOpenAcademicPeriod: () => void;
  onOpenBackupModal: () => void;
  onOpenAuthModal: () => void;
  onSelectStudent: (student: Student) => void;
  onFilterCategory: (category: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTeacher,
  teachers,
  settings,
  students,
  periods,
  theme,
  onToggleTheme,
  onSwitchTeacher,
  onOpenRegisterStudent,
  onOpenRecordPayment,
  onOpenAcademicPeriod,
  onOpenBackupModal,
  onOpenAuthModal,
  onSelectStudent,
  onFilterCategory,
}) => {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTeacherMenu, setShowTeacherMenu] = useState(false);

  // Filter students pending elimination in teacher's class
  const classStudents = students.filter(
    s => s.className.toLowerCase() === activeTeacher.className.toLowerCase()
  );

  const pendingEliminationStudents = classStudents.filter(s => {
    if (s.status !== 'active' || s.outstandingBalance <= 0 || !s.eliminationDeadline) return false;
    const days = getDaysUntilDeadline(s.eliminationDeadline);
    return days <= settings.eliminationWarningDays;
  });

  const currentPeriod = periods.find(p => p.isCurrent) || periods[0];

  return (
    <header className="bg-slate-900 dark:bg-[#0b0f19] text-white border-b border-slate-800 dark:border-slate-800/80 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & School Header */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-950/40 text-white">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                  {t.appTitle}
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {currentPeriod?.name || `${t.academicYear} 2026`}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium truncate max-w-xs sm:max-w-md">
                {settings.schoolName}
              </p>
            </div>
          </div>

          {/* Quick Actions, Theme Toggle, Language Switch & Teacher Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Switcher in Navigation Bar */}
            <button
              onClick={toggleLanguage}
              id="btn-language-toggle-nav"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/70 transition-all cursor-pointer shadow-xs text-xs font-semibold"
              title={language === 'en' ? 'Badili lugha kuwa Kiswahili' : 'Switch language to English'}
              aria-label="Toggle Language"
            >
              <Languages className="w-4 h-4 text-teal-400" />
              <span className="text-xs tracking-wider font-bold">
                {language === 'en' ? 'EN' : 'SW'}
              </span>
              <span className="hidden lg:inline text-[11px] text-slate-400 font-normal">
                {language === 'en' ? 'English' : 'Kiswahili'}
              </span>
            </button>

            {/* Theme Toggle Button at Navbar */}
            <button
              onClick={onToggleTheme}
              id="btn-theme-toggle-nav"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/70 transition-all cursor-pointer shadow-xs text-xs font-medium"
              title={`Switch to ${theme === 'dark' ? 'White (Light)' : 'Sophisticated Dark'} theme`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="w-4 h-4 text-emerald-400" />
                  <span className="hidden md:inline text-xs text-slate-300">{t.themeDark}</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline text-xs text-slate-300">{t.themeLight}</span>
                </>
              )}
            </button>

            {/* Quick Action Buttons */}
            <button
              onClick={onOpenRegisterStudent}
              id="btn-register-student-nav"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.registerStudent}</span>
            </button>

            <button
              onClick={onOpenRecordPayment}
              id="btn-record-payment-nav"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 transition-colors shadow-sm cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-teal-400" />
              <span>{t.recordPayment}</span>
            </button>

            {/* Elimination Warning Notifications Bell */}
            <div className="relative">
              <button
                id="btn-notifications-bell"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700/60"
                title={t.notifications}
              >
                <Bell className="w-5 h-5" />
                {pendingEliminationStudents.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white animate-pulse">
                    {pendingEliminationStudents.length}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl z-50 overflow-hidden"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="p-3 bg-slate-850 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-semibold text-white">
                        {t.notifications} ({pendingEliminationStudents.length})
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-300 font-medium px-2 py-0.5 rounded bg-amber-500/20">
                      {t.warningWindow}
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-700/60">
                    {pendingEliminationStudents.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        {t.noEliminationNotices}
                      </div>
                    ) : (
                      pendingEliminationStudents.map(student => {
                        const daysLeft = getDaysUntilDeadline(student.eliminationDeadline);
                        return (
                          <div
                            key={student.id}
                            className="p-3 hover:bg-slate-700/50 transition cursor-pointer"
                            onClick={() => {
                              onSelectStudent(student);
                              setShowNotifications(false);
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-semibold text-white">
                                {student.fullName}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  daysLeft <= 3
                                    ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40 animate-pulse'
                                    : 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                                }`}
                              >
                                {daysLeft <= 0 ? t.dueToday : `${daysLeft} ${t.daysLeft}`}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                              <span>{t.unpaid}: {formatCurrency(student.outstandingBalance, settings.currency)}</span>
                              <span className="text-teal-400 hover:underline">{t.viewAndRemind}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="p-2 bg-slate-900/90 text-center border-t border-slate-700">
                    <button
                      onClick={() => {
                        onFilterCategory('pending_elimination');
                        setShowNotifications(false);
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
                    >
                      {t.viewAllPending}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Teacher Account & Class Switcher Dropdown */}
            <div className="relative">
              <button
                id="btn-teacher-account-menu"
                onClick={() => setShowTeacherMenu(!showTeacherMenu)}
                className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 transition-colors cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                  {activeTeacher.fullName
                    .split(' ')
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-white leading-tight">
                    {activeTeacher.fullName}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-medium">
                    {t.assignedClass}: {activeTeacher.className}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Teacher switch dropdown */}
              {showTeacherMenu && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl z-50 overflow-hidden"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="p-3 bg-slate-850 border-b border-slate-700">
                    <div className="text-xs font-medium text-slate-400">{t.signedInAs}:</div>
                    <div className="text-sm font-bold text-white">{activeTeacher.fullName}</div>
                    <div className="text-xs text-emerald-400 font-semibold mt-0.5">
                      {t.assignedClass}: {activeTeacher.className}
                    </div>
                  </div>

                  {/* Language Switcher in the Menu */}
                  <div className="p-2 border-b border-slate-700">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-teal-400" />
                        <span>{t.languageLabel}:</span>
                      </span>
                      <span className="text-[10px] text-teal-400 font-bold uppercase">
                        {language === 'en' ? 'English' : 'Kiswahili'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 p-1">
                      <button
                        onClick={() => setLanguage('en')}
                        className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                          language === 'en'
                            ? 'bg-slate-700 text-white font-bold border border-teal-500/50 shadow-xs'
                            : 'text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        <span>English (EN)</span>
                        {language === 'en' && <Check className="w-3 h-3 text-teal-400 ml-auto" />}
                      </button>

                      <button
                        onClick={() => setLanguage('sw')}
                        className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                          language === 'sw'
                            ? 'bg-slate-700 text-white font-bold border border-teal-500/50 shadow-xs'
                            : 'text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        <span>Kiswahili (SW)</span>
                        {language === 'sw' && <Check className="w-3 h-3 text-teal-400 ml-auto" />}
                      </button>
                    </div>
                  </div>

                  {/* Theme Switcher in the menu */}
                  <div className="p-2 border-b border-slate-700">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
                      <span>{t.themeLabel}:</span>
                      <span className="text-[10px] text-emerald-400 font-bold capitalize">
                        {theme === 'dark' ? t.themeDark : t.themeLight} Mode
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 p-1">
                      <button
                        onClick={() => {
                          if (theme !== 'dark') onToggleTheme();
                        }}
                        className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                          theme === 'dark'
                            ? 'bg-slate-700 text-white font-bold border border-slate-600 shadow-xs'
                            : 'text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        <Moon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t.themeDark}</span>
                        {theme === 'dark' && <Check className="w-3 h-3 text-emerald-400 ml-auto" />}
                      </button>

                      <button
                        onClick={() => {
                          if (theme !== 'light') onToggleTheme();
                        }}
                        className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                          theme === 'light'
                            ? 'bg-slate-700 text-white font-bold border border-slate-600 shadow-xs'
                            : 'text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                        <span>{t.themeLight}</span>
                        {theme === 'light' && <Check className="w-3 h-3 text-amber-400 ml-auto" />}
                      </button>
                    </div>
                  </div>

                  {/* Switch Class / Teacher Accounts */}
                  <div className="p-2 border-b border-slate-700">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                      {t.switchTeacherClass}:
                    </div>
                    {teachers.map(teacher => (
                      <button
                        key={teacher.id}
                        onClick={() => {
                          onSwitchTeacher(teacher.id);
                          setShowTeacherMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                          teacher.id === activeTeacher.id
                            ? 'bg-emerald-600/30 text-emerald-300 font-bold border border-emerald-500/30'
                            : 'text-slate-300 hover:bg-slate-700/60'
                        }`}
                      >
                        <span className="truncate">{teacher.fullName}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300 font-medium">
                          {teacher.className}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Navigation Links */}
                  <div className="p-1 space-y-0.5 text-xs">
                    <button
                      onClick={() => {
                        onOpenAcademicPeriod();
                        setShowTeacherMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-700/60 flex items-center gap-2 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4 text-teal-400" />
                      <span>{t.academicPeriodsArchive}</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenBackupModal();
                        setShowTeacherMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-700/60 flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      <span>{t.exportBackup}</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenAuthModal();
                        setShowTeacherMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-rose-300 hover:bg-rose-900/30 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>{t.switchTeacherAccount}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};


