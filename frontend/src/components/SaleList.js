import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatBRL } from '../utils/currency';

const getPaymentMethodLabel = (method) => {
    switch (method) {
        case 'DINHEIRO': return 'Dinheiro';
        case 'CARTAO_DEBITO': return 'Cartão Débito';
        case 'CARTAO_CREDITO': return 'Cartão Crédito';
        case 'PIX': return 'PIX';
        default: return method;
    }
};

const SaleList = () => {
    const navigate = useNavigate();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const response = await api.get('/sales');
                setSales(response.data);
            } catch (err) {
                setError('Erro ao carregar vendas: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSales();
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

    const filtered = sales.filter(sale => {
        const q = search.toLowerCase();
        const dateStr = sale.date ? new Date(sale.date).toLocaleDateString() : '';
        return [sale.personName, getPaymentMethodLabel(sale.paymentMethod), dateStr].some(v => (v ?? '').toLowerCase().includes(q));
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4">
                <h2 className="text-lg font-semibold text-slate-800">Lista de Vendas</h2>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input type="text" placeholder="Pesquisar cliente, pagamento..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 pr-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 w-56" />
                    </div>
                    <button
                        className="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
                        onClick={() => navigate('/sales/new')}
                    >
                        <Plus size={14} /> Nova Venda
                    </button>
                </div>
            </div>

            <div className="bg-stone-50 rounded-xl shadow-soft border border-stone-200 p-6">
                {filtered.length === 0 ? (
                    <p className="text-center text-slate-400 py-8 text-sm">
                        {search ? `Nenhum resultado para "${search}".` : 'Nenhuma venda encontrada.'}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-stone-100 border-b border-stone-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Data</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Cliente</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Pagamento</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Desconto</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Total</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-stone-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-slate-700">{sale.id}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{new Date(sale.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{sale.personName || 'N/A'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                {getPaymentMethodLabel(sale.paymentMethod)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700 text-right">R$ {formatBRL(sale.discount ?? 0)}</td>
                                        <td className="px-4 py-3 text-sm font-semibold text-slate-800 text-right">R$ {formatBRL(sale.total ?? 0)}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                className="px-3 py-1.5 text-xs border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-stone-50 transition-colors"
                                                onClick={() => navigate(`/sales/${sale.id}`)}
                                            >
                                                Ver Detalhes
                                            </button>
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

export default SaleList;