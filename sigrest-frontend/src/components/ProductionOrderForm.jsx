import React, { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import api from "../services/api";

const inputCls = "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors";
const selectCls = "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors appearance-none";

const ProductionOrderForm = ({ onSaveSuccess, onCancel }) => {
  const [finalProductId, setFinalProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [sheets, setSheets] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSheets();
  }, []);

  const fetchSheets = async () => {
    try {
      const response = await api.get("/technical-sheet");
      setSheets(response.data);
    } catch (err) {
      console.error("Erro ao carregar fichas técnicas:", err);
      setError("Erro ao carregar fichas técnicas. Certifique-se de que existem receitas cadastradas.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setError("A quantidade a produzir deve ser um número inteiro maior que zero.");
      setLoading(false);
      return;
    }

    const data = { finalProductId, quantity: parsedQty, notes };

    try {
      await api.post("/production-order", data);
      onSaveSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erro ao abrir ordem de produção.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          className="p-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
          onClick={onCancel}
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-lg font-semibold text-slate-800">Abrir Ordem de Produção</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Produto Final (com Ficha Técnica)</label>
            <select
              className={selectCls}
              value={finalProductId}
              onChange={(e) => setFinalProductId(e.target.value)}
              required
            >
              <option value="">Selecione a receita...</option>
              {sheets.map((s) => (
                <option key={s.finalProduct?.id} value={s.finalProduct?.id}>
                  {s.finalProduct?.name} (Receita: {s.name})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Quantidade a Produzir</label>
            <input
              type="number"
              min="1"
              step="1"
              className={inputCls}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              placeholder="Ex: 10"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 mb-6">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Observações (Lote, Perdas, Rendimento, etc)</label>
          <textarea
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Insira detalhes adicionais sobre o lote de produção..."
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save size={14} />
            {loading ? "Salvando..." : "Abrir Ordem de Produção"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductionOrderForm;