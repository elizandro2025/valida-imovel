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
    retentionDays: 30, // período de retenção padrão dos arquivos analisados para suporte
    securityStatement: "Conexão protegida por HTTPS/TLS e tratamento dos documentos conforme as práticas descritas na Política de Privacidade.",
    aiModelTraining: false, // Documentos não utilizados para treinamento de modelos públicos de IA
    deletionRequest: "A solicitação de exclusão definitiva de documentos pode ser enviada a qualquer momento para suporte@validaimovel.com ou via WhatsApp de suporte.",
  }
};
