import React from 'react';
import { MessageCircle, Headphones, ExternalLink } from 'lucide-react';
import {
  WHATSAPP_NUMBER,
  WHATSAPP_DISPLAY,
  WHATSAPP_MESSAGE,
  getWhatsAppLink,
} from '@/utils/whatsappUtils';

// Re-exporta para compatibilidade com imports existentes
export { WHATSAPP_NUMBER, WHATSAPP_DISPLAY, WHATSAPP_MESSAGE, getWhatsAppLink };

interface WhatsAppSupportProps {
  phoneNumber?: string;
  displayNumber?: string;
  message?: string;
  variant?: 'floating' | 'banner' | 'card' | 'inline';
  className?: string;
}

export const WhatsAppSupport: React.FC<WhatsAppSupportProps> = ({
  phoneNumber = WHATSAPP_NUMBER,
  displayNumber = WHATSAPP_DISPLAY,
  message = WHATSAPP_MESSAGE,
  variant = 'floating',
  className = '',
}) => {
  const link = getWhatsAppLink(phoneNumber, message);

  if (variant === 'banner') {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 bg-success/10 hover:bg-success/20 text-success border border-success/30 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm group ${className}`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
        </span>
        <MessageCircle className="w-4 h-4 fill-success text-success group-hover:rotate-12 transition-transform" />
        <span>Suporte via WhatsApp</span>
      </a>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`ring-1 ring-black/5 shadow-soft p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-card ${className}`}>
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-11 h-11 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-sm font-semibold text-foreground">Precisa de ajuda?</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fale com a nossa equipe pelo WhatsApp.
            </p>
          </div>
        </div>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto shrink-0 bg-success hover:bg-success/90 text-white font-medium text-[13px] px-5 py-3 rounded-full flex items-center justify-center gap-2 transition-colors"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>Falar no WhatsApp</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 text-success hover:text-success font-semibold text-xs transition-colors py-3.5 -my-3.5 ${className}`}
      >
        <MessageCircle className="w-4 h-4 fill-success text-foreground" />
        <span>Suporte via WhatsApp</span>
      </a>
    );
  }

  // Variant: 'floating' — só o botão redondo (a legenda aparece ao passar o mouse), acima da barra inferior no celular
  return (
    <div className={`fixed bottom-16 left-3 sm:bottom-5 sm:left-5 z-50 group ${className}`}>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Suporte no WhatsApp"
        title="Suporte no WhatsApp"
        className="w-12 h-12 rounded-full bg-success text-white flex items-center justify-center shadow-medium transition-transform hover:scale-105 active:scale-95"
      >
        <MessageCircle className="w-6 h-6 fill-white text-success" />
      </a>
      <span className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 hidden md:block whitespace-nowrap rounded-full bg-foreground/90 text-background text-xs font-medium px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        Suporte no WhatsApp
      </span>
    </div>
  );
};
