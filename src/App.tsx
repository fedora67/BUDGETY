/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getProfile, 
  getUserAuth, 
  setUserAuth, 
  setProfile, 
  hasSampleDataEnabled, 
  getMonthHistory, 
  setMonthHistory, 
  getExpenses, 
  setExpenses,
  clearSampleData,
  getScratchpadNote,
  setScratchpadNote
} from './storage';
import { UserAuth, BudgetyProfile, PastMonthSummary, Expense } from './types';
import LandingView from './components/LandingView';
import LoginView from './components/LoginView';
import SignupView from './components/SignupView';
import OnboardingView from './components/OnboardingView';
import DashboardView from './components/DashboardView';
import ExpensesView from './components/ExpensesView';
import SettingsView from './components/SettingsView';
import GoalsView from './components/GoalsView';
import PresetsView from './components/PresetsView';
import BillsView from './components/BillsView';
import { 
  LogOut, 
  TrendingUp, 
  LayoutDashboard, 
  CreditCard, 
  Settings, 
  Calendar, 
  RefreshCw,
  XCircle,
  Sparkles,
  Target,
  FileSpreadsheet,
  FileText,
  ChevronLeft,
  ChevronRight,
  Menu,
  ChevronDown,
  X,
  Users,
  ReceiptText
} from 'lucide-react';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('landing');
  const [user, setUser] = useState<UserAuth | null>(null);
  const [profile, setProfileState] = useState<BudgetyProfile | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-05');
  const [showSeedBanner, setShowSeedBanner] = useState<boolean>(false);
  const [showResetSimulation, setShowResetSimulation] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('budgety_sidebar_collapsed') === 'true';
  });
  
  // Floating global side-notepad state
  const [rightNotepadOpen, setRightNotepadOpen] = useState<boolean>(false);
  const [globalNoteContent, setGlobalNoteContent] = useState<string>(() => {
    try {
      return getScratchpadNote().content;
    } catch {
      return '';
    }
  });

  // Sync global notes pad with updates
  useEffect(() => {
    const handleNotesUpdate = () => {
      try {
        setGlobalNoteContent(getScratchpadNote().content);
      } catch {}
    };
    window.addEventListener('budgety_notes_updated', handleNotesUpdate);
    return () => window.removeEventListener('budgety_notes_updated', handleNotesUpdate);
  }, []);

  const handleGlobalNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setGlobalNoteContent(text);
    const updated = {
      content: text,
      timestamp: new Date().toISOString()
    };
    setScratchpadNote(updated);
    // Dispatch event to keep pages in sync
    window.dispatchEvent(new Event('budgety_notes_updated'));
  };

  const toggleSidebar = () => {
    const nextVal = !sidebarCollapsed;
    setSidebarCollapsed(nextVal);
    localStorage.setItem('budgety_sidebar_collapsed', String(nextVal));
  };

  // Load user auth and profile parameters on build
  const loadStateFromStorage = () => {
    setUser(getUserAuth());
    setProfileState(getProfile());
    setShowSeedBanner(hasSampleDataEnabled());
  };

  useEffect(() => {
    loadStateFromStorage();

    // Setup active hash listener for multi-page simulation
    const handleHashChange = () => {
      const hash = window.location.hash;
      const auth = getUserAuth();

      if (!auth || !auth.loggedIn) {
        if (hash === '#/signup') {
          setCurrentRoute('signup');
        } else if (hash === '#/login') {
          setCurrentRoute('login');
        } else {
          setCurrentRoute('landing');
        }
      } else {
        const prof = getProfile();
        if (!prof || !prof.onboarded) {
          setCurrentRoute('onboarding');
        } else {
          if (hash === '#/expenses') {
            setCurrentRoute('expenses');
          } else if (hash === '#/settings') {
            setCurrentRoute('settings');
          } else if (hash === '#/goals') {
            setCurrentRoute('goals');
          } else if (hash === '#/presets') {
            setCurrentRoute('presets');
          } else if (hash === '#/dashboard') {
            setCurrentRoute('dashboard');
          } else if (hash === '#/bills') {
            setCurrentRoute('bills');
          } else {
            setCurrentRoute('expenses');
          }
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // run initial matching
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash route change manually
  const navigateTo = (route: string) => {
    if (route === 'landing') window.location.hash = '#/';
    else if (route === 'login') window.location.hash = '#/login';
    else if (route === 'signup') window.location.hash = '#/signup';
    else if (route === 'onboarding') window.location.hash = '#/onboarding';
    else if (route === 'dashboard') window.location.hash = '#/dashboard';
    else if (route === 'expenses') window.location.hash = '#/expenses';
    else if (route === 'settings') window.location.hash = '#/settings';
    else if (route === 'goals') window.location.hash = '#/goals';
    else if (route === 'presets') window.location.hash = '#/presets';
    else if (route === 'bills') window.location.hash = '#/bills';
  };

  const handleLoginSuccess = (name: string, email: string) => {
    loadStateFromStorage();
    const prof = getProfile();
    if (!prof || !prof.onboarded) {
      navigateTo('onboarding');
    } else {
      navigateTo('expenses');
    }
  };

  const handleSignupSuccess = (name: string, email: string) => {
    loadStateFromStorage();
    navigateTo('onboarding');
  };

  const handleOnboardingComplete = () => {
    loadStateFromStorage();
    navigateTo('expenses');
  };

  const handleLogout = () => {
    setUserAuth(null);
    setUser(null);
    navigateTo('landing');
  };

  // MONTHLY RESET LOGIC SIMULATION
  // Roll forward from May 2026 to June 2026
  const triggerMonthlyResetSimulation = () => {
    const expensesObj = getExpenses();
    const profileObj = getProfile();
    if (!profileObj) return;

    // 1. Calculate past month summaries (May 2026)
    const baseIncome = profileObj.incomeSources.reduce((sum, s) => sum + s.amount, 0) || 0;
    const currentMonthExpenses = expensesObj.filter(e => e.date.startsWith('2026-05'));
    
    const spentNeeds = currentMonthExpenses
      .filter(e => e.type === 'Need')
      .reduce((sum, e) => sum + e.amount, 0);

    const spentWants = currentMonthExpenses
      .filter(e => e.type === 'Want')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalSpent = spentNeeds + spentWants;

    const totalSaved = currentMonthExpenses
      .filter(e => e.type === 'Saving')
      .reduce((sum, e) => sum + e.amount, 0);

    // Compute category breakdowns
    const categoriesMapped: Record<string, number> = {};
    const categoriesDefault = ['Groceries & Food', 'Transport & Fuel', 'Electricity & Bills', 'Medical & Health', 'School & Education', 'Clothes & Shopping', 'Movies & Entertainment', 'Tea & Snacks', 'Restaurant & Eating Out'];
    categoriesDefault.forEach(name => {
      categoriesMapped[name] = currentMonthExpenses
        .filter(e => e.category === name)
        .reduce((sum, e) => sum + e.amount, 0);
    });

    const summary: PastMonthSummary = {
      monthKey: '2026-05',
      totalIncome: baseIncome,
      totalSpent,
      totalSaved,
      categoryBreakdown: categoriesMapped
    };

    // Save summary history
    const historyObj = getMonthHistory();
    const updatedHistory = [...historyObj.filter(h => h.monthKey !== '2026-05'), summary];
    setMonthHistory(updatedHistory);

    // 2. Clear current expense list for May (Optional - the user gets transported to June!)
    // 3. Keep scratchpad archive starting fresh scratchpad
    // 4. Auto-fill fixed commitments for June 2026
    const JuneCommitments: Expense[] = profileObj.fixedCommitments.map((c, idx) => ({
      id: `sim-commit-${c.id}-${Date.now()}-${idx}`,
      title: `[Fixed Commit] ${c.name}`,
      amount: c.amount,
      category: c.name.toLowerCase().includes('rent') ? 'Groceries & Food' : 'Electricity & Bills',
      type: 'Need',
      date: '2026-06-01',
      isFixedCommitment: true
    }));

    // Standardize expenses including June commitments prefilled
    const updatedExpensesList = [...JuneCommitments, ...expensesObj];
    setExpenses(updatedExpensesList);

    // Change current app context view to June 2026!
    setSelectedMonth('2026-06');
    setShowResetSimulation(true);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-between selection:bg-neutral-900 selection:text-white">
      
      {/* AUTHENTICATED APP CONSOLE CONTAINER */}
      {user && user.loggedIn && profile && profile.onboarded ? (
        <div className="flex-grow flex flex-col md:flex-row relative">
          
          {/* A. DESKTOP STICKY LEFT COLUMN SIDEBAR (Collapsible) */}
          <aside className={`hidden md:flex flex-col border-r border-neutral-200 bg-white sticky top-0 h-screen shrink-0 justify-between z-30 font-sans transition-all duration-300 ${sidebarCollapsed ? 'w-20 p-3' : 'w-64 p-5'}`}>
            
            {/* Top Workspace block */}
            <div className="space-y-6">
              
              {/* Brand Logo & Collapse Toggle */}
              <div className="flex items-center justify-between">
                <div 
                  onClick={() => navigateTo('dashboard')}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-85 overflow-hidden"
                >
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-lg font-mono shrink-0">
                    B
                  </div>
                  {!sidebarCollapsed && (
                    <div className="font-sans leading-none">
                      <span className="font-bold tracking-tight text-neutral-900 text-base block">BUDGETY</span>
                      <span className="text-[9px] text-neutral-450 block font-light">Family budget companion</span>
                    </div>
                  )}
                </div>

                {/* Minimize Button on Desktop sidebar */}
                <button
                  onClick={toggleSidebar}
                  className="text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 p-1 rounded-lg transition-all cursor-pointer"
                  title={sidebarCollapsed ? "Expand Sidebar" : "Minimize Sidebar"}
                  id="btn-sidebar-toggle"
                >
                  {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
              </div>

              {/* Profile card block */}
              {!sidebarCollapsed && (
                <div className="bg-neutral-50/80 border border-neutral-150 p-3.5 rounded-xl text-left">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-450 font-bold block mb-1">Active Profile</span>
                  <span className="font-bold text-neutral-900 text-sm flex items-center gap-1.5 leading-none">
                    <Users className="w-4 h-4 text-neutral-600 inline shrink-0" />
                    {profile.name}
                  </span>
                  <span className="text-[10px] text-neutral-400 block font-light font-sans mt-0.5">Family size: {profile.familySize} members</span>
                </div>
              )}

              {/* Navigation links block */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => navigateTo('dashboard')}
                  className={`flex items-center gap-2.5 text-xs px-4 py-3 rounded-xl font-bold transition-all cursor-pointer text-left w-full ${currentRoute === 'dashboard' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                  title="My Dashboard"
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>My Dashboard</span>}
                </button>

                <button
                  onClick={() => navigateTo('expenses')}
                  className={`flex items-center gap-2.5 text-xs px-4 py-3 rounded-xl font-bold transition-all cursor-pointer text-left w-full ${currentRoute === 'expenses' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                  title="Expense Entry"
                >
                  <CreditCard className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Expense Entry</span>}
                </button>

                <button
                  onClick={() => navigateTo('bills')}
                  className={`flex items-center gap-2.5 text-xs px-4 py-3 rounded-xl font-bold transition-all cursor-pointer text-left w-full ${currentRoute === 'bills' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                  title="Monthly Bills"
                >
                  <ReceiptText className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Monthly Bills</span>}
                </button>

                <button
                  onClick={() => navigateTo('goals')}
                  className={`flex items-center gap-2.5 text-xs px-4 py-3 rounded-xl font-bold transition-all cursor-pointer text-left w-full ${currentRoute === 'goals' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                  title="Savings Goals"
                >
                  <Target className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Savings Goals</span>}
                </button>

                <button
                  onClick={() => navigateTo('presets')}
                  className={`flex items-center gap-2.5 text-xs px-4 py-3 rounded-xl font-bold transition-all cursor-pointer text-left w-full ${currentRoute === 'presets' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                  title="Presets"
                >
                  <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
                  {!sidebarCollapsed && <span>Presets</span>}
                </button>

                <button
                  onClick={() => navigateTo('settings')}
                  className={`flex items-center gap-2.5 text-xs px-4 py-3 rounded-xl font-bold transition-all cursor-pointer text-left w-full ${currentRoute === 'settings' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                  title="Setup"
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Setup</span>}
                </button>
              </div>

            </div>

            {/* Bottom Actions Workspace block */}
            <div className="space-y-4 pt-4 border-t border-neutral-100">
              
              {/* Quick Launch Sticky Notepad floating helper button (Only visible on desktop) */}
              <button
                onClick={() => setRightNotepadOpen(!rightNotepadOpen)}
                className="w-full bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold py-2.5 rounded-xl transition-all border border-amber-250 flex items-center justify-center gap-2 cursor-pointer"
                title="Toggle Right Notepad Side note"
                id="btn-global-scratch"
              >
                <span className="text-sm">🗒️</span>
                {!sidebarCollapsed && <span>Quick Sticky Note</span>}
              </button>

              {/* Sign out link */}
              <button
                onClick={handleLogout}
                className="w-full text-left text-neutral-600 hover:text-rose-600 p-2.5 pl-4 rounded-xl flex items-center gap-2 text-xs font-bold cursor-pointer transition-colors"
                title="Sign out of Budgety"
              >
                <LogOut className="w-4 h-4 text-neutral-400 shrink-0" />
                {!sidebarCollapsed && <span>Log Out</span>}
              </button>

            </div>

          </aside>

          {/* B. MOBILE STICKY TOP HEADER */}
          <header className="flex md:hidden bg-white border-b border-neutral-200 h-14 items-center justify-between px-4 sticky top-0 z-30 font-sans shadow-2xs w-full">
            
            {/* Logo */}
            <div 
              onClick={() => navigateTo('dashboard')}
              className="flex items-center gap-1.5 cursor-pointer leading-none"
            >
              <div className="w-6.5 h-6.5 rounded bg-neutral-900 text-white flex items-center justify-center font-bold text-sm font-mono">
                B
              </div>
              <span className="font-black text-neutral-950 text-sm tracking-tight mb-0.5">BUDGETY</span>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRightNotepadOpen(!rightNotepadOpen)}
                className="p-1 px-2.5 bg-amber-50 rounded-lg text-amber-900 border border-amber-250 text-xs font-bold cursor-pointer"
                title="Toggle Quick Sticky Note"
              >
                🗒️ Sticky Note
              </button>
              
              <button
                onClick={handleLogout}
                className="text-neutral-400 p-1.5 hover:text-neutral-900 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </header>

          {/* C. MOBILE STICKY BOTTOM NAVIGATION BAR */}
          <nav className="flex md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-neutral-200 justify-around items-center z-45 px-1 pb-safe shadow-md">
            
            <button
              onClick={() => navigateTo('dashboard')}
              className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${currentRoute === 'dashboard' ? 'text-neutral-900 scale-105' : 'text-neutral-400'}`}
            >
              <LayoutDashboard className="w-4.5 h-4.5" />
              <span className="text-[7.5px] font-bold mt-0.5 tracking-wide">Home</span>
            </button>

            <button
              onClick={() => navigateTo('expenses')}
              className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${currentRoute === 'expenses' ? 'text-neutral-900 scale-105' : 'text-neutral-400'}`}
            >
              <CreditCard className="w-4.5 h-4.5" />
              <span className="text-[7.5px] font-bold mt-0.5 tracking-wide">Expenses</span>
            </button>

            <button
              onClick={() => navigateTo('bills')}
              className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${currentRoute === 'bills' ? 'text-neutral-900 scale-105' : 'text-neutral-400'}`}
            >
              <ReceiptText className="w-4.5 h-4.5" />
              <span className="text-[7.5px] font-bold mt-0.5 tracking-wide">Bills</span>
            </button>

            <button
              onClick={() => navigateTo('goals')}
              className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${currentRoute === 'goals' ? 'text-neutral-900 scale-105' : 'text-neutral-400'}`}
            >
              <Target className="w-4.5 h-4.5" />
              <span className="text-[7.5px] font-bold mt-0.5 tracking-wide">Goals</span>
            </button>

            <button
              onClick={() => navigateTo('presets')}
              className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${currentRoute === 'presets' ? 'text-neutral-900 scale-105' : 'text-neutral-400'}`}
            >
              <Sparkles className="w-4.5 h-4.5 text-amber-500" />
              <span className="text-[7.5px] font-bold mt-0.5 tracking-wide">Presets</span>
            </button>

            <button
              onClick={() => navigateTo('settings')}
              className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${currentRoute === 'settings' ? 'text-neutral-900 scale-105' : 'text-neutral-400'}`}
            >
              <Settings className="w-4.5 h-4.5" />
              <span className="text-[7.5px] font-bold mt-0.5 tracking-wide">Setup</span>
            </button>

          </nav>

          {/* D. FLOATING SLIDING SIDEWISE NOTEPAD STICKY PANEL */}
          <AnimatePresence>
            {rightNotepadOpen && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-80 bg-amber-50 border-l border-amber-200/90 shadow-2xl z-50 p-5 flex flex-col justify-between font-sans pr-6"
              >
                {/* Visual binder line */}
                <div className="absolute top-0 bottom-0 left-5 w-0.5 bg-rose-250/30" />
                
                <div className="pl-6 relative z-10 flex-1 flex flex-col">
                  {/* Top Header */}
                  <div className="flex justify-between items-center pb-3 border-b border-amber-200/60 mb-4 bg-amber-50/20">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">📝</span>
                      <span className="text-xs font-black text-amber-950 uppercase tracking-widest">Sidewise Sticky Note</span>
                    </div>
                    <button
                      onClick={() => setRightNotepadOpen(false)}
                      className="text-amber-800 hover:text-neutral-900 p-1 bg-amber-100 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Textarea note taking */}
                  <textarea
                    value={globalNoteContent}
                    onChange={handleGlobalNoteChange}
                    placeholder="Jot down quick entries here... Metro 40, Tea with Dad 120, Ramesh returning 200..."
                    className="w-full flex-1 bg-transparent text-sm font-sans font-medium leading-relaxed resize-none border-none focus:outline-none focus:ring-0 placeholder:text-amber-805/30 text-neutral-800"
                  />
                </div>

                <div className="pl-6 relative z-10 pt-4 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-amber-900">
                  <span>Saved automatically</span>
                  <span className="opacity-60 italic">Jots persist instantly</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* E. CORE VIEWPORT CONTENT SCREEN WITH RESPONSIVELY SAFELY PADDING ADJUSTED */}
          <main className="flex-1 overflow-y-auto mb-16 md:mb-0 bg-neutral-50 min-h-screen">
            {currentRoute === 'dashboard' && (
              <DashboardView 
                onNavigate={navigateTo} 
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                showSeedBanner={showSeedBanner}
                setShowSeedBanner={setShowSeedBanner}
              />
            )}
            {currentRoute === 'expenses' && (
              <ExpensesView 
                onNavigate={navigateTo} 
                selectedMonth={selectedMonth} 
              />
            )}
            {currentRoute === 'bills' && (
              <BillsView 
                onNavigate={navigateTo} 
                selectedMonth={selectedMonth} 
              />
            )}
            {currentRoute === 'goals' && (
              <GoalsView 
                onNavigate={navigateTo} 
                selectedMonth={selectedMonth}
              />
            )}
            {currentRoute === 'presets' && (
              <PresetsView 
                onNavigate={navigateTo} 
                selectedMonth={selectedMonth}
              />
            )}
            {currentRoute === 'settings' && (
              <SettingsView 
                onNavigate={navigateTo} 
                onLogout={handleLogout}
                selectedMonth={selectedMonth}
              />
            )}
          </main>
          
        </div>
      ) : (
        /* PUBLIC ROUTING (LANDING AND AUTHORIZATION FLOWS) */
        <div className="flex-grow">
          {currentRoute === 'landing' && (
            <LandingView onNavigate={navigateTo} />
          )}
          {currentRoute === 'login' && (
            <LoginView onNavigate={navigateTo} onLoginSuccess={handleLoginSuccess} />
          )}
          {currentRoute === 'signup' && (
            <SignupView onNavigate={navigateTo} onSignupSuccess={handleSignupSuccess} />
          )}
          {currentRoute === 'onboarding' && (
            <OnboardingView 
              userName={user?.name || 'Adarsh'} 
              userEmail={user?.email || 'adarsh.7025.v@gmail.com'}
              onCompleteOnboarding={handleOnboardingComplete}
            />
          )}
        </div>
      )}

    </div>
  );
}
