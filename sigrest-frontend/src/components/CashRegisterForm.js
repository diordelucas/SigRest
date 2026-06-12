import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CashRegisterForm = () => {
    const [currentCashRegister, setCurrentCashRegister] = useState(null);
    const [openingBalance, setOpeningBalance] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogAction, setDialogAction] = useState(null);

    const currentUserId = 1;

    useEffect(() => {
        const fetchCurrentCashRegister = async () => {
            try {
                const response = await api.get('/cash-registers/current-open');
                setCurrentCashRegister(response.data);
            } catch (err) {
                if (err.response && err.response.status === 204) {
                    setCurrentCashRegister(null);
                } else {
                    setError('Erro ao carregar status do caixa: ' + err.message);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchCurrentCashRegister();
    }, []);

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
        setError(null);
        setSuccessMessage(null);

        try {
            if (dialogAction === 'open') {
                const response = await api.post('/cash-registers/open', {
                    openingBalance: parseFloat(openingBalance),
                    openedByUserId: currentUserId
                });
                setCurrentCashRegister(response.data);
                setSuccessMessage('Caixa aberto com sucesso!');
                setOpeningBalance('');
            } else if (dialogAction === 'close') {
                const response = await api.post(`/cash-registers/close/${currentCashRegister.id}?closedByUserId=${currentUserId}`);
                setCurrentCashRegister(response.data);
                setSuccessMessage('Caixa fechado com sucesso!');
            }
        } catch (err) {
            setError('Erro: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
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

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                        {successMessage}
                    </div>
                )}

                {currentCashRegister && currentCashRegister.isOpen ? (
                    <div>
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                            Caixa atualmente aberto.
                        </div>
                        <div className="space-y-2 mb-6">
                            <p className="text-sm text-slate-700"><span className="font-semibold">ID do Caixa:</span> {currentCashRegister.id}</p>
                            <p className="text-sm text-slate-700"><span className="font-semibold">Aberto em:</span> {new Date(currentCashRegister.openingTime).toLocaleString()}</p>
                            <p className="text-sm text-slate-700"><span className="font-semibold">Saldo Inicial:</span> R$ {currentCashRegister.openingBalance.toFixed(2)}</p>
                            <p className="text-sm text-slate-700"><span className="font-semibold">Aberto por:</span> {currentCashRegister.openedBy?.name || 'N/A'}</p>
                        </div>
                        <button
                            className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors"
                            onClick={handleCloseCashRegister}
                        >
                            Fechar Caixa
                        </button>
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
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
                                    value={openingBalance}
                                    onChange={(e) => setOpeningBalance(e.target.value)}
                                    required
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <button
                            className="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleOpenCashRegister}
                            disabled={!openingBalance}
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
                                ? `Deseja realmente abrir o caixa com saldo inicial de R$ ${parseFloat(openingBalance).toFixed(2)}?`
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