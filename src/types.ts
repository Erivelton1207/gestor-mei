/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type NicheType = 'feira' | 'comida' | 'beleza' | 'artesanato' | 'comercio';

export interface QuickProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  stockQuantity?: number; // Quantidade atual em estoque (opcional para rastreamento)
  minStockTrigger?: number; // Alerta de estoque mínimo
  unit?: string; // Unidade de medida (ex: kg, un, g)
}

export interface Transaction {
  id: string;
  type: 'sale' | 'expense';
  description: string;
  amount: number;
  date: string; // ISO string YYYY-MM-DD
  time: string; // HH:MM
  paymentMethod?: 'pix' | 'money' | 'card'; // For sales
  category: string; // Ex: 'Ingredientes', 'Embalagem', 'Bebidas' etc.
  quantity?: number;
  productId?: string;
}

export interface BusinessProfile {
  name: string;
  niche: NicheType;
  ownerName: string;
  dailyGoal: number;
  monthlyGoal: number;
}
