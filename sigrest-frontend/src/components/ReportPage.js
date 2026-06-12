import React, { useState } from 'react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ComposedChart, Area } from 'recharts';
import moment from 'moment';
import { formatBRL } from '../utils/currency';

const inputCls = "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors";
const selectCls = "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors appearance-none";

const ReportPage = () => {
    const [reportType, setReportType] = useState('');
    const [startDate, setStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerateReport = async () => {
        setLoading(true);
        setError(null);
        setReportData(null);
        try {
            let response;
            switch (reportType) {
                case 'sales-by-period':
                    response = await api.get('/reports/sales-by-period', {
                        params: { startDate, endDate }
                    });
                    setReportData(response.data.map((item) => ({
                        ...item,
                        date: moment(item.date).format('DD/MM/YYYY')
                    })));
                    break;
                case 'top-selling-products':
                    response = await api.get('/reports/top-selling-products', {
                        params: { limit: 10 }
                    });
                    setReportData(response.data);
                    break;
                case 'monthly-revenue':
                    response = await api.get('/reports/monthly-revenue', {
                        params: {
                            startMonth: moment(startDate).startOf('month').format('YYYY-MM-DD'),
                            endMonth: moment(endDate).endOf('month').format('YYYY-MM-DD')
                        }
                    });
                    setReportData(response.data.map((item) => ({
                        ...item,
                        month: moment(item.month).format('MMM YYYY')
                    })));
                    break;
                case 'stock-movement':
                    response = await api.get('/reports/stock-movement', {
                        params: { startDate, endDate }
                    });
                    setReportData(response.data.map((item) => ({
                        ...item,
                        date: moment(item.date).format('DD/MM/YYYY HH:mm')
                    })));
                    break;
                case 'financial-flow':
                    response = await api.get('/reports/financial-flow', {
                        params: { startDate, endDate }
                    });
                    setReportData(response.data.map((item) => ({
                        ...item,
                        month: item.month,
                    })));
                    break;
                case 'purchase-history':
                    response = await api.get('/purchases');
                    setReportData(response.data.map((item) => ({
                        ...item,
                        date: moment(item.date).format('DD/MM/YYYY'),
                        supplierName: item.supplier?.name || '—',
                        itemCount: item.items?.length ?? 0,
                    })));
                    break;
                default:
                    setError('Selecione um tipo de relatório.');
                    break;
            }
        } catch (err) {
            setError('Erro ao gerar relatório: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const renderReportContent = () => {
        if (!reportData) return null;

        switch (reportType) {
            case 'sales-by-period':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={reportData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="totalRevenue" stroke="#8884d8" name="Receita Total (R$)" strokeWidth={2} />
                            <Line type="monotone" dataKey="totalSales" stroke="#82ca9d" name="Total de Vendas" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'top-selling-products':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={reportData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="productName" tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="totalQuantitySold" fill="#8884d8" name="Quantidade Vendida" />
                            <Bar dataKey="totalRevenue" fill="#82ca9d" name="Receita (R$)" />
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'monthly-revenue':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={reportData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="totalRevenue" stroke="#f97316" name="Faturamento (R$)" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'stock-movement':
                return (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Data/Hora</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Produto</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Quantidade</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {reportData.map((movement, index) => (
                                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-slate-700">{movement.date}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{movement.productName}</td>
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
                );
            case 'financial-flow':
                return (
                    <div>
                        <p className="text-xs text-slate-500 mb-4">Entradas = faturamento de vendas · Saídas = total de compras</p>
                        <ResponsiveContainer width="100%" height={400}>
                            <ComposedChart data={reportData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip formatter={(v) => `R$ ${formatBRL(v)}`} />
                                <Legend />
                                <Bar dataKey="totalEntradas" fill="#10b981" name="Entradas (R$)" />
                                <Bar dataKey="totalSaidas" fill="#f43f5e" name="Saídas (R$)" />
                                <Line type="monotone" dataKey="saldo" stroke="#6366f1" name="Saldo (R$)" strokeWidth={2} dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mês</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Entradas</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Saídas</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Saldo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {reportData.map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-sm text-slate-700">{row.month}</td>
                                            <td className="px-4 py-3 text-sm text-emerald-600 text-right font-medium">R$ {formatBRL(row.totalEntradas)}</td>
                                            <td className="px-4 py-3 text-sm text-rose-600 text-right font-medium">R$ {formatBRL(row.totalSaidas)}</td>
                                            <td className={`px-4 py-3 text-sm text-right font-bold ${row.saldo >= 0 ? 'text-slate-700' : 'text-orange-600'}`}>
                                                R$ {formatBRL(row.saldo)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'purchase-history':
                return (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fornecedor</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Itens</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {reportData.map((purchase) => (
                                    <tr key={purchase.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm text-slate-700">{purchase.date}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{purchase.supplierName}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700 text-right">{purchase.itemCount}</td>
                                        <td className="px-4 py-3 text-sm font-semibold text-slate-800 text-right">R$ {formatBRL(purchase.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {reportData.length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-8">Nenhuma compra registrada.</p>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div>
            <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-6">Relatórios Gerenciais</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-4 gap-4 items-end mb-6">
                    <div className="flex flex-col gap-1">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tipo de Relatório</label>
                        <select
                            className={selectCls}
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                        >
                            <option value="">Nenhum</option>
                            <option value="sales-by-period">Vendas por Período</option>
                            <option value="top-selling-products">Produtos Mais Vendidos</option>
                            <option value="monthly-revenue">Faturamento Mensal</option>
                            <option value="stock-movement">Movimentação de Estoque</option>
                            <option value="financial-flow">Fluxo Financeiro</option>
                            <option value="purchase-history">Histórico de Compras</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Data Inicial</label>
                        <input
                            type="date"
                            className={inputCls}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Data Final</label>
                        <input
                            type="date"
                            className={inputCls}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <button
                            className="w-full px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            onClick={handleGenerateReport}
                            disabled={loading || !reportType}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Gerando...
                                </>
                            ) : 'Gerar'}
                        </button>
                    </div>
                </div>

                {reportData && (
                    <div className="mt-4">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Resultado do Relatório</h3>
                        {renderReportContent()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportPage;