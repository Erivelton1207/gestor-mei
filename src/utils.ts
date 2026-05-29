/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NicheType, QuickProduct } from './types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDateBr(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export function getNicheLabel(niche: NicheType): string {
  switch (niche) {
    case 'feira':
      return 'Feirante / Hortifruti';
    case 'comida':
      return 'Comida de Rua / Doces / Lanches';
    case 'beleza':
      return 'Salão de Beleza / Estética / Barbeiro';
    case 'artesanato':
      return 'Artesanato / Crochê / Costura';
    case 'comercio':
      return 'Comércio Local / Bazar / Minimercado';
    default:
      return 'Geral';
  }
}

export const DEFAULT_CATEGORIES: Record<NicheType, { income: string[]; expense: string[] }> = {
  feira: {
    income: ['Venda Geral', 'Encomenda', 'Pastelaria', 'Bebidas', 'Frutas', 'Legumes'],
    expense: ['Reposição de Estoque', 'Transporte / Gasolina', 'Embalagens / Sacolas', 'Taxa de Feira', 'Alimentação', 'Manutenção'],
  },
  comida: {
    income: ['Vendas Diárias', 'Encomendas', 'Delivery', 'Bebidas', 'Sobremesas'],
    expense: ['Ingredientes / Compras', 'Gás / Energia / Água', 'Embalagens', 'Plataforma Delivery / Taxas', 'Divulgação / Panfletos'],
  },
  beleza: {
    income: ['Corte de Cabelo', 'Manicure / Pedicure', 'Barbearia', 'Tratamentos / Química', 'Venda de Produtos'],
    expense: ['Cosméticos / Shampoos', 'Eletricidade / Água', 'Aluguel do Salão', 'Ferramentas (Tesouras, Máquinas)', 'Marketing / Instagram'],
  },
  artesanato: {
    income: ['Venda de Feirinha', 'Encomenda Personalizada', 'Atacado', 'Venda Online'],
    expense: ['Matéria-Prima (Linhas, Tecidos)', 'Embalagens', 'Frete / Correios', 'Ferramentas de Costura / Artes', 'Taxas de Marketplaces'],
  },
  comercio: {
    income: ['Venda de Loja', 'Bazar', 'Venda em Condicional', 'Acessórios'],
    expense: ['Compra de Mercadorias (Fornecedor)', 'Sacolas / Brindes', 'Aluguel / Condomínio', 'Máquina de Cartão (Mensalidade)', 'Energia'],
  },
};

export const DEFAULT_PRODUCTS: Record<NicheType, Omit<QuickProduct, 'id'>[]> = {
  feira: [
    { name: 'Pastel de Vento / Simples', price: 8.0, category: 'Pastelaria' },
    { name: 'Caldo de Cana (Copo 300ml)', price: 6.0, category: 'Bebidas' },
    { name: 'Combo Pastel + Caldo', price: 13.0, category: 'Pastelaria' },
    { name: 'Banana (Dúzia)', price: 10.0, category: 'Frutas' },
    { name: 'Tomate Selecionado (Kg)', price: 8.5, category: 'Legumes' },
    { name: 'Alface Orgânica (Maço)', price: 3.5, category: 'Legumes' },
  ],
  comida: [
    { name: 'Bolo no Pote individual', price: 10.0, category: 'Sobremesas' },
    { name: 'Brigadeiro Tradicional (Un)', price: 4.0, category: 'Sobremesas' },
    { name: 'Salgado Frito (Coxinha, etc)', price: 7.0, category: 'Vendas Diárias' },
    { name: 'Refrigerante em Lata', price: 5.5, category: 'Bebidas' },
    { name: 'Combo Coxinha + Refri', price: 11.5, category: 'Vendas Diárias' },
  ],
  beleza: [
    { name: 'Corte de Cabelo Simples', price: 35.0, category: 'Corte de Cabelo' },
    { name: 'Barbatimão / Barba de Navalha', price: 25.0, category: 'Barbearia' },
    { name: 'Pé e Mão (Combo Completo)', price: 45.0, category: 'Manicure / Pedicure' },
    { name: 'Escova Escovadora', price: 40.0, category: 'Tratamentos / Química' },
    { name: 'Lavagem Especial + Hidratação', price: 50.0, category: 'Tratamentos / Química' },
  ],
  artesanato: [
    { name: 'Tapete de Crochê Barroco', price: 45.0, category: 'Venda de Feirinha' },
    { name: 'Pano de Prato de Ponto Cruz', price: 18.0, category: 'Venda de Feirinha' },
    { name: 'Chaveiro de Amigurumi Fofo', price: 25.0, category: 'Encomenda Personalizada' },
    { name: 'Tiara Infantil de Laço', price: 15.0, category: 'Venda de Feirinha' },
    { name: 'Bolsa Fio de Malha Bolsa', price: 85.0, category: 'Venda Online' },
  ],
  comercio: [
    { name: 'Camiseta Básica de Algodão', price: 39.9, category: 'Venda de Loja' },
    { name: 'Calça Jeans Skinny', price: 89.9, category: 'Venda de Loja' },
    { name: 'Blusinha de Verão Estampada', price: 49.9, category: 'Venda de Loja' },
    { name: 'Par de Meias Algodão', price: 9.9, category: 'Acessórios' },
    { name: 'Cinto Feminino Elegante', price: 24.9, category: 'Acessórios' },
  ],
};
