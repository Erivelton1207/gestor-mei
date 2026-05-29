/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Package, Trash2, Plus, ArrowLeft, Layers, PenLine, Tag, Check, Sparkles, AlertTriangle, Boxes } from 'lucide-react';
import { QuickProduct, BusinessProfile } from '../types';
import { formatCurrency, DEFAULT_CATEGORIES } from '../utils';

interface ProductCatalogProps {
  products: QuickProduct[];
  profile: BusinessProfile;
  onAddProduct: (product: Omit<QuickProduct, 'id'>) => void;
  onDeleteProduct: (id: string) => void;
}

export function ProductCatalog({ products, profile, onAddProduct, onDeleteProduct }: ProductCatalogProps) {
  // Navigation inside catalog: 'list' or 'add'
  const [viewState, setViewState] = useState<'list' | 'add'>('list');

  // New Product form state
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  
  // Stock tracking states
  const [trackStock, setTrackStock] = useState(false);
  const [prodStock, setProdStock] = useState('');
  const [prodMinTrigger, setProdMinTrigger] = useState('1');
  const [prodUnit, setProdUnit] = useState('kg');

  // Default suggested categories for products based on niche
  const suggestedCategories = DEFAULT_CATEGORIES[profile.niche]?.income || DEFAULT_CATEGORIES['feira'].income;

  const handleOpenAddForm = () => {
    if (suggestedCategories.length > 0) {
      setProdCategory(suggestedCategories[0]);
    }
    // Reset stock fields when opening form
    setTrackStock(false);
    setProdStock('');
    setProdMinTrigger('1');
    setProdUnit('kg');
    setViewState('add');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(prodPrice.replace(',', '.'));
    if (!prodName.trim() || isNaN(priceNum) || priceNum <= 0) return;

    let stockNum: number | undefined = undefined;
    let minTriggerNum: number | undefined = undefined;

    if (trackStock) {
      const parsedStock = parseFloat(prodStock.replace(',', '.'));
      if (!isNaN(parsedStock)) {
        stockNum = parsedStock;
      }
      const parsedTrigger = parseFloat(prodMinTrigger.replace(',', '.'));
      if (!isNaN(parsedTrigger)) {
        minTriggerNum = parsedTrigger;
      }
    }

    onAddProduct({
      name: prodName.trim(),
      price: priceNum,
      category: prodCategory || 'Venda Geral',
      stockQuantity: stockNum,
      minStockTrigger: minTriggerNum,
      unit: trackStock ? prodUnit : undefined,
    });

    // Reset Form and View
    setProdName('');
    setProdPrice('');
    setProdStock('');
    setProdMinTrigger('1');
    setTrackStock(false);
    setViewState('list');
  };

  return (
    <div id="catalog-container" className="flex-1 flex flex-col overflow-hidden bg-slate-950 font-sans">
      
      {viewState === 'list' ? (
        <>
          {/* Header area */}
          <div className="bg-slate-900 p-4 border-b border-slate-800 shrink-0 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Catálogo Rápido</span>
              <span className="text-sm font-black text-white">Produtos & Preços</span>
            </div>
            
            <button
              id="btn-trigger-add-product"
              onClick={handleOpenAddForm}
              className="bg-emerald-500 text-slate-950 font-extrabold py-2 px-3.5 rounded-xl text-xs active:scale-95 transition-all outline-none flex items-center gap-1 shadow-md shadow-emerald-500/10"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Item
            </button>
          </div>

          {/* Product Cards List */}
          <div className="flex-1 overflow-y-auto px-4 pb-20 pt-3">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 px-6">
                <Package className="w-11 h-11 text-slate-700 mb-3" />
                <p className="text-xs text-slate-400 font-bold mb-1">Catálogo de Produtos Vazio</p>
                <p className="text-[10px] text-slate-500">Adicione seus itens mais comuns clicando em "Novo Item" no canto superior.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {products.map((product) => (
                  <div
                    id={`product-card-${product.id}`}
                    key={product.id}
                    className="bg-slate-900/60 hover:bg-slate-900 border border-slate-850 rounded-2xl p-3 flex justify-between items-center transition-all"
                  >
                    <div className="overflow-hidden pr-3 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-bold text-slate-400 tracking-wider bg-slate-950 border border-slate-850 px-2 py-0.5 rounded uppercase">{product.category}</span>
                        {product.stockQuantity !== undefined && product.stockQuantity !== null && (
                          <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            product.stockQuantity <= (product.minStockTrigger !== undefined ? product.minStockTrigger : 1)
                              ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-pulse'
                              : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          }`}>
                            Estoque: {product.stockQuantity} {product.unit || 'un'}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-black text-slate-200 mt-1 truncate">{product.name}</h4>
                      {product.stockQuantity !== undefined && product.stockQuantity !== null && product.stockQuantity <= (product.minStockTrigger !== undefined ? product.minStockTrigger : 1) && (
                        <p className="text-[9px] font-bold text-rose-400 flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" /> Estoque baixo! Menos de {product.minStockTrigger || 1} {product.unit || 'un'} restante
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-black text-emerald-400 font-mono">
                        {formatCurrency(product.price)}
                      </span>
                      
                      <button
                        id={`btn-delete-product-${product.id}`}
                        onClick={() => onDeleteProduct(product.id)}
                        className="p-1.5 text-slate-600 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer outline-none active:scale-90"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* ADD PRODUCT FORM VIEW */
        <div id="add-product-container" className="flex-1 flex flex-col justify-between p-5 bg-slate-950 overflow-y-auto">
          
          <div className="flex-1 flex flex-col justify-start">
            {/* Back to list button */}
            <button
              id="btn-back-to-catalog"
              onClick={() => setViewState('list')}
              className="mt-1 mb-5 text-slate-400 hover:text-white flex items-center gap-1 text-xs font-bold leading-none outline-none"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao Catálogo
            </button>

            <div className="mb-5">
              <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 border border-indigo-500/20 rounded-full uppercase tracking-wider font-bold">Novo Produto</span>
              <h2 className="text-xl font-bold text-white tracking-tight mt-1.5">Cadastrar Item Rápido</h2>
              <p className="text-[10px] text-slate-400 mt-1">Configure o nome e preço do seu produto para vender em apenas 1 toque na sua frente de caixa.</p>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3 stroke-slate-400" /> Nome do Produto
                </label>
                <input
                  id="input-product-name"
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Ex: Pastel Especial de Carne, Corte Simples, Pano de Crochê"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                    <span>Preço de Venda (R$)</span>
                  </label>
                  <input
                    id="input-product-price"
                    type="text"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="0,00"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-white text-right placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                    <Layers className="w-3 stroke-slate-400" /> Categoria
                  </label>
                  <select
                    id="select-product-category"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {suggestedCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="Serviços">Serviços Gerais</option>
                    <option value="Outros">Outras Categorias</option>
                  </select>
                </div>
              </div>

              {/* Opção de Estoque */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Boxes className="w-4.5 h-4.5 text-emerald-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white leading-none">Rastrear Estoque</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Controlar quantidades e receber alertas ao esgotar.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTrackStock(!trackStock)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      trackStock ? 'bg-emerald-500' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                        trackStock ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {trackStock && (
                  <div className="pt-3 border-t border-slate-800 grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">
                        Qtd. Inicial
                      </label>
                      <input
                        id="input-product-stock"
                        type="text"
                        required={trackStock}
                        value={prodStock}
                        onChange={(e) => setProdStock(e.target.value.replace(/[^0-9.,]/g, ''))}
                        placeholder="Ex: 5"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">
                        Unidade
                      </label>
                      <select
                        id="select-product-unit"
                        value={prodUnit}
                        onChange={(e) => setProdUnit(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-1.5 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="kg">Quilo (Kg)</option>
                        <option value="un">Unidade (Un)</option>
                        <option value="g">Grama (g)</option>
                        <option value="litro">Litro (L)</option>
                        <option value="pct">Pacote (Pct)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[10px] text-slate-400 mb-1">
                        Aviso Mínimo
                      </label>
                      <input
                        id="input-product-min-trigger"
                        type="text"
                        required={trackStock}
                        value={prodMinTrigger}
                        onChange={(e) => setProdMinTrigger(e.target.value.replace(/[^0-9.,]/g, ''))}
                        placeholder="Ex: 1"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="mt-8 space-y-3 shrink-0">
            <button
              id="btn-submit-product-form"
              onClick={handleAddSubmit}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 px-4 rounded-2xl active:scale-95 transition-all text-sm outline-none flex items-center justify-center gap-1"
            >
              Adicionar Produto ({prodPrice ? 'R$ ' + prodPrice : 'R$ 0,00'})
            </button>
            <button
              id="btn-cancel-product"
              onClick={() => setViewState('list')}
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
