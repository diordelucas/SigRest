/**
 * Tipos compartilhados que espelham os DTOs do backend. Domínios ainda não
 * migrados para TypeScript continuam funcionando normalmente — TS e JS
 * coexistem no mesmo projeto (ver tsconfig.json, allowJs).
 */

export type ProductType = 'INSUMO' | 'PRODUTO_FINAL' | 'PRODUTO_INTERMEDIARIO';
export type UnitOfMeasure = 'G' | 'KG' | 'ML' | 'L' | 'UN' | 'DUZIA';

export interface Category {
  id: number;
  name: string;
  description?: string | null;
}

export interface Product {
  id: number;
  name: string;
  code: string;
  price: number;
  sellPrice: number;
  storage: number;
  minStorage: number;
  categoryId: number;
  categoryName?: string;
  tipo: ProductType | null;
  purchaseUnit: UnitOfMeasure | null;
  packageQuantity: number | null;
}

export interface ProductFormData {
  name: string;
  code: string;
  price: number | '';
  sellPrice: number | '';
  storage: number | '';
  minStorage: number | '';
  categoryId: number;
  tipo: ProductType | null;
  purchaseUnit: UnitOfMeasure | null;
  packageQuantity: number | null;
}
