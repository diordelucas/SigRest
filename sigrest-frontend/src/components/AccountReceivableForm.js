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

const AccountReceivableForm = () => {
    const navigate = useNavigate();
    const [accountReceivable, setAccountReceivable] = useState({
        description: '',
        amount: '',
        dueDate: '',
        personId: ''
    });
    const [people, setPeople] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.get('/person')
            .then((r) => setPeople(r.data))
            .catch((err) => toast.error('Erro ao carregar clientes: ' + err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e) => {
        setAccountReceivable({ ...accountReceivable, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/accounts-receivable', {
                ...accountReceivable,
                amount: parseFloat(accountReceivable.amount),
            });
            toast.success('Conta a receber registrada com sucesso!');
            setAccountReceivable({ description: '', amount: '', dueDate: '', personId: '' });
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
                    Registrar Conta a Receber
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Descrição"
                                name="description"
                                value={accountReceivable.description}
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
                                value={accountReceivable.amount}
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
                                value={accountReceivable.dueDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Cliente</InputLabel>
                                <Select
                                    name="personId"
                                    value={accountReceivable.personId}
                                    onChange={handleChange}
                                    label="Cliente"
                                >
                                    {people.map((person) => (
                                        <MenuItem key={person.id} value={person.id}>
                                            {person.name}
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
                            onClick={() => navigate('/accounts-receivable')}
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

export default AccountReceivableForm;