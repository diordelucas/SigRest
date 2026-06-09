import React, { useState, useEffect } from "react";
import {
  Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Alert, Box, CircularProgress, Button
} from "@mui/material";
import api from "../services/api";

const TechnicalSheetList = ({ refreshTrigger, onEditSheet }) => {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSheets = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/technical-sheet");
      setSheets(response.data);
    } catch (error) {
      setError("Erro ao carregar fichas técnicas.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta ficha técnica?")) {
      try {
        await api.delete(`/technical-sheet/${id}`);
        setSheets(sheets.filter(s => s.id !== id));
      } catch (error) {
        setError("Erro ao excluir ficha técnica.");
      }
    }
  };

  useEffect(() => {
    fetchSheets();
  }, [refreshTrigger]);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Fichas Técnicas</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {sheets.length === 0 ? (
        <Typography color="textSecondary">Nenhuma ficha técnica cadastrada.</Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Nome</strong></TableCell>
                <TableCell><strong>Produto Final</strong></TableCell>
                <TableCell><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sheets.map((sheet) => (
                <TableRow key={sheet.id}>
                  <TableCell>{sheet.id}</TableCell>
                  <TableCell>{sheet.name}</TableCell>
                  <TableCell>{sheet.finalProduct?.name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="outlined" size="small" onClick={() => onEditSheet(sheet)}>Editar</Button>
                      <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(sheet.id)}>Excluir</Button>
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

export default TechnicalSheetList;
