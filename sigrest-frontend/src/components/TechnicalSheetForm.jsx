import React, { useState, useEffect } from "react";
import {
  Paper, Typography, TextField, Button, Box, Alert, Select, MenuItem,
  FormControl, InputLabel, Grid, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tooltip, Zoom
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
        rawMaterialId: i.rawMaterial?.id || "",
        quantity: i.quantity || ""
      })) : []);
    }
  }, [sheetToEdit]);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/product");
      setProducts(response.data);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
      setError("Erro ao carregar lista de produtos.");
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

    if (!finalProductId) {
      setError("Selecione o Produto Final.");
      setLoading(false);
      return;
    }

    if (items.length === 0) {
      setError("Adicione pelo menos um insumo na ficha técnica.");
      setLoading(false);
      return;
    }

    // Check for empty items or duplicate ingredients
    const seenIngredients = new Set();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.rawMaterialId) {
        setError(`Selecione o insumo na linha ${i + 1}.`);
        setLoading(false);
        return;
      }
      if (!item.quantity || parseFloat(item.quantity) <= 0) {
        setError(`A quantidade do insumo na linha ${i + 1} deve ser maior que zero.`);
        setLoading(false);
        return;
      }
      if (item.rawMaterialId === finalProductId) {
        setError(`O insumo na linha ${i + 1} não pode ser igual ao produto final.`);
        setLoading(false);
        return;
      }
      if (seenIngredients.has(item.rawMaterialId)) {
        setError(`O insumo na linha ${i + 1} está duplicado.`);
        setLoading(false);
        return;
      }
      seenIngredients.add(item.rawMaterialId);
    }

    const data = {
      name,
      finalProductId,
      items: items.map(i => ({
        rawMaterialId: i.rawMaterialId,
        quantity: parseFloat(i.quantity)
      }))
    };

    try {
      if (sheetToEdit?.id) {
        await api.put(`/technical-sheet/${sheetToEdit.id}`, data);
      } else {
        await api.post("/technical-sheet", data);
      }
      onSaveSuccess();
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar ficha técnica. Verifique se o produto final já possui uma ficha cadastrada.");
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
            {sheetToEdit ? "Editar Ficha Técnica" : "Nova Ficha Técnica"}
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nome da Receita / Ficha"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required variant="outlined">
                <InputLabel>Produto Final (Marmita / Acabado)</InputLabel>
                <Select
                  value={finalProductId}
                  onChange={(e) => setFinalProductId(e.target.value)}
                  label="Produto Final (Marmita / Acabado)"
                >
                  {products.map(p => (
                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="600" color="textSecondary">
              Insumos / Ingredientes
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddCircleOutlineIcon />}
              onClick={addItem}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Adicionar Insumo
            </Button>
          </Box>

          {items.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', mb: 3, borderStyle: 'dashed', borderRadius: 2 }}>
              <Typography color="textSecondary">
                Nenhum ingrediente adicionado. Clique em "Adicionar Insumo" para começar.
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Insumo / Ingrediente</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '200px' }}>Quantidade</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '80px', textAlign: 'center' }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <FormControl fullWidth required size="small">
                          <Select
                            value={item.rawMaterialId}
                            onChange={(e) => updateItem(index, 'rawMaterialId', e.target.value)}
                            displayEmpty
                            renderValue={(selected) => {
                              if (!selected) return <span style={{ color: '#aaa' }}>Selecione o insumo...</span>;
                              const prod = products.find(p => p.id === selected);
                              return prod ? prod.name : '';
                            }}
                          >
                            <MenuItem disabled value="">
                              <em>Selecione o insumo...</em>
                            </MenuItem>
                            {products
                              .filter(p => p.id !== finalProductId)
                              .map(p => (
                                <MenuItem key={p.id} value={p.id}>
                                  {p.name} (Estoque: {p.storage || 0})
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          placeholder="Ex: 0.250"
                          type="number"
                          size="small"
                          inputProps={{ step: "any", min: "0" }}
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          fullWidth
                          required
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title="Remover Insumo">
                          <IconButton color="error" onClick={() => removeItem(index)} size="small">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

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
              {loading ? "Salvando..." : "Salvar Ficha Técnica"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Zoom>
  );
};

export default TechnicalSheetForm;
