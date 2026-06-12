import React, { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center sm:text-left">
        <h2 className="text-2xl font-bold text-white tracking-tight">Acesse sua conta</h2>
        <p className="text-slate-400 mt-2 text-sm font-medium">Insira suas credenciais para entrar no sistema SigRest.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-300">E-mail</label>
          <input
            type="email"
            data-testid="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border-white/10 text-white px-4 py-3 rounded-xl border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
            placeholder="admin@sigrest.com"
            required
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-300">Senha</label>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              data-testid="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border-white/10 text-white px-4 py-3 rounded-xl border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none pr-12"
              placeholder="••••••••"
              required
            />
            <button 
              type="button" 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          data-testid="login-submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-primary-500 to-amber-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Entrando...' : <><LogIn size={20} /> Entrar no Sistema</>}
        </button>
      </form>
      
      <div className="mt-8 pt-6 border-t border-white/10 text-center">
        <p className="text-xs text-slate-500">Desenvolvido por George Manganelli (2026)</p>
      </div>
    </div>
  );
}
