import React, { useState } from 'react';
import SupplierForm from '../components/SupplierForm';
import SupplierList from '../components/SupplierList';
import { useAuth } from '../contexts/AuthContext';
import { Supplier } from '../types';

export default function Suppliers() {
  const [updateList, setUpdateList] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditComplete = () => {
    setEditingSupplier(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {isAdmin && (
        <SupplierForm
          onSupplierAdded={() => setUpdateList(!updateList)}
          editingSupplier={editingSupplier}
          onEditComplete={handleEditComplete}
        />
      )}
      <SupplierList
        key={String(updateList)}
        refreshTrigger={refreshTrigger}
        onEditSupplier={handleEditSupplier}
        isReadOnly={!isAdmin}
      />
    </div>
  );
}
