import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import CurrencyInput from "./CurrencyInput";

const inputCls = "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors";

const TIPOS = [
  { value: "INSUMO", label: "Insumo (Matéria-Prima)" },
  { value: "PRODUTO_FINAL", label: "Produto Final" },
  { value: "PRODUTO_INTERMEDIARIO", label: "Produto Intermediário" },
];

const UDM_OPTIONS = [
  { value: "G", label: "G — Grama" },
  { value: "KG", label: "KG — Quilograma" },
  { value: "ML", label: "ML — Mililitro" },
  { value: "L", label: "L — Litro" },
  { value: "UN", label: "UN — Unidade" },
  { value: "DUZIA", label: "DUZIA — Dúzia" },
];

const stockUnit = (tipo, purchaseUnit) => {
  if (tipo !== "INSUMO" || !purchaseUnit) return "un";
  if (["G", "KG"].includes(purchaseUnit)) return "g";
  if (["ML", "L"].includes(purchaseUnit)) return "ml";
  return "un";
};

const ProductForm = ({ onUserAdded, editingPerson, onEditComplete }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [price, setPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [storage, setStorage] = useState("");
  const [minStorage, setMinStorage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [tipo, setTipo] = useState("");
  const [purchaseUnit, setPurchaseUnit] = useState("");
  const [packageQuantity, setPackageQuantity] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8080/category")
      .then((res) => setCategories(res.data))
      .catch(() => toast.error("Erro ao carregar categorias."));
  }, []);

  useEffect(() => {
    if (editingPerson) {
      setName(editingPerson.name || "");
      setCode(editingPerson.code || "");
      setPrice(editingPerson.price || "");
      setSellPrice(editingPerson.sellPrice || "");
      setStorage(editingPerson.storage || "");
      setMinStorage(editingPerson.minStorage || "");
      setCategoryId(editingPerson.categoryId || "");
      setTipo(editingPerson.tipo || "");
      setPurchaseUnit(editingPerson.purchaseUnit || "");
      setPackageQuantity(editingPerson.packageQuantity || "");
    }
  }, [editingPerson]);

  const clearForm = () => {
    setName(""); setCode(""); setPrice(""); setSellPrice(""); setStorage(""); setMinStorage(""); setCategoryId("");
    setTipo(""); setPurchaseUnit(""); setPackageQuantity("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !code) {
      toast.error("Nome e código são obrigatórios.");
      return;
    }
    if (!categoryId) {
      toast.error("Selecione a categoria do produto.");
      return;
    }
    const personData = {
      name, code, price, sellPrice, storage, minStorage,
      categoryId: Number(categoryId),
      tipo: tipo || null,
      purchaseUnit: purchaseUnit || null,
      packageQuantity: packageQuantity !== "" ? Number(packageQuantity) : null,
    };
    try {
      if (editingPerson) {
        await axios.put(`http://localhost:8080/product/${editingPerson.id}`, personData);
        toast.success("Produto atualizado com sucesso!");
        clearForm();
        onEditComplete();
      } else {
        await axios.post("http://localhost:8080/product", personData);
        toast.success("Produto cadastrado com sucesso!");
        clearForm();
        onUserAdded();
      }
    } catch {
      toast.error(editingPerson ? "Erro ao atualizar produto." : "Erro ao cadastrar produto.");
    }
  };

  const handleCancel = () => {
    clearForm();
    if (onEditComplete) onEditComplete();
  };

  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        {editingPerson ? "Editar Produto" : "Cadastro de Produto"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nome do Produto</label>
            <input
              data-testid="product-name"
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nome do produto"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Código</label>
            <input
              data-testid="product-code"
              className={inputCls}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              placeholder="Código"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 mb-4">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Categoria (Tipo de Produto)</label>
          <select
            data-testid="product-category"
            className={`${inputCls} appearance-none`}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Selecione a categoria...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="border-t border-slate-200 my-4 flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">PREÇOS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Preço de Custo</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</span>
              <CurrencyInput
                data-testid="product-price"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
                value={price}
                onChange={setPrice}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Preço de Venda</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</span>
              <CurrencyInput
                data-testid="product-sellprice"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
                value={sellPrice}
                onChange={setSellPrice}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 my-4 flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">ESTOQUE</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Estoque Atual{stockUnit(tipo, purchaseUnit) !== "un" ? ` (${stockUnit(tipo, purchaseUnit)})` : ""}
            </label>
            <div className="relative">
              <input
                data-testid="product-storage"
                type="number"
                min="0"
                step="any"
                className="w-full pl-3 pr-12 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{stockUnit(tipo, purchaseUnit)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Estoque Mínimo{stockUnit(tipo, purchaseUnit) !== "un" ? ` (${stockUnit(tipo, purchaseUnit)})` : ""}
            </label>
            <div className="relative">
              <input
                data-testid="product-minstorage"
                type="number"
                min="0"
                step="any"
                className="w-full pl-3 pr-12 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
                value={minStorage}
                onChange={(e) => setMinStorage(e.target.value)}
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{stockUnit(tipo, purchaseUnit)}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Abaixo deste valor, o produto aparece em alertas.</p>
          </div>
        </div>

        <div className="border-t border-slate-200 my-4 flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">CLASSIFICAÇÃO E UNIDADE DE COMPRA</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tipo de Produto</label>
            <select
              className={`${inputCls} appearance-none`}
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="">Selecione o tipo...</option>
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {tipo === "INSUMO" && (
            <>
              <div className="flex flex-col gap-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Unidade de Compra (UDM)</label>
                <select
                  className={`${inputCls} appearance-none`}
                  value={purchaseUnit}
                  onChange={(e) => setPurchaseUnit(e.target.value)}
                >
                  <option value="">Selecione a UDM...</option>
                  {UDM_OPTIONS.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Qtde por Embalagem</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  className={inputCls}
                  value={packageQuantity}
                  onChange={(e) => setPackageQuantity(e.target.value)}
                  placeholder={purchaseUnit ? `Ex: 5 (5 ${purchaseUnit} por embalagem)` : "Ex: 5"}
                />
                <p className="text-xs text-slate-400 mt-1">
                  Quantas {purchaseUnit || "unidades"} contém a embalagem comprada.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            data-testid="product-submit"
            className="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors"
          >
            {editingPerson ? "Atualizar" : "Cadastrar"}
          </button>
          {editingPerson && (
            <button
              type="button"
              className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              onClick={handleCancel}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProductForm;