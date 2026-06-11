import React, { useState, useEffect } from "react";
import {
  TextField, Button, Paper, Typography, Box,
  InputAdornment, Divider,
} from "@mui/material";
import axios from "axios";
import toast from "react-hot-toast";

const ProductForm = ({ onUserAdded, editingPerson, onEditComplete }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [price, setPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [storage, setStorage] = useState("");
  const [minStorage, setMinStorage] = useState("");

  useEffect(() => {
    if (editingPerson) {
      setName(editingPerson.name || "");
      setCode(editingPerson.code || "");
      setPrice(editingPerson.price || "");
      setSellPrice(editingPerson.sellPrice || "");
      setStorage(editingPerson.storage || "");
      setMinStorage(editingPerson.minStorage || "");
    }
  }, [editingPerson]);

  const clearForm = () => {
    setName(""); setCode(""); setPrice(""); setSellPrice(""); setStorage(""); setMinStorage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !code) {
      toast.error("Nome e código são obrigatórios.");
      return;
    }

    const personData = { name, code, price, sellPrice, storage, minStorage };

    try {
      if (editingPerson) {
        await axios.put(`http://localhost:8080/product/${editingPerson.id}`, personData);
        toast.success("Produto atualizado com sucesso!");
        clearForm();
        onEditComplete();
      } else {
        await axios.post("http://localhost:8080/product", personData);
        toast.success("Produto cadastrado com sucesso!");
        clearForm();
        onUserAdded();
      }
    } catch {
      toast.error(editingPerson ? "Erro ao atualizar produto." : "Erro ao cadastrar produto.");
    }
  };

  const handleCancel = () => {
    clearForm();
    if (onEditComplete) onEditComplete();
  };

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        {editingPerson ? "Editar Produto" : "Cadastro de Produto"}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Nome do Produto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            sx={{ width: "180px" }}
            label="Código"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </Box>

        <Divider sx={{ my: 2 }}>
          <Typography variant="caption" color="text.secondary">Preços</Typography>
        </Divider>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Preço de Custo"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            inputProps={{ step: "0.01", min: 0 }}
            InputProps={{
              startAdornment: <InputAdornment position="start">R$</InputAdornment>,
            }}
          />
          <TextField
            fullWidth
            label="Preço de Venda"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
            type="number"
            inputProps={{ step: "0.01", min: 0 }}
            InputProps={{
              startAdornment: <InputAdornment position="start">R$</InputAdornment>,
            }}
          />
        </Box>

        <Divider sx={{ my: 2 }}>
          <Typography variant="caption" color="text.secondary">Estoque</Typography>
        </Divider>

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            label="Estoque Atual"
            value={storage}
            onChange={(e) => setStorage(e.target.value)}
            type="number"
            inputProps={{ min: 0 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">un.</InputAdornment>,
            }}
          />
          <TextField
            fullWidth
            label="Estoque Mínimo"
            value={minStorage}
            onChange={(e) => setMinStorage(e.target.value)}
            type="number"
            inputProps={{ min: 0 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">un.</InputAdornment>,
            }}
            helperText="Abaixo deste valor, o produto aparece em alertas."
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

export default ProductForm;