import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pie, Bar } from 'react-chartjs-2';
import { 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  FolderSync, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle,
  Archive,
  Info,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { 
  getExpenses, 
  setExpenses, 
  getCategories, 
  getScratchpadNote, 
  setScratchpadNote, 
  getScratchpadArchive, 
  setScratchpadArchive, 
  getProfile,
  checkAndArchiveScratchpad
} from '../storage';
import { Expense, CustomCategory, ScratchpadNote, ScratchpadArchive } from '../types';

interface ExpensesViewProps {
  onNavigate: (route: string) => void;
  selectedMonth: string;
}

export default function ExpensesView({ onNavigate, selectedMonth }: ExpensesViewProps) {
  
  // Storage states
  const [expenses, setExpensesState] = useState<Expense[]>([]);
  const [categories, setCategoriesState] = useState<CustomCategory[]>([]);
  const [profile, setProfileState] = useState(getProfile());
  const [scratchpad, setScratchpadState] = useState<ScratchpadNote>({ content: '', timestamp: '' });
  const [archives, setArchivesState] = useState<ScratchpadArchive[]>([]);

  // Local interaction UI
  const [scratchpadOpen, setScratchpadOpen] = useState(true);
  const [showArchivedList, setShowArchivedList] = useState(false);
  const [scratchpadInputText, setScratchpadInputText] = useState('');

  // New Expense form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState('Groceries & Food');
  const [type, setType] = useState<'Need' | 'Want' | 'Saving'>('Need');
  const [note, setNote] = useState('');
  const [expDate, setExpDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Filters state
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterQuery, setFilterQuery] = useState('');

  // Pre-seed state from storage
  useEffect(() => {
    // Check and auto-archive scratchpad if it is 3+ days old
    checkAndArchiveScratchpad();

    setExpensesState(getExpenses());
    setCategoriesState(getCategories());
    setProfileState(getProfile());
    setScratchpadState(getScratchpadNote());
    setArchivesState(getScratchpadArchive());
  }, []);

  // Quick categories lists
  const quickCategories = [
    { label: 'Food', catName: 'Groceries & Food', icon: '🍲' },
    { label: 'Transport', catName: 'Transport & Fuel', icon: '🛵' },
    { label: 'Bills', catName: 'Electricity & Bills', icon: '💡' },
    { label: 'Wants', catName: 'Movies & Entertainment', icon: '🍿' },
    { label: 'Health', catName: 'Medical & Health', icon: '💊' },
    { label: 'Education', catName: 'School & Education', icon: '📚' },
    { label: 'Dining', catName: 'Restaurant & Eating Out', icon: '🍛' }
  ];

  // SCRATCHPAD PERSISTENCE
  const handleScratchpadChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const nowStr = new Date().toISOString();
    
    // Auto timestamp if starting empty
    const tstamp = scratchpad.content === '' ? nowStr : scratchpad.timestamp || nowStr;
    const updated: ScratchpadNote = {
      content: text,
      timestamp: tstamp
    };
    
    setScratchpadState(updated);
    setScratchpadNote(updated);
  };

  const handleQuickAddNoteEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scratchpadInputText.trim()) return;

    const now = new Date();
    // eg "12/1/2008 3:00 pm"
    const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    const formattedTime = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
    
    const entryLine = `(${formattedDate} ${formattedTime}) - ${scratchpadInputText}`;
    
    const currentContent = scratchpad.content ? scratchpad.content.trim() : '';
    const newContent = currentContent ? `${currentContent}\n${entryLine}` : entryLine;
    
    const updated: ScratchpadNote = {
      content: newContent,
      timestamp: now.toISOString()
    };
    
    setScratchpadState(updated);
    setScratchpadNote(updated);
    setScratchpadInputText('');

    // Keep global state synced
    window.dispatchEvent(new Event('budgety_notes_updated'));
  };

  const clearScratchpad = () => {
    const updated = { content: '', timestamp: '' };
    setScratchpadState(updated);
    setScratchpadNote(updated);
  };

  const handleManualArchive = () => {
    if (!scratchpad.content.trim()) return;

    const newArchive: ScratchpadArchive = {
      id: 'arch-' + Date.now(),
      content: scratchpad.content,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedArch = [newArchive, ...archives];
    setArchivesState(updatedArch);
    setScratchpadArchive(updatedArch);
    clearScratchpad();
  };

  // ADD NEW EXPENSE HANDLER
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    // Validation: Check if spent exceeds income
    const totalIncome = profile?.incomeSources.reduce((sum, s) => sum + s.amount, 0) || 0;
    const currentMonthExpenses = expenses.filter(exp => exp.date.startsWith(selectedMonth));
    const totalSpentThisMonth = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    if (totalSpentThisMonth + Number(amount) > totalIncome) {
      if (!confirm("Your expense is exceeding your total income. Do you want to proceed?")) {
        return;
      }
    }

    // Check category settings of chosen category to map defaults if custom type applies
    const activeCat = categories.find(c => c.name === category);
    const finalType = activeCat ? activeCat.type : type;

    const newExp: Expense = {
      id: 'exp-' + Date.now(),
      title,
      amount: Number(amount),
      category,
      type: finalType,
      note: note.trim() || undefined,
      date: expDate
    };

    const updated = [newExp, ...expenses];
    setExpenses(updated);
    setExpensesState(updated);

    // Clear form
    setTitle('');
    setAmount('');
    setNote('');
  };

  // REMOVE EXPENSE HANDLER
  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter(exp => exp.id !== id);
    setExpenses(updated);
    setExpensesState(updated);
  };

  // INJECT STANDARD FIXED COMMITMENTS IF TRIGGERED FOR SELECTED MONTH
  // Generates rent, bill lines as real items that can be paid
  const currentMonthFixedExpenses = expenses.filter(
    e => e.date.startsWith(selectedMonth) && e.isFixedCommitment
  );

  const handleAutoFillFixed = () => {
    if (profile?.fixedCommitments && currentMonthFixedExpenses.length === 0) {
      // Generate them
      const generated: Expense[] = profile.fixedCommitments.map((c, idx) => ({
        id: `fixed-gen-${c.id}-${Date.now()}-${idx}`,
        title: `[Fixed] ${c.name}`,
        amount: c.amount,
        category: c.name.toLowerCase().includes('rent') ? 'Groceries & Food' : 'Electricity & Bills',
        type: 'Need',
        date: `${selectedMonth}-01`,
        isFixedCommitment: true
      }));

      const updated = [...generated, ...expenses];
      setExpenses(updated);
      setExpensesState(updated);
    }
  };

  // LOG MATH: CATEGORY BREAKDOWN METRICS FOR BAR CHART
  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));
  
  // PIE CHART DATA (Needs vs Wants vs Savings)
  const spentNeeds = currentMonthExpenses.filter(e => e.type === 'Need').reduce((sum, e) => sum + e.amount, 0);
  const spentWants = currentMonthExpenses.filter(e => e.type === 'Want').reduce((sum, e) => sum + e.amount, 0);
  const totalSaved = currentMonthExpenses.filter(e => e.type === 'Saving').reduce((sum, e) => sum + e.amount, 0);

  const pieData = {
    labels: ['Needs (Essential)', 'Wants (Discretionary)', 'Savings (Future Self)'],
    datasets: [
      {
        data: [spentNeeds, spentWants, totalSaved],
        backgroundColor: [
          'rgba(23, 23, 23, 0.9)',    
          'rgba(239, 68, 68, 0.85)',   
          'rgba(16, 185, 129, 0.9)'    
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
      legend: { position: 'bottom' as const, labels: { boxWidth: 10, font: { size: 9 } } },
    },
  };

  const categoryChartLabels = categories.map(c => c.name);
  const categoryChartData = categories.map(c => {
    return currentMonthExpenses
      .filter(e => e.category === c.name)
      .reduce((sum, e) => sum + e.amount, 0);
  });

  // Category breakdown custom dataset
  const horizontalBarData = {
    labels: categoryChartLabels,
    datasets: [
      {
        label: 'Category Spending (₹)',
        data: categoryChartData,
        backgroundColor: categories.map(c => {
          if (c.type === 'Need') return 'rgba(23, 23, 23, 0.85)';    // Essential Needs
          if (c.type === 'Want') return 'rgba(239, 68, 68, 0.82)';    // Discretionary Wants
          return 'rgba(16, 185, 129, 0.85)';                        // Savings
        }),
        borderRadius: 6,
      }
    ]
  };

  const horizontalBarOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        ticks: { font: { family: 'JetBrains Mono', size: 9 } }
      },
      y: {
        ticks: { font: { family: 'Poppins', size: 9 } }
      }
    }
  };

  // FILTERED LIST COMPUTATIONS
  const filteredList = currentMonthExpenses.filter(e => {
    const matchCat = filterCategory === 'All' || e.category === filterCategory;
    const matchType = filterType === 'All' || e.type === filterType;
    const matchQuery = e.title.toLowerCase().includes(filterQuery.toLowerCase()) || 
                       (e.note && e.note.toLowerCase().includes(filterQuery.toLowerCase()));
    return matchCat && matchType && matchQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans">
      


      {/* LOWER SPLIT: EXPENSE INPUT SYSTEM AND CATEGORY BREAKDOWN */}
      <div className="flex flex-col gap-6">                
              {/* EXPENSE ENTRY FORM CARD */}
              <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-xs lg:col-span-2">
                
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base font-bold text-neutral-900 tracking-tight">Log Daily Expense</h3>
                  {profile?.fixedCommitments && currentMonthFixedExpenses.length === 0 && (
                    <button
                      onClick={handleAutoFillFixed}
                      className="text-[11px] font-bold bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-800 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-sans"
                    >
                      📥 Pre-fill {profile.fixedCommitments.length} Fixed commitments
                    </button>
                  )}
                </div>

                <form onSubmit={handleAddExpense} className="space-y-4">
                  
                  {/* Title & Amount row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">Expense Item Title</label>
                      <input
                        id="expense-title-input"
                        type="text"
                        required
                        placeholder="e.g., Grocery Shopping, Auto commute"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none transition-all placeholder:text-neutral-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">Amount (₹)</label>
                      <input
                        id="expense-amount-input"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        required
                        placeholder="e.g., 250"
                        value={amount}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/[^0-9]/g, '');
                          setAmount(clean === '' ? '' : parseInt(clean, 10));
                        }}
                        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none transition-all font-number placeholder:text-neutral-300 font-bold"
                      />
                    </div>
                  </div>

                  {title.length > 0 && (
                    <>
                      {/* Classification Group */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">Classification Group</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setType('Need')}
                            className={`flex-1 py-3 text-xs rounded-xl border font-bold tracking-wide transition-all ${type === 'Need' ? 'bg-neutral-950 border-neutral-950 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:border-neutral-300'} cursor-pointer`}
                          >
                            Need
                          </button>
                          <button
                            type="button"
                            onClick={() => setType('Want')}
                            className={`flex-1 py-3 text-xs rounded-xl border font-bold tracking-wide transition-all ${type === 'Want' ? 'bg-rose-600 border-rose-600 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:border-neutral-300'} cursor-pointer`}
                          >
                            Want
                          </button>
                          <button
                            type="button"
                            onClick={() => setType('Saving')}
                            className={`flex-1 py-3 text-xs rounded-xl border font-bold tracking-wide transition-all ${type === 'Saving' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:border-neutral-300'} cursor-pointer`}
                          >
                            Saving
                          </button>
                        </div>
                      </div>

                      {/* Quick Favorites buttons */}
                      <div>
                        <span className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-2">Assign Quick Categories</span>
                        <div className="flex flex-wrap gap-1.5">
                          {quickCategories.map((qc, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setCategory(qc.catName);
                                // Auto pick type based on category
                                const matchingCat = categories.find(c => c.name === qc.catName);
                                if (matchingCat) setType(matchingCat.type);
                              }}
                              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${category === qc.catName ? 'bg-neutral-950 border-neutral-950 text-white font-semibold' : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:border-neutral-300'} cursor-pointer`}
                            >
                              {qc.icon} {qc.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Category selection */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">Household Category</label>
                        <select
                          value={category}
                          onChange={(e) => {
                            const chosen = e.target.value;
                            setCategory(chosen);
                            const matchingCat = categories.find(c => c.name === chosen);
                            if (matchingCat) setType(matchingCat.type);
                          }}
                          className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm focus:border-neutral-900 focus:outline-none transition-all"
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name} ({cat.type})</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {/* Note & Date row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">Optional Annotations (Note)</label>
                      <input
                        type="text"
                        placeholder="e.g., Bought from local ration shop, custom description"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none transition-all placeholder:text-neutral-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">Entry Date</label>
                      <input
                        type="date"
                        value={expDate}
                        onChange={(e) => setExpDate(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none transition-all font-number"
                      />
                    </div>
                  </div>

                  <button
                    id="btn-submit-expense"
                    type="submit"
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs py-3.5 px-4 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Plus className="w-4 h-4" /> Save Expense Log
                  </button>

                </form>

              </div>

              {/* PIE CHART CARD */}
              <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-xs lg:col-span-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 tracking-tight mb-1">Needs vs Wants vs Savings</h4>
                  <span className="text-[10px] text-neutral-400 block mb-4">Pie breakdown for logged expenses</span>
                </div>
                
                <div className="relative h-48 flex items-center justify-center">
                  <Pie data={pieData} options={pieOptions} />
                </div>
              </div>
            </div>

      {/* FILTERABLE EXPENSE LIST COMPONENT */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl shadow-xs p-6">
        
        {/* List Title and Filter Controls */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-b border-neutral-100 pb-5 mb-5 font-sans">
          
          <div className="text-left">
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight">Household Expenses History ({filteredList.length})</h3>
            <span className="text-[10px] text-neutral-450 font-light">Listing expenditures for May 2026</span>
          </div>

          {/* Filtering cells */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Query */}
            <input
              type="text"
              placeholder="Search expenses..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="rounded-xl border border-neutral-200 px-3.5 py-2 text-xs bg-neutral-50/50 focus:border-neutral-900 focus:outline-none transition-all placeholder:text-neutral-300 w-full sm:w-auto"
            />

            {/* Cat Filter dropdown */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-xl border border-neutral-200 px-3.5 py-2 text-xs bg-neutral-50/50 focus:outline-none text-neutral-600 font-sans cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>

            {/* Type Filter dropdown */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-xl border border-neutral-200 px-3.5 py-2 text-xs bg-neutral-50/50 focus:outline-none text-neutral-600 font-sans cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Need">Needs Only</option>
              <option value="Want">Wants Only</option>
              <option value="Saving">Savings Only</option>
            </select>

          </div>

        </div>

        {/* EXPENSE ENTRIES LIST */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-xs font-sans text-neutral-400">
              <p className="text-2xl mb-1">🍃</p>
              <span>Zero matching records found. Enter items or adjust filters.</span>
            </div>
          ) : (
            filteredList.map(exp => {
              const isFixed = exp.isFixedCommitment;

              return (
                <div 
                  key={exp.id} 
                  id={`expense-row-${exp.id}`}
                  className={`flex justify-between items-center transition-all p-3.5 rounded-xl border ${isFixed ? 'bg-neutral-50/85 border-neutral-200 text-neutral-600 opacity-80' : 'bg-white border-neutral-200/80 hover:border-neutral-300'}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900 tracking-tight text-xs sm:text-sm block">{exp.title}</span>
                      {isFixed && (
                        <span className="text-[8px] uppercase tracking-widest font-extrabold bg-neutral-200 text-neutral-700 px-1 py-0.5 rounded font-mono">Fixed Commitment</span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 mt-1 text-[10px] text-neutral-450 font-sans">
                      <span className="font-bold font-mono text-neutral-500 uppercase tracking-wide bg-neutral-100 px-1 rounded">{exp.category}</span>
                      
                      <span className={`font-bold uppercase font-mono tracking-wider text-[9px] ${exp.type === 'Need' ? 'text-neutral-900' : exp.type === 'Want' ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {exp.type}
                      </span>

                      <span className="text-neutral-400 font-light font-mono">{exp.date}</span>
                      {exp.note && <span className="text-neutral-400 font-light italic">"{exp.note}"</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs sm:text-sm font-black text-neutral-900 font-number">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="text-neutral-400 hover:text-neutral-950 p-1 rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
}
