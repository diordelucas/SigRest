import React, { useState, useEffect } from "react";
import { TextField, Button, Paper, Typography, Alert, Box, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import axios from "axios";

const UserForm = ({ onUserAdded, editingUser, onEditComplete }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("OPERADOR");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name || "");
      setEmail(editingUser.email || "");
      setRole(editingUser.role || "OPERADOR");
      setPassword(""); // Não mostrar a senha ao editar
      setError("");
    }
  }, [editingUser]);

  const clearForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("OPERADOR");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = {
      name, 
      email,
      password,
      role
    };

    try {
      if (editingUser) {
        setError("Edição de usuário requer um endpoint específico na API (PUT).");
      } else {
        await axios.post("http://localhost:8080/user/signup", userData);
        clearForm();
        onUserAdded();
      }
    } catch (error) {
      setError(editingUser ? "Erro ao atualizar." : "Erro ao cadastrar.");
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
        {editingUser ? "Editar Usuário" : "Cadastro de Usuário"}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField 
            fullWidth 
            label="Nome" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required
          />
          <TextField 
            fullWidth 
            label="Email" 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField 
            fullWidth 
            label="Senha" 
            type="password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required={!editingUser} // A senha é obrigatória apenas ao criar
          />
          
          <FormControl fullWidth>
            <InputLabel>Nível de Acesso</InputLabel>
            <Select
              value={role}
              label="Nível de Acesso"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="ADMIN">Administrador</MenuItem>
              <MenuItem value="OPERADOR">Operador</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            {editingUser ? "Atualizar" : "Cadastrar"}
          </Button>
          {editingUser && (
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

export default UserForm;
