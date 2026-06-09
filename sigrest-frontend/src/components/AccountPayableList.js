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

const AccountPayableList = () => {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await api.get('/accounts-payable');
                setAccounts(response.data);
            } catch (err) {
                setError('Erro ao carregar contas a pagar: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAccounts();
    }, [refreshTrigger]);

    const handlePayAccount = async (id) => {
        try {
            await api.put(`/accounts-payable/pay/${id}`);
            setRefreshTrigger(prev => prev + 1); // Trigger re-fetch
        } catch (err) {
            setError('Erro ao pagar conta: ' + (err.response?.data?.message || err.message));
        }
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'PENDING': return <Chip label="PENDENTE" color="warning" size="small" />;
            case 'PAID': return <Chip label="PAGO" color="success" size="small" />;
            case 'OVERDUE': return <Chip label="ATRASADO" color="error" size="small" />;
            default: return <Chip label={status} size="small" />;
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
                    Contas a Pagar
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/accounts-payable/new')}
                >
                    Nova Conta a Pagar
                </Button>
            </Box>

            {accounts.length === 0 ? (
                <Alert severity="info">Nenhuma conta a pagar encontrada.</Alert>
            ) : (
                <TableContainer component={Paper} elevation={3}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Descrição</TableCell>
                                <TableCell align="right">Valor</TableCell>
                                <TableCell>Vencimento</TableCell>
                                <TableCell>Fornecedor</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {accounts.map((account) => (
                                <TableRow key={account.id}>
                                    <TableCell>{account.id}</TableCell>
                                    <TableCell>{account.description}</TableCell>
                                    <TableCell align="right">R$ {account.amount.toFixed(2)}</TableCell>
                                    <TableCell>{new Date(account.dueDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{account.supplier?.name || 'N/A'}</TableCell>
                                    <TableCell>{getStatusChip(account.status)}</TableCell>
                                    <TableCell>
                                        {account.status === 'PENDING' && (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                color="success"
                                                onClick={() => handlePayAccount(account.id)}
                                            >
                                                Pagar
                                            </Button>
                                        )}
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

export default AccountPayableList;
