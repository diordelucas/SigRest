import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { formatDate, formatMoney } from '../utils/format';
import { Purchase } from '../types';
import Button from './ui/Button';
import Field from './ui/Field';
import { Table, Th } from './ui/Table';

const PurchaseList = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await api.get<Purchase[]>('/purchases');
        setPurchases([...response.data].sort((a, b) => b.id - a.id));
      } catch (err) {
        setError(getErrorMessage(err, 'Erro ao carregar compras.'));
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-4 border-line border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-sm">{error}</div>;
  }

  const filtered = purchases.filter((purchase) => {
    const q = search.toLowerCase();
    return [purchase.supplier?.name, formatDate(purchase.date)].some((v) => (v ?? '').toLowerCase().includes(q));
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-lg font-semibold text-ink">Lista de Compras</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
            <Field
              type="text"
              placeholder="Pesquisar fornecedor, data..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 py-2 text-sm w-full sm:w-64"
            />
          </div>
          <Button onClick={() => navigate('/purchases/new')}>
            <Plus size={14} /> Nova Compra
          </Button>
        </div>
      </div>

      <div className="card p-6">
        {filtered.length === 0 ? (
          <p className="text-center text-ink-muted py-8 text-sm">
            {search ? `Nenhum resultado para "${search}".` : 'Nenhuma compra encontrada.'}
          </p>
        ) : (
          <Table>
              <thead className="bg-surface-2 border-b border-line">
                <tr>
                  <Th>ID</Th>
                  <Th>Data</Th>
                  <Th>Fornecedor</Th>
                  <Th className="text-right">Total</Th>
                  <Th>Ações</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-surface-2 transition-colors">
                    <td className="px-4 py-3 text-sm text-ink">{purchase.id}</td>
                    <td className="px-4 py-3 text-sm text-ink">{formatDate(purchase.date)}</td>
                    <td className="px-4 py-3 text-sm text-ink">{purchase.supplier ? purchase.supplier.name : 'Não informado'}</td>
                    <td className="px-4 py-3 text-sm text-ink text-right whitespace-nowrap">{formatMoney(purchase.total)}</td>
                    <td className="px-4 py-3">
                      <button
                        className="px-3 py-1.5 text-xs border border-line text-ink font-semibold rounded-lg hover:bg-surface-2 transition-colors whitespace-nowrap"
                        onClick={() => navigate(`/purchases/${purchase.id}`)}
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default PurchaseList;
