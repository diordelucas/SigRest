import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import api from "../services/api";

const TechnicalSheetList = ({ refreshTrigger, onEditSheet, onNewSheet, isReadOnly }) => {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState('');

  const fetchSheets = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/technical-sheet");
      setSheets(response.data);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar fichas técnicas.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta ficha técnica?")) {
      try {
        await api.delete(`/technical-sheet/${id}`);
        setSheets(sheets.filter((s) => s.id !== id));
      } catch (err) {
        console.error(err);
        setError("Erro ao excluir ficha técnica.");
      }
    }
  };

  useEffect(() => {
    fetchSheets();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = sheets.filter(sheet => {
    const q = search.toLowerCase();
    return [sheet.name, sheet.finalProduct?.name].some(v => (v ?? '').toLowerCase().includes(q));
  });

  return (
    <div className="bg-stone-50 rounded-xl shadow-soft border border-stone-200 p-6 mb-6">
      <div className="flex justify-between items-center mb-4 gap-4">
        <h2 className="text-lg font-semibold text-slate-800">Fichas Técnicas (Receitas)</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type="text" placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 pr-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 w-56" />
          </div>
          {!isReadOnly && (
            <button
              className="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
              onClick={onNewSheet}
            >
              <Plus size={14} /> Nova Ficha Técnica
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-center text-slate-400 py-8 text-sm">
          {search ? `Nenhum resultado para "${search}".` : 'Nenhuma ficha técnica cadastrada.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-100 border-b border-stone-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Nome da Receita</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Produto Final</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Qtd. de Insumos</th>
                {!isReadOnly && (
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Ações</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((sheet) => (
                <tr key={sheet.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-700">{sheet.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{sheet.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{sheet.finalProduct?.name || "Produto não identificado"}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      {sheet.items ? sheet.items.length : 0}
                    </span>
                  </td>
                  {!isReadOnly && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          className="p-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-stone-50 transition-colors"
                          onClick={() => onEditSheet(sheet)}
                          title="Editar Ficha"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          onClick={() => handleDelete(sheet.id)}
                          title="Excluir Ficha"
                        >
                          <Trash2 size={14} />
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

export default TechnicalSheetList;