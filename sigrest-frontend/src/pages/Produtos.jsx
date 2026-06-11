import React, { useState } from "react";
import ProductForm from "../components/ProductForm";
import ProductList from "../components/ProductList";

export default function Produtos() {
  const [updateList, setUpdateList] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditComplete = () => {
    setEditingProduct(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <ProductForm 
        onUserAdded={() => setUpdateList(!updateList)}
        editingPerson={editingProduct} // Note: keeping Prop name 'editingPerson' as in App.js
        onEditComplete={handleEditComplete}
      />
      <ProductList 
        key={updateList} 
        refreshTrigger={refreshTrigger}
        onEditPerson={handleEditProduct} // Note: keeping Prop name 'onEditPerson' as in App.js
      />
    </div>
  );
}
