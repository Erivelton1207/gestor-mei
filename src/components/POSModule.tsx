/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingCart, Calendar, Plus, Minus, Check, Smartphone, ToggleLeft, ToggleRight, X, Copy, CheckCircle2, ChevronRight, Calculator, ListPlus, AlertTriangle } from 'lucide-react';
import { QuickProduct, Transaction, BusinessProfile } from '../types';
import { formatCurrency } from '../utils';

interface POSModuleProps {
  products: QuickProduct[];
  profile: BusinessProfile;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'time'>) => Transaction;
  onUpdateStocks?: (updates: { productId: string; quantitySold: number }[]) => void;
}

export function POSModule({ products, profile, onAddTransaction, onUpdateStocks }: POSModuleProps) {
  // Mode toggle: 'quick' for catalog products, 'manual' for numeric pad
  const [sellMode, setSellMode] = useState<'quick' | 'manual'>('quick');

  // Manual Mode state
  const [manualAmount, setManualAmount] = useState(''); // empty string represents 0
  const [manualDescription, setManualDescription] = useState('');

  // Quick Product Mode shopping cart state: productId -> quantity
  const [cart, setCart] = useState<Record<string, number>>({});

  // Payment details
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'money' | 'card'>('pix');
  const [selectedCategory, setSelectedCategory] = useState('Venda Geral');

  // Success state
  const [lastInsertedSale, setLastInsertedSale] = useState<Transaction | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Manual Calculator Keypad functions
  const handleNumKey = (num: string) => {
    setManualAmount((prev) => {
      if (prev === '0') return num;
      
      const parts = prev.split('.');
      if (parts[1] && parts[1].length >= 2) {
        return prev;
      }
      
      if (prev.replace('.', '').length >= 7) return prev;
      
      return prev + num;
    });
  };

  const handleCommaKey = () => {
    setManualAmount((prev) => {
      if (prev === '') return '0.';
      if (prev.includes('.')) return prev;
      return prev + '.';
    });
  };

  const handleBackspace = () => {
    setManualAmount((prev) => {
      if (prev.length <= 1) return '';
      return prev.slice(0, -1);
    });
  };

  const clearManual = () => {
    setManualAmount('');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    val = val.replace(',', '.');
    let filtered = val.replace(/[^0-9.]/g, '');
    
    const dotIndex = filtered.indexOf('.');
    if (dotIndex !== -1) {
      filtered = filtered.substring(0, dotIndex + 1) + filtered.substring(dotIndex + 1).replace(/\./g, '');
    }
    
    const parts = filtered.split('.');
    if (parts[1] && parts[1].length > 2) {
      parts[1] = parts[1].slice(0, 2);
      filtered = parts.join('.');
    }
    
    if (parts[0] && parts[0].length > 7) {
      return;
    }
    
    setManualAmount(filtered);
  };

  const getManualNumericValue = () => {
    const parsed = parseFloat(manualAmount);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Cart operations
  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const next = { ...prev };
      if (next[productId] <= 1) {
        delete next[productId];
      } else {
        next[productId]--;
      }
      return next;
    });
  };

  const clearCart = () => {
    setCart({});
  };

  // Total Sale Calculation
  const getCartTotal = () => {
    return Object.entries(cart).reduce((sum, [productId, qty]) => {
      const p = products.find(prod => prod.id === productId);
      const qtyNum = Number(qty);
      return sum + (p ? p.price * qtyNum : 0);
    }, 0);
  };

  const getActiveTotal = () => {
    return sellMode === 'quick' ? getCartTotal() : getManualNumericValue();
  };

  // Submit Sale Handler
  const handleRegisterSale = () => {
    const total = getActiveTotal();
    if (total <= 0) return;

    let transactionDesc = '';
    let categoryToUse = selectedCategory;
    let qtySummary = 0;
    let prodId: string | undefined = undefined;

    if (sellMode === 'quick') {
      const updates: { productId: string; quantitySold: number }[] = [];
      const items = Object.entries(cart).map(([pId, qty]) => {
        const prod = products.find(p => p.id === pId);
        const qtyNum = Number(qty);
        if (prod) {
          qtySummary += qtyNum;
          categoryToUse = prod.category;
          prodId = prod.id;
          
          if (prod.stockQuantity !== undefined && prod.stockQuantity !== null) {
            updates.push({ productId: pId, quantitySold: qtyNum });
          }
          
          return `${qtyNum}x ${prod.name}`;
        }
        return '';
      }).filter(Boolean);
      
      transactionDesc = items.join(', ');

      if (updates.length > 0 && onUpdateStocks) {
        onUpdateStocks(updates);
      }
    } else {
      transactionDesc = manualDescription.trim() || 'Venda Avulsa';
      qtySummary = 1;
    }

    const t = onAddTransaction({
      type: 'sale',
      description: transactionDesc,
      amount: total,
      paymentMethod,
      category: categoryToUse,
      quantity: qtySummary,
      productId: prodId,
    });

    setLastInsertedSale(t);
    // Reset inputs
    setCart({});
    setManualAmount('0');
    setManualDescription('');
  };

  // WhatsApp Digital Receipt Generator
  const generateReceiptText = () => {
    if (!lastInsertedSale) return '';
    const dateFormatted = new Date().toLocaleDateString('pt-BR');
    const timeFormatted = lastInsertedSale.time;
    const paymentLabel = lastInsertedSale.paymentMethod === 'pix' ? 'PIX' : lastInsertedSale.paymentMethod === 'money' ? 'DINHEIRO' : 'CARTÃO';
    
    return `✨ *${profile.name}* ✨\n` + 
           `📄 *Comprovante de Venda*\n` +
           `-----------------------------\n` +
           `📅 *Data:* ${dateFormatted} às ${timeFormatted}\n` +
           `🛍️ *Pedido:* ${lastInsertedSale.description}\n` +
           `💰 *Valor Total:* ${formatCurrency(lastInsertedSale.amount)}\n` +
           `💳 *Forma de Pagto:* ${paymentLabel}\n` +
           `-----------------------------\n` +
           `Vendedor(a): ${profile.ownerName}\n` +
           `Obrigado(a) pela preferência! Volte sempre! ❤️`;
  };

  const handleCopyReceipt = () => {
    const txt = generateReceiptText();
    navigator.clipboard.writeText(txt).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    }).catch(() => {
      // Fallback alert
    });
  };

  return (
    <div id="pos-container" className="flex-1 flex flex-col justify-between overflow-hidden bg-slate-950 font-sans">
      
      {/* If sale completed successfully, display beautiful success overlay */}
      {lastInsertedSale ? (
        <div id="receipt-overlay" className="flex-1 flex flex-col justify-between p-6 bg-slate-900 overflow-y-auto">
          <div className="flex-1 flex flex-col items-center justify-center text-center mt-4">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/20 mb-4 animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">Venda Registrada!</h2>
            <p className="text-xs text-slate-400 max-w-[280px] mb-6">
              Esta venda já foi lançada no seu caixa e atualizou suas metas diárias.
            </p>

            {/* Simulated Printed Paper Receipt */}
            <div className="w-full max-w-[320px] bg-slate-950 text-slate-200 p-5 rounded-2xl border border-slate-850 shadow-inner font-mono text-left relative overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-amber-500 absolute top-0 left-0 right-0"></div>
              <div className="text-center border-b border-dashed border-slate-800 pb-3 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{profile.name}</span>
                <p className="text-[10px] text-slate-500 mt-1">Gestor MEI - Recibo Rápido</p>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Data/Hora:</span>
                  <span className="text-slate-300">Hoje, {lastInsertedSale.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pagto:</span>
                  <span className="text-slate-300 font-bold uppercase text-emerald-300">{lastInsertedSale.paymentMethod}</span>
                </div>
                
                <div className="border-t border-dashed border-slate-800 pt-2.5 my-2">
                  <span className="text-slate-500 block mb-1">Itens vendidos:</span>
                  <span className="text-white text-xs leading-relaxed font-bold font-sans">{lastInsertedSale.description}</span>
                </div>

                <div className="border-t border-dashed border-slate-800 pt-2.5 flex justify-between items-baseline mt-3">
                  <span className="text-sm font-bold text-slate-400">Total Pago:</span>
                  <span className="text-lg font-black text-emerald-400">{formatCurrency(lastInsertedSale.amount)}</span>
                </div>
              </div>
            </div>

            {/* Real-time low stock notification alert on POS complete screen */}
            {products.some(p => p.stockQuantity !== undefined && p.stockQuantity !== null && p.stockQuantity <= (p.minStockTrigger !== undefined ? p.minStockTrigger : 1)) && (
              <div className="w-full max-w-[320px] bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 mt-4 text-left">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-wider mb-1">Atenção: Estoque Baixo!</h4>
                    <div className="space-y-1">
                      {products
                        .filter(p => p.stockQuantity !== undefined && p.stockQuantity !== null && p.stockQuantity <= (p.minStockTrigger !== undefined ? p.minStockTrigger : 1))
                        .map(p => (
                          <p key={p.id} className="text-[10px] text-slate-300">
                            • <strong>{p.name}</strong> tem apenas <span className="text-rose-400 font-bold">{p.stockQuantity} {p.unit || 'un'}</span> restantes.
                          </p>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 mt-6">
            <button
              id="btn-copy-receipt-whatsapp"
              onClick={handleCopyReceipt}
              className="w-full bg-slate-950 hover:bg-slate-850 text-white font-bold py-3.5 px-4 rounded-2xl border border-emerald-500/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2.5 outline-none"
            >
              <Copy className="w-4 h-4 text-emerald-400" />
              {copiedNotification ? 'Copiado para o seu Zap!' : 'Copiar Comprovante p/ Zap'}
            </button>

            <button
              id="btn-new-sale-pos"
              onClick={() => setLastInsertedSale(null)}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 px-4 rounded-2xl active:scale-95 transition-all text-sm outline-none"
            >
              Nova Venda (+ Faturamento)
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Top Panel displaying total order cost */}
          <div className="bg-slate-900 border-b border-slate-800 p-4 shrink-0 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Registrar Venda</span>
              <span className="text-2xl font-black text-emerald-400 tracking-tight">{formatCurrency(getActiveTotal())}</span>
            </div>
            
            {/* Mode Slide Toggle */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-850 flex gap-1">
              <button
                id="toggle-mode-quick"
                onClick={() => setSellMode('quick')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sellMode === 'quick' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Categorias
              </button>
              <button
                id="toggle-mode-manual"
                onClick={() => setSellMode('manual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sellMode === 'manual' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Digitador
              </button>
            </div>
          </div>

          {/* Dynamic Content: Quick Items Catalog or Numeric Keypad (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            {sellMode === 'quick' ? (
              <div className="space-y-4">
                {/* Visual Cart summary list */}
                {Object.keys(cart).length > 0 && (
                  <div className="bg-slate-900/50 border border-slate-850 rounded-2xl p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
                        Sacola do Cliente
                      </span>
                      <button id="btn-clear-cart" onClick={clearCart} className="text-[10px] text-rose-400 hover:underline">Limpar</button>
                    </div>
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                      {Object.entries(cart).map(([pId, qty]) => {
                        const p = products.find(prod => prod.id === pId);
                        if (!p) return null;
                        const qtyNum = Number(qty);
                        return (
                          <div key={pId} className="flex justify-between items-center text-xs gap-2 border-b border-slate-900/40 pb-1.5 pt-1 last:border-b-0">
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-slate-300 font-bold truncate leading-tight">{p.name}</span>
                              <span className="text-[9px] text-slate-500 font-mono mt-0.5">{formatCurrency(p.price)} / {p.unit || 'un'}</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Quantity Decimal Input directly editable in cart! */}
                              <div className="flex items-center gap-1 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded-lg">
                                <input
                                  type="text"
                                  value={qty}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(',', '.');
                                    if (val === '' || !isNaN(Number(val))) {
                                      setCart(prev => ({
                                        ...prev,
                                        [pId]: val === '' ? '' as any : Number(val)
                                      }));
                                    }
                                  }}
                                  onBlur={() => {
                                    const currQty = cart[pId];
                                    if (currQty === undefined || currQty === '' || Number(currQty) <= 0) {
                                      setCart(prev => {
                                        const next = { ...prev };
                                        delete next[pId];
                                        return next;
                                      });
                                    }
                                  }}
                                  className="w-10 bg-transparent text-white text-center text-xs font-black focus:outline-none focus:ring-0 p-0 font-mono"
                                />
                                <span className="text-[9px] text-slate-500 font-bold uppercase">{p.unit || 'un'}</span>
                              </div>

                              <span className="text-slate-200 text-xs font-black font-mono w-14 text-right">
                                {formatCurrency(p.price * qtyNum)}
                              </span>

                              <div className="flex bg-slate-800 rounded-lg overflow-hidden border border-slate-750">
                                <button id={`btn-cart-remove-${pId}`} onClick={() => removeFromCart(pId)} className="p-0.5 text-slate-400 hover:text-rose-400 transition-colors"><Minus className="w-3 h-3" /></button>
                                <button id={`btn-cart-add-${pId}`} onClick={() => addToCart(pId)} className="p-0.5 text-slate-400 hover:text-emerald-400 transition-colors"><Plus className="w-3 h-3" /></button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Grid of quick Products */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 mb-2.5">Toque para adicionar na venda:</h3>
                  {products.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center">
                      <p className="text-xs text-slate-500 mb-2">Sem produtos no seu catálogo simplificado.</p>
                      <p className="text-[10px] text-slate-400">Você pode adicionar mais produtos na aba "Estoque" localizada no menu principal abaixo.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-1">
                      {products.map((p) => {
                        const qtyInCart = cart[p.id] || 0;
                        const remaining = p.stockQuantity !== undefined && p.stockQuantity !== null
                          ? Number((p.stockQuantity - qtyInCart).toFixed(2))
                          : null;
                        const isLow = remaining !== null && remaining <= (p.minStockTrigger !== undefined ? p.minStockTrigger : 1);

                        return (
                          <button
                            id={`btn-product-quick-${p.id}`}
                            key={p.id}
                            onClick={() => addToCart(p.id)}
                            className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-24 relative select-none active:scale-95 transition-all outline-none ${
                              qtyInCart > 0
                                ? 'bg-slate-900 border-emerald-500 ring-1 ring-emerald-500'
                                : isLow && remaining! <= 0
                                ? 'bg-slate-900/20 border-rose-500/10 opacity-60'
                                : 'bg-slate-900/60 border-slate-850 hover:border-slate-800'
                            }`}
                          >
                            <span className="text-[9px] font-bold text-slate-400 tracking-wide uppercase truncate max-w-full flex justify-between items-center">
                              <span>{p.category}</span>
                              {p.stockQuantity !== undefined && p.stockQuantity !== null && (
                                <span className={`px-1 rounded text-[8px] font-black truncate max-w-[65px] ${
                                  remaining! <= 0 ? 'bg-rose-500/20 text-rose-400 font-sans' : isLow ? 'bg-amber-500/20 text-amber-400 font-sans' : 'bg-emerald-500/20 text-emerald-400 font-sans'
                                }`}>
                                  Est.: {remaining} {p.unit || 'un'}
                                </span>
                              )}
                            </span>
                            <span className="text-[11px] font-extrabold text-slate-200 mt-1 mb-2 line-clamp-1 leading-snug">{p.name}</span>
                            <span className="text-xs font-black text-emerald-400 font-mono mt-auto flex items-center justify-between w-full">
                              <span>{formatCurrency(p.price)}</span>
                              {isLow && remaining! > 0 && (
                                <span className="text-[8px] text-amber-500 font-sans animate-pulse font-bold">⚠️ Baixo</span>
                              )}
                              {isLow && remaining! <= 0 && (
                                <span className="text-[8px] text-rose-500 font-sans font-bold uppercase">Sem Estoque</span>
                              )}
                            </span>
                            
                            {/* Counter badge */}
                            {qtyInCart > 0 && (
                              <span className="absolute top-2.5 right-2.5 bg-emerald-500 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-slate-950 font-sans">
                                {qtyInCart}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // MANUAL DIGITATION KEYPAD VIEW
              <div className="flex flex-col justify-start h-full">
                {/* Manual Amount & Description Inputs */}
                <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 flex items-center gap-1 font-sans">
                      <Calculator className="w-3.5 h-3.5 text-emerald-400" /> Valor (R$)
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-bold text-slate-500 font-mono">R$</span>
                      <input
                        id="input-manual-value"
                        type="text"
                        inputMode="decimal"
                        value={manualAmount.replace('.', ',')}
                        onChange={handleAmountChange}
                        placeholder="0,00"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-8 py-2.5 text-sm font-extrabold text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                      {manualAmount !== '' && (
                        <button 
                          type="button"
                          onClick={clearManual}
                          className="absolute right-2.5 p-0.5 text-slate-500 hover:text-slate-300 rounded-md"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 flex items-center gap-1 font-sans">
                      <ListPlus className="w-3.5 h-3.5 text-indigo-400" /> Descrição
                    </label>
                    <input
                      id="input-manual-desc"
                      type="text"
                      value={manualDescription}
                      onChange={(e) => setManualDescription(e.target.value)}
                      placeholder="Ex: Venda Avulsa"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Large responsive touch calculations keypad */}
                <div className="flex-1 max-w-[345px] mx-auto w-full flex flex-col justify-center">
                  <div className="grid grid-cols-3 gap-1.5">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                      <button
                        id={`btn-key-${num}`}
                        key={num}
                        onClick={() => handleNumKey(num)}
                        className="h-11 text-lg font-black bg-slate-900 hover:bg-slate-850 active:bg-slate-800 text-slate-200 rounded-xl flex items-center justify-center outline-none transition-colors border border-slate-850 select-none"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      id="btn-key-comma"
                      onClick={handleCommaKey}
                      className="h-11 text-lg font-black bg-slate-900 hover:bg-slate-850 active:bg-slate-800 text-slate-300 rounded-xl flex items-center justify-center border border-slate-850 transition-colors select-none font-mono"
                    >
                      ,
                    </button>
                    <button
                      id="btn-key-0"
                      onClick={() => handleNumKey('0')}
                      className="h-11 text-lg font-black bg-slate-900 hover:bg-slate-850 active:bg-slate-800 text-slate-200 rounded-xl flex items-center justify-center border border-slate-850 transition-colors select-none"
                    >
                      0
                    </button>
                    <button
                      id="btn-key-del"
                      onClick={handleBackspace}
                      className="h-11 text-xs font-bold bg-slate-900/50 hover:bg-slate-850 active:bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center border border-slate-850 transition-colors select-none"
                    >
                      Voltar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Persistent payment mode and action trigger */}
          <div className="bg-slate-900 border-t border-slate-800 p-4 shrink-0 space-y-4">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Forma de Recebimento:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'pix', label: '📱 Pix' },
                  { id: 'money', label: '💵 Dinheiro' },
                  { id: 'card', label: '💳 Cartão' }
                ].map((method) => (
                  <button
                    id={`btn-pay-method-${method.id}`}
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`py-2 px-1.5 rounded-xl border text-xs font-extrabold outline-none select-none transition-all ${
                      paymentMethod === method.id
                        ? 'bg-slate-900 border-indigo-500 text-indigo-400 shadow-sm'
                        : 'bg-slate-900/40 border-slate-850 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit sale Button */}
            <button
              id="btn-submit-register-sale"
              onClick={handleRegisterSale}
              disabled={getActiveTotal() <= 0}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-850 disabled:text-slate-600 disabled:border-slate-900 font-extrabold py-3.5 px-4 rounded-2xl text-slate-950 active:scale-95 transition-all text-sm shadow-xl shadow-emerald-500/5 cursor-pointer outline-none flex items-center justify-center gap-1.5"
            >
              Concluir Venda ({formatCurrency(getActiveTotal())})
            </button>
          </div>
        </>
      )}

    </div>
  );
}
