import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const inputCls = "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors";
const selectCls = "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors appearance-none";

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-6">Registrar Conta a Pagar</h2>

                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-1 mb-4">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Descrição</label>
                        <input
                            className={inputCls}
                            name="description"
                            value={accountPayable.description}
                            onChange={handleChange}
                            required
                            placeholder="Descrição da conta"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex flex-col gap-1">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Valor</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</span>
                                <input
                                    type="number"
                                    name="amount"
                                    step="0.01"
                                    min="0"
                                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
                                    value={accountPayable.amount}
                                    onChange={handleChange}
                                    required
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Data de Vencimento</label>
                            <input
                                type="date"
                                name="dueDate"
                                className={inputCls}
                                value={accountPayable.dueDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 mb-6">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Fornecedor</label>
                        <select
                            name="supplierId"
                            className={selectCls}
                            value={accountPayable.supplierId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Selecione o fornecedor...</option>
                            {suppliers.map((supplier) => (
                                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Registrando...
                                </>
                            ) : 'Registrar'}
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                            onClick={() => navigate('/accounts-payable')}
                            disabled={submitting}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccountPayableForm;