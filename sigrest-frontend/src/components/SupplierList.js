import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Search } from "lucide-react";
import axios from "axios";

const SupplierList = ({ refreshTrigger, onEditSupplier, isReadOnly }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState('');

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8080/supplier");
      setSuppliers(response.data);
    } catch (error) {
      setError("Erro ao carregar fornecedores.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja excluir este fornecedor?")) {
      try {
        await axios.delete(`http://localhost:8080/supplier/${id}`);
        setSuppliers(suppliers.filter((s) => s.id !== id));
      } catch (error) {
        setError("Erro ao excluir fornecedor.");
      }
    }
  };

  useEffect(() => {
    fetchSuppliers();
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

  const filtered = suppliers.filter(s => {
    const q = search.toLowerCase();
    return [s.name, s.cnpj, s.email].some(v => (v ?? '').toLowerCase().includes(q));
  });

  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Lista de Fornecedores</h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input type="text" placeholder="Pesquisar por nome, CNPJ..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 w-64" />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-center text-slate-400 py-8 text-sm">
          {search ? `Nenhum resultado para "${search}".` : 'Nenhum fornecedor cadastrado.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">CNPJ</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                {!isReadOnly && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-700">{s.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{s.cnpj}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{s.email}</td>
                  {!isReadOnly && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1.5 text-xs border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
                          onClick={() => onEditSupplier(s)}
                        >
                          <Pencil size={12} /> Editar
                        </button>
                        <button
                          className="px-3 py-1.5 text-xs bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                          onClick={() => handleDelete(s.id)}
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
    </div>
  );
};

export default SupplierList;