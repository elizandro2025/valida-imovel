import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';

const LANDING_NAV = [
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#recursos', label: 'Recursos' },
  { href: '#para-quem', label: 'Para quem' },
  { href: '#preco', label: 'Preço' },
  { href: '#duvidas', label: 'Dúvidas' },
];

interface LandingHeaderProps {
  ctaPath: string;
  ctaLabel: string;
  userEmail: string | null;
  onSignOut: () => void;
}

// Cabeçalho fixo da página inicial; no celular, os atalhos das seções ficam num menu
export const LandingHeader: React.FC<LandingHeaderProps> = ({ ctaPath, ctaLabel, userEmail, onSignOut }) => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-x-0 border-t-0 w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
        <Logo />
        <nav className="flex items-center gap-0.5 sm:gap-1 shrink-0" aria-label="Principal">
          {LANDING_NAV.map(item => (
            <a key={item.href} href={item.href} className="hidden lg:inline-flex text-[13px] text-foreground/80 hover:text-foreground px-3 py-3">{item.label}</a>
          ))}
          <Link to="/guia" className="hidden lg:inline-flex text-[13px] text-foreground/80 hover:text-foreground px-3 py-3">Guias</Link>
          {userEmail ? (
            <button onClick={onSignOut} className="text-[13px] text-foreground/80 hover:text-foreground px-3 py-3 inline-flex items-center gap-1.5" title={`Sair (${userEmail})`} aria-label="Sair da conta">
              <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sair</span>
            </button>
          ) : (
            <Link to="/auth?tab=login" className="text-[13px] text-foreground/80 hover:text-foreground px-3 py-3">Entrar</Link>
          )}
          <Link to={ctaPath}><Button size="sm">{ctaLabel}</Button></Link>
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 -mr-2 text-foreground"
            aria-expanded={open}
            aria-controls="menu-secoes"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setOpen(v => !v)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </div>
      <div id="menu-secoes" hidden={!open} className="lg:hidden border-t border-border bg-card/95">
        <ul className="max-w-6xl mx-auto px-4 sm:px-6 py-2 grid grid-cols-2 gap-x-4">
          {LANDING_NAV.map(item => (
            <li key={item.href}>
              <a href={item.href} onClick={() => setOpen(false)} className="block py-3 text-[15px] text-foreground">{item.label}</a>
            </li>
          ))}
          <li><Link to="/guia" className="block py-3 text-[15px] text-foreground">Guias</Link></li>
        </ul>
      </div>
    </header>
  );
};
