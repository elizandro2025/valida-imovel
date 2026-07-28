import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import { MatriculaAnalysis } from "./pages/MatriculaAnalysis";
import { AuthPage } from "./pages/AuthPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import LandingPage from "./pages/LandingPage";
import PixPaymentPage from "./pages/PixPaymentPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Autenticação temporariamente desativada em todas as rotas
const App = () => (
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
            {/* Rotas abertas sem autenticação */}
            <Route path="/app" element={<MatriculaAnalysis />} />
            <Route path="/admin" element={<AdminDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
