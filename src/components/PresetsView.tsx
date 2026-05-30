import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle, 
  TrendingUp, 
  PiggyBank, 
  Coins, 
  ArrowRight,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { getProfile, getCategories, setCategories, setProfile } from '../storage';
import { BudgetyProfile, CustomCategory } from '../types';

interface PresetsViewProps {
  onNavigate: (route: string) => void;
  selectedMonth: string;
}

interface BudgetRatioPreset {
  name: string;
  ratios: { needs: number; wants: number; savings: number };
  badge: string;
  context: string;
}

export default function PresetsView({ onNavigate, selectedMonth }: PresetsViewProps) {
  const [profile, setProfileState] = useState<BudgetyProfile | null>(null);
  const [categoriesList, setCategoriesList] = useState<CustomCategory[]>([]);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [presetAppliedMessage, setPresetAppliedMessage] = useState<string | null>(null);
  const [selectedRatioIndex, setSelectedRatioIndex] = useState<number>(0);

  // Budget ratios list representing different financial positions
  const ratioPresets: BudgetRatioPreset[] = [
    { 
      name: "The Classic 50-30-20 Plan", 
      ratios: { needs: 0.50, wants: 0.30, savings: 0.20 }, 
      badge: "Balanced Strategy",
      context: "50% Essentals, 30% Lifestyle choices, 20% future security. Best standard balance for solid earners." 
    },
    { 
      name: "The High-Need 70-20-10 Plan", 
      ratios: { needs: 0.70, wants: 0.10, savings: 0.20 }, 
      badge: "High Debt / Low Income",
      context: "70% Essentals, 10% minimal personal wants, 20% active debt repayment & emergency buffer." 
    },
    { 
      name: "The Wealth-Builder 35-25-40 Plan", 
      ratios: { needs: 0.35, wants: 0.25, savings: 0.40 }, 
      badge: "Aggressive Savings",
      context: "35% Essentals, 25% humble lifestyle, 40% high velocity long-term investment allocation." 
    },
    { 
      name: "The Simplified 80-20 Plan", 
      ratios: { needs: 0.60, wants: 0.20, savings: 0.20 }, 
      badge: "Easy Structure",
      context: "60% Essentials, 20% general Wants. Saves a clean 20% immediately off the top with no strict sub-categories." 
    }
  ];

  useEffect(() => {
    const prof = getProfile();
    setProfileState(prof);
    setCategoriesList(getCategories());
    
    if (prof) {
      const incSum = prof.incomeSources.reduce((sum, s) => sum + s.amount, 0);
      setTotalIncome(incSum || 30000);
    } else {
      setTotalIncome(30000);
    }
  }, []);

  // Compute active split values
  const activePreset = ratioPresets[selectedRatioIndex];
  const needsLimit = Math.round(totalIncome * activePreset.ratios.needs);
  const wantsLimit = Math.round(totalIncome * activePreset.ratios.wants);
  const savingsLimit = Math.round(totalIncome * activePreset.ratios.savings);

  // Apply chosen ratio to categories in storage
  const handleApplyPreset = (index: number) => {
    setSelectedRatioIndex(index);
    const chosen = ratioPresets[index];
    const curCats = [...categoriesList];
    
    const needsCats = curCats.filter(c => c.type === 'Need');
    const wantsCats = curCats.filter(c => c.type === 'Want');

    const calculatedNeedsLimit = Math.round(totalIncome * chosen.ratios.needs);
    const calculatedWantsLimit = Math.round(totalIncome * chosen.ratios.wants);

    const singleNeedShare = needsCats.length > 0 ? Math.round(calculatedNeedsLimit / needsCats.length) : 0;
    const singleWantShare = wantsCats.length > 0 ? Math.round(calculatedWantsLimit / wantsCats.length) : 0;

    const updatedCats = curCats.map(cat => {
      if (cat.type === 'Need') {
        return { ...cat, monthlyBudgetLimit: singleNeedShare };
      } else if (cat.type === 'Want') {
        return { ...cat, monthlyBudgetLimit: singleWantShare };
      }
      return cat;
    });

    setCategories(updatedCats);
    setCategoriesList(updatedCats);
    
    setPresetAppliedMessage(`Applied ${chosen.name} ratios to your Category Lockouts!`);
    setTimeout(() => setPresetAppliedMessage(null), 4000);
  };

  // List of standard secure investment recommendations in India
  const investmentSuggestions = [
    {
      name: "Nifty 50 Index Mutual Funds",
      type: "Equity / Direct Stocks",
      risk: "Moderate-High",
      returns: "12% - 15% CAGR",
      minSip: "₹500 / month",
      context: "Best tool for compounding wealth over 5+ year terms. Auto-invests in India's top 50 mega corporations safely."
    },
    {
      name: "Public Provident Fund (PPF)",
      type: "Sovereign Debt",
      risk: "Zero Risk",
      returns: "7.1% (Tax-Free)",
      minSip: "₹500 / year",
      context: "Government-backed retirement scheme. Interest earned is completely exempt from income tax (EEE status)."
    },
    {
      name: "National Pension System (NPS)",
      type: "Pension Fund",
      risk: "Low-Moderate",
      returns: "9% - 11% CAGR",
      minSip: "₹500 / month",
      context: "Coversion of debt & bluechip stocks with extra ₹50k tax deductions under Sec 80CCD(1B) guidelines."
    },
    {
      name: "Recurring / Fixed Deposit",
      type: "Bank Security",
      risk: "Extremely Low",
      returns: "6.5% - 7.5% Secured",
      minSip: "₹1,000",
      context: "Good for short term targets under 1 year. Protects cash from inflation while maintaining total liquidity."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans">
      
      {/* Title block */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-neutral-200/80 p-5 rounded-2xl shadow-xs text-left">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-neutral-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Presets
          </h2>
          <p className="text-xs text-neutral-500 font-light mt-0.5">
            Calibrate your income lockouts mathematically.
          </p>
        </div>
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-4.5 py-2 shrink-0">
          <span className="text-[9px] uppercase font-bold tracking-wider text-neutral-450 block mb-0.5">My Locked Income</span>
          <span className="text-sm font-black text-neutral-800 font-mono">
            ₹{totalIncome.toLocaleString('en-IN')} /mo
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMN 1 & 2: PERCENT PRESET SELECTION */}
        <div className="lg:col-span-2 space-y-5 text-left">
          
          <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider pb-3 border-b border-neutral-100 mb-4">
              🎯 Choose Your Percentage Lockout Presets
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {ratioPresets.map((preset, idx) => {
                const isActive = selectedRatioIndex === idx;
                return (
                  <button
                    key={preset.name}
                    onClick={() => handleApplyPreset(idx)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-36 ${isActive ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm' : 'bg-neutral-50 hover:bg-neutral-100/50 border-neutral-200/60'}`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-1.5">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${isActive ? 'bg-amber-400 text-neutral-950' : 'bg-neutral-200/60 text-neutral-700'}`}>
                          {preset.badge}
                        </span>
                        <span className="text-[11px] font-bold font-mono">
                          {preset.ratios.needs * 100}% · {preset.ratios.wants * 100}% · {preset.ratios.savings * 100}%
                        </span>
                      </div>
                      <h4 className="text-xs font-black tracking-tight block leading-tight">{preset.name}</h4>
                    </div>
                    <p className={`text-[10px] leading-relaxed font-light mt-2 line-clamp-2 ${isActive ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {preset.context}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Dynamic visual preview of the selected ratio */}
            <div className="bg-neutral-50/70 border border-neutral-200/55 p-5 rounded-xl mt-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-neutral-800">
                  Allocation Breakdown under <span className="underline">{activePreset.name}</span>:
                </span>
                <span className="text-[10px] text-neutral-400">Ratios update locks automatically</span>
              </div>

              {/* Progress bar visual split */}
              <div className="h-4 p-0.5 bg-neutral-200 rounded-full flex overflow-hidden w-full">
                <div 
                  style={{ width: `${activePreset.ratios.needs * 100}%` }} 
                  className="bg-neutral-900 h-full flex items-center justify-center transition-all duration-500 rounded-l-full"
                  title="Needs"
                />
                <div 
                  style={{ width: `${activePreset.ratios.wants * 100}%` }} 
                  className="bg-amber-400 h-full flex items-center justify-center transition-all duration-500"
                  title="Wants"
                />
                <div 
                  style={{ width: `${activePreset.ratios.savings * 100}%` }} 
                  className="bg-emerald-500 h-full flex items-center justify-center transition-all duration-500 rounded-r-full"
                  title="Savings"
                />
              </div>

              {/* Price Splits Display */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="text-center sm:text-left">
                  <span className="text-[9px] font-bold uppercase block text-neutral-450">Needs Needs ({activePreset.ratios.needs * 100}%)</span>
                  <span className="text-xs font-black text-neutral-900 font-mono">₹{needsLimit.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-center sm:text-left">
                  <span className="text-[9px] font-bold uppercase block text-neutral-450">Personal Wants ({activePreset.ratios.wants * 100}%)</span>
                  <span className="text-xs font-black text-amber-900 font-mono">₹{wantsLimit.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-center sm:text-left">
                  <span className="text-[9px] font-bold uppercase block text-neutral-450">Target Savings ({activePreset.ratios.savings * 100}%)</span>
                  <span className="text-xs font-black text-emerald-850 font-mono">₹{savingsLimit.toLocaleString('en-IN')}</span>
                </div>
              </div>

            </div>

            <AnimatePresence>
              {presetAppliedMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl text-center border border-emerald-100"
                >
                  ✓ {presetAppliedMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* COLUMN 3: COMMON SECURE INVESTMENT SUGGESTIONS */}
        <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-sm text-left h-fit">
          <div className="pb-3 border-b border-neutral-100 mb-4 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-neutral-850" />
            <h3 className="text-sm font-bold text-neutral-950 uppercase tracking-tight">
              💼 Common Investment Assets
            </h3>
          </div>

          <p className="text-[11px] text-neutral-500 font-light mb-4 leading-relaxed">
            Where should your <strong className="text-neutral-700">₹{savingsLimit.toLocaleString('en-IN')}</strong> target savings go? Here are the standard, lowest cost options in India for long-term growth:
          </p>

          <div className="space-y-3.5">
            {investmentSuggestions.map((asset) => (
              <div key={asset.name} className="p-3 bg-neutral-50 hover:bg-neutral-100/40 rounded-xl border border-neutral-200/50 space-y-1.5 text-xs transition-all">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-neutral-900 tracking-tight block">{asset.name}</span>
                  <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded font-bold">
                    {asset.returns}
                  </span>
                </div>
                <div className="flex gap-4 text-[9px] text-neutral-400 uppercase font-bold tracking-wide">
                  <span>Risk Level: {asset.risk}</span>
                  <span>·</span>
                  <span>Min SIP: {asset.minSip}</span>
                </div>
                <p className="text-[10px] text-neutral-500 font-light leading-normal leading-relaxed">
                  {asset.context}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200/60 p-3.5 rounded-xl mt-5 text-[11px] leading-relaxed text-amber-950 font-sans font-light">
            <span className="font-bold text-amber-900 block mb-0.5">⚠️ No advisory risk</span>
            These options are general educational references for broad planning. We recommend researching direct platforms or talking to certified specialists before committing actual capital.
          </div>
        </div>

      </div>

    </div>
  );
}
