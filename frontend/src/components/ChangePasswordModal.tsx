import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../services/api';
import Field from './ui/Field';
import Modal from './ui/Modal';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const MIN_LENGTH = 6;

const ChangePasswordModal = ({ open, onClose }: ChangePasswordModalProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const close = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmation('');
    setError('');
    onClose();
  };

  const handleSave = async () => {
    if (saving) return;
    if (!currentPassword || !newPassword) {
      setError('Informe a senha atual e a nova senha.');
      return;
    }
    if (newPassword.length < MIN_LENGTH) {
      setError(`A nova senha deve ter ao menos ${MIN_LENGTH} caracteres.`);
      return;
    }
    if (newPassword !== confirmation) {
      setError('A confirmação não confere com a nova senha.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.put('/user/me/password', { currentPassword, newPassword });
      toast.success('Senha alterada com sucesso!');
      close();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao alterar a senha.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Alterar senha"
      confirmLabel={saving ? 'Salvando...' : 'Salvar'}
      onCancel={close}
      onConfirm={handleSave}
    >
      {error && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-sm">{error}</div>
      )}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="current-password" className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
            Senha atual
          </label>
          <Field
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="new-password" className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
            Nova senha
          </label>
          <Field
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="confirm-password" className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
            Confirmar nova senha
          </label>
          <Field
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;
