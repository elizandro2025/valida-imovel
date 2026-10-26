/**
 * Configurações Institucionais e Legais do ValidaImóvel
 * Centraliza os dados corporativos para exibição nos Termos, Privacidade e Rodapé.
 */

// Único e-mail que recebe mensagens (o domínio validaimovel.com não tem caixa de entrada)
const EMAIL = "validaimovel@gmail.com";

export const COMPANY_CONFIG = {
  name: "ValidaImóvel",
  legalName: "ValidaImóvel Tecnologia e Inteligência Registral",
  tagline: "Copiloto de análise registral e due diligence imobiliária com inteligência artificial",
  contactEmail: EMAIL,
  supportEmail: EMAIL,
  domain: "validaimovel.com",
  canonicalUrl: "https://validaimovel.com/",
  // Data da última revisão dos Termos e da Política de Privacidade (atualizar ao mudar o texto)
  legalUpdatedAt: "26/10/2026",
  instagramUrl: "https://www.instagram.com/valida.imovel/",
  instagramHandle: "@valida.imovel",
  
  // Detalhes da oferta (o preço cobrado de fato é definido no servidor: workers/payment-api)
  offer: {
    planName: "Plano mensal",
    priceFormatted: "R$ 99,90",
    priceValue: 99.9,
    period: "30 dias",
    durationDays: 30,
    // Uso justo: mesmo limite aplicado no servidor (DAILY_LIMITS.analise)
    fairUseDailyLimit: 30,
    paymentMethods: "Pix ou cartão",
    guaranteeDays: 7,
  },

  // Políticas de Retenção e Segurança de Dados
  dataPolicy: {
    securityStatement: "Conexão protegida por HTTPS/TLS e tratamento dos documentos conforme as práticas descritas na Política de Privacidade.",
    // false = plano pago da API Gemini (projeto com faturamento): o Google não usa o conteúdo para melhorar seus produtos.
    // Voltar para true se a chave do servidor passar a ser de um projeto sem faturamento (plano gratuito).
    aiProviderMayUseContent: false,
    deletionRequest: `A solicitação de exclusão definitiva dos seus dados pode ser enviada a qualquer momento para ${EMAIL} ou via WhatsApp de suporte.`,
  }
};
