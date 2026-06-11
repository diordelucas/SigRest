import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Search, Bell, User, Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser } = useAuth();
  
  // Low stock notification states
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const response = await api.get('/product/low-stock');
        setLowStockAlerts(response.data);
      } catch (err) {
        console.error("Erro ao buscar produtos com baixo estoque:", err);
      }
    };
    fetchLowStock();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-dark text-slate-200">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop and Mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full w-full bg-dark-lighter border-r border-dark-border">
          <Sidebar />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-dark-border bg-dark-lighter/50 px-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-semibold hidden sm:block">Painel de Gestão</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 glass-panel px-4 py-2 rounded-full border border-dark-border/50">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar em todo o sistema..." 
                className="bg-transparent border-none outline-none text-sm w-48 lg:w-64 placeholder:text-slate-500 text-slate-200"
              />
            </div>
            
            {/* Notifications Dropdown Container */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5 focus:outline-none"
              >
                <Bell size={20} />
                {lowStockAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
                    {lowStockAlerts.length}
                  </span>
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-lg shadow-xl z-50 overflow-hidden text-gray-800">
                  <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-sm">Alertas de Estoque</span>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                      {lowStockAlerts.length} {lowStockAlerts.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto">
                    {lowStockAlerts.length === 0 ? (
                      <div className="p-4 text-center flex flex-col items-center gap-2">
                        <span className="text-emerald-500 text-2xl font-bold">✓</span>
                        <p className="text-sm text-gray-500 font-semibold">Tudo certo com o estoque</p>
                      </div>
                    ) : (
                      lowStockAlerts.map((product) => (
                        <div key={product.id} className="p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex justify-between items-center text-sm">
                          <span className="font-semibold text-gray-800">{product.name}</span>
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                            Qtd: {product.storage} (mín: {product.minStorage})
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 pl-4 border-l border-dark-border">
              <div className="flex flex-col items-end hidden lg:flex">
                <span className="text-sm font-medium text-white">{currentUser?.name || "Usuário"}</span>
                <span className="text-xs text-slate-400">{currentUser?.role || "Operador"}</span>
              </div>
              <button className="w-10 h-10 rounded-full bg-primary-900/50 flex items-center justify-center border border-primary-500/30 text-primary-400 hover:bg-primary-900 transition-colors">
                <User size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
