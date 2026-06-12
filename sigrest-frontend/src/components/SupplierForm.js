import React, { useState, useEffect } from "react";
import {
  TextField, Button, Paper, Typography, Box,
  InputAdornment, CircularProgress, Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import toast from "react-hot-toast";
import { MaskedInput, CNPJ_MASK, PHONE_MASK, CEP_MASK } from "../utils/masks";

const SupplierForm = ({ onSupplierAdded, editingSupplier, onEditComplete }) => {
  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [registration, setRegistration] = useState("");
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [nbhd, setNbhd] = useState("");
  const [city, setCity] = useState("");
  const [uf, setUf] = useState("");
  const [cepLoading, setCepLoading] = useState(false);

  useEffect(() => {
    if (editingSupplier) {
      setName(editingSupplier.name || "");
      setCnpj(editingSupplier.cnpj || "");
      setPhone(editingSupplier.phone || "");
      setEmail(editingSupplier.email || "");
      setRegistration(editingSupplier.registration || "");
      setCep("");
      setStreet(editingSupplier.street || "");
      setNumber(editingSupplier.number || "");
      setNbhd(editingSupplier.nbhd || "");
      setCity(editingSupplier.city || "");
      setUf(editingSupplier.uf || "");
    }
  }, [editingSupplier]);

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

  const clearForm = () => {
    setName(""); setCnpj(""); setPhone(""); setEmail(""); setRegistration("");
    setCep(""); setStreet(""); setNumber(""); setNbhd(""); setCity(""); setUf("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name,
      cnpj: cnpj.replace(/\D/g, ""),
      phone: phone.replace(/\D/g, ""),
      email,
      registration,
      street, number, nbhd, city, uf,
    };
    try {
      if (editingSupplier) {
        await axios.put(`http://localhost:8080/supplier/${editingSupplier.id}`, data);
        toast.success("Fornecedor atualizado com sucesso!");
        clearForm();
        onEditComplete();
      } else {
        await axios.post("http://localhost:8080/supplier", data);
        toast.success("Fornecedor cadastrado com sucesso!");
        clearForm();
        onSupplierAdded();
      }
    } catch {
      toast.error(editingSupplier ? "Erro ao atualizar fornecedor." : "Erro ao cadastrar fornecedor.");
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        {editingSupplier ? "Editar Fornecedor" : "Cadastro de Fornecedor"}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Nome / Razão Social"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="CNPJ"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            placeholder="00.000.000/0000-00"
            InputProps={{
              inputComponent: MaskedInput,
              inputProps: { mask: CNPJ_MASK, name: "cnpj" },
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
          <TextField
            fullWidth
            label="Inscrição Estadual"
            value={registration}
            onChange={(e) => setRegistration(e.target.value)}
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
            {editingSupplier ? "Atualizar" : "Cadastrar"}
          </Button>
          {editingSupplier && (
            <Button
              type="button"
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={() => { clearForm(); onEditComplete(); }}
            >
              Cancelar
            </Button>
          )}
        </Box>
      </form>
    </Paper>
  );
};

export default SupplierForm;