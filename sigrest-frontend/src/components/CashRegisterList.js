import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import api from '../services/api';
import { formatBRL } from '../utils/currency';

const CashRegisterList = () => {
    const [cashRegisters, setCashRegisters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchCashRegisters = async () => {
            try {
                const response = await api.get('/cash-registers');
                setCashRegisters(response.data);
            } catch (err) {
                setError('Erro ao carregar caixas: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCashRegisters();
    }, []);

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

    const filtered = cashRegisters.filter(cr => {
        const q = search.toLowerCase();
        const statusLabel = cr.isOpen ? 'aberto' : 'fechado';
        return [cr.openedBy?.name, cr.closedBy?.name, statusLabel].some(v => (v ?? '').toLowerCase().includes(q));
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-800">Histórico de Caixas</h2>
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input type="text" placeholder="Pesquisar usuário, status..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 pr-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 w-64" />
                </div>
            </div>

            <div className="bg-stone-50 rounded-xl shadow-soft border border-stone-200 p-6">
                {filtered.length === 0 ? (
                    <p className="text-center text-slate-400 py-8 text-sm">
                        {search ? `Nenhum resultado para "${search}".` : 'Nenhum caixa encontrado.'}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-stone-100 border-b border-stone-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Abertura</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Fechamento</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Saldo Inicial</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Saldo Final</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Aberto por</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Fechado por</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((cr) => (
                                    <tr key={cr.id} className="hover:bg-stone-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-slate-700">{cr.id}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{new Date(cr.openingTime).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{cr.closingTime ? new Date(cr.closingTime).toLocaleString() : 'N/A'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700 text-right">R$ {formatBRL(cr.openingBalance ?? 0)}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700 text-right">
                                            {cr.closingBalance != null ? `R$ ${formatBRL(cr.closingBalance)}` : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                cr.isOpen ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {cr.isOpen ? 'ABERTO' : 'FECHADO'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{cr.openedBy?.name || 'N/A'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{cr.closedBy?.name || 'N/A'}</td>
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

export default CashRegisterList;