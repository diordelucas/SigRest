import React, { useState } from "react";
import UserForm from "../components/UserForm";
import UserList from "../components/UserList";

export default function Usuarios() {
  const [updateList, setUpdateList] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingUser, setEditingUser] = useState(null);

  const handleEditUser = (user) => {
    setEditingUser(user);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditComplete = () => {
    setEditingUser(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <UserForm 
        onUserAdded={() => setUpdateList(!updateList)}
        editingUser={editingUser}
        onEditComplete={handleEditComplete}
      />
      <UserList 
        key={updateList} 
        refreshTrigger={refreshTrigger}
        onEditUser={handleEditUser}
      />
    </div>
  );
}
