import { useLocation, Link } from 'react-router-dom';
import { FileCheck, ArrowLeft, FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/Logo';
import { usePageMeta } from '@/hooks/usePageMeta';

const NotFound = () => {
  const location = useLocation();
  usePageMeta('Página não encontrada', location.pathname, undefined, { noindex: true });

  return (
    <div className="min-h-screen bg-secondary flex flex-col antialiased">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 sm:px-6 h-16 flex items-center">
        <Logo />
      </header>

      {/* 404 Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto rounded-3xl bg-secondary border border-border flex items-center justify-center">
            <FileSearch className="w-12 h-12 text-muted-foreground stroke-[1.5]" />
          </div>

          {/* Badge */}
          <Badge variant="outline" className="border-border text-muted-foreground text-xs font-semibold">
            Página não encontrada
          </Badge>

          {/* 404 number */}
          <div>
            <h1 className="text-7xl sm:text-9xl font-semibold text-foreground tracking-tight leading-none select-none">
              404
            </h1>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-2 tracking-tight">
              Ops! Esta página não existe.
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              O endereço <code className="text-xs bg-secondary text-muted-foreground px-1.5 py-0.5 rounded font-mono">{location.pathname}</code> não foi encontrado. Pode ter sido removido ou o link está incorreto.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/">
              <Button className="font-medium gap-2 px-6">
                <ArrowLeft className="w-4 h-4" /> Voltar para Home
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" className="border-border text-muted-foreground hover:text-foreground font-semibold gap-2 px-6">
                Acessar Plataforma
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
