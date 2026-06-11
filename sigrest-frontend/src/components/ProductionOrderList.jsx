import React, { useState, useEffect } from "react";
import {
  Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Alert, Box, CircularProgress, Button, Chip,
  IconButton, Tooltip, Zoom, Snackbar
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import api from "../services/api";
import moment from "moment";

const ProductionOrderList = ({ refreshTrigger, onNewOrder }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/production-order");
      setOrders(response.data);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar ordens de produção.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async (id) => {
    if (window.confirm("Deseja realmente finalizar esta Ordem de Produção? Os estoques de insumos serão debitados e o produto acabado será creditado.")) {
      try {
        await api.post(`/production-order/${id}/finish`);
        setSuccessMessage("Ordem de Produção finalizada com sucesso!");
        setOpenSnackbar(true);
        fetchOrders();
      } catch (err) {
        console.error(err);
        alert("Erro ao finalizar ordem: " + (err.response?.data?.message || "Erro de conexão ou insumos insuficientes."));
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta ordem de produção?")) {
      try {
        await api.delete(`/production-order/${id}`);
        setOrders(orders.filter(o => o.id !== id));
        setSuccessMessage("Ordem de Produção excluída com sucesso!");
        setOpenSnackbar(true);
      } catch (err) {
        console.error(err);
        setError("Erro ao excluir ordem de produção.");
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [refreshTrigger]);

  const getStatusChip = (status) => {
    switch (status) {
      case 'OPEN':
        return (
          <Chip
            label="ABERTA"
            color="primary"
            size="small"
            sx={{ fontWeight: '600', borderRadius: '6px' }}
          />
        );
      case 'FINISHED':
        return (
          <Chip
            label="FINALIZADA"
            color="success"
            size="small"
            sx={{ fontWeight: '600', borderRadius: '6px' }}
          />
        );
      case 'CANCELLED':
        return (
          <Chip
            label="CANCELADA"
            color="error"
            size="small"
            sx={{ fontWeight: '600', borderRadius: '6px' }}
          />
        );
      default:
        return <Chip label={status} size="small" />;
    }
  };

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
            Ordens de Produção
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onNewOrder}
            sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
          >
            Nova Ordem
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
        
        {orders.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', backgroundColor: 'action.hover', borderRadius: 2 }}>
            <Typography color="textSecondary">Nenhuma ordem de produção cadastrada.</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ backgroundColor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Produto Final</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Qtd</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Data de Abertura</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Observações</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>{order.id}</TableCell>
                    <TableCell sx={{ fontWeight: '500' }}>
                      {order.finalProduct?.name || "Produto não identificado"}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                      {order.quantity}
                    </TableCell>
                    <TableCell>
                      {order.date ? moment(order.date).format('DD/MM/YYYY HH:mm') : "-"}
                    </TableCell>
                    <TableCell>{getStatusChip(order.status)}</TableCell>
                    <TableCell sx={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <Tooltip title={order.notes || ""}>
                        <span>{order.notes || "-"}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        {order.status === 'OPEN' && (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleFinish(order.id)}
                            sx={{ borderRadius: '6px', textTransform: 'none', fontSize: '0.75rem' }}
                          >
                            Finalizar
                          </Button>
                        )}
                        <Tooltip title="Excluir Ordem">
                          <IconButton color="error" onClick={() => handleDelete(order.id)} size="small">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Snackbar
          open={openSnackbar}
          autoHideDuration={4000}
          onClose={() => setOpenSnackbar(false)}
          message={successMessage}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        />
      </Paper>
    </Zoom>
  );
};

export default ProductionOrderList;
