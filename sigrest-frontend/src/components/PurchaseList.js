import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const PurchaseList = () => {
    const navigate = useNavigate();
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                const response = await api.get('/purchases');
                setPurchases(response.data);
            } catch (err) {
                setError('Erro ao carregar compras: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPurchases();
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
                <h2 className="text-lg font-semibold text-slate-800">Lista de Compras</h2>
                <button
                    className="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
                    onClick={() => navigate('/purchases/new')}
                >
                    <Plus size={14} /> Nova Compra
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6">
                {purchases.length === 0 ? (
                    <p className="text-center text-slate-400 py-8 text-sm">Nenhuma compra encontrada.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fornecedor</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {purchases.map((purchase) => (
                                    <tr key={purchase.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-slate-700">{purchase.id}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{new Date(purchase.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{purchase.supplier ? purchase.supplier.name : 'N/A'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700 text-right">R$ {purchase.total.toFixed(2)}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                className="px-3 py-1.5 text-xs border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                                                onClick={() => navigate(`/purchases/${purchase.id}`)}
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

export default PurchaseList;