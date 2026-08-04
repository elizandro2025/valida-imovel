// Constantes e utilitários do WhatsApp — separados para compatibilidade com Fast Refresh

export const WHATSAPP_NUMBER = '5548991444916';
export const WHATSAPP_DISPLAY = '(48) 99144-4916';
export const WHATSAPP_MESSAGE = 'Olá! Preciso de suporte no sistema Valida Imóvel.';

export const getWhatsAppLink = (
  number = WHATSAPP_NUMBER,
  msg = WHATSAPP_MESSAGE
) => {
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
};
