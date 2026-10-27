import React, { Component, ReactNode, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, RefreshCcw, Loader2 } from "lucide-react";
import { ProtectedRoute as AdminGuard } from "@/components/ProtectedRoute";
import { reportClientError } from "@/services/errorReporting";
import { lazyPage } from "@/lib/lazyPage";

// A página inicial vem no pacote principal; as demais telas (com relatório e gerador de PDF) carregam sob demanda
const MatriculaAnalysis = lazyPage(() => import("./pages/MatriculaAnalysis"));
const AuthPage = lazyPage(() => import("./pages/AuthPage"));
const AdminDashboard = lazyPage(() => import("./pages/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const PixPaymentPage = lazyPage(() => import("./pages/PixPaymentPage"));
const TermsPage = lazyPage(() => import("./pages/TermsPage"));
const PrivacyPage = lazyPage(() => import("./pages/PrivacyPage"));
const GuidesIndexPage = lazyPage(() => import("./pages/GuidesIndexPage"));
const GuidePage = lazyPage(() => import("./pages/GuidePage"));
const NotFound = lazyPage(() => import("./pages/NotFound"));

// Páginas que chegam pré-renderizadas: o código delas é baixado antes de o React assumir a tela (ver main.tsx)
export function preloadRoute(pathname: string): Promise<void> {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return Promise.resolve();
  if (path === '/guia') return GuidesIndexPage.preload();
  if (path.startsWith('/guia/')) return GuidePage.preload();
  if (path === '/termos') return TermsPage.preload();
  if (path === '/privacidade') return PrivacyPage.preload();
  return Promise.resolve();
}

interface GlobalErrorBoundaryProps {
  children: ReactNode;
}
interface GlobalErrorBoundaryState {
  hasError: boolean;
}

class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
  public state: GlobalErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): GlobalErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Erro não tratado na interface:", error, errorInfo);
    reportClientError(error, `render: ${errorInfo.componentStack?.split("\n")[1]?.trim() ?? ""}`);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-card border border-border p-6 text-center space-y-4 rounded-3xl shadow-medium">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-warning/10 text-warning flex items-center justify-center">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Algo deu errado nesta tela</h2>
            <p className="text-xs text-muted-foreground">
              O erro foi registrado para correção. Recarregue a página para continuar.
            </p>
            <Button onClick={() => window.location.reload()} className="w-full gap-2">
              <RefreshCcw className="w-3.5 h-3.5" /> Recarregar
            </Button>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

const PageFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" aria-label="Carregando" />
  </div>
);

/**
 * Rota protegida — exige login e assinatura ativa para o workspace (matrícula e conferência de projetos).
 * Exceção: as demonstrações públicas com dados fictícios (?sample=safe|risk para matrícula, ?sample=desdobro|projeto
 * para projetos). A IA continua exigindo login e assinatura no servidor.
 */
const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const isSampleDemo = ['safe', 'risk', 'true', 'desdobro', 'projeto'].includes(params.get('sample') || '');

  if (isLoading) return <PageFallback />;

  if (!user && !isSampleDemo) {
    return <Navigate to="/auth?tab=register" state={{ from: location }} replace />;
  }

  if (user && !user.hasSubscription && !isSampleDemo) {
    return <Navigate to="/pagamento" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <GlobalErrorBoundary>
    <AuthProvider>
      <Toaster />
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/demo" element={<Navigate to="/app?sample=safe" replace />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/pagamento-pix" element={<PixPaymentPage />} />
            <Route path="/pagamento" element={<PixPaymentPage />} />
            <Route path="/termos" element={<TermsPage />} />
            <Route path="/privacidade" element={<PrivacyPage />} />
            <Route path="/guia" element={<GuidesIndexPage />} />
            <Route path="/guia/:slug" element={<GuidePage />} />
            {/* Exige login e assinatura, exceto as demonstrações públicas (?sample=...) */}
            <Route path="/app" element={<ProtectedRoute><MatriculaAnalysis /></ProtectedRoute>} />
            <Route path="/projeto" element={<Navigate to="/app?modulo=projeto" replace />} />
            <Route path="/projetos" element={<Navigate to="/app?modulo=projeto" replace />} />
            {/* Painel admin — exige login real com papel de administrador (o servidor confere de novo) */}
            <Route path="/admin" element={<AdminGuard requireAdmin><AdminDashboard /></AdminGuard>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  </GlobalErrorBoundary>
);

export default App;
