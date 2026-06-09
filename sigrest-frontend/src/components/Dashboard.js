import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    CircularProgress,
    Alert
} from '@mui/material';
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

                setMonthlyRevenue(monthlyRevenueRes.data.map(item => ({
                    ...item,
                    month: moment(item.month).format('MMM YYYY')
                })));
                setTopSellingProducts(topSellingProductsRes.data);
                setSalesByPeriod(salesByPeriodRes.data.map(item => ({
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
            <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Dashboard Gerencial
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Faturamento Mensal */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Faturamento Mensal</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="totalRevenue" stroke="#8884d8" name="Faturamento (R$)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Produtos Mais Vendidos */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Produtos Mais Vendidos (Quantidade)</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topSellingProducts}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="productName" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="totalQuantitySold" fill="#82ca9d" name="Quantidade Vendida" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Vendas por Período */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Vendas por Período (Último Mês)</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={salesByPeriod}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="totalRevenue" stroke="#ffc658" name="Receita (R$)" />
                                <Line type="monotone" dataKey="totalSales" stroke="#8884d8" name="Nº Vendas" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Resumo de Estoque (simplificado) */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Resumo de Movimentação de Estoque (Último Mês)</Typography>
                        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                            {stockMovement.length > 0 ? (
                                stockMovement.map((movement, index) => (
                                    <Box key={index} sx={{ mb: 1, p: 1, borderBottom: '1px solid #eee' }}>
                                        <Typography variant="body2">
                                            <strong>{moment(movement.date).format('DD/MM HH:mm')}</strong> - {movement.productName}: {movement.type === 'ENTRY' ? '+' : '-'}{movement.quantity} ({movement.description})
                                        </Typography>
                                    </Box>
                                ))
                            ) : (
                                <Typography variant="body2">Nenhuma movimentação de estoque recente.</Typography>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard;
