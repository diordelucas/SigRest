import React, { useState, useEffect } from "react";
import { TextField, Button, Paper, Typography, Box } from "@mui/material";
import axios from "axios";
import toast from "react-hot-toast";
import { MaskedInput, CNPJ_MASK, PHONE_MASK } from "../utils/masks";

const SupplierForm = ({ onSupplierAdded, editingSupplier, onEditComplete }) => {
  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [registration, setRegistration] = useState("");

  useEffect(() => {
    if (editingSupplier) {
      setName(editingSupplier.name || "");
      setCnpj(editingSupplier.cnpj || "");
      setPhone(editingSupplier.phone || "");
      setEmail(editingSupplier.email || "");
      setRegistration(editingSupplier.registration || "");
    }
  }, [editingSupplier]);

  const clearForm = () => {
    setName(""); setCnpj(""); setPhone(""); setEmail(""); setRegistration("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name,
      cnpj: cnpj.replace(/\D/g, ""),
      phone: phone.replace(/\D/g, ""),
      email,
      registration,
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

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
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