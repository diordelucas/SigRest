import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CurrencyInput from './CurrencyInput';
import { formatBRL } from '../utils/currency';

const inputCls = "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors";
const selectCls = "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors appearance-none";

const EMPTY_MOVEMENT = { type: 'EXPENSE', amount: '', description: '' };

const CashRegisterForm = () => {
    const { currentUser } = useAuth();
    const [currentCashRegister, setCurrentCashRegister] = useState(null);
    const [openingBalance, setOpeningBalance] = useState('');
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogAction, setDialogAction] = useState(null);
    const [movement, setMovement] = useState(EMPTY_MOVEMENT);
    const [submittingMovement, setSubmittingMovement] = useState(false);
    const [movements, setMovements] = useState([]);

    const fetchCashRegister = useCallback(async () => {
        try {
            const response = await api.get('/cash-registers/current-open');
            setCurrentCashRegister(response.data || null);
            return response.data || null;
        } catch (err) {
            toast.error('Erro ao carregar status do caixa: ' + (err.response?.data?.message || err.message));
            return null;
        }
    }, []);

    const fetchMovements = useCallback(async (cashRegisterId) => {
        try {
            const response = await api.get(`/cash-movements/cash-register/${cashRegisterId}`);
            setMovements(response.data || []);
        } catch {
            setMovements([]);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const register = await fetchCashRegister();
            if (register?.open && register?.id) {
                await fetchMovements(register.id);
            }
            setLoading(false);
        };
        init();
    }, [fetchCashRegister, fetchMovements]);

    const handleOpenCashRegister = () => {
        setDialogAction('open');
        setOpenDialog(true);
    };

    const handleCloseCashRegister = () => {
        setDialogAction('close');
        setOpenDialog(true);
    };

    const confirmAction = async () => {
        setOpenDialog(false);
        setLoading(true);

        try {
            if (dialogAction === 'open') {
                if (!currentUser?.id) {
                    toast.error('Sessão inválida. Faça login novamente para abrir o caixa.');
                    return;
                }
                const response = await api.post('/cash-registers/open', {
                    openingBalance: Number(openingBalance),
                    openedByUserId: currentUser.id,
                });
                setCurrentCashRegister(response.data);
                setMovements([]);
                setOpeningBalance('');
                toast.success('Caixa aberto com sucesso!');
            } else if (dialogAction === 'close') {
                const response = await api.post(
                    `/cash-registers/close/${currentCashRegister.id}?closedByUserId=${currentUser.id}`
                );
                setCurrentCashRegister(response.data);
                setMovements([]);
                toast.success('Caixa fechado com sucesso!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erro ao processar a operação de caixa.');
        } finally {
            setLoading(false);
        }
    };

    const handleMovementSubmit = async (e) => {
        e.preventDefault();
        if (!movement.amount) {
            toast.error('Informe o valor da movimentação.');
            return;
        }
        setSubmittingMovement(true);
        try {
            await api.post('/cash-movements', {
                cashRegisterId: currentCashRegister.id,
                userId: currentUser.id,
                type: movement.type,
                amount: Number(movement.amount),
                description: movement.description || null,
            });
            toast.success('Movimentação registrada!');
            setMovement(EMPTY_MOVEMENT);
            const updated = await fetchCashRegister();
            if (updated?.id) await fetchMovements(updated.id);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erro ao registrar movimentação.');
        } finally {
            setSubmittingMovement(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Controle de Caixa</h2>

                {currentCashRegister && currentCashRegister.open ? (
                    <div>
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                            Caixa atualmente aberto.
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saldo Inicial</p>
                                <p className="text-lg font-bold text-slate-800">R$ {formatBRL(currentCashRegister.openingBalance ?? 0)}</p>
                            </div>
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Saldo Atual</p>
                                <p className="text-lg font-bold text-green-700">R$ {formatBRL(currentCashRegister.currentBalance ?? currentCashRegister.openingBalance ?? 0)}</p>
                            </div>
                            <div className="col-span-2 space-y-1">
                                <p className="text-sm text-slate-700"><span className="font-semibold">ID do Caixa:</span> {currentCashRegister.id}</p>
                                <p className="text-sm text-slate-700"><span className="font-semibold">Aberto em:</span> {new Date(currentCashRegister.openingTime).toLocaleString()}</p>
                                <p className="text-sm text-slate-700"><span className="font-semibold">Operador:</span> {currentCashRegister.openedBy?.name || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Registrar Movimentação */}
                        <div className="border-t border-slate-200 pt-5 mb-5">
                            <h3 className="text-sm font-semibold text-slate-700 mb-4">Registrar Movimentação</h3>
                            <form onSubmit={handleMovementSubmit}>
                                <div className="grid grid-cols-3 gap-3 mb-3">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</label>
                                        <select
                                            className={selectCls}
                                            value={movement.type}
                                            onChange={(e) => setMovement({ ...movement, type: e.target.value })}
                                        >
                                            <option value="EXPENSE">Saída (Despesa)</option>
                                            <option value="INCOME">Entrada</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</span>
                                            <CurrencyInput
                                                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
                                                value={movement.amount}
                                                onChange={(val) => setMovement({ ...movement, amount: val })}
                                                placeholder="0,00"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</label>
                                        <input
                                            type="text"
                                            className={inputCls}
                                            value={movement.description}
                                            onChange={(e) => setMovement({ ...movement, description: e.target.value })}
                                            placeholder="Ex: Gás, aluguel..."
                                            maxLength={120}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submittingMovement || !movement.amount}
                                    className="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submittingMovement ? 'Registrando...' : 'Registrar'}
                                </button>
                            </form>
                        </div>

                        {/* Histórico do Caixa Atual */}
                        {movements.length > 0 && (
                            <div className="border-t border-slate-200 pt-5 mb-5">
                                <h3 className="text-sm font-semibold text-slate-700 mb-3">Movimentações deste Caixa</h3>
                                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                                    {movements.map((m) => (
                                        <div key={m.id} className="flex items-center justify-between py-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                {m.type === 'INCOME'
                                                    ? <ArrowUpCircle size={16} className="text-emerald-500 shrink-0" />
                                                    : <ArrowDownCircle size={16} className="text-rose-500 shrink-0" />
                                                }
                                                <div>
                                                    <p className="text-slate-700">{m.description || '—'}</p>
                                                    <p className="text-xs text-slate-400">{new Date(m.date).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <span className={`font-semibold shrink-0 ml-4 ${m.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {m.type === 'INCOME' ? '+' : '-'}R$ {formatBRL(m.amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="border-t border-slate-200 pt-4">
                            <button
                                className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors"
                                onClick={handleCloseCashRegister}
                            >
                                Fechar Caixa
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                            Nenhum caixa está aberto no momento.
                        </div>
                        <div className="flex flex-col gap-1 mb-6">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Saldo Inicial</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</span>
                                <CurrencyInput
                                    data-testid="cash-opening-balance"
                                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
                                    value={openingBalance}
                                    onChange={setOpeningBalance}
                                />
                            </div>
                        </div>
                        <button
                            className="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleOpenCashRegister}
                            disabled={openingBalance === '' || openingBalance === null}
                        >
                            Abrir Caixa
                        </button>
                    </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            {openDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-base font-semibold text-slate-800 mb-3">
                            {dialogAction === 'open' ? 'Confirmar Abertura de Caixa' : 'Confirmar Fechamento de Caixa'}
                        </h3>
                        <p className="text-sm text-slate-600 mb-6">
                            {dialogAction === 'open'
                                ? `Deseja realmente abrir o caixa com saldo inicial de R$ ${formatBRL(openingBalance)}?`
                                : `Deseja realmente fechar o caixa ${currentCashRegister?.id}?`}
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                                onClick={() => { setOpenDialog(false); setDialogAction(null); }}
                            >
                                Cancelar
                            </button>
                            <button
                                className="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors"
                                onClick={confirmAction}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CashRegisterForm;