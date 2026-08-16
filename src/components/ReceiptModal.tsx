import React from 'react';
import { X, Printer, Download, CheckCircle2, School, ShieldCheck } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden during print) */}
        <div className="p-3.5 bg-slate-900 dark:bg-[#090d16] text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold">{t.officialReceipt}</span>
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

        {/* Printable Receipt Paper Container */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white text-slate-850 print:p-0 print:m-0" id="printable-receipt">
          <div className="border-2 border-slate-900 rounded-xl p-6 sm:p-7 relative bg-gradient-to-b from-slate-50/40 to-white">
            {/* Watermark badge */}
            <div className="absolute right-6 top-6 opacity-10 pointer-events-none">
              <School className="w-36 h-36 text-slate-900" />
            </div>

            {/* School Header */}
            <div className="text-center border-b-2 border-slate-900 pb-4">
              <div className="flex items-center justify-center gap-2">
                <School className="w-7 h-7 text-emerald-800" />
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-950 uppercase">
                  {settings.schoolName}
                </h1>
              </div>
              <p className="text-xs italic text-slate-600 font-medium mt-0.5">{settings.motto}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                {settings.address} • {t.phone}: {settings.phone} • Email: {settings.email}
              </p>
              <div className="mt-2 inline-block px-4 py-1 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                {t.officialReceipt}
              </div>
            </div>

            {/* Receipt Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4 border-b border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">{t.receiptNo}:</span>
                <span className="font-mono font-bold text-sm text-slate-900">{payment.receiptNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">{t.date}:</span>
                <span className="font-semibold text-slate-800">{payment.date}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">{t.academicPeriod}:</span>
                <span className="font-semibold text-slate-800">{payment.academicYear}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">{t.receivedFrom}:</span>
                <span className="font-bold text-slate-950 text-sm">{payment.studentName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">{t.colAdmissionNo}:</span>
                <span className="font-mono font-bold text-slate-800">{payment.admissionNo}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">{t.colClass}:</span>
                <span className="font-semibold text-slate-800">{payment.className}</span>
              </div>
            </div>

            {/* Financial Ledger Section */}
            <div className="py-4 space-y-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-600">
                    <th className="text-left py-1.5 font-bold uppercase">{t.feeBreakdown}</th>
                    <th className="text-right py-1.5 font-bold uppercase">{t.paymentAmount} ({settings.currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 text-slate-700">
                      <span className="font-semibold block">{payment.installmentPeriod || 'Term Fee Installment'}</span>
                      <span className="text-[11px] text-slate-500">
                        {t.transactionRefLabel}: {payment.referenceNumber} • {t.paymentMethodLabel}: {payment.method}
                      </span>
                    </td>
                    <td className="py-2 text-right font-mono font-bold text-base text-slate-950">
                      {formatCurrency(payment.amount, settings.currency)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-slate-500">{t.prevBalance}</td>
                    <td className="py-1.5 text-right font-mono text-slate-600">
                      {formatCurrency(payment.previousBalance, settings.currency)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-slate-500">{t.amountPaidNow}</td>
                    <td className="py-1.5 text-right font-mono text-emerald-700 font-semibold">
                      - {formatCurrency(payment.amount, settings.currency)}
                    </td>
                  </tr>
                  <tr className="border-t-2 border-slate-900 bg-slate-50/80 font-bold">
                    <td className="py-2 text-slate-900 text-xs uppercase">{t.newBalance}</td>
                    <td className="py-2 text-right font-mono text-sm text-slate-950">
                      {formatCurrency(payment.remainingBalance, settings.currency)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Amount in Words */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  {t.amountInWords}:
                </span>
                <span className="italic font-semibold text-slate-800">
                  {numberToWords(payment.amount)} {settings.currency === 'TZS' ? 'Tanzanian Shillings' : settings.currency} Only.
                </span>
              </div>

              {/* Remarks if any */}
              {payment.notes && (
                <div className="text-xs text-slate-600">
                  <span className="font-semibold">{t.paymentNotes}:</span> {payment.notes}
                </div>
              )}
            </div>

            {/* Footer / Signatures & Stamp */}
            <div className="pt-6 border-t-2 border-slate-900 flex justify-between items-end text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.verifiedStamp}</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  {t.cashierTeacher}: <span className="font-semibold text-slate-700">{payment.recordedByTeacher}</span>
                </p>
                <p className="text-[9px] text-slate-400">
                  {settings.schoolName} Fee Management System • Ref: {payment.id}
                </p>
              </div>

              <div className="text-right">
                <div className="w-40 border-b border-slate-800 pb-8 text-center">
                  <span className="text-[10px] text-slate-400 italic">Official Signature / Stamp</span>
                </div>
                <div className="text-[10px] font-bold text-slate-700 mt-1 uppercase">Bursar Office</div>
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
