import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { formatDate, formatMoney, formatQuantity } from '../utils/format';
import { Purchase } from '../types';
import { Table, Th } from './ui/Table';

const PurchaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchase = async () => {
      try {
        const response = await api.get<Purchase>(`/purchases/${id}`);
        setPurchase(response.data);
      } catch (err) {
        setError(getErrorMessage(err, 'Erro ao carregar a compra.'));
      } finally {
        setLoading(false);
      }
    };
    fetchPurchase();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-4 border-line border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-sm">
        {error || 'Compra não encontrada.'}
      </div>
    );
  }

  return (
    <div className="card p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          aria-label="Voltar para a lista de compras"
          className="p-2 border border-line text-ink-muted rounded-lg hover:bg-surface-2 transition-colors"
          onClick={() => navigate('/purchases')}
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-lg font-semibold text-ink">Compra #{purchase.id}</h2>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <dt className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">Data da compra</dt>
          <dd className="text-ink">{formatDate(purchase.date)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">Fornecedor</dt>
          <dd className="text-ink">{purchase.supplier?.name || 'Não informado'}</dd>
        </div>
      </dl>

      <Table className="mb-4">
        <thead className="bg-surface-2 border-b border-line">
          <tr>
            <Th>Produto</Th>
            <Th className="text-right">Quantidade</Th>
            <Th className="text-right">Preço Unit.</Th>
            <Th className="text-right">Subtotal</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {purchase.items.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-3 text-sm text-ink">{item.product?.name}</td>
              <td className="px-4 py-3 text-sm text-ink text-right whitespace-nowrap">
                {formatQuantity(item.quantity)}
                {item.product?.purchaseUnit ? ` × ${formatQuantity(item.product.packageQuantity)} ${item.product.purchaseUnit}` : ''}
              </td>
              <td className="px-4 py-3 text-sm text-ink text-right whitespace-nowrap">{formatMoney(item.unitPrice)}</td>
              <td className="px-4 py-3 text-sm text-ink text-right whitespace-nowrap">
                {formatMoney(Number(item.unitPrice) * Number(item.quantity))}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="bg-surface-2 border border-line rounded-xl p-4 text-right">
        <p className="text-base font-bold text-primary-600 dark:text-primary-400">Total: {formatMoney(purchase.total)}</p>
      </div>
    </div>
  );
};

export default PurchaseDetails;
