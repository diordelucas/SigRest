import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Box,
  CircularProgress,
  Button
} from "@mui/material";
import axios from "axios";

const ProductList = ({ refreshTrigger, onEditPerson, isReadOnly }) => {
  const [products, setProducts] = useState([]); // Changed setPersons to setProducts
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => { // Changed fetchPersons to fetchProducts
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("http://localhost:8080/product");
      setProducts(response.data); // Changed setPersons to setProducts
    } catch (error) {
      setError("Erro ao carregar a lista de produtos. Verifique o servidor."); // Changed message
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) { // Changed message
      try {
        await axios.delete(`http://localhost:8080/product/${id}`);
        setProducts(products.filter(product => product.id !== id)); // Changed persons to products
      } catch (error) {
        setError("Erro ao excluir produto. Verifique o servidor."); // Changed message
        console.error(error);
      }
    }
  };

  const handleEdit = (product) => { // Changed person to product
    onEditPerson(product);
  };

  useEffect(() => {
    fetchProducts(); // Changed fetchPersons to fetchProducts
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
        Lista de Produtos
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {products.length === 0 ? (
        <Typography color="textSecondary">
          Nenhum produto cadastrado.
        </Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Nome</strong></TableCell>
                <TableCell><strong>Código</strong></TableCell>
                <TableCell><strong>Preço Compra</strong></TableCell>
                <TableCell><strong>Preço Venda</strong></TableCell>
                <TableCell><strong>Estoque</strong></TableCell>
                {!isReadOnly && <TableCell><strong>Ações</strong></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.code}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.sellPrice}</TableCell>
                  <TableCell>{product.storage}</TableCell>
                  {!isReadOnly && (
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleEdit(product)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDelete(product.id)}
                        >
                          Excluir
                        </Button>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box mt={2}>
        <Button
          variant="outlined"
          onClick={fetchProducts} // Changed fetchPersons to fetchProducts
          disabled={loading}
        >
          Atualizar Lista
        </Button>
      </Box>
    </Paper>
  );
};

export default ProductList;