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
    Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SaleForm = () => { // Changed VendaForm to SaleForm
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
    const [error, setError] = useState(null);

    const paymentMethods = ['DINHEIRO', 'CARTAO_DEBITO', 'CARTAO_CREDITO', 'PIX'];

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
                setError('Erro ao carregar dados: ' + err.message);
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

    const calculateSubtotal = () => {
        return sale.items.reduce((sum, item) => {
            const quantity = parseFloat(item.quantity) || 0;
            const unitPrice = parseFloat(item.unitPrice) || 0;
            return sum + (quantity * unitPrice);
        }, 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const discount = parseFloat(sale.discount) || 0;
        return (subtotal - discount).toFixed(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const saleToSubmit = {
                ...sale,
                total: parseFloat(calculateTotal()),
                discount: parseFloat(sale.discount),
                items: sale.items.map(item => ({
                    ...item,
                    quantity: parseInt(item.quantity),
                    unitPrice: parseFloat(item.unitPrice)
                }))
            };
            await api.post('/sales', saleToSubmit);
            navigate('/sales'); // Navigate to sales list after successful creation
        } catch (err) {
            setError('Erro ao registrar venda: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <Typography>Carregando...</Typography>;

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Registrar Nova Venda
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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
                                    {paymentMethods.map((method) => (
                                        <MenuItem key={method} value={method}>
                                            {method.replace('_', ' ')}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Desconto (R$)"
                                type="number"
                                name="discount"
                                value={sale.discount}
                                onChange={handleSaleChange}
                                inputProps={{ step: "0.01", min: 0 }}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 4, mb: 2 }}>
                        <Typography variant="h6" gutterBottom>Itens da Venda</Typography>
                        {sale.items.map((item, index) => (
                            <Paper key={index} elevation={1} sx={{ p: 2, mb: 2, border: '1px solid #ddd' }}>
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
                                                        {product.name} (Estoque: {product.storage})
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl> {/* Added closing tag here */}
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
                                            label="Preço Unitário"
                                            type="number"
                                            name="unitPrice"
                                            value={item.unitPrice}
                                            onChange={(e) => handleItemChange(index, e)}
                                            inputProps={{ step: "0.01", min: 0 }}
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
                            sx={{ mt: 2 }}
                        >
                            Adicionar Item
                        </Button>
                    </Box>

                    <Box sx={{ mt: 4, textAlign: 'right' }}>
                        <Typography variant="h6">Subtotal: R$ {calculateSubtotal().toFixed(2)}</Typography>
                        <Typography variant="h6">Desconto: R$ {parseFloat(sale.discount).toFixed(2)}</Typography>
                        <Typography variant="h5" color="primary">Total da Venda: R$ {calculateTotal()}</Typography>
                    </Box>

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                        >
                            Registrar Venda
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => navigate('/sales')}
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
