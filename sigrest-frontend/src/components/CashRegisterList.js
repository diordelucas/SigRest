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
                    Histórico de Caixas
                </Typography>
            </Box>

            {cashRegisters.length === 0 ? (
                <Alert severity="info">Nenhum caixa encontrado.</Alert>
            ) : (
                <TableContainer component={Paper} elevation={3}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Abertura</TableCell>
                                <TableCell>Fechamento</TableCell>
                                <TableCell align="right">Saldo Inicial</TableCell>
                                <TableCell align="right">Saldo Final</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Aberto por</TableCell>
                                <TableCell>Fechado por</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cashRegisters.map((cr) => (
                                <TableRow key={cr.id}>
                                    <TableCell>{cr.id}</TableCell>
                                    <TableCell>{new Date(cr.openingTime).toLocaleString()}</TableCell>
                                    <TableCell>{cr.closingTime ? new Date(cr.closingTime).toLocaleString() : 'N/A'}</TableCell>
                                    <TableCell align="right">R$ {cr.openingBalance.toFixed(2)}</TableCell>
                                    <TableCell align="right">R$ {cr.closingBalance ? cr.closingBalance.toFixed(2) : 'N/A'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={cr.isOpen ? 'ABERTO' : 'FECHADO'}
                                            color={cr.isOpen ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{cr.openedBy?.name || 'N/A'}</TableCell>
                                    <TableCell>{cr.closedBy?.name || 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
};

export default CashRegisterList;
