import { SaleStatus } from '../types';

export const getPaymentMethodLabel = (method: string): string => {
  switch (method) {
    case 'DINHEIRO':
      return 'Dinheiro';
    case 'CARTAO_DEBITO':
      return 'Cartão de Débito';
    case 'CARTAO_CREDITO':
      return 'Cartão de Crédito';
    case 'PIX':
      return 'PIX';
    case 'BOLETO':
      return 'Boleto';
    default:
      return method;
  }
};

/** Só o que for pago em dinheiro sai do saldo do caixa. */
export const PURCHASE_PAYMENT_METHODS = ['DINHEIRO', 'PIX', 'CARTAO_DEBITO', 'CARTAO_CREDITO', 'BOLETO'];

export const getSaleStatusLabel = (status: SaleStatus): string => {
  switch (status) {
    case 'REVERSED':
      return 'ESTORNADA';
    case 'PARTIALLY_REVERSED':
      return 'ESTORNO PARCIAL';
    default:
      return 'CONCLUÍDA';
  }
};

export const getSaleStatusClass = (status: SaleStatus): string => {
  switch (status) {
    case 'REVERSED':
      return 'bg-rose-100 text-rose-800';
    case 'PARTIALLY_REVERSED':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-emerald-100 text-emerald-800';
  }
};
