import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PiggyBank, 
  Target, 
  Plus, 
  Trash2, 
  Calendar, 
  Coins, 
  CheckCircle, 
  Award, 
  Flame,
  Info,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { 
  getGoals, 
  setGoals, 
  getExpenses, 
  setExpenses,
  getProfile
} from '../storage';
import { SavingsGoal, Expense } from '../types';

interface GoalsViewProps {
  onNavigate: (route: string) => void;
  selectedMonth: string;
}

export default function GoalsView({ onNavigate, selectedMonth }: GoalsViewProps) {
  // Goal states
  const [goals, setGoalsState] = useState<SavingsGoal[]>([]);
  const [expenses, setExpensesState] = useState<Expense[]>([]);
  const profile = getProfile();

  // Yearly target stats
  const [yearlyInputAmount, setYearlyInputAmount] = useState<number>(50000);
  const [yearlyInputYear, setYearlyInputYear] = useState<string>('2026');

  // Form states for creating custom goals
  const [goalPurpose, setGoalPurpose] = useState('Emergency Fund');
  const [customPurpose, setCustomPurpose] = useState('');
  const [targetAmt, setTargetAmt] = useState<number>(30000);
  const [deadlineDate, setDeadlineDate] = useState('2026-11-30');

  // Add Deposit quick action Modal state
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(2000);

  // Quick Goals preset selections
  const goalPresets = ['Emergency Fund', 'Festival & Puja', 'New Phone', 'Daughter\'s Education', 'Father\'s Medicine kitty', 'Gold Purchase', 'Custom'];

  // Load baseline on mount
  useEffect(() => {
    setGoalsState(getGoals());
    setExpenses(getExpenses());
  }, []);

  const saveGoals = (updated: SavingsGoal[]) => {
    setGoalsState(updated);
    setGoals(updated);
  };

  // Check if a Yearly Savings Target Goal already exists
  const yearlyTargetGoal = goals.find(g => g.name.includes('Yearly Savings Target') || g.name.includes('Savings Target'));

  // Handler to set overall Yearly Savings Goal
  const handleSetYearlySavingsGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const finalGoalName = `${yearlyInputYear} Yearly Savings Target`;
    
    // Check if goal with similar name exists
    const existingIndex = goals.findIndex(g => g.name.toLowerCase().includes('yearly savings target') || g.name.toLowerCase().includes('savings target'));

    const newYearlyGoal: SavingsGoal = {
      id: 'goal-yearly-' + Date.now(),
      name: finalGoalName,
      targetAmount: yearlyInputAmount,
      targetDate: `${yearlyInputYear}-12-31`,
      savedAmount: existingIndex >= 0 ? goals[existingIndex].savedAmount : 0
    };

    let updatedList = [...goals];
    if (existingIndex >= 0) {
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        name: finalGoalName,
        targetAmount: yearlyInputAmount,
        targetDate: `${yearlyInputYear}-12-31`
      };
    } else {
      updatedList.push(newYearlyGoal);
    }

    saveGoals(updatedList);
  };

  // Add standard custom goal
  const handleAddCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = goalPurpose === 'Custom' ? customPurpose : goalPurpose;
    if (!finalName.trim()) return;

    const newGoal: SavingsGoal = {
      id: 'goal-' + Date.now(),
      name: finalName.trim(),
      targetAmount: targetAmt,
      targetDate: deadlineDate,
      savedAmount: 0
    };

    const updated = [...goals, newGoal];
    saveGoals(updated);

    // Reset inputs
    setCustomPurpose('');
    setTargetAmt(25000);
  };

  // Delete goal
  const handleDeleteGoal = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the savings target "${name}"?`)) {
      const updated = goals.filter(g => g.id !== id);
      saveGoals(updated);
    }
  };

  // Handle Log Deposit transaction (increments savedAmount AND submits standard transaction expense under "Saving" to be reflected everywhere!)
  const handleCommitDeposit = () => {
    if (!depositGoalId || !depositAmount) return;

    const goalIndex = goals.findIndex(g => g.id === depositGoalId);
    if (goalIndex < 0) return;

    const targetGoal = goals[goalIndex];
    const newSavedAmt = targetGoal.savedAmount + depositAmount;

    // 1. Update goals state
    const updatedGoals = [...goals];
    updatedGoals[goalIndex] = {
      ...targetGoal,
      savedAmount: newSavedAmt
    };
    saveGoals(updatedGoals);

    // 2. Draft standard expense logged as saving in the transactions store
    const todayStr = new Date().toISOString().split('T')[0];
    const newSavingEntry: Expense = {
      id: `exp-deposit-${Date.now()}`,
      title: `Saved towards [Goal: ${targetGoal.name}]`,
      amount: depositAmount,
      category: 'School & Education', // maps to default category with Need/Want/Saving characteristics or Custom Goal Categories
      type: 'Saving',
      date: todayStr,
      note: `Added offline deposit to goals ledger`
    };

    const updatedExpenses = [newSavingEntry, ...getExpenses()];
    setExpenses(updatedExpenses);

    // Reset modal
    setDepositGoalId(null);
  };

  // Helper calculation for monthly installment estimates
  const getMonthsInstallment = (target: number, dateStr: string) => {
    const today = new Date();
    const deadline = new Date(dateStr);
    const monthsDiff = (deadline.getFullYear() - today.getFullYear()) * 12 + (deadline.getMonth() - today.getMonth());
    const valid = monthsDiff <= 0 ? 1 : monthsDiff;
    return Math.round(target / valid);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans">
      
      {/* Page Title Block */}
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
          <Target className="w-6 h-6 text-neutral-800" />
          Household Savings Goals
        </h2>
        <p className="text-xs text-neutral-500 font-light mt-0.5">
          Define how much you need to save, track monthly allocations, and log active goal progress.
        </p>
      </div>

      {/* SECTION 1 — ORCHESTRATOR YEARLY TARGET */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* HERO CARD: Current Year overall status */}
        <div className="bg-white border border-neutral-200/85 p-6 rounded-2xl shadow-xs lg:col-span-2 flex flex-col justify-between relative overflow-hidden">
          
          <div className="absolute top-0 right-0 p-8 opacity-[0.04] text-neutral-900 pointer-events-none">
            <Award className="w-48 h-48" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-450 uppercase tracking-widest font-bold mb-3">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Yearly overall Target tracker</span>
            </div>
            
            {yearlyTargetGoal ? (
              <div>
                <h3 className="text-2xl font-black text-neutral-900 tracking-tight leading-none">
                  ₹{yearlyTargetGoal.targetAmount.toLocaleString('en-IN')}
                </h3>
                <span className="text-xs text-neutral-400 block mt-1">Goal set for the Year {yearlyTargetGoal.name.split(' ')[0]} (Deadline Dec 31)</span>
                
                {/* Main Progress Indicator */}
                <div className="mt-6">
                  <div className="flex justify-between items-end text-xs font-sans mb-1.5">
                    <span className="text-neutral-500 font-light">Saved towards overall goal: <strong>₹{yearlyTargetGoal.savedAmount.toLocaleString('en-IN')}</strong></span>
                    <span className="font-extrabold text-neutral-900">{Math.round((yearlyTargetGoal.savedAmount / yearlyTargetGoal.targetAmount) * 100)}% Complete</span>
                  </div>
                  
                  <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-neutral-900 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((yearlyTargetGoal.savedAmount / yearlyTargetGoal.targetAmount) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Balance & installment estimates */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-neutral-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Remaining Cushion Needed</span>
                    <span className="block text-sm font-extrabold text-neutral-900 font-number">
                      ₹{Math.max(yearlyTargetGoal.targetAmount - yearlyTargetGoal.savedAmount, 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Suggested Monthly Rate</span>
                    <span className="block text-sm font-extrabold text-emerald-700 font-number">
                      ₹{getMonthsInstallment(yearlyTargetGoal.targetAmount - yearlyTargetGoal.savedAmount, yearlyTargetGoal.targetDate).toLocaleString('en-IN')}/mo
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center border border-dashed border-neutral-200 rounded-2xl p-5 text-center bg-neutral-50/50">
                <p className="text-2xl">🌱</p>
                <h4 className="text-xs font-bold text-neutral-800 mt-1">No overall target set yet</h4>
                <p className="text-[10px] text-neutral-400 max-w-xs mt-1.5 leading-relaxed">
                  Budgety recommends setting a baseline savings challenge for the year 2026. Put your target in the configuration side form!
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-5 p-3.5 bg-neutral-50 rounded-xl text-[10px] sm:text-xs text-neutral-500 flex gap-2.5 items-center">
            <Info className="w-5 h-5 shrink-0 text-neutral-400" />
            <p className="font-light">
              💡 Anytime you click **Log Allocation** to save money towards any specific goal below, it automatically aggregates and advances your overall year-end budget target meter!
            </p>
          </div>

        </div>

        {/* SIDE CONFIG: Set Annual budget target */}
        <div className="bg-white border border-neutral-200/85 p-6 rounded-2xl shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">Set/Update Yearly Target</h4>
          
          <form onSubmit={handleSetYearlySavingsGoal} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1">Target Amount (₹)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                placeholder="e.g., 50000"
                value={yearlyInputAmount === 0 ? '' : yearlyInputAmount}
                onChange={(e) => {
                  const clean = e.target.value.replace(/[^0-9]/g, '');
                  setYearlyInputAmount(clean === '' ? 0 : parseInt(clean, 10));
                }}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-none focus:bg-white placeholder:text-neutral-300 font-number font-bold text-neutral-800"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1">Target Year</label>
              <select
                value={yearlyInputYear}
                onChange={(e) => setYearlyInputYear(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-none text-neutral-600"
              >
                <option value="2026">Year 2026 (Recommended)</option>
                <option value="2027">Year 2027</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-neutral-900 hover:bg-neutral-850 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer shadow-sm transition-all text-center flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Save Annual Focus
            </button>
          </form>
        </div>

      </div>

      {/* SECTION 2 — DETAILED SAVINGS BASKETS AND CREATE FORM SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ACTIVE BASKETS LIST */}
        <div className="bg-white border border-neutral-200/85 p-6 rounded-2xl shadow-xs lg:col-span-2">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 mb-5">Active savings Baskets ({goals.length})</h3>
          
          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {goals.length === 0 ? (
              <div className="py-12 border border-dashed border-neutral-200 rounded-3xl flex flex-col items-center justify-center text-center text-xs text-neutral-400 p-5">
                <p className="text-2xl mb-1">🪙</p>
                <span>Zero active savings baskets on display. Setup custom targets on the right side form!</span>
              </div>
            ) : (
              goals.map(g => {
                const percent = Math.min((g.savedAmount / g.targetAmount) * 100, 100);
                const isFinished = g.savedAmount >= g.targetAmount;

                return (
                  <div 
                    key={g.id} 
                    className="p-4 border border-neutral-200/90 rounded-2xl hover:border-neutral-300 bg-white transition-all shadow-2xs"
                  >
                    
                    <div className="flex justify-between items-start gap-3 mb-2.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-neutral-900 text-sm">{g.name}</span>
                          {isFinished && (
                            <span className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-widest font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 font-mono">
                              <CheckCircle className="w-3 h-3" /> Met!
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-neutral-400 block mt-0.5 font-mono uppercase">Target Date: {g.targetDate}</span>
                      </div>

                      {/* Goal operations */}
                      <button
                        onClick={() => handleDeleteGoal(g.id, g.name)}
                        className="text-neutral-350 hover:text-rose-600 p-1"
                        title="Delete savings goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Progress bars meters */}
                    <div className="space-y-1.5 mt-3.5">
                      <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${isFinished ? 'bg-emerald-600' : 'bg-neutral-800'}`} 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-neutral-400">
                        <span>Logged: <strong>₹{g.savedAmount.toLocaleString('en-IN')}</strong></span>
                        <span>Goal: <strong>₹{g.targetAmount.toLocaleString('en-IN')}</strong></span>
                      </div>
                    </div>

                    {/* Interactive deposit trigger action inline */}
                    {!isFinished && (
                      <div className="mt-4 pt-3.5 border-t border-neutral-100 flex justify-between items-center bg-transparent">
                        <span className="text-[9px] text-neutral-400 uppercase tracking-wider block font-light font-sans">Suggested chunk allocations:</span>
                        <div className="flex items-center gap-1.5">
                          {[500, 1000, 2000].map(amt => (
                            <button
                              key={amt}
                              onClick={() => {
                                setDepositGoalId(g.id);
                                setDepositAmount(amt);
                              }}
                              className="text-[10px] bg-neutral-50 hover:bg-neutral-900 hover:text-white text-neutral-700 font-bold px-2 py-1 rounded border border-neutral-200 cursor-pointer transition-all font-sans"
                            >
                              + ₹{amt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SIDE PANEL: CREATE TARGET FORM */}
        <div className="bg-white border border-neutral-200/85 p-6 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <PiggyBank className="w-5 h-5 text-neutral-800" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">Add Goal Basket</h4>
          </div>

          <form onSubmit={handleAddCustomGoal} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1">Goal Category/Purpose</label>
              <select
                value={goalPurpose}
                onChange={(e) => setGoalPurpose(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-none text-neutral-600 bg-white"
              >
                {goalPresets.map(preset => (
                  <option key={preset} value={preset}>{preset}</option>
                ))}
              </select>
            </div>

            {goalPurpose === 'Custom' && (
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1">Custom Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Bike Purchase, Daughter's Laptop"
                  value={customPurpose}
                  onChange={(e) => setCustomPurpose(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-none placeholder:text-neutral-300"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1">Target Amount (₹)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                placeholder="e.g., 20000"
                value={targetAmt === 0 ? '' : targetAmt}
                onChange={(e) => {
                  const clean = e.target.value.replace(/[^0-9]/g, '');
                  setTargetAmt(clean === '' ? 0 : parseInt(clean, 10));
                }}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-none font-number font-bold text-neutral-800"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1">Target Date Deadline</label>
              <input
                type="date"
                required
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-none text-neutral-650 font-number"
              />
            </div>

            {targetAmt > 0 && (
              <p className="text-[10px] text-emerald-800 bg-emerald-50 px-3 py-2 rounded-lg leading-relaxed font-sans font-light">
                ✨ Estimated rate: Save <strong>₹{getMonthsInstallment(targetAmt, deadlineDate).toLocaleString('en-IN')}/mo</strong> to meet this deadline buffer.
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-neutral-900 hover:bg-neutral-850 text-white font-bold text-xs py-3 rounded-xl cursor-pointer text-center flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" /> Create Goal Basket
            </button>
          </form>
        </div>

      </div>

      {/* CHUNK ALLOCATION CONFIRMATION INPUT MODAL */}
      <AnimatePresence>
        {depositGoalId && (
          <div className="fixed inset-0 bg-neutral-950/75 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-neutral-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative font-sans text-center"
            >
              <button
                onClick={() => setDepositGoalId(null)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-0.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mx-auto rounded-xl border border-emerald-200/50 mb-3.5">
                💰
              </div>

              <h3 className="text-base font-bold text-neutral-900 tracking-tight mb-2">Review Savings Allocation</h3>
              
              <p className="text-xs text-neutral-500 leading-relaxed font-light mb-4.5">
                Drafting allocation towards: <br />
                <strong className="text-neutral-850 font-semibold">"{goals.find(g => g.id === depositGoalId)?.name}"</strong>
              </p>

              <div className="space-y-4 font-sans text-left bg-neutral-50 border border-neutral-100 p-4 rounded-2xl mb-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-wide font-extrabold text-neutral-400 mb-1">Enter Allocation size (₹)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={depositAmount === 0 ? '' : depositAmount}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^0-9]/g, '');
                      setAmountValue(clean === '' ? 0 : parseInt(clean, 10));
                    }}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs focus:border-neutral-900 focus:outline-none font-number font-bold text-neutral-800"
                  />
                </div>
                
                <p className="text-[10px] text-neutral-450 leading-snug font-light font-sans">
                  * Note: Clicking commit will add ₹{depositAmount} to the basket ledger AND automatically create a standard tracked entry of type 'Saving' under your actual expense history, making it completely synchronized with family statistics!
                </p>
              </div>

              <div className="flex gap-2 font-sans">
                <button
                  onClick={() => setDepositGoalId(null)}
                  className="flex-1 bg-white border border-neutral-200/80 hover:bg-neutral-50 text-neutral-700 py-3 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCommitDeposit}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-850 text-white py-3 rounded-lg text-xs font-bold shadow-sm cursor-pointer transition-all"
                >
                  Confirm & Commit
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );

  function setAmountValue(val: number) {
    setDepositAmount(val);
  }
}

// Minimal placeholder component for closing button since lucide import was slightly changed
function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
