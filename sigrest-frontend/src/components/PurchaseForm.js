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
    Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const PurchaseForm = () => {
    const navigate = useNavigate();
    const [purchase, setPurchase] = useState({
        date: new Date().toISOString().split('T')[0],
        supplierId: '',
        items: []
    });
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [suppliersRes, productsRes] = await Promise.all([
                    api.get('/supplier'),
                    api.get('/product')
                ]);
                setSuppliers(suppliersRes.data);
                setProducts(productsRes.data);
            } catch (err) {
                setError('Erro ao carregar dados: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handlePurchaseChange = (e) => {
        setPurchase({ ...purchase, [e.target.name]: e.target.value });
    };

    const handleItemChange = (index, e) => {
        const newItems = [...purchase.items];
        newItems[index] = { ...newItems[index], [e.target.name]: e.target.value };
        setPurchase({ ...purchase, items: newItems });
    };

    const handleAddItem = () => {
        setPurchase({
            ...purchase,
            items: [...purchase.items, { productId: '', quantity: 1, unitPrice: 0 }]
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = [...purchase.items];
        newItems.splice(index, 1);
        setPurchase({ ...purchase, items: newItems });
    };

    const calculateTotal = () => {
        return purchase.items.reduce((sum, item) => {
            const quantity = parseFloat(item.quantity) || 0;
            const unitPrice = parseFloat(item.unitPrice) || 0;
            return sum + (quantity * unitPrice);
        }, 0).toFixed(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const purchaseToSubmit = {
                ...purchase,
                total: parseFloat(calculateTotal()),
                items: purchase.items.map(item => ({
                    ...item,
                    quantity: parseInt(item.quantity),
                    unitPrice: parseFloat(item.unitPrice)
                }))
            };
            await api.post('/purchases', purchaseToSubmit);
            navigate('/purchases'); // Navigate to purchase list after successful creation
        } catch (err) {
            setError('Erro ao registrar compra: ' + err.message);
        }
    };

    if (loading) return <Typography>Carregando...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Registrar Nova Compra
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Data da Compra"
                                type="date"
                                name="date"
                                value={purchase.date}
                                onChange={handlePurchaseChange}
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Fornecedor</InputLabel>
                                <Select
                                    name="supplierId"
                                    value={purchase.supplierId}
                                    onChange={handlePurchaseChange}
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

                    <Box sx={{ mt: 4, mb: 2 }}>
                        <Typography variant="h6" gutterBottom>Itens da Compra</Typography>
                        {purchase.items.map((item, index) => (
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
                                                        {product.name}
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
                        <Typography variant="h6">Total da Compra: R$ {calculateTotal()}</Typography>
                    </Box>

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                        >
                            Registrar Compra
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => navigate('/purchases')}
                        >
                            Cancelar
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default PurchaseForm;
