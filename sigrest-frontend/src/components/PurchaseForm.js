import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const inputCls = "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors";
const selectCls = "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors appearance-none";

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
            navigate('/purchases');
        } catch (err) {
            setError('Erro ao registrar compra: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        type="button"
                        className="p-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                        onClick={() => navigate('/purchases')}
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <h2 className="text-lg font-semibold text-slate-800">Registrar Nova Compra</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex flex-col gap-1">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Data da Compra</label>
                            <input
                                type="date"
                                name="date"
                                className={inputCls}
                                value={purchase.date}
                                onChange={handlePurchaseChange}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Fornecedor</label>
                            <select
                                name="supplierId"
                                className={selectCls}
                                value={purchase.supplierId}
                                onChange={handlePurchaseChange}
                                required
                            >
                                <option value="">Selecione...</option>
                                {suppliers.map((supplier) => (
                                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 my-4 flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-medium">ITENS DA COMPRA</span>
                    </div>

                    {purchase.items.map((item, index) => (
                        <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-3">
                            <div className="grid grid-cols-5 gap-3 items-end">
                                <div className="col-span-2 flex flex-col gap-1">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Produto</label>
                                    <select
                                        name="productId"
                                        className={selectCls}
                                        value={item.productId}
                                        onChange={(e) => handleItemChange(index, e)}
                                        required
                                    >
                                        <option value="">Selecione...</option>
                                        {products.map((product) => (
                                            <option key={product.id} value={product.id}>
                                                {product.name}
                                                {product.categoryName ? ` · ${product.categoryName}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Quantidade</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        min="1"
                                        className={inputCls}
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, e)}
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Preço Unit.</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</span>
                                        <input
                                            type="number"
                                            name="unitPrice"
                                            step="0.01"
                                            min="0"
                                            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
                                            value={item.unitPrice}
                                            onChange={(e) => handleItemChange(index, e)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex items-end pb-0.5">
                                    <button
                                        type="button"
                                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                        onClick={() => handleRemoveItem(index)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 mt-2"
                        onClick={handleAddItem}
                    >
                        <Plus size={14} /> Adicionar Item
                    </button>

                    <div className="mt-6 text-right">
                        <p className="text-base font-semibold text-slate-700">
                            Total da Compra: <span className="text-primary-500">R$ {calculateTotal()}</span>
                        </p>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors"
                        >
                            Registrar Compra
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                            onClick={() => navigate('/purchases')}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PurchaseForm;