import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-slate-800">Lista de Vendas</h2>
                <button
                    className="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
                    onClick={() => navigate('/sales/new')}
                >
                    <Plus size={14} /> Nova Venda
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6">
                {sales.length === 0 ? (
                    <p className="text-center text-slate-400 py-8 text-sm">Nenhuma venda encontrada.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pagamento</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Desconto</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-slate-700">{sale.id}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{new Date(sale.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{sale.personName || 'N/A'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                {getPaymentMethodLabel(sale.paymentMethod)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700 text-right">R$ {sale.discount.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-sm font-semibold text-slate-800 text-right">R$ {sale.total.toFixed(2)}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                className="px-3 py-1.5 text-xs border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
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