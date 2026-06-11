import React, { useState, useEffect } from "react";
import { TextField, Button, Paper, Typography, Alert, Box } from "@mui/material";
import axios from "axios";

const ProductForm = ({ onUserAdded, editingPerson, onEditComplete }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [price, setPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [storage, setStorage] = useState("");
  const [minStorage, setMinStorage] = useState("");
  const [error, setError] = useState("");

  // Preencher formulário quando editingPerson mudar
  useEffect(() => {
    if (editingPerson) {
      setName(editingPerson.name || "");
      setCode(editingPerson.code || "");
      setPrice(editingPerson.price || "");
      setSellPrice(editingPerson.sellPrice || "");
      setStorage(editingPerson.storage || "");
      setMinStorage(editingPerson.minStorage || "");
      setError("");
    }
  }, [editingPerson]);

  const clearForm = () => {
    setName("");
    setCode("");
    setPrice("");
    setSellPrice("");
    setStorage("");
    setMinStorage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const personData = {
      name,
      code,
      price,
      sellPrice,
      storage,
      minStorage
    };

    try {
      if (editingPerson) {
        // Modo edição
        await axios.put(`http://localhost:8080/product/${editingPerson.id}`, personData);
        clearForm();
        onEditComplete();
      } else {
        // Modo criação
        await axios.post("http://localhost:8080/product", personData);
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
        {editingPerson ? "Editar Produto" : "Cadastro de Produto"}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        {/* Linha 1: Nome e Código */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            fullWidth
            label="Código"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </Box>

        {/* Linha 2: Preço de Compra e Venda */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Preço de Compra"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <TextField
            fullWidth
            label="Preço de Venda"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
          />
        </Box>
        
        {/* Linha 3: Estoque e Estoque Mínimo */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Estoque"
            value={storage}
            onChange={(e) => setStorage(e.target.value)}
          />
          <TextField
            fullWidth
            label="Estoque Mínimo"
            value={minStorage}
            onChange={(e) => setMinStorage(e.target.value)}
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

export default ProductForm;