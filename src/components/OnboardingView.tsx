import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  HelpCircle, 
  Coins, 
  AlertTriangle, 
  Users, 
  CreditCard, 
  PiggyBank, 
  TrendingDown, 
  FileText, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  IndianRupee
} from 'lucide-react';
import { IncomeSource, FixedCommitment, SavingsGoal, BudgetyProfile, CustomCategory } from '../types';
import { setProfile, setGoals, setCategories, seedSampleData, DEFAULT_CATEGORIES } from '../storage';

interface OnboardingViewProps {
  userName: string;
  userEmail: string;
  onCompleteOnboarding: () => void;
}

export default function OnboardingView({ userName, userEmail, onCompleteOnboarding }: OnboardingViewProps) {
  const [step, setStep] = useState(1);

  // Step 1 State: Income Sources
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [tempSourceName, setTempSourceName] = useState('Salary');
  const [tempCustomName, setTempCustomName] = useState('');
  const [tempAmount, setTempAmount] = useState<number>(0);
  const [tempType, setTempType] = useState<'Fixed' | 'Variable'>('Fixed');
  const [tempArrivalDate, setTempArrivalDate] = useState<number>(1);

  // Step 2 State: Family Size
  const [familySize, setFamilySize] = useState<number>(4);

  // Step 3 State: Fixed Commitments
  const [fixedCommitments, setFixedCommitments] = useState<FixedCommitment[]>([]);
  const [customCommitName, setCustomCommitName] = useState('');
  const [customCommitAmount, setCustomCommitAmount] = useState<number>(0);

  // Step 4 State: Savings Goals
  const [yearlySavingsTarget, setYearlySavingsTarget] = useState<number>(0);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [newGoalName, setNewGoalName] = useState('Emergency Fund');
  const [newGoalCustomName, setNewGoalCustomName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState<number>(0);
  const [newGoalDeadline, setNewGoalDeadline] = useState('2026-11-30');

  // Step 5 State: Biggest Financial Issue
  const [biggestFinancialIssue, setBiggestFinancialIssue] = useState('I never track where money goes');

  // Step 6 State: Daily Notes Feature
  const [dailyNotesEnabled, setDailyNotesEnabled] = useState(true);
  const [trackNoteShortcut, setTrackNoteShortcut] = useState(true);
  const [telegramNotificationsEnabled, setTelegramNotificationsEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Income Options available for quick pick
  const incomeQuickOptions = ['Salary', 'Pension', 'Chitti Return', 'Business', 'Side Work', 'Custom'];
  
  // Custom Goals quick options
  const goalQuickOptions = ['Emergency Fund', 'New Phone', 'Education', 'Festival / Wedding', 'Gold purchase', 'Custom'];

  // Financial Issues list
  const financialIssues = [
    { value: 'I spend too much on wants', text: "🛒 I spend too much on 'wants' (eating out, tech, shopping)." },
    { value: 'I have no savings at all', text: "🌾 I have no active savings at all at the moment." },
    { value: 'I never track where money goes', text: "⚖️ I never track where my money actually goes." },
    { value: 'My income is irregular', text: "📈 My monthly income is irregular or seasonal." },
    { value: 'Family expenses are too high', text: "👨‍👩‍👧‍👦 Family expenses are too high for our current income." },
    { value: 'I have too many loans or EMIs', text: "💳 I have too many outstanding loans or active EMIs." }
  ];

  // Calculated properties helper for savings
  const calculateSavingsTerm = (target: number, dateStr: string) => {
    const today = new Date();
    const targetDate = new Date(dateStr);
    const monthsDiff = (targetDate.getFullYear() - today.getFullYear()) * 12 + (targetDate.getMonth() - today.getMonth());
    const validMonths = monthsDiff <= 0 ? 1 : monthsDiff;
    return Math.round(target / validMonths);
  };

  const getIncomeBracket = (totalIncome: number) => {
    if (totalIncome < 25000) return { name: 'Starter', needs: 60, wants: 20, savings: 20, advice: 'Emergency fund, debt reduction, recurring deposit' };
    if (totalIncome < 50000) return { name: 'Growing', needs: 50, wants: 30, savings: 20, advice: 'Emergency fund, mutual funds, RD/FD' };
    if (totalIncome < 75000) return { name: 'Stable', needs: 45, wants: 30, savings: 25, advice: 'SIP, mutual funds, insurance' };
    return { name: 'Advanced', needs: 40, wants: 30, savings: 30, advice: 'Diversified investing, stocks, gold, debt funds' };
  };

  const totalMonthlyIncome = incomeSources.reduce((sum, src) => sum + src.amount, 0);
  const incomeBracket = getIncomeBracket(totalMonthlyIncome);

  // Quick Action: Add Income Source
  const addIncomeSource = () => {
    const finalName = tempSourceName === 'Custom' ? tempCustomName : tempSourceName;
    if (!finalName.trim()) return;

    const newSource: IncomeSource = {
      id: 'inc-' + Date.now(),
      sourceName: finalName,
      amount: tempAmount,
      type: tempType,
      arrivalDate: tempArrivalDate,
      arrived: true
    };

    setIncomeSources([...incomeSources, newSource]);
    setTempCustomName('');
    setTempAmount(10000);
  };

  // Remove Income Source
  const removeIncomeSource = (id: string) => {
    setIncomeSources(incomeSources.filter(src => src.id !== id));
  };

  // Quick Actions: Fixed commitments pre-adds
  const handleQuickAddCommitment = (name: string, defaultVal: number) => {
    const exists = fixedCommitments.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (exists) return;
    setFixedCommitments([...fixedCommitments, {
      id: 'fix-' + Date.now(),
      name,
      amount: defaultVal,
      paid: true
    }]);
  };

  const addCustomCommitment = () => {
    if (!customCommitName.trim() || !customCommitAmount) return;
    setFixedCommitments([...fixedCommitments, {
      id: 'fix-' + Date.now(),
      name: customCommitName,
      amount: customCommitAmount,
      paid: true
    }]);
    setCustomCommitName('');
    setCustomCommitAmount(1000);
  };

  const updateCommitmentAmount = (id: string, amount: number) => {
    setFixedCommitments(fixedCommitments.map(c => c.id === id ? { ...c, amount } : c));
  };

  const removeCommitment = (id: string) => {
    setFixedCommitments(fixedCommitments.filter(c => c.id !== id));
  };

  // Add Savings Goal
  const addSavingsGoal = () => {
    const finalName = newGoalName === 'Custom' ? newGoalCustomName : newGoalName;
    if (!finalName.trim()) return;

    const newGoal: SavingsGoal = {
      id: 'goal-' + Date.now(),
      name: finalName,
      targetAmount: newGoalTarget,
      targetDate: newGoalDeadline,
      savedAmount: 0
    };

    setSavingsGoals([...savingsGoals, newGoal]);
    setNewGoalCustomName('');
    setNewGoalTarget(20000);
  };

  const removeSavingsGoal = (id: string) => {
    setSavingsGoals(savingsGoals.filter(g => g.id !== id));
  };

  // Complete onboarding wizard
  const handleFinish = () => {
    // Generate profile
    const profile: BudgetyProfile = {
      onboarded: true,
      name: userName,
      email: userEmail,
      familySize,
      incomeSources,
      fixedCommitments,
      biggestFinancialIssue,
      dailyNotesEnabled,
      alertsEnabled: true,
      trackNoteShortcutAdded: trackNoteShortcut,
      telegramNotificationsEnabled,
      phoneNumber,
      telegramChatId: telegramNotificationsEnabled ? '7154626182' : undefined
    };

    // Auto-generate categories based on user profile and standard system
    // Also include their goals as budget limits under Savings type, and fixed commitments under Needs with limits!
    const updatedCategories: CustomCategory[] = [
      ...DEFAULT_CATEGORIES
    ];

    const finalGoalsList = [...savingsGoals];
    // Add overall yearly target
    if (yearlySavingsTarget > 0) {
      finalGoalsList.push({
        id: 'goal-yearly-onboard',
        name: '2026 Yearly Savings Target',
        targetAmount: yearlySavingsTarget,
        targetDate: '2026-12-31',
        savedAmount: 0
      });
      
      updatedCategories.push({
        id: 'cat-goal-yearly',
        name: '2026 Yearly Savings Target',
        type: 'Saving',
        monthlyBudgetLimit: Math.round(yearlySavingsTarget / 12)
      });
    }

    // If there are custom goals, add them to categories
    savingsGoals.forEach(g => {
      const exists = updatedCategories.find(c => c.name.toLowerCase() === g.name.toLowerCase());
      if (!exists) {
        updatedCategories.push({
          id: 'cat-goal-' + g.id,
          name: g.name,
          type: 'Saving',
          monthlyBudgetLimit: calculateSavingsTerm(g.targetAmount, g.targetDate)
        });
      }
    });

    // Save outputs
    setProfile(profile);
    setGoals(finalGoalsList);
    setCategories(updatedCategories);

    onCompleteOnboarding();
  };

  const totalSteps = 6;
  const progressPercent = Math.min((step / totalSteps) * 100, 100);

  return (
    <div className="min-h-screen bg-neutral-50 py-10 px-4 md:px-6 flex flex-col justify-between font-sans">
      
      {/* Upper Navigation & Progress */}
      <div className="max-w-2xl w-full mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <span className="font-bold text-neutral-800 uppercase tracking-widest font-mono">Step {step} of {totalSteps}</span>
          </div>
          <span className="text-xs text-neutral-400 font-light font-mono">Onboarding Wizard</span>
        </div>
        
        {/* Progress bar container */}
        <div className="w-full h-1.5 bg-neutral-200/60 rounded-full overflow-hidden mb-8">
          <motion.div 
            className="h-full bg-neutral-900 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: 'spring', stiffness: 80 }}
          />
        </div>
        

      </div>

      {/* Primary Card Viewport */}
      <div className="max-w-2xl w-full mx-auto flex-grow flex items-center justify-center">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: INCOME SOURCES */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white border border-neutral-200/80 rounded-2xl shadow-sm p-6 sm:p-8 w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-neutral-900 text-white rounded-xl">
                  <Coins className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Let's start with your income</h3>
              </div>

              {/* Warning Banner */}
              <div className="p-4 bg-amber-50 text-amber-800 rounded-xl text-xs flex gap-3 border border-amber-200/50 mb-6 leading-relaxed">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">Don't forget!</span>
                  Pension, chitti returns, rental income, milk money, or any side business earnings count as well. The more accurate this is, the better your monthly safety net will be configured.
                </div>
              </div>

              {/* Form Input Block for Income */}
              <div className="bg-neutral-50/80 p-5 rounded-2xl border border-neutral-100 mb-6 font-sans">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4 flex items-center gap-1">Add Income Source</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Source Category</label>
                    <select
                      value={tempSourceName}
                      onChange={(e) => setTempSourceName(e.target.value)}
                      className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none transition-all"
                    >
                      {incomeQuickOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {tempSourceName === 'Custom' && (
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">Custom Source Name</label>
                      <input
                        type="text"
                        value={tempCustomName}
                        onChange={(e) => setTempCustomName(e.target.value)}
                        placeholder="e.g., Shop sales, Rent"
                        className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none transition-all"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Expected Amount (₹)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={tempAmount === 0 ? '' : tempAmount}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9]/g, '');
                        setTempAmount(clean === '' ? 0 : parseInt(clean, 10));
                      }}
                      className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none transition-all font-number"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Type</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setTempType('Fixed')}
                        className={`flex-1 py-1.5 text-xs rounded-lg border font-medium transition-all ${tempType === 'Fixed' ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
                      >
                        Fixed
                      </button>
                      <button
                        type="button"
                        onClick={() => setTempType('Variable')}
                        className={`flex-1 py-1.5 text-xs rounded-lg border font-medium transition-all ${tempType === 'Variable' ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
                      >
                        Variable
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Expected Day in Month</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={tempArrivalDate === 0 ? '' : tempArrivalDate}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9]/g, '');
                        const val = clean === '' ? 0 : parseInt(clean, 10);
                        setTempArrivalDate(val > 31 ? 31 : val);
                      }}
                      className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none transition-all font-number"
                      placeholder="e.g., 5"
                    />
                  </div>
                </div>

                {tempType === 'Variable' && (
                  <p className="text-[10px] text-neutral-400 mt-2 font-sans font-light">
                    💡 Variable income represents self-employment or chitti payouts. We will maintain an average estimate over time. Enter average monthly target for now.
                  </p>
                )}

                <button
                  type="button"
                  onClick={addIncomeSource}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs py-2.5 px-4 rounded-xl mt-4 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Income to List
                </button>
              </div>

              {/* Added Income Sources display */}
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                <h5 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Your Income List ({incomeSources.length})</h5>
                {incomeSources.length === 0 ? (
                  <p className="text-sm text-neutral-400 font-light italic">No income sources added yet. Please add at least one.</p>
                ) : (
                  incomeSources.map(src => (
                    <div key={src.id} className="flex justify-between items-center bg-neutral-50 border border-neutral-200 px-4 py-2.5 rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{src.sourceName}</p>
                        <span className="text-[10px] bg-neutral-200/80 text-neutral-600 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider font-mono mr-1.5">{src.type}</span>
                        <span className="text-[10px] text-neutral-400 font-light font-mono">Arrives around day {src.arrivalDate}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm text-emerald-700 font-number">₹{src.amount.toLocaleString('en-IN')}</span>
                        <button
                          type="button"
                          onClick={() => removeIncomeSource(src.id)}
                          className="text-neutral-400 hover:text-neutral-900 transition-colors p-1 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 2: FAMILY SIZE */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white border border-neutral-200/80 rounded-2xl shadow-sm p-6 sm:p-8 w-full"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-neutral-900 text-white rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">How many family members?</h3>
              </div>

              <p className="text-neutral-500 text-sm mb-8 leading-relaxed font-light">
                BUDGETY uses this to calculate a <strong>per-person spending breakdown</strong> on your dashboard. This highlights exactly how much of the budget supports each individual in your household.
              </p>

              {/* Slider & Quick selector */}
              <div className="flex flex-col items-center justify-center p-8 bg-neutral-50 rounded-2xl border border-neutral-100 mb-6">
                <span className="text-6xl font-bold text-neutral-800 tracking-tight font-number mb-2">{familySize}</span>
                <span className="text-xs text-neutral-400 uppercase tracking-widest font-mono mb-6">People in active household</span>

                <input
                  type="range"
                  min="1"
                  max="50"
                  value={familySize}
                  onChange={(e) => setFamilySize(Number(e.target.value))}
                  className="w-full accent-neutral-950 h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
                />
                
                <div className="flex justify-between w-full text-[10px] text-neutral-400 font-mono mt-2 px-1">
                  <span>1 (Just Me)</span>
                  <span>20 (Limit)</span>
                  <span>50 (Max)</span>
                </div>
              </div>

              <div className="flex w-full gap-2">
                {[2, 3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFamilySize(num)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${familySize === num ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300'}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: SMART SUGGESTED BUDGET & FIXED COMMITMENTS */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white border border-neutral-200/80 rounded-2xl shadow-sm p-6 sm:p-8 w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-neutral-900 text-white rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Your Suggested Budget</h3>
              </div>
              
              <div className="bg-neutral-900 text-white p-5 rounded-2xl mb-6">
                <h4 className="text-xs uppercase tracking-widest font-bold mb-3 opacity-60">Bracket: {incomeBracket.name} Income</h4>
                <p className="text-3xl font-black mb-4">₹{totalMonthlyIncome.toLocaleString('en-IN')}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] opacity-60">Needs</p>
                    <p className="font-bold text-sm">{incomeBracket.needs}%</p>
                    <p className="text-[10px] font-mono">₹{Math.round(totalMonthlyIncome * (incomeBracket.needs / 100)).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] opacity-60">Wants</p>
                    <p className="font-bold text-sm">{incomeBracket.wants}%</p>
                    <p className="text-[10px] font-mono">₹{Math.round(totalMonthlyIncome * (incomeBracket.wants / 100)).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] opacity-60">Savings</p>
                    <p className="font-bold text-sm">{incomeBracket.savings}%</p>
                    <p className="text-[10px] font-mono">₹{Math.round(totalMonthlyIncome * (incomeBracket.savings / 100)).toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <p className="text-[10px] mt-4 opacity-70 italic font-mono pt-3 border-t border-white/10">
                  Recommended: {incomeBracket.advice}
                </p>
              </div>

              <h3 className="text-lg font-bold text-neutral-900 mb-2">What goes out every month?</h3>
              <p className="text-neutral-500 text-sm mb-6 leading-relaxed font-light">
                These are rent, EMIs, or school fees that go out every month without fail.
              </p>
              
              {/* [Keep the existing list and form rendering logic here] */}
              
              {/* Quick Picks */}
              <div className="mb-6 font-sans">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-2.5">Quick Add Favorites (Click to add defaults)</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickAddCommitment('Rent', 8000)}
                    className="text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium px-3 py-1.5 rounded-lg border border-neutral-200/60 transition-all cursor-pointer"
                  >
                    🏠 Rent (~₹8k)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAddCommitment('Bike EMI', 4500)}
                    className="text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium px-3 py-1.5 rounded-lg border border-neutral-200/60 transition-all cursor-pointer"
                  >
                    🛵 Bike EMI (~₹4.5k)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAddCommitment('School Fees', 3000)}
                    className="text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium px-3 py-1.5 rounded-lg border border-neutral-200/60 transition-all cursor-pointer"
                  >
                    🎒 School Fees (~₹3k)
                  </button>
                </div>
              </div>

              {/* Form Input Custom Commitments */}
              <div className="bg-neutral-50/80 p-4 rounded-xl border border-neutral-100 flex flex-col sm:flex-row gap-3 items-end mb-6">
                <div className="flex-1 w-full">
                  <label className="block text-[10px] font-medium text-neutral-400 uppercase mb-1">Name</label>
                  <input
                    type="text"
                    value={customCommitName}
                    onChange={(e) => setCustomCommitName(e.target.value)}
                    placeholder="e.g., Cable TV"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs focus:border-neutral-900 focus:outline-none transition-all"
                  />
                </div>
                <div className="w-full sm:w-[150px]">
                  <label className="block text-[10px] font-medium text-neutral-400 uppercase mb-1">Amount (₹)</label>
                  <input
                    type="text"
                    value={customCommitAmount === 0 ? '' : customCommitAmount}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^0-9]/g, '');
                      setCustomCommitAmount(clean === '' ? 0 : parseInt(clean, 10));
                    }}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs focus:border-neutral-900 focus:outline-none transition-all font-number"
                  />
                </div>
                <button
                  type="button"
                  onClick={addCustomCommitment}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white p-2.5 rounded-xl transition-all w-11 h-11 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Commitments list */}
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400">Current Fixed Expenses ({fixedCommitments.length})</span>
                {fixedCommitments.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic font-light pt-2">No fixed commitments added yet.</p>
                ) : (
                  fixedCommitments.map(c => (
                    <div key={c.id} className="flex justify-between items-center bg-neutral-50 border border-neutral-200 px-3.5 py-2 rounded-xl">
                      <span className="text-xs font-semibold text-neutral-800">{c.name}</span>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="number"
                          value={c.amount}
                          onChange={(e) => updateCommitmentAmount(c.id, Number(e.target.value))}
                          className="text-xs font-semibold text-neutral-900 font-number w-20 border border-neutral-300 rounded px-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeCommitment(c.id)}
                          className="text-neutral-400 hover:text-neutral-900 transition-colors p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 4: SAVINGS GOALS */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white border border-neutral-200/80 rounded-2xl shadow-sm p-6 sm:p-8 w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-neutral-900 text-white rounded-xl">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">What are you saving for?</h3>
              </div>

              <p className="text-neutral-500 text-sm mb-6 leading-relaxed font-light">
                Saving is "paying your future self." Let's build your financial security net with clear targets.
              </p>

              {/* YEARLY GOAL BLOCK FIRST */}
              <div className="p-4 bg-emerald-50 text-emerald-950 rounded-2xl border border-emerald-200/40 mb-6 font-sans">
                <span className="block text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 mb-1.5 flex items-center gap-1">
                  ⚔️ Overall Year Savings Goal
                </span>
                <p className="text-xs font-light leading-relaxed mb-3">
                  How much would you like to save in total over this year? (e.g. 2026 Target)
                </p>
                <div className="flex gap-3 items-center">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2 text-xs font-semibold text-emerald-800 font-mono">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={yearlySavingsTarget === 0 ? '' : yearlySavingsTarget}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9]/g, '');
                        const val = clean === '' ? 0 : parseInt(clean, 10);
                        const maxLimit = totalMonthlyIncome * 12;
                        if (val > maxLimit) {
                          setYearlySavingsTarget(maxLimit);
                        } else {
                          setYearlySavingsTarget(val);
                        }
                      }}
                      className="w-full rounded-xl border border-emerald-300/60 bg-white pl-7 pr-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none font-number font-bold text-emerald-900"
                    />
                  </div>
                  <span className="text-[10px] text-emerald-700 font-mono italic">
                    ~ ₹{Math.round(yearlySavingsTarget / 12).toLocaleString('en-IN')}/month
                  </span>
                </div>
              </div>

              {/* Addition of specific sub-goals */}
              <div className="bg-neutral-50/80 p-4 rounded-2xl border border-neutral-100 mb-6 font-sans">
                <span className="block text-[10px] uppercase font-extrabold tracking-wider text-neutral-400 mb-3">Add Custom Goal Basket (e.g. Emergency, Gold)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[10px] text-neutral-500 mb-1">Goal Purpose</label>
                    <select
                      value={newGoalName}
                      onChange={(e) => setNewGoalName(e.target.value)}
                      className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs focus:border-neutral-900 focus:outline-none transition-all"
                    >
                      {goalQuickOptions.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>

                  {newGoalName === 'Custom' && (
                    <div>
                      <label className="block text-[10px] text-neutral-500 mb-1">Custom Goal Name</label>
                      <input
                        type="text"
                        value={newGoalCustomName}
                        onChange={(e) => setNewGoalCustomName(e.target.value)}
                        placeholder="e.g., Son's wedding, Gold"
                        className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs focus:border-neutral-900 focus:outline-none transition-all"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] text-neutral-500 mb-1">Target Amount (₹)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={newGoalTarget === 0 ? '' : newGoalTarget}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9]/g, '');
                        setNewGoalTarget(clean === '' ? 0 : parseInt(clean, 10));
                      }}
                      className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs focus:border-neutral-900 focus:outline-none transition-all font-number"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-500 mb-1">Target Deadline Date</label>
                    <input
                      type="date"
                      value={newGoalDeadline}
                      onChange={(e) => setNewGoalDeadline(e.target.value)}
                      className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs focus:border-neutral-900 focus:outline-none transition-all font-number"
                    />
                  </div>
                </div>

                {newGoalTarget > 0 && (
                  <p className="text-[10px] text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg font-sans flex items-center gap-1">
                    🟢 Requires saving <strong>₹{calculateSavingsTerm(newGoalTarget, newGoalDeadline).toLocaleString('en-IN')}/month</strong> for this basket.
                  </p>
                )}

                <button
                  type="button"
                  onClick={addSavingsGoal}
                  className="w-full bg-neutral-900 hover:bg-neutral-850 text-white font-medium text-xs py-2 px-4 rounded-xl mt-3 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Allocate Custom Basket Goal
                </button>
              </div>

              {/* Goal output list */}
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400">Your Configured Goals ({savingsGoals.length})</span>
                {savingsGoals.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic font-light pt-1">No active savings targets entered yet. Add one or skip to next step.</p>
                ) : (
                  savingsGoals.map(g => (
                    <div key={g.id} className="flex justify-between items-center bg-neutral-50 border border-neutral-200 px-3 py-2 rounded-xl">
                      <div>
                        <span className="text-xs font-semibold text-neutral-800 block">{g.name}</span>
                        <span className="text-[9px] text-neutral-400 font-mono">By {g.targetDate}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-bold text-neutral-900 block font-number">₹{g.targetAmount.toLocaleString('en-IN')}</span>
                          <span className="text-[9px] text-emerald-700 block font-mono font-medium">✨ ₹{calculateSavingsTerm(g.targetAmount, g.targetDate)}/mo</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSavingsGoal(g.id)}
                          className="text-neutral-400 hover:text-neutral-900 transition-colors p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 5: BIGGEST FINANCIAL ISSUE */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white border border-neutral-200/80 rounded-2xl shadow-sm p-6 sm:p-8 w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-neutral-900 text-white rounded-xl">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Your biggest financial obstacle?</h3>
              </div>

              <p className="text-neutral-500 text-sm mb-6 leading-relaxed font-light">
                Select your most critical challenge. BUDGETY uses your selection to provide <strong>friendly, personalized tips and micro-suggestions</strong> on your main dashboard.
              </p>

              <div className="space-y-3.5 font-sans">
                {financialIssues.map(issue => (
                  <label
                    key={issue.value}
                    id={`issue-label-${issue.value.replace(/\s+/g, '-').toLowerCase()}`}
                    className={`flex items-center gap-4 border p-4 rounded-xl cursor-pointer transition-all active:scale-[0.99] ${biggestFinancialIssue === issue.value ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm' : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:border-neutral-300'}`}
                  >
                    <input
                      type="radio"
                      name="financial_issue"
                      value={issue.value}
                      checked={biggestFinancialIssue === issue.value}
                      onChange={() => setBiggestFinancialIssue(issue.value)}
                      className="sr-only"
                    />
                    <span className="text-xs sm:text-sm font-semibold tracking-wide leading-tight">{issue.text}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 6: DAILY NOTES MODULE & SHORTCUT */}
          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white border border-neutral-200/80 rounded-2xl shadow-sm p-6 sm:p-8 w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-neutral-900 text-white rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Add Track Note to Home Screen?</h3>
              </div>

               <p className="text-neutral-500 text-sm mb-5 leading-relaxed font-light">
                Do you want to add a direct <strong>Track Note shortcut</strong> to the Home Screen? It lets you instantly write quick stamps like "tea 20, breakfast 80" with automatic time stamps and keeps written ideas safe for up to 3 days!
                We can also send you <strong>daily budget alerts and suggestions</strong> via Telegram. If you'd like this, please provide your WhatsApp/Telegram-linked phone number.
              </p>

              <div className="bg-amber-50 rounded-2xl border border-amber-200/50 p-5 mb-5 text-amber-955 font-sans text-xs">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={trackNoteShortcut}
                    onChange={(e) => setTrackNoteShortcut(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Add Track Note shortcut</span>
                </div>
              </div>
              
              {/*
              <div className="bg-blue-50 rounded-2xl border border-blue-200/50 p-5 mb-5 text-blue-950 font-sans text-xs">
                <label className="flex items-center gap-3 font-bold mb-2">
                  <input
                    type="checkbox"
                    // Need state for this: telegramEnabled
                    checked={telegramNotificationsEnabled}
                    onChange={(e) => setTelegramNotificationsEnabled(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Enable Telegram Alerts
                </label>
                {telegramNotificationsEnabled && (
                  <input
                    type="tel"
                    placeholder="Enter phone number (+91...)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full mt-2 rounded-xl border border-blue-200/50 p-2 text-xs"
                  />
                )}
              </div>
              */}

              <div className="flex gap-4 font-sans justify-center">
                <button
                  type="button"
                  id="onboard-notes-yes"
                  onClick={() => {
                    setDailyNotesEnabled(true);
                    setTrackNoteShortcut(true);
                  }}
                  className={`flex-1 py-4 px-3 rounded-xl border font-bold text-xs sm:text-sm transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer ${trackNoteShortcut ? 'bg-neutral-900 border-neutral-900 text-white shadow-md' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100'}`}
                >
                  <CheckCircle className="w-5 h-5 mb-0.5 text-emerald-500" />
                  Yes, add shortcut to home screen
                </button>
                <button
                  type="button"
                  id="onboard-notes-no"
                  onClick={() => {
                    setDailyNotesEnabled(false);
                    setTrackNoteShortcut(false);
                  }}
                  className={`flex-1 py-4 px-3 rounded-xl border font-bold text-xs sm:text-sm transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer ${!trackNoteShortcut ? 'bg-neutral-900 border-neutral-900 text-white shadow-md' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100'}`}
                >
                  <HelpCircle className="w-5 h-5 mb-0.5 text-neutral-400" />
                  Maybe Later
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 7: VERIFY TELEGRAM */}

        </AnimatePresence>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="max-w-2xl w-full mx-auto mt-10 pt-6 border-t border-neutral-200/60 flex justify-between items-center bg-transparent">
        <button
          type="button"
          id="btn-onboard-back"
          onClick={() => {
            if (step > 1) setStep(step - 1);
          }}
          disabled={step === 1}
          className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:hover:text-neutral-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {step < totalSteps ? (
          <button
            type="button"
            id="btn-onboard-next"
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && incomeSources.length === 0}
            className="bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs px-5 py-2.5 rounded-xl flex items-center gap-1 shadow-sm transition-all cursor-pointer disabled:opacity-40"
          >
            Next Step
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            id="btn-onboard-finish"
            onClick={handleFinish}
            className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95 animate-pulse"
          >
            Create My Budget Now
            <CheckCircle className="w-4 h-4" />
          </button>
        )}
      </div>

    </div>
  );
}
