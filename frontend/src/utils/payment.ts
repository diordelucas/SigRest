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
    default:
      return method;
  }
};
