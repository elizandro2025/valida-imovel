import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { getWhatsAppLink, WHATSAPP_MESSAGE, WHATSAPP_NUMBER } from '@/utils/whatsappUtils';
import { GUIDES } from '@/content/guides';
import { COMPANY_CONFIG } from '@/config/companyConfig';

// Rodapé das páginas públicas: liga todos os guias e páginas legais (ajuda buscadores a descobrir o conteúdo)
export const SiteFooter: React.FC = () => (
  <footer className="bg-background border-t border-border px-4 sm:px-6 lg:px-8 pt-12 pb-24 sm:pb-12 text-sm">
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1 space-y-3">
          <Logo />
          <p className="text-muted-foreground text-xs leading-relaxed max-w-xs">
            Análise de matrícula de imóvel com inteligência artificial: dono atual, ônus, penhoras e nota de risco, com o trecho que comprova cada ponto.
          </p>
        </div>
        <nav aria-label="Guias" className="space-y-2">
          <p className="font-semibold text-foreground text-xs">Guias</p>
          <ul className="text-xs text-muted-foreground">
            {GUIDES.map(g => (
              <li key={g.slug}><Link to={`/guia/${g.slug}`} className="hover:text-foreground inline-block py-2.5">{g.shortTitle}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Produto" className="space-y-2">
          <p className="font-semibold text-foreground text-xs">Produto</p>
          <ul className="text-xs text-muted-foreground">
            <li><Link to="/app?sample=safe" className="hover:text-foreground inline-block py-2.5">Exemplo de relatório</Link></li>
            <li><Link to="/app?sample=risk" className="hover:text-foreground inline-block py-2.5">Exemplo com risco</Link></li>
            <li><Link to="/#preco" className="hover:text-foreground inline-block py-2.5">Preço</Link></li>
            <li><Link to="/auth?tab=register" className="hover:text-foreground inline-block py-2.5">Criar conta</Link></li>
            <li><Link to="/auth?tab=login" className="hover:text-foreground inline-block py-2.5">Entrar</Link></li>
          </ul>
        </nav>
        <nav aria-label="Empresa" className="space-y-2">
          <p className="font-semibold text-foreground text-xs">Empresa</p>
          <ul className="text-xs text-muted-foreground">
            <li><Link to="/termos" className="hover:text-foreground inline-block py-2.5">Termos de uso</Link></li>
            <li><Link to="/privacidade" className="hover:text-foreground inline-block py-2.5">Privacidade</Link></li>
            <li><a href={COMPANY_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground inline-block py-2.5">Instagram {COMPANY_CONFIG.instagramHandle}</a></li>
            <li><a href={getWhatsAppLink(WHATSAPP_NUMBER, WHATSAPP_MESSAGE)} target="_blank" rel="noopener noreferrer" className="hover:text-foreground inline-block py-2.5">Suporte no WhatsApp</a></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-border pt-6 text-xs text-muted-foreground space-y-2">
        <p>
          Análise automatizada a partir do PDF enviado pelo usuário. O {COMPANY_CONFIG.name} não consulta cartórios em tempo real, não emite
          certidões e não substitui a certidão atualizada nem a orientação de um advogado.
        </p>
        <p>© {new Date().getFullYear()} {COMPANY_CONFIG.legalName}.</p>
      </div>
    </div>
  </footer>
);

// Cabeçalho simples das páginas de conteúdo
export const PublicHeader: React.FC = () => (
  <header className="sticky top-0 z-50 glass border-x-0 border-t-0">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
      <Logo />
      <nav className="flex items-center gap-1 sm:gap-2" aria-label="Principal">
        <Link to="/guia" className="hidden sm:inline-flex text-[13px] text-foreground/80 hover:text-foreground px-3 py-3">Guias</Link>
        <Link to="/app?sample=safe" className="hidden md:inline-flex text-[13px] text-foreground/80 hover:text-foreground px-3 py-3">Exemplo</Link>
        <Link to="/auth?tab=login" className="text-[13px] text-foreground/80 hover:text-foreground px-3 py-3">Entrar</Link>
        <Link to="/auth?tab=register"><Button size="sm">Criar conta</Button></Link>
      </nav>
    </div>
  </header>
);

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col">
    <PublicHeader />
    <div className="flex-1">{children}</div>
    <SiteFooter />
  </div>
);
