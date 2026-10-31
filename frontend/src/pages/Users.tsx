import React, { useState } from 'react';
import UserForm from '../components/UserForm';
import UserList from '../components/UserList';
import { User } from '../types';
import { scrollMainToTop } from '../utils/format';

export default function Users() {
  const [updateList, setUpdateList] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    scrollMainToTop();
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
