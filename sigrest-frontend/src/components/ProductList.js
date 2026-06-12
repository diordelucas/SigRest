import React, { useState, useEffect } from "react";
import { Pencil, Trash2, RefreshCw } from "lucide-react";
import axios from "axios";
import CategoryTag from "./CategoryTag";

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
      <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Lista de Produtos</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <p className="text-center text-slate-400 py-8 text-sm">Nenhum produto cadastrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Código</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Preço Compra</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Preço Venda</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estoque</th>
                {!isReadOnly && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-700">{product.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{product.name}</td>
                  <td className="px-4 py-3 text-sm"><CategoryTag name={product.categoryName} /></td>
                  <td className="px-4 py-3 text-sm text-slate-700">{product.code}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{product.price}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{product.sellPrice}</td>
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
                          className="px-3 py-1.5 text-xs border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
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
          className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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