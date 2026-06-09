import React, { useState, useEffect } from "react";
import {
  Paper, Typography, TextField, Button, Box, Alert, Select, MenuItem,
  FormControl, InputLabel, Grid, IconButton
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import api from "../services/api";

const TechnicalSheetForm = ({ sheetToEdit, onSaveSuccess, onCancel }) => {
  const [name, setName] = useState("");
  const [finalProductId, setFinalProductId] = useState("");
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    if (sheetToEdit) {
      setName(sheetToEdit.name || "");
      setFinalProductId(sheetToEdit.finalProduct?.id || "");
      setItems(sheetToEdit.items ? sheetToEdit.items.map(i => ({
        rawMaterialId: i.rawMaterial?.id,
        quantity: i.quantity
      })) : []);
    }
  }, [sheetToEdit]);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/product");
      setProducts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addItem = () => {
    setItems([...items, { rawMaterialId: "", quantity: "" }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = {
      name,
      finalProductId,
      items: items.map(i => ({
        rawMaterialId: i.rawMaterialId,
        quantity: parseInt(i.quantity)
      }))
    };

    try {
      if (sheetToEdit?.id) {
        await api.put(`/technical-sheet/${sheetToEdit.id}`, data);
      } else {
        await api.post("/technical-sheet", data);
      }
      onSaveSuccess();
    } catch (error) {
      setError("Erro ao salvar ficha técnica.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        {sheetToEdit ? "Editar Ficha Técnica" : "Nova Ficha Técnica"}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Nome da Ficha"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Produto Final</InputLabel>
              <Select
                value={finalProductId}
                onChange={(e) => setFinalProductId(e.target.value)}
                label="Produto Final"
              >
                {products.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>Insumos (Matéria-prima)</Typography>
        {items.map((item, index) => (
          <Grid container spacing={2} key={index} sx={{ mb: 1, alignItems: 'center' }}>
            <Grid item xs={7}>
              <FormControl fullWidth required size="small">
                <InputLabel>Insumo</InputLabel>
                <Select
                  value={item.rawMaterialId}
                  onChange={(e) => updateItem(index, 'rawMaterialId', e.target.value)}
                  label="Insumo"
                >
                  {products.map(p => (
                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Qtd"
                type="number"
                size="small"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={1}>
              <IconButton color="error" onClick={() => removeItem(index)}>
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}

        <Button variant="outlined" onClick={addItem} sx={{ mt: 1, mb: 3 }}>
          Adicionar Insumo
        </Button>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" color="secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default TechnicalSheetForm;
