import React, { useState, useEffect } from "react";
import { Pencil, Trash2, RefreshCw } from "lucide-react";
import axios from "axios";

const UserList = ({ refreshTrigger, onEditUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("http://localhost:8080/user");
      setUsers(response.data);
    } catch (error) {
      setError("Erro ao carregar a lista de usuários. Verifique o servidor.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário? (Endpoint DELETE pendente na API)")) {
      try {
        alert("Endpoint de deleção precisa ser implementado na API.");
      } catch (error) {
        setError("Erro ao excluir usuário.");
        console.error(error);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
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
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Lista de Usuários</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {users.length === 0 ? (
        <p className="text-center text-slate-400 py-8 text-sm">Nenhum usuário cadastrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nível de Acesso</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-700">{user.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        className="px-3 py-1.5 text-xs border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
                        onClick={() => onEditUser(user)}
                      >
                        <Pencil size={12} /> Editar
                      </button>
                      <button
                        className="px-3 py-1.5 text-xs bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 size={12} /> Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4">
        <button
          className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={fetchUsers}
          disabled={loading}
        >
          <RefreshCw size={14} /> Atualizar Lista
        </button>
      </div>
    </div>
  );
};

export default UserList;