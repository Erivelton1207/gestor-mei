/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Wallet, Award, Percent, Calendar, CheckCircle2, MessageCircle, AlertTriangle } from 'lucide-react';
import { Transaction, BusinessProfile, QuickProduct } from '../types';
import { formatCurrency, formatDateBr } from '../utils';

interface DashboardModuleProps {
  transactions: Transaction[];
  profile: BusinessProfile;
  products: QuickProduct[];
  onNavigateToPOS: () => void;
}

export function DashboardModule({ transactions, profile, products, onNavigateToPOS }: DashboardModuleProps) {
  // Get date strings
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM

  // Filtering transactions
  const todaysSales = transactions.filter(t => t.date === todayStr && t.type === 'sale');
  const todaysTotalSales = todaysSales.reduce((acc, curr) => acc + curr.amount, 0);

  const monthlyTrans = transactions.filter(t => t.date.startsWith(currentMonthStr));
  const monthlySales = monthlyTrans.filter(t => t.type === 'sale');
  const monthlyTotalSales = monthlySales.reduce((acc, curr) => acc + curr.amount, 0);

  const monthlyExpenses = monthlyTrans.filter(t => t.type === 'expense');
  const monthlyTotalExpenses = monthlyExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const netMonthlyProfit = monthlyTotalSales - monthlyTotalExpenses;
  const marginPercentage = monthlyTotalSales > 0 ? (netMonthlyProfit / monthlyTotalSales) * 100 : 0;

  // Goals percentage calculation
  const dailyGoalPercent = Math.min((todaysTotalSales / profile.dailyGoal) * 100, 100);
  const monthlyGoalPercent = Math.min((monthlyTotalSales / profile.monthlyGoal) * 100, 100);

  // Weekly breakdown for simple SVG chart
  const getLast7Days = () => {
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      
      const daySales = transactions
        .filter(t => t.date === str && t.type === 'sale')
        .reduce((sum, current) => sum + current.amount, 0);

      // Short format for label "Seg", "Ter", etc.
      const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const textLabel = i === 0 ? 'Hoje' : daysOfWeek[d.getDay()];

      arr.push({ dateStr: str, label: textLabel, sales: daySales });
    }
    return arr;
  };

  const weeklyData = getLast7Days();
  const maxWeeklySale = Math.max(...weeklyData.map(w => w.sales), 100); // preserve min scale is R$ 100

  // Payment Breakdown
  const paymentBreakdown = { pix: 0, money: 0, card: 0 };
  monthlySales.forEach(s => {
    if (s.paymentMethod) {
      paymentBreakdown[s.paymentMethod] += s.amount;
    }
  });
  const totalPaymentCategorized = paymentBreakdown.pix + paymentBreakdown.money + paymentBreakdown.card || 1;

  // Smart suggestions
  const getSuggestion = () => {
    if (todaysTotalSales >= profile.dailyGoal) {
      return {
        title: 'Parabéns! Meta do dia batida!',
        desc: 'Você alcançou sua meta diária hoje. Guarde uma parte para expandir o estoque!',
        status: 'success'
      };
    } else if (todaysTotalSales > 0) {
      const rest = profile.dailyGoal - todaysTotalSales;
      return {
        title: 'Falta pouco para a meta diária!',
        desc: `Faltam apenas ${formatCurrency(rest)} em vendas hoje para atingir seu objetivo. Que tal enviar uma mensagem para clientes frequentes?`,
        status: 'warning'
      };
    } else {
      return {
        title: 'Pronto para começar as vendas de hoje?',
        desc: 'Abra a Frente de Caixa para fazer seu primeiro registro de venda. Vamos buscar a meta!',
        status: 'info'
      };
    }
  };

  const suggestion = getSuggestion();

  return (
    <div id="dashboard-container" className="flex-1 flex flex-col overflow-y-auto px-4 pb-20 pt-2 bg-slate-950 font-sans">
      
      {/* Profiler Header inside App */}
      <div className="flex items-center justify-between mb-4 mt-1">
        <div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
            {profile.niche === 'feira' ? '🍎 Feira/Local' : profile.niche === 'comida' ? '🍔 Lanches/Quitanda' : profile.niche === 'beleza' ? '✂️ Beleza/Micro' : profile.niche === 'artesanato' ? '🧶 Artesanato' : '🛍️ Comércio'}
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">{profile.name}</h2>
          <p className="text-[10px] text-slate-400">Olá, <span className="text-emerald-300 font-medium">{profile.ownerName}</span>! Boas vendas!</p>
        </div>
        <button
          id="btn-quick-sell-dashboard"
          onClick={onNavigateToPOS}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 px-3.5 rounded-xl shadow-lg shadow-emerald-500/10 active:scale-95 transition-all outline-none"
        >
          + Registrar Venda
        </button>
      </div>

      {/* Target Progress Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4.5 mb-4 shadow-sm relative overflow-hidden">
        <h3 className="text-xs font-bold text-slate-400 mb-2 flex items-center justify-between">
          <span>Meta do Dia</span>
          <span className="text-slate-500 font-mono text-[9px] uppercase tracking-wider">Acumulado</span>
        </h3>
        
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-2xl font-black text-white tracking-tight">{formatCurrency(todaysTotalSales)}</span>
          <span className="text-[11px] text-slate-400">meta: <strong className="text-emerald-400">{formatCurrency(profile.dailyGoal)}</strong></span>
        </div>

        {/* Custom Progress Bar */}
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden mt-2 p-[2px] border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              dailyGoalPercent >= 100
                ? 'bg-gradient-to-r from-emerald-500 to-indigo-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${dailyGoalPercent}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between items-center mt-2.5">
          <span className="text-[10px] text-slate-400 font-medium">Progresso</span>
          <span className={`text-[10px] font-black ${dailyGoalPercent >= 100 ? 'text-indigo-400' : 'text-emerald-400'}`}>
            {Math.round(dailyGoalPercent)}% batido
          </span>
        </div>
      </div>

      {/* Real-time low stock warnings on Dashboard */}
      {products && products.some(p => p.stockQuantity !== undefined && p.stockQuantity !== null && p.stockQuantity <= (p.minStockTrigger !== undefined ? p.minStockTrigger : 1)) && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-4 mb-4">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1 select-none w-full">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest leading-none flex items-center justify-between w-full">
                <span>⚠️ Estoque quase acabando!</span>
                <span className="text-[9px] font-mono lowercase tracking-normal text-slate-500">Alerta</span>
              </h4>
              <p className="text-[10px] text-slate-400 mt-1">Os seguintes produtos atingiram o limite mínimo em estoque:</p>
              <div className="mt-2 text-xs divide-y divide-slate-850/30 space-y-1.5 pt-1">
                {products
                  .filter(p => p.stockQuantity !== undefined && p.stockQuantity !== null && p.stockQuantity <= (p.minStockTrigger !== undefined ? p.minStockTrigger : 1))
                  .map(p => (
                    <div key={p.id} className="flex justify-between items-center text-xs pt-1.5 first:pt-0">
                      <span className="text-slate-300 font-medium truncate max-w-[180px]">{p.name}</span>
                      <span className="text-[10px] font-mono text-rose-400 font-extrabold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        {p.stockQuantity} {p.unit || 'un'} restantes
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cash Flow Balance Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Entradas (Sales) */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entradas (Mês)</span>
            <div className="p-1 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-black text-white tracking-tight">{formatCurrency(monthlyTotalSales)}</p>
          <div className="w-full h-1 bg-slate-950 rounded-full mt-2.5 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${monthlyGoalPercent}%` }}></div>
          </div>
          <span className="text-[8px] text-slate-400 block mt-1">Meta mensal: {Math.round(monthlyGoalPercent)}%</span>
        </div>

        {/* Saídas (Expenses) */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saídas (Mês)</span>
            <div className="p-1 bg-rose-500/10 text-rose-400 rounded-lg">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-black text-rose-400 tracking-tight">{formatCurrency(monthlyTotalExpenses)}</p>
          <p className="text-[8px] text-slate-400 mt-2.5">Equivale a em despesas reais catalogadas.</p>
        </div>
      </div>

      {/* Lucro de Caixa Box */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-4.5 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-300">Sobrou em Caixa (Mês)</h4>
            <p className="text-lg font-black text-white tracking-tight">{formatCurrency(netMonthlyProfit)}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
            netMonthlyProfit >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            <Percent className="w-3 h-3" />
            {marginPercentage.toFixed(0)}% margem
          </span>
          <p className="text-[8px] text-slate-500 mt-1">Margem de lucro estimado</p>
        </div>
      </div>

      {/* Smart Business Recommendation Suggestion banner */}
      <div className={`p-4 rounded-2xl mb-4 border flex gap-3 ${
        suggestion.status === 'success'
          ? 'bg-emerald-900/10 border-emerald-500/20 text-emerald-300'
          : suggestion.status === 'warning'
          ? 'bg-amber-900/15 border-amber-500/20 text-amber-300'
          : 'bg-indigo-900/10 border-indigo-500/20 text-indigo-300'
      }`}>
        <div className="shrink-0 mt-0.5">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div>
          <h5 className="text-xs font-bold mb-1">{suggestion.title}</h5>
          <p className="text-[10px] text-slate-400 leading-normal">{suggestion.desc}</p>
        </div>
      </div>

      {/* Historical Sales Chart (Visual Custom SVG) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 mb-4">
        <h4 className="text-xs font-bold text-slate-400 mb-3 flex items-center justify-between">
          <span>Evolução de Vendas (Últimos 7 Dias)</span>
          <span className="text-[9px] text-indigo-400 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" /> Faturamento Diário
          </span>
        </h4>
        
        {/* Simple inline responsive graph */}
        <div className="h-28 flex items-end justify-between gap-1.5 px-2 pt-4">
          {weeklyData.map((day, dIdx) => {
            const heightPercent = day.sales > 0 ? (day.sales / maxWeeklySale) * 75 + 10 : 4; // minimum 4% visual bar
            return (
              <div key={dIdx} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                
                {/* Floating tooltip on hover */}
                <span className="absolute -top-7 text-[9px] font-black bg-slate-950 text-emerald-400 px-1 py-0.5 rounded border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none shadow-lg tracking-tight">
                  {formatCurrency(day.sales)}
                </span>

                {/* Vertical Bar */}
                <div className="w-full rounded-t-lg bg-slate-950 relative overflow-hidden h-20 flex flex-col justify-end">
                  <div
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      day.sales >= profile.dailyGoal
                        ? 'bg-gradient-to-t from-emerald-500 to-indigo-500'
                        : day.sales > 0
                        ? 'bg-emerald-500/80'
                        : 'bg-slate-800/40'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                </div>

                {/* Day label */}
                <span className="text-[8px] text-slate-400 font-bold mt-1.5 truncate max-w-full text-center">
                  {day.label}
                </span>

              </div>
            );
          })}
        </div>
      </div>

      {/* Payment methods and business statistics */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4">
        <h4 className="text-xs font-bold text-slate-400 mb-3">Formas de Pagamento (Mês Atual)</h4>
        
        <div className="space-y-2.5">
          {[
            { id: 'pix', label: 'Pix Instantâneo', color: 'bg-teal-400', amount: paymentBreakdown.pix },
            { id: 'money', label: 'Dinheiro Vivinho', color: 'bg-emerald-400', amount: paymentBreakdown.money },
            { id: 'card', label: 'Cartão de Crédito/Débito', color: 'bg-indigo-400', amount: paymentBreakdown.card }
          ].map((item) => {
            const pct = Math.round((item.amount / totalPaymentCategorized) * 100) || 0;
            return (
              <div key={item.id}>
                <div className="flex justify-between text-[10px] mb-1 font-semibold">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                    {item.label}
                  </span>
                  <span className="text-white font-bold">{formatCurrency(item.amount)} ({pct}%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
