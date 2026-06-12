import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Container,
    Typography,
    Box,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    IconButton,
    Paper,
    Grid,
    InputAdornment,
    Divider,
    Chip,
    CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const PAYMENT_METHODS = [
    { value: 'DINHEIRO', label: 'Dinheiro' },
    { value: 'CARTAO_DEBITO', label: 'Cartão de Débito' },
    { value: 'CARTAO_CREDITO', label: 'Cartão de Crédito' },
    { value: 'PIX', label: 'PIX' },
];

const SaleForm = () => {
    const navigate = useNavigate();
    const [sale, setSale] = useState({
        personId: '',
        paymentMethod: '',
        discount: 0,
        items: []
    });
    const [people, setPeople] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [peopleRes, productsRes] = await Promise.all([
                    api.get('/person'),
                    api.get('/product')
                ]);
                setPeople(peopleRes.data);
                setProducts(productsRes.data);
            } catch (err) {
                toast.error('Erro ao carregar dados: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSaleChange = (e) => {
        setSale({ ...sale, [e.target.name]: e.target.value });
    };

    const handleItemChange = (index, e) => {
        const newItems = [...sale.items];
        newItems[index] = { ...newItems[index], [e.target.name]: e.target.value };
        if (e.target.name === 'productId') {
            // eslint-disable-next-line eqeqeq
            const product = products.find(p => p.id == e.target.value);
            if (product) newItems[index].unitPrice = product.sellPrice ?? 0;
        }
        setSale({ ...sale, items: newItems });
    };

    const handleAddItem = () => {
        setSale({
            ...sale,
            items: [...sale.items, { productId: '', quantity: 1, unitPrice: 0 }]
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = [...sale.items];
        newItems.splice(index, 1);
        setSale({ ...sale, items: newItems });
    };

    const calculateSubtotal = () =>
        sale.items.reduce((sum, item) =>
            sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0), 0);

    const calculateTotal = () => {
        const total = calculateSubtotal() - (parseFloat(sale.discount) || 0);
        return Math.max(0, total).toFixed(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (sale.items.length === 0) {
            toast.error('Adicione pelo menos um item à venda.');
            return;
        }
        setSubmitting(true);
        try {
            const saleToSubmit = {
                ...sale,
                total: parseFloat(calculateTotal()),
                discount: parseFloat(sale.discount) || 0,
                items: sale.items.map(item => ({
                    ...item,
                    quantity: parseInt(item.quantity),
                    unitPrice: parseFloat(item.unitPrice)
                }))
            };
            await api.post('/sales', saleToSubmit);
            toast.success('Venda registrada com sucesso!');
            navigate('/sales');
        } catch (err) {
            toast.error('Erro ao registrar venda: ' + (err.response?.data?.message || err.message));
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
                    Registrar Nova Venda
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Cliente</InputLabel>
                                <Select
                                    name="personId"
                                    value={sale.personId}
                                    onChange={handleSaleChange}
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
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Forma de Pagamento</InputLabel>
                                <Select
                                    name="paymentMethod"
                                    value={sale.paymentMethod}
                                    onChange={handleSaleChange}
                                    label="Forma de Pagamento"
                                >
                                    {PAYMENT_METHODS.map(({ value, label }) => (
                                        <MenuItem key={value} value={value}>
                                            {label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Desconto"
                                type="number"
                                name="discount"
                                value={sale.discount}
                                onChange={handleSaleChange}
                                inputProps={{ step: "0.01", min: 0 }}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                                }}
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }}>
                        <Typography variant="caption" color="text.secondary">Itens da Venda</Typography>
                    </Divider>

                    {sale.items.map((item, index) => (
                        <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={5}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Produto</InputLabel>
                                        <Select
                                            name="productId"
                                            value={item.productId}
                                            onChange={(e) => handleItemChange(index, e)}
                                            label="Produto"
                                        >
                                            {products.map((product) => (
                                                <MenuItem key={product.id} value={product.id}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                        <span>{product.name}</span>
                                                        <Chip
                                                            label={`${product.storage} un.`}
                                                            size="small"
                                                            color={product.storage <= product.minStorage ? 'warning' : 'default'}
                                                            sx={{ ml: 1 }}
                                                        />
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        label="Quantidade"
                                        type="number"
                                        name="quantity"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, e)}
                                        inputProps={{ min: 1 }}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        label="Preço Unit."
                                        type="number"
                                        name="unitPrice"
                                        value={item.unitPrice}
                                        onChange={(e) => handleItemChange(index, e)}
                                        inputProps={{ step: "0.01", min: 0 }}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                                        }}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={1}>
                                    <IconButton color="error" onClick={() => handleRemoveItem(index)}>
                                        <RemoveIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}

                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAddItem}
                        sx={{ mt: 1 }}
                    >
                        Adicionar Item
                    </Button>

                    <Paper variant="outlined" sx={{ mt: 3, p: 2, bgcolor: 'grey.50' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                            <Typography variant="body1" color="text.secondary">
                                Subtotal: <strong>R$ {calculateSubtotal().toFixed(2)}</strong>
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Desconto: <strong>R$ {parseFloat(sale.discount || 0).toFixed(2)}</strong>
                            </Typography>
                            <Divider sx={{ width: '200px', my: 0.5 }} />
                            <Typography variant="h6" color="primary" fontWeight={700}>
                                Total: R$ {calculateTotal()}
                            </Typography>
                        </Box>
                    </Paper>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={submitting}
                            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
                        >
                            {submitting ? 'Registrando...' : 'Registrar Venda'}
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => navigate('/sales')}
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

export default SaleForm;