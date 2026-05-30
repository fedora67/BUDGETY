import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  Title 
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { 
  Calendar, 
  Zap, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  HelpCircle, 
  IndianRupee, 
  ArrowRight,
  X,
  Users,
  ShieldCheck,
  RefreshCw,
  Plus,
  UserCheck,
  Trash2,
  FileText
} from 'lucide-react';
import { 
  getProfile, 
  getExpenses, 
  getGoals, 
  getIOTracker, 
  setIOTracker, 
  getMonthHistory, 
  getSpecialMonths, 
  setSpecialMonths, 
  DEFAULT_CATEGORIES, 
  getCategories,
  setExpenses
} from '../storage';
import { Expense, IOTrackerEntry, SavingsGoal, SpecialMonthTag, PastMonthSummary } from '../types';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  Title
);

interface DashboardViewProps {
  onNavigate: (route: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  showSeedBanner: boolean;
  setShowSeedBanner: (show: boolean) => void;
}

export default function DashboardView({ 
  onNavigate, 
  selectedMonth, 
  setSelectedMonth, 
  showSeedBanner, 
  setShowSeedBanner 
}: DashboardViewProps) {
  
  // Storage states
  const [profile, setProfileState] = useState(getProfile());
  const [expenses, setExpensesState] = useState<Expense[]>([]);
  const [goals, setGoalsState] = useState<SavingsGoal[]>([]);
  const [ioTracker, setIoTrackerState] = useState<IOTrackerEntry[]>([]);
  const [history, setHistoryState] = useState<PastMonthSummary[]>([]);
  const [specialMonths, setSpecialMonthsState] = useState<SpecialMonthTag[]>([]);
  
  // Interaction states
  const [showSpecialModal, setShowSpecialModal] = useState(false);
  const [selectedSpecialReason, setSelectedSpecialReason] = useState<'Festival' | 'Medical' | 'School' | 'Wedding' | 'Emergency' | 'Other'>('Festival');
  const [pendingIncomeBannerDismissed, setPendingIncomeBannerDismissed] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showSpentModal, setShowSpentModal] = useState(false);
  
  // IO Tracker inline entry
  const [newIOName, setNewIOName] = useState('');
  const [newIOAmount, setNewIOAmount] = useState<number>(500);
  const [newIOType, setNewIOType] = useState<'give' | 'receive'>('give');

  // Trigger load on render
  useEffect(() => {
    setProfileState(getProfile());
    setExpensesState(getExpenses());
    setGoalsState(getGoals());
    setIoTrackerState(getIOTracker());
    setHistoryState(getMonthHistory());
    setSpecialMonthsState(getSpecialMonths());
  }, [selectedMonth]);

  // Current selected month characteristics
  const selectedYearMonth = selectedMonth; // "2026-05" format

