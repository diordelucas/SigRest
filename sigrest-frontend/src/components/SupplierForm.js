import React, { useState, useEffect } from "react";
import { TextField, Button, Paper, Typography, Alert, Box } from "@mui/material";
import axios from "axios";

const SupplierForm = ({ onSupplierAdded, editingSupplier, onEditComplete }) => {
  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [registration, setRegistration] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingSupplier) {
      setName(editingSupplier.name || "");
      setCnpj(editingSupplier.cnpj || "");
      setPhone(editingSupplier.phone || "");
      setEmail(editingSupplier.email || "");
      setRegistration(editingSupplier.registration || "");
      setError("");
    }
  }, [editingSupplier]);

  const clearForm = () => {
    setName(""); setCnpj(""); setPhone(""); setEmail(""); setRegistration("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { name, cnpj, phone, email, registration };
    try {
      if (editingSupplier) {
        await axios.put(`http://localhost:8080/supplier/${editingSupplier.id}`, data);
        clearForm();
        onEditComplete();
      } else {
        await axios.post("http://localhost:8080/supplier", data);
        clearForm();
        onSupplierAdded();
      }
    } catch (error) {
      setError(editingSupplier ? "Erro ao atualizar." : "Erro ao cadastrar.");
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>{editingSupplier ? "Editar Fornecedor" : "Cadastro de Fornecedor"}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField fullWidth label="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
          <TextField fullWidth label="CNPJ" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField fullWidth label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField fullWidth label="Inscrição Estadual" value={registration} onChange={(e) => setRegistration(e.target.value)} />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            {editingSupplier ? "Atualizar" : "Cadastrar"}
          </Button>
          {editingSupplier && (
            <Button type="button" variant="outlined" color="secondary" fullWidth onClick={() => { clearForm(); onEditComplete(); }}>
              Cancelar
            </Button>
          )}
        </Box>
      </form>
    </Paper>
  );
};
export default SupplierForm;
