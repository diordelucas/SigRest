import React, { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import axios from "axios";

const CategoryList = ({ refreshTrigger, onEditCategory, isReadOnly }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8080/category");
      setCategories(response.data);
    } catch (error) {
      setError("Erro ao carregar categorias.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja excluir esta categoria?")) {
      try {
        await axios.delete(`http://localhost:8080/category/${id}`);
        setCategories(categories.filter((c) => c.id !== id));
      } catch (error) {
        setError("Erro ao excluir categoria.");
      }
    }
  };

  useEffect(() => {
    fetchCategories();
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
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Lista de Categorias</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {categories.length === 0 ? (
        <p className="text-center text-slate-400 py-8 text-sm">Nenhuma categoria cadastrada.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
                {!isReadOnly && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-700">{c.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{c.description}</td>
                  {!isReadOnly && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1.5 text-xs border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
                          onClick={() => onEditCategory(c)}
                        >
                          <Pencil size={12} /> Editar
                        </button>
                        <button
                          className="px-3 py-1.5 text-xs bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                          onClick={() => handleDelete(c.id)}
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

export default CategoryList;