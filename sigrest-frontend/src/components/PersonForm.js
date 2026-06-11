import React, { useState, useEffect } from "react";
import {
  TextField, Button, Paper, Typography, Box,
  InputAdornment, CircularProgress, Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import toast from "react-hot-toast";
import { MaskedInput, CPF_MASK, PHONE_MASK, CEP_MASK } from "../utils/masks";

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
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        {editingPerson ? "Editar Pessoa" : "Cadastro de Pessoa"}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Nome Completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="000.000.000-00"
            InputProps={{
              inputComponent: MaskedInput,
              inputProps: { mask: CPF_MASK, name: "cpf" },
            }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(00) 00000-0000"
            InputProps={{
              inputComponent: MaskedInput,
              inputProps: { mask: PHONE_MASK, name: "phone" },
            }}
          />
          <TextField
            fullWidth
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Box>

        <Divider sx={{ my: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Endereço
          </Typography>
        </Divider>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            sx={{ width: "180px" }}
            label="CEP"
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            onBlur={handleCepBlur}
            placeholder="00000-000"
            InputProps={{
              inputComponent: MaskedInput,
              inputProps: { mask: CEP_MASK, name: "cep" },
              endAdornment: (
                <InputAdornment position="end">
                  {cepLoading
                    ? <CircularProgress size={18} />
                    : <SearchIcon fontSize="small" color="action" />}
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Rua / Logradouro"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />
          <TextField
            sx={{ width: "110px" }}
            label="Número"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            label="Bairro"
            value={nbhd}
            onChange={(e) => setNbhd(e.target.value)}
          />
          <TextField
            fullWidth
            label="Cidade"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <TextField
            sx={{ width: "80px" }}
            label="UF"
            value={uf}
            onChange={(e) => setUf(e.target.value.toUpperCase())}
            inputProps={{ maxLength: 2 }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            {editingPerson ? "Atualizar" : "Cadastrar"}
          </Button>
          {editingPerson && (
            <Button type="button" variant="outlined" color="secondary" fullWidth onClick={handleCancel}>
              Cancelar
            </Button>
          )}
        </Box>
      </form>
    </Paper>
  );
};

export default PersonForm;