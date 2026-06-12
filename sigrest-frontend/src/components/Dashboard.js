import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import moment from 'moment';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [topSellingProducts, setTopSellingProducts] = useState([]);
    const [salesByPeriod, setSalesByPeriod] = useState([]);
    const [stockMovement, setStockMovement] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const today = moment();
                const oneMonthAgo = today.clone().subtract(1, 'month');
                const sixMonthsAgo = today.clone().subtract(6, 'months');

                const [
                    monthlyRevenueRes,
                    topSellingProductsRes,
                    salesByPeriodRes,
                    stockMovementRes
                ] = await Promise.all([
                    api.get('/reports/monthly-revenue', {
                        params: {
                            startMonth: sixMonthsAgo.format('YYYY-MM-DD'),
                            endMonth: today.format('YYYY-MM-DD')
                        }
                    }),
                    api.get('/reports/top-selling-products', { params: { limit: 5 } }),
                    api.get('/reports/sales-by-period', {
                        params: {
                            startDate: oneMonthAgo.format('YYYY-MM-DD'),
                            endDate: today.format('YYYY-MM-DD')
                        }
                    }),
                    api.get('/reports/stock-movement', {
                        params: {
                            startDate: oneMonthAgo.format('YYYY-MM-DD'),
                            endDate: today.format('YYYY-MM-DD')
                        }
                    })
                ]);

                setMonthlyRevenue(monthlyRevenueRes.data.map((item) => ({
                    ...item,
                    month: moment(item.month).format('MMM YYYY')
                })));
                setTopSellingProducts(topSellingProductsRes.data);
                setSalesByPeriod(salesByPeriodRes.data.map((item) => ({
                    ...item,
                    date: moment(item.date).format('DD/MM')
                })));
                setStockMovement(stockMovementRes.data);
            } catch (err) {
                setError('Erro ao carregar dados do dashboard: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
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
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Dashboard Gerencial</h2>

            <div className="grid grid-cols-2 gap-6">
                {/* Faturamento Mensal */}
                <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Faturamento Mensal</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="totalRevenue" stroke="#f97316" name="Faturamento (R$)" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Produtos Mais Vendidos */}
                <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Produtos Mais Vendidos (Quantidade)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topSellingProducts}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="productName" tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="totalQuantitySold" fill="#82ca9d" name="Quantidade Vendida" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Vendas por Período */}
                <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Vendas por Período (Último Mês)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={salesByPeriod}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="totalRevenue" stroke="#ffc658" name="Receita (R$)" strokeWidth={2} />
                            <Line type="monotone" dataKey="totalSales" stroke="#8884d8" name="Nº Vendas" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Resumo de Estoque */}
                <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Resumo de Movimentação de Estoque (Último Mês)</h3>
                    <div className="overflow-y-auto" style={{ maxHeight: "300px" }}>
                        {stockMovement.length > 0 ? (
                            stockMovement.map((movement, index) => (
                                <div key={index} className="mb-2 p-2 border-b border-slate-100">
                                    <p className="text-xs text-slate-700">
                                        <strong>{moment(movement.date).format('DD/MM HH:mm')}</strong>
                                        {' - '}
                                        {movement.productName}:{' '}
                                        <span className={movement.type === 'ENTRY' ? 'text-green-600' : 'text-red-600'}>
                                            {movement.type === 'ENTRY' ? '+' : '-'}{movement.quantity}
                                        </span>
                                        {' '}({movement.description})
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-400 text-center py-4">Nenhuma movimentação de estoque recente.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;