/**
 * Cloudflare Worker — repassa api.validaimovel.com para a Payment API
 *
 * A Payment API (workers/payment-api) continua publicada na conta Cloudflare antiga.
 * Este Worker fica na conta nova (dona do domínio) e encaminha todas as rotas
 * (/api/create-payment, /api/payment-status/:id, /api/webhook/mercado-pago...) sem alterá-las.
 */

const UPSTREAM = 'https://validaimovel-payment-api.validaimovel.workers.dev';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    return fetch(new Request(UPSTREAM + url.pathname + url.search, request));
  },
};
