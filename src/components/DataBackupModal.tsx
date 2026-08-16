import React, { useState } from 'react';
import {
  X,
  Download,
  Upload,
  Settings,
  RotateCcw,
  CheckCircle2,
  FileSpreadsheet,
  AlertTriangle,
  Save
} from 'lucide-react';
import { SchoolSettings, Student } from '../types';
import { exportDataBackup, importDataBackup, resetToDefaultData, exportStudentsToCSV } from '../utils/storage';
import { useLanguage } from '../context/LanguageContext';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SchoolSettings;
  students: Student[];
  currentClass: string;
  onUpdateSettings: (settings: SchoolSettings) => void;
  onDataReloaded: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  settings,
  students,
  currentClass,
  onUpdateSettings,
  onDataReloaded,
}) => {
  const { t, language } = useLanguage();
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'settings' | 'backup'>('settings');

  // Settings state
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [motto, setMotto] = useState(settings.motto);
  const [currency, setCurrency] = useState(settings.currency);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [warningDays, setWarningDays] = useState(settings.eliminationWarningDays);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      schoolName: schoolName.trim(),
      motto: motto.trim(),
      currency,
      phone: phone.trim(),
      email: email.trim(),
      eliminationWarningDays: Number(warningDays) || 10,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleDownloadJSON = () => {
    const jsonStr = exportDataBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Student_School_Fees_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const success = importDataBackup(content);
      if (success) {
        alert(language === 'sw' ? 'Nakala ya mfumo imerejeshwa kikamilifu!' : 'Data backup restored successfully!');
        onDataReloaded();
        onClose();
      } else {
        alert(language === 'sw' ? 'Imeshindwa kurejesha nakala. Hakikisha faili ni sahihi.' : 'Failed to restore backup. Please ensure the file format is correct.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    const msg = language === 'sw'
      ? 'Je, una uhakika unataka kurejesha data zote kwenye mfano wa awali? Mabadiliko yako mapya yataondolewa.'
      : 'Are you sure you want to reset all data back to the default initial demonstration dataset? Any new changes will be replaced.';
    if (window.confirm(msg)) {
      resetToDefaultData();
      onDataReloaded();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 dark:bg-[#090d16] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">{t.backupSettingsTitle}</h2>
              <p className="text-xs text-slate-300 dark:text-slate-400">
                {t.backupSubtitle}
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
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-center transition cursor-pointer border-b-2 ${
              activeTab === 'settings'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 font-bold bg-white dark:bg-[#0f172a]'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t.tabSchoolInfo}
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-3 text-center transition cursor-pointer border-b-2 ${
              activeTab === 'backup'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 font-bold bg-white dark:bg-[#0f172a]'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t.tabBackupRestore}
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100">
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-3">
              {savedNotice && (
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t.settingsSavedNotice}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.schoolNameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={e => setSchoolName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.schoolMottoLabel}
                </label>
                <input
                  type="text"
                  value={motto}
                  onChange={e => setMotto(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden italic"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.currencySymbolLabel}
                  </label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold cursor-pointer"
                  >
                    <option value="TZS">TZS (Tanzanian Shillings)</option>
                    <option value="USD">USD ($)</option>
                    <option value="KES">KES (Kenyan Shillings)</option>
                    <option value="UGX">UGX (Ugandan Shillings)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.warningWindowLabel}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={warningDays}
                      onChange={e => setWarningDays(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold"
                    />
                    <span className="text-slate-500 dark:text-slate-400 text-xs">{t.days}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.officialPhoneLabel}
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.officialEmailLabel}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 mt-3"
              >
                <Save className="w-4 h-4" />
                <span>{t.saveSettingsBtn}</span>
              </button>
            </form>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4">
              {/* Export JSON */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{t.exportBackupTitle}</div>
                  <button
                    onClick={handleDownloadJSON}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.downloadJsonBtn}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.exportBackupDesc}
                </p>
              </div>

              {/* Import JSON */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{t.restoreBackupTitle}</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.restoreBackupDesc}
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
                />
              </div>

              {/* Reset to Demo */}
              <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-rose-950 dark:text-rose-300 text-xs flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>{t.resetDemoTitle}</span>
                  </div>
                  <button
                    onClick={handleReset}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.resetDemoBtn}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  {t.resetDemoDesc}
                </p>
              </div>
            </div>
          )}
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
