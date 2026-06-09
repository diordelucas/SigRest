import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
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
            <Box sx={{ mt: 4, mb: 2 }}>
                <Typography variant="h4" component="h1">
                    Histórico de Movimentações de Estoque
                </Typography>
            </Box>

            {movements.length === 0 ? (
                <Alert severity="info">Nenhuma movimentação de estoque encontrada.</Alert>
            ) : (
                <TableContainer component={Paper} elevation={3}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Data/Hora</TableCell>
                                <TableCell>Produto</TableCell>
                                <TableCell>Tipo</TableCell>
                                <TableCell align="right">Quantidade</TableCell>
                                <TableCell>Descrição</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {movements.map((movement) => (
                                <TableRow key={movement.id}>
                                    <TableCell>{movement.id}</TableCell>
                                    <TableCell>{new Date(movement.date).toLocaleString()}</TableCell>
                                    <TableCell>{movement.product ? movement.product.name : 'N/A'}</TableCell>
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
            )}
        </Container>
    );
};

export default StockMovementList;
