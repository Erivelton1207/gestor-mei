/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Apple, ChefHat, Scissors, Palette, ShoppingBag, ArrowRight, User, Building, Target, Sparkles } from 'lucide-react';
import { NicheType, BusinessProfile } from '../types';
import { getNicheLabel } from '../utils';

interface BusinessSetupProps {
  onSetupComplete: (profile: BusinessProfile) => void;
}

export function BusinessSetup({ onSetupComplete }: BusinessSetupProps) {
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [niche, setNiche] = useState<NicheType>('feira');
  const [dailyGoal, setDailyGoal] = useState<number>(150);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(4500);
  const [step, setStep] = useState(1);

  const niches: { type: NicheType; icon: React.ReactNode; desc: string; placeholder: string }[] = [
    {
      type: 'feira',
      icon: <Apple className="w-6 h-6 text-emerald-400 shrink-0" />,
      desc: 'Feirantes, hortifruti, pastelaria da feira ou produtores locais.',
      placeholder: 'Barraca da Família'
    },
    {
      type: 'comida',
      icon: <ChefHat className="w-6 h-6 text-amber-400 shrink-0" />,
      desc: 'Doces de pote, salgados fritos, marmitas, carrinhos de lanche.',
      placeholder: 'Doces da Cláudia'
    },
    {
      type: 'beleza',
      icon: <Scissors className="w-6 h-6 text-pink-400 shrink-0" />,
      desc: 'Cabeleireiros, barbeiros, manicures, designers de sobrancelhas.',
      placeholder: 'Salão Brilho da Comunidade'
    },
    {
      type: 'artesanato',
      icon: <Palette className="w-6 h-6 text-indigo-400 shrink-0" />,
      desc: 'Costura criativa, crochê, bijuterias feitas à mão, presentes.',
      placeholder: 'Artes de Crochê'
    },
    {
      type: 'comercio',
      icon: <ShoppingBag className="w-6 h-6 text-blue-400 shrink-0" />,
      desc: 'Venda de roupas, bazar de bairro, lojinhas de embalagem, variedades.',
      placeholder: 'Bazar Popular'
    }
  ];

  const handleNextStep = () => {
    if (step === 1 && (!name.trim() || !ownerName.trim())) {
      // Just auto-fill some defaults if they press without writing, to make it super friendly
      if (!name.trim()) setName('Meu Negócio Local');
      if (!ownerName.trim()) setOwnerName('Empreendedor');
    }
    setStep(step + 1);
  };

  const handleFinish = () => {
    onSetupComplete({
      name: name.trim() || 'Meu Negócio Local',
      ownerName: ownerName.trim() || 'Empreendedor',
      niche,
      dailyGoal: dailyGoal || 150,
      monthlyGoal: monthlyGoal || 4500,
    });
  };

  return (
    <div id="setup-container" className="flex-1 flex flex-col justify-between p-6 overflow-y-auto bg-slate-950 text-slate-100">
      
      {/* Dynamic Step visualizer */}
      <div className="flex gap-2 mb-6">
        <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
        <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
        <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 3 ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
      </div>

      {step === 1 && (
        <div className="flex-1 flex flex-col justify-start">
          <div className="mb-6">
            <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Bem-vindo ao Gestor MEI!</h1>
            <p className="text-xs text-slate-400">
              O controle do seu dinheiro na palma da mão, planejado para feirantes, quitandeiros, costureiras e trabalhadores autônomos.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                Como chama seu negócio?
              </label>
              <input
                id="input-business-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Barraca do Zé, Sabor de Casa"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Qual o seu nome?
              </label>
              <input
                id="input-owner-name"
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-sans"
              />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex-1 flex flex-col justify-start">
          <div className="mb-5">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Qual é o seu nicho?</h1>
            <p className="text-xs text-slate-400">
              Isso ajuda a carregar suas categorias e produtos ideais de graça!
            </p>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {niches.map((n) => (
              <button
                id={`niche-btn-${n.type}`}
                key={n.type}
                onClick={() => {
                  setNiche(n.type);
                  // Update suggestion default placeholders
                  if (!name) {
                    setName(n.placeholder);
                  }
                }}
                className={`w-full text-left p-3.5 rounded-2xl border flex gap-3.5 transition-all outline-none ${
                  niche === n.type
                    ? 'bg-slate-900 border-emerald-500 ring-1 ring-emerald-500'
                    : 'bg-slate-900/60 border-slate-900 hover:border-slate-800'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${niche === n.type ? 'bg-emerald-500/20' : 'bg-slate-800/80'} shrink-0`}>
                  {n.icon}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white mb-0.5">{getNicheLabel(n.type)}</h3>
                  <p className="text-[10px] text-slate-400 leading-normal">{n.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex-1 flex flex-col justify-start">
          <div className="mb-6">
            <div className="inline-flex p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20 mb-3">
              <Target className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Quais as suas metas?</h1>
            <p className="text-xs text-slate-400">
              Para você visualizar seus objetivos de faturamento diariamente!
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 flex justify-between">
                <span>Meta de Venda Diária</span>
                <span className="text-emerald-400 font-bold">R$ {dailyGoal}</span>
              </label>
              <input
                id="range-daily-goal"
                type="range"
                min="50"
                max="1000"
                step="25"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-[10px] text-slate-500 flex justify-between mt-1">
                <span>R$ 50</span>
                <span>R$ 500</span>
                <span>R$ 1000</span>
              </span>
            </div>

            <div className="mt-6">
              <label className="block text-xs font-semibold text-slate-400 mb-1 flex justify-between">
                <span>Meta de Faturamento Mensal</span>
                <span className="text-indigo-400 font-bold">R$ {monthlyGoal}</span>
              </label>
              <input
                id="range-monthly-goal"
                type="range"
                min="1000"
                max="12000"
                step="500"
                value={monthlyGoal}
                onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[10px] text-slate-500 flex justify-between mt-1">
                <span>R$ 1.000</span>
                <span>R$ 6.500 (Teto MEI aprox.)</span>
                <span>R$ 12.000</span>
              </span>
            </div>

            <div className="bg-slate-900/50 border border-slate-900 p-3.5 rounded-2xl flex items-start gap-2.5 mt-2">
              <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg shrink-0 mt-0.5 text-[10px] font-bold">Dica</div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Manter as metas ajuda a focar nas vendas e controlar o teto anual do MEI (faturamento anual limite de R$ 81.000, equivalente a R$ 6.750/mês).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Button Footer */}
      <div className="mt-8">
        {step < 3 ? (
          <button
            id="btn-next-step"
            onClick={handleNextStep}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-1.5 transition-all text-sm outline-none active:scale-95 duration-100"
          >
            Avançar
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            id="btn-finish-setup"
            onClick={handleFinish}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-1.5 transition-all text-sm outline-none active:scale-95 duration-100"
          >
            Começar Agora!
          </button>
        )}
      </div>

    </div>
  );
}
