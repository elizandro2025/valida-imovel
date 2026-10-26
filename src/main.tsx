import { createRoot, hydrateRoot } from 'react-dom/client'
import App, { preloadRoute } from './App.tsx'
import './index.css'
import { installGlobalErrorReporting } from './services/errorReporting'
import { ocrCacheService } from './services/ocrCacheService'

installGlobalErrorReporting();
// As análises não são guardadas: apaga relatórios que versões anteriores deixaram no navegador
ocrCacheService.clearCache();

const root = document.getElementById("root")!;
if (root.hasChildNodes()) {
  // Página pré-renderizada: baixa o código da rota e o React aproveita o HTML que já está na tela,
  // sem apagar e redesenhar a página (que atrasava o primeiro conteúdo e repetia todo o layout).
  preloadRoute(window.location.pathname).catch(() => undefined).then(() => hydrateRoot(root, <App />));
} else {
  createRoot(root).render(<App />);
}
