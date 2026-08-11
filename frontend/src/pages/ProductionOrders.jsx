import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductionOrderList from "../components/ProductionOrderList";

export default function ProductionOrders() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  return (
    <ProductionOrderList 
      refreshTrigger={refreshTrigger}
      onNewOrder={() => navigate("/production-orders/new")}
    />
  );
}
