import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    Grid,
    Alert,
    CircularProgress,
    // Added missing MUI components
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody, // TableBody was also missing
    Chip
} from '@mui/material';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import moment from 'moment';

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
                    setReportData(response.data.map(item => ({
                        ...item,
                        date: moment(item.date).format('DD/MM/YYYY')
                    })));
                    break;
                case 'top-selling-products':
                    response = await api.get('/reports/top-selling-products', {
                        params: { limit: 10 } // Default limit for now
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
                    setReportData(response.data.map(item => ({
                        ...item,
                        month: moment(item.month).format('MMM YYYY')
                    })));
                    break;
                case 'stock-movement':
                    response = await api.get('/reports/stock-movement', {
                        params: { startDate, endDate }
                    });
                    setReportData(response.data.map(item => ({
                        ...item,
                        date: moment(item.date).format('DD/MM/YYYY HH:mm')
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
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="totalRevenue" stroke="#8884d8" name="Receita Total (R$)" />
                            <Line type="monotone" dataKey="totalSales" stroke="#82ca9d" name="Total de Vendas" />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'top-selling-products':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={reportData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="productName" />
                            <YAxis />
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
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="totalRevenue" stroke="#8884d8" name="Faturamento (R$)" />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'stock-movement':
                return (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Data/Hora</TableCell>
                                    <TableCell>Produto</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell align="right">Quantidade</TableCell>
                                    <TableCell>Descrição</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reportData.map((movement, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{movement.date}</TableCell>
                                        <TableCell>{movement.productName}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={movement.type === 'ENTRY' ? 'ENTRADA' : 'SAÍDA'}
                                                color={movement.type === 'ENTRY' ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">{movement.quantity}</TableCell>
                                        <TableCell>{movement.description}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                );
            default:
                return null;
        }
    };

    return (
        <Container maxWidth="lg">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Relatórios Gerenciais
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Grid container spacing={3} alignItems="center" sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>Tipo de Relatório</InputLabel>
                            <Select
                                value={reportType}
                                label="Tipo de Relatório"
                                onChange={(e) => setReportType(e.target.value)}
                            >
                                <MenuItem value=""><em>Nenhum</em></MenuItem>
                                <MenuItem value="sales-by-period">Vendas por Período</MenuItem>
                                <MenuItem value="top-selling-products">Produtos Mais Vendidos</MenuItem>
                                <MenuItem value="monthly-revenue">Faturamento Mensal</MenuItem>
                                <MenuItem value="stock-movement">Movimentação de Estoque</MenuItem>
                                {/* <MenuItem value="financial-flow">Fluxo Financeiro</MenuItem> */}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            label="Data Inicial"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            label="Data Final"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleGenerateReport}
                            disabled={loading || !reportType}
                            fullWidth
                        >
                            {loading ? <CircularProgress size={24} /> : 'Gerar'}
                        </Button>
                    </Grid>
                </Grid>

                {reportData && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h5" gutterBottom>Resultado do Relatório</Typography>
                        {renderReportContent()}
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default ReportPage;
