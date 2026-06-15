import React, { useState, useEffect } from "react";
import { Pencil, Trash2, RefreshCw, Search } from "lucide-react";
import axios from "axios";

const PersonList = ({ refreshTrigger, onEditPerson, isReadOnly }) => {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState('');

  const fetchPersons = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("http://localhost:8080/person");
      setPersons(response.data);
    } catch (error) {
      setError("Erro ao carregar a lista de pessoas. Verifique o servidor.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta pessoa?")) {
      try {
        await axios.delete(`http://localhost:8080/person/${id}`);
        setPersons(persons.filter((person) => person.id !== id));
      } catch (error) {
        setError("Erro ao excluir pessoa. Verifique o servidor.");
        console.error(error);
      }
    }
  };

  useEffect(() => {
    fetchPersons();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="bg-stone-50 rounded-xl shadow-soft border border-stone-200 p-6 mb-6">
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const filtered = persons.filter(person => {
    const q = search.toLowerCase();
    return [person.name, person.cpf, person.phone, person.email, person.city, person.uf].some(v => (v ?? '').toLowerCase().includes(q));
  });

  return (
    <div className="bg-stone-50 rounded-xl shadow-soft border border-stone-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Lista de Pessoas</h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input type="text" placeholder="Pesquisar por nome, CPF, cidade..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 pr-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 w-72" />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-center text-slate-400 py-8 text-sm">
          {search ? `Nenhum resultado para "${search}".` : 'Nenhuma pessoa cadastrada.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-100 border-b border-stone-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">CPF</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Telefone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Endereço</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Cidade</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">UF</th>
                {!isReadOnly && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Ações</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((person) => (
                <tr key={person.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-700">{person.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{person.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{person.cpf}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{person.phone}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{person.email}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {person.street && person.number && person.nbhd
                      ? `${person.street}, ${person.number} - ${person.nbhd}`
                      : "Não informado"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{person.city || "Não informado"}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{person.uf || "Não informado"}</td>
                  {!isReadOnly && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          className="px-3 py-1.5 text-xs border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-stone-50 transition-colors flex items-center gap-1"
                          onClick={() => onEditPerson(person)}
                        >
                          <Pencil size={12} /> Editar
                        </button>
                        <button
                          className="px-3 py-1.5 text-xs bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                          onClick={() => handleDelete(person.id)}
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

      <div className="mt-4">
        <button
          className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-stone-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={fetchPersons}
          disabled={loading}
        >
          <RefreshCw size={14} /> Atualizar Lista
        </button>
      </div>
    </div>
  );
};

export default PersonList;