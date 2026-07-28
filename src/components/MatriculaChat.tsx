import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Sparkles, RefreshCw, HelpCircle, FileText, CornerDownLeft, ShieldCheck } from 'lucide-react';
import { chatJSON } from '@/services/mistralService';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface MatriculaChatProps {
  report: any;
}

// Helper para renderizar o texto do Chat sem exibir asteriscos brutos (convertendo markdown em HTML typography)
const renderFormattedText = (text: string, isUser: boolean = false) => {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((line, lineIdx) => {
        if (!line.trim()) return <div key={lineIdx} className="h-1" />;

        // Separa expressões entre **negrito** ou *itálico*
        const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);

        return (
          <p key={lineIdx} className="leading-relaxed">
            {parts.map((part, partIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={partIdx} className={`font-bold ${isUser ? 'text-emerald-300' : 'text-slate-900 font-extrabold'}`}>
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              if (part.startsWith('*') && part.endsWith('*')) {
                return (
                  <em key={partIdx} className={isUser ? 'text-slate-200' : 'text-slate-700 font-medium'}>
                    {part.slice(1, -1)}
                  </em>
                );
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
};

export const MatriculaChat: React.FC<MatriculaChatProps> = ({ report, initialQuery }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Olá! Sou o Especialista em Inteligência Registrária do Valida Imóvel 🏛️. Analisei minuciosamente esta matrícula e estou à disposição para responder qualquer dúvida sobre titulares, valores de venda, hipotecas, penhoras, áreas e certidões recomendadas. Como posso te ajudar?',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickQuestions = [
    "🛡️ Qual o diagnóstico de segurança jurídica deste imóvel?",
    "👤 Quem é o legítimo proprietário que deve assinar a venda?",
    "🚨 O imóvel possui hipoteca, alienação ou penhora ativa?",
    "📐 Qual a metragem e a caracterização do terreno/unidade?",
    "📋 Quais certidões devo solicitar para fechar o negócio?"
  ];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!queryText) setInput('');
    setIsTyping(true);

    try {
      const reportContext = JSON.stringify(report).substring(0, 15000);

      const promptMessages = [
        {
          role: "system",
          content: "SISTEMA DE ASSISTENTE JURÍDICO REGISTRÁRIO:\n" +
            "Você é um Especialista em Direito Imobiliário e Auditoria Registrária da plataforma Valida Imóvel.\n" +
            "Sua missão é responder às dúvidas do usuário sobre a matrícula imobiliária fornecida com máxima precisão técnica, linguagem direta, humana e 100% livre de jargões desnecessários ou termos pejorativos.\n\n" +
            "REGRAS DE FORMATAÇÃO E ESTILO:\n" +
            "1. Sempre cite os atos registrais específicos (ex: R-1/142.890, AV-3, R-5) para embasamento.\n" +
            "2. NÃO use marcas de asterisco brutas em excesso. Prefira usar tópicos limpos com emojis (•, 📌, 🏛️, 👤) e quebras de linha claras.\n" +
            "3. Responda apenas com dados contidos no relatório da matrícula.\n" +
            "4. Se a informação não constar, informe gentilmente que ela não está registrada na certidão analisada.\n" +
            "5. Mantenha um tom profissional, acolhedor e altamente esclarecedor.\n\n" +
            "Retorne a resposta estritamente neste formato JSON:\n" +
            '{\n  "resposta": "Sua resposta formatada em texto limpo e legível."\n}'
        },
        {
          role: "user",
          content: `DADOS DA MATRÍCULA IMOBILIÁRIA AUDITADA:\n${reportContext}\n\nPERGUNTA DO USUÁRIO:\n${textToSend}`
        }
      ];

      const res = await chatJSON(promptMessages, 1000, 1, "mistral-small-latest");
      const assistantText = res?.resposta || "Não foi possível identificar esse dado específico no texto extraído da matrícula.";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: assistantText,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Erro no Chat da Matrícula:", err);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'Desculpe, ocorreu uma breve oscilação no serviço de resposta. Por favor, refaça sua pergunta.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Card className="border-slate-200/80 bg-white shadow-sm rounded-2xl overflow-hidden flex flex-col h-[580px]">
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                Agente de Inteligência Registrária
                <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 text-[10px]">
                  IA Conectada à Matrícula
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Respostas diretas e precisas fundamentadas nos atos oficiais do Cartório de Imóveis.
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Messages Scroll Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold ${
              msg.sender === 'user' ? 'bg-slate-800' : 'bg-emerald-600 shadow-sm'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className="space-y-1">
              <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-white border border-slate-200/80 text-slate-800 shadow-sm rounded-tl-none'
              }`}>
                {renderFormattedText(msg.text, msg.sender === 'user')}
              </div>
              <span className={`text-[10px] text-slate-400 block px-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px] font-medium text-slate-500">Consultando atos registrais...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </CardContent>

      {/* Quick Questions Buttons */}
      <div className="px-4 py-2 border-t border-slate-100 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-emerald-600" /> Sugestões:
        </span>
        {quickQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(q)}
            disabled={isTyping}
            className="text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-2.5 py-1 rounded-lg shrink-0 transition-colors font-medium border border-slate-200/60"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-200/80 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre os proprietários, valores, penhoras, áreas..."
            disabled={isTyping}
            className="text-xs border-slate-200 focus-visible:ring-emerald-500 rounded-xl"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9 px-4 shrink-0 shadow-md shadow-emerald-600/20"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>
    </Card>
  );
};
