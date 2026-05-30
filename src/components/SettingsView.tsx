import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Save, 
  RefreshCw, 
  ArrowLeft,
  Users, 
  CreditCard, 
  Coins, 
  PiggyBank, 
  Settings, 
  ShieldAlert, 
  Download,
  Info,
  Sliders,
  CheckCircle,
  FolderSymlink,
  ExternalLink
} from 'lucide-react';
import { 
  getProfile, 
  setProfile, 
  getCategories, 
  setCategories, 
  getGoals, 
  setGoals, 
  getExpenses, 
  setExpenses,
  clearAllDataFlag,
  seedSampleData,
  DEFAULT_CATEGORIES
} from '../storage';
import { 
  BudgetyProfile, 
  CustomCategory, 
  SavingsGoal, 
  IncomeSource, 
  FixedCommitment, 
  Expense 
} from '../types';

interface SettingsViewProps {
  onNavigate: (route: string) => void;
  onLogout: () => void;
  selectedMonth: string;
}

export default function SettingsView({ onNavigate, onLogout, selectedMonth }: SettingsViewProps) {
  
  // Base state bindings
  const [profile, setProfileState] = useState<BudgetyProfile | null>(null);
  const [categories, setCategoriesState] = useState<CustomCategory[]>([]);
  const [goals, setGoalsState] = useState<SavingsGoal[]>([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Inline forms
  // For Income Addition
  const [incName, setIncName] = useState('');
  const [incAmount, setIncAmount] = useState<number>(20000);
  const [incType, setIncType] = useState<'Fixed' | 'Variable'>('Fixed');
  const [incDay, setIncDay] = useState(1);

  // For Commitment Addition
  const [fixName, setFixName] = useState('');
  const [fixAmount, setFixAmount] = useState<number>(3000);

  // For Category Addition
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'Need' | 'Want' | 'Saving'>('Need');
  const [catLimit, setCatLimit] = useState<number>(4000);

  // For Goal Addition
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState<number>(30000);
  const [goalDeadline, setGoalDeadline] = useState('2026-12-31');

  // Trigger loads
  useEffect(() => {
    setProfileState(getProfile());
    setCategoriesState(getCategories());
    setGoalsState(getGoals());
  }, []);

  const triggerSuccess = (text: string) => {
    setSuccessMsg(text);
    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  // 1. UPDATE FAMILY SIZE & NOTIFICATIONS
  const handleUpdateFamilyAndAlerts = (size: number, alerts: boolean) => {
    if (!profile) return;
    const updated: BudgetyProfile = {
      ...profile,
      familySize: size,
      alertsEnabled: alerts
    };
    setProfile(updated);
    setProfileState(updated);
    triggerSuccess('Family size and alerts updated successfully!');
  };

  // 2. INCOME MANAGER CORES
  const handleAddIncome = () => {
    if (!profile || !incName.trim() || !incAmount) return;
    
    const newInc: IncomeSource = {
      id: 'inc-' + Date.now(),
      sourceName: incName,
      amount: incAmount,
      type: incType,
      arrivalDate: incDay,
      arrived: true
    };

    const updatedProfile = {
      ...profile,
      incomeSources: [...profile.incomeSources, newInc]
    };

    setProfile(updatedProfile);
    setProfileState(updatedProfile);
    setIncName('');
    triggerSuccess('Income source added!');
  };

  const handleRemoveIncome = (id: string) => {
    if (!profile) return;
    const filteredIncomes = profile.incomeSources.filter(i => i.id !== id);
    const updatedProfile = {
      ...profile,
      incomeSources: filteredIncomes
    };
    setProfile(updatedProfile);
    setProfileState(updatedProfile);
    triggerSuccess('Income source removed.');
  };

  // 3. FIXED COMMITMENTS CORES
  const handleAddCommitment = () => {
    if (!profile || !fixName.trim() || !fixAmount) return;

    const newCommit: FixedCommitment = {
      id: 'fix-' + Date.now(),
      name: fixName,
      amount: fixAmount,
      paid: true
    };

    const updatedProfile = {
      ...profile,
      fixedCommitments: [...profile.fixedCommitments, newCommit]
    };

    setProfile(updatedProfile);
    setProfileState(updatedProfile);
    setFixName('');
    triggerSuccess('Fixed commitment added!');
  };

  const handleRemoveCommitment = (id: string) => {
    if (!profile) return;
    const filteredCommits = profile.fixedCommitments.filter(c => c.id !== id);
    const updatedProfile = {
      ...profile,
      fixedCommitments: filteredCommits
    };
    setProfile(updatedProfile);
    setProfileState(updatedProfile);
    triggerSuccess('Fixed commitment removed.');
  };

  // 4. CUSTOM CATEGORY CORES
  const handleAddCategory = () => {
    if (!catName.trim() || !catLimit) return;
    const newCat: CustomCategory = {
      id: 'cat-' + Date.now(),
      name: catName,
      type: catType,
      monthlyBudgetLimit: catLimit
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    setCategoriesState(updated);
    setCatName('');
    triggerSuccess(`Category "${newCat.name}" added!`);
  };

  const handleRemoveCategory = (id: string) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    setCategoriesState(updated);
    triggerSuccess('Category removed.');
  };

  // 5. SAVINGS GOAL CORES
  const handleAddGoal = () => {
    if (!goalName.trim() || !goalTarget) return;
    const newGoal: SavingsGoal = {
      id: 'goal-' + Date.now(),
      name: goalName,
      targetAmount: goalTarget,
      targetDate: goalDeadline,
      savedAmount: 0
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    setGoalsState(updated);
    setGoalName('');
    triggerSuccess(`Savings target "${newGoal.name}" configured!`);
  };

  const handleRemoveGoal = (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    setGoalsState(updated);
    triggerSuccess('Savings goal removed.');
  };

  // 6. EXPORT / BACKUP JSON CORES
  const handleExportJSON = () => {
    // Generate text dump
    const dump = {
      profile,
      categories,
      goals,
      expenses: getExpenses()
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dump, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `BUDGETY_Report_${selectedMonth}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // 7. POWER RESET OPERATIONS (Reset month data or complete wipeout)
  const handleResetMonthData = () => {
    const confirm = window.confirm(
      '⚠️ ALERT: Are you sure you want to clear your expense logs for this month? (Incomes, goals, and assets stay unchanged.)'
    );
    if (confirm) {
      const expensesFiltered = getExpenses().filter(e => !e.date.startsWith(selectedMonth));
      setExpenses(expensesFiltered);
      triggerSuccess('Current month expense statistics cleared.');
    }
  };

  const handleMasterWipeout = () => {
    const confirm = window.confirm(
      '🔥 WARNING: This will completely delete all profiles, incomes, categories, goals, and history. This is IRREVERSIBLE. Proceed?'
    );
    if (confirm) {
      clearAllDataFlag();
      onLogout();
    }
  };

  // Standard recommended category picks for suggestions
  const suggestedPicks = ['Chitti Return EMI', 'Medical Refill', 'School Reopening', 'Festival Gold', 'Pocket Money', 'Petrol for Scooty', 'Family Mandi Groceries'];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 font-sans">
      
      {/* Top Title Controls */}
      <div className="flex justify-between items-center bg-white border border-neutral-200/80 p-5 rounded-2xl shadow-xs mb-8">
        <div className="text-left font-sans">
          <h2 className="text-xl font-black text-neutral-900 tracking-tight">Setup Configurator</h2>
          <p className="text-neutral-500 text-xs mt-0.5 font-light">Fine-tune family limits, income buffers, or safety margins.</p>
        </div>
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-xs font-bold text-neutral-800 hover:text-neutral-900 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Setup
        </button>
      </div>

      {/* Success banner notifications */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs flex gap-3 items-center font-bold tracking-normal leading-relaxed"
          >
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT NAV PANEL - Core parameters, family, notifications, resets */}
        <div className="space-y-6 md:col-span-1">
          
          {/* PROFILE CARD */}
          {profile && (
            <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center font-bold text-white text-base font-mono">
                  {profile.name[0]}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-neutral-800">{profile.name}</h4>
                  <span className="text-[10px] text-neutral-450 block font-light">{profile.email}</span>
                </div>
              </div>

              {/* Family Size selector */}
              <div className="space-y-4 pt-3 border-t border-neutral-100 font-sans">
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <label className="text-neutral-500 font-medium">Family Size Selector</label>
                    <span className="font-bold text-neutral-900 font-mono">{profile.familySize} Members</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={profile.familySize}
                    onChange={(e) => handleUpdateFamilyAndAlerts(Number(e.target.value), profile.alertsEnabled)}
                    className="w-full accent-neutral-950 h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Notification Alerts status */}
                <div className="flex justify-between items-center text-xs pt-2">
                  <label className="text-neutral-500 font-medium font-sans">Household Risk Toggles</label>
                  <button
                    onClick={() => handleUpdateFamilyAndAlerts(profile.familySize, !profile.alertsEnabled)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${profile.alertsEnabled ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 border border-neutral-200'}`}
                  >
                    {profile.alertsEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DANGER AND EXPORT CONSOLES */}
          <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-widest font-mono mb-2">Power Operations</h4>
            
            <button
              onClick={handleExportJSON}
              className="w-full text-xs font-semibold bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border border-neutral-200 py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export Report (JSON)
            </button>

            <button
              onClick={handleResetMonthData}
              className="w-full text-xs font-semibold bg-neutral-50 hover:bg-rose-50 text-rose-800 border border-neutral-200 hover:border-rose-250 py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Reset Month Data
            </button>

            <button
              onClick={handleMasterWipeout}
              className="w-full text-xs font-bold bg-neutral-900 hover:bg-rose-900 hover:opacity-95 text-white py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Complete Reset Wipeout
            </button>
          </div>

          {/* ABOUT BUDGETY CARD */}
          <div className="bg-neutral-900 text-neutral-400 p-5 rounded-2xl shadow-xs font-sans text-xs flex flex-col justify-between">
            <div>
              <span className="font-extrabold text-white tracking-widest block mb-1">ABOUT BUDGETY</span>
              <p className="font-light leading-relaxed mb-3">
                BUDGETY is a 100% secure, offline-safe local budgeting companion designed for Indian households. No cookies, no external API queries, completely sandboxed.
              </p>
              <div className="bg-neutral-800 p-3 rounded-lg text-[10px] text-neutral-300 border border-neutral-700/50 leading-relaxed font-mono">
                ✨ "Savings counts as paying your future self. Budgeting gives you safe peace of mind."
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT EDIT PANELS - Incomes, Commitments, Custom Categories, Savings Goals */}
        <div className="space-y-6 md:col-span-2">
          
          {/* INCOME SOURCE EDIT CONSOLE */}
          {profile && (
            <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Coins className="w-5 h-5 text-neutral-800" />
                <h3 className="text-sm font-bold text-neutral-900 tracking-tight">Verify Income Channels</h3>
              </div>

              {/* Inline input form */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 flex flex-wrap gap-3 items-end mb-4 font-sans">
                <div className="flex-1 min-w-[130px]">
                  <label className="block text-[10px] text-neutral-400 font-bold uppercase mb-1">Source Name</label>
                  <input
                    type="text"
                    placeholder="Salary, Pension, Shop, etc."
                    value={incName}
                    onChange={(e) => setIncName(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>
                <div className="w-[124px]">
                  <label className="block text-[10px] text-neutral-400 font-bold uppercase mb-1">Amount (₹)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={incAmount === 0 ? '' : incAmount}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^0-9]/g, '');
                      setIncAmount(clean === '' ? 0 : parseInt(clean, 10));
                    }}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs focus:outline-none font-number font-bold text-neutral-800"
                  />
                </div>
                <div className="w-[110px]">
                  <label className="block text-[10px] text-neutral-400 font-bold uppercase mb-1">Style</label>
                  <select
                    value={incType}
                    onChange={(e) => setIncType(e.target.value as 'Fixed' | 'Variable')}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="Fixed">Fixed</option>
                    <option value="Variable">Variable</option>
                  </select>
                </div>
                <button
                  onClick={handleAddIncome}
                  id="btn-settings-add-income"
                  disabled={!incName.trim()}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white p-2.5 rounded-lg transition-all h-9 flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Added Income List */}
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {profile.incomeSources.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-neutral-50 px-3.5 py-2 rounded-xl border border-neutral-200/50">
                    <div>
                      <span className="text-xs font-bold text-neutral-800">{item.sourceName}</span>
                      <span className="text-[9px] bg-neutral-100 text-neutral-500 px-1 py-0.2 rounded ml-1.5 font-bold font-mono tracking-wider">{item.type}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-neutral-900 font-number">₹{item.amount.toLocaleString('en-IN')}</span>
                      <button
                        onClick={() => handleRemoveIncome(item.id)}
                        className="text-neutral-400 hover:text-neutral-900 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FIXED COMMITMENTS EDIT CONSOLE */}
          {profile && (
            <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-neutral-800" />
                <h3 className="text-sm font-bold text-neutral-900 tracking-tight">Adjust Fixed Monthly Outflows</h3>
              </div>

              {/* Inline input form */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 flex flex-wrap gap-3 items-end mb-4 font-sans">
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-[10px] text-neutral-400 font-bold uppercase mb-1">Commitment Label</label>
                  <input
                    type="text"
                    placeholder="e.g., House Rent, Bike EMI"
                    value={fixName}
                    onChange={(e) => setFixName(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>
                <div className="w-[150px]">
                  <label className="block text-[10px] text-neutral-400 font-bold uppercase mb-1">Monthly Amount (₹)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={fixAmount === 0 ? '' : fixAmount}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^0-9]/g, '');
                      setFixAmount(clean === '' ? 0 : parseInt(clean, 10));
                    }}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs focus:outline-none font-number font-bold text-neutral-800"
                  />
                </div>
                <button
                  onClick={handleAddCommitment}
                  id="btn-settings-add-commitment"
                  disabled={!fixName.trim()}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white p-2.5 rounded-lg transition-all h-9 flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Added comm list */}
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {profile.fixedCommitments.length === 0 ? (
                  <p className="text-[10px] text-neutral-400 italic text-center py-2 font-light">No fixed monthly commitments mapped.</p>
                ) : (
                  profile.fixedCommitments.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-neutral-50 px-3.5 py-2 rounded-xl border border-neutral-200/50">
                      <span className="text-xs font-semibold text-neutral-800">{item.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black font-number">₹{item.amount.toLocaleString('en-IN')}</span>
                        <button
                          onClick={() => handleRemoveCommitment(item.id)}
                          className="text-neutral-400 hover:text-neutral-900 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* CUSTOM CATEGORY EDIT CONSOLE */}
          <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Sliders className="w-5 h-5 text-neutral-800" />
              <h3 className="text-sm font-bold text-neutral-900 tracking-tight">Household Categories & Limits</h3>
            </div>
            
            {/* Recommendations guide */}
            <div className="mb-4">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-2">Popular Suggested additions (Click to configure)</span>
              <div className="flex flex-wrap gap-1.5">
                {suggestedPicks.map((pick, id) => (
                  <button
                    key={id}
                    onClick={() => {
                      setCatName(pick);
                      setCatType(pick.includes('EM') || pick.includes('Rent') || pick.includes('Medic') ? 'Need' : 'Want');
                    }}
                    className="text-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer"
                  >
                    🏷️ {pick}
                  </button>
                ))}
              </div>
            </div>

            {/* Inline input form */}
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 flex flex-wrap gap-3 items-end mb-4 font-sans">
              <div className="flex-1 min-w-[130px]">
                <label className="block text-[10px] text-neutral-400 font-bold uppercase mb-1">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g., Pocket Money, Festival"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs focus:outline-none"
                />
              </div>
              <div className="w-[110px]">
                <label className="block text-[10px] text-neutral-400 font-bold uppercase mb-1">Group Type</label>
                <select
                  value={catType}
                  onChange={(e) => setCatType(e.target.value as any)}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs focus:outline-none"
                >
                  <option value="Need">Need</option>
                  <option value="Want">Want</option>
                  <option value="Saving">Saving</option>
                </select>
              </div>
              <div className="w-[120px]">
                <label className="block text-[10px] text-neutral-400 font-bold uppercase mb-1">Monthly Budget (₹)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={catLimit === 0 ? '' : catLimit}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, '');
                    setCatLimit(clean === '' ? 0 : parseInt(clean, 10));
                  }}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs focus:outline-none font-number font-bold text-neutral-800"
                />
              </div>
              <button
                onClick={handleAddCategory}
                id="btn-settings-add-category"
                disabled={!catName.trim()}
                className="bg-neutral-900 hover:bg-neutral-800 text-white p-2.5 rounded-lg transition-all h-9 flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Added Category list */}
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {categories.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-neutral-50 px-3.5 py-2 rounded-xl border border-neutral-200/50">
                  <div>
                    <span className="text-xs font-bold text-neutral-800">{item.name}</span>
                    <span className={`text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded ml-1.5 ${item.type === 'Need' ? 'bg-neutral-100 text-neutral-600' : item.type === 'Want' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-800'}`}>
                      {item.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-neutral-500">Max limit: <strong className="text-neutral-800 font-number">₹{item.monthlyBudgetLimit.toLocaleString('en-IN')}</strong></span>
                    <button
                      onClick={() => handleRemoveCategory(item.id)}
                      className="text-neutral-400 hover:text-rose-600 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SAVINGS GOALS EDIT CONSOLE */}
          <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <PiggyBank className="w-5 h-5 text-neutral-800" />
              <h3 className="text-sm font-bold text-neutral-900 tracking-tight">Formulate Savings Goals</h3>
            </div>

            {/* Inline input form */}
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 flex flex-wrap gap-3 items-end mb-4 font-sans animate-fade">
              <div className="flex-1 min-w-[110px]">
                <label className="block text-[10px] text-neutral-400 font-bold uppercase mb-1">Goal Purpose</label>
                <input
                  type="text"
                  placeholder="e.g., Emergencies, House"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs focus:outline-none"
                />
              </div>
              <div className="w-[110px]">
                <label className="block text-[10px] text-neutral-400 font-bold uppercase mb-1">Target Amount (₹)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={goalTarget === 0 ? '' : goalTarget}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, '');
                    setGoalTarget(clean === '' ? 0 : parseInt(clean, 10));
                  }}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs focus:outline-none font-number font-bold text-neutral-800"
                />
              </div>
              <div className="w-[115px]">
                <label className="block text-[10px] text-neutral-400 font-bold uppercase mb-1">Deadline Date</label>
                <input
                  type="date"
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs focus:outline-none font-mono font-bold"
                />
              </div>
              <button
                onClick={handleAddGoal}
                id="btn-settings-add-goal"
                disabled={!goalName.trim()}
                className="bg-neutral-900 hover:bg-neutral-800 text-white p-2.5 rounded-lg transition-all h-9 flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Added Goals list */}
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {goals.length === 0 ? (
                <p className="text-[10px] text-neutral-400 italic text-center py-2 font-light">No savings goals formatted yet.</p>
              ) : (
                goals.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-neutral-50 px-3.5 py-2 rounded-xl border border-neutral-200/50">
                    <div>
                      <span className="text-xs font-bold text-neutral-800">{item.name}</span>
                      <span className="text-[9px] text-neutral-400 pl-2 font-mono">By {item.targetDate}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black font-number">₹{item.targetAmount.toLocaleString('en-IN')}</span>
                      <button
                        onClick={() => handleRemoveGoal(item.id)}
                        className="text-neutral-400 hover:text-rose-600 p-0.5"
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

    </div>
  );
}
