import React, { useState, useEffect } from "react";
import {
  Paper, Typography, TextField, Button, Box, Alert, Select, MenuItem,
  FormControl, InputLabel, Grid, IconButton, Zoom
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import api from "../services/api";

const ProductionOrderForm = ({ onSaveSuccess, onCancel }) => {
  const [finalProductId, setFinalProductId] = useState("");
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
    } catch (err) {
      console.error("Erro ao carregar fichas técnicas:", err);
      setError("Erro ao carregar fichas técnicas. Certifique-se de que existem receitas cadastradas.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setError("A quantidade a produzir deve ser um número inteiro maior que zero.");
      setLoading(false);
      return;
    }

    const data = {
      finalProductId,
      quantity: parsedQty,
      notes
    };

    try {
      await api.post("/production-order", data);
      onSaveSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erro ao abrir ordem de produção.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Zoom in={true}>
      <Paper sx={{ p: 4, mb: 2, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton color="secondary" onClick={onCancel} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight="600" color="primary">
            Abrir Ordem de Produção
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required variant="outlined">
                <InputLabel>Produto Final (com Ficha Técnica)</InputLabel>
                <Select
                  value={finalProductId}
                  onChange={(e) => setFinalProductId(e.target.value)}
                  label="Produto Final (com Ficha Técnica)"
                  displayEmpty
                >
                  {sheets.map(s => (
                    <MenuItem key={s.finalProduct?.id} value={s.finalProduct?.id}>
                      {s.finalProduct?.name} (Receita: {s.name})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Quantidade a Produzir"
                type="number"
                inputProps={{ min: "1", step: "1" }}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Observações (Lote, Perdas, Rendimento, etc)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                placeholder="Insira detalhes adicionais sobre o lote de produção..."
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={onCancel}
              disabled={loading}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={<SaveIcon />}
              sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
            >
              {loading ? "Salvando..." : "Abrir Ordem de Produção"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Zoom>
  );
};

export default ProductionOrderForm;
