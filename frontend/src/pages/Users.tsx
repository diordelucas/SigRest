import React, { useState } from 'react';
import UserForm from '../components/UserForm';
import UserList from '../components/UserList';
import { User } from '../types';

export default function Users() {
  const [updateList, setUpdateList] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditComplete = () => {
    setEditingUser(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <UserForm
        onUserAdded={() => setUpdateList(!updateList)}
        editingUser={editingUser}
        onEditComplete={handleEditComplete}
      />
      <UserList key={String(updateList)} refreshTrigger={refreshTrigger} onEditUser={handleEditUser} />
    </div>
  );
}
