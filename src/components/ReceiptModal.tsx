import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';
import { PaymentRecord, SchoolSettings } from '../types';
import { formatCurrency, numberToWords } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface ReceiptModalProps {
  payment: PaymentRecord | null;
  settings: SchoolSettings;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  payment,
  settings,
  onClose,
}) => {
  const { t, language } = useLanguage();
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="receipt-modal-wrapper fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:static print:p-0 print:m-0 print:bg-white print:overflow-visible print:inset-auto print:z-auto print:block">
      <div
        className="receipt-modal-container bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors print:max-h-none print:shadow-none print:border-none print:w-full print:max-w-none print:rounded-none print:overflow-visible print:p-0 print:m-0 print:bg-white print:block"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden during print) */}
        <div className="p-3.5 bg-slate-900 dark:bg-[#090d16] text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold uppercase tracking-wide">{t.officialReceipt}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              id="btn-print-receipt"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t.printReceiptBtn}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              aria-label={t.close}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Container (Strictly 1-Page Constrained) */}
        <div 
          className="receipt-printable-page p-5 sm:p-7 overflow-y-auto flex-1 bg-white text-slate-900 print:p-0 print:m-0 print:overflow-visible print:w-full print:block" 
          id="printable-receipt"
        >
          <div className="receipt-printable-card border-2 border-slate-900 rounded-xl p-5 sm:p-6 bg-white print:rounded-lg print:border-2 print:border-black print:p-4 print:m-0">
            
            {/* Header: School Identity & Document Title (Strictly no logos or icons) */}
            <div className="text-center border-b-2 border-slate-900 pb-3 sm:pb-4">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-950 uppercase leading-tight">
                {settings.schoolName}
              </h1>
              
              {settings.motto && (
                <p className="text-[11px] italic text-slate-600 font-medium mt-0.5">
                  "{settings.motto}"
                </p>
              )}

              <div className="text-[10px] sm:text-[11px] text-slate-600 mt-1.5 space-y-0.5 font-medium leading-normal">
                {settings.poBox && <span>{settings.poBox} • </span>}
                <span>{settings.address}</span>
                <div>
                  <span>Phone: {settings.phone}</span>
                  {settings.email && <span> • Email: {settings.email}</span>}
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200">
                <h2 className="text-xs sm:text-sm font-extrabold text-slate-950 uppercase tracking-wider">
                  {t.officialReceipt}
                </h2>
                <p className="text-[10px] text-slate-500 font-medium">
                  {t.receiptSubtitle || 'Official Student Fee Payment Statement & Clearance Slip'}
                </p>
              </div>
            </div>

            {/* Receipt MetaData Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 py-3 border-b border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] font-medium">{t.receiptNo}:</span>
                <span className="font-mono font-bold text-xs sm:text-sm text-slate-950">{payment.receiptNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-medium">{t.date}:</span>
                <span className="font-semibold text-slate-800 text-[11px] sm:text-xs">{payment.date}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-medium">{t.academicPeriod}:</span>
                <span className="font-semibold text-slate-800 text-[11px] sm:text-xs">{payment.academicYear}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-medium">{t.receivedFrom}:</span>
                <span className="font-bold text-slate-950 text-xs sm:text-sm">{payment.studentName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-medium">{t.colAdmissionNo}:</span>
                <span className="font-mono font-bold text-slate-850 text-xs">{payment.admissionNo}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-medium">{t.colClass}:</span>
                <span className="font-semibold text-slate-850 text-xs">{payment.className}</span>
              </div>
            </div>

            {/* Financial Breakdown Table */}
            <div className="py-3 space-y-2.5">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-300 text-slate-700 bg-slate-50">
                    <th className="text-left py-1.5 px-2 font-bold uppercase text-[10px] sm:text-xs">{t.feeBreakdown}</th>
                    <th className="text-right py-1.5 px-2 font-bold uppercase text-[10px] sm:text-xs">{t.paymentAmount} ({settings.currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 px-2 text-slate-800">
                      <span className="font-bold block text-slate-900 text-xs">{payment.installmentPeriod || 'Tuition Fee Installment'}</span>
                      <span className="text-[10px] sm:text-[11px] text-slate-500">
                        {t.transactionRefLabel}: <strong className="text-slate-700">{payment.referenceNumber}</strong> • {t.paymentMethodLabel}: <strong className="text-slate-700">{payment.method}</strong>
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-sm sm:text-base text-slate-950">
                      {formatCurrency(payment.amount, settings.currency)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 text-slate-600 text-xs">{t.prevBalance}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-600 text-xs">
                      {formatCurrency(payment.previousBalance, settings.currency)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 text-slate-600 text-xs">{t.amountPaidNow}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-emerald-700 font-bold text-xs">
                      - {formatCurrency(payment.amount, settings.currency)}
                    </td>
                  </tr>
                  <tr className="border-t-2 border-slate-900 bg-slate-100/90 font-bold">
                    <td className="py-2 px-2 text-slate-950 text-xs uppercase">{t.newBalance}</td>
                    <td className="py-2 px-2 text-right font-mono text-xs sm:text-sm font-black text-slate-950">
                      {formatCurrency(payment.remainingBalance, settings.currency)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Amount in Words (Mandatory) */}
              <div className="p-2 sm:p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">
                  {t.amountInWords}:
                </span>
                <span className="italic font-semibold text-slate-900 text-[11px] sm:text-xs">
                  {numberToWords(payment.amount, settings.currency)}
                </span>
              </div>

              {/* Remarks if provided */}
              {payment.notes && (
                <div className="text-xs text-slate-600 bg-slate-50/50 p-1.5 sm:p-2 rounded border border-slate-100">
                  <span className="font-bold text-slate-700 text-[11px]">{t.paymentNotes}: </span>
                  <span className="text-[11px]">{payment.notes}</span>
                </div>
              )}
            </div>

            {/* Receipt Footer */}
            <div className="pt-3 border-t-2 border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px] uppercase tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t.verifiedStamp}</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-600">
                  {t.cashierTeacher}: <span className="font-semibold text-slate-900">{payment.recordedByTeacher}</span>
                </p>
              </div>

              <div className="text-left sm:text-right text-[9px] sm:text-[10px] text-slate-500">
                <p className="font-semibold text-slate-700 uppercase">
                  {settings.schoolName} Fee Management System
                </p>
                <p className="font-mono text-slate-400">
                  Ref ID: {payment.id}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3 bg-slate-50 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {payment.remainingBalance === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{t.clearedStatus}</span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-bold">{t.outstandingStatus}</span>
            )}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer transition"
            >
              {t.close}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>{t.printReceiptBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
