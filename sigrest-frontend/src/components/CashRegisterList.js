import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CashRegisterList = () => {
    const [cashRegisters, setCashRegisters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    return (
        <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Histórico de Caixas</h2>

            <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6">
                {cashRegisters.length === 0 ? (
                    <p className="text-center text-slate-400 py-8 text-sm">Nenhum caixa encontrado.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Abertura</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fechamento</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Saldo Inicial</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Saldo Final</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Aberto por</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fechado por</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {cashRegisters.map((cr) => (
                                    <tr key={cr.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-slate-700">{cr.id}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{new Date(cr.openingTime).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{cr.closingTime ? new Date(cr.closingTime).toLocaleString() : 'N/A'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700 text-right">R$ {cr.openingBalance.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700 text-right">
                                            {cr.closingBalance ? `R$ ${cr.closingBalance.toFixed(2)}` : 'N/A'}
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