import React from 'react';

type PageModule = { default: React.ComponentType };

export type LazyPage = React.FC & { preload: () => Promise<void> };

/**
 * React.lazy com pré-carregamento: se o código da página já foi baixado (preload), renderiza direto, sem passar
 * pelo indicador de carregamento. Usado para que as páginas pré-renderizadas não "pisquem" ao iniciar o React.
 */
export function lazyPage(factory: () => Promise<PageModule>): LazyPage {
  let loaded: React.ComponentType | null = null;
  const load = () => factory().then(module => { loaded = module.default; return module; });
  const Lazy = React.lazy(load);

  const Page: React.FC = () => React.createElement(loaded ?? Lazy);
  return Object.assign(Page, {
    preload: () => (loaded ? Promise.resolve() : load().then(() => undefined)),
  });
}
