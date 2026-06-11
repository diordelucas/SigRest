import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Truck, 
  BarChart3, 
  LogOut,
  Tags,
  Archive,
  ArrowDownToLine,
  ChefHat,
  Wallet,
  DollarSign,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { signOut } = useAuth();
  
  const menuSections = [
    {
      title: 'Principal',
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
        { icon: <BarChart3 size={20} />, label: 'Relatórios', path: '/reports' },
      ]
    },
    {
      title: 'Cadastros',
      items: [
        { icon: <Users size={20} />, label: 'Pessoas', path: '/pessoa' },
        { icon: <Package size={20} />, label: 'Produtos', path: '/produto' },
        { icon: <Tags size={20} />, label: 'Categorias', path: '/categoria' },
        { icon: <Truck size={20} />, label: 'Fornecedores', path: '/fornecedor' },
        { icon: <ShieldCheck size={20} />, label: 'Usuários', path: '/usuario' },
      ]
    },
    {
      title: 'Movimentações',
      items: [
        { icon: <ShoppingCart size={20} />, label: 'Registrar Venda', path: '/sales/new' },
        { icon: <ShoppingCart size={20} />, label: 'Lista de Vendas', path: '/sales' },
        { icon: <ArrowDownToLine size={20} />, label: 'Compras', path: '/purchases' },
        { icon: <Archive size={20} />, label: 'Movimentação Estoque', path: '/stock-movements' },
      ]
    },
    {
      title: 'Produção',
      items: [
        { icon: <ChefHat size={20} />, label: 'Fichas Técnicas', path: '/technical-sheets' },
        { icon: <ChefHat size={20} />, label: 'Ordens de Produção', path: '/production-orders' },
      ]
    },
    {
      title: 'Financeiro',
      items: [
        { icon: <Wallet size={20} />, label: 'Controle de Caixa', path: '/cash-registers' },
        { icon: <Wallet size={20} />, label: 'Histórico de Caixa', path: '/cash-registers/history' },
        { icon: <DollarSign size={20} />, label: 'Contas a Pagar', path: '/accounts-payable' },
        { icon: <DollarSign size={20} />, label: 'Contas a Receber', path: '/accounts-receivable' },
      ]
    }
  ];

  return (
    <aside className="flex flex-col h-full bg-dark-lighter border-r border-dark-border w-64 select-none">
      {/* Brand Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-dark-border/50 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
          <ShoppingCart size={18} className="text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">SigRest<span className="text-primary-500">Gestão</span></h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-dark-border">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-lg shadow-primary-500/5' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="transition-transform duration-200 group-hover:scale-110">
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer Area */}
      <div className="p-4 border-t border-dark-border/50 shrink-0">
        <button 
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors font-medium group"
        >
          <LogOut size={20} className="text-slate-500 group-hover:text-rose-400 transition-colors" />
          <span>Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
