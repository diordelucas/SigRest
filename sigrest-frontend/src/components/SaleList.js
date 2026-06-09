import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Button,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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

    const getPaymentMethodLabel = (method) => {
        switch (method) {
            case 'DINHEIRO': return 'Dinheiro';
            case 'CARTAO_DEBITO': return 'Cartão Débito';
            case 'CARTAO_CREDITO': return 'Cartão Crédito';
            case 'PIX': return 'PIX';
            default: return method;
        }
    };

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
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" component="h1">
                    Lista de Vendas
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/sales/new')}
                >
                    Nova Venda
                </Button>
            </Box>

            {sales.length === 0 ? (
                <Alert severity="info">Nenhuma venda encontrada.</Alert>
            ) : (
                <TableContainer component={Paper} elevation={3}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Data</TableCell>
                                <TableCell>Cliente</TableCell>
                                <TableCell>Forma de Pagamento</TableCell>
                                <TableCell align="right">Desconto</TableCell>
                                <TableCell align="right">Total</TableCell>
                                <TableCell>Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sales.map((sale) => (
                                <TableRow key={sale.id}>
                                    <TableCell>{sale.id}</TableCell>
                                    <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{sale.personName || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Chip label={getPaymentMethodLabel(sale.paymentMethod)} size="small" />
                                    </TableCell>
                                    <TableCell align="right">R$ {sale.discount.toFixed(2)}</TableCell>
                                    <TableCell align="right">R$ {sale.total.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => navigate(`/sales/${sale.id}`)}
                                        >
                                            Ver Detalhes
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
};

export default SaleList;
