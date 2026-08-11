import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatBRL } from '../utils/currency';

const getStatusBadge = (status) => {
    switch (status) {
        case 'PENDING': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">PENDENTE</span>;
        case 'RECEIVED': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">RECEBIDO</span>;
        case 'OVERDUE': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">ATRASADO</span>;
        default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{status}</span>;
    }
};

const AccountReceivableList = () => {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await api.get('/accounts-receivable');
                setAccounts(response.data);
            } catch (err) {
                setError('Erro ao carregar contas a receber: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAccounts();
    }, [refreshTrigger]);

    const handleReceiveAccount = async (id) => {
        try {
            await api.put(`/accounts-receivable/receive/${id}`);
            setRefreshTrigger((prev) => prev + 1);
        } catch (err) {
            setError('Erro ao receber conta: ' + (err.response?.data?.message || err.message));
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

    const filtered = accounts.filter(account => {
        const q = search.toLowerCase();
        const statusLabel = account.status === 'PENDING' ? 'pendente' : account.status === 'RECEIVED' ? 'recebido' : 'atrasado';
        return [account.description, account.person?.name, statusLabel].some(v => (v ?? '').toLowerCase().includes(q));
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4">
                <h2 className="text-lg font-semibold text-slate-800">Contas a Receber</h2>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input type="text" placeholder="Pesquisar descrição, cliente..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 pr-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 w-64" />
                    </div>
                    <button
                        className="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
                        onClick={() => navigate('/accounts-receivable/new')}
                    >
                        <Plus size={14} /> Nova Conta a Receber
                    </button>
                </div>
            </div>

            <div className="bg-stone-50 rounded-xl shadow-soft border border-stone-200 p-6">
                {filtered.length === 0 ? (
                    <p className="text-center text-slate-400 py-8 text-sm">
                        {search ? `Nenhum resultado para "${search}".` : 'Nenhuma conta a receber encontrada.'}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-stone-100 border-b border-stone-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Descrição</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Valor</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Vencimento</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Cliente</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((account) => (
                                    <tr key={account.id} className="hover:bg-stone-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-slate-700">{account.id}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{account.description}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700 text-right">R$ {formatBRL(account.amount ?? 0)}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{new Date(account.dueDate).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{account.person?.name || 'N/A'}</td>
                                        <td className="px-4 py-3">{getStatusBadge(account.status)}</td>
                                        <td className="px-4 py-3">
                                            {account.status === 'PENDING' && (
                                                <button
                                                    className="px-3 py-1.5 text-xs bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
                                                    onClick={() => handleReceiveAccount(account.id)}
                                                >
                                                    <CheckCircle2 size={12} /> Receber
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

export default AccountReceivableList;