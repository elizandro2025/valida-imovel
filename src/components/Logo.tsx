import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

// Marca ValidaImóvel: ícone azul arredondado + nome em seminegrito (usada em todos os cabeçalhos)
export const Logo: React.FC<{ to?: string; className?: string }> = ({ to = '/', className = '' }) => (
  <Link to={to} className={`flex items-center gap-2 shrink-0 py-2 -my-2 ${className}`} aria-label="ValidaImóvel — início">
    <span className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center">
      <ShieldCheck className="w-4 h-4" strokeWidth={2.25} />
    </span>
    <span className="text-[17px] font-semibold tracking-tight text-foreground">ValidaImóvel</span>
  </Link>
);
