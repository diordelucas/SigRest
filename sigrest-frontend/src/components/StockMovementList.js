import React, { useState, useEffect } from 'react';
import api from '../services/api';

const StockMovementList = () => {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStockMovements = async () => {
            try {
                const response = await api.get('/stock-movements');
                setMovements(response.data);
            } catch (err) {
                setError('Erro ao carregar movimentações de estoque: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStockMovements();
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
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Histórico de Movimentações de Estoque</h2>

            <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6">
                {movements.length === 0 ? (
                    <p className="text-center text-slate-400 py-8 text-sm">Nenhuma movimentação de estoque encontrada.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Data/Hora</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Produto</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Quantidade</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {movements.map((movement) => (
                                    <tr key={movement.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-slate-700">{movement.id}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{new Date(movement.date).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{movement.product ? movement.product.name : 'N/A'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                movement.type === 'ENTRY'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {movement.type === 'ENTRY' ? 'ENTRADA' : 'SAÍDA'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700 text-right">{movement.quantity}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{movement.description}</td>
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

export default StockMovementList;