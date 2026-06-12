import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const getStatusBadge = (status) => {
    switch (status) {
        case 'PENDING': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">PENDENTE</span>;
        case 'PAID': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">PAGO</span>;
        case 'OVERDUE': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">ATRASADO</span>;
        default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{status}</span>;
    }
};

const AccountPayableList = () => {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await api.get('/accounts-payable');
                setAccounts(response.data);
            } catch (err) {
                setError('Erro ao carregar contas a pagar: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAccounts();
    }, [refreshTrigger]);

    const handlePayAccount = async (id) => {
        try {
            await api.put(`/accounts-payable/pay/${id}`);
            setRefreshTrigger((prev) => prev + 1);
        } catch (err) {
            setError('Erro ao pagar conta: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-slate-800">Contas a Pagar</h2>
                <button
                    className="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
                    onClick={() => navigate('/accounts-payable/new')}
                >
                    <Plus size={14} /> Nova Conta a Pagar
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6">
                {accounts.length === 0 ? (
                    <p className="text-center text-slate-400 py-8 text-sm">Nenhuma conta a pagar encontrada.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vencimento</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fornecedor</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {accounts.map((account) => (
                                    <tr key={account.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-slate-700">{account.id}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{account.description}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700 text-right">R$ {account.amount.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{new Date(account.dueDate).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{account.supplier?.name || 'N/A'}</td>
                                        <td className="px-4 py-3">{getStatusBadge(account.status)}</td>
                                        <td className="px-4 py-3">
                                            {account.status === 'PENDING' && (
                                                <button
                                                    className="px-3 py-1.5 text-xs bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
                                                    onClick={() => handlePayAccount(account.id)}
                                                >
                                                    <CheckCircle2 size={12} /> Pagar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountPayableList;