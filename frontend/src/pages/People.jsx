import React, { useState } from "react";
import PersonForm from "../components/PersonForm";
import PersonList from "../components/PersonList";
import { useAuth } from "../contexts/AuthContext";

export default function People() {
  const [updateList, setUpdateList] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingPerson, setEditingPerson] = useState(null);
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const handleEditPerson = (person) => {
    setEditingPerson(person);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditComplete = () => {
    setEditingPerson(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {isAdmin && (
        <PersonForm 
          onUserAdded={() => setUpdateList(!updateList)}
          editingPerson={editingPerson}
          onEditComplete={handleEditComplete}
        />
      )}
      <PersonList 
        key={updateList} 
        refreshTrigger={refreshTrigger}
        onEditPerson={handleEditPerson}
        isReadOnly={!isAdmin}
      />
    </div>
  );
}
