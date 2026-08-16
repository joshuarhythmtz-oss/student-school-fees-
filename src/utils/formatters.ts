// Currency and number formatting utilities

export function formatCurrency(amount: number, currency: string = 'TZS'): string {
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount || 0);

  return `${currency} ${formatted}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

/**
 * Calculates days remaining until elimination deadline.
 * Returns negative if past deadline.
 */
export function getDaysUntilDeadline(deadlineString: string): number {
  if (!deadlineString) return 999;
  const deadline = new Date(deadlineString);
  const today = new Date();
  // reset time of both to start of day for clean day difference
  deadline.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffTime = deadline.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Checks if a student is pending elimination (has unpaid balance and within warning window, e.g. <= 10 days)
 */
export function isPendingElimination(
  student: { status: string; outstandingBalance: number; eliminationDeadline: string },
  warningDays: number = 10
): boolean {
  if (student.status !== 'active') return false;
  if (student.outstandingBalance <= 0) return false;
  if (!student.eliminationDeadline) return false;
  const days = getDaysUntilDeadline(student.eliminationDeadline);
  return days <= warningDays;
}

/**
 * Checks if a student is "Finishing Soon" (has paid almost all fees, only small balance remaining)
 */
export function isFinishingSoon(
  student: { status: string; outstandingBalance: number; totalFees: number; amountPaid: number },
  thresholdPercent: number = 15,
  thresholdAmount: number = 150000
): boolean {
  if (student.status !== 'active') return false;
  if (student.outstandingBalance <= 0) return false;
  const remainingPercent = (student.outstandingBalance / (student.totalFees || 1)) * 100;
  return remainingPercent <= thresholdPercent || student.outstandingBalance <= thresholdAmount;
}

/**
 * Generates an official receipt number like "REC-2026-0842"
 */
export function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `REC-${year}-${randomPart}`;
}

/**
 * Generates an admission number like "STD-2026-0045"
 */
export function generateAdmissionNumber(count: number): string {
  const year = new Date().getFullYear();
  const padded = String(count + 1).padStart(4, '0');
  return `STD-${year}-${padded}`;
}

/**
 * Converts numbers into English words for receipts (e.g. 400,000 -> Four Hundred Thousand TZS Only)
 */
export function numberToWords(num: number, currency: string = 'Tanzanian Shillings'): string {
  if (num === 0) return `Zero ${currency} Only`;

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + inWords(n % 100) : '');
    if (n < 1000000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
    if (n < 1000000000) return inWords(Math.floor(n / 1000000)) + ' Million' + (n % 1000000 !== 0 ? ' ' + inWords(n % 1000000) : '');
    return inWords(Math.floor(n / 1000000000)) + ' Billion' + (n % 1000000000 !== 0 ? ' ' + inWords(n % 1000000000) : '');
  }

  return `${inWords(Math.floor(num))} ${currency} Only`;
}
