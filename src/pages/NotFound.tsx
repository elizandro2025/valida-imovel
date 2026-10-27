import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft, FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PublicLayout } from '@/components/PublicLayout';
import { usePageMeta } from '@/hooks/usePageMeta';

const NotFound: React.FC = () => {
  const location = useLocation();
  usePageMeta('Página não encontrada', location.pathname, undefined, { noindex: true });

  return (
    <PublicLayout>
      <main className="max-w-3xl mx-auto px-4 py-16 sm:py-24 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md w-full">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-secondary border border-border flex items-center justify-center">
            <FileSearch className="w-10 h-10 text-muted-foreground stroke-[1.5]" />
          </div>

          <Badge variant="outline" className="border-border text-muted-foreground text-xs font-semibold">
            Página não encontrada
          </Badge>

          <div className="space-y-2">
            <h1 className="text-6xl sm:text-7xl font-semibold text-foreground tracking-tight leading-none select-none">
              404
            </h1>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
              Ops! Esta página não existe.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O endereço <code className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-md font-mono">{location.pathname}</code> não foi encontrado ou foi movido.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto gap-2">
                <ArrowLeft className="w-4 h-4" /> Voltar ao início
              </Button>
            </Link>
            <Link to="/app" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                Acessar o sistema
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </PublicLayout>
  );
};

export default NotFound;

