import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { IMaskInput } from "react-imask";
import axios from "axios";
import toast from "react-hot-toast";
import { CPF_MASK, PHONE_MASK, CEP_MASK } from "../utils/masks";

const inputCls = "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors";

const PersonForm = ({ onUserAdded, editingPerson, onEditComplete }) => {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [nbhd, setNbhd] = useState("");
  const [city, setCity] = useState("");
  const [uf, setUf] = useState("");
  const [cepLoading, setCepLoading] = useState(false);

  useEffect(() => {
    if (editingPerson) {
      setName(editingPerson.name || "");
      setCpf(editingPerson.cpf || "");
      setPhone(editingPerson.phone || "");
      setEmail(editingPerson.email || "");
      setCep(editingPerson.cep || "");
      setStreet(editingPerson.street || "");
      setNumber(editingPerson.number || "");
      setNbhd(editingPerson.nbhd || "");
      setCity(editingPerson.city || "");
      setUf(editingPerson.uf || "");
    }
  }, [editingPerson]);

  const handleCepBlur = async () => {
    const raw = cep.replace(/\D/g, "");
    if (raw.length !== 8) return;
    setCepLoading(true);
    try {
      const { data } = await axios.get(`https://viacep.com.br/ws/${raw}/json/`);
      if (data.erro) {
        toast.error("CEP não encontrado.");
        return;
      }
      setStreet(data.logradouro || "");
      setNbhd(data.bairro || "");
      setCity(data.localidade || "");
      setUf(data.uf || "");
      toast.success("Endereço preenchido automaticamente!");
    } catch {
      toast.error("Erro ao buscar CEP. Verifique sua conexão.");
    } finally {
      setCepLoading(false);
    }
  };

  const validateForm = () => {
    const rawCpf = cpf.replace(/\D/g, "");
    if (!name || !rawCpf || !phone || !email || !street || !number || !nbhd || !city || !uf) {
      toast.error("Todos os campos são obrigatórios.");
      return false;
    }
    if (rawCpf.length !== 11) {
      toast.error("CPF inválido. Verifique os dígitos.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("E-mail inválido.");
      return false;
    }
    return true;
  };

  const clearForm = () => {
    setName(""); setCpf(""); setPhone(""); setEmail("");
    setCep(""); setStreet(""); setNumber(""); setNbhd(""); setCity(""); setUf("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const personData = {
      name,
      cpf: cpf.replace(/\D/g, ""),
      phone: phone.replace(/\D/g, ""),
      email,
      street, number, nbhd, city, uf,
    };

    try {
      if (editingPerson) {
        await axios.put(`http://localhost:8080/person/${editingPerson.id}`, personData);
        toast.success("Pessoa atualizada com sucesso!");
        clearForm();
        onEditComplete();
      } else {
        await axios.post("http://localhost:8080/person", personData);
        toast.success("Pessoa cadastrada com sucesso!");
        clearForm();
        onUserAdded();
      }
    } catch {
      toast.error(editingPerson ? "Erro ao atualizar pessoa." : "Erro ao cadastrar pessoa.");
    }
  };

  const handleCancel = () => {
    clearForm();
    if (onEditComplete) onEditComplete();
  };

  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        {editingPerson ? "Editar Pessoa" : "Cadastro de Pessoa"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nome Completo</label>
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nome completo"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">CPF</label>
            <IMaskInput
              mask={CPF_MASK}
              value={cpf}
              onAccept={(value) => setCpf(value)}
              className={inputCls}
              placeholder="000.000.000-00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Telefone</label>
            <IMaskInput
              mask={PHONE_MASK}
              value={phone}
              onAccept={(value) => setPhone(value)}
              className={inputCls}
              placeholder="(00) 00000-0000"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">E-mail</label>
            <input
              type="email"
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>
        </div>

        <div className="border-t border-slate-200 my-4 flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">ENDEREÇO</span>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex flex-col gap-1" style={{ width: "180px" }}>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">CEP</label>
            <div className="relative">
              <IMaskInput
                mask={CEP_MASK}
                value={cep}
                onAccept={(value) => setCep(value)}
                onBlur={handleCepBlur}
                className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
                placeholder="00000-000"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {cepLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-primary-500 rounded-full animate-spin" />
                ) : (
                  <Search size={14} />
                )}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Rua / Logradouro</label>
            <input
              className={inputCls}
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Rua, Avenida..."
            />
          </div>
          <div className="flex flex-col gap-1" style={{ width: "110px" }}>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Número</label>
            <input
              className={inputCls}
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Nº"
            />
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex flex-col gap-1 flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Bairro</label>
            <input
              className={inputCls}
              value={nbhd}
              onChange={(e) => setNbhd(e.target.value)}
              placeholder="Bairro"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cidade</label>
            <input
              className={inputCls}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Cidade"
            />
          </div>
          <div className="flex flex-col gap-1" style={{ width: "80px" }}>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">UF</label>
            <input
              className={inputCls}
              value={uf}
              onChange={(e) => setUf(e.target.value.toUpperCase())}
              maxLength={2}
              placeholder="UF"
            />
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

export default PersonForm;