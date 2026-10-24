import { createRoot } from 'react-dom/client'
import App, { preloadRoute } from './App.tsx'
import './index.css'
import { installGlobalErrorReporting } from './services/errorReporting'

installGlobalErrorReporting();

// Páginas pré-renderizadas já chegam com conteúdo: baixa o código da rota antes de montar o React,
// para trocar o HTML estático pelo app sem mostrar o indicador de carregamento.
const root = document.getElementById("root")!;
const ready = root.hasChildNodes() ? preloadRoute(window.location.pathname).catch(() => undefined) : Promise.resolve();
ready.then(() => createRoot(root).render(<App />));
