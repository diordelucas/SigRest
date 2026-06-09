import React, { useState, useEffect } from "react";
import { 
  Paper, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Alert, Box, 
  CircularProgress, Button
} from "@mui/material";
import axios from "axios";

const UserList = ({ refreshTrigger, onEditUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("http://localhost:8080/user");
      setUsers(response.data);
    } catch (error) {
      setError("Erro ao carregar a lista de usuários. Verifique o servidor.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário? (Endpoint DELETE pendente na API)")) {
      try {
        // await axios.delete(`http://localhost:8080/user/${id}`);
        // setUsers(users.filter(user => user.id !== id));
        alert("Endpoint de deleção precisa ser implementado na API.");
      } catch (error) {
        setError("Erro ao excluir usuário.");
        console.error(error);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Lista de Usuários
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {users.length === 0 ? (
        <Typography color="textSecondary">
          Nenhum usuário cadastrado.
        </Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Nome</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Nível de Acesso</strong></TableCell>
                <TableCell><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => onEditUser(user)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(user.id)}
                      >
                        Excluir
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      <Box mt={2}>
        <Button 
          variant="outlined" 
          onClick={fetchUsers}
          disabled={loading}
        >
          Atualizar Lista
        </Button>
      </Box>
    </Paper>
  );
};

export default UserList;
