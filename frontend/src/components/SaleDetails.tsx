import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Undo2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatDateTime, formatMoney, formatQuantity, lineTotal } from '../utils/format';
import { getPaymentMethodLabel, getSaleStatusClass, getSaleStatusLabel } from '../utils/payment';
import { Sale, SellItem } from '../types';
import Field from './ui/Field';
import Modal from './ui/Modal';
import { Table, Th } from './ui/Table';

const remaining = (item: SellItem) => Math.round((Number(item.quantity) - Number(item.reversedQuantity)) * 1000) / 1000;

const SaleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [formError, setFormError] = useState('');
  const [reversing, setReversing] = useState(false);

  const fetchSale = useCallback(async () => {
    try {
      const response = await api.get<Sale>(`/sales/${id}`);
      setSale(response.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao carregar a venda.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSale();
  }, [fetchSale]);

  /** Abre com tudo o que ainda pode ser devolvido: basta reduzir as quantidades para um estorno parcial. */
  const openReversal = (current: Sale) => {
    const initial: Record<number, string> = {};
    current.items.forEach((item) => {
      initial[item.id] = String(remaining(item));
    });
    setQuantities(initial);
    setReason('');
    setFormError('');
    setConfirmOpen(true);
  };

  const refundPreview = (current: Sale) => {
    const reversesAll = current.items.every((item) => Number(quantities[item.id] || 0) === remaining(item));
    if (reversesAll) return Number(current.netTotal);
    const subtotal = current.items.reduce((sum, item) => sum + lineTotal(item.unitPrice, item.quantity), 0);
    if (subtotal <= 0) return 0;
    const gross = current.items.reduce((sum, item) => sum + Number(item.unitPrice) * Number(quantities[item.id] || 0), 0);
    return Math.min(Math.round((gross * Number(current.total) * 100) / subtotal) / 100, Number(current.netTotal));
  };

  const handleReverse = async () => {
    if (reversing || !sale) return;
    const items = sale.items
      .map((item) => ({ sellItemId: item.id, quantity: Number(quantities[item.id] || 0) }))
      .filter((item) => item.quantity !== 0);
    const invalid = sale.items.find((item) => {
      const quantity = Number(quantities[item.id] || 0);
      return Number.isNaN(quantity) || quantity < 0 || quantity > remaining(item);
    });
    if (invalid) {
      setFormError(`Só é possível estornar ${formatQuantity(remaining(invalid))} ${invalid.unit} de ${invalid.productName}.`);
      return;
    }
    if (items.length === 0) {
      setFormError('Informe a quantidade de ao menos um item.');
      return;
    }
    if (!reason.trim()) {
      setFormError('Informe o motivo do estorno.');
      return;
    }
    setReversing(true);
    setFormError('');
    try {
      const response = await api.post<Sale>(`/sales/${id}/reversal`, { reason: reason.trim(), items });
      setSale(response.data);
      setConfirmOpen(false);
      toast.success('Estorno registrado. Os itens voltaram ao estoque.');
    } catch (err) {
      setFormError(getErrorMessage(err, 'Erro ao estornar a venda.'));
    } finally {
      setReversing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-4 border-line border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-sm">
        {error || 'Venda não encontrada.'}
      </div>
    );
  }

  const fullyReversed = sale.status === 'REVERSED';
  const hasReversals = sale.reversals.length > 0;
  const subtotal = sale.items.reduce((sum, item) => sum + lineTotal(item.unitPrice, item.quantity), 0);
  const cashSale = sale.paymentMethod === 'DINHEIRO';
  const refund = refundPreview(sale);

  return (
    <div className="card p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Voltar para a lista de vendas"
            className="p-2 border border-line text-ink-muted rounded-lg hover:bg-surface-2 transition-colors"
            onClick={() => navigate('/sales')}
          >
            <ArrowLeft size={16} />
          </button>
          <h2 className="text-lg font-semibold text-ink">Venda #{sale.id}</h2>
          <span
            data-testid="sale-status"
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSaleStatusClass(sale.status)}`}
          >
            {getSaleStatusLabel(sale.status)}
          </span>
        </div>
        {!fullyReversed && currentUser?.role === 'ADMIN' && (
          <button
            type="button"
            data-testid="sale-reverse-open"
            className="px-4 py-2 bg-rose-500 text-white text-sm font-semibold rounded-xl hover:bg-rose-600 transition-colors flex items-center justify-center gap-2"
            onClick={() => openReversal(sale)}
          >
            <Undo2 size={14} /> Estornar Venda
          </button>
        )}
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-sm">
        <div>
          <dt className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">Data e hora</dt>
          <dd className="text-ink">{formatDateTime(sale.date)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">Cliente</dt>
          <dd className="text-ink">{sale.personName || 'Consumidor final'}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">Forma de pagamento</dt>
          <dd className="text-ink">{getPaymentMethodLabel(sale.paymentMethod)}</dd>
        </div>
      </dl>

      <Table className="mb-4">
        <thead className="bg-surface-2 border-b border-line">
          <tr>
            <Th>Produto</Th>
            <Th className="text-right">Quantidade</Th>
            {hasReversals && <Th className="text-right">Estornado</Th>}
            <Th className="text-right">Preço Unit.</Th>
            <Th className="text-right">Subtotal</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {sale.items.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-3 text-sm text-ink">{item.productName}</td>
              <td className="px-4 py-3 text-sm text-ink text-right whitespace-nowrap">{formatQuantity(item.quantity)} {item.unit}</td>
              {hasReversals && <td className="px-4 py-3 text-sm text-ink text-right whitespace-nowrap">{formatQuantity(item.reversedQuantity)} {item.unit}</td>}
              <td className="px-4 py-3 text-sm text-ink text-right whitespace-nowrap">{formatMoney(item.unitPrice)}{item.unit === 'kg' ? '/kg' : ''}</td>
              <td className="px-4 py-3 text-sm text-ink text-right whitespace-nowrap">
                {formatMoney(lineTotal(item.unitPrice, item.quantity))}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="bg-surface-2 border border-line rounded-xl p-4 flex flex-col items-end gap-1">
        <p className="text-sm text-ink-muted">
          Subtotal: <strong className="text-ink">{formatMoney(subtotal)}</strong>
        </p>
        <p className="text-sm text-ink-muted">
          Desconto: <strong className="text-ink">{formatMoney(sale.discount)}</strong>
        </p>
        <div className="w-48 border-t border-line my-1" />
        <p className={`text-base font-bold ${hasReversals ? 'text-ink-muted' : 'text-primary-600 dark:text-primary-400'}`}>
          Total: {formatMoney(sale.total)}
        </p>
        {hasReversals && (
          <>
            <p className="text-sm text-rose-600">Estornado: -{formatMoney(sale.reversedAmount)}</p>
            <p className="text-base font-bold text-primary-600 dark:text-primary-400">Líquido: {formatMoney(sale.netTotal)}</p>
          </>
        )}
      </div>

      {hasReversals && (
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-ink mb-2">Estornos</h3>
          <ul className="space-y-2">
            {sale.reversals.map((reversal) => (
              <li key={reversal.id} className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-sm text-ink">
                <p className="font-semibold">
                  {formatDateTime(reversal.date)}: {formatMoney(reversal.amount)}
                  {reversal.userName ? ` por ${reversal.userName}` : ''}
                </p>
                <p className="text-ink-muted">
                  {reversal.items.map((item) => `${formatQuantity(item.quantity)} ${item.unit} de ${item.productName}`).join(', ')}
                </p>
                <p className="text-ink-muted">Motivo: {reversal.reason}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal
        open={confirmOpen}
        variant="danger"
        title={`Estornar a venda #${sale.id}?`}
        confirmLabel={reversing ? 'Estornando...' : 'Estornar'}
        onCancel={() => {
          setConfirmOpen(false);
          setFormError('');
        }}
        onConfirm={handleReverse}
      >
        <p className="text-sm text-ink-muted mb-4">
          Para um estorno parcial, reduza as quantidades. O desconto é rateado entre os itens.
        </p>
        <div className="space-y-2 mb-4">
          {sale.items.map((item, index) =>
            remaining(item) > 0 ? (
              <div key={item.id} className="flex items-center justify-between gap-3">
                <label htmlFor={`sale-reversal-qty-${index}`} className="text-sm text-ink">
                  {item.productName}
                  <span className="block text-xs text-ink-muted">até {formatQuantity(remaining(item))} {item.unit}</span>
                </label>
                <Field
                  id={`sale-reversal-qty-${index}`}
                  data-testid={`sale-reversal-qty-${index}`}
                  type="number"
                  min="0"
                  step={item.unit === 'kg' ? '0.001' : '1'}
                  max={remaining(item)}
                  className="w-24 text-right"
                  value={quantities[item.id] ?? ''}
                  onChange={(e) => {
                    setQuantities({ ...quantities, [item.id]: e.target.value });
                    setFormError('');
                  }}
                />
              </div>
            ) : null
          )}
        </div>
        <p className="text-sm font-semibold text-ink mb-1">Valor a devolver: {formatMoney(refund)}</p>
        <p className="text-xs text-ink-muted mb-4">
          {cashSale ? 'O valor sai do caixa aberto.' : 'Devolva o valor ao cliente pelo mesmo meio de pagamento.'}
        </p>
        {formError && (
          <div className="mb-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-sm">
            {formError}
          </div>
        )}
        <label htmlFor="sale-reversal-reason" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
          Motivo do estorno
        </label>
        <Field
          as="textarea"
          id="sale-reversal-reason"
          data-testid="sale-reversal-reason"
          rows={3}
          maxLength={255}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ex: cliente devolveu um item."
        />
      </Modal>
    </div>
  );
};

export default SaleDetails;
