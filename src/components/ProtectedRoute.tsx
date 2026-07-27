import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireSubscription = false,
  requireAdmin = false 
}) => {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md text-center space-y-6 p-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Acesso Restrito
            </h1>
            <p className="text-muted-foreground">
              Esta área é restrita a administradores.
            </p>
          </div>
          <div className="space-y-4">
            <button 
              onClick={() => window.history.back()}
              className="w-full border border-border text-foreground px-6 py-3 rounded-lg font-medium hover:bg-accent transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (requireSubscription && !user.hasSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="text-center space-y-8">
            {/* Hero Section */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="w-10 h-10 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                Desbloqueie o Poder Completo
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Acesse nossa plataforma de análise profissional de matrículas imobiliárias
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-6 my-12">
              <div className="bg-card border rounded-xl p-6 text-left">
                <CheckCircle className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  Análise Automatizada
                </h3>
                <p className="text-sm text-muted-foreground">
                  IA especializada processa documentos complexos em segundos
                </p>
              </div>
              
              <div className="bg-card border rounded-xl p-6 text-left">
                <CheckCircle className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  Relatórios Profissionais
                </h3>
                <p className="text-sm text-muted-foreground">
                  Documentos PDF formatados e prontos para apresentação
                </p>
              </div>
              
              <div className="bg-card border rounded-xl p-6 text-left">
                <CheckCircle className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  Interface Intuitiva
                </h3>
                <p className="text-sm text-muted-foreground">
                  Plataforma simples de usar, sem necessidade de treinamento
                </p>
              </div>
              
              <div className="bg-card border rounded-xl p-6 text-left">
                <CheckCircle className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  Suporte Especializado
                </h3>
                <p className="text-sm text-muted-foreground">
                  Equipe técnica pronta para ajudar com qualquer dúvida
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Comece sua assinatura hoje
              </h2>
              <p className="text-muted-foreground mb-6">
                Transforme sua análise de documentos imobiliários com nossa tecnologia avançada
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="px-8 py-3 text-base font-medium group"
                  onClick={() => window.location.href = '/pagamento-pix'}
                >
                  Assinar Agora
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-8 py-3 text-base"
                  onClick={() => window.history.back()}
                >
                  Voltar
                </Button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 border-t border-border">
              <p className="text-xs text-muted-foreground mb-4">
                Mais de 1.000+ profissionais confiam em nossa plataforma
              </p>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="text-xs font-medium">✓ Seguro</div>
                <div className="text-xs font-medium">✓ Confiável</div>
                <div className="text-xs font-medium">✓ Rápido</div>
                <div className="text-xs font-medium">✓ Preciso</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};