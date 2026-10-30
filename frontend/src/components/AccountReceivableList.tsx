import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Search, Undo2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../services/api';
import { formatDate, formatMoney, isOverdue } from '../utils/format';
import { AccountReceivable } from '../types';
import Button from './ui/Button';
import Field from './ui/Field';
import Modal from './ui/Modal';
import { Table, Th } from './ui/Table';

type DisplayStatus = 'PENDENTE' | 'ATRASADO' | 'RECEBIDO';

/** O banco guarda só "em aberto": a conta aparece como atrasada quando o vencimento já passou. */
const displayStatus = (account: AccountReceivable): DisplayStatus => {
  if (account.status === 'RECEIVED') return 'RECEBIDO';
  return isOverdue(account.dueDate) ? 'ATRASADO' : 'PENDENTE';
};

const STATUS_CLASSES: Record<DisplayStatus, string> = {
  PENDENTE: 'bg-amber-100 text-amber-800',
  ATRASADO: 'bg-rose-100 text-rose-800',
  RECEBIDO: 'bg-emerald-100 text-emerald-800',
};

interface PendingAction {
  kind: 'settle' | 'undo';
  account: AccountReceivable;
}

const AccountReceivableList = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<AccountReceivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [search, setSearch] = useState('');
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await api.get<AccountReceivable[]>('/accounts-receivable');
        setAccounts(response.data);
      } catch (err) {
        setError(getErrorMessage(err, 'Erro ao carregar contas a receber.'));
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, [refreshTrigger]);

  // Falha na ação vira aviso: a lista continua na tela, em vez de ser trocada pela mensagem de erro.
  const confirmAction = async () => {
    if (!pending || processing) return;
    setProcessing(true);
    try {
      if (pending.kind === 'settle') {
        await api.put(`/accounts-receivable/receive/${pending.account.id}`);
        toast.success('Recebimento registrado!');
      } else {
        await api.put(`/accounts-receivable/undo-receipt/${pending.account.id}`);
        toast.success('Recebimento desfeito. O valor saiu do caixa.');
      }
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao processar a conta.'));
    } finally {
      setProcessing(false);
      setPending(null);
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

  const filtered = accounts.filter((account) => {
    const q = search.toLowerCase();
    return [account.description, account.person?.name, displayStatus(account)].some((v) => (v ?? '').toLowerCase().includes(q));
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-lg font-semibold text-ink">Contas a Receber</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
            <Field
              type="text"
              placeholder="Pesquisar descrição, cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 py-2 text-sm w-full sm:w-64"
            />
          </div>
          <Button onClick={() => navigate('/accounts-receivable/new')}>
            <Plus size={14} /> Nova Conta a Receber
          </Button>
        </div>
      </div>

      <div className="card p-6">
        {filtered.length === 0 ? (
          <p className="text-center text-ink-muted py-8 text-sm">
            {search ? `Nenhum resultado para "${search}".` : 'Nenhuma conta a receber encontrada.'}
          </p>
        ) : (
          <Table>
              <thead className="bg-surface-2 border-b border-line">
                <tr>
                  <Th>ID</Th>
                  <Th>Descrição</Th>
                  <Th className="text-right">Valor</Th>
                  <Th>Vencimento</Th>
                  <Th>Cliente</Th>
                  <Th>Status</Th>
                  <Th>Ações</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((account) => {
                  const status = displayStatus(account);
                  return (
                    <tr key={account.id} className="hover:bg-surface-2 transition-colors">
                      <td className="px-4 py-3 text-sm text-ink">{account.id}</td>
                      <td className="px-4 py-3 text-sm text-ink">{account.description}</td>
                      <td className="px-4 py-3 text-sm text-ink text-right whitespace-nowrap">{formatMoney(account.amount)}</td>
                      <td className="px-4 py-3 text-sm text-ink">{formatDate(account.dueDate)}</td>
                      <td className="px-4 py-3 text-sm text-ink">{account.person?.name || 'Não informado'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASSES[status]}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {account.status === 'RECEIVED' ? (
                          <button
                            className="px-3 py-1.5 text-xs border border-line text-ink font-semibold rounded-lg hover:bg-surface-2 transition-colors flex items-center gap-1 whitespace-nowrap"
                            onClick={() => setPending({ kind: 'undo', account })}
                          >
                            <Undo2 size={12} /> Desfazer
                          </button>
                        ) : (
                          <button
                            className="px-3 py-1.5 text-xs bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1"
                            onClick={() => setPending({ kind: 'settle', account })}
                          >
                            <CheckCircle2 size={12} /> Receber
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
          </Table>
        )}
      </div>

      <Modal
        open={pending !== null}
        variant={pending?.kind === 'undo' ? 'danger' : 'default'}
        title={pending?.kind === 'undo' ? 'Desfazer recebimento?' : 'Confirmar recebimento?'}
        message={
          pending
            ? pending.kind === 'undo'
              ? `A conta "${pending.account.description}" volta a ficar em aberto e ${formatMoney(pending.account.amount)} saem do saldo do caixa aberto.`
              : `${formatMoney(pending.account.amount)} referente a "${pending.account.description}" entrarão no saldo do caixa aberto.`
            : undefined
        }
        confirmLabel={processing ? 'Processando...' : pending?.kind === 'undo' ? 'Desfazer' : 'Receber'}
        onCancel={() => setPending(null)}
        onConfirm={confirmAction}
      />
    </div>
  );
};

export default AccountReceivableList;
