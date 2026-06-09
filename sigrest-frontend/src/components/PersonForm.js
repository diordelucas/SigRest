import React, { useState, useEffect } from "react";
import { TextField, Button, Paper, Typography, Alert, Box } from "@mui/material";
import axios from "axios";

const PessoaForm = ({ onUserAdded, editingPerson, onEditComplete }) => {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [nbhd, setNbhd] = useState("");
  const [city, setCity] = useState("");
  const [uf, setUf] = useState("");
  const [error, setError] = useState("");

  // Preencher formulário quando editingPerson mudar
  useEffect(() => {
    if (editingPerson) {
      setName(editingPerson.name || "");
      setCpf(editingPerson.cpf || "");
      setPhone(editingPerson.phone || "");
      setEmail(editingPerson.email || "");
      setStreet(editingPerson.street || "");
      setNumber(editingPerson.number || "");
      setNbhd(editingPerson.nbhd || "");
      setCity(editingPerson.city || "");
      setUf(editingPerson.uf || "");
      setError("");
    }
  }, [editingPerson]);

  const validateForm = () => {
    if (!name || !cpf || !phone || !email || !street || !number || !nbhd || !city || !uf) {
      setError("Todos os campos são obrigatórios.");
      return false;
    }
    if (!/^\d{11}$/.test(cpf)) {
      setError("CPF deve conter exatamente 11 dígitos numéricos.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("E-mail inválido.");
      return false;
    }
    setError("");
    return true;
  };

  const clearForm = () => {
    setName("");
    setCpf("");
    setPhone("");
    setEmail("");
    setStreet("");
    setNumber("");
    setNbhd("");
    setCity("");
    setUf("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const personData = {
      name, 
      cpf, 
      phone, 
      email, 
      street,
      number,
      nbhd,
      city,
      uf
    };

    try {
      if (editingPerson) {
        // Modo edição
        await axios.put(`http://localhost:8080/person/${editingPerson.id}`, personData);
        clearForm();
        onEditComplete();
      } else {
        // Modo criação
        await axios.post("http://localhost:8080/person", personData);
        clearForm();
        onUserAdded();
      }
    } catch (error) {
      setError(editingPerson ? "Erro ao atualizar. Verifique o servidor." : "Erro ao cadastrar. Verifique o servidor.");
      console.error(error);
    }
  };

  const handleCancel = () => {
    clearForm();
    if (onEditComplete) {
      onEditComplete();
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        {editingPerson ? "Editar Pessoa" : "Cadastro de Pessoa"}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <form onSubmit={handleSubmit}>
        {/* Linha 1: Nome e CPF */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField 
            fullWidth 
            label="Nome" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
          <TextField 
            fullWidth 
            label="CPF" 
            value={cpf} 
            onChange={(e) => setCpf(e.target.value)} 
          />
        </Box>

        {/* Linha 2: Telefone e Email */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField 
            fullWidth 
            label="Telefone" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
          />
          <TextField 
            fullWidth 
            label="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </Box>

        {/* Linha 3: Rua, Número e Bairro */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField 
            fullWidth 
            label="Rua" 
            value={street} 
            onChange={(e) => setStreet(e.target.value)} 
          />
          <TextField 
            label="Número" 
            value={number} 
            onChange={(e) => setNumber(e.target.value)} 
          />
          <TextField 
            fullWidth 
            label="Bairro" 
            value={nbhd} 
            onChange={(e) => setNbhd(e.target.value)} 
          />
        </Box>

        {/* Linha 4: Cidade e UF */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField 
            fullWidth 
            label="Cidade" 
            value={city} 
            onChange={(e) => setCity(e.target.value)} 
          />
          <TextField 
            sx={{ width: '100px' }}
            label="UF" 
            value={uf} 
            onChange={(e) => setUf(e.target.value)} 
          />
        </Box>

        {/* Botões */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            {editingPerson ? "Atualizar" : "Cadastrar"}
          </Button>
          {editingPerson && (
            <Button 
              type="button" 
              variant="outlined" 
              color="secondary" 
              fullWidth
              onClick={handleCancel}
            >
              Cancelar
            </Button>
          )}
        </Box>
      </form>
    </Paper>
  );
};

export default PessoaForm;