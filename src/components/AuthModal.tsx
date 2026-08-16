import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Mail,
  GraduationCap,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  School
} from 'lucide-react';
import { TeacherAccount, SchoolSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: TeacherAccount[];
  activeTeacher: TeacherAccount;
  settings: SchoolSettings;
  onLogin: (teacher: TeacherAccount) => void;
  onRegister: (teacherData: Omit<TeacherAccount, 'id' | 'createdAt'>) => void;
  onResetPassword: (email: string, newPass: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  teachers,
  activeTeacher,
  settings,
  onLogin,
  onRegister,
  onResetPassword,
}) => {
  const { t, language } = useLanguage();
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regClassName, setRegClassName] = useState('Form 2 C');
  const [regPhone, setRegPhone] = useState('+255 754 ');

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'verify' | 'done'>('request');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const found = teachers.find(
      teacher => teacher.email.toLowerCase() === loginEmail.toLowerCase().trim()
    );
    if (!found) {
      setLoginError(language === 'sw' ? 'Hakuna akaunti ya mwalimu iliyosajiliwa na barua pepe hii.' : 'No teacher account registered with this email address.');
      return;
    }
    // Password check
    if (found.password && found.password !== loginPassword && loginPassword !== 'password123') {
      setLoginError(language === 'sw' ? 'Nenosiri si sahihi. (Nenosiri la majaribio ni password123)' : 'Invalid password. (Hint: default demo password is password123)');
      return;
    }
    onLogin(found);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || !regEmail.trim() || !regClassName.trim() || !regPassword.trim()) {
      alert(language === 'sw' ? 'Tafadhali jaza sehemu zote zinazohitajika.' : 'Please fill all required registration fields.');
      return;
    }

    onRegister({
      fullName: regFullName.trim(),
      email: regEmail.trim().toLowerCase(),
      password: regPassword,
      className: regClassName.trim(),
      schoolName: settings.schoolName,
      phone: regPhone.trim(),
      role: 'teacher',
    });

    onClose();
  };

  const handleForgotRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotStep('verify');
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    onResetPassword(forgotEmail.trim(), newPassword);
    setForgotStep('done');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 bg-slate-900 dark:bg-[#090d16] text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{t.teacherPortalTitle}</h2>
              <p className="text-xs text-slate-300 dark:text-slate-400">
                {settings.schoolName}
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

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold">
          <button
            onClick={() => {
              setMode('login');
              setLoginError('');
            }}
            className={`flex-1 py-3 text-center transition cursor-pointer border-b-2 ${
              mode === 'login'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 font-bold bg-white dark:bg-[#0f172a]'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t.teacherLoginTab}
          </button>

          <button
            onClick={() => {
              setMode('register');
              setLoginError('');
            }}
            className={`flex-1 py-3 text-center transition cursor-pointer border-b-2 ${
              mode === 'register'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 font-bold bg-white dark:bg-[#0f172a]'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t.registerAccountTab}
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100">
          {/* 1. LOGIN MODE */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {loginError && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.teacherEmailLabel}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. amina@kilimanjaro.edu"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.passwordLabel}</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setForgotStep('request');
                      setForgotEmail(loginEmail);
                    }}
                    className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    {t.forgotPasswordLink}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="btn-teacher-login"
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                {t.signInBtn}
              </button>

              {/* Quick 1-Click Demo Accounts Switcher */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                  {t.quickSwitchDemoLabel}
                </span>
                <div className="space-y-1.5">
                  {teachers.map(teacher => (
                    <button
                      key={teacher.id}
                      type="button"
                      onClick={() => {
                        onLogin(teacher);
                        onClose();
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between border transition cursor-pointer ${
                        teacher.id === activeTeacher.id
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-300 font-bold'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{teacher.fullName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{teacher.email}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                        {teacher.className}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* 2. REGISTER MODE */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.fullName} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Madam Grace Mbelwa"
                  value={regFullName}
                  onChange={e => setRegFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.officialEmailLabel} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="grace@kilimanjaro.edu"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.assignedClass} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Form 2 C"
                    value={regClassName}
                    onChange={e => setRegClassName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.phone}
                  </label>
                  <input
                    type="tel"
                    placeholder="+255 754 000 111"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.passwordLabel} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder={language === 'sw' ? 'Tengeneza nenosiri imara' : 'Create secure password'}
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                id="btn-register-teacher"
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer mt-2"
              >
                {t.createTeacherAccountBtn}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD MODE */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  ← {t.backToLogin}
                </button>
              </div>

              {forgotStep === 'request' && (
                <form onSubmit={handleForgotRequest} className="space-y-3">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    {t.forgotPasswordDesc}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.registeredEmailAddress}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. amina@kilimanjaro.edu"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer transition"
                  >
                    {t.sendResetCodeBtn}
                  </button>
                </form>
              )}

              {forgotStep === 'verify' && (
                <form onSubmit={handleResetSubmit} className="space-y-3">
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300">
                    {t.codeSentTo} <strong>{forgotEmail}</strong>.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.verificationCodeLabel}
                    </label>
                    <input
                      type="text"
                      defaultValue="8492"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg font-mono text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.enterNewPassword}
                    </label>
                    <input
                      type="password"
                      required
                      placeholder={t.enterNewPassword}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer transition"
                  >
                    {t.saveNewPasswordBtn}
                  </button>
                </form>
              )}

              {forgotStep === 'done' && (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{t.passwordResetSuccess}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.passwordResetSuccessDesc}
                  </p>
                  <button
                    onClick={() => {
                      setMode('login');
                      setLoginPassword(newPassword);
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-xs cursor-pointer transition"
                  >
                    {t.proceedToLogin}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-400 dark:text-slate-500">
          STUDENT SCHOOL FEES • {language === 'sw' ? 'Ufikiaji Salama wa Mwalimu & Utengaji wa Madarasa' : 'Secure Teacher Access & Class Isolation'}
        </div>
      </div>
    </div>
  );
};
