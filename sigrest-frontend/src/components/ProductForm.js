import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const inputCls = "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors";

const ProductForm = ({ onUserAdded, editingPerson, onEditComplete }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [price, setPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [storage, setStorage] = useState("");
  const [minStorage, setMinStorage] = useState("");

  useEffect(() => {
    if (editingPerson) {
      setName(editingPerson.name || "");
      setCode(editingPerson.code || "");
      setPrice(editingPerson.price || "");
      setSellPrice(editingPerson.sellPrice || "");
      setStorage(editingPerson.storage || "");
      setMinStorage(editingPerson.minStorage || "");
    }
  }, [editingPerson]);

  const clearForm = () => {
    setName(""); setCode(""); setPrice(""); setSellPrice(""); setStorage(""); setMinStorage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !code) {
      toast.error("Nome e código são obrigatórios.");
      return;
    }
    const personData = { name, code, price, sellPrice, storage, minStorage };
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
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nome do Produto</label>
            <input
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
              className={inputCls}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              placeholder="Código"
            />
          </div>
        </div>

        <div className="border-t border-slate-200 my-4 flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">PREÇOS</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Preço de Custo</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Preço de Venda</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 my-4 flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">ESTOQUE</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Estoque Atual</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">un.</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Estoque Mínimo</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
                value={minStorage}
                onChange={(e) => setMinStorage(e.target.value)}
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">un.</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Abaixo deste valor, o produto aparece em alertas.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
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