import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Undo2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatDateTime, formatMoney, formatQuantity } from '../utils/format';
import { getPaymentMethodLabel } from '../utils/payment';
import { Sale } from '../types';
import Field from './ui/Field';
import Modal from './ui/Modal';
import { Table, Th } from './ui/Table';

const SaleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
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

  const handleReverse = async () => {
    if (reversing) return;
    if (!reason.trim()) {
      setReasonError('Informe o motivo do estorno.');
      return;
    }
    setReversing(true);
    setReasonError('');
    try {
      const response = await api.post<Sale>(`/sales/${id}/reversal`, { reason: reason.trim() });
      setSale(response.data);
      setConfirmOpen(false);
      setReason('');
      toast.success('Venda estornada. Os itens voltaram ao estoque.');
    } catch (err) {
      setReasonError(getErrorMessage(err, 'Erro ao estornar a venda.'));
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

  const reversed = sale.status === 'REVERSED';
  const subtotal = sale.items.reduce((sum, item) => sum + Number(item.unitPrice) * Number(item.quantity), 0);
  const cashSale = sale.paymentMethod === 'DINHEIRO';

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
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              reversed ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {reversed ? 'ESTORNADA' : 'CONCLUÍDA'}
          </span>
        </div>
        {!reversed && currentUser?.role === 'ADMIN' && (
          <button
            type="button"
            className="px-4 py-2 bg-rose-500 text-white text-sm font-semibold rounded-xl hover:bg-rose-600 transition-colors flex items-center justify-center gap-2"
            onClick={() => setConfirmOpen(true)}
          >
            <Undo2 size={14} /> Estornar Venda
          </button>
        )}
      </div>

      {reversed && (
        <div className="mb-5 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 text-sm">
          Estornada em {formatDateTime(sale.reversalDate)}
          {sale.reversedByName ? ` por ${sale.reversedByName}` : ''}. Motivo: {sale.reversalReason || 'não informado'}.
        </div>
      )}

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
            <Th className="text-right">Preço Unit.</Th>
            <Th className="text-right">Subtotal</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {sale.items.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-3 text-sm text-ink">{item.productName}</td>
              <td className="px-4 py-3 text-sm text-ink text-right">{formatQuantity(item.quantity)}</td>
              <td className="px-4 py-3 text-sm text-ink text-right whitespace-nowrap">{formatMoney(item.unitPrice)}</td>
              <td className="px-4 py-3 text-sm text-ink text-right whitespace-nowrap">
                {formatMoney(Number(item.unitPrice) * Number(item.quantity))}
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
        <p className={`text-base font-bold ${reversed ? 'text-ink-muted line-through' : 'text-primary-600 dark:text-primary-400'}`}>
          Total: {formatMoney(sale.total)}
        </p>
      </div>

      <Modal
        open={confirmOpen}
        variant="danger"
        title={`Estornar a venda #${sale.id}?`}
        confirmLabel={reversing ? 'Estornando...' : 'Estornar'}
        onCancel={() => {
          setConfirmOpen(false);
          setReasonError('');
        }}
        onConfirm={handleReverse}
      >
        <p className="text-sm text-ink-muted mb-4">
          Os itens voltam ao estoque e a venda sai do faturamento.{' '}
          {cashSale
            ? `${formatMoney(sale.total)} sairão do caixa aberto.`
            : 'Devolva o valor ao cliente pelo mesmo meio de pagamento.'}
        </p>
        {reasonError && (
          <div className="mb-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-sm">
            {reasonError}
          </div>
        )}
        <label htmlFor="sale-reversal-reason" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
          Motivo do estorno
        </label>
        <Field
          as="textarea"
          id="sale-reversal-reason"
          rows={3}
          maxLength={255}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ex: cliente desistiu da compra."
        />
      </Modal>
    </div>
  );
};

export default SaleDetails;
