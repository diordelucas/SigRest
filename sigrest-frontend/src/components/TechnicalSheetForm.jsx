import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import api from "../services/api";

const inputCls = "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors";
const selectCls = "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors appearance-none";

const TechnicalSheetForm = ({ sheetToEdit, onSaveSuccess, onCancel }) => {
  const [name, setName] = useState("");
  const [finalProductId, setFinalProductId] = useState("");
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    if (sheetToEdit) {
      setName(sheetToEdit.name || "");
      setFinalProductId(sheetToEdit.finalProduct?.id || "");
      setItems(sheetToEdit.items ? sheetToEdit.items.map((i) => ({
        rawMaterialId: i.rawMaterial?.id || "",
        quantity: i.quantity || ""
      })) : []);
    }
  }, [sheetToEdit]);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/product");
      setProducts(response.data);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
      setError("Erro ao carregar lista de produtos.");
    }
  };

  const addItem = () => {
    setItems([...items, { rawMaterialId: "", quantity: "" }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!finalProductId) {
      setError("Selecione o Produto Final.");
      setLoading(false);
      return;
    }
    if (items.length === 0) {
      setError("Adicione pelo menos um insumo na ficha técnica.");
      setLoading(false);
      return;
    }

    const seenIngredients = new Set();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.rawMaterialId) {
        setError(`Selecione o insumo na linha ${i + 1}.`);
        setLoading(false);
        return;
      }
      if (!item.quantity || parseFloat(item.quantity) <= 0) {
        setError(`A quantidade do insumo na linha ${i + 1} deve ser maior que zero.`);
        setLoading(false);
        return;
      }
      if (item.rawMaterialId === finalProductId) {
        setError(`O insumo na linha ${i + 1} não pode ser igual ao produto final.`);
        setLoading(false);
        return;
      }
      if (seenIngredients.has(item.rawMaterialId)) {
        setError(`O insumo na linha ${i + 1} está duplicado.`);
        setLoading(false);
        return;
      }
      seenIngredients.add(item.rawMaterialId);
    }

    const data = {
      name,
      finalProductId,
      items: items.map((i) => ({
        rawMaterialId: i.rawMaterialId,
        quantity: parseFloat(i.quantity)
      }))
    };

    try {
      if (sheetToEdit?.id) {
        await api.put(`/technical-sheet/${sheetToEdit.id}`, data);
      } else {
        await api.post("/technical-sheet", data);
      }
      onSaveSuccess();
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar ficha técnica. Verifique se o produto final já possui uma ficha cadastrada.");
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
        <h2 className="text-lg font-semibold text-slate-800">
          {sheetToEdit ? "Editar Ficha Técnica" : "Nova Ficha Técnica"}
        </h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nome da Receita / Ficha</label>
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nome da receita"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Produto Final (Marmita / Acabado)</label>
            <select
              className={selectCls}
              value={finalProductId}
              onChange={(e) => setFinalProductId(e.target.value)}
              required
            >
              <option value="">Selecione o produto final...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Insumos / Ingredientes</h3>
          <button
            type="button"
            className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
            onClick={addItem}
          >
            <Plus size={14} /> Adicionar Insumo
          </button>
        </div>

        {items.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center mb-4">
            <p className="text-slate-400 text-sm">
              Nenhum ingrediente adicionado. Clique em "Adicionar Insumo" para começar.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto mb-4">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Insumo / Ingrediente</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider" style={{ width: "200px" }}>Quantidade</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider" style={{ width: "80px" }}>Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <select
                        className={selectCls}
                        value={item.rawMaterialId}
                        onChange={(e) => updateItem(index, 'rawMaterialId', e.target.value)}
                        required
                      >
                        <option value="">Selecione o insumo...</option>
                        {products
                          .filter((p) => p.id !== finalProductId)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Estoque: {p.storage || 0})
                            </option>
                          ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        className={inputCls}
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        placeholder="Ex: 0.250"
                        required
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        onClick={() => removeItem(index)}
                        title="Remover Insumo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
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
            {loading ? "Salvando..." : "Salvar Ficha Técnica"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TechnicalSheetForm;