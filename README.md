# ValidaImóvel

Análise de certidões de matrícula de imóveis com inteligência artificial: proprietários, ônus, penhoras,
cadeia dominial e nota de risco, com o trecho do documento que embasa cada ponto.
Site: https://validaimovel.com

## Arquitetura

```
Navegador (React + Vite, Cloudflare Pages)
   │  login e dados da conta ─────────────► Supabase (Auth, profiles, valida_analyses, valida_payments)
   │  PDF, etapas da análise, pagamentos ──► API — Cloudflare Worker em api.validaimovel.com
   │                                            ├─ Gemini (OCR e análise; prompts e chave só no servidor)
   │                                            ├─ Asaas (Pix e cartão; webhook ativa, renova e estorna)
   │                                            └─ Supabase (chave de serviço: assinatura, uso, pagamentos)
```

- **Fluxo da análise** (`src/services/aiService.ts`): OCR do PDF → extração + parecer (+ georreferenciamento) em
  paralelo → regras de segurança em `src/lib/reportNormalizer.ts`:
  - resposta incompleta vira erro (nunca "sem ônus");
  - ônus só conta como cancelado com o ato de cancelamento;
  - nota de risco mínima conforme os ônus ativos;
  - CPFs, atos e trechos conferidos no texto lido.
- **Leitura do relatório** (`src/lib/reportView.ts`): um só formato para a tela e o PDF, compatível com relatórios antigos.
- **API** (`workers/payment-api`): rotas fixas de IA (`/api/ai/ocr`, `/task`, `/chat`), limite diário de uso justo,
  webhook do Asaas, painel admin e registro de erros do site (Workers Logs).
- **Banco**: a migração em `supabase/migrations` cria a trava dos campos de assinatura e as tabelas `valida_*`.
  O projeto Supabase é compartilhado com o app BUPi — tudo do ValidaImóvel usa o prefixo `valida_`.

## Desenvolvimento

```sh
npm install
npm install --prefix workers/payment-api
npm run dev          # site em http://localhost:8080 (usa a API em localhost:8787)
npm run check        # lint + tipos (site e API) + testes + build — o mesmo que roda no GitHub (CI)
```

Variáveis do site (`.env`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_ADMIN_EMAILS` e, opcionalmente:
- `VITE_API_BASE_URL`: aponta a prévia para a API sandbox;
- `VITE_GOOGLE_LOGIN=true`: mostra o botão "Continuar com Google".

Os segredos ficam só no Worker: `ASAAS_API_KEY`, `ASAAS_WEBHOOK_TOKEN`, `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`.

## SEO e GEO (buscadores e assistentes de IA)

- `npm run build` = `vite build` + `scripts/prerender.mjs`. A pré-renderização:
  - abre as páginas públicas (início, `/guia`, guias, termos, privacidade) num Chrome headless e grava o HTML pronto, com título, descrição, canonical, Open Graph e JSON-LD de cada página;
  - gera `sitemap.xml`, `llms.txt` e `llms-full.txt` a partir desse conteúdo;
  - grava `spa.html` e `404.html` (o esqueleto do app, marcado como `noindex`). As telas logadas chegam a ele pelas regras de `public/_redirects`.
- A pré-renderização precisa do Chrome: use `CHROME_PATH` se ele não estiver no caminho padrão. `SKIP_PRERENDER=1` pula a etapa, só para testes locais.
- Guias: os metadados ficam em `src/content/guides/index.ts` e o texto em `src/content/guides/content.tsx`. Os testes conferem os limites de título e descrição e os links entre guias.
- Depois de publicar em produção, rode `npm run seo:indexnow` para avisar Bing, Yandex e outros buscadores das páginas novas.

## Publicação

```sh
npm run deploy:api:sandbox   # API de testes (Asaas sandbox), sem domínio próprio
npm run deploy:api           # API de produção (api.validaimovel.com)
npm run deploy:site          # verifica tudo e publica o site no Pages (branch main = validaimovel.com)
```

O build de produção não pode ter `VITE_API_BASE_URL` definida. Sempre use `wrangler@4.152.0`: o wrangler 3 local guardava
em cache a conta antiga da Cloudflare.

## Estrutura

```
src/
├── components/   relatório, histórico, conta, chat, upload
├── lib/          reportNormalizer (regras de segurança), reportView (leitura do relatório) + testes
├── pages/        landing, app, auth, pagamento, admin, termos, privacidade, guia
├── services/     aiClient/aiService (IA), historyService, paymentService, adminService, errorReporting
workers/payment-api/
├── src/index.ts  rotas da API          ├── src/prompts.ts  prompts da análise
└── test/         testes com Asaas, Supabase e Gemini simulados
supabase/migrations/   SQL para colar no SQL Editor do Supabase
docs/emails-marketing/ modelos de e-mail (fora do site público)
```
