import React, { useState } from "react";
import { TextField, Button, Paper, Typography, Alert, Box } from "@mui/material";
import axios from "axios";

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/user/login", {
        email, password
      });
      // Em uma aplicação real, você guardaria um token aqui.
      // Como a API retorna o UserResponseDTO, vamos usá-lo.
      onLoginSuccess(response.data);
    } catch (error) {
      setError("Email ou senha inválidos. Verifique as credenciais.");
      console.error(error);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" gutterBottom align="center">
          Login SigRest
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TextField 
            fullWidth 
            label="Email" 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
            sx={{ mb: 2 }}
          />
          <TextField 
            fullWidth 
            label="Senha" 
            type="password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
            sx={{ mb: 3 }}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth size="large">
            Entrar
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginForm;
