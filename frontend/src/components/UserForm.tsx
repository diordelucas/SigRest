import React, { useState, useEffect, FormEvent } from 'react';
import api, { getErrorMessage } from '../services/api';
import { User, UserRole } from '../types';
import Button from './ui/Button';
import Field from './ui/Field';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface UserFormProps {
  onUserAdded: () => void;
  editingUser: User | null;
  onEditComplete: () => void;
}

const UserForm = ({ onUserAdded, editingUser, onEditComplete }: UserFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('OPERADOR');
  const [error, setError] = useState('');
  const { currentUser, signOut } = useAuth();

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name || '');
      setEmail(editingUser.email || '');
      setRole(editingUser.role || 'OPERADOR');
      setPassword('');
      setError('');
    }
  }, [editingUser]);

  const clearForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('OPERADOR');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const userData = { name, email, password, role };
    try {
      if (editingUser) {
        await api.put(`/user/${editingUser.id}`, { name, email, role, password: password || undefined });
        // A sessão guarda e-mail e perfil: se o próprio usuário mudou, ele precisa entrar de novo.
        const self = currentUser?.email === editingUser.email;
        if (self && (email.trim().toLowerCase() !== editingUser.email.toLowerCase() || role !== editingUser.role)) {
          toast.success('Usuário atualizado. Entre novamente para continuar.');
          signOut();
          return;
        }
        toast.success('Usuário atualizado com sucesso!');
        clearForm();
        onEditComplete();
      } else {
        await api.post('/user/signup', userData);
        toast.success('Usuário cadastrado com sucesso!');
        clearForm();
        onUserAdded();
      }
    } catch (error) {
      setError(getErrorMessage(error, editingUser ? 'Erro ao atualizar usuário.' : 'Erro ao cadastrar usuário.'));
    }
  };

  const handleCancel = () => {
    clearForm();
    setError('');
    if (onEditComplete) onEditComplete();
  };

  return (
    <div className="card p-6 mb-6">
      <h2 className="text-lg font-semibold text-ink mb-4">
        {editingUser ? 'Editar Usuário' : 'Cadastro de Usuário'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="userform-nome" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">Nome</label>
            <Field id="userform-nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nome completo"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="userform-email" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">Email</label>
            <Field id="userform-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@exemplo.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="userform-senha" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">Senha</label>
            <Field id="userform-senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!editingUser}
              minLength={6}
              autoComplete="new-password"
              placeholder={editingUser ? 'Deixe em branco para manter a atual' : '••••••••'}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="userform-nivel-de-acesso" className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
              Nível de Acesso
            </label>
            <Field id="userform-nivel-de-acesso"
              as="select"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="ADMIN">Administrador</option>
              <option value="OPERADOR">Operador</option>
            </Field>
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit">{editingUser ? 'Atualizar' : 'Cadastrar'}</Button>
          {editingUser && (
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserForm;
