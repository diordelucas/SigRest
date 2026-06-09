import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Container,
    Typography,
    Box,
    Paper,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AccountPayableForm = () => {
    const navigate = useNavigate();
    const [accountPayable, setAccountPayable] = useState({
        description: '',
        amount: '',
        dueDate: '',
        supplierId: ''
    });
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await api.get('/supplier');
                setSuppliers(response.data);
            } catch (err) {
                setError('Erro ao carregar fornecedores: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSuppliers();
    }, []);

    const handleChange = (e) => {
        setAccountPayable({ ...accountPayable, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const dataToSubmit = {
                ...accountPayable,
                amount: parseFloat(accountPayable.amount),
                dueDate: accountPayable.dueDate // Already in YYYY-MM-DD format
            };
            await api.post('/accounts-payable', dataToSubmit);
            setSuccessMessage('Conta a pagar registrada com sucesso!');
            setAccountPayable({
                description: '',
                amount: '',
                dueDate: '',
                supplierId: ''
            });
        } catch (err) {
            setError('Erro ao registrar conta a pagar: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (loading && suppliers.length === 0) {
        return (
            <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Registrar Conta a Pagar
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Descrição"
                                name="description"
                                value={accountPayable.description}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Valor"
                                type="number"
                                name="amount"
                                value={accountPayable.amount}
                                onChange={handleChange}
                                inputProps={{ step: "0.01", min: 0 }}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Data de Vencimento"
                                type="date"
                                name="dueDate"
                                value={accountPayable.dueDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Fornecedor</InputLabel>
                                <Select
                                    name="supplierId"
                                    value={accountPayable.supplierId}
                                    onChange={handleChange}
                                    label="Fornecedor"
                                >
                                    {suppliers.map((supplier) => (
                                        <MenuItem key={supplier.id} value={supplier.id}>
                                            {supplier.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={loading}
                        >
                            Registrar
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => navigate('/accounts-payable')}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default AccountPayableForm;
