import React from 'react';

/**
 * Visual tag for a product category (tipo de produto).
 * Known types get intuitive colors; any other category gets a stable color
 * derived from its name, so the same category always looks the same.
 */

const KNOWN_COLORS = {
  'insumo': 'bg-blue-100 text-blue-800',
  'marmita': 'bg-amber-100 text-amber-800',
  'produto pronto': 'bg-green-100 text-green-800',
  'promoção': 'bg-pink-100 text-pink-800',
  'promocao': 'bg-pink-100 text-pink-800',
};

const PALETTE = [
  'bg-indigo-100 text-indigo-800',
  'bg-purple-100 text-purple-800',
  'bg-teal-100 text-teal-800',
  'bg-cyan-100 text-cyan-800',
  'bg-rose-100 text-rose-800',
  'bg-slate-100 text-slate-700',
];

const colorForCategory = (name) => {
  const key = name.trim().toLowerCase();
  if (KNOWN_COLORS[key]) return KNOWN_COLORS[key];
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

const CategoryTag = ({ name, className = '' }) => {
  if (!name) {
    return <span className="text-slate-300 text-xs">—</span>;
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorForCategory(name)} ${className}`}>
      {name}
    </span>
  );
};

export default CategoryTag;