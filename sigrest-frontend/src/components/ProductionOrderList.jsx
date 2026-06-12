import React, { useState, useEffect } from "react";
import { Trash2, CheckCircle2, Plus } from "lucide-react";
import api from "../services/api";
import moment from "moment";

const getStatusBadge = (status) => {
  switch (status) {
    case 'OPEN':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">ABERTA</span>;
    case 'FINISHED':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">FINALIZADA</span>;
    case 'CANCELLED':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">CANCELADA</span>;
    default:
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{status}</span>;
  }
};

const ProductionOrderList = ({ refreshTrigger, onNewOrder }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
        setTimeout(() => setSuccessMessage(""), 4000);
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
        setOrders(orders.filter((o) => o.id !== id));
        setSuccessMessage("Ordem de Produção excluída com sucesso!");
        setTimeout(() => setSuccessMessage(""), 4000);
      } catch (err) {
        console.error(err);
        setError("Erro ao excluir ordem de produção.");
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Ordens de Produção</h2>
        <button
          className="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
          onClick={onNewOrder}
        >
          <Plus size={14} /> Nova Ordem
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {successMessage}
        </div>
      )}

      {orders.length === 0 ? (
        <p className="text-center text-slate-400 py-8 text-sm">Nenhuma ordem de produção cadastrada.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Produto Final</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Qtd</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Data de Abertura</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Observações</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-700">{order.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">
                    {order.finalProduct?.name || "Produto não identificado"}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-800 text-center">{order.quantity}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {order.date ? moment(order.date).format('DD/MM/YYYY HH:mm') : "-"}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate" title={order.notes || ""}>
                    {order.notes || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      {order.status === 'OPEN' && (
                        <button
                          className="px-3 py-1.5 text-xs bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
                          onClick={() => handleFinish(order.id)}
                        >
                          <CheckCircle2 size={12} /> Finalizar
                        </button>
                      )}
                      <button
                        className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        onClick={() => handleDelete(order.id)}
                        title="Excluir Ordem"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductionOrderList;