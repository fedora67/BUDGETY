/**
 * PocketMoneyView — Track pocket money for children
 * Splits each pocket money into 3 equal buckets:
 *   🏦 Saving | 🛒 Spend | 🤝 Charity (For Those in Need)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PiggyBank,
  ShoppingCart,
  Heart,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  X,
  Wallet,
  Users
} from 'lucide-react';
import {
  getPocketMoneyChildren,
  setPocketMoneyChildren,
  getPocketMoneyTransactions,
  setPocketMoneyTransactions
} from '../storage';
import { PocketMoneyChild, PocketMoneyTransaction } from '../types';

interface PocketMoneyViewProps {
  onNavigate: (route: string) => void;
  selectedMonth: string;
}

const BUCKETS = [
  {
    key: 'saving' as const,
    label: 'Saving',
    emoji: '🏦',
    color: 'emerald',
    icon: PiggyBank,
    desc: 'Save for future goals'
  },
  {
    key: 'spend' as const,
    label: 'Spend',
    emoji: '🛒',
    color: 'blue',
    icon: ShoppingCart,
    desc: 'Day-to-day spending'
  },
  {
    key: 'charity' as const,
    label: 'For Those in Need',
    emoji: '🤝',
    color: 'rose',
    icon: Heart,
    desc: 'Help others around you'
  }
];

const BUCKET_COLOR_MAP: Record<string, { bg: string; border: string; text: string; badge: string; badgeText: string; btn: string }> = {
  emerald: {
    bg: 'bg-emerald-50/80',
    border: 'border-emerald-100',
    text: 'text-emerald-900',
    badge: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    btn: 'bg-emerald-600 hover:bg-emerald-700'
  },
  blue: {
    bg: 'bg-blue-50/80',
    border: 'border-blue-100',
    text: 'text-blue-900',
    badge: 'bg-blue-100',
    badgeText: 'text-blue-800',
    btn: 'bg-blue-600 hover:bg-blue-700'
  },
  rose: {
    bg: 'bg-rose-50/80',
    border: 'border-rose-100',
    text: 'text-rose-900',
    badge: 'bg-rose-100',
    badgeText: 'text-rose-800',
    btn: 'bg-rose-600 hover:bg-rose-700'
  }
};

export default function PocketMoneyView({ onNavigate, selectedMonth }: PocketMoneyViewProps) {
  const [children, setChildrenState] = useState<PocketMoneyChild[]>([]);
  const [transactions, setTransactionsState] = useState<PocketMoneyTransaction[]>([]);

  // Add child form
  const [newChildName, setNewChildName] = useState('');
  const [newAmount, setNewAmount] = useState<number>(0);
  const [showAddChild, setShowAddChild] = useState(false);

  // Expanded child panel
  const [expandedChildId, setExpandedChildId] = useState<string | null>(null);

  // Add transaction modal state
  const [addTxnChildId, setAddTxnChildId] = useState<string | null>(null);
  const [addTxnBucket, setAddTxnBucket] = useState<'saving' | 'spend' | 'charity'>('spend');
  const [txnTitle, setTxnTitle] = useState('');
  const [txnAmount, setTxnAmount] = useState<number>(0);
  const [txnNote, setTxnNote] = useState('');

  const getFormattedMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, 1)
      .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  useEffect(() => {
    const allChildren = getPocketMoneyChildren().filter(c => c.monthKey === selectedMonth);
    setChildrenState(allChildren);
    setTransactionsState(getPocketMoneyTransactions());
  }, [selectedMonth]);

  const saveChildren = (updated: PocketMoneyChild[]) => {
    setChildrenState(updated);
    const others = getPocketMoneyChildren().filter(c => c.monthKey !== selectedMonth);
    setPocketMoneyChildren([...others, ...updated]);
  };

  const saveTransactions = (updated: PocketMoneyTransaction[]) => {
    setTransactionsState(updated);
    setPocketMoneyTransactions(updated);
  };

  // Add child with auto 3-way split
  const handleAddChild = () => {
    if (!newChildName.trim() || newAmount <= 0) return;
    const each = Math.floor(newAmount / 3);
    const remainder = newAmount - each * 3;
    const newChild: PocketMoneyChild = {
      id: `pm-child-${Date.now()}`,
      name: newChildName.trim(),
      totalAmount: newAmount,
      saving: each,
      spend: each + remainder, // remainder goes to spend
      charity: each,
      monthKey: selectedMonth,
      createdAt: new Date().toISOString()
    };
    saveChildren([...children, newChild]);
    setNewChildName('');
    setNewAmount(0);
    setShowAddChild(false);
    setExpandedChildId(newChild.id);
  };

  const handleDeleteChild = (id: string) => {
    saveChildren(children.filter(c => c.id !== id));
    const cleanTxns = transactions.filter(t => t.childId !== id);
    saveTransactions(cleanTxns);
    if (expandedChildId === id) setExpandedChildId(null);
  };

  // Add a spend/use transaction to a bucket
  const handleAddTransaction = () => {
    if (!addTxnChildId || !txnTitle.trim() || txnAmount <= 0) return;
    const newTxn: PocketMoneyTransaction = {
      id: `pm-txn-${Date.now()}`,
      childId: addTxnChildId,
      bucket: addTxnBucket,
      title: txnTitle.trim(),
      amount: txnAmount,
      date: new Date().toISOString().split('T')[0],
      note: txnNote.trim() || undefined
    };
    saveTransactions([...transactions, newTxn]);
    setAddTxnChildId(null);
    setTxnTitle('');
    setTxnAmount(0);
    setTxnNote('');
  };

  const handleDeleteTransaction = (txnId: string) => {
    saveTransactions(transactions.filter(t => t.id !== txnId));
  };

  // Get used amount per bucket for a child
  const getUsed = (childId: string, bucket: 'saving' | 'spend' | 'charity') =>
    transactions
      .filter(t => t.childId === childId && t.bucket === bucket)
      .reduce((s, t) => s + t.amount, 0);

  const totalGiven = children.reduce((s, c) => s + c.totalAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans">

      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-black text-neutral-950 tracking-tight flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Pocket Money Tracker
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5 font-light">
              {getFormattedMonth(selectedMonth)} · Give, split, and track your child's pocket money
            </p>
          </div>
          <button
            onClick={() => setShowAddChild(!showAddChild)}
            className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Child
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-neutral-200/80 p-4 rounded-2xl shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1.5">Children</span>
          <span className="text-2xl font-black text-neutral-950 font-mono">{children.length}</span>
        </div>
        <div className="bg-white border border-neutral-200/80 p-4 rounded-2xl shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1.5">Total Given</span>
          <span className="text-2xl font-black text-neutral-950 font-mono">₹{totalGiven.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-emerald-50/80 border border-emerald-100 p-4 rounded-2xl shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1.5">🏦 Total Saving</span>
          <span className="text-2xl font-black text-emerald-950 font-mono">
            ₹{children.reduce((s, c) => s + c.saving, 0).toLocaleString('en-IN')}
          </span>
        </div>
        <div className="bg-rose-50/80 border border-rose-100 p-4 rounded-2xl shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-rose-700 block mb-1.5">🤝 Total Charity</span>
          <span className="text-2xl font-black text-rose-950 font-mono">
            ₹{children.reduce((s, c) => s + c.charity, 0).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Add Child Form */}
      <AnimatePresence>
        {showAddChild && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-white border border-neutral-200/80 p-5 rounded-2xl shadow-sm mb-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <PlusCircle className="w-4 h-4" /> Give Pocket Money to a Child
              </h3>
              <button onClick={() => setShowAddChild(false)} className="text-neutral-400 hover:text-neutral-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-extrabold text-neutral-400 mb-1.5">Child's Name</label>
                <input
                  type="text"
                  placeholder="e.g., Arjun, Meera"
                  value={newChildName}
                  onChange={e => setNewChildName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-neutral-200 bg-white px-3 py-2.5 focus:border-neutral-900 focus:outline-none placeholder:text-neutral-300"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-extrabold text-neutral-400 mb-1.5">Total Amount (₹)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g., 300"
                  value={newAmount === 0 ? '' : newAmount}
                  onChange={e => {
                    const clean = e.target.value.replace(/[^0-9]/g, '');
                    setNewAmount(clean === '' ? 0 : parseInt(clean, 10));
                  }}
                  className="w-full text-xs rounded-xl border border-neutral-200 bg-white px-3 py-2.5 focus:border-neutral-900 focus:outline-none placeholder:text-neutral-300 font-bold"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddChild}
                  disabled={!newChildName.trim() || newAmount <= 0}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-30"
                >
                  Add & Split 3 Ways
                </button>
              </div>
            </div>
            {newAmount > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                {BUCKETS.map(b => {
                  const each = Math.floor(newAmount / 3);
                  const amt = b.key === 'spend' ? each + (newAmount - each * 3) : each;
                  return (
                    <div key={b.key} className={`p-3 rounded-xl border ${BUCKET_COLOR_MAP[b.color].bg} ${BUCKET_COLOR_MAP[b.color].border}`}>
                      <span className="text-base">{b.emoji}</span>
                      <p className={`text-[10px] font-bold uppercase mt-1 ${BUCKET_COLOR_MAP[b.color].text}`}>{b.label}</p>
                      <p className={`text-sm font-black font-mono ${BUCKET_COLOR_MAP[b.color].text}`}>₹{amt.toLocaleString('en-IN')}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Children List */}
      {children.length === 0 ? (
        <div className="bg-white border border-neutral-200/60 rounded-2xl p-10 text-center shadow-2xs">
          <Users className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-neutral-400">No children added yet for {getFormattedMonth(selectedMonth)}</p>
          <p className="text-xs text-neutral-300 mt-1">Click "Add Child" to give pocket money and start tracking.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {children.map(child => {
            const isExpanded = expandedChildId === child.id;
            const childTxns = transactions.filter(t => t.childId === child.id);

            return (
              <div key={child.id} className="bg-white border border-neutral-200/80 rounded-2xl shadow-sm overflow-hidden">

                {/* Child Header Row */}
                <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-neutral-50/60 transition-colors"
                  onClick={() => setExpandedChildId(isExpanded ? null : child.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center text-sm font-black">
                      {child.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-900">{child.name}</p>
                      <p className="text-[10px] text-neutral-400 font-light">
                        ₹{child.totalAmount.toLocaleString('en-IN')} total · {childTxns.length} transaction{childTxns.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2">
                      {BUCKETS.map(b => {
                        const used = getUsed(child.id, b.key);
                        const total = child[b.key];
                        const remaining = total - used;
                        return (
                          <div key={b.key} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${BUCKET_COLOR_MAP[b.color].badge} ${BUCKET_COLOR_MAP[b.color].badgeText}`}>
                            {b.emoji} ₹{remaining.toLocaleString('en-IN')}
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteChild(child.id); }}
                      className="p-2 text-neutral-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                  </div>
                </div>

                {/* Expanded Detail Panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 border-t border-neutral-100">

                        {/* 3 Bucket Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 mb-5">
                          {BUCKETS.map(b => {
                            const allocated = child[b.key];
                            const used = getUsed(child.id, b.key);
                            const remaining = allocated - used;
                            const pct = allocated > 0 ? Math.min(100, Math.round((used / allocated) * 100)) : 0;
                            const colors = BUCKET_COLOR_MAP[b.color];

                            return (
                              <div key={b.key} className={`p-4 rounded-2xl border ${colors.bg} ${colors.border}`}>
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-base">{b.emoji}</span>
                                    <span className={`text-xs font-black uppercase tracking-wide ${colors.text}`}>{b.label}</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setAddTxnChildId(child.id);
                                      setAddTxnBucket(b.key);
                                    }}
                                    className={`p-1 rounded-lg text-white ${colors.btn} cursor-pointer`}
                                    title={`Add ${b.label} entry`}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                <p className={`text-[10px] ${colors.text} opacity-70 mb-2`}>{b.desc}</p>

                                {/* Progress bar */}
                                <div className="w-full bg-white/60 rounded-full h-1.5 mb-2">
                                  <div
                                    className={`h-1.5 rounded-full transition-all ${b.color === 'emerald' ? 'bg-emerald-500' : b.color === 'blue' ? 'bg-blue-500' : 'bg-rose-500'}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>

                                <div className="flex justify-between text-[10px]">
                                  <span className={`${colors.text} opacity-60`}>Used: ₹{used.toLocaleString('en-IN')}</span>
                                  <span className={`font-bold ${colors.text}`}>Left: ₹{remaining.toLocaleString('en-IN')}</span>
                                </div>

                                {/* Bucket transactions */}
                                {childTxns.filter(t => t.bucket === b.key).length > 0 && (
                                  <div className="mt-3 space-y-1.5">
                                    {childTxns.filter(t => t.bucket === b.key).map(txn => (
                                      <div key={txn.id} className="flex items-center justify-between bg-white/70 rounded-lg px-2.5 py-1.5">
                                        <div>
                                          <p className={`text-[10px] font-bold ${colors.text}`}>{txn.title}</p>
                                          <p className="text-[9px] text-neutral-400">{txn.date}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <span className={`text-[10px] font-black font-mono ${colors.text}`}>₹{txn.amount}</span>
                                          <button
                                            onClick={() => handleDeleteTransaction(txn.id)}
                                            className="text-neutral-300 hover:text-rose-500 cursor-pointer"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Allocated breakdown note */}
                        <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-3 text-[11px] text-neutral-500 font-light">
                          💡 Allocated: 🏦 ₹{child.saving} saving · 🛒 ₹{child.spend} spend · 🤝 ₹{child.charity} charity
                          &nbsp;— auto-split from ₹{child.totalAmount} total pocket money.
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {addTxnChildId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
            onClick={() => setAddTxnChildId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-neutral-900">Track Usage</h3>
                <button onClick={() => setAddTxnChildId(null)} className="text-neutral-400 hover:text-neutral-700 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Bucket selector */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {BUCKETS.map(b => (
                  <button
                    key={b.key}
                    onClick={() => setAddTxnBucket(b.key)}
                    className={`py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                      addTxnBucket === b.key
                        ? `${BUCKET_COLOR_MAP[b.color].badge} ${BUCKET_COLOR_MAP[b.color].badgeText} border-transparent`
                        : 'bg-white border-neutral-200 text-neutral-500'
                    }`}
                  >
                    {b.emoji} {b.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-neutral-400 mb-1.5">What was it for?</label>
                  <input
                    type="text"
                    placeholder="e.g., Pencil box, Chips, Donated to friend"
                    value={txnTitle}
                    onChange={e => setTxnTitle(e.target.value)}
                    className="w-full text-xs rounded-xl border border-neutral-200 px-3 py-2.5 focus:border-neutral-900 focus:outline-none placeholder:text-neutral-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-neutral-400 mb-1.5">Amount (₹)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g., 20"
                    value={txnAmount === 0 ? '' : txnAmount}
                    onChange={e => {
                      const clean = e.target.value.replace(/[^0-9]/g, '');
                      setTxnAmount(clean === '' ? 0 : parseInt(clean, 10));
                    }}
                    className="w-full text-xs rounded-xl border border-neutral-200 px-3 py-2.5 focus:border-neutral-900 focus:outline-none placeholder:text-neutral-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-neutral-400 mb-1.5">Note (optional)</label>
                  <input
                    type="text"
                    placeholder="Any remark..."
                    value={txnNote}
                    onChange={e => setTxnNote(e.target.value)}
                    className="w-full text-xs rounded-xl border border-neutral-200 px-3 py-2.5 focus:border-neutral-900 focus:outline-none placeholder:text-neutral-300"
                  />
                </div>
                <button
                  onClick={handleAddTransaction}
                  disabled={!txnTitle.trim() || txnAmount <= 0}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-3 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-30"
                >
                  Log Transaction
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
