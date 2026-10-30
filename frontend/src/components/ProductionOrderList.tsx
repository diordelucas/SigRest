import React, { useState, useEffect } from 'react';
import { Trash2, CheckCircle2, Plus, Search } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import moment from 'moment';
import { LossReason, ProductionOrder, ProductionOrderStatus } from '../types';
import { lossReasonLabel, LOSS_REASON_LABELS } from '../utils/lossReason';
import Button from './ui/Button';
import Field from './ui/Field';
import Modal from './ui/Modal';
import { Table, Th } from './ui/Table';
import { useAuth } from '../contexts/AuthContext';

const getStatusBadge = (status: ProductionOrderStatus | string) => {
  switch (status) {
    case 'OPEN':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-800">
          ABERTA
        </span>
      );
    case 'FINISHED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          FINALIZADA
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
          CANCELADA
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-2 text-ink-muted">
          {status}
        </span>
      );
  }
};

interface ProductionOrderListProps {
  refreshTrigger: number | boolean;
  onNewOrder: () => void;
}

const ProductionOrderList = ({ refreshTrigger, onNewOrder }: ProductionOrderListProps) => {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [search, setSearch] = useState('');
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';
  const [finishOrder, setFinishOrder] = useState<ProductionOrder | null>(null);
  const [finishActualQuantity, setFinishActualQuantity] = useState('');
  const [finishLossReason, setFinishLossReason] = useState<LossReason | ''>('');
  const [finishError, setFinishError] = useState('');
  const [finishing, setFinishing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get<ProductionOrder[]>('/production-order');
      setOrders(response.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao carregar ordens de produção.'));
    } finally {
      setLoading(false);
    }
  };

  const openFinishModal = (order: ProductionOrder) => {
    setFinishOrder(order);
    setFinishActualQuantity(String(order.quantity));
    setFinishLossReason('');
    setFinishError('');
  };

  const handleFinish = async () => {
    if (!finishOrder) return;
    const actual = finishActualQuantity === '' ? finishOrder.quantity : Number(finishActualQuantity);
    if (isNaN(actual) || actual < 0) {
      setFinishError('A quantidade real deve ser um número maior ou igual a zero.');
      return;
    }
    if (actual > finishOrder.quantity) {
      setFinishError('A quantidade real não pode ser maior que a planejada. Se produziu a mais, abra outra ordem.');
      return;
    }
    if (actual < finishOrder.quantity && !finishLossReason) {
      setFinishError('Informe o motivo, já que a quantidade real ficou abaixo do planejado.');
      return;
    }
    setFinishing(true);
    setFinishError('');
    try {
      await api.post(`/production-order/${finishOrder.id}/finish`, {
        actualQuantity: actual,
        lossReason: actual < finishOrder.quantity ? finishLossReason : null,
      });
      setSuccessMessage('Ordem de Produção finalizada com sucesso!');
      setTimeout(() => setSuccessMessage(''), 4000);
      setFinishOrder(null);
      fetchOrders();
    } catch (err) {
      setFinishError(getErrorMessage(err, 'Erro ao finalizar ordem de produção.'));
    } finally {
      setFinishing(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/production-order/${id}`);
      setOrders(orders.filter((o) => o.id !== id));
      setSuccessMessage('Ordem de Produção excluída com sucesso!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao excluir ordem de produção.'));
    } finally {
      setConfirmDelete(null);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-4 border-line border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = orders.filter((order) => {
    const q = search.toLowerCase();
    const statusLabel = order.status === 'OPEN' ? 'aberta' : order.status === 'FINISHED' ? 'finalizada' : 'cancelada';
    return [order.finalProduct?.name, statusLabel, order.notes].some((v) => (v ?? '').toLowerCase().includes(q));
  });

  return (
    <div className="card p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-ink">Ordens de Produção</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
            <Field
              type="text"
              placeholder="Pesquisar produto, status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 py-2 text-sm w-full sm:w-56"
            />
          </div>
          <Button onClick={onNewOrder}>
            <Plus size={14} /> Nova Ordem
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-sm">{error}</div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 text-sm">
          {successMessage}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-center text-ink-muted py-8 text-sm">
          {search ? `Nenhum resultado para "${search}".` : 'Nenhuma ordem de produção cadastrada.'}
        </p>
      ) : (
        <Table>
            <thead className="bg-surface-2 border-b border-line">
              <tr>
                <Th>ID</Th>
                <Th>Produto Final</Th>
                <Th className="text-center">Qtd Planejada</Th>
                <Th className="text-center">Qtd Real</Th>
                <Th>Data de Abertura</Th>
                <Th>Status</Th>
                <Th>Observações</Th>
                <Th className="text-center">Ações</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-surface-2 transition-colors">
                  <td className="px-4 py-3 text-sm text-ink">{order.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-ink">
                    {order.finalProduct?.name || 'Produto não identificado'}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-ink text-center">{order.quantity}</td>
                  <td className="px-4 py-3 text-sm text-center">
                    {order.actualQuantity == null ? (
                      <span className="text-ink-muted">-</span>
                    ) : order.actualQuantity < order.quantity ? (
                      <span
                        className="font-bold text-amber-600"
                        title={`Quebra de produção: ${lossReasonLabel(order.lossReason)}`}
                      >
                        {order.actualQuantity}
                      </span>
                    ) : (
                      <span className="font-bold text-ink">{order.actualQuantity}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink">
                    {order.date ? moment(order.date).format('DD/MM/YYYY HH:mm') : '-'}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                  <td className="px-4 py-3 text-sm text-ink max-w-xs truncate" title={order.notes || ''}>
                    {order.notes || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      {order.status === 'OPEN' && (
                        <button
                          className="px-3 py-1.5 text-xs bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1"
                          onClick={() => openFinishModal(order)}
                        >
                          <CheckCircle2 size={12} /> Finalizar
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          className="p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                          onClick={() => setConfirmDelete(order.id)}
                          title="Excluir Ordem"
                          aria-label="Excluir Ordem"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
        </Table>
      )}

      <Modal
        open={finishOrder !== null}
        title="Finalizar ordem de produção"
        confirmLabel={finishing ? 'Finalizando...' : 'Finalizar'}
        onCancel={() => setFinishOrder(null)}
        onConfirm={handleFinish}
      >
        {finishOrder && (
          <>
            <p className="text-sm text-ink-muted mb-4">
              Os insumos da ficha técnica serão debitados pela quantidade planejada ({finishOrder.quantity}). Informe
              quanto realmente saiu bom — se for menos que o planejado, é a quebra de produção.
            </p>
            {finishError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-sm">
                {finishError}
              </div>
            )}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="productionorderlist-quantidade-real-produzida-planejado" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Quantidade real produzida (planejado: {finishOrder.quantity})
                </label>
                <Field id="productionorderlist-quantidade-real-produzida-planejado"
                  type="number"
                  min="0"
                  max={finishOrder.quantity}
                  step="1"
                  value={finishActualQuantity}
                  onChange={(e) => setFinishActualQuantity(e.target.value)}
                />
              </div>
              {Number(finishActualQuantity) < finishOrder.quantity && (
                <div className="flex flex-col gap-1">
                  <label htmlFor="productionorderlist-motivo-da-quebra" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider">
                    Motivo da quebra
                  </label>
                  <Field id="productionorderlist-motivo-da-quebra"
                    as="select"
                    value={finishLossReason}
                    onChange={(e) => setFinishLossReason(e.target.value as LossReason)}
                  >
                    <option value="">Selecione...</option>
                    {Object.entries(LOSS_REASON_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Field>
                </div>
              )}
            </div>
          </>
        )}
      </Modal>

      <Modal
        open={confirmDelete !== null}
        variant="danger"
        title="Confirmar exclusão"
        message="Tem certeza que deseja excluir esta ordem de produção?"
        confirmLabel="Excluir"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete !== null && handleDelete(confirmDelete)}
      />
    </div>
  );
};

export default ProductionOrderList;
