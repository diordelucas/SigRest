import React, { useState } from "react";
import SupplierForm from "../components/SupplierForm";
import SupplierList from "../components/SupplierList";

export default function Fornecedores() {
  const [updateList, setUpdateList] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditComplete = () => {
    setEditingSupplier(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <SupplierForm 
        onSupplierAdded={() => setUpdateList(!updateList)}
        editingSupplier={editingSupplier}
        onEditComplete={handleEditComplete}
      />
      <SupplierList 
        key={updateList} 
        refreshTrigger={refreshTrigger}
        onEditSupplier={handleEditSupplier}
      />
    </div>
  );
}
