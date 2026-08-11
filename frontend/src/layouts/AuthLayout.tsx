import React from 'react';
import { Outlet } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import ThemeSwitcher from '../components/ThemeSwitcher';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-canvas w-full flex text-ink">
      <div className="absolute top-4 right-4 z-10">
        <ThemeSwitcher />
      </div>

      <div className="hidden lg:flex flex-1 relative bg-surface items-center justify-center overflow-hidden border-r border-line">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent z-0"></div>
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-primary-400/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center max-w-lg text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-xl shadow-primary-500/20 mb-8">
            <ShoppingCart size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-ink mb-4">
            Bem-vindo ao <br />
            SigRest<span className="text-primary-500">Gestão</span>
          </h1>
          <p className="text-lg text-ink-muted">
            A solução completa para o controle de vendas, caixa, estoque e produção do seu negócio gastronômico.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-[480px] xl:w-[540px] flex flex-col items-center justify-center p-8 bg-canvas relative">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden items-center justify-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <ShoppingCart size={20} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-ink">
              SigRest<span className="text-primary-500">Gestão</span>
            </h2>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
