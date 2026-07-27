import { useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { FileCheck, ArrowLeft, FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 h-16 flex items-center">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:bg-emerald-700 transition-colors">
            <FileCheck className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            Valida<span className="text-emerald-600">Imóvel</span>
          </span>
        </Link>
      </header>

      {/* 404 Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center">
            <FileSearch className="w-12 h-12 text-slate-400 stroke-[1.5]" />
          </div>

          {/* Badge */}
          <Badge variant="outline" className="border-slate-300 text-slate-500 text-xs font-semibold">
            Página não encontrada
          </Badge>

          {/* 404 number */}
          <div>
            <h1 className="text-7xl sm:text-9xl font-black text-slate-200 tracking-tight leading-none select-none">
              404
            </h1>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
              Ops! Esta página não existe.
            </h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              O endereço <code className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">{location.pathname}</code> não foi encontrado. Pode ter sido removido ou o link está incorreto.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 gap-2 px-6">
                <ArrowLeft className="w-4 h-4" /> Voltar para Home
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" className="border-slate-200 text-slate-600 hover:text-slate-900 font-semibold rounded-xl gap-2 px-6">
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
