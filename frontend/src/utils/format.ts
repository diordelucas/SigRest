import { formatBRL } from './currency';
import { Product } from '../types';

/**
 * Data sem hora ("2026-10-30") em horário local. `new Date('2026-10-30')` interpreta como
 * meia-noite em UTC, o que no Brasil vira o dia anterior.
 */
const parseDate = (value: string): Date => {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
  }
  return new Date(value);
};

export const formatDate = (value: string | null | undefined): string =>
  value ? parseDate(value).toLocaleDateString('pt-BR') : '';

export const formatDateTime = (value: string | null | undefined): string =>
  value ? parseDate(value).toLocaleString('pt-BR') : '';

/** Hoje no formato do `<input type="date">`, em horário local (toISOString usa UTC). */
export const todayISO = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

/** "2026-10" ou "2026-10-01" vira "out/2026". */
export const formatMonth = (value: string | null | undefined): string => {
  const match = /^(\d{4})-(\d{2})/.exec(value ?? '');
  if (!match) return value ?? '';
  const month = new Date(Number(match[1]), Number(match[2]) - 1, 1).toLocaleDateString('pt-BR', { month: 'short' });
  return `${month.replace('.', '')}/${match[1]}`;
};

/** "R$ 1.234,56" e, quando negativo, "-R$ 50,00". */
export const formatMoney = (value: number | string | null | undefined): string => {
  const num = Number(value ?? 0);
  const safe = Number.isNaN(num) ? 0 : num;
  return `${safe < 0 ? '-' : ''}R$ ${formatBRL(Math.abs(safe))}`;
};

/** Valor com sinal explícito: "+R$ 20,00" ou "-R$ 35,00". */
export const formatSignedMoney = (value: number | string | null | undefined): string => {
  const num = Number(value ?? 0);
  return `${num >= 0 ? '+' : ''}${formatMoney(num)}`;
};

/** Custo por grama, mililitro ou unidade: precisa de mais casas que o padrão. */
export const formatUnitCost = (value: number | string | null | undefined): string =>
  `R$ ${Number(value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;

export const formatQuantity = (value: number | string | null | undefined): string =>
  Number(value ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 3 });

type StockProduct = Pick<Product, 'purchaseUnit' | 'tipo' | 'saleUnit'>;

/** Unidade em que o estoque do produto é guardado: produto final na unidade de venda, os demais na unidade base. */
export const baseUnit = (product: StockProduct | null | undefined): string => {
  if (product?.tipo === 'PRODUTO_FINAL') return product.saleUnit === 'KG' ? 'kg' : 'un';
  switch (product?.purchaseUnit) {
    case 'G':
    case 'KG':
      return 'g';
    case 'ML':
    case 'L':
      return 'ml';
    default:
      return 'un';
  }
};

export const formatStock = (
  quantity: number | string | null | undefined,
  product: StockProduct | null | undefined
): string => `${formatQuantity(quantity)} ${baseUnit(product)}`;

/** Produto final por unidade só aceita número inteiro; os demais, até o grama. */
export const quantityStep = (product: Pick<Product, 'tipo' | 'saleUnit'> | null | undefined): string =>
  product?.tipo === 'PRODUTO_FINAL' && product.saleUnit !== 'KG' ? '1' : '0.001';

/** Valor do item em centavos exatos, como no backend: 1,355 kg a R$ 39,90 dá R$ 54,06. */
export const lineTotal = (unitPrice: number | string, quantity: number | string): number =>
  Math.round((Math.round(Number(unitPrice) * 100) * Math.round(Number(quantity) * 1000)) / 1000) / 100;

/** Nos gráficos de produtos, deixa claro quando a quantidade está em quilos. */
export const withUnitInName = <T extends { productName: string; unit?: string }>(row: T): T =>
  row.unit === 'kg' ? { ...row, productName: `${row.productName} (kg)` } : row;

export const onlyDigits = (value: string | null | undefined): string => (value ?? '').replace(/\D/g, '');

export const formatCpf = (value: string | null | undefined): string => {
  const digits = onlyDigits(value);
  return digits.length === 11 ? digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : value ?? '';
};

export const formatCnpj = (value: string | null | undefined): string => {
  const digits = onlyDigits(value);
  return digits.length === 14 ? digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : value ?? '';
};

export const formatPhone = (value: string | null | undefined): string => {
  const digits = onlyDigits(value);
  if (digits.length === 11) return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (digits.length === 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return value ?? '';
};

export const isOverdue = (dueDate: string | null | undefined): boolean => !!dueDate && dueDate < todayISO();

/** Em todas as telas com lista longa quem rola é o `<main>` do layout, não a janela. */
export const scrollMainToTop = (): void => {
  document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
};

const UFS = new Set([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]);

export const isValidUF = (uf: string): boolean => UFS.has(uf.trim().toUpperCase());

export const isValidPhone = (phone: string): boolean => {
  const length = onlyDigits(phone).length;
  return length === 10 || length === 11;
};
