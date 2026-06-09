import React, { useState, useEffect } from "react";
import {
  Paper, Typography, TextField, Button, Box, Alert, Select, MenuItem,
  FormControl, InputLabel, Grid
} from "@mui/material";
import api from "../services/api";

const ProductionOrderForm = ({ onSaveSuccess, onCancel }) => {
  const [technicalSheetId, setTechnicalSheetId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [sheets, setSheets] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSheets();
  }, []);

  const fetchSheets = async () => {
    try {
      const response = await api.get("/technical-sheet");
      setSheets(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = {
      technicalSheetId,
      quantity: parseInt(quantity),
      notes
    };

    try {
      await api.post("/production-order", data);
      onSaveSuccess();
    } catch (error) {
      setError("Erro ao abrir ordem de produção.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Abrir Ordem de Produção</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Ficha Técnica</InputLabel>
              <Select
                value={technicalSheetId}
                onChange={(e) => setTechnicalSheetId(e.target.value)}
                label="Ficha Técnica"
              >
                {sheets.map(s => (
                  <MenuItem key={s.id} value={s.id}>{s.name} ({s.finalProduct?.name})</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Quantidade do Produto Final a Produzir"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Observações (Lote, Perdas, Rendimento etc)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
          <Button variant="outlined" color="secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? "Salvando..." : "Abrir Ordem"}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default ProductionOrderForm;
