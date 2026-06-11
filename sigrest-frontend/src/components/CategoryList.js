import React, { useState, useEffect } from "react";
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, Box, CircularProgress, Button } from "@mui/material";
import axios from "axios";

const CategoryList = ({ refreshTrigger, onEditCategory, isReadOnly }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8080/category");
      setCategories(response.data);
    } catch (error) {
      setError("Erro ao carregar categorias.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja excluir esta categoria?")) {
      try {
        await axios.delete(`http://localhost:8080/category/${id}`);
        setCategories(categories.filter(c => c.id !== id));
      } catch (error) {
        setError("Erro ao excluir categoria.");
      }
    }
  };

  useEffect(() => { fetchCategories(); }, [refreshTrigger]);

  if (loading) return <Paper sx={{ p: 3, mb: 2 }}><Box display="flex" justifyContent="center"><CircularProgress /></Box></Paper>;

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Lista de Categorias</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {categories.length === 0 ? (
        <Typography color="textSecondary">Nenhuma categoria cadastrada.</Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Nome</strong></TableCell>
                <TableCell><strong>Descrição</strong></TableCell>
                {!isReadOnly && <TableCell><strong>Ações</strong></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.id}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.description}</TableCell>
                  {!isReadOnly && (
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="outlined" color="primary" size="small" onClick={() => onEditCategory(c)}>Editar</Button>
                        <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(c.id)}>Excluir</Button>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};
export default CategoryList;
