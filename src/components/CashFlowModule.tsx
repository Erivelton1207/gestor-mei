/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Trash2, Plus, Calendar, Search, SlidersHorizontal, ArrowLeft, PlusCircle, Check } from 'lucide-react';
import { Transaction, BusinessProfile, NicheType } from '../types';
import { formatCurrency, formatDateBr, DEFAULT_CATEGORIES } from '../utils';

interface CashFlowModuleProps {
  transactions: Transaction[];
  profile: BusinessProfile;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'time'>) => Transaction;
  onDeleteTransaction: (id: string) => void;
}

export function CashFlowModule({ transactions, profile, onAddTransaction, onDeleteTransaction }: CashFlowModuleProps) {
  // Navigation: either 'feed' or 'add-expense'
  const [viewState, setViewState] = useState<'feed' | 'add-expense'>('feed');

  // New Expense form state
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  // Feed Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'expense'>('all');

  // Categories list based on selected profile niche
  const expenseCategories = DEFAULT_CATEGORIES[profile.niche]?.expense || DEFAULT_CATEGORIES['feira'].expense;

  // Set default category when starting add-expense view
  const triggerAddExpenseForm = () => {
    if (expenseCategories.length > 0) {
      setExpenseCategory(expenseCategories[0]);
    }
    setViewState('add-expense');
  };

  // Registering Expense Submit
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expenseAmount.replace(',', '.'));
    if (!expenseDesc.trim() || isNaN(amountNum) || amountNum <= 0) return;

    onAddTransaction({
      type: 'expense',
      description: expenseDesc.trim(),
      amount: amountNum,
      category: expenseCategory || 'Geral',
    });

    // Reset Form
    setExpenseDesc('');
    setExpenseAmount('');
    setViewState('feed');
  };

  // Feed filtering logic
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div id="cashflow-container" className="flex-1 flex flex-col overflow-hidden bg-slate-950 font-sans">
      
      {viewState === 'feed' ? (
        <>
          {/* Header Area with sticky quick search & filter */}
          <div className="bg-slate-900 p-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Fluxo de Caixa</span>
                <span className="text-sm font-black text-white">Entradas e Saídas</span>
              </div>
              <button
                id="btn-trigger-add-expense"
                onClick={triggerAddExpenseForm}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 py-2 px-3 rounded-xl text-xs font-bold active:scale-95 transition-all outline-none flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Lançar Gasto
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                id="input-search-transaction"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar venda ou gasto..."
                className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Filter Pill List */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              {[
                { id: 'all', label: 'Tudo' },
                { id: 'sale', label: '🟢 Só Vendas' },
                { id: 'expense', label: '🔴 Só Gastos' }
              ].map((pill) => (
                <button
                  id={`btn-filter-pill-${pill.id}`}
                  key={pill.id}
                  onClick={() => setFilterType(pill.id as any)}
                  className={`px-3.5 py-1.5 rounded-full text-[10px] font-extrabold whitespace-nowrap transition-all ${
                    filterType === pill.id
                      ? 'bg-indigo-500 text-slate-950 shadow-sm'
                      : 'bg-slate-950 hover:bg-slate-850 text-slate-400'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions List */}
          <div className="flex-1 overflow-y-auto px-4 pb-20 pt-3">
            {filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 px-6">
                <SlidersHorizontal className="w-10 h-10 text-slate-700 mb-2.5" />
                <p className="text-xs text-slate-400 font-bold mb-1">Nenhum lançamento encontrado</p>
                <p className="text-[10px] text-slate-500">Tente ajustar o termo da pesquisa ou crie um novo registro de venda ou gasto.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredTransactions.slice().reverse().map((trans) => {
                  const isSale = trans.type === 'sale';
                  return (
                    <div
                      id={`transaction-row-${trans.id}`}
                      key={trans.id}
                      className="bg-slate-900 border border-slate-850 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-inner hover:border-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {/* Flow Status Icon */}
                        <div className={`p-2 rounded-xl shrink-0 ${
                          isSale ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {isSale ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-black text-slate-200 truncate leading-snug">{trans.description}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-400 font-medium">
                            <span className="bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 border border-slate-850 uppercase text-[8px] font-extrabold">{trans.category}</span>
                            <span>•</span>
                            <span>Hoje, {trans.time}</span>
                            {trans.paymentMethod && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-400 font-bold uppercase">{trans.paymentMethod}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5 shrink-0">
                        <span className={`text-xs font-black font-mono ${
                          isSale ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {isSale ? '+' : '-'}{formatCurrency(trans.amount)}
                        </span>
                        
                        <button
                          id={`btn-delete-trans-${trans.id}`}
                          onClick={() => onDeleteTransaction(trans.id)}
                          className="p-1.5 text-slate-600 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer outline-none active:scale-90"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        /* REGISTER EXPENSE VIEW */
        <div id="add-expense-container" className="flex-1 flex flex-col justify-between p-5 bg-slate-950 overflow-y-auto">
          
          <div className="flex-1 flex flex-col justify-start">
            {/* Form Back Button */}
            <button
              id="btn-back-to-feed"
              onClick={() => setViewState('feed')}
              className="mt-1 mb-5 text-slate-400 hover:text-white flex items-center gap-1 text-xs font-bold leading-none outline-none"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao Histórico
            </button>

            <div className="mb-5">
              <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 border border-rose-500/20 rounded-full uppercase tracking-wider font-bold">Saída de Dinheiro</span>
              <h2 className="text-xl font-bold text-white tracking-tight mt-1.5">Registrar Novo Gasto</h2>
              <p className="text-[10px] text-slate-400 mt-1">Registrar insumos, mercadoria branca, taxas ou despesas de transporte para ver o lucro limpo no fim do mês.</p>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Qual foi a despesa? (Descrição)
                </label>
                <input
                  id="input-expense-desc"
                  type="text"
                  required
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="Ex: Sacolas plásticas, Reposição de gás, Farinha"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Valor Gasto (R$)
                  </label>
                  <input
                    id="input-expense-amount"
                    type="text"
                    required
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-white text-right placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Categoria do Gasto
                  </label>
                  <select
                    id="select-expense-cat"
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    {expenseCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="Outros">Outras Despesas</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          <div className="mt-8 space-y-3 shrink-0">
            <button
              id="btn-submit-expense-form"
              onClick={handleAddExpense}
              className="w-full bg-rose-500 hover:bg-rose-400 text-slate-950 font-black py-3.5 px-4 rounded-2xl active:scale-95 transition-all text-sm outline-none flex items-center justify-center gap-1"
            >
              Salvar Saída ({expenseAmount ? 'R$ ' + expenseAmount : 'R$ 0,00'})
            </button>
            <button
              id="btn-cancel-expense"
              onClick={() => setViewState('feed')}
              className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 py-3.5 px-4 rounded-2xl text-sm font-bold outline-none"
            >
              Cancelar
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
