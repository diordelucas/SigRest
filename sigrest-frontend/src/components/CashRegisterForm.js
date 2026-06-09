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
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CashRegisterForm = () => {
    const navigate = useNavigate();
    const [currentCashRegister, setCurrentCashRegister] = useState(null);
    const [openingBalance, setOpeningBalance] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogAction, setDialogAction] = useState(null); // 'open' or 'close'

    // Mock user ID for now, replace with actual logged-in user ID
    const currentUserId = 1; // Assuming user with ID 1 is logged in

    useEffect(() => {
        const fetchCurrentCashRegister = async () => {
            try {
                const response = await api.get('/cash-registers/current-open');
                setCurrentCashRegister(response.data);
            } catch (err) {
                if (err.response && err.response.status === 204) {
                    setCurrentCashRegister(null); // No open cash register
                } else {
                    setError('Erro ao carregar status do caixa: ' + err.message);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchCurrentCashRegister();
    }, []);

    const handleOpenCashRegister = async () => {
        setDialogAction('open');
        setOpenDialog(true);
    };

    const handleCloseCashRegister = async () => {
        setDialogAction('close');
        setOpenDialog(true);
    };

    const confirmAction = async () => {
        setOpenDialog(false);
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if (dialogAction === 'open') {
                const response = await api.post('/cash-registers/open', {
                    openingBalance: parseFloat(openingBalance),
                    openedByUserId: currentUserId
                });
                setCurrentCashRegister(response.data);
                setSuccessMessage('Caixa aberto com sucesso!');
                setOpeningBalance('');
            } else if (dialogAction === 'close') {
                const response = await api.post(`/cash-registers/close/${currentCashRegister.id}?closedByUserId=${currentUserId}`);
                setCurrentCashRegister(response.data);
                setSuccessMessage('Caixa fechado com sucesso!');
            }
        } catch (err) {
            setError('Erro: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setDialogAction(null);
    };

    if (loading) {
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
                    Controle de Caixa
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

                {currentCashRegister && currentCashRegister.isOpen ? (
                    <Box>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Caixa atualmente aberto.
                        </Alert>
                        <Typography variant="h6">ID do Caixa: {currentCashRegister.id}</Typography>
                        <Typography variant="body1">Aberto em: {new Date(currentCashRegister.openingTime).toLocaleString()}</Typography>
                        <Typography variant="body1">Saldo Inicial: R$ {currentCashRegister.openingBalance.toFixed(2)}</Typography>
                        <Typography variant="body1">Aberto por: {currentCashRegister.openedBy?.name || 'N/A'}</Typography>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleCloseCashRegister}
                            sx={{ mt: 3 }}
                        >
                            Fechar Caixa
                        </Button>
                    </Box>
                ) : (
                    <Box>
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            Nenhum caixa está aberto no momento.
                        </Alert>
                        <TextField
                            fullWidth
                            label="Saldo Inicial"
                            type="number"
                            name="openingBalance"
                            value={openingBalance}
                            onChange={(e) => setOpeningBalance(e.target.value)}
                            inputProps={{ step: "0.01", min: 0 }}
                            required
                            sx={{ mb: 3 }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleOpenCashRegister}
                            disabled={!openingBalance}
                        >
                            Abrir Caixa
                        </Button>
                    </Box>
                )}

                <Dialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {dialogAction === 'open' ? "Confirmar Abertura de Caixa" : "Confirmar Fechamento de Caixa"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            {dialogAction === 'open'
                                ? `Deseja realmente abrir o caixa com saldo inicial de R$ ${parseFloat(openingBalance).toFixed(2)}?`
                                : `Deseja realmente fechar o caixa ${currentCashRegister?.id}?`}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancelar</Button>
                        <Button onClick={confirmAction} autoFocus>
                            Confirmar
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </Container>
    );
};

export default CashRegisterForm;
