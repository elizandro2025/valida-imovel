/**
 * Configurações Institucionais e Legais do ValidaImóvel
 * Centraliza os dados corporativos para exibição nos Termos, Privacidade e Rodapé.
 */

export const COMPANY_CONFIG = {
  name: "ValidaImóvel",
  legalName: "ValidaImóvel Tecnologia e Inteligência Registral",
  tagline: "Copiloto de análise registral e due diligence imobiliária com inteligência artificial",
  contactEmail: "contato@validaimovel.com",
  supportEmail: "suporte@validaimovel.com",
  domain: "validaimovel.com",
  canonicalUrl: "https://validaimovel.com/",
  instagramUrl: "https://www.instagram.com/valida.imovel/",
  instagramHandle: "@valida.imovel",
  
  // Detalhes da oferta (fixos e protegidos)
  offer: {
    priceFormatted: "R$ 49,90",
    originalPriceFormatted: "R$ 299,70",
    savingsFormatted: "R$ 249,80",
    period: "3 meses",
    durationDays: 90,
    unlimited: true,
    paymentMethods: "Pix ou Cartão",
    guaranteeDays: 7,
  },

  // Políticas de Retenção e Segurança de Dados
  dataPolicy: {
    securityStatement: "Conexão protegida por HTTPS/TLS e tratamento dos documentos conforme as práticas descritas na Política de Privacidade.",
    // Plano gratuito da API Gemini: o Google pode usar o conteúdo enviado para melhorar seus produtos.
    // Ao migrar para o plano pago da API, trocar para false e ajustar o texto da Política de Privacidade.
    aiProviderMayUseContent: true,
    deletionRequest: "A solicitação de exclusão definitiva dos seus dados pode ser enviada a qualquer momento para suporte@validaimovel.com ou via WhatsApp de suporte.",
  }
};
