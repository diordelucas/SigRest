import React, { useState, useEffect } from "react";
import axios from "axios";

const UserForm = ({ onUserAdded, editingUser, onEditComplete }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("OPERADOR");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name || "");
      setEmail(editingUser.email || "");
      setRole(editingUser.role || "OPERADOR");
      setPassword("");
      setError("");
    }
  }, [editingUser]);

  const clearForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("OPERADOR");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = { name, email, password, role };
    try {
      if (editingUser) {
        setError("Edição de usuário requer um endpoint específico na API (PUT).");
      } else {
        await axios.post("http://localhost:8080/user/signup", userData);
        clearForm();
        onUserAdded();
      }
    } catch (error) {
      setError(editingUser ? "Erro ao atualizar." : "Erro ao cadastrar.");
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
        {editingUser ? "Editar Usuário" : "Cadastro de Usuário"}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nome</label>
            <input
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nome completo"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@exemplo.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Senha</label>
            <input
              type="password"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!editingUser}
              placeholder="••••••••"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nível de Acesso</label>
            <select
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors appearance-none"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="ADMIN">Administrador</option>
              <option value="OPERADOR">Operador</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors"
          >
            {editingUser ? "Atualizar" : "Cadastrar"}
          </button>
          {editingUser && (
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

export default UserForm;