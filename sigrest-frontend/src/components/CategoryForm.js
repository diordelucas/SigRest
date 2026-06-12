import React, { useState, useEffect } from "react";
import axios from "axios";

const CategoryForm = ({ onCategoryAdded, editingCategory, onEditComplete }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name || "");
      setDescription(editingCategory.description || "");
      setError("");
    }
  }, [editingCategory]);

  const clearForm = () => {
    setName("");
    setDescription("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { name, description };
    try {
      if (editingCategory) {
        await axios.put(`http://localhost:8080/category/${editingCategory.id}`, data);
        clearForm();
        onEditComplete();
      } else {
        await axios.post("http://localhost:8080/category", data);
        clearForm();
        onCategoryAdded();
      }
    } catch (error) {
      setError(editingCategory ? "Erro ao atualizar." : "Erro ao cadastrar.");
      console.error(error);
    }
  };

  const handleCancel = () => {
    clearForm();
    if (onEditComplete) onEditComplete();
  };

  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        {editingCategory ? "Editar Categoria" : "Cadastro de Categoria"}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Nome da Categoria
            </label>
            <input
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nome da categoria"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Descrição
            </label>
            <input
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors"
          >
            {editingCategory ? "Atualizar" : "Cadastrar"}
          </button>
          {editingCategory && (
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

export default CategoryForm;