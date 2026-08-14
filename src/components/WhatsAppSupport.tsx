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
        className={`inline-flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-black transition-all hover:scale-105 shadow-sm group ${className}`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <MessageCircle className="w-4 h-4 fill-emerald-400 text-emerald-950 group-hover:rotate-12 transition-transform" />
        <span>Suporte via WhatsApp</span>
      </a>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-white ${className}`}>
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
            <Headphones className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs sm:text-sm font-black text-white">Precisa de Suporte Humano?</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Online Agora
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 font-medium mt-0.5">
              Atendimento rápido e direto em tempo real pelo WhatsApp.
            </p>
          </div>
        </div>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-3 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
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
        className={`inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-extrabold text-xs transition-colors ${className}`}
      >
        <MessageCircle className="w-4 h-4 fill-emerald-400 text-slate-950" />
        <span>Suporte via WhatsApp</span>
      </a>
    );
  }

  // Variant: 'floating' (Botão flutuante ajustado para nao sobrepor a barra inferior mobile)
  return (
    <div className={`fixed bottom-16 left-3 sm:bottom-5 sm:left-5 z-50 flex items-center gap-2.5 group ${className}`}>
      {/* Circle Icon Button */}
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Suporte no WhatsApp"
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/50 transition-all hover:scale-110 active:scale-95 border-2 border-emerald-300/50"
      >
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-emerald-950" />
      </a>

      {/* Tooltip Hover Label */}
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:flex items-center gap-2 bg-slate-900/95 border border-emerald-500/40 text-emerald-300 font-black text-xs px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md transition-all hover:border-emerald-400 hover:bg-slate-800 hover:scale-105"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span>Suporte via WhatsApp</span>
      </a>
    </div>
  );
};