  // Filter expenses for current month
  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(selectedYearMonth));

  // Determine if selected month is Special
  const activeSpecialTag = specialMonths.find(sm => sm.monthKey === selectedYearMonth);

  // Progressive tracking day calculation for visual guidance (Day X of Month 1)
  const isMonth1 = history.length === 0 || (history.length === 1 && history[0].monthKey === selectedYearMonth);
  const today = new Date();
  const currentDayOfMonth = today.getDate();

  // Math totals calculation
  // Total Income = sum of all income sources for this month + Completed IO received back
  const totalBaseIncome = profile?.incomeSources.reduce((sum, s) => sum + s.amount, 0) || 0;
  
  // Sum received back IOs this month (completed "receive" or returned items that act as inflow)
  const completedReceiveIOAmount = ioTracker
    .filter(i => i.type === 'receive' && i.date.startsWith(selectedYearMonth))
    .reduce((sum, i) => sum + i.amount, 0);

  const totalIncome = totalBaseIncome + completedReceiveIOAmount;

  // Spent: Needs + Wants only (NOT savings as savings is paying future self)
  const spentNeeds = currentMonthExpenses
    .filter(e => e.type === 'Need')
    .reduce((sum, e) => sum + e.amount, 0);

  const spentWants = currentMonthExpenses
    .filter(e => e.type === 'Want')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalSpent = spentNeeds + spentWants;

  // Saved This Month
  const totalSaved = currentMonthExpenses
    .filter(e => e.type === 'Saving')
    .reduce((sum, e) => sum + e.amount, 0);

  // Remaining Balance = Income - Spent - Saved
  const remainingBalance = totalIncome - totalSpent - totalSaved;

  // Pending income calculation (based on current date and income sources expectation)
  const pendingIncomes = profile?.incomeSources.filter(src => {
    // If the expected date is in future, or if not arrived yet in simple marker context
    return src.arrivalDate > currentDayOfMonth;
  }) || [];

  // Per person calculation
  const familySize = profile?.familySize || 1;
  const perPersonSpending = totalSpent / familySize;

  // Custom Categories list
  const categoriesList = getCategories();

  // 1. PIE CHART CARD (Needs vs Wants vs Savings)
  const pieData = {
    labels: ['Needs (Essential)', 'Wants (Discretionary)', 'Savings (Future Self)'],
    datasets: [
      {
        data: [
          totalSpent === 0 && totalSaved === 0 ? 1 : spentNeeds, 
          spentWants, 
          totalSaved
        ],
        backgroundColor: [
          'rgba(23, 23, 23, 0.9)',    // Needs (Deep rich Charcoal black)
          'rgba(239, 68, 68, 0.85)',   // Wants (Red overspending)
          'rgba(16, 185, 129, 0.9)'    // Savings (Emerald green)
        ],
        borderColor: ['#fff', '#fff', '#fff'],
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const val = context.raw;
            const sum = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = sum > 0 ? Math.round((val / sum) * 100) : 0;
            return `₹${val.toLocaleString('en-IN')} (${percentage}%)`;
          }
        }
      }
    },
  };

  // 2. BAR CHART CARD (Monthly Comparison)
  // Check history to retrieve last month metrics or generate default for showcase if empty
  const lastMonthHistory = history.length > 0 ? history[history.length - 1] : {
    monthKey: 'Previous Month',
    totalIncome: 25000,
    totalSpent: 18000,
    totalSaved: 3000
  };

  const barData = {
    labels: [lastMonthHistory.monthKey, 'This Month'],
    datasets: [
      {
        label: 'Total Spending (₹)',
        data: [lastMonthHistory.totalSpent, totalSpent],
        backgroundColor: 'rgba(239, 68, 68, 0.85)',
        borderRadius: 8,
      },
      {
        label: 'Total Saved (₹)',
        data: [lastMonthHistory.totalSaved, totalSaved],
        backgroundColor: 'rgba(16, 185, 129, 0.9)',
        borderRadius: 8,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          font: { family: 'Poppins', size: 11 }
        }
      }
    },
    scales: {
      y: {
        ticks: { font: { family: 'JetBrains Mono', size: 10 } }
      },
      x: {
        ticks: { font: { family: 'Poppins', size: 11 } }
      }
    }
  };

  // 3. LINE CHART CARD (Savings progress compared to general baseline path)
  const lineData = {
    labels: ['15 Days Ago', '10 Days Ago', '5 Days Ago', 'Today'],
    datasets: [
      {
        label: 'My Saved Balance Progression (₹)',
        data: [
          Math.max(0, totalSaved * 0.25), 
          Math.max(0, totalSaved * 0.5), 
          Math.max(0, totalSaved * 0.75), 
          totalSaved
        ],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.35,
        fill: true,
        borderWidth: 3,
        pointRadius: 4,
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        ticks: { font: { family: 'JetBrains Mono', size: 10 } }
      },
      x: {
        ticks: { font: { family: 'Poppins', size: 10 } }
      }
    }
  };

  // Budget Health status triggers
  // Green: On track (< 70% of income spent on Needs+Wants)
  // Yellow: Nearing limit (70% - 90% spent)
  // Red: Overspent (> 90%)
  const spentRatio = totalIncome > 0 ? (totalSpent / totalIncome) : 0;
  let budgetHealth: 'Green' | 'Yellow' | 'Red' = 'Green';
  let budgetHealthLabel = 'On Track';
  let budgetHealthDesc = 'Your habits are healthy. Positive cashflow maintained.';

  if (spentRatio > 0.9) {
    budgetHealth = 'Red';
    budgetHealthLabel = 'Overspending Warning';
    budgetHealthDesc = 'You have spent more than 90% of your income on needs and wants.';
  } else if (spentRatio > 0.7) {
    budgetHealth = 'Yellow';
    budgetHealthLabel = 'Watch Your Spending';
    budgetHealthDesc = 'Spending is close to exceeding your comfort buffer. Take caution.';
  }

  // Override budget warning if Tagged special month (e.g. Festival/Wedding)
  if (activeSpecialTag) {
    budgetHealth = 'Yellow';
    budgetHealthLabel = `Special Month: ${activeSpecialTag.reason}`;
    budgetHealthDesc = `Budget alerts are relaxed. Enjoy your family ${activeSpecialTag.reason.toLowerCase()}!`;
  }

  // Savings required monthly terms calculations mapped
  const getGoalStatus = (goal: SavingsGoal) => {
    const todayStr = today.toISOString().split('T')[0];
    const targetDate = new Date(goal.targetDate);
    const monthsLeft = (targetDate.getFullYear() - today.getFullYear()) * 12 + (targetDate.getMonth() - today.getMonth());
    const validMonths = monthsLeft <= 0 ? 1 : monthsLeft;
    
    // Monthly rate
    const monthlyRate = Math.round((goal.targetAmount - goal.savedAmount) / validMonths);
    const percentDone = Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100);

    return {
      monthlyRate,
      percentDone,
      monthsLeft: validMonths
    };
  };

  // Suggestions generation block in human-natural language
  const triggerSuggestions = (): string[] => {
    const list: string[] = [];
    const obstacle = profile?.biggestFinancialIssue || "I never track where money goes";

    // 1. Handle Onboarding issue tips
    if (obstacle === 'I spend too much on wants') {
      list.push("💡 You mentioned having trouble with 'wants' spending. We recommend review of 'Tea & Snacks' and 'Clothes & Shopping' sub-limits closely.");
    } else if (obstacle === 'I have no savings at all') {
      list.push("💡 Start small: Moving even ₹150 this week out of snacks into a goal prepares you for larger milestones.");
    } else if (obstacle === 'My income is irregular') {
      list.push("💡 Since your income varies, aim to save slightly more during 'Salary' or 'Chitti' peak months to buffer off-seasons.");
    }

    // 2. Core spent rules
    if (spentWants > spentNeeds) {
      list.push("⚠️ Currently, your discretionary 'wants' spending exceeds essentials. Try shifting some upcoming weekend budgets to savings.");
    }

    // 3. Low goals alert
    if (goals.length > 0 && totalSaved < (goals[0].targetAmount / 12)) {
      list.push(`📈 Moving ₹${(goals[0].targetAmount / 12).toFixed(0)} to ${goals[0].name} this month ensures you hit your deadline.`);
    }

    // 4. Special month tag check
    if (activeSpecialTag) {
      list.push(`✨ Nice preparation! Your ${activeSpecialTag.reason} tag is active, preventing redundant overspending alerts during festivals.`);
    } else {
      list.push("⚡ Have a festival, emergency, or family wedding this month? Mark it as 'Special Month' to pause warnings.");
    }

    // Fallback if empty
    if (list.length === 0) {
      list.push("🌟 You are managing your Indian family budget perfectly! Negative triggers are zero.");
    }

    return list;
  };

  // Alerts block
  const triggerAlerts = (): string[] => {
    const list: string[] = [];
    
  // Alert: Overspending on any custom categories compared to budget limits
    categoriesList.forEach(cat => {
      const catSpent = currentMonthExpenses
        .filter(e => e.category === cat.name)
        .reduce((sum, e) => sum + e.amount, 0);

      if (catSpent > cat.monthlyBudgetLimit && cat.monthlyBudgetLimit > 0) {
        list.push(`🚨 Overspent on ${cat.name}! Spent ₹${catSpent.toLocaleString('en-IN')} of your ₹${cat.monthlyBudgetLimit.toLocaleString('en-IN')} limit.`);
      } else if (catSpent > (cat.monthlyBudgetLimit * 0.85) && cat.monthlyBudgetLimit > 0) {
        list.push(`⚠️ Nearing limit on ${cat.name}! Used 85% of standard ₹${cat.monthlyBudgetLimit.toLocaleString('en-IN')} allocation.`);
      }
    });

    if (remainingBalance < 0) {
      list.push(`🚨 Negative Balance Alert! Your expenditure exceeds your current verified income by ₹${Math.abs(remainingBalance).toLocaleString('en-IN')}.`);
    }

    return list;
  };

  // Toggle Special Month tagging API
  const handleToggleSpecialMonth = () => {
    if (activeSpecialTag) {
      // Remove it
      const updated = specialMonths.filter(sm => sm.monthKey !== selectedYearMonth);
      setSpecialMonths(updated);
      setSpecialMonthsState(updated);
    } else {
      setShowSpecialModal(true);
    }
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const handleSaveSpecialTag = () => {
    const updated = [
      ...specialMonths,
      { monthKey: selectedYearMonth, reason: selectedSpecialReason }
    ];
    setSpecialMonths(updated);
    setSpecialMonthsState(updated);
    setShowSpecialModal(false);
  };

  // I/O money handler
  const handleAddIO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIOName.trim() || !newIOAmount) return;

    const newEntry: IOTrackerEntry = {
      id: 'io-' + Date.now(),
      type: newIOType,
      personName: newIOName,
      amount: newIOAmount,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };

    const updated = [newEntry, ...ioTracker];
    setIOTracker(updated);
    setIoTrackerState(updated);
    setNewIOName('');
  };

  const handleToggleIOStatus = (id: string) => {
    const updated = ioTracker.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: item.status === 'Pending' ? 'Completed' : 'Pending' as 'Pending' | 'Completed'
        };
      }
      return item;
    });
    setIOTracker(updated);
    setIoTrackerState(updated);
  };

  const handleRemoveIO = (id: string) => {
    const updated = ioTracker.filter(item => item.id !== id);
    setIOTracker(updated);
    setIoTrackerState(updated);
  };

  // Clear seed sample data manual click trigger
  const handleClearDemoAndRefresh = () => {
    const expensesFiltered = expenses.filter(e => !e.id.startsWith('seed-'));
    setExpenses(expensesFiltered);
    setExpensesState(expensesFiltered);
    
    // Clear custom history and local items
    localStorage.removeItem('budgety_sample_data_v2');
    setShowSeedBanner(false);
  };

  const dashboardSuggestions = triggerSuggestions();
  const dashboardAlerts = triggerAlerts();

  // Auto-send alerts to Telegram
  /*
  useEffect(() => {
    if (dashboardAlerts.length > 0 && profile?.telegramChatId) {
      dashboardAlerts.forEach(alertText => {
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId: profile.telegramChatId, message: alertText })
        }).catch(err => console.error("Failed to send telegram alert", err));
      });
    }
  }, [dashboardAlerts, profile?.telegramChatId]);
  */

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans">
      
      {/* Alert Seed Banner */}
      {showSeedBanner && (
        <div className="bg-neutral-900 text-white rounded-2xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
          <div>
            <span className="font-bold text-xs bg-emerald-500 text-neutral-900 px-2 py-0.5 rounded uppercase tracking-wider mr-2 font-sans inline-block mb-1 sm:mb-0">Demo Active</span>
            <span className="text-xs text-neutral-300 font-sans font-light">We pre-populated 7 days of realistic sample expenses so this dashboard highlights metric charts right away. Clear it from Settings or click:</span>
          </div>
          <button
            onClick={handleClearDemoAndRefresh}
            className="text-[11px] font-bold bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700/80 px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer"
          >
            Clear Sample Data
          </button>
        </div>
      )}

      {/* TOP HEADER CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-8 bg-white border border-neutral-200/80 p-5 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Monthly Performance</h2>
          <p className="text-neutral-500 text-xs mt-0.5 font-light">
            {isMonth1 ? (
              <span className="inline-flex items-center gap-1 text-neutral-600 bg-neutral-100 px-2.5 py-0.5 rounded-lg font-medium">
                📈 Progressive Day Tracker: You are on Day {currentDayOfMonth} of Month 1
              </span>
            ) : "Consolidated monthly breakdown of cashflows."}
          </p>
        </div>

        {/* Controls Block */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Month selective dropdown */}
          <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold text-neutral-800 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option value="2026-05">May 2026 (Current)</option>
              <option value="2026-04">April 2026</option>
              <option value="2026-03">March 2026</option>
            </select>
          </div>

          {/* Mark as Special button */}
          <button
            onClick={handleToggleSpecialMonth}
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer ${activeSpecialTag ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-neutral-900 text-white hover:bg-neutral-800'}`}
          >
            <Zap className={`w-3.5 h-3.5 ${activeSpecialTag ? 'fill-amber-600 stroke-amber-900' : ''}`} />
            {activeSpecialTag ? `Tagged: ${activeSpecialTag.reason}` : "⚡ Mark as Special Month"}
          </button>
          
          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-3 py-2 rounded-xl transition-all cursor-pointer border border-neutral-200 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            Export PDF
          </button>
        </div>
      </div>

      {/* DISMISSIBLE PENDING INCOME BANNER */}
      {!pendingIncomeBannerDismissed && pendingIncomes.length > 0 && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200/50 p-4.5 mb-6 flex justify-between items-start gap-3">
          <div className="flex gap-3 text-xs text-amber-900 leading-relaxed font-sans">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Expected Income Pending Arrival:</span>
              <ul className="list-disc pl-4 space-y-0.5">
                {pendingIncomes.map(src => (
                  <li key={src.id}>
                    <strong>{src.sourceName}</strong> of <strong>₹{src.amount.toLocaleString('en-IN')}</strong> expected around the {src.arrivalDate}th.
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button
            onClick={() => setPendingIncomeBannerDismissed(true)}
            className="text-neutral-400 hover:text-neutral-900 p-0.5 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CORE FOUR STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Income */}
        <button 
          onClick={() => setShowIncomeModal(true)}
          className="bg-white border border-neutral-200/80 hover:border-neutral-450 hover:shadow-xs rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all text-left w-full h-full group"
        >
          <div className="w-full flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400 font-sans">Total Income</span>
            <span className="text-[9px] text-neutral-350 font-mono group-hover:text-neutral-500 transition-colors">Details →</span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-neutral-900 tracking-tight font-number">₹{totalIncome.toLocaleString('en-IN')}</h3>
          </div>
        </button>
 
        {/* Spent */}
        <button 
          onClick={() => setShowSpentModal(true)}
          className="bg-white border border-neutral-200/80 hover:border-neutral-450 hover:shadow-xs rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all text-left w-full h-full group"
        >
          <div className="w-full flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400 font-sans">Total Spent</span>
            <span className="text-[9px] text-neutral-350 font-mono group-hover:text-neutral-500 transition-colors">Details →</span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-rose-600 tracking-tight font-number">₹{totalSpent.toLocaleString('en-IN')}</h3>
          </div>
        </button>
 
        {/* Saved */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400 font-sans">Saved This Month</span>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-emerald-600 tracking-tight font-number">₹{totalSaved.toLocaleString('en-IN')}</h3>
          </div>
        </div>
 
        {/* Remaining */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400 font-sans">Remaining Balance</span>
          <div className="mt-3">
            <h3 className={`text-2xl font-black tracking-tight font-number ${remainingBalance >= 0 ? 'text-neutral-900' : 'text-rose-600 font-bold'}`}>
              ₹{remainingBalance.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>
 
      </div>

      {/* MIDDLE SECTION: DATA VISUALIZATIONS AND BUDGET HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Chart doughnut panel */}
        <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-xs lg:col-span-1 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-neutral-800 tracking-tight mb-1">Needs vs Wants vs Savings</h4>
            <span className="text-[10px] text-neutral-400 block mb-4">Recommended ideal: 50% Needs, 30% Wants, 20% Savings</span>
          </div>
          
          <div className="relative h-48 flex items-center justify-center">
            <Pie data={pieData} options={pieOptions} />
          </div>

          <div className="space-y-2.5 mt-5">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5 text-neutral-600 font-medium font-sans">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 inline-block" />
                Needs
              </span>
              <span className="font-semibold text-neutral-800 font-number">₹{spentNeeds.toLocaleString('en-IN')} ({totalIncome > 0 ? Math.round((spentNeeds / totalIncome) * 100) : 0}%)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5 text-neutral-600 font-medium font-sans">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                Wants
              </span>
              <span className="font-semibold text-neutral-800 font-number font-number">₹{spentWants.toLocaleString('en-IN')} ({totalIncome > 0 ? Math.round((spentWants / totalIncome) * 100) : 0}%)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5 text-neutral-600 font-medium font-sans">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Savings
              </span>
              <span className="font-semibold text-neutral-800 font-number font-number">₹{totalSaved.toLocaleString('en-IN')} ({totalIncome > 0 ? Math.round((totalSaved / totalIncome) * 100) : 0}%)</span>
            </div>
          </div>
        </div>

        {/* Budget Health and Progress Gauges */}
        <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-neutral-800 tracking-tight mb-4">Budget Limits & Category Performance</h4>
            
            {/* Health Meter strip */}
            <div className={`p-4 rounded-xl border flex gap-3 mb-6 items-start leading-relaxed text-xs ${budgetHealth === 'Red' ? 'bg-red-50 text-red-950 border-red-200' : budgetHealth === 'Yellow' ? 'bg-amber-50 text-amber-950 border-amber-200' : 'bg-emerald-50 text-emerald-950 border-emerald-200'}`}>
              <span className="text-lg leading-none shrink-0 mt-0.5">
                {budgetHealth === 'Red' ? '🛑' : budgetHealth === 'Yellow' ? '⚠️' : '🟢'}
              </span>
              <div>
                <span className="font-bold block mb-0.5">{budgetHealthLabel}</span>
                <p className="opacity-90">{budgetHealthDesc}</p>
              </div>
            </div>

            {/* Progress Bars per major category */}
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
              {categoriesList.map(cat => {
                const catSpent = currentMonthExpenses
                  .filter(e => e.category === cat.name)
                  .reduce((sum, e) => sum + e.amount, 0);

                const limit = cat.monthlyBudgetLimit;
                const ratio = limit > 0 ? (catSpent / limit) : 0;
                const ratioPercent = Math.min(Math.round(ratio * 100), 100);

                return (
                  <div key={cat.id} className="space-y-1 font-sans">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-neutral-800 font-sans text-xs">{cat.name}</span>
                        <span className="text-[9px] bg-neutral-100 text-neutral-500 px-1 py-0.5 rounded ml-1.5 uppercase tracking-wider font-bold">{cat.type}</span>
                      </div>
                      <span className="text-neutral-500 font-light font-number">
                        ₹{catSpent.toLocaleString('en-IN')} <span className="opacity-60 font-light">/ ₹{limit > 0 ? limit.toLocaleString('en-IN') : 'None'}</span>
                      </span>
                    </div>
                    {limit > 0 ? (
                      <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${ratio > 0.95 ? 'bg-rose-600' : ratio > 0.8 ? 'bg-amber-500' : 'bg-neutral-900'}`}
                          style={{ width: `${ratioPercent}%` }}
                        />
                      </div>
                    ) : (
                      <p className="text-[9px] text-neutral-400 font-light italic">No monthly limit set</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            {/* Per Person Divisor */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-600">
                <Users className="w-5 h-5" />
              </div>
              <div className="font-sans text-xs">
                <span className="font-bold text-neutral-800 block">Family Breakdown Rate</span>
                <span className="text-neutral-500 font-light block">
                  Your family of <strong>{familySize}</strong> spends <strong className="text-neutral-800 font-number">₹{Math.round(perPersonSpending).toLocaleString('en-IN')}</strong> per person.
                </span>
              </div>
            </div>
            
            <button
              onClick={() => onNavigate('expenses')}
              className="text-neutral-900 hover:opacity-85 font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer border-b border-neutral-900"
            >
              Add Expense Logs
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* LOWER SECTION: BAR COMPARISONS & SYSTEM SUGGESTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Comparisons Bar chart */}
        <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-xs lg:col-span-1 h-[290px] flex flex-col justify-between">
          <h4 className="text-sm font-bold text-neutral-800 tracking-tight">Month comparison breakdown</h4>
          <div className="h-44 mt-4">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Dynamic tips and predictions */}
        <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-xs lg:col-span-1 max-h-[290px] flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-neutral-800 tracking-tight mb-2">Household Suggestions</h4>
            <span className="text-[10px] text-neutral-400 block mb-4">Calculated from family patterns & onboarding answers</span>
          </div>

          <div className="space-y-3 flex-grow overflow-y-auto pr-1">
            {dashboardSuggestions.map((sug, i) => (
              <p key={i} className="text-xs text-neutral-700 leading-relaxed font-sans font-light bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/30">
                {sug}
              </p>
            ))}
          </div>
        </div>

        {/* Real-time warnings tracker */}
        <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-xs lg:col-span-1 max-h-[290px] flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-neutral-800 tracking-tight mb-3">Live Risk Alerts</h4>
          </div>

          <div className="space-y-3 flex-grow overflow-y-auto pr-1">
            {dashboardAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center text-xs font-sans text-neutral-400 h-full">
                <p className="text-xl mb-1.5">🚀</p>
                <span>Zero financial risks detected! Keep tracking daily.</span>
              </div>
            ) : (
              dashboardAlerts.map((alt, i) => (
                <div key={i} className="bg-rose-50 text-rose-900 p-2.5 rounded-xl text-xs border border-rose-150 flex gap-2 items-start leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{alt}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* FOOTER SPLIT: SAVINGS AND MEMORY I/O TRACKER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Savings progress panel */}
        <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-neutral-800 tracking-tight mb-4">Savings Targets Progression</h4>
            
            <div className="space-y-4 max-h-[210px] overflow-y-auto pr-1 font-sans">
              {goals.length === 0 ? (
                <p className="text-xs text-neutral-400 italic font-sans pt-4 text-center">No active targets. Go to Settings or click Re-add goals.</p>
              ) : (
                goals.map(g => {
                  const stats = getGoalStatus(g);
                  return (
                    <div key={g.id} className="border border-neutral-100 p-3.5 rounded-xl bg-neutral-50/50">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-bold text-neutral-800">{g.name}</span>
                        <span className="text-neutral-500 font-light font-mono text-[10px]">By {g.targetDate}</span>
                      </div>
                      
                      <div className="w-full h-1.5 bg-neutral-200/60 rounded-full overflow-hidden my-2">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${stats.percentDone}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-neutral-500 my-1 font-mono">
                        <span>₹{g.savedAmount.toLocaleString('en-IN')} / ₹{g.targetAmount.toLocaleString('en-IN')}</span>
                        <span className="font-semibold text-emerald-700">{stats.percentDone}% Saved</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        👉 Save <strong>₹{stats.monthlyRate.toLocaleString('en-IN')} / month</strong> for the next {stats.monthsLeft} months to meet deadline.
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* I/O Memory tracker block */}
        <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-neutral-800 tracking-tight mb-1">Hand-to-Hand IO Tracker</h4>
            <span className="text-[10px] text-neutral-400 block mb-4">Track mutual small loans given or received back from relatives/friends</span>
            
            {/* IO Quick Form */}
            <form onSubmit={handleAddIO} className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 flex flex-wrap gap-2 items-center mb-4">
              <input
                type="text"
                placeholder="Ramesh, Sunil, etc."
                value={newIOName}
                onChange={(e) => setNewIOName(e.target.value)}
                className="flex-1 min-w-[120px] rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs focus:outline-none placeholder:text-neutral-300"
              />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={newIOAmount === 0 ? '' : newIOAmount}
                onChange={(e) => {
                  const clean = e.target.value.replace(/[^0-9]/g, '');
                  setNewIOAmount(clean === '' ? 0 : parseInt(clean, 10));
                }}
                className="w-16 rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs focus:outline-none font-number font-bold text-neutral-800"
              />
              <select
                value={newIOType}
                onChange={(e) => setNewIOType(e.target.value as 'give' | 'receive')}
                className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs focus:outline-none"
              >
                <option value="give">I Gave</option>
                <option value="receive">I Borrowed</option>
              </select>
              <button
                type="submit"
                className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg p-1.5 text-xs transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* List of outstanding IO */}
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {ioTracker.length === 0 ? (
                <p className="text-[10px] text-neutral-400 italic text-center py-4 font-light">No active IO loans written down.</p>
              ) : (
                ioTracker.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200/50">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-extrabold ${item.type === 'give' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                        {item.type === 'give' ? 'Lent Out' : 'Borrowed'}
                      </span>
                      <span className="text-xs font-semibold text-neutral-800">{item.personName}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold font-number">₹{item.amount.toLocaleString('en-IN')}</span>
                      
                      <button
                        onClick={() => handleToggleIOStatus(item.id)}
                        className={`text-[9px] px-2 py-0.5 rounded font-black cursor-pointer transition-colors ${item.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'}`}
                      >
                        {item.status === 'Completed' ? 'Returned' : 'Pending'}
                      </button>

                      <button
                        onClick={() => handleRemoveIO(item.id)}
                        className="text-neutral-400 hover:text-rose-600 p-0.5 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* SPECIAL MONTH BACKDROP SELECTOR MODAL */}
      <AnimatePresence>
        {showSpecialModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-40">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-neutral-300 rounded-2xl max-w-sm w-full p-6 shadow-xl"
            >
              <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-2">⚡ Tag as Special Month?</h3>
              <p className="text-neutral-500 text-xs leading-relaxed font-light mb-4">
                This indicates a major family life event occurs this month (e.g., weddings, school opening). We will completely suspend warnings for overspending alert items.
              </p>

              <div className="space-y-4 font-sans">
                <div>
                  <label className="block text-[10px] text-neutral-500 uppercase tracking-widest font-mono mb-2">Choose Reason:</label>
                  <select
                    value={selectedSpecialReason}
                    onChange={(e) => setSelectedSpecialReason(e.target.value as any)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none"
                  >
                    <option value="Festival">🎉 Festival / Diwali / Onam</option>
                    <option value="Medical">🏥 Medical Treatment / Hospital</option>
                    <option value="School">🎒 School Reopening / Admission Fees</option>
                    <option value="Wedding">💍 Family Wedding / Function</option>
                    <option value="Emergency">🚨 Unexpected Emergency</option>
                    <option value="Other">⚙️ Other Special Incurment</option>
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => setShowSpecialModal(false)}
                    className="text-neutral-500 hover:bg-neutral-100 px-3.5 py-2 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSpecialTag}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 text-xs font-semibold rounded-xl"
                  >
                    Activate Tag
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INCOME DRILL-DOWN OVERLAY SCREEN */}
      <AnimatePresence>
        {showIncomeModal && (
          <div className="fixed inset-0 bg-neutral-950/70 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-neutral-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative font-sans flex flex-col max-h-[90vh]"
            >
              <button
                onClick={() => setShowIncomeModal(false)}
                className="absolute top-4.5 right-4.5 text-neutral-400 hover:text-neutral-800 rounded-lg p-1.5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-neutral-100 font-sans text-left">
                <div className="p-1.5 bg-neutral-100 rounded-lg">
                  <IndianRupee className="w-5 h-5 text-neutral-800 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-neutral-900 tracking-tight uppercase">Income Sources Breakdown</h3>
                  <span className="text-[10px] text-neutral-400 font-light block">Listing salary and settled cash returns for {selectedMonth}</span>
                </div>
              </div>

              {/* Total Card */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 mb-5 text-center">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-neutral-400 font-sans">Aggregated Incoming Cash</span>
                <h4 className="text-2xl font-black text-neutral-900 font-number mt-0.5">₹{totalIncome.toLocaleString('en-IN')}</h4>
              </div>

              <div className="space-y-4 overflow-y-auto flex-1 pr-1 text-left font-sans">
                
                {/* 1. Base Income Sources */}
                <div>
                  <span className="block text-[9px] font-extrabold text-neutral-400 uppercase tracking-widest mb-2 font-mono">Monthly Base Salaries</span>
                  <div className="space-y-2">
                    {profile?.incomeSources && profile.incomeSources.length > 0 ? (
                      profile.incomeSources.map((src, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white border border-neutral-150 p-3 rounded-xl shadow-2xs">
                          <div>
                            <span className="text-xs font-bold text-neutral-900 block">{src.sourceName}</span>
                            <span className="text-[9px] text-neutral-400 font-mono font-light">Expected: Day {src.arrivalDate}th</span>
                          </div>
                          <span className="text-xs font-bold text-neutral-900 font-number">₹{src.amount.toLocaleString('en-IN')}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-neutral-405 italic pl-1">No monthly sources configured.</p>
                    )}
                  </div>
                </div>

                {/* 2. Side Returns / IO tracker completes */}
                <div className="pt-3 border-t border-neutral-100">
                  <span className="block text-[9px] font-extrabold text-neutral-400 uppercase tracking-widest mb-2 font-mono">Informal Loan Returns</span>
                  <div className="space-y-2">
                    {completedReceiveIOAmount > 0 ? (
                      ioTracker
                        .filter(item => item.status === 'Completed' && item.type === 'receive')
                        .map(item => (
                          <div key={item.id} className="flex justify-between items-center bg-emerald-50/45 border border-emerald-100 p-3 rounded-xl">
                            <div>
                              <span className="text-xs font-bold text-neutral-900 block">IO Refund: {item.personName}</span>
                              <span className="text-[9px] text-emerald-800 font-mono font-bold">Lending fully settled</span>
                            </div>
                            <span className="text-xs font-bold text-emerald-800 font-number font-semibold">₹{item.amount.toLocaleString('en-IN')}</span>
                          </div>
                        ))
                    ) : (
                      <p className="text-[10px] text-neutral-300 italic pl-1 font-light">Zero returns received in this cycle.</p>
                    )}
                  </div>
                </div>

              </div>

              <div className="pt-4.5 border-t border-neutral-100 mt-4.5">
                <button
                  onClick={() => setShowIncomeModal(false)}
                  className="w-full bg-neutral-900 hover:bg-neutral-850 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                >
                  Close Breakdown
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SPENT DRILL-DOWN OVERLAY SCREEN */}
      <AnimatePresence>
        {showSpentModal && (
          <div className="fixed inset-0 bg-neutral-950/70 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-neutral-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative font-sans flex flex-col max-h-[90vh]"
            >
              <button
                onClick={() => setShowSpentModal(false)}
                className="absolute top-4.5 right-4.5 text-neutral-400 hover:text-neutral-800 rounded-lg p-1.5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-neutral-100 font-sans text-left">
                <div className="p-1.5 bg-neutral-100 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-rose-500 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-neutral-900 tracking-tight uppercase">Spending Breakout Log</h3>
                  <span className="text-[10px] text-neutral-400 font-light block">Detailed audit of all outgoings for {selectedMonth}</span>
                </div>
              </div>

              {/* Total Card */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 mb-5 text-center">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-neutral-400 font-sans">Consolidated Outflow</span>
                <h4 className="text-2xl font-black text-rose-600 font-number mt-0.5 font-bold">₹{totalSpent.toLocaleString('en-IN')}</h4>
              </div>

              <div className="space-y-4 overflow-y-auto flex-1 pr-1 font-sans text-left">
                <div className="space-y-2">
                  {expenses.filter(e => e.date.startsWith(selectedMonth) && e.type !== 'Saving').length === 0 ? (
                    <div className="text-center py-12 text-neutral-400 text-xs font-light font-sans">
                      <p className="text-2xl">🍃</p>
                      <span>No transactions filed for this month.</span>
                    </div>
                  ) : (
                    expenses
                      .filter(e => e.date.startsWith(selectedMonth) && e.type !== 'Saving')
                      .map(exp => (
                        <div key={exp.id} className="flex justify-between items-center bg-white border border-neutral-150 p-3 rounded-xl shadow-2xs hover:border-neutral-350 transition-colors">
                          <div>
                            <span className="text-xs font-bold text-neutral-900 block">{exp.title}</span>
                            <div className="flex gap-2 items-center mt-1 text-[9px] font-mono font-bold uppercase tracking-wide">
                              <span className="text-neutral-500 bg-neutral-100 px-1 rounded">{exp.category}</span>
                              <span className={exp.type === 'Need' ? 'text-neutral-900 font-bold' : 'text-rose-600 font-bold'}>{exp.type}</span>
                            </div>
                            {exp.note && (
                              <p className="text-[10px] text-neutral-400 font-sans font-light italic mt-1 pb-0.5">"{exp.note}"</p>
                            )}
                          </div>
                          
                          <div className="text-right shrink-0 ml-4 font-sans">
                            <span className="text-xs font-black text-neutral-900 font-number">₹{exp.amount.toLocaleString('en-IN')}</span>
                            <span className="block text-[8px] text-neutral-400 font-mono font-light mt-0.5">{exp.date}</span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <div className="pt-4.5 border-t border-neutral-100 mt-4.5">
                <button
                  onClick={() => setShowSpentModal(false)}
                  className="w-full bg-neutral-900 hover:bg-neutral-850 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                >
                  Close Breakout
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
