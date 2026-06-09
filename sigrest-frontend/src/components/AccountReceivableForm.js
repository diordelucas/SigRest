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
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        const fetchPeople = async () => {
            try {
                const response = await api.get('/person');
                setPeople(response.data);
            } catch (err) {
                setError('Erro ao carregar clientes: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPeople();
    }, []);

    const handleChange = (e) => {
        setAccountReceivable({ ...accountReceivable, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const dataToSubmit = {
                ...accountReceivable,
                amount: parseFloat(accountReceivable.amount),
                dueDate: accountReceivable.dueDate // Already in YYYY-MM-DD format
            };
            await api.post('/accounts-receivable', dataToSubmit);
            setSuccessMessage('Conta a receber registrada com sucesso!');
            setAccountReceivable({
                description: '',
                amount: '',
                dueDate: '',
                personId: ''
            });
        } catch (err) {
            setError('Erro ao registrar conta a receber: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (loading && people.length === 0) {
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
                    Registrar Conta a Receber
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
                            disabled={loading}
                        >
                            Registrar
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => navigate('/accounts-receivable')}
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

export default AccountReceivableForm;
