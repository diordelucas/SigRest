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
    Alert
} from '@mui/material';
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
                    Lista de Compras
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/purchases/new')}
                >
                    Nova Compra
                </Button>
            </Box>

            {purchases.length === 0 ? (
                <Alert severity="info">Nenhuma compra encontrada.</Alert>
            ) : (
                <TableContainer component={Paper} elevation={3}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Data</TableCell>
                                <TableCell>Fornecedor</TableCell>
                                <TableCell align="right">Total</TableCell>
                                <TableCell>Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {purchases.map((purchase) => (
                                <TableRow key={purchase.id}>
                                    <TableCell>{purchase.id}</TableCell>
                                    <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{purchase.supplier ? purchase.supplier.name : 'N/A'}</TableCell>
                                    <TableCell align="right">R$ {purchase.total.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => navigate(`/purchases/${purchase.id}`)}
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

export default PurchaseList;
