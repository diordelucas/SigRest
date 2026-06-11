import React, { useState } from "react";
import CategoryForm from "../components/CategoryForm";
import CategoryList from "../components/CategoryList";
import { useAuth } from "../contexts/AuthContext";

export default function Categories() {
  const [updateList, setUpdateList] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingCategory, setEditingCategory] = useState(null);
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

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
      {isAdmin && (
        <CategoryForm 
          onCategoryAdded={() => setUpdateList(!updateList)}
          editingCategory={editingCategory}
          onEditComplete={handleEditComplete}
        />
      )}
      <CategoryList 
        key={updateList} 
        refreshTrigger={refreshTrigger}
        onEditCategory={handleEditCategory}
        isReadOnly={!isAdmin}
      />
    </div>
  );
}
