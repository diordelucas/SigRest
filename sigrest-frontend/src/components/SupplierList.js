import React, { useState, useEffect } from "react";
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, Box, CircularProgress, Button } from "@mui/material";
import axios from "axios";

const SupplierList = ({ refreshTrigger, onEditSupplier }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8080/supplier");
      setSuppliers(response.data);
    } catch (error) {
      setError("Erro ao carregar fornecedores.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja excluir este fornecedor?")) {
      try {
        await axios.delete(`http://localhost:8080/supplier/${id}`);
        setSuppliers(suppliers.filter(s => s.id !== id));
      } catch (error) {
        setError("Erro ao excluir fornecedor.");
      }
    }
  };

  useEffect(() => { fetchSuppliers(); }, [refreshTrigger]);

  if (loading) return <Paper sx={{ p: 3, mb: 2 }}><Box display="flex" justifyContent="center"><CircularProgress /></Box></Paper>;

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Lista de Fornecedores</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {suppliers.length === 0 ? (
        <Typography color="textSecondary">Nenhum fornecedor cadastrado.</Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Nome</strong></TableCell>
                <TableCell><strong>CNPJ</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.cnpj}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="outlined" color="primary" size="small" onClick={() => onEditSupplier(s)}>Editar</Button>
                      <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(s.id)}>Excluir</Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};
export default SupplierList;
