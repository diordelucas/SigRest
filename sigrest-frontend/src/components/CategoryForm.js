import React, { useState, useEffect } from "react";
import { TextField, Button, Paper, Typography, Alert, Box } from "@mui/material";
import axios from "axios";

const CategoryForm = ({ onCategoryAdded, editingCategory, onEditComplete }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name || "");
      setDescription(editingCategory.description || "");
      setError("");
    }
  }, [editingCategory]);

  const clearForm = () => {
    setName("");
    setDescription("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { name, description };

    try {
      if (editingCategory) {
        await axios.put(`http://localhost:8080/category/${editingCategory.id}`, data);
        clearForm();
        onEditComplete();
      } else {
        await axios.post("http://localhost:8080/category", data);
        clearForm();
        onCategoryAdded();
      }
    } catch (error) {
      setError(editingCategory ? "Erro ao atualizar." : "Erro ao cadastrar.");
      console.error(error);
    }
  };

  const handleCancel = () => {
    clearForm();
    if (onEditComplete) onEditComplete();
  };

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        {editingCategory ? "Editar Categoria" : "Cadastro de Categoria"}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField 
            fullWidth label="Nome da Categoria" 
            value={name} onChange={(e) => setName(e.target.value)} required 
          />
          <TextField 
            fullWidth label="Descrição" 
            value={description} onChange={(e) => setDescription(e.target.value)} 
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            {editingCategory ? "Atualizar" : "Cadastrar"}
          </Button>
          {editingCategory && (
            <Button type="button" variant="outlined" color="secondary" fullWidth onClick={handleCancel}>
              Cancelar
            </Button>
          )}
        </Box>
      </form>
    </Paper>
  );
};

export default CategoryForm;
