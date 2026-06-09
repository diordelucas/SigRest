import React, { useState, useEffect } from "react";
import {
  Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Alert, Box, CircularProgress, Button, Chip
} from "@mui/material";
import api from "../services/api";
import moment from "moment";

const ProductionOrderList = ({ refreshTrigger, onNewOrder }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/production-order");
      setOrders(response.data);
    } catch (error) {
      setError("Erro ao carregar ordens de produção.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async (id) => {
    if (window.confirm("Deseja realmente finalizar esta Ordem de Produção? Os estoques serão atualizados.")) {
      try {
        await api.post(`/production-order/${id}/finish`);
        fetchOrders();
      } catch (error) {
        alert("Erro ao finalizar ordem: " + (error.response?.data?.message || "Erro desconhecido."));
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta ordem?")) {
      try {
        await api.delete(`/production-order/${id}`);
        setOrders(orders.filter(o => o.id !== id));
      } catch (error) {
        setError("Erro ao excluir ordem de produção.");
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [refreshTrigger]);

  if (loading) {
    return <CircularProgress />;
  }

  const getStatusChip = (status) => {
    switch (status) {
      case 'OPEN': return <Chip label="ABERTA" color="primary" size="small" />;
      case 'FINISHED': return <Chip label="FINALIZADA" color="success" size="small" />;
      case 'CANCELLED': return <Chip label="CANCELADA" color="error" size="small" />;
      default: return <Chip label={status} size="small" />;
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Ordens de Produção</Typography>
        <Button variant="contained" color="primary" onClick={onNewOrder}>Nova Ordem</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {orders.length === 0 ? (
        <Typography color="textSecondary">Nenhuma ordem de produção cadastrada.</Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Ficha Técnica</strong></TableCell>
                <TableCell><strong>Qtd</strong></TableCell>
                <TableCell><strong>Data</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.technicalSheet?.name}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>{moment(order.date).format('DD/MM/YYYY HH:mm')}</TableCell>
                  <TableCell>{getStatusChip(order.status)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {order.status === 'OPEN' && (
                        <Button variant="contained" color="success" size="small" onClick={() => handleFinish(order.id)}>
                          Finalizar
                        </Button>
                      )}
                      <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(order.id)}>Excluir</Button>
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

export default ProductionOrderList;
