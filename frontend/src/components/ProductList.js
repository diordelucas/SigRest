import React, { useState, useEffect } from "react";
import { Pencil, Trash2, RefreshCw, Search } from "lucide-react";
import axios from "axios";
import CategoryTag from "./CategoryTag";
import { formatBRL } from '../utils/currency';

const baseUnitOf = (purchaseUnit) => {
  if (!purchaseUnit) return "un.";
  if (["G", "KG"].includes(purchaseUnit)) return "g";
  if (["ML", "L"].includes(purchaseUnit)) return "ml";
  return "un";
};

const ProductList = ({ refreshTrigger, onEditPerson, isReadOnly }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("http://localhost:8080/product");
      setProducts(response.data);
    } catch (error) {
      setError("Erro ao carregar a lista de produtos. Verifique o servidor.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await axios.delete(`http://localhost:8080/product/${id}`);
        setProducts(products.filter((product) => product.id !== id));
      } catch (error) {
        setError("Erro ao excluir produto. Verifique o servidor.");
        console.error(error);
      }
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="bg-stone-50 rounded-xl shadow-soft border border-stone-200 p-6 mb-6">
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const filtered = products.filter(product => {
    const q = search.toLowerCase();
    return [product.name, product.code, product.categoryName].some(v => (v ?? '').toLowerCase().includes(q));
  });

  return (
    <div className="bg-stone-50 rounded-xl shadow-soft border border-stone-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Lista de Produtos</h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input type="text" placeholder="Pesquisar por nome, código..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 pr-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 w-64" />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-center text-slate-400 py-8 text-sm">
          {search ? `Nenhum resultado para "${search}".` : 'Nenhum produto cadastrado.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-100 border-b border-stone-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Categoria</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Código</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Preço Compra</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Preço Venda</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Estoque</th>
                {!isReadOnly && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Ações</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-700">{product.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{product.name}</td>
                  <td className="px-4 py-3 text-sm"><CategoryTag name={product.categoryName} /></td>
                  <td className="px-4 py-3 text-sm text-slate-700">{product.code}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">R$ {formatBRL(product.price ?? 0)}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">R$ {formatBRL(product.sellPrice ?? 0)}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      (product.storage ?? 0) <= (product.minStorage ?? 0)
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.storage ?? 0} {baseUnitOf(product.purchaseUnit)}
                    </span>
                  </td>
                  {!isReadOnly && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          className="px-3 py-1.5 text-xs border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-stone-50 transition-colors flex items-center gap-1"
                          onClick={() => onEditPerson(product)}
                        >
                          <Pencil size={12} /> Editar
                        </button>
                        <button
                          className="px-3 py-1.5 text-xs bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 size={12} /> Excluir
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4">
        <button
          className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-stone-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={fetchProducts}
          disabled={loading}
        >
          <RefreshCw size={14} /> Atualizar Lista
        </button>
      </div>
    </div>
  );
};

export default ProductList;