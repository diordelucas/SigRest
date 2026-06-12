import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Plus, Trash2, Calculator } from "lucide-react";
import api from "../services/api";

const inputCls = "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors";
const selectCls = "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors appearance-none";

const UDM_OPTIONS = [
  { value: "G", label: "G" },
  { value: "KG", label: "KG" },
  { value: "ML", label: "ML" },
  { value: "L", label: "L" },
  { value: "UN", label: "UN" },
  { value: "DUZIA", label: "DZ" },
];

const formatBRL = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return "0,00";
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
};

const TechnicalSheetForm = ({ sheetToEdit, onSaveSuccess, onCancel }) => {
  const [name, setName] = useState("");
  const [finalProductId, setFinalProductId] = useState("");
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rendimento, setRendimento] = useState("");
  const [labourCostPercent, setLabourCostPercent] = useState("");
  const [variableExpensesPercent, setVariableExpensesPercent] = useState("");
  const [desiredMarginPercent, setDesiredMarginPercent] = useState("");
  const [costResult, setCostResult] = useState(null);
  const [calculatingCost, setCalculatingCost] = useState(false);

  useEffect(() => {
    fetchProducts();
    if (sheetToEdit) {
      setName(sheetToEdit.name || "");
      setFinalProductId(sheetToEdit.finalProduct?.id || "");
      setRendimento(sheetToEdit.rendimento || "");
      setLabourCostPercent(sheetToEdit.labourCostPercent || "");
      setVariableExpensesPercent(sheetToEdit.variableExpensesPercent || "");
      setDesiredMarginPercent(sheetToEdit.desiredMarginPercent || "");
      setItems(sheetToEdit.items ? sheetToEdit.items.map((i) => ({
        rawMaterialId: i.rawMaterial?.id || "",
        quantity: i.quantity || "",
        unit: i.unit || ""
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

  const fetchCostPreview = async () => {
    if (!sheetToEdit?.id) return;
    setCalculatingCost(true);
    try {
      const res = await api.get(`/technical-sheet/${sheetToEdit.id}/calculate-cost`);
      setCostResult(res.data);
    } catch (err) {
      console.error("Erro ao calcular custos:", err);
      setError("Erro ao calcular custos. Verifique se os insumos têm UDM e preço de custo cadastrados.");
    } finally {
      setCalculatingCost(false);
    }
  };

  const addItem = () => {
    setItems([...items, { rawMaterialId: "", quantity: "", unit: "" }]);
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
      if (String(item.rawMaterialId) === String(finalProductId)) {
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
      rendimento: rendimento !== "" ? parseInt(rendimento) : null,
      labourCostPercent: labourCostPercent !== "" ? parseFloat(labourCostPercent) : null,
      variableExpensesPercent: variableExpensesPercent !== "" ? parseFloat(variableExpensesPercent) : null,
      desiredMarginPercent: desiredMarginPercent !== "" ? parseFloat(desiredMarginPercent) : null,
      items: items.map((i) => ({
        rawMaterialId: i.rawMaterialId,
        quantity: parseFloat(i.quantity),
        unit: i.unit || null
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
        {/* Cabeçalho da ficha */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Rendimento (Porções)</label>
            <input
              type="number"
              min="1"
              className={inputCls}
              value={rendimento}
              onChange={(e) => setRendimento(e.target.value)}
              placeholder="Ex: 10"
            />
            <p className="text-xs text-slate-400 mt-1">Quantas porções esta receita produz.</p>
          </div>
        </div>

        {/* Insumos / Ingredientes */}
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider" style={{ width: "230px" }}>Qtde / UDM</th>
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
                          .filter((p) => String(p.id) !== String(finalProductId))
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}{p.purchaseUnit ? ` (${p.purchaseUnit})` : ""}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          className={inputCls}
                          style={{ width: "110px" }}
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          placeholder="Ex: 250"
                          required
                        />
                        <select
                          className={selectCls}
                          style={{ width: "80px" }}
                          value={item.unit}
                          onChange={(e) => updateItem(index, 'unit', e.target.value)}
                        >
                          <option value="">—</option>
                          {UDM_OPTIONS.map((u) => (
                            <option key={u.value} value={u.value}>{u.label}</option>
                          ))}
                        </select>
                      </div>
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

        {/* Precificação */}
        <div className="border-t border-slate-200 my-6" />
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Precificação</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Custo de Mão de Obra (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              className={inputCls}
              value={labourCostPercent}
              onChange={(e) => setLabourCostPercent(e.target.value)}
              placeholder="Ex: 30"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Despesas Variáveis (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              className={inputCls}
              value={variableExpensesPercent}
              onChange={(e) => setVariableExpensesPercent(e.target.value)}
              placeholder="Ex: 10"
            />
            <p className="text-xs text-slate-400 mt-1">Impostos, taxas de cartão, etc.</p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Margem Desejada (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              className={inputCls}
              value={desiredMarginPercent}
              onChange={(e) => setDesiredMarginPercent(e.target.value)}
              placeholder="Ex: 20"
            />
          </div>
        </div>

        {/* Prévia de Custos — disponível ao editar ficha existente */}
        {sheetToEdit?.id && (
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Calculator size={14} />
                Prévia de Custos (dados salvos)
              </h3>
              <button
                type="button"
                onClick={fetchCostPreview}
                disabled={calculatingCost}
                className="px-3 py-1.5 text-xs bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <Calculator size={12} />
                {calculatingCost ? "Calculando..." : "Calcular Custos"}
              </button>
            </div>

            {!costResult && (
              <p className="text-xs text-slate-400 text-center py-4">
                Salve a ficha e clique em "Calcular Custos" para ver a composição de custo e o preço sugerido de venda.
              </p>
            )}

            {costResult && (
              <>
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                        <th className="pb-2">Insumo</th>
                        <th className="pb-2 text-right">Qtde</th>
                        <th className="pb-2">UDM</th>
                        <th className="pb-2 text-right">Custo/base</th>
                        <th className="pb-2 text-right">Custo Item</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {costResult.itemCosts.map((ic) => (
                        <tr key={ic.itemId}>
                          <td className="py-1.5 pr-2 text-slate-700">{ic.rawMaterialName}</td>
                          <td className="py-1.5 pr-2 text-right text-slate-600">{ic.quantity}</td>
                          <td className="py-1.5 pr-2 text-slate-500">{ic.unit || "—"}</td>
                          <td className="py-1.5 pr-2 text-right text-slate-500 font-mono text-xs">
                            R$ {parseFloat(ic.costPerBaseUnit).toFixed(6)}
                          </td>
                          <td className="py-1.5 text-right font-semibold text-slate-800">
                            R$ {formatBRL(ic.itemCost)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-400 mb-0.5">Custo Ingredientes</p>
                    <p className="font-semibold text-slate-800 text-sm">
                      R$ {formatBRL(costResult.ingredientsTotalCost)}
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-400 mb-0.5">Custo c/ Mão de Obra</p>
                    <p className="font-semibold text-slate-800 text-sm">
                      R$ {formatBRL(costResult.totalCostWithLabour)}
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-400 mb-0.5">Custo por Porção</p>
                    <p className="font-semibold text-slate-800 text-sm">
                      {costResult.rendimento
                        ? `R$ ${formatBRL(costResult.perServingCost)}`
                        : "—"}
                    </p>
                  </div>
                  <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-xs text-emerald-600 font-semibold mb-0.5">Preço Sugerido de Venda</p>
                    <p className="font-extrabold text-emerald-700 text-lg">
                      R$ {formatBRL(costResult.suggestedSellPrice)}
                    </p>
                  </div>
                </div>
              </>
            )}
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