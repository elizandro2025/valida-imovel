import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, HelpCircle } from 'lucide-react';
import { askAboutReport, AIServiceError, MatriculaReport } from '@/services/aiService';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface MatriculaChatProps {
  report: MatriculaReport;
  initialQuery?: string;
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
                  <strong key={partIdx} className={`font-semibold ${isUser ? 'text-primary' : 'text-foreground font-semibold'}`}>
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              if (part.startsWith('*') && part.endsWith('*')) {
                return (
                  <em key={partIdx} className={isUser ? 'text-foreground' : 'text-foreground font-medium'}>
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
      text: 'Olá! Posso responder dúvidas sobre esta matrícula com base no relatório gerado: titulares, valores, hipotecas, penhoras, áreas e certidões recomendadas. As respostas são automáticas: confira os pontos decisivos na certidão.',
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
      const assistantText = await askAboutReport(textToSend, report);

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
          text: err instanceof AIServiceError
            ? err.message
            : 'Não consegui responder agora. Tente refazer a pergunta em instantes.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden flex flex-col h-[480px] sm:h-[580px] max-h-[70vh]">
      <CardHeader className="pb-3 border-b border-border bg-secondary/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-soft">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                Assistente da matrícula
                <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 text-xs">
                  IA
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Respostas automáticas com base no relatório desta matrícula.
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Messages Scroll Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/30">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-foreground text-xs font-semibold ${
              msg.sender === 'user' ? 'bg-muted' : 'bg-primary shadow-sm'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className="space-y-1">
              <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-card text-foreground rounded-tr-none'
                  : 'bg-card border border-border text-foreground shadow-sm rounded-tl-none'
              }`}>
                {renderFormattedText(msg.text, msg.sender === 'user')}
              </div>
              <span className={`text-xs text-muted-foreground block px-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 bg-card border border-border rounded-2xl rounded-tl-none text-xs text-muted-foreground flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-xs font-medium text-muted-foreground">Consultando atos registrais...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </CardContent>

      {/* Quick Questions Buttons */}
      <div className="px-4 py-2 border-t border-border bg-card flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-semibold text-muted-foreground shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-primary" /> Sugestões:
        </span>
        {quickQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(q)}
            disabled={isTyping}
            className="text-xs bg-secondary hover:bg-primary/10 hover:text-primary text-muted-foreground px-2.5 py-1 rounded-lg shrink-0 transition-colors font-medium border border-border"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-border bg-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <Input
            aria-label="Sua pergunta sobre o relatório"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre os proprietários, valores, penhoras, áreas..."
            disabled={isTyping}
            className="text-xs border-border focus-visible:ring-primary rounded-xl"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isTyping}
            aria-label="Enviar pergunta"
            className="px-4 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>
    </Card>
  );
};
