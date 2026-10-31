import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../services/api';
import CategoryTag from './CategoryTag';
import { Search, PackageMinus } from 'lucide-react';
import { LossReason, Product, StockMovement } from '../types';
import { lossReasonLabel, LOSS_REASON_LABELS } from '../utils/lossReason';
import Button from './ui/Button';
import Field from './ui/Field';
import Modal from './ui/Modal';
import { Table, Th } from './ui/Table';
import { baseUnit, formatDateTime, formatStock } from '../utils/format';

const MOVEMENT_TYPE_STYLES: Record<string, string> = {
  ENTRY: 'bg-emerald-100 text-emerald-800',
  EXIT: 'bg-rose-100 text-rose-800',
  LOSS: 'bg-amber-100 text-amber-800',
};

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  ENTRY: 'ENTRADA',
  EXIT: 'SAÍDA',
  LOSS: 'PERDA',
};

const StockMovementList = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [lossModalOpen, setLossModalOpen] = useState(false);
  const [lossProductId, setLossProductId] = useState('');
  const [lossQuantity, setLossQuantity] = useState('');
  const [lossReason, setLossReason] = useState<LossReason | ''>('');
  const [lossDescription, setLossDescription] = useState('');
  const [lossError, setLossError] = useState('');
  const [savingLoss, setSavingLoss] = useState(false);

  const fetchStockMovements = async () => {
    try {
      const response = await api.get<StockMovement[]>('/stock-movements');
      setMovements([...response.data].sort((a, b) => b.id - a.id));
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao carregar movimentações de estoque.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockMovements();
    api
      .get<Product[]>('/product')
      .then((response) => setProducts(response.data))
      .catch(() => {});
  }, []);

  const openLossModal = () => {
    setLossProductId('');
    setLossQuantity('');
    setLossReason('');
    setLossDescription('');
    setLossError('');
    setLossModalOpen(true);
  };

  const handleRegisterLoss = async () => {
    if (!lossProductId || !lossQuantity || !lossReason) {
      setLossError('Selecione o produto, informe a quantidade e o motivo da perda.');
      return;
    }
    setSavingLoss(true);
    setLossError('');
    try {
      await api.post('/stock-movements/loss', {
        productId: Number(lossProductId),
        quantity: Number(lossQuantity),
        reason: lossReason,
        description: lossDescription || undefined,
      });
      toast.success('Perda registrada com sucesso!');
      setLossModalOpen(false);
      fetchStockMovements();
    } catch (err) {
      setLossError(getErrorMessage(err, 'Erro ao registrar perda.'));
    } finally {
      setSavingLoss(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-4 border-line border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-sm">{error}</div>;
  }

  const filtered = movements.filter((m) => {
    const q = search.toLowerCase();
    const typeLabel = MOVEMENT_TYPE_LABELS[m.type] ?? m.type;
    return [m.product?.name, m.description, typeLabel, lossReasonLabel(m.reason)].some((v) =>
      (v ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-lg font-semibold text-ink">Histórico de Movimentações de Estoque</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
            <Field
              type="text"
              placeholder="Pesquisar produto, descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 py-2 text-sm w-full sm:w-56"
            />
          </div>
          <Button variant="secondary" onClick={openLossModal}>
            <PackageMinus size={14} /> Registrar Perda
          </Button>
        </div>
      </div>

      <div className="card p-6">
        {filtered.length === 0 ? (
          <p className="text-center text-ink-muted py-8 text-sm">
            {search ? `Nenhum resultado para "${search}".` : 'Nenhuma movimentação de estoque encontrada.'}
          </p>
        ) : (
          <Table>
              <thead className="bg-surface-2 border-b border-line">
                <tr>
                  <Th>ID</Th>
                  <Th>Data/Hora</Th>
                  <Th>Produto</Th>
                  <Th>Tipo</Th>
                  <Th className="text-right">Quantidade</Th>
                  <Th>Motivo</Th>
                  <Th>Descrição</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((movement) => (
                  <tr key={movement.id} className="hover:bg-surface-2 transition-colors">
                    <td className="px-4 py-3 text-sm text-ink">{movement.id}</td>
                    <td className="px-4 py-3 text-sm text-ink">{formatDateTime(movement.date)}</td>
                    <td className="px-4 py-3 text-sm text-ink">
                      <div className="flex items-center gap-2">
                        <span>{movement.product ? movement.product.name : 'Não informado'}</span>
                        {movement.product?.categoryName && <CategoryTag name={movement.product.categoryName} />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          MOVEMENT_TYPE_STYLES[movement.type] ?? 'bg-surface-2 text-ink-muted'
                        }`}
                      >
                        {MOVEMENT_TYPE_LABELS[movement.type] ?? movement.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink text-right whitespace-nowrap">{formatStock(movement.quantity, movement.product)}</td>
                    <td className="px-4 py-3 text-sm text-ink">{lossReasonLabel(movement.reason)}</td>
                    <td className="px-4 py-3 text-sm text-ink">{movement.description}</td>
                  </tr>
                ))}
              </tbody>
          </Table>
        )}
      </div>

      <Modal
        open={lossModalOpen}
        title="Registrar perda de estoque"
        confirmLabel={savingLoss ? 'Salvando...' : 'Registrar'}
        onCancel={() => setLossModalOpen(false)}
        onConfirm={handleRegisterLoss}
      >
        {lossError && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-sm">
            {lossError}
          </div>
        )}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="stockmovementlist-produto" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider">Produto</label>
            <Field id="stockmovementlist-produto" as="select" value={lossProductId} onChange={(e) => setLossProductId(e.target.value)}>
              <option value="">Selecione...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({formatStock(p.storage, p)})
                </option>
              ))}
            </Field>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="stockmovementlist-quantidade" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider">
              Quantidade{lossProductId ? ` (em ${baseUnit(products.find((p) => String(p.id) === lossProductId))})` : ''}
            </label>
            <Field id="stockmovementlist-quantidade"
              type="number"
              min="0.01"
              step="0.01"
              value={lossQuantity}
              onChange={(e) => setLossQuantity(e.target.value)}
              placeholder="Ex: 5"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="stockmovementlist-motivo" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider">Motivo</label>
            <Field id="stockmovementlist-motivo" as="select" value={lossReason} onChange={(e) => setLossReason(e.target.value as LossReason)}>
              <option value="">Selecione...</option>
              {Object.entries(LOSS_REASON_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Field>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="stockmovementlist-observacoes-opcional" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider">
              Observações (opcional)
            </label>
            <Field id="stockmovementlist-observacoes-opcional"
              as="textarea"
              rows={2}
              value={lossDescription}
              onChange={(e) => setLossDescription(e.target.value)}
              placeholder="Ex: 5 marmitas do almoço sobraram e venceram."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StockMovementList;
