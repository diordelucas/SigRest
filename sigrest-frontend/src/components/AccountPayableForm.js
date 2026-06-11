import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Container,
    Typography,
    Box,
    Paper,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    InputAdornment,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
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
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.get('/supplier')
            .then((r) => setSuppliers(r.data))
            .catch((err) => toast.error('Erro ao carregar fornecedores: ' + err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e) => {
        setAccountPayable({ ...accountPayable, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/accounts-payable', {
                ...accountPayable,
                amount: parseFloat(accountPayable.amount),
            });
            toast.success('Conta a pagar registrada com sucesso!');
            setAccountPayable({ description: '', amount: '', dueDate: '', supplierId: '' });
        } catch (err) {
            toast.error('Erro ao registrar: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
        </Box>
    );

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h5" component="h1" gutterBottom fontWeight={600}>
                    Registrar Conta a Pagar
                </Typography>

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
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                                }}
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
                            disabled={submitting}
                            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
                        >
                            {submitting ? 'Registrando...' : 'Registrar'}
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => navigate('/accounts-payable')}
                            disabled={submitting}
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