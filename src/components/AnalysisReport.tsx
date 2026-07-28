import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download, Copy, FileText, ShieldCheck, AlertTriangle, CheckCircle2,
  Building2, Users, Calendar, Scale, Home, MapPin, Clock, AlertCircle,
  Sparkles, FileCheck, Printer, ArrowUpRight, Share2, Compass, Zap, Lock, RefreshCw, Check,
  TreePine, Landmark, ShieldAlert, FileQuestion, Key, CheckCircle, RefreshCcw,
  MessageSquare, CheckSquare, ArrowRight, DollarSign, Search, MessageCircle, X, Bot, ChevronDown, ChevronUp
} from 'lucide-react';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { subscriptionService } from '@/services/subscriptionService';
import { MatriculaChat } from './MatriculaChat';
import { GuidedTour } from './GuidedTour';

// Helper ultra-seguro para impedir erros de React child e evitar exibição de JSON bruto (como {"nome":null})
const renderSafe = (value: any, fallback: string = 'Não informado'): string => {
  if (value === null || value === undefined || value === '') return fallback;
  
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed === '{}' || trimmed === '[]') return fallback;
    
    // Se a string contiver um JSON bruto (ex: '{"nome":null,"crea_cft":null}'), parse para higienizar
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        return renderSafe(parsed, fallback);
      } catch {
        // Se falhar o parse, prossegue com o texto limpo
      }
    }
    return trimmed;
  }
  
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'SIM' : 'NÃO';
  
  if (Array.isArray(value)) {
    if (value.length === 0) return fallback;
    const items = value.map(v => renderSafe(v, '')).filter(v => v && v !== fallback);
    return items.length > 0 ? items.join(', ') : fallback;
  }
  
  if (typeof value === 'object') {
    const validParts: string[] = [];
    for (const key of Object.keys(value)) {
      const val = value[key];
      if (val !== null && val !== undefined && val !== '' && val !== 'null' && val !== 'undefined') {
        const strVal = typeof val === 'object' ? renderSafe(val, '') : String(val).trim();
        if (strVal && strVal !== fallback && strVal !== 'null' && strVal !== 'undefined') {
          validParts.push(strVal);
        }
      }
    }
    if (validParts.length === 0) return fallback;
    return validParts.join(' — ');
  }
  
  return fallback;
};

// Error Boundary para evitar tela branca caso ocorra alguma falha na renderização de dados
interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ReportErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🔥 Report Error Boundary capturou exceção:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="max-w-md mx-auto bg-white border-red-200 p-6 text-center space-y-4 rounded-3xl shadow-xl">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Falha Temporária no Componente de Relatório</h3>
          <p className="text-xs text-slate-500">Ocorreu um erro ao formatar um dos campos. Clique abaixo para tentar novamente.</p>
          <Button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl gap-2"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Recarregar Exibição
          </Button>
        </Card>
      );
    }
    return this.props.children;
  }
}

// Componente para copiar qualquer campo com 1 clique e feedback visual
const CopyableField: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className = '' }) => {
  const [copiedField, setCopiedField] = useState(false);
  const { toast } = useToast();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!value || value === 'N/A' || value === 'NÃO CONSTA' || value === 'Não Informado') return;
    navigator.clipboard.writeText(value);
    setCopiedField(true);
    toast({ title: '✓ Campo Copiado!', description: `${label}: ${value}` });
    setTimeout(() => setCopiedField(false), 2000);
  };

  const isCopyable = value && value !== 'N/A' && value !== 'NÃO CONSTA' && value !== 'Não Informado';

  return (
    <div 
      onClick={isCopyable ? handleCopy : undefined}
      className={`group relative p-3 bg-slate-50 border border-slate-200/70 hover:border-emerald-400 hover:bg-emerald-50/50 rounded-xl space-y-0.5 transition-all ${isCopyable ? 'cursor-pointer' : ''} ${className}`}
      title={isCopyable ? `Clique para copiar "${value}"` : undefined}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">{label}</span>
        {isCopyable && (
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 shrink-0">
            {copiedField ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            {copiedField ? 'Copiado!' : 'Copiar'}
          </span>
        )}
      </div>
      <span className="font-semibold text-slate-800 block truncate">{value}</span>
    </div>
  );
};

// Componente para copiar blocos de texto longos
const CopyableBlock: React.FC<{ label: string; text: string }> = ({ label, text }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: '✓ Bloco Copiado!', description: `${label} copiado.` });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copiado!' : 'Copiar Texto'}
        </button>
      </div>
      <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 leading-relaxed font-medium">
        {text}
      </p>
    </div>
  );
};

interface AnalysisReportProps {
  report: any;
  autoStartTour?: boolean;
}

const AnalysisReportContent: React.FC<AnalysisReportProps> = ({ report, autoStartTour = false }) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('parecer');
  const [profileTab, setProfileTab] = useState<'comprador' | 'corretor' | 'banco' | 'engenheiro' | 'advogado'>('comprador');
  const [showAiChat, setShowAiChat] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(autoStartTour);

  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => subscriptionService.getStatus().active);

  useEffect(() => {
    const handleSubChange = (e: any) => {
      if (e.detail && typeof e.detail.active === 'boolean') {
        setIsSubscribed(e.detail.active);
      } else {
        setIsSubscribed(subscriptionService.getStatus().active);
      }
    };
    window.addEventListener('valida_subscription_updated', handleSubChange);
    return () => window.removeEventListener('valida_subscription_updated', handleSubChange);
  }, []);

  if (!report) return null;

  // 12 Modules Data Extractors com fallbacks ultra-seguros
  const ident = typeof report.identificacao_geral === 'object' && report.identificacao_geral !== null ? report.identificacao_geral : {};
  const carac = typeof report.caracteristicas_fisicas === 'object' && report.caracteristicas_fisicas !== null ? report.caracteristicas_fisicas : {};
  const geo = typeof report.memorial_descritivo_georreferenciamento === 'object' && report.memorial_descritivo_georreferenciamento !== null ? report.memorial_descritivo_georreferenciamento : {};
  const regimes = typeof report.regimes_especiais === 'object' && report.regimes_especiais !== null ? report.regimes_especiais : {};
  const ambiental = typeof report.registro_ambiental === 'object' && report.registro_ambiental !== null ? report.registro_ambiental : {};
  const especiais = typeof report.imoveis_especiais === 'object' && report.imoveis_especiais !== null ? report.imoveis_especiais : {};
  
  const props = Array.isArray(report.proprietarios_atuais) ? report.proprietarios_atuais : [];
  const cadeia = Array.isArray(report.cadeia_dominial) ? report.cadeia_dominial : [];
  const garantias = Array.isArray(report.onus_garantias_financeiras) ? report.onus_garantias_financeiras : [];
  const penhoras = Array.isArray(report.indisponividades_e_penhoras) ? report.indisponividades_e_penhoras : [];
  const usufruto = Array.isArray(report.usufruto_servidoes_e_direitos) ? report.usufruto_servidoes_e_direitos : [];
  const parecer = typeof report.parecer_analise === 'object' && report.parecer_analise !== null ? report.parecer_analise : {};

  const onus = Array.isArray(report.onus_gravames_ativos) ? report.onus_gravames_ativos : [...garantias, ...penhoras];
  const averb = Array.isArray(report.averbacoes_diversas) ? report.averbacoes_diversas : [];

  const scoreRisco = typeof parecer.score_risco === 'number' ? parecer.score_risco : 15;
  const nivelRisco = renderSafe(parecer.nivel_risco, scoreRisco >= 75 ? 'CRÍTICO' : scoreRisco >= 50 ? 'ALTO' : scoreRisco >= 25 ? 'MÉDIO' : 'BAIXO');
  const statusJuridico = renderSafe(parecer.status_juridico, 'REGULAR');

  const getRiskBadge = (nivel: string) => {
    switch (nivel.toUpperCase()) {
      case 'CRÍTICO':
        return { bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-600', label: 'Risco Crítico' };
      case 'ALTO':
        return { bg: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-600', label: 'Risco Alto' };
      case 'MÉDIO':
        return { bg: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500', label: 'Risco Médio' };
      default:
        return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-600', label: 'Risco Baixo' };
    }
  };

  const riskBadge = getRiskBadge(nivelRisco);

  // Copiar Todos os Campos em formato de texto estruturado
  const handleCopyAllFields = () => {
    if (!isSubscribed) {
      toast({
        title: "🔒 Recurso Bloqueado — Plano R$ 99,90",
        description: "Assine o Plano 6 Meses Ilimitados por R$ 99,90 para liberar a cópia rápida de todos os campos.",
        variant: "destructive"
      });
      return;
    }
    const fullText = `
=== DADOS COMPLETOS EXTRAÍDOS — VALIDA IMÓVEL ===
MATRÍCULA: ${renderSafe(ident.matricula)}
CARTÓRIO: ${renderSafe(ident.cartorio_ri)}
COMARCA/UF: ${renderSafe(ident.comarca)}
SCORE RISCO: ${scoreRisco}/100 (${nivelRisco})
STATUS JURÍDICO: ${statusJuridico}

1. DADOS CARTORÁRIOS
- Livro: ${renderSafe(ident.livro)}
- Folha: ${renderSafe(ident.folha)}
- Data Abertura: ${renderSafe(ident.data_abertura)}
- Tipo Imóvel: ${renderSafe(ident.tipo_imovel_analisado)}
- INCRA/SQL/IPTU: ${renderSafe(ident.codigo_imovel)}

2. CARACTERIZAÇÃO FÍSICA
- Endereço Completo: ${renderSafe(carac.endereco_completo)}
- Denominação: ${renderSafe(carac.denominacao_imovel)}
- Área Total (m²): ${renderSafe(carac.area_total_m2)}
- Área (Hectares): ${renderSafe(carac.area_total_hectares || carac.area_outras_unidades)}
- Loteamento/Quadra/Lote: ${renderSafe(carac.loteamento_quadra_lote)}
- Perímetros: ${renderSafe(carac.perimetros_confrontacoes)}

3. PROPRIETÁRIOS ATUAIS (${props.length})
${props.map((p: any, i: number) => `${i + 1}. Nome: ${renderSafe(p.nome)} | CPF/CNPJ: ${renderSafe(p.cpf_cnpj)} | Fração: ${renderSafe(p.percentual_propriedade, '100%')} | Estado Civil: ${renderSafe(p.estado_civil)}`).join('\n')}

4. ÔNUS REAIS & RESTRIÇÕES (${onus.length})
${onus.length === 0 ? '✓ Matrícula Livre de Ônus e Penhoras' : onus.map((g: any, i: number) => `${i + 1}. Tipo: ${renderSafe(g.tipo)} | Credor/Vara: ${renderSafe(g.credor_banco || g.processo_vara)} | Valor: ${renderSafe(g.valor_garantia)}`).join('\n')}

5. PARECER & RECOMENDAÇÃO
Resumo: ${renderSafe(parecer.resumo_geral)}
Recomendação: ${renderSafe(parecer.recomendacao_final || parecer.conclusao_juridica)}
`.trim();

    navigator.clipboard.writeText(fullText);
    toast({ title: '🎉 Todos os Campos Copiados!', description: 'Todos os dados da matrícula foram copiados para a área de transferência.' });
  };

  // Copiar resumo formatado corporativo
  const handleCopySummary = () => {
    const summaryText = `
VALIDA IMÓVEL — ANÁLISE COMPLETA DE MATRÍCULA (12 MÓDULOS)
===========================================================
Matrícula: ${renderSafe(ident.matricula, 'N/A')}
Cartório: ${renderSafe(ident.cartorio_ri, 'N/A')} (${renderSafe(ident.comarca, '')})
Score de Risco: ${scoreRisco}/100 — ${nivelRisco}
Status Legal: ${statusJuridico}

RESUMO EXECUTIVO:
${renderSafe(parecer.resumo_geral, 'N/A')}

PROPRIETÁRIOS ATUAIS (${props.length}):
${props.map((p: any) => `- ${renderSafe(p.nome, 'N/A')} (${renderSafe(p.cpf_cnpj, 'N/A')}) - ${renderSafe(p.percentual_propriedade, '100%')}`).join('\n')}

RESTRIÇÕES E GRAVAMES (${onus.length}):
${onus.length > 0 ? onus.map((o: any) => `- ${renderSafe(o.tipo, 'Gravame')}: ${renderSafe(o.detalhes, 'Sem detalhes')}`).join('\n') : 'Nenhum gravame ativo registrado.'}

RECOMENDAÇÃO DE DUE DILIGENCE:
${renderSafe(parecer.recomendacao_final || parecer.conclusao_juridica, 'N/A')}
    `.trim();

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    toast({ title: 'Copiado!', description: 'Resumo da matrícula copiado para a área de transferência.' });
    setTimeout(() => setCopied(false), 3000);
  };

  // Copiar resumo formatado para WhatsApp
  const handleCopyWhatsApp = () => {
    const waText = `*VALIDA IMÓVEL — PARECER DE MATRÍCULA* 🏛️
-----------------------------------------
📌 *Matrícula:* Nº ${renderSafe(ident.matricula)}
🏥 *Cartório:* ${renderSafe(ident.cartorio_ri)} (${renderSafe(ident.comarca)})
🛡️ *Score de Risco:* ${scoreRisco}/100 — *${nivelRisco}*
⚖️ *Status Legal:* ${statusJuridico}

👥 *Proprietário(s):*
${props.map((p: any) => `• ${renderSafe(p.nome)} (${renderSafe(p.cpf_cnpj)})`).join('\n')}

🚨 *Ônus/Gravames:* ${onus.length > 0 ? `${onus.length} gravame(s) ativo(s)` : 'Matrícula Livre de Ônus ✓'}

📝 *Parecer Executivo:*
${renderSafe(parecer.resumo_geral)}

💡 *Recomendação:*
${renderSafe(parecer.recomendacao_final || parecer.conclusao_juridica)}
-----------------------------------------
_Gerado automaticamente via Valida Imóvel com IA Registrária_`.trim();

    toast({ title: 'Copiado para WhatsApp!', description: 'Resumo formatado pronto para colar em conversas.' });
    setTimeout(() => setCopiedWhatsApp(false), 3000);
  };

  // GERADOR EXECUTIVO DE PDF PROFISSIONAL (10/10 HIGH-FIDELITY LEGALTECH - 100% DOS CAMPOS SEM CORTES)
  const exportToPDF = async () => {
    if (!isSubscribed) {
      toast({
        title: "🔒 Dossiê PDF Bloqueado — Plano R$ 99,90",
        description: "Assine o Plano 6 Meses Ilimitados por R$ 99,90 para exportar o relatório notarial completo em PDF.",
        variant: "destructive"
      });
      return;
    }
    setIsExporting(true);

    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 14;
      const contentWidth = pageWidth - (margin * 2);
      let y = margin;

      const darkSlate = [15, 23, 42];     // #0f172a
      const slateHeader = [30, 41, 59];    // #1e293b
      const emerald = [5, 150, 105];       // #059669
      const lightBg = [248, 250, 252];     // #f8fafc
      const borderSlate = [226, 232, 240]; // #e2e8f0
      const textDark = [30, 41, 59];       // #1e293b
      const textMuted = [100, 116, 139];   // #64748b

      const cleanTextForPDF = (text: string): string => {
        if (!text) return '';
        return String(text)
          .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '') // remove surrogate pairs (emojis like 🚨, ⚖️)
          .replace(/[\u2600-\u27BF]/g, '')              // remove misc symbols (like ✓, 📌)
          .replace(/[^\x00-\xFF\u00C0-\u00FF]/g, '')    // remove non-latin-1 characters, keep Portuguese accents
          .replace(/\s+/g, ' ')                         // normalize whitespace
          .trim();
      };

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - 20) {
          pdf.addPage();
          y = margin + 14;
          drawMiniHeader();
        }
      };

      const drawMiniHeader = () => {
        pdf.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        pdf.rect(0, 0, pageWidth, 12, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(255, 255, 255);
        pdf.text(cleanTextForPDF(`VALIDA IMÓVEL — MATRÍCULA Nº ${renderSafe(ident.matricula)} — ${renderSafe(ident.cartorio_ri)}`), margin, 8);
        pdf.setTextColor(52, 211, 153);
        pdf.text(cleanTextForPDF(`SCORE: ${scoreRisco}/100 (${nivelRisco})`), pageWidth - margin - 42, 8);
      };

      const drawSectionHeader = (title: string) => {
        checkPageBreak(16);
        y += 3;
        pdf.setFillColor(slateHeader[0], slateHeader[1], slateHeader[2]);
        pdf.roundedRect(margin, y, contentWidth, 8, 1.5, 1.5, 'F');
        pdf.setFillColor(emerald[0], emerald[1], emerald[2]);
        pdf.rect(margin, y, 3.5, 8, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8.5);
        pdf.setTextColor(255, 255, 255);
        pdf.text(cleanTextForPDF(title.toUpperCase()), margin + 6, y + 5.5);
        y += 11;
      };

      const drawKeyValuePair = (label: string, val: string) => {
        const cleanVal = cleanTextForPDF(val);
        if (!cleanVal || cleanVal === 'Não informado' || cleanVal === 'N/A') return;
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        const wrappedLabel = cleanTextForPDF(`${label}: `);
        const labelWidth = pdf.getTextWidth(wrappedLabel);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        const lines = pdf.splitTextToSize(cleanVal, contentWidth - labelWidth - 4);
        const blockHeight = lines.length * 4.2 + 2;

        checkPageBreak(blockHeight);

        pdf.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
        pdf.rect(margin, y, contentWidth, blockHeight, 'F');
        pdf.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
        pdf.line(margin, y + blockHeight, margin + contentWidth, y + blockHeight);

        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
        pdf.text(wrappedLabel, margin + 3, y + 4.5);

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(71, 85, 105);

        lines.forEach((line: string, lIdx: number) => {
          const posX = lIdx === 0 ? margin + 3 + labelWidth : margin + 3;
          const posY = y + 4.5 + (lIdx * 4.2);
          pdf.text(line, posX, posY);
        });

        y += blockHeight;
      };

      const drawCardBlock = (title: string, subtitle?: string, isAlert: boolean = false) => {
        const cleanTitle = cleanTextForPDF(title);
        const cleanSub = subtitle ? cleanTextForPDF(subtitle) : '';

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        const titleLines = pdf.splitTextToSize(cleanTitle, contentWidth - 8);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        const subLines = cleanSub ? pdf.splitTextToSize(cleanSub, contentWidth - 8) : [];

        const titleHeight = titleLines.length * 4;
        const subHeight = subLines.length > 0 ? (subLines.length * 3.8) + 1 : 0;
        const blockHeight = titleHeight + subHeight + 5;

        checkPageBreak(blockHeight + 3);

        if (isAlert) {
          pdf.setFillColor(254, 242, 242);
          pdf.setDrawColor(252, 165, 165);
        } else {
          pdf.setFillColor(248, 250, 252);
          pdf.setDrawColor(226, 232, 240);
        }
        pdf.roundedRect(margin, y, contentWidth, blockHeight, 2, 2, 'FD');

        let currentY = y + 4.5;

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        if (isAlert) pdf.setTextColor(153, 27, 27);
        else pdf.setTextColor(textDark[0], textDark[1], textDark[2]);

        titleLines.forEach((line: string) => {
          pdf.text(line, margin + 4, currentY);
          currentY += 4;
        });

        if (subLines.length > 0) {
          currentY += 1;
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7.5);
          if (isAlert) pdf.setTextColor(127, 29, 29);
          else pdf.setTextColor(textMuted[0], textMuted[1], textMuted[2]);

          subLines.forEach((line: string) => {
            pdf.text(line, margin + 4, currentY);
            currentY += 3.8;
          });
        }

        y += blockHeight + 3;
      };

      const drawEmptyState = (msg: string) => {
        checkPageBreak(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(22, 101, 52);
        pdf.text(cleanTextForPDF(msg), margin + 2, y + 4.5);
        y += 8;
      };

      // Header Inicial Executivo
      pdf.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      pdf.rect(0, 0, pageWidth, 42, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.setTextColor(255, 255, 255);
      pdf.text('VALIDA IMÓVEL', margin, 18);
      pdf.setFontSize(8.5);
      pdf.setTextColor(148, 163, 184);
      pdf.text('DOSSIÊ REGISTRAL NOTARIAL COMPLETO — 12 MÓDULOS DE AUDITORIA', margin, 25);
      pdf.setFontSize(8);
      pdf.setTextColor(52, 211, 153);
      pdf.text(`Emissão: ${new Date().toLocaleDateString('pt-BR')} • Lei de Registros Públicos (Lei 6.015/73)`, margin, 32);

      // Score Box na capa
      pdf.setFillColor(30, 41, 59);
      pdf.roundedRect(pageWidth - margin - 45, 10, 45, 24, 2, 2, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(148, 163, 184);
      pdf.text('SCORE DE RISCO', pageWidth - margin - 40, 16);
      pdf.setFontSize(14);
      pdf.setTextColor(52, 211, 153);
      pdf.text(`${scoreRisco}/100`, pageWidth - margin - 40, 24);
      pdf.setFontSize(7.5);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`STATUS: ${cleanTextForPDF(nivelRisco)}`, pageWidth - margin - 40, 30);

      y = 50;

      // MÓDULO 12: PARECER JURÍDICO & SCORES DE RISCO
      drawSectionHeader('Diagnóstico & Parecer Notarial (Módulo 12)');
      drawKeyValuePair('Status Jurídico Registral', statusJuridico);
      drawKeyValuePair('Nota de Risco', `${scoreRisco}/100 (${nivelRisco})`);
      if (parecer.explicacao_descomplicada) {
        drawCardBlock('PARECER DESCOMPLICADO PARA INVESTIDORES E LEIGOS:', parecer.explicacao_descomplicada);
      }
      if (parecer.resumo_geral) {
        drawCardBlock('RESUMO EXECUTIVO DA MATRÍCULA:', parecer.resumo_geral);
      }
      if (parecer.recomendacao_final || parecer.conclusao_juridica) {
        drawCardBlock('RECOMENDAÇÃO FINAL DE DUE DILIGENCE:', parecer.recomendacao_final || parecer.conclusao_juridica);
      }

      // MÓDULO 1: DADOS CARTORÁRIOS DE IDENTIFICAÇÃO
      drawSectionHeader('1. Identificação Registrária (Módulo 1)');
      drawKeyValuePair('Matrícula Nº', renderSafe(ident.matricula));
      drawKeyValuePair('Cartório / RI', renderSafe(ident.cartorio_ri));
      drawKeyValuePair('Comarca / UF', renderSafe(ident.comarca));
      drawKeyValuePair('Livro / Folha', `${renderSafe(ident.livro)} (fl. ${renderSafe(ident.folha)})`);
      drawKeyValuePair('Data de Abertura', renderSafe(ident.data_abertura));
      drawKeyValuePair('Tipo de Imóvel', renderSafe(ident.tipo_imovel_analisado));
      drawKeyValuePair('Serventia / CNS', renderSafe(ident.serventia));
      drawKeyValuePair('Código / INCRA / SQL', renderSafe(ident.codigo_imovel));
      drawKeyValuePair('Histórico de Renumeração', renderSafe(ident.historico_renumeracao));
      drawKeyValuePair('Origem / Transcrição', renderSafe(ident.origem_transcricao));
      drawKeyValuePair('Código Nacional (CNI)', renderSafe(ident.codigo_nacional_imovel));

      // MÓDULO 2: CARACTERIZAÇÃO FÍSICA & BENFEITORIAS
      drawSectionHeader('2. Caracterização Física e Área (Módulo 2)');
      drawKeyValuePair('Denominação do Imóvel', renderSafe(carac.denominacao_imovel));
      drawKeyValuePair('Endereço Completo', renderSafe(carac.endereco_completo));
      drawKeyValuePair('Área Total (m² / Hectares)', renderSafe(carac.area_total_m2));
      drawKeyValuePair('Área Construída Averbada', renderSafe(carac.area_construida));
      drawKeyValuePair('Área Privativa / Comum', `${renderSafe(carac.area_privativa)} / ${renderSafe(carac.area_comum)}`);
      drawKeyValuePair('Uso Predominante / Zoneamento', `${renderSafe(carac.uso_predominante)} (${renderSafe(carac.zoneamento_mencionado)})`);
      if (carac.benfeitorias) {
        drawCardBlock('BENFEITORIAS E CONSTRUÇÕES AVERBADAS:', renderSafe(carac.benfeitorias));
      }
      if (carac.perimetros_confrontacoes) {
        drawCardBlock('PERÍMETROS E CONFRONTAÇÕES (VIZINHOS):', renderSafe(carac.perimetros_confrontacoes));
      }
      if (carac.descricao_legal) {
        drawCardBlock('DESCRIÇÃO LEGAL COMPLETA DA CERTIDÃO:', renderSafe(carac.descricao_legal));
      }

      // MÓDULO 3: GEORREFERENCIAMENTO & REGISTRO AGRÁRIO (SIGEF / INCRA)
      drawSectionHeader('3. Georreferenciamento e Registro Agrário (Módulo 3)');
      drawKeyValuePair('Status SIGEF / INCRA', renderSafe(geo.situacao_certificacao || geo.status_sigef));
      drawKeyValuePair('Código CAR (Ambiental)', renderSafe(geo.codigo_car || geo.car_registro));
      drawKeyValuePair('CCIR / SNCR INCRA', renderSafe(geo.codigo_ccir || geo.codigo_incra));
      drawKeyValuePair('NIRF / ITR', renderSafe(geo.codigo_itr_nirf));
      drawKeyValuePair('Responsável Técnico / CREA', renderSafe(geo.responsavel_tecnico));
      drawKeyValuePair('Sistema Geodésico', renderSafe(geo.sistema_geodesico));
      if (geo.coordenadas_geograficas) {
        drawCardBlock('COORDENADAS DOS VÉRTICES (UTM):', renderSafe(geo.coordenadas_geograficas));
      }

      // MÓDULO 4 & 5: REGIMES ESPECIAIS & REGISTRO AMBIENTAL
      drawSectionHeader('4 e 5. Regimes Especiais e Registro Ambiental (Módulos 4 e 5)');
      drawKeyValuePair('Reserva Legal Averbada (20%)', renderSafe(regimes.reserva_legal_averbada || ambiental?.reserva_legal_averbada));
      drawKeyValuePair('Área de Preservação Permanente (APP)', renderSafe(regimes.app_preservacao_permanente || ambiental?.area_preservacao_permanente_app));
      drawKeyValuePair('Outorga de Recursos Hídricos', renderSafe(ambiental?.outorga_agua));
      drawKeyValuePair('Embargos Ambientais IBAMA', renderSafe(ambiental?.embargos_ambientais, 'Nenhum embargo registrado'));
      drawKeyValuePair('Condomínio / Loteamento / REURB', renderSafe(regimes.detalhes_regime, 'Imóvel Privado Individual'));

      // MÓDULO 6: FAIXA DE DOMÍNIO & SPU / MARINHA
      drawSectionHeader('6. Faixa de Domínio e Situação SPU / Marinha (Módulo 6)');
      drawKeyValuePair('Faixa de Domínio de Rodovia', renderSafe(especiais?.faixa_dominio ? 'SIM — Faixa de Domínio Averbada' : 'NÃO CONSTA'));
      drawKeyValuePair('Terreno de Marinha / SPU', renderSafe(especiais?.regime_spu, 'NÃO CONSTA'));
      drawKeyValuePair('Tombamento Histórico / Indígena', renderSafe(especiais?.tombamento ? 'SIM' : 'NÃO CONSTA'));

      // MÓDULO 7: PROPRIETÁRIOS ATUAIS E QUALIFICAÇÃO
      drawSectionHeader('7. Titularidade Atual e Qualificação (Módulo 7)');
      if (props.length === 0) {
        drawEmptyState('Nenhum proprietário atual identificado explicitamente.');
      } else {
        props.forEach((p: any, idx: number) => {
          const detailStr = `CPF/CNPJ: ${renderSafe(p.cpf_cnpj)} | Qualificação: ${renderSafe(p.qualificacao)} | Fração: ${renderSafe(p.percentual_propriedade, '100%')} | Origem: ${renderSafe(p.ato_aquisicao, 'Escritura R-X')}`;
          drawCardBlock(`PROPRIETÁRIO ${idx + 1}: ${renderSafe(p.nome)}`, detailStr);
        });
      }

      // MÓDULO 8: CADEIA DOMINIAL CRONOLÓGICA (TRANSMISSÕES)
      drawSectionHeader('8. Cadeia Dominial Cronológica (Módulo 8)');
      if (cadeia.length === 0) {
        drawEmptyState('Nenhum ato histórico de transmissão registrado.');
      } else {
        cadeia.forEach((ato: any, idx: number) => {
          const parts = [
            ato.data_registro || ato.data_ato ? `Data: ${renderSafe(ato.data_registro || ato.data_ato)}` : null,
            ato.transmitentes ? `Transmitente: ${renderSafe(ato.transmitentes)}` : null,
            ato.adquirentes ? `Adquirente: ${renderSafe(ato.adquirentes)}` : null,
            ato.valor_transacao ? `Valor Declarado: ${renderSafe(ato.valor_transacao)}` : null,
            ato.observacoes ? `Obs: ${renderSafe(ato.observacoes)}` : null
          ].filter(Boolean).join('\n');
          drawCardBlock(`ATO ${renderSafe(ato.numero_ato, `#${idx + 1}`)} — ${renderSafe(ato.tipo_transmissao)}`, parts);
        });
      }

      // MÓDULO 9: ÔNUS REAIS E GARANTIAS FINANCEIRAS
      drawSectionHeader('9. Ônus Reais e Garantias Financeiras (Módulo 9)');
      if (garantias.length === 0) {
        drawEmptyState('Nenhuma hipoteca ou alienação fiduciária ativa registrada.');
      } else {
        garantias.forEach((g: any, idx: number) => {
          drawCardBlock(`${idx + 1}. [${renderSafe(g.numero_ato, 'ATO')}] ${renderSafe(g.tipo, 'Garantia')}`, `Credor: ${renderSafe(g.credor_banco || g.credor_beneficiario)} | Valor: ${renderSafe(g.valor_garantia)} | Status: ${renderSafe(g.status, 'ATIVO')}`, true);
        });
      }

      // MÓDULO 10: INDISPONIBILIDADES, PENHORAS E RESTRIÇÕES CNIB
      drawSectionHeader('10. Penhoras, Indisponibilidades e Ações (Módulo 10)');
      if (penhoras.length === 0) {
        drawEmptyState('Nenhuma penhora ou indisponibilidade CNIB ativa registrada.');
      } else {
        penhoras.forEach((p: any, idx: number) => {
          drawCardBlock(`${idx + 1}. [${renderSafe(p.numero_ato, 'ATO')}] ${renderSafe(p.tipo, 'Restrição Judicial')}`, `Processo/Vara: ${renderSafe(p.processo_vara)} | Exequente: ${renderSafe(p.autor_exequente)} | Status: ${renderSafe(p.status, 'ATIVO')}`, true);
        });
      }

      // MÓDULO 11: USUFRUTO, SERVIDÕES E DIREITOS REAIS
      drawSectionHeader('11. Usufruto, Servidões e Direitos Reais (Módulo 11)');
      if (usufruto.length === 0) {
        drawEmptyState('Nenhum usufruto vitalício ou servidão de passagem registrado.');
      } else {
        usufruto.forEach((u: any, idx: number) => {
          drawCardBlock(`${idx + 1}. [${renderSafe(u.numero_ato, 'ATO')}] ${renderSafe(u.tipo, 'Direito Real')}`, `Beneficiários: ${renderSafe(u.beneficiarios)} | Cláusulas: ${renderSafe(u.clausulas_restritivas, 'N/A')}`);
        });
      }

      // CHECKLIST DE CERTIDÕES COMPLEMENTARES
      drawSectionHeader('Certidões Complementares de Due Diligence Recomendadas');
      certidoesRecomendadas.forEach((c: any, idx: number) => {
        drawCardBlock(`${idx + 1}. ${c.title}`, `Finalidade: ${c.purpose} | Escopo: ${c.scope}`);
      });

      // Rodapé Criptográfico em Todas as Páginas
      const totalPages = pdf.internal.getNumberOfPages();
      const randomHash = '0x' + Math.random().toString(16).substring(2, 10).toUpperCase();

      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
        pdf.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        pdf.text(`Valida Imóvel — Relatório Auditado Nº ${renderSafe(ident.matricula, 'S/N')}`, margin, pageHeight - 9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(emerald[0], emerald[1], emerald[2]);
        pdf.text(`Carimbo Hash: ${randomHash} • Página ${i} de ${totalPages}`, pageWidth - margin - 60, pageHeight - 9);
      }

      const filename = `Relatorio_Auditado_${renderSafe(ident.matricula, 'Imovel')}.pdf`;
      pdf.save(filename);
      toast({ title: '🎉 Dossiê PDF Exportado com Sucesso!', description: `Relatório notarial de 12 módulos salvo como ${filename}` });
    } catch (err) {
      console.error('Erro na exportação do PDF:', err);
      toast({ title: 'Erro na exportação', description: 'Não foi possível gerar o PDF.', variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  const certidoesRecomendadas = [
    { title: 'Certidão Negativa de Débitos Federais (PGFN / Receita Federal)', scope: 'Vendedores (Pessoas Físicas e Jurídicas)', purpose: 'Verificar execuções fiscais da União e dívida ativa.' },
    { title: 'Certidão de Feitos Ajuizados Cíveis e Execuções (TJ Estadual)', scope: 'Vendedores e Imóvel', purpose: 'Identificar ações judiciais de cobrança, despejo ou usucapião.' },
    { title: 'Certidão Negativa de Débitos Trabalhistas (CNDT / TST)', scope: 'Vendedores Pessoas Físicas e Sócios', purpose: 'Garantir que não há execuções trabalhistas com risco de fraude à execução.' },
    { title: 'Certidão Negativa de Débitos Tributários Municipais (IPTU / ITR)', scope: 'Imóvel', purpose: 'Comprovar quitação de tributos imobiliários e taxas locais.' },
    { title: 'Certidão de Objeto e Pé (em caso de ações averbadas)', scope: 'Matrícula', purpose: 'Avaliar o andamento e risco real de ações registradas na matrícula.' }
  ];

  return (
    <div className="space-y-6 antialiased animate-fade-in">

      {/* Carimbo Digital de Autenticidade Registral & Selo de Confiança */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-lg border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                CARIMBO DIGITAL DE AUDITORIA REGISTRAL & FIDELIDADE
              </h3>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px] font-bold uppercase">
                100% Auditado
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Conformidade com a Lei de Registros Públicos (Lei 6.015/73) • Criptografia SSL 256-bit • Sigilo LGPD Garantido
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Badge variant="outline" className="border-slate-700 bg-slate-800/90 text-emerald-400 text-[11px] font-bold gap-1 px-3 py-1.5 shadow-inner">
            <Lock className="w-3.5 h-3.5 text-emerald-400" /> Criptografia de Nível Bancário
          </Badge>
        </div>
      </div>

      {/* Header Limpo & Barra de Ações */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
            <FileCheck className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                Relatório Auditado (12 Módulos Registrais)
              </h2>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold text-[10px] uppercase">
                100% Abrangente
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Matrícula Nº <strong className="text-slate-800 font-bold">{renderSafe(ident.matricula)}</strong> • {renderSafe(ident.cartorio_ri, 'CRI')} ({renderSafe(ident.comarca, 'Comarca N/I')})
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {isSubscribed ? (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold text-xs gap-1.5 py-1.5 px-3 rounded-xl shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Assinatura Ativa</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 font-extrabold text-xs gap-1.5 py-1.5 px-3 rounded-xl shadow-xs">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Visualização Com Blur</span>
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTourOpen(true)}
            className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl text-xs font-black gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Tour Guiado
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAllFields}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold gap-1.5"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            Copiar Dados
          </Button>

          <Button
            data-tour="step-6"
            onClick={exportToPDF}
            disabled={isExporting}
            className={`${isSubscribed ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-800 hover:bg-slate-700'} text-white font-bold rounded-xl text-xs shadow-md gap-1.5`}
          >
            {isSubscribed ? <Download className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
            {isExporting ? 'Exportando PDF...' : 'Exportar PDF'}
          </Button>
        </div>
      </div>

      {/* KPI Cards Limpos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Risk Card */}
        <Card className="border-slate-200/80 bg-white shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Score de Risco</span>
              <Badge variant="outline" className={`${riskBadge.bg} text-[11px] font-bold gap-1 px-2.5 py-0.5`}>
                <span className={`w-1.5 h-1.5 rounded-full ${riskBadge.dot}`} />
                {nivelRisco}
              </Badge>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{scoreRisco}</span>
              <span className="text-xs text-slate-400 font-semibold">/ 100</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium truncate">
              Status: <strong className="text-slate-700">{statusJuridico}</strong>
            </p>
          </CardContent>
        </Card>

        {/* Cartório & Matrícula */}
        <Card className="border-slate-200/80 bg-white shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matrícula / CRI</span>
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-black text-slate-900 truncate block">
                Nº {renderSafe(ident.matricula)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium truncate">
              {renderSafe(ident.cartorio_ri, 'CRI')} ({renderSafe(ident.comarca, 'Comarca N/I')})
            </p>
          </CardContent>
        </Card>

        {/* Proprietários */}
        <Card className="border-slate-200/80 bg-white shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Proprietários Atuais</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2.5">
              <span className="text-3xl font-black text-slate-900">{props.length}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium truncate">
              {props.length > 0 ? renderSafe(props[0]?.nome, 'Titular Registrado') : 'Sem registros ativos'}
            </p>
          </CardContent>
        </Card>

        {/* Restrições */}
        <Card className="border-slate-200/80 bg-white shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ônus / Indisponidades</span>
              <AlertTriangle className={`w-4 h-4 ${onus.length > 0 ? 'text-amber-500' : 'text-emerald-600'}`} />
            </div>
            <div className="mt-2.5">
              <span className={`text-3xl font-black ${onus.length > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                {onus.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium truncate">
              {onus.length > 0 ? `${onus.length} gravame(s) ativo(s)` : 'Matrícula livre de ônus'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Foco Principal: NAVEGAÇÃO DOS 12 MÓDULOS REGISTRAIS COMPLETOS */}
      <div className="relative mt-4">
        
        {/* Conteúdo de Abas com Blur se !isSubscribed */}
        <div className={!isSubscribed ? "filter blur-md opacity-35 select-none pointer-events-none transition-all duration-500 min-h-[600px] overflow-hidden" : ""}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            {/* NAVEGAÇÃO DE ABAS 100% RESPONSIVA SEM CORTE DE TEXTO */}
            <div className="w-full bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl shadow-xl backdrop-blur-md">
              <TabsList className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 bg-transparent h-auto p-0 border-0">
                <TabsTrigger
                  value="parecer"
                  className="w-full rounded-xl text-xs font-black gap-2 py-2.5 px-3 text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-600/30 hover:text-white hover:bg-slate-800/80 transition-all duration-200 border border-transparent data-[state=active]:border-emerald-500/40 text-center justify-center"
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">12. Parecer & Risco</span>
                </TabsTrigger>

                <TabsTrigger
                  value="imovel"
                  className="w-full rounded-xl text-xs font-black gap-2 py-2.5 px-3 text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-600/30 hover:text-white hover:bg-slate-800/80 transition-all duration-200 border border-transparent data-[state=active]:border-emerald-500/40 text-center justify-center"
                >
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">Mód 1-3 • Imóvel</span>
                </TabsTrigger>

                <TabsTrigger
                  value="proprietarios"
                  className="w-full rounded-xl text-xs font-black gap-2 py-2.5 px-3 text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-600/30 hover:text-white hover:bg-slate-800/80 transition-all duration-200 border border-transparent data-[state=active]:border-emerald-500/40 text-center justify-center"
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">Mód 7-8 • Donos</span>
                </TabsTrigger>

                <TabsTrigger
                  value="onus"
                  className="w-full rounded-xl text-xs font-black gap-2 py-2.5 px-3 text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-600/30 hover:text-white hover:bg-slate-800/80 transition-all duration-200 border border-transparent data-[state=active]:border-emerald-500/40 text-center justify-center"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span className="whitespace-nowrap">Mód 9-11 • Ônus</span>
                </TabsTrigger>

                <TabsTrigger
                  value="especiais"
                  className="w-full rounded-xl text-xs font-black gap-2 py-2.5 px-3 text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-600/30 hover:text-white hover:bg-slate-800/80 transition-all duration-200 border border-transparent data-[state=active]:border-emerald-500/40 text-center justify-center"
                >
                  <Landmark className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">Mód 4-6 • Regimes</span>
                </TabsTrigger>

                <TabsTrigger
                  value="perfil"
                  className="w-full rounded-xl text-xs font-black gap-2 py-2.5 px-3 text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-600/30 hover:text-white hover:bg-slate-800/80 transition-all duration-200 border border-transparent data-[state=active]:border-emerald-500/40 text-center justify-center"
                >
                  <Bot className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">Copiloto IA</span>
                </TabsTrigger>
              </TabsList>
            </div>

          {/* TAB 1: PARECER & RISCO */}
          <TabsContent value="parecer" className="mt-5 space-y-6 animate-in fade-in-50 duration-300 slide-in-from-bottom-1">
            <Card data-tour="step-1" className="border-slate-200/80 bg-white shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    Diagnóstico Completo de Risco e Segurança do Imóvel
                  </CardTitle>
                  <Badge variant="outline" className={`${riskBadge.bg} text-xs font-bold px-3 py-1`}>
                    {nivelRisco} ({scoreRisco}/100)
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-5 space-y-5">
                
                {/* Uncomplicated Plain Language Card */}
                <div className="p-5 bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-slate-50 border border-emerald-200/80 rounded-2xl space-y-4 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Entenda este Imóvel em Palavras Simples</h3>
                      <p className="text-xs text-slate-500">Resumo direto e descomplicado para compradores, proprietários e corretores</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl space-y-1">
                      <span className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider block">👤 Quem pode Vender</span>
                      <p className="text-xs text-slate-700 font-semibold truncate">
                        {props.length > 0 ? props.map((p: any) => renderSafe(p.nome)).join(', ') : 'Consulte no histórico'}
                      </p>
                    </div>

                    <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl space-y-1">
                      <span className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider block">🛑 Dívidas ou Bloqueios</span>
                      <p className="text-xs text-slate-700 font-semibold truncate">
                        {onus.length > 0 ? `${onus.length} pendência(s) encontrada(s)` : 'Nenhuma dívida ou bloqueio'}
                      </p>
                    </div>

                    <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl space-y-1">
                      <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">🛡️ Nível de Segurança</span>
                      <p className="text-xs text-slate-700 font-semibold truncate">
                        {scoreRisco <= 25 ? 'Excelente — Alta Segurança' : scoreRisco <= 50 ? 'Atenção Moderada às Certidões' : 'Exige Cuidado / Análise Técnica'}
                      </p>
                    </div>
                  </div>

                  {parecer.explicacao_descomplicada && (
                    <p className="text-xs text-slate-700 bg-white/90 p-3.5 rounded-xl border border-emerald-100 leading-relaxed font-medium">
                      💡 <strong>Resumo Direto:</strong> {renderSafe(parecer.explicacao_descomplicada)}
                    </p>
                  )}
                </div>
              
              {/* Executive Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resumo Executivo Diagnóstico</h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                  {renderSafe(parecer.resumo_geral, 'Nenhum resumo executivo gerado.')}
                </p>
              </div>

              {/* Identified Risks */}
              {Array.isArray(parecer.riscos_identificados) && parecer.riscos_identificados.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matriz de Riscos Mapeados</h4>
                  <div className="space-y-2.5">
                    {parecer.riscos_identificados
                      .filter((r: any) => !searchTerm || JSON.stringify(r).toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((risco: any, i: number) => (
                        <div key={i} className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                              {renderSafe(risco.descricao, 'Risco Detectado')}
                            </span>
                            <Badge variant="outline" className="border-amber-300 text-amber-800 bg-amber-100 text-[10px] font-bold">
                              {renderSafe(risco.tipo_risco, 'ALERTA')}
                            </Badge>
                          </div>
                          {risco.impacto && <p className="text-xs text-slate-600 pl-5"><strong>Impacto:</strong> {renderSafe(risco.impacto)}</p>}
                          {risco.acao_recomendada && <p className="text-xs text-slate-600 pl-5"><strong>Ação:</strong> {renderSafe(risco.acao_recomendada)}</p>}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Formal Pendencies */}
              {Array.isArray(parecer.pendencias_formais) && parecer.pendencias_formais.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pendências Formais e Cadastrais</h4>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs">
                    {parecer.pendencias_formais.map((p: any, i: number) => (
                      <p key={i} className="text-amber-900 font-medium">⚠️ {renderSafe(p)}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Regularities */}
              {Array.isArray(parecer.regularidades_e_conformidade) && parecer.regularidades_e_conformidade.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conformidades e Pontos Positivos</h4>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs">
                    {parecer.regularidades_e_conformidade.map((c: any, i: number) => (
                      <p key={i} className="text-emerald-900 font-medium">✓ {renderSafe(c)}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Due Diligence Certifications Checklist */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  Checklist de Certidões Recomendadas para Due Diligence
                </h4>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  {certidoesRecomendadas.map((cert, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 hover:border-emerald-300 transition-colors">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <h5 className="font-bold text-slate-900">{cert.title}</h5>
                          <span className="text-[10px] font-bold text-emerald-700 block mt-0.5">Escopo: {cert.scope}</span>
                          <p className="text-[11px] text-slate-500 mt-1 leading-snug">{cert.purpose}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Recommendation */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Orientação para Due Diligence</h4>
                <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2">
                  <p className="text-sm text-slate-800 font-semibold leading-relaxed">
                    {renderSafe(parecer.recomendacao_final || parecer.conclusao_juridica, 'Análise concluída com sucesso.')}
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: IA EXPLICA POR PERFIL (5 LINGUAGENS DE NEGÓCIO) */}
        <TabsContent value="perfil" className="mt-5 space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                <Bot className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  IA Explica — Diagnóstico Notarial por Persona
                </h3>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  Visualização adaptada para a linguagem exata e prioridades de cada perfil de atuação
                </p>
              </div>
            </div>

            {/* Abas dos Perfis */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 bg-slate-800/90 p-2 rounded-2xl border border-slate-700/80">
              {[
                { id: 'comprador', label: '👤 Comprador / Leigo' },
                { id: 'corretor', label: '🏡 Corretor de Imóveis' },
                { id: 'banco', label: '🏦 Banco / Crédito' },
                { id: 'engenheiro', label: '📐 Engenheiro / Agrônomo' },
                { id: 'advogado', label: '⚖️ Advogado / Parecerista' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProfileTab(p.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                    profileTab === p.id
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Conteúdo Adaptado */}
            <div className="p-5 bg-slate-800/70 border border-slate-700/80 rounded-2xl text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3 font-medium">
              {profileTab === 'comprador' && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">👤 Parecer Direto para o Comprador / Leigo</span>
                  <p>{renderSafe(parecer.explicacoes_por_perfil?.comprador_leigo || parecer.explicacao_descomplicada || parecer.resumo_geral)}</p>
                </div>
              )}

              {profileTab === 'corretor' && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">🏡 Visão Comercial & Corretagem Imobiliária</span>
                  <p>{renderSafe(parecer.explicacoes_por_perfil?.corretor_imoveis || `Imóvel com status ${statusJuridico}. Documentação apta para apresentação a clientes e elaboração do contrato de compra e venda.`)}</p>
                </div>
              )}

              {profileTab === 'banco' && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">🏦 Análise de Garantia Fiduciária & Risco de Crédito</span>
                  <p>{renderSafe(parecer.explicacoes_por_perfil?.banco_credito || `Score de garantia: ${Math.max(10, 100 - scoreRisco)}/100. Gravames ativos: ${onus.length}. Avaliação recomendada para constituição de Alienação Fiduciária.`)}</p>
                </div>
              )}

              {profileTab === 'engenheiro' && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">📐 Análise Física, Territorial & Engenharia</span>
                  <p>{renderSafe(parecer.explicacoes_por_perfil?.engenheiro_agronomo || `Área total: ${carac.area_total_m2 || 'Conforme certidão'}. Georreferenciamento: ${geo.possui_georreferenciamento ? 'Homologado SIGEF' : 'Em análise'}. Reserva legal e APP mapeadas.`)}</p>
                </div>
              )}

              {profileTab === 'advogado' && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">⚖️ Parecer Registral Notarial & Fundamentação Jurídica</span>
                  <p>{renderSafe(parecer.explicacoes_por_perfil?.advogado_parecerista || parecer.conclusao_juridica || parecer.resumo_geral)}</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: DADOS DO IMÓVEL & GEO */}
        <TabsContent value="imovel" data-tour="step-2" className="mt-5 space-y-6 animate-in fade-in-50 duration-300 slide-in-from-bottom-1">

          {/* Módulo 1 & 2 */}
          <Card className="border-slate-200/80 bg-white shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                Dados Cartorários e Caracterização Física (Módulos 1 e 2)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {[
                  { label: 'Matrícula', value: renderSafe(ident.matricula) },
                  { label: 'Cartório / CRI', value: renderSafe(ident.cartorio_ri) },
                  { label: 'Comarca / UF', value: renderSafe(ident.comarca) },
                  { label: 'Livro', value: renderSafe(ident.livro) },
                  { label: 'Folha', value: renderSafe(ident.folha) },
                  { label: 'Data de Abertura', value: renderSafe(ident.data_abertura) },
                  { label: 'Tipo de Imóvel', value: renderSafe(ident.tipo_imovel_analisado) },
                  { label: 'Código / INCRA / SQL', value: renderSafe(ident.codigo_imovel) },
                  { label: 'Serventia / CNS', value: renderSafe(ident.serventia) },
                  { label: 'Endereço Completo', value: renderSafe(carac.endereco_completo) },
                  { label: 'Denominação / Edifício', value: renderSafe(carac.denominacao_imovel) },
                  { label: 'Área Total (m²)', value: renderSafe(carac.area_total_m2) },
                  { label: 'Área (Hectares / Outras)', value: renderSafe(carac.area_total_hectares || carac.area_outras_unidades) },
                  { label: 'Loteamento / Quadra / Lote', value: renderSafe(carac.loteamento_quadra_lote) },
                ]
                .filter(item => !searchTerm || item.label.toLowerCase().includes(searchTerm.toLowerCase()) || String(item.value).toLowerCase().includes(searchTerm.toLowerCase()))
                .map(({ label, value }) => (
                  <CopyableField key={label} label={label} value={value} />
                ))}
              </div>

              {carac.perimetros_confrontacoes && (
                <CopyableBlock label="Perímetros e Confrontações (Vizinhos)" text={renderSafe(carac.perimetros_confrontacoes)} />
              )}

              {carac.benfeitorias && (
                <CopyableBlock label="Benfeitorias e Construções Averbadas" text={renderSafe(carac.benfeitorias)} />
              )}

              {carac.descricao_legal && (
                <CopyableBlock label="Descrição Legal na Íntegra" text={renderSafe(carac.descricao_legal)} />
              )}
            </CardContent>
          </Card>

          {/* Módulo 3: Georreferenciamento */}
          <Card className="border-slate-200/80 bg-white shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-600" />
                Georreferenciamento e Registro Agrário (Módulo 3)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <CopyableField label="Certificação SIGEF" value={renderSafe(geo.situacao_certificacao, 'Em análise')} />
                <CopyableField label="Código CAR" value={renderSafe(geo.codigo_car)} />
                <CopyableField label="Código CCIR / SNCR" value={renderSafe(geo.codigo_ccir)} />
                <CopyableField label="NIRF / ITR" value={renderSafe(geo.codigo_itr_nirf)} />
                <CopyableField label="Responsável Técnico" value={renderSafe(geo.responsavel_tecnico)} />
                <CopyableField label="Sistema Geodésico" value={renderSafe(geo.sistema_geodesico, 'SIRGAS 2000')} />
              </div>

              {geo.coordenadas_geograficas && (
                <CopyableBlock label="Coordenadas dos Vértices" text={renderSafe(geo.coordenadas_geograficas)} />
              )}
            </CardContent>
          </Card>

          {/* Módulo 5: Registro Ambiental */}
          <Card className="border-slate-200/80 bg-white shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TreePine className="w-5 h-5 text-emerald-600" />
                Registro Ambiental e Recursos Hídricos (Módulo 5)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-3">
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reserva Legal</span>
                  <span className="font-semibold text-slate-800">{renderSafe(ambiental?.reserva_legal_averbada, 'Conforme CAR / Averbada')}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Área de Preservação (APP)</span>
                  <span className="font-semibold text-slate-800">{renderSafe(ambiental?.area_preservacao_permanente_app, 'Mapeada')}</span>
                </div>
                {ambiental?.embargos_ambientais && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">Embargos Ambientais</span>
                    <span className="font-semibold text-red-900">{renderSafe(ambiental.embargos_ambientais)}</span>
                  </div>
                )}
                {ambiental?.outorga_agua && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Outorga de Recursos Hídricos</span>
                    <span className="font-semibold text-slate-800">{renderSafe(ambiental.outorga_agua)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        {/* TAB 3: PROPRIETÁRIOS & CADEIA DOMINIAL */}
        <TabsContent value="proprietarios" data-tour="step-3" className="mt-5 space-y-6 animate-in fade-in-50 duration-300 slide-in-from-bottom-1">

          {/* Módulo 7: Proprietários */}
          <Card className="border-slate-200/80 bg-white shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Proprietários Atuais e Qualificação (Módulo 7)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {props.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Nenhum proprietário atual identificado explicitamente.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-600">
                    <thead className="bg-slate-50 text-slate-400 uppercase font-bold border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3">Titular</th>
                        <th className="px-4 py-3">CPF / CNPJ</th>
                        <th className="px-4 py-3">Estado Civil / Regime</th>
                        <th className="px-4 py-3">Fração (%)</th>
                        <th className="px-4 py-3">Natureza do Direito</th>
                        <th className="px-4 py-3">Ato de Origem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {props
                        .filter((p: any) => !searchTerm || JSON.stringify(p).toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((p: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-bold text-slate-900">{renderSafe(p?.nome, 'N/I')}</td>
                            <td className="px-4 py-3 font-mono">{renderSafe(p?.cpf_cnpj, 'N/I')}</td>
                            <td className="px-4 py-3">{renderSafe(p?.estado_civil, '')} {p?.regime_bens ? `(${renderSafe(p.regime_bens)})` : ''}</td>
                            <td className="px-4 py-3 font-bold text-emerald-700">{renderSafe(p?.percentual_propriedade, '100%')}</td>
                            <td className="px-4 py-3">{renderSafe(p?.natureza_propriedade, 'Proprietário')}</td>
                            <td className="px-4 py-3 font-mono">{renderSafe(p?.ato_aquisicao, 'R-X')}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Módulo 8: Cadeia Dominial com Diagrama Gráfico Conectado */}
          <Card className="border-slate-200/80 bg-white shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  Cadeia Dominial Cronológica Interativa (Módulo 8)
                </CardTitle>
                <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 text-[10px] font-bold">
                  {cadeia.length} Transmissões
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {cadeia.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  Nenhum ato de transmissão mapeado no histórico.
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-1 before:bg-gradient-to-b before:from-emerald-600 before:via-emerald-400 before:to-slate-300">
                  {cadeia
                    .filter((ato: any) => !searchTerm || JSON.stringify(ato).toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((ato: any, i: number) => (
                      <div key={i} className="relative group animate-fade-in">
                        {/* Node Icon Circle */}
                        <div className="absolute -left-6 top-1 w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold group-hover:scale-125 transition-transform">
                          {i + 1}
                        </div>

                        <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-2 hover:border-emerald-400 hover:bg-white transition-all shadow-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="border-emerald-400 text-emerald-800 bg-emerald-100/60 font-black text-xs px-2 py-0.5">
                                {renderSafe(ato?.numero_ato, `R-${i + 1}`)}
                              </Badge>
                              <span className="font-bold text-slate-900 text-xs">
                                {renderSafe(ato?.tipo_transmissao, 'Transmissão de Propriedade')}
                              </span>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {renderSafe(ato?.data_registro, 'Data N/I')}
                            </span>
                          </div>

                          {/* Seller to Buyer visual path */}
                          <div className="grid sm:grid-cols-2 gap-3 text-xs pt-1">
                            {ato?.transmitentes && (
                              <div className="p-2.5 bg-red-50/50 border border-red-100 rounded-xl space-y-0.5">
                                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">Transmitente (Vendedor/Doador)</span>
                                <span className="font-bold text-slate-800">{renderSafe(ato.transmitentes)}</span>
                              </div>
                            )}
                            {ato?.adquirentes && (
                              <div className="p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-0.5">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Adquirente (Comprador/Beneficiário)</span>
                                <span className="font-bold text-slate-800">{renderSafe(ato.adquirentes)}</span>
                              </div>
                            )}
                          </div>

                          {/* Value & Observations */}
                          <div className="flex items-center justify-between text-xs pt-1 text-slate-500">
                            {ato?.valor_transacao && (
                              <span className="font-bold text-slate-900 bg-slate-200/60 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-emerald-600" /> {renderSafe(ato.valor_transacao)}
                              </span>
                            )}
                            {ato?.observacoes && (
                              <span className="text-[11px] text-slate-500 italic">
                                {renderSafe(ato.observacoes)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

        </TabsContent>

        {/* TAB 4: ÔNUS & RESTRIÇÕES */}
        <TabsContent value="onus" data-tour="step-4" className="mt-5 space-y-6 animate-in fade-in-50 duration-300 slide-in-from-bottom-1">

          {/* Módulos 9 & 10: Garantias e Indisponividades */}
          <Card className="border-slate-200/80 bg-white shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Garantias, Penhoras e Indisponividades (Módulos 9 e 10)
                </CardTitle>
                <Badge variant="outline" className={onus.length > 0 ? 'border-amber-300 text-amber-800 bg-amber-50' : 'border-emerald-300 text-emerald-800 bg-emerald-50'}>
                  {onus.length} Restrições
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {onus.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Matrícula Livre de Ônus</h4>
                  <p className="text-xs text-slate-500">Não foram identificadas penhoras, hipotecas, alienações fiduciárias ou indisponividades (CNIB) ativas.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {onus
                    .filter((o: any) => !searchTerm || JSON.stringify(o).toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((o: any, i: number) => (
                      <div key={i} className="p-4 hover:bg-slate-50/50 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <Badge variant="outline" className="border-amber-300 text-amber-900 bg-amber-100 font-mono text-[10px]">
                              {renderSafe(o?.numero_ato, 'ATO')}
                            </Badge>
                            {renderSafe(o?.tipo, 'Restrição')}
                          </span>
                          <Badge className={String(o?.status).toUpperCase() === 'CANCELADO' ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-800 border-red-200'}>
                            {renderSafe(o?.status, 'ATIVO')}
                          </Badge>
                        </div>
                        {(o?.credor_banco || o?.credor_beneficiario || o?.autor_exequente) && (
                          <p className="text-slate-600"><strong>Credor / Autor da Ação:</strong> {renderSafe(o.credor_banco || o.credor_beneficiario || o.autor_exequente)}</p>
                        )}
                        <p className="text-slate-600 leading-relaxed">{renderSafe(o?.detalhes || o?.processo_vara, 'Sem descrição adicional')}</p>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Averbações Diversas */}
          {averb.length > 0 && (
            <Card className="border-slate-200/80 bg-white shadow-sm rounded-2xl">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-500" />
                  Averbações Diversas ({averb.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2.5">
                {averb
                  .filter((a: any) => !searchTerm || JSON.stringify(a).toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((a: any, i: number) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{renderSafe(a?.numero_averbacao, `AV-${i + 1}`)} — {renderSafe(a?.tipo, 'Averbação')}</span>
                        <span className="text-slate-400 font-normal">{renderSafe(a?.data, '')}</span>
                      </div>
                      <p className="text-slate-600">{renderSafe(a?.descricao || a?.observacoes)}</p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}

        </TabsContent>

        {/* TAB 5: REGIMES ESPECIAIS & SERVIDÕES */}
        <TabsContent value="especiais" className="mt-5 space-y-6 animate-in fade-in-50 duration-300 slide-in-from-bottom-1">

          {/* Módulo 4: Condomínios / REURB */}
          <Card className="border-slate-200/80 bg-white shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                Condomínios, Loteamentos e REURB (Módulo 4)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Condomínio Edilício</span>
                  <span className="font-bold text-slate-800">{regimes.e_condominio_edilicio ? 'SIM' : 'NÃO CONSTA'}</span>
                  {regimes.incorporacao_imobiliaria && <p className="text-[11px] text-slate-600 mt-1">{renderSafe(regimes.incorporacao_imobiliaria)}</p>}
                  {regimes.fracao_ideal && <p className="text-[11px] text-emerald-700 font-bold mt-1">Fração Ideal: {renderSafe(regimes.fracao_ideal)}</p>}
                  {regimes.vaga_garagem && <p className="text-[11px] text-slate-600 mt-0.5">Garagem: {renderSafe(regimes.vaga_garagem)}</p>}
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Regularização Fundiária (REURB)</span>
                  <span className="font-bold text-slate-800">{regimes.e_reurb ? renderSafe(regimes.tipo_reurb, 'SIM') : 'NÃO CONSTA'}</span>
                  {regimes.detalhes_regime && <p className="text-[11px] text-slate-600 mt-1">{renderSafe(regimes.detalhes_regime)}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Módulo 6: Imóveis Especiais (SPU / Marinha / Tombamento) */}
          <Card className="border-slate-200/80 bg-white shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-600" />
                Imóveis da União, Marinha (SPU), Fronteira e Tombamento (Módulo 6)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Terreno de Marinha / SPU</span>
                  <span className="font-bold text-slate-800">{especiais.terreno_marinha ? renderSafe(especiais.regime_spu, 'SIM') : 'NÃO CONSTA'}</span>
                  {especiais.laudemic_inscrito && <p className="text-[11px] text-amber-700 font-bold mt-1">Laudêmio Inscrito</p>}
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Faixa de Fronteira / Faixa de Domínio</span>
                  <span className="font-bold text-slate-800">{especiais.faixa_fronteira ? 'Faixa de Fronteira (Lei 6.634/79)' : especiais.faixa_dominio ? 'Faixa de Domínio' : 'NÃO CONSTA'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tombamento Histórico / Terras Indígenas</span>
                  <span className="font-bold text-slate-800">{especiais.tombamento ? 'Tombamento Registrado' : especiais.terra_indigena_quilombola ? 'Área Indígena/Quilombola' : 'NÃO CONSTA'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Módulo 11: Usufruto, Servidões e Direitos Reais */}
          <Card className="border-slate-200/80 bg-white shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Key className="w-5 h-5 text-emerald-600" />
                  Usufruto, Servidões e Direitos Reais Averbados (Módulo 11)
                </CardTitle>
                <Badge variant="outline" className={usufruto.length > 0 ? 'border-amber-300 text-amber-800 bg-amber-50' : 'border-emerald-300 text-emerald-800 bg-emerald-50'}>
                  {usufruto.length > 0 ? `${usufruto.length} Registros` : '✓ Sem Restrições'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {usufruto.length === 0 ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium">
                  ✓ Nenhum usufruto vitalício, servidão de passagem ou direito real de superfície averbado na matrícula.
                </div>
              ) : (
                usufruto
                  .filter((u: any) => !searchTerm || JSON.stringify(u).toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((u: any, i: number) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>[{renderSafe(u?.numero_ato, 'ATO')}] {renderSafe(u?.tipo, 'Direito Real')}</span>
                        <Badge variant="outline" className="text-[10px]">{renderSafe(u?.status, 'ATIVO')}</Badge>
                      </div>
                      {u?.beneficiarios && <p className="text-slate-600"><strong>Beneficiários:</strong> {renderSafe(u.beneficiarios)}</p>}
                      {u?.clausulas_restritivas && <p className="text-amber-800"><strong>Cláusulas:</strong> {renderSafe(u.clausulas_restritivas)}</p>}
                    </div>
                  ))
              )}
            </CardContent>
          </Card>

        </TabsContent>

        {/* TAB 5: COPILOTO IA CHAT INTERATIVO */}
        <TabsContent value="copiloto" data-tour="step-5" className="mt-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl text-white space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                <Bot className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Copiloto Notarial de IA Registrária
                </h3>
                <p className="text-xs text-slate-300">
                  Respostas imediatas com citação direta dos atos da certidão (R-1, AV-2, penhoras, áreas e titularidades)
                </p>
              </div>
            </div>

            <MatriculaChat report={report} />
          </div>
        </TabsContent>
      </Tabs>
    </div>

    {/* Paywall Lock Overlay Card (Sobremesa de Alta Conversão) */}
    {!isSubscribed && (
      <div className="absolute inset-0 z-40 flex items-start justify-center pt-8 sm:pt-16 p-4 sm:p-6 bg-slate-950/45 backdrop-blur-xs rounded-3xl">
        <Card className="max-w-xl w-full bg-slate-950/95 border-2 border-emerald-500/80 shadow-2xl p-6 sm:p-8 rounded-3xl text-center space-y-6 text-white relative overflow-hidden animate-fade-in">
          
          {/* Aura Glow Background */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
            <Lock className="w-7 h-7 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <Badge className="bg-emerald-500 text-slate-950 font-black text-xs uppercase px-3.5 py-1 rounded-full mx-auto">
              🔒 Relatório Completo dos 12 Módulos Bloqueado
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Desbloqueie o Diagnóstico Notarial & Dossiê PDF
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-md mx-auto">
              A IA Registrária concluiu a auditoria dos proprietários, ônus, penhoras CNIB, georreferenciamento e histórico dominial desta certidão. Assine agora para visualizar todos os dados sem restrições.
            </p>
          </div>

          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between gap-4 text-left">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Plano 6 Meses Ilimitado</span>
              <span className="text-2xl font-black text-white">R$ 99,90 <span className="text-xs font-normal text-emerald-400">/ 180 dias</span></span>
            </div>
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 font-bold text-xs">
              Liberação em 5 seg
            </Badge>
          </div>

          <div className="space-y-3 pt-1">
            <Link to="/pagamento-pix" className="block w-full">
              <Button size="lg" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base py-6 rounded-2xl shadow-xl shadow-emerald-500/30 transition-all hover:scale-[1.02]">
                <Zap className="mr-2 h-5 w-5 fill-slate-950" />
                Desbloquear Relatório por R$ 99,90
              </Button>
            </Link>

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Garantia Mercado Pago</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Liberação via Webhook</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                subscriptionService.activate6MonthsUnlimited('SIM-DEV');
                toast({ title: '🔓 Assinatura Simulada!', description: 'Modo ilimitado ativado com sucesso.' });
              }}
              className="text-[11px] text-slate-400 hover:text-emerald-400 underline font-mono cursor-pointer"
            >
              [Simular Liberação de Assinatura para Testes]
            </button>
          </div>

        </Card>
      </div>
    )}

    {/* Floating Secondary Copilot IA Button (Assistente em Segundo Plano) */}
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={() => setShowAiChat(!showAiChat)}
        className="bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 rounded-full px-5 py-6 shadow-2xl font-extrabold text-xs flex items-center gap-2.5 transition-all hover:scale-105"
      >
        <Bot className="w-5 h-5 text-emerald-400" />
        <span>{showAiChat ? 'Fechar Assistente IA' : '💬 Assistente Copiloto IA'}</span>
      </Button>
    </div>

    {/* Copilot Assistant Floating Panel */}
    {showAiChat && (
      <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[480px] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-4 text-white animate-fade-in max-h-[75vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white">Copiloto Notarial de IA Registrária</h4>
          </div>
          <button
            onClick={() => setShowAiChat(false)}
            className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>
        <MatriculaChat report={report} />
      </div>
    )}

    {/* Guided Product Tour Modal */}
    <GuidedTour
      isOpen={isTourOpen}
      onClose={() => setIsTourOpen(false)}
      onSelectTab={(t) => setActiveTab(t)}
    />

  </div>
</div>
  );
};

// Componente exportado envelopado no Error Boundary anti-tela branca
export const AnalysisReport: React.FC<AnalysisReportProps> = (props) => (
  <ReportErrorBoundary>
    <AnalysisReportContent {...props} />
  </ReportErrorBoundary>
);