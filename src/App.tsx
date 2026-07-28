import React, { Component, ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import { MatriculaAnalysis } from "./pages/MatriculaAnalysis";
import { AuthPage } from "./pages/AuthPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import LandingPage from "./pages/LandingPage";
import PixPaymentPage from "./pages/PixPaymentPage";
import NotFound from "./pages/NotFound";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, RefreshCcw } from "lucide-react";

interface GlobalErrorBoundaryProps {
  children: ReactNode;
}
interface GlobalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
  public state: GlobalErrorBoundaryState = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): GlobalErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("🔥 Global Error Boundary capturou exceção:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-slate-900 border border-slate-800 p-6 text-center space-y-4 rounded-3xl shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-black text-white">Falha Temporária na Exibição</h2>
            <p className="text-xs text-slate-400">
              Ocorreu uma inconsistência inesperada na renderização. Clique abaixo para reiniciar a aplicação com segurança.
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl gap-2 shadow-lg shadow-emerald-600/30"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Recarregar Aplicação
            </Button>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Rota Protegida — redireciona para /auth se o usuário não estiver logado.
 * Permite passagem livre quando há ?sample=safe (demonstração pública da Landing Page).
 */
const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Permite a demonstração pública via ?sample=safe sem precisar de login
  const params = new URLSearchParams(location.search);
  const isSampleDemo = params.get('sample') === 'safe' || params.get('sample') === 'true';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user && !isSampleDemo) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <GlobalErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/demo" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/pagamento-pix" element={<PixPaymentPage />} />
              <Route path="/pagamento" element={<PixPaymentPage />} />
              {/* Rota protegida — exige login, exceto demonstração pública (?sample=safe) */}
              <Route path="/app" element={<ProtectedRoute><MatriculaAnalysis /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </GlobalErrorBoundary>
);

export default App;
