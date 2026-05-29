/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, FileText, CheckSquare, Square, Info, ShieldAlert, Award, ChevronRight, Copy, Check, Printer } from 'lucide-react';
import { Transaction, BusinessProfile } from '../types';
import { formatCurrency } from '../utils';

interface ReportModuleProps {
  transactions: Transaction[];
  profile: BusinessProfile;
}

export function ReportModule({ transactions, profile }: ReportModuleProps) {
  const [dasPaid, setDasPaid] = useState(false);
  const [copiedReportText, setCopiedReportText] = useState(false);

  // Time calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7); // "YYYY-MM"

  // Monthly values
  const monthlyTrans = transactions.filter(t => t.date.startsWith(currentMonthStr));
  const monthlySales = monthlyTrans.filter(t => t.type === 'sale').reduce((sum, curr) => sum + curr.amount, 0);
  const monthlyExpenses = monthlyTrans.filter(t => t.type === 'expense').reduce((sum, curr) => sum + curr.amount, 0);
  const monthlyProfit = monthlySales - monthlyExpenses;

  // Annual values (accumulating current year)
  const currentYear = todayStr.split('-')[0];
  const annualSales = transactions
    .filter(t => t.date.startsWith(currentYear) && t.type === 'sale')
    .reduce((sum, curr) => sum + curr.amount, 0);

  // MEI legal ceiling is R$ 81.000,00 per year
  const meiCeiling = 81000;
  const currentCeilingPercent = Math.min((annualSales / meiCeiling) * 100, 100);

  // Estimated DAS tax payment depending on NicheType
  const getDasEstValue = () => {
    switch (profile.niche) {
      case 'feira':
      case 'comercio':
        return { value: 76.60, activity: 'Comércio / Microindústrias (DAS-SIMEI)' };
      case 'comida':
        return { value: 77.60, activity: 'Comércio e Alimentação (DAS-SIMEI)' };
      case 'beleza':
        return { value: 81.60, activity: 'Serviços Gerais (DAS-SIMEI)' };
      case 'artesanato':
        return { value: 76.60, activity: 'Costura e Artesanato (DAS-SIMEI)' };
      default:
        return { value: 80.60, activity: 'DAS Geral MEI' };
    }
  };

  const dasDetails = getDasEstValue();

  // Export Plain Text Summary to clipboard for accountant or simple ledger
  const handleCopyReport = () => {
    const reportText = 
      `📊 *Relatório de Caixa MEI - ${profile.name}*\n` +
      `📅 *Mês de Referência:* ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}\n` +
      `-----------------------------------------\n` +
      `🟢 *Faturamento total (Vendas):* ${formatCurrency(monthlySales)}\n` +
      `🔴 *Custo total (Gastos/Insumos):* ${formatCurrency(monthlyExpenses)}\n` +
      `💵 *Lucro Líquido de Caixa:* ${formatCurrency(monthlyProfit)}\n` +
      `📈 *Faturamento Acumulado Ano (${currentYear}):* ${formatCurrency(annualSales)}\n` +
      `📌 *Status do Guia DAS-SIMEI:* ${dasPaid ? 'PAGO (Feito)' : 'CONTRA-APRESENTAÇÃO / PENDENTE'}\n` +
      `-----------------------------------------\n` +
      `Gerado automaticamente pelo aplicativo Gestor Financeiro MEI.`;

    navigator.clipboard.writeText(reportText).then(() => {
      setCopiedReportText(true);
      setTimeout(() => setCopiedReportText(false), 3000);
    });
  };

  return (
    <div id="reports-container" className="flex-1 flex flex-col overflow-y-auto px-4 pb-20 pt-2 bg-slate-950 font-sans">
      
      {/* Header */}
      <div className="mb-4 mt-1">
        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Prestação de Contas</span>
        <h2 className="text-xl font-bold text-white tracking-tight">Painel do MEI Simplificado</h2>
        <p className="text-[10px] text-slate-400">Aqui você cuida das obrigações do seu MEI para não perder seus direitos à aposentadoria, auxílio e CNPJ regularizado!</p>
      </div>

      {/* Thermometer Gauge: MEI Limit */}
      <div className="bg-slate-900 border border-slate-850 p-4 rounded-3xl mb-4">
        <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          Limite do Faturamento Anual MEI
        </h3>
        
        <p className="text-[10px] text-slate-400 leading-normal mb-3">
          O limite atual de faturamento do MEI é de <strong className="text-white">{formatCurrency(meiCeiling)}</strong> ao ano. Se passar disso, você precisa mudar para Microempresa.
        </p>

        <div className="flex justify-between items-baseline mb-1 font-mono">
          <span className="text-sm font-black text-white">{formatCurrency(annualSales)} <span className="text-[10px] text-slate-400 font-sans">faturado</span></span>
          <span className="text-[10px] text-slate-400">limite: {formatCurrency(meiCeiling)}</span>
        </div>

        {/* Legal Thermometer progress meter */}
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden mt-1 p-[2px] border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              currentCeilingPercent >= 80
                ? 'bg-rose-500'
                : currentCeilingPercent >= 50
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${currentCeilingPercent || 3}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center mt-2">
          <span className="text-[9px] text-slate-400">Progresso do limite anual</span>
          <span className="text-[10px] font-bold text-emerald-400">
            {currentCeilingPercent.toFixed(1)}% utilizado
          </span>
        </div>
      </div>

      {/* Monthly DAS Reminder Checklist section */}
      <div className="bg-slate-900 border border-slate-850 p-4 rounded-3xl mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Guia DAS-SIMEI do Mês
            </h3>
            <span className="text-[9px] text-slate-400 block mt-0.5">{dasDetails.activity}</span>
          </div>
          <span className="text-xs font-black text-indigo-400 font-mono">{formatCurrency(dasDetails.value)}</span>
        </div>

        <p className="text-[10px] text-slate-400 leading-normal mb-4">
          Pagar a DAS garante seu INSS para aposentadoria, auxílio-doença, salário-maternidade e mantém seu CNPJ com direitos fiscais em dia.
        </p>

        {/* Paid checkbox styled helper button */}
        <button
          id="btn-toggle-das-paid"
          onClick={() => setDasPaid(!dasPaid)}
          className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all outline-none ${
            dasPaid
              ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400'
              : 'bg-slate-950 border-slate-850 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="shrink-0">
              {dasPaid ? (
                <div className="w-5 h-5 rounded bg-emerald-500 text-slate-950 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[4]" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded border-2 border-slate-700"></div>
              )}
            </span>
            <span className="text-xs font-extrabold text-slate-200">
              {dasPaid ? 'Guia DAS Paga este mês!' : 'Definir Guia DAS como Paga'}
            </span>
          </div>
          {dasPaid && <span className="text-[9.5px] font-black uppercase text-emerald-400 tracking-wider">Feito!</span>}
        </button>
      </div>

      {/* Accountant report export area */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-850 p-4.5 rounded-3xl">
        <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-emerald-400" />
          Relatório de Caixa Mensal
        </h3>
        <p className="text-[10px] text-slate-400 leading-normal mb-4">
          Copie o fechamento do caixa para mandar direto no grupo do WhatsApp da família ou para o seu contador local!
        </p>

        {/* Small in-screen mini summary ledger box */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-900 space-y-1.5 text-xs text-slate-300 font-mono mb-4 text-left">
          <div className="flex justify-between border-b border-slate-900 pb-1.5 text-[10px] text-slate-500 font-sans tracking-wide font-black uppercase">
            <span>Descrição Caixa</span>
            <span>Valor BRL</span>
          </div>
          <div className="flex justify-between font-sans pt-1">
            <span className="text-slate-400">🟢 Entradas (Vendas):</span>
            <span className="text-emerald-400 font-bold font-mono">{formatCurrency(monthlySales)}</span>
          </div>
          <div className="flex justify-between font-sans">
            <span className="text-slate-400">🔴 Saídas (Compras):</span>
            <span className="text-rose-400 font-bold font-mono">{formatCurrency(monthlyExpenses)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-900 pt-2 font-sans font-black">
            <span className="text-white">💰 Saldo Líquido:</span>
            <span className="text-white font-mono">{formatCurrency(monthlyProfit)}</span>
          </div>
        </div>

        <button
          id="btn-copy-accountant-report"
          onClick={handleCopyReport}
          className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white font-bold py-3 px-4 rounded-2xl active:scale-95 transition-all text-xs flex items-center justify-center gap-2 outline-none"
        >
          <Copy className="w-3.5 h-3.5 text-emerald-400" />
          {copiedReportText ? 'Copiado para a sua área de transferência!' : 'Copiar Resumo Mensal p/ WhatsApp'}
        </button>
      </div>

    </div>
  );
}
