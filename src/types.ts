export interface IncomeSource {
  id: string;
  sourceName: string; // e.g., Salary, Pension, Chitti Return, Business, Side Work, or custom
  amount: number;
  type: 'Fixed' | 'Variable';
  arrivalDate: number; // Day of the month (e.g., 1 to 31)
  arrived: boolean; // MVP specific marker for tracking
}

export interface FixedCommitment {
  id: string;
  name: string;
  amount: number;
  paid: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string; // YYYY-MM-DD
  savedAmount: number;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: 'Need' | 'Want' | 'Saving';
  note?: string;
  date: string; // YYYY-MM-DD
  isFixedCommitment?: boolean; // slight grey styling, Fixed marker
}

export interface CustomCategory {
  id: string;
  name: string;
  type: 'Need' | 'Want' | 'Saving';
  monthlyBudgetLimit: number;
}

export interface ScratchpadNote {
  content: string;
  timestamp: string; // Date-time stamp
}

export interface ScratchpadArchive {
  id: string;
  content: string;
  date: string; // YYYY-MM-DD
}

export interface IOTrackerEntry {
  id: string;
  type: 'give' | 'receive'; // give = gave money (pending return), receive = received back
  personName: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Completed';
}

export interface PastMonthSummary {
  monthKey: string; // YYYY-MM
  totalIncome: number;
  totalSpent: number; // Needs + Wants, NOT savings
  totalSaved: number;
  categoryBreakdown: Record<string, number>;
  specialMonthTag?: string;
}

export interface SpecialMonthTag {
  monthKey: string; // YYYY-MM
  reason: 'Festival' | 'Medical' | 'School' | 'Wedding' | 'Emergency' | 'Other';
}

export interface UserAuth {
  name: string;
  email: string;
  loggedIn: boolean;
}

export interface BudgetyProfile {
  onboarded: boolean;
  name: string;
  email: string;
  familySize: number;
  incomeSources: IncomeSource[];
  fixedCommitments: FixedCommitment[];
  biggestFinancialIssue: string;
  dailyNotesEnabled: boolean;
  alertsEnabled: boolean;
  trackNoteShortcutAdded?: boolean;
  telegramNotificationsEnabled?: boolean;
  phoneNumber?: string;
  telegramChatId?: string;
}

export interface MonthlyBill {
  id: string;
  name: string;
  amount: number;
  monthKey: string; // YYYY-MM
  status: 'Paid' | 'Pending';
  category?: string;
}
