import React from 'react';

/**
 * Tag visual para categoria/tipo de produto. Categorias conhecidas ganham
 * cores intuitivas; qualquer outra recebe uma cor estável derivada do nome,
 * para que a mesma categoria sempre pareça igual.
 */

const KNOWN_COLORS: Record<string, string> = {
  insumo: 'bg-blue-100 text-blue-800',
  marmita: 'bg-amber-100 text-amber-800',
  'produto pronto': 'bg-green-100 text-green-800',
  promoção: 'bg-pink-100 text-pink-800',
  promocao: 'bg-pink-100 text-pink-800',
};

const PALETTE = [
  'bg-indigo-100 text-indigo-800',
  'bg-purple-100 text-purple-800',
  'bg-teal-100 text-teal-800',
  'bg-cyan-100 text-cyan-800',
  'bg-rose-100 text-rose-800',
  'bg-slate-100 text-slate-700',
];

const colorForCategory = (name: string): string => {
  const key = name.trim().toLowerCase();
  if (KNOWN_COLORS[key]) return KNOWN_COLORS[key];
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

interface CategoryTagProps {
  name?: string | null;
  className?: string;
}

const CategoryTag = ({ name, className = '' }: CategoryTagProps) => {
  if (!name) {
    return <span className="text-ink-muted text-xs">—</span>;
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorForCategory(name)} ${className}`}
    >
      {name}
    </span>
  );
};

export default CategoryTag;
