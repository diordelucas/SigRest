import React, { useState } from "react";
import CategoryForm from "../components/CategoryForm";
import CategoryList from "../components/CategoryList";

export default function Categorias() {
  const [updateList, setUpdateList] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditComplete = () => {
    setEditingCategory(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <CategoryForm 
        onCategoryAdded={() => setUpdateList(!updateList)}
        editingCategory={editingCategory}
        onEditComplete={handleEditComplete}
      />
      <CategoryList 
        key={updateList} 
        refreshTrigger={refreshTrigger}
        onEditCategory={handleEditCategory}
      />
    </div>
  );
}
