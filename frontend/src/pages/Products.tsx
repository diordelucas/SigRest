import React, { useState } from 'react';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types';

export default function Products() {
  const [updateList, setUpdateList] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditComplete = () => {
    setEditingProduct(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {isAdmin && (
        <ProductForm
          onUserAdded={() => setUpdateList(!updateList)}
          editingPerson={editingProduct}
          onEditComplete={handleEditComplete}
        />
      )}
      <ProductList
        key={String(updateList)}
        refreshTrigger={refreshTrigger}
        onEditPerson={handleEditProduct}
        isReadOnly={!isAdmin}
      />
    </div>
  );
}
