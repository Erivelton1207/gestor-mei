/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, Landmark, ClipboardList, Package, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Custom types & helper utilities
import { Transaction, QuickProduct, BusinessProfile, NicheType } from './types';
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES } from './utils';

// Core component modules
import { MobileFrame } from './components/MobileFrame';
import { BusinessSetup } from './components/BusinessSetup';
import { DashboardModule } from './components/DashboardModule';
import { POSModule } from './components/POSModule';
import { CashFlowModule } from './components/CashFlowModule';
import { ProductCatalog } from './components/ProductCatalog';
import { ReportModule } from './components/ReportModule';

export default function App() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<QuickProduct[]>([]);
  
  // Navigation tabs 'dashboard' | 'checkout' | 'cashflow' | 'catalog' | 'reports'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'checkout' | 'cashflow' | 'catalog' | 'reports'>('dashboard');

  // Load baseline configurations from localStorage
  useEffect(() => {
    const storedProfile = localStorage.getItem('mei_profile_v2');
    const storedTrans = localStorage.getItem('mei_transactions_v2');
    const storedProds = localStorage.getItem('mei_products_v2');

    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
    if (storedTrans) {
      setTransactions(JSON.parse(storedTrans));
    }
    if (storedProds) {
      setProducts(JSON.parse(storedProds));
    }
  }, []);

  // Set Profile complete + bootstrap default products & sample sales/expenses
  const handleOnboardingComplete = (newProfile: BusinessProfile) => {
    // 1. Get default products for this niche
    const rawDefaultProducts = DEFAULT_PRODUCTS[newProfile.niche] || DEFAULT_PRODUCTS['feira'];
    const formattedProducts: QuickProduct[] = rawDefaultProducts.map((p, idx) => ({
      id: `prod_${idx}_${Date.now()}`,
      name: p.name,
      price: p.price,
      category: p.category
    }));

    // 2. Generate lovely sample transactions corresponding to yesterday and today
    // This allows active dashboards, goal progress visible immediately on boot up!
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString().split('T')[0];

    // Pick two default product references for sample sales
    const sampleItem1: QuickProduct = formattedProducts[0] || { id: 'dummy1', name: 'Item Geral Venda', price: 12.00, category: 'Vendas' };
    const sampleItem2: QuickProduct = formattedProducts[1] || { id: 'dummy2', name: 'Item Adicional', price: 20.00, category: 'Vendas' };
    
    // Pick default expense category
    const defaultExpenseCat = DEFAULT_CATEGORIES[newProfile.niche]?.expense[0] || 'Insumos';

    const sampleTransactions: Transaction[] = [
      {
        id: `t_sample_1_${Date.now()}`,
        type: 'sale',
        description: `1x ${sampleItem1.name}`,
        amount: sampleItem1.price,
        date: yesterdayISO,
        time: '14:30',
        paymentMethod: 'pix',
        category: sampleItem1.category,
        quantity: 1,
        productId: sampleItem1.id
      },
      {
        id: `t_sample_2_${Date.now()}`,
        type: 'expense',
        description: 'Reposição de Material / Insumos do box',
        amount: Math.round(newProfile.dailyGoal * 0.4), // 40% of standard daily target
        date: yesterdayISO,
        time: '16:15',
        category: defaultExpenseCat
      },
      {
        id: `t_sample_3_${Date.now()}`,
        type: 'sale',
        description: `2x ${sampleItem2.name}`,
        amount: sampleItem2.price * 2,
        date: todayISO,
        time: '10:45',
        paymentMethod: 'money',
        category: sampleItem2.category,
        quantity: 2,
        productId: sampleItem2.id
      }
    ];

    // Commiting all states
    setProfile(newProfile);
    setProducts(formattedProducts);
    setTransactions(sampleTransactions);

    // Persist lists in localStorage
    localStorage.setItem('mei_profile_v2', JSON.stringify(newProfile));
    localStorage.setItem('mei_products_v2', JSON.stringify(formattedProducts));
    localStorage.setItem('mei_transactions_v2', JSON.stringify(sampleTransactions));
  };

  // Transaction mutation operations
  const handleAddNewTransaction = (newTData: Omit<Transaction, 'id' | 'date' | 'time'>) => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const timeStr = today.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newTransaction: Transaction = {
      ...newTData,
      id: `t_${Date.now()}`,
      date: dateStr,
      time: timeStr
    };

    const updated = [...transactions, newTransaction];
    setTransactions(updated);
    localStorage.setItem('mei_transactions_v2', JSON.stringify(updated));

    return newTransaction;
  };

  const handleDeleteTransaction = (id: string) => {
    const filtered = transactions.filter(t => t.id !== id);
    setTransactions(filtered);
    localStorage.setItem('mei_transactions_v2', JSON.stringify(filtered));
  };

  // Product Catalog mutations
  const handleAddProduct = (newProd: Omit<QuickProduct, 'id'>) => {
    const created: QuickProduct = {
      ...newProd,
      id: `prod_${Date.now()}`
    };

    const updated = [...products, created];
    setProducts(updated);
    localStorage.setItem('mei_products_v2', JSON.stringify(updated));
  };

  const handleDeleteProduct = (id: string) => {
    const filtered = products.filter(p => p.id !== id);
    setProducts(filtered);
    localStorage.setItem('mei_products_v2', JSON.stringify(filtered));
  };

  const handleUpdateProductStock = (updates: { productId: string; quantitySold: number }[]) => {
    const updatedProducts = products.map(prod => {
      const match = updates.find(u => u.productId === prod.id);
      if (match && prod.stockQuantity !== undefined && prod.stockQuantity !== null) {
        const newQty = Math.max(0, prod.stockQuantity - match.quantitySold);
        return {
          ...prod,
          stockQuantity: Number(newQty.toFixed(2))
        };
      }
      return prod;
    });
    setProducts(updatedProducts);
    localStorage.setItem('mei_products_v2', JSON.stringify(updatedProducts));
  };

  // Profile data reset helper (useful for onboarding demonstration)
  const handleResetApplication = () => {
    if (confirm('Deseja resetar o aplicativo? Todos os seus faturamentos e despesas cadastrados serão excluídos permanetemente.')) {
      localStorage.removeItem('mei_profile_v2');
      localStorage.removeItem('mei_transactions_v2');
      localStorage.removeItem('mei_products_v2');

      setProfile(null);
      setTransactions([]);
      setProducts([]);
      setActiveTab('dashboard');
    }
  };

  return (
    <MobileFrame>
      <div className="flex-grow flex flex-col h-full overflow-hidden bg-slate-950 text-slate-100">
        
        {/* Conditional state: Display Onboarding Setup or standard Application layout */}
        {!profile ? (
          <BusinessSetup onSetupComplete={handleOnboardingComplete} />
        ) : (
          <>
            {/* Top tiny utility bar containing business reset button */}
            <div className="bg-slate-950 px-4 pt-4 pb-1 shrink-0 flex items-center justify-between border-b border-slate-900 select-none">
              <span className="text-xs font-black tracking-tight text-white flex items-center gap-1">
                ⚙️ <span className="text-slate-400">Config:</span> {profile.name}
              </span>
              
              <button
                id="btn-app-reset"
                onClick={handleResetApplication}
                title="Resetar dados do app"
                className="text-[10px] text-slate-500 hover:text-rose-400 font-bold bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-850 hover:border-rose-500/20 active:scale-95 transition-all outline-none"
              >
                Resetar Dados
              </button>
            </div>

            {/* Displaying active Content Modules based on Navigation tab */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="w-full h-full flex flex-col overflow-hidden"
                >
                  {activeTab === 'dashboard' && (
                    <DashboardModule
                      transactions={transactions}
                      profile={profile}
                      products={products}
                      onNavigateToPOS={() => setActiveTab('checkout')}
                    />
                  )}

                  {activeTab === 'checkout' && (
                    <POSModule
                      products={products}
                      profile={profile}
                      onAddTransaction={handleAddNewTransaction}
                      onUpdateStocks={handleUpdateProductStock}
                    />
                  )}

                  {activeTab === 'cashflow' && (
                    <CashFlowModule
                      transactions={transactions}
                      profile={profile}
                      onAddTransaction={handleAddNewTransaction}
                      onDeleteTransaction={handleDeleteTransaction}
                    />
                  )}

                  {activeTab === 'catalog' && (
                    <ProductCatalog
                      products={products}
                      profile={profile}
                      onAddProduct={handleAddProduct}
                      onDeleteProduct={handleDeleteProduct}
                    />
                  )}

                  {activeTab === 'reports' && (
                    <ReportModule
                      transactions={transactions}
                      profile={profile}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Sticky bottom Mobile-specific styled menu navigation bar */}
            <div className="h-16 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 shrink-0 px-1 py-1 z-35 flex justify-around items-center select-none">
              {[
                { id: 'dashboard', label: 'Painel', icon: <LayoutDashboard className="w-4 h-4" /> },
                { id: 'checkout', label: 'Caixa', icon: <ShoppingCart className="w-4 h-4" /> },
                { id: 'cashflow', label: 'Caixa Filtro', icon: <Landmark className="w-4 h-4" /> },
                { id: 'catalog', label: 'Estoque', icon: <Package className="w-4 h-4" /> },
                { id: 'reports', label: 'MEI Guia', icon: <ClipboardList className="w-4 h-4" /> },
              ].map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    id={`btn-nav-tab-${tab.id}`}
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex flex-col items-center justify-center flex-1 h-full rounded-xl gap-1 transition-all outline-none ${
                      isSelected
                        ? 'text-emerald-400 bg-emerald-500/5'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="relative">
                      {tab.icon}
                      {/* Interactive alert badge icon inside menu for notification cue */}
                      {tab.id === 'reports' && transactions.length > 5 && (
                        <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-indigo-500 rounded-full"></span>
                      )}
                    </div>
                    <span className="text-[10px] font-extrabold tracking-wide font-sans">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

      </div>
    </MobileFrame>
  );
}
