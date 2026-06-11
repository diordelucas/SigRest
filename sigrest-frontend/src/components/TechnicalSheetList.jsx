import React, { useState, useEffect } from "react";
import {
  Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Alert, Box, CircularProgress, Button, Zoom, Tooltip, IconButton
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import api from "../services/api";

const TechnicalSheetList = ({ refreshTrigger, onEditSheet, onNewSheet, isReadOnly }) => {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSheets = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/technical-sheet");
      setSheets(response.data);
    } catch (err) {
      console.error(err);
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
      } catch (err) {
        console.error(err);
        setError("Erro ao excluir ficha técnica.");
      }
    }
  };

  useEffect(() => {
    fetchSheets();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Zoom in={true}>
      <Paper sx={{ p: 4, mb: 2, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="600" color="primary">
            Fichas Técnicas (Receitas)
          </Typography>
          {!isReadOnly && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={onNewSheet}
              sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
            >
              Nova Ficha Técnica
            </Button>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
        
        {sheets.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', backgroundColor: 'action.hover', borderRadius: 2 }}>
            <Typography color="textSecondary">Nenhuma ficha técnica cadastrada.</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ backgroundColor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nome da Receita</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Produto Final</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Qtd. de Insumos</TableCell>
                  {!isReadOnly && <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Ações</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {sheets.map((sheet) => (
                  <TableRow key={sheet.id} hover>
                    <TableCell>{sheet.id}</TableCell>
                    <TableCell sx={{ fontWeight: '500' }}>{sheet.name}</TableCell>
                    <TableCell>{sheet.finalProduct?.name || "Produto não identificado"}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      {sheet.items ? sheet.items.length : 0}
                    </TableCell>
                    {!isReadOnly && (
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Editar Ficha">
                            <IconButton color="primary" onClick={() => onEditSheet(sheet)} size="small">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir Ficha">
                            <IconButton color="error" onClick={() => handleDelete(sheet.id)} size="small">
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
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
    </Zoom>
  );
};

export default TechnicalSheetList;
