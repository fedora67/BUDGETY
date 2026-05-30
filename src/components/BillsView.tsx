import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ReceiptText, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  Check, 
  Edit3, 
  Save, 
  X,
  PlusCircle,
  TrendingDown
} from 'lucide-react';
import { 
  getMonthlyBills, 
  setMonthlyBills, 
  getExpenses, 
  setExpenses 
} from '../storage';
import { MonthlyBill, Expense } from '../types';

interface BillsViewProps {
  onNavigate: (route: string) => void;
  selectedMonth: string;
}

export default function BillsView({ onNavigate, selectedMonth }: BillsViewProps) {
  const [bills, setBillsState] = useState<MonthlyBill[]>([]);
  
  // Custom form state for adding new bill fields
  const [newBillName, setNewBillName] = useState('');
  const [newBillAmount, setNewBillAmount] = useState<number>(0);
  
  // Inline editing state
  const [editingBillId, setEditingBillId] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState<number>(0);

  // Month-formatted text ("May 2026")
  const getFormattedMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Load bills on mount & when month defaults change
  useEffect(() => {
    const allBills = getMonthlyBills();
    // Filter bills for select month
    const currentMonthBills = allBills.filter(b => b.monthKey === selectedMonth);
    
    if (currentMonthBills.length === 0) {
      setBillsState([]);
    } else {
      setBillsState(currentMonthBills);
    }
  }, [selectedMonth]);

  // Saves list back to storage
  const saveBillsToStorage = (updatedCurrent: MonthlyBill[]) => {
    setBillsState(updatedCurrent);
    const allBills = getMonthlyBills();
    // Filter out previous entries of the selected month, then merge
    const otherMonthBills = allBills.filter(b => b.monthKey !== selectedMonth);
    setMonthlyBills([...otherMonthBills, ...updatedCurrent]);
  };

  // 1. Add custom new bill
  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBillName.trim()) return;

    const newBillItem: MonthlyBill = {
      id: `b-custom-${Date.now()}`,
      name: newBillName.trim(),
      amount: newBillAmount || 0,
      monthKey: selectedMonth,
      status: 'Pending',
      category: 'Electricity & Bills'
    };

    const updated = [...bills, newBillItem];
    saveBillsToStorage(updated);
    
    // Reset form
    setNewBillName('');
    setNewBillAmount(0);
  };

  // 2. Delete bill
  const handleDeleteBill = (id: string) => {
    const updated = bills.filter(b => b.id !== id);
    saveBillsToStorage(updated);
    
    // Also clear associated payment in Expense Ledger if it exists
    const currentExpenses = getExpenses();
    const cleanExpenses = currentExpenses.filter(exp => exp.id !== `exp-bill-pay-${id}`);
    setExpenses(cleanExpenses);
  };

  // 3. Initiate inline editing of fluctuating amount
  const startEditing = (id: string, currentVal: number) => {
    setEditingBillId(id);
    setEditingAmount(currentVal);
  };

  const saveEditedAmount = (id: string) => {
    const updated = bills.map(b => {
      if (b.id === id) {
        return { ...b, amount: editingAmount };
      }
      return b;
    });
    saveBillsToStorage(updated);
    setEditingBillId(null);

    // If already marked Paid, sync/update the amount inside Expense Ledger too
    const currentExpenses = getExpenses();
    const hasExpenseIndex = currentExpenses.findIndex(exp => exp.id === `exp-bill-pay-${id}`);
    if (hasExpenseIndex >= 0) {
      const updatedExp = [...currentExpenses];
      updatedExp[hasExpenseIndex] = {
        ...updatedExp[hasExpenseIndex],
        amount: editingAmount
      };
      setExpenses(updatedExp);
    }
  };

  // 4. Toggle payment status and auto-sync to actual ledger!
  const handleTogglePaymentStatus = (id: string) => {
    const targetBill = bills.find(b => b.id === id);
    if (!targetBill) return;

    const newStatus = targetBill.status === 'Paid' ? 'Pending' : 'Paid';
    
    // Update local list
    const updated = bills.map(b => {
      if (b.id === id) {
        return { ...b, status: newStatus as 'Paid' | 'Pending' };
      }
      return b;
    });
    saveBillsToStorage(updated);

    // Ledger Sync:
    const currentExpenses = getExpenses();
    
    if (newStatus === 'Paid') {
      // Check if already in ledger
      const exists = currentExpenses.some(exp => exp.id === `exp-bill-pay-${id}`);
      if (!exists) {
        const todayStr = new Date().toISOString().split('T')[0];
        const newPaidExpense: Expense = {
          id: `exp-bill-pay-${id}`,
          title: `[Paid Bill] ${targetBill.name}`,
          amount: targetBill.amount,
          category: 'Electricity & Bills',
          type: 'Need',
          date: todayStr,
          note: `Auto-synced from Monthly Bills page: Paid on ${todayStr}`
        };
        setExpenses([newPaidExpense, ...currentExpenses]);
      }
    } else {
      // Remove from ledger
      const cleanExpenses = currentExpenses.filter(exp => exp.id !== `exp-bill-pay-${id}`);
      setExpenses(cleanExpenses);
    }
  };

  // Calculation summaries
  const totalBillsAmount = bills.reduce((sum, b) => sum + b.amount, 0);
  const totalPaidAmount = bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0);
  const totalPendingAmount = totalBillsAmount - totalPaidAmount;
  const paidCount = bills.filter(b => b.status === 'Paid').length;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans">
      
      {/* Page Title Block */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-neutral-200/80 p-5 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-neutral-900 flex items-center gap-2">
            <ReceiptText className="w-6 h-6 text-neutral-800" />
            Fluctuating Monthly Bills
          </h2>
          <p className="text-xs text-neutral-500 font-light mt-0.5">
            Utilities like electricity or water change every month. Track actual current dues for <strong className="text-neutral-800 font-semibold">{getFormattedMonthName(selectedMonth)}</strong> and auto-sync payments directly to your performance ledger.
          </p>
        </div>
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-center shrink-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-0.5">Current Scope</span>
          <span className="text-xs font-extrabold text-neutral-800 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            {getFormattedMonthName(selectedMonth)}
          </span>
        </div>
      </div>

      {/* METRIC ROW BENTO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-neutral-200/80 p-4.5 rounded-2xl shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-2">Total Combined Bills</span>
          <div>
            <span className="text-2xl font-black text-neutral-900 font-mono">₹{totalBillsAmount.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-neutral-400 block font-light mt-1">Accumulating {bills.length} total monthly utilities.</span>
          </div>
        </div>

        <div className="bg-emerald-50/80 border border-emerald-100/60 p-4.5 rounded-2xl shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-2">Dues Paid / Settled</span>
          <div>
            <span className="text-2xl font-black text-emerald-990 font-mono">₹{totalPaidAmount.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-emerald-700 block font-light mt-1">
              Confirmed Paid: {paidCount} of {bills.length} bills.
            </span>
          </div>
        </div>

        <div className="bg-rose-50/60 border border-rose-100/60 p-4.5 rounded-2xl shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-rose-800 block mb-2">Remaining Pending Dues</span>
          <div>
            <span className="text-2xl font-black text-rose-990 font-mono">₹{totalPendingAmount.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-rose-700 block font-light mt-1">Outstanding liabilities for the selected month cycle.</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FLAT LIST OF BILLS */}
        <div className="lg:col-span-2 bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center pb-4 border-b border-neutral-100 mb-6">
            <h3 className="text-sm font-bold text-neutral-950 flex items-center gap-1.5 uppercase tracking-wide">
              <span>🧾 Active Bills Flat Sheet</span>
            </h3>
            <span className="text-[10px] text-neutral-400">Values auto-save on change</span>
          </div>

          <div className="space-y-3.5">
            {bills.map(bill => {
              const isEditing = editingBillId === bill.id;
              
              return (
                <div 
                  key={bill.id} 
                  className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-neutral-50 hover:bg-neutral-100/50 p-4 rounded-xl border border-neutral-200/50 transition-all ${bill.status === 'Paid' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-amber-400'}`}
                >
                  <div className="flex-1 w-full text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900 leading-tight block">{bill.name}</span>
                      <span className={`text-[8.5px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded ${bill.status === 'Paid' ? 'bg-emerald-100 text-emerald-850' : 'bg-amber-100/80 text-amber-800'}`}>
                        {bill.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-light block mt-1">
                      {bill.status === 'Paid' 
                        ? '🟢 Sync enabled: Logged as Standard expense' 
                        : '🔴 Unpaid: Not factored into expense statistics'}
                    </span>
                  </div>

                  {/* Pricing Input / View Mode */}
                  <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 justify-between sm:justify-end">
                    
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 bg-white border border-neutral-200 rounded-xl px-2.5 py-1">
                        <span className="text-xs font-semibold text-neutral-400">₹</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={editingAmount === 0 ? '' : editingAmount}
                          onChange={(e) => {
                            const clean = e.target.value.replace(/[^0-9]/g, '');
                            setEditingAmount(clean === '' ? 0 : parseInt(clean, 10));
                          }}
                          className="w-16 focus:outline-none text-xs font-bold text-neutral-800"
                          placeholder="0"
                        />
                        <button 
                          onClick={() => saveEditedAmount(bill.id)}
                          className="text-emerald-500 hover:text-emerald-700 p-0.5 rounded-lg hover:bg-neutral-50"
                          title="Save Amount"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setEditingBillId(null)}
                          className="text-neutral-400 hover:text-neutral-600 p-0.5 rounded-lg hover:bg-neutral-50"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-1">
                        <span className="text-xs font-extrabold text-neutral-900 font-mono">₹{bill.amount.toLocaleString('en-IN')}</span>
                        <button 
                          onClick={() => startEditing(bill.id, bill.amount)}
                          className="text-neutral-450 hover:text-neutral-800 p-1"
                          title="Edit fluctuating bill amount"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleTogglePaymentStatus(bill.id)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all ${bill.status === 'Paid' ? 'bg-emerald-50 text-emerald-850 hover:bg-emerald-100/50 border-emerald-200/60' : 'bg-neutral-900 border-neutral-900 text-white hover:bg-neutral-850 shadow-xs'} cursor-pointer`}
                      >
                        {bill.status === 'Paid' ? 'Mark Pending' : 'Mark Paid / Sync'}
                      </button>
                      <button
                        onClick={() => handleDeleteBill(bill.id)}
                        className="p-2 border border-neutral-200 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-neutral-100/30 transition-colors"
                        title="Remove utility bill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-4.5 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400 leading-relaxed font-light font-sans">
            <span className="flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 text-neutral-400/80" /> Auto-sync system logs each PAID bill directly inside your Expense Tracker Ledger as a Monthly Need!</span>
          </div>
        </div>

        {/* INPUT FORM: ADD INDEPENDENT UTILITY */}
        <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-sm h-fit">
          <div className="pb-4 border-b border-neutral-100 mb-5 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-neutral-800" />
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight">Add Fluctuating Utility</h3>
          </div>

          <form onSubmit={handleAddBill} className="space-y-4 font-sans text-left">
            <div>
              <label className="block text-[10px] uppercase font-extrabold text-neutral-400 mb-1.5">Utility / Bill Label</label>
              <input
                type="text"
                required
                placeholder="e.g., Gas Cylinder, Cable TV"
                value={newBillName}
                onChange={(e) => setNewBillName(e.target.value)}
                className="w-full text-xs rounded-xl border border-neutral-200 bg-white px-3 py-2.5 focus:border-neutral-900 focus:outline-none focus:bg-white placeholder:text-neutral-300"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-extrabold text-neutral-400 mb-1.5">Amount For This Month (₹)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g., 850"
                value={newBillAmount === 0 ? '' : newBillAmount}
                onChange={(e) => {
                  const clean = e.target.value.replace(/[^0-9]/g, '');
                  setNewBillAmount(clean === '' ? 0 : parseInt(clean, 10));
                }}
                className="w-full text-xs rounded-xl border border-neutral-200 bg-white px-3 py-2.5 focus:border-neutral-900 focus:outline-none focus:bg-white placeholder:text-neutral-300 font-number font-bold text-neutral-800"
              />
            </div>

            <button
              type="submit"
              disabled={!newBillName.trim()}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-30"
            >
              Add Bill to Plan
            </button>
          </form>

          <div className="bg-neutral-50 p-4 border border-neutral-100 rounded-xl mt-6 text-neutral-600 text-[11px] leading-relaxed font-sans font-light">
            <span className="font-bold text-neutral-800 block mb-1">💡 What about groups or clusters?</span>
            To make everything straightforward, BUDGETY groups standard static liabilities into this flat utility sheet, giving you a simplified view of your dues. Use it to adjust fluctuating charges easily.
          </div>
        </div>

      </div>

    </div>
  );
}
