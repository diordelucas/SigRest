import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Person, Product, Supplier } from '../types';

interface PageLink {
  label: string;
  path: string;
  adminOnly?: boolean;
}

const PAGES: PageLink[] = [
  { label: 'Dashboard', path: '/dashboard', adminOnly: true },
  { label: 'Relatórios', path: '/reports', adminOnly: true },
  { label: 'Clientes', path: '/people' },
  { label: 'Produtos', path: '/products' },
  { label: 'Categorias', path: '/categories' },
  { label: 'Fornecedores', path: '/suppliers' },
  { label: 'Nova Venda', path: '/sales/new' },
  { label: 'Histórico de Vendas', path: '/sales' },
  { label: 'Nova Compra', path: '/purchases/new' },
  { label: 'Compras', path: '/purchases' },
  { label: 'Movimentações de Estoque', path: '/stock-movements' },
  { label: 'Fichas Técnicas', path: '/technical-sheets' },
  { label: 'Ordens de Produção', path: '/production-orders' },
  { label: 'Controle de Caixa', path: '/cash-registers', adminOnly: true },
  { label: 'Histórico de Caixa', path: '/cash-registers/history', adminOnly: true },
  { label: 'Contas a Pagar', path: '/accounts-payable', adminOnly: true },
  { label: 'Contas a Receber', path: '/accounts-receivable', adminOnly: true },
  { label: 'Usuários', path: '/users', adminOnly: true },
];

interface Result {
  group: string;
  label: string;
  path: string;
}

const MAX_PER_GROUP = 5;

/** Busca telas e cadastros. Os cadastros são carregados na primeira vez que o campo recebe foco. */
const GlobalSearch = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';
  const containerRef = useRef<HTMLDivElement>(null);
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    setOpen(true);
    if (loaded) return;
    setLoaded(true);
    const [productsRes, peopleRes, suppliersRes] = await Promise.allSettled([
      api.get<Product[]>('/product'),
      api.get<Person[]>('/person'),
      api.get<Supplier[]>('/supplier'),
    ]);
    if (productsRes.status === 'fulfilled') setProducts(productsRes.value.data);
    if (peopleRes.status === 'fulfilled') setPeople(peopleRes.value.data);
    if (suppliersRes.status === 'fulfilled') setSuppliers(suppliersRes.value.data);
  };

  const results = useMemo<Result[]>(() => {
    const q = term.trim().toLowerCase();
    if (!q) return [];
    const matches = (...values: (string | null | undefined)[]) => values.some((v) => (v ?? '').toLowerCase().includes(q));
    return [
      ...PAGES.filter((p) => (!p.adminOnly || isAdmin) && matches(p.label))
        .slice(0, MAX_PER_GROUP)
        .map((p) => ({ group: 'Telas', label: p.label, path: p.path })),
      ...products
        .filter((p) => matches(p.name, p.code))
        .slice(0, MAX_PER_GROUP)
        .map((p) => ({ group: 'Produtos', label: p.name, path: `/products?q=${encodeURIComponent(p.name)}` })),
      ...people
        .filter((p) => matches(p.name, p.email))
        .slice(0, MAX_PER_GROUP)
        .map((p) => ({ group: 'Clientes', label: p.name, path: `/people?q=${encodeURIComponent(p.name)}` })),
      ...suppliers
        .filter((s) => matches(s.name))
        .slice(0, MAX_PER_GROUP)
        .map((s) => ({ group: 'Fornecedores', label: s.name, path: `/suppliers?q=${encodeURIComponent(s.name)}` })),
    ];
  }, [term, products, people, suppliers, isAdmin]);

  const goTo = (result: Result) => {
    setTerm('');
    setOpen(false);
    setMobileOpen(false);
    navigate(result.path);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && results.length > 0) {
      goTo(results[0]);
    } else if (event.key === 'Escape') {
      setOpen(false);
      setMobileOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="sm:relative">
      <button
        type="button"
        aria-label="Abrir busca"
        className="sm:hidden p-2 text-ink-muted hover:text-ink rounded-full hover:bg-surface-2"
        onClick={() => setMobileOpen((v) => !v)}
      >
        {mobileOpen ? <X size={20} /> : <Search size={20} />}
      </button>

      <div
        className={`${
          mobileOpen ? 'flex absolute left-0 right-0 top-16 z-50 mx-4' : 'hidden'
        } sm:flex sm:static sm:mx-0 items-center gap-2 bg-surface-2 px-4 py-2 rounded-full border border-line`}
      >
        <Search size={18} className="text-ink-muted shrink-0" />
        <input
          type="text"
          aria-label="Buscar em todo o sistema"
          placeholder="Buscar em todo o sistema..."
          className="bg-transparent border-none outline-none text-sm w-full sm:w-48 lg:w-64 placeholder:text-ink-muted text-ink"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={loadData}
          onKeyDown={handleKeyDown}
        />
      </div>

      {open && term.trim() && (
        <div className="absolute left-4 right-4 sm:left-auto sm:right-0 top-[7.25rem] sm:top-full sm:mt-2 sm:w-80 card overflow-hidden z-50">
          {results.length === 0 ? (
            <p className="p-4 text-sm text-ink-muted text-center">Nada encontrado para "{term}".</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {results.map((result, index) => (
                <li key={`${result.group}-${result.path}`}>
                  {(index === 0 || results[index - 1].group !== result.group) && (
                    <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-ink-muted uppercase tracking-wider">
                      {result.group}
                    </p>
                  )}
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-surface-2 transition-colors"
                    onClick={() => goTo(result)}
                  >
                    {result.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
