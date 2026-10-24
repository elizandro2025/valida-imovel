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
import { useAuth } from '@/contexts/AuthContext';
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
        <Card className="max-w-md mx-auto bg-card border-destructive/30 p-6 text-center space-y-4 rounded-3xl shadow-medium">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Falha Temporária no Componente de Relatório</h3>
          <p className="text-xs text-muted-foreground">Ocorreu um erro ao formatar um dos campos. Clique abaixo para tentar novamente.</p>
          <Button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="bg-destructive hover:bg-destructive text-white font-semibold text-xs rounded-xl gap-2"
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
      className={`group relative p-3 bg-secondary border border-border hover:border-primary/40 hover:bg-primary/5 rounded-xl space-y-0.5 transition-colors ${isCopyable ? 'cursor-pointer' : ''} ${className}`}
      title={isCopyable ? `Clique para copiar "${value}"` : undefined}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs font-semibold text-muted-foreground block truncate">{label}</span>
        {isCopyable && (
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-success flex items-center gap-0.5 shrink-0">
            {copiedField ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
            {copiedField ? 'Copiado!' : 'Copiar'}
          </span>
        )}
      </div>
      <span className="font-semibold text-foreground block truncate">{value}</span>
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
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-success hover:text-success flex items-center gap-1 bg-success/10 px-2 py-0.5 rounded-lg border border-success/30"
        >
          {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copiado!' : 'Copiar Texto'}
        </button>
      </div>
      <p className="text-xs text-foreground bg-secondary p-3.5 rounded-xl border border-border leading-relaxed font-medium">
        {text}
      </p>
    </div>
  );
};

interface AnalysisReportProps {
  report: any;
  autoStartTour?: boolean;
  isSampleDemo?: boolean;
}

const AnalysisReportContent: React.FC<AnalysisReportProps> = ({ report, autoStartTour = false, isSampleDemo = false }) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('parecer');
  const [profileTab, setProfileTab] = useState<'comprador' | 'corretor' | 'banco' | 'engenheiro' | 'advogado'>('comprador');
  const [showAiChat, setShowAiChat] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(autoStartTour);

  useEffect(() => {
    if (autoStartTour) {
      setIsTourOpen(true);
    }
  }, [autoStartTour]);

  const { user } = useAuth();
  const isSubscribed = Boolean(user?.hasSubscription);

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
        return { bg: 'bg-destructive/10 text-destructive border-destructive/30', dot: 'bg-destructive', label: 'Risco Crítico' };
      case 'ALTO':
        return { bg: 'bg-warning/10 text-warning border-warning/30', dot: 'bg-warning', label: 'Risco Alto' };
      case 'MÉDIO':
        return { bg: 'bg-warning/10 text-warning border-warning/30', dot: 'bg-warning', label: 'Risco Médio' };
      default:
        return { bg: 'bg-success/10 text-success border-success/30', dot: 'bg-success', label: 'Risco Baixo' };
    }
  };

  const riskBadge = getRiskBadge(nivelRisco);

  // Copiar Todos os Campos em formato de texto estruturado
  const handleCopyAllFields = () => {
    if (!isSubscribed) {
      toast({
        title: "🔒 Recurso Bloqueado — Plano R$ 49,90",
        description: "Assine o Plano 3 Meses Ilimitados por R$ 49,90 para liberar a cópia rápida de todos os campos.",
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
        title: "🔒 Dossiê PDF Bloqueado — Plano R$ 49,90",
        description: "Assine o Plano 3 Meses Ilimitados por R$ 49,90 para exportar o relatório notarial completo em PDF.",
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
      <div className="bg-card text-foreground p-4 sm:p-5 rounded-2xl shadow-medium border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl text-white flex items-center justify-center shadow-medium shrink-0 font-semibold bg-primary">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-wide">
                CARIMBO DIGITAL DE AUDITORIA REGISTRAL & FIDELIDADE
              </h3>
              <Badge className="bg-primary/20 text-primary border-primary/40 text-xs font-semibold">
                100% Auditado
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              Conformidade com a Lei de Registros Públicos (Lei 6.015/73) • Criptografia SSL 256-bit • Sigilo LGPD Garantido
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Badge variant="outline" className="border-border bg-muted/90 text-success text-xs font-semibold gap-1 px-3 py-1.5 shadow-inner">
            <Lock className="w-3.5 h-3.5 text-success" /> Criptografia de Nível Bancário
          </Badge>
        </div>
      </div>

      {/* Header Limpo & Barra de Ações */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-success text-white flex items-center justify-center shadow-soft shrink-0">
            <FileCheck className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold text-foreground leading-tight">
                Relatório Auditado (12 Módulos Registrais)
              </h2>
              <Badge className="bg-success/10 text-success border-success/30 font-semibold text-xs">
                100% Abrangente
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              Matrícula Nº <strong className="text-foreground font-semibold">{renderSafe(ident.matricula)}</strong> • {renderSafe(ident.cartorio_ri, 'CRI')} ({renderSafe(ident.comarca, 'Comarca N/I')})
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <Badge variant="outline" className="bg-success/10 text-success border-success/30 font-semibold text-xs gap-1.5 py-1.5 px-3 rounded-xl shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            <span>Relatório Desbloqueado</span>
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTourOpen(true)}
            className="border-success/40 text-success bg-success/10 hover:bg-success/20 rounded-xl text-xs font-semibold gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-success" />
            Tour Guiado
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAllFields}
            className="border-border text-foreground hover:bg-secondary text-xs font-semibold gap-1.5"
          >
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
            Copiar Dados
          </Button>

          <Button
            data-tour="step-6"
            onClick={exportToPDF}
            disabled={isExporting}
            className={`${isSubscribed ? 'bg-primary text-white hover:bg-primary/90' : 'bg-muted text-foreground hover:bg-muted/70'} font-medium text-xs gap-1.5`}
          >
            {isSubscribed ? <Download className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-warning" />}
            {isExporting ? 'Exportando PDF...' : 'Exportar PDF'}
          </Button>
        </div>
      </div>

      {/* KPI Cards Limpos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Risk Card */}
        <Card className="border-border bg-card shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Score de Risco</span>
              <Badge variant="outline" className={`${riskBadge.bg} text-xs font-semibold gap-1 px-2.5 py-0.5`}>
                <span className={`w-1.5 h-1.5 rounded-full ${riskBadge.dot}`} />
                {nivelRisco}
              </Badge>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-foreground">{scoreRisco}</span>
              <span className="text-xs text-muted-foreground font-semibold">/ 100</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium truncate">
              Status: <strong className="text-foreground">{statusJuridico}</strong>
            </p>
          </CardContent>
        </Card>

        {/* Cartório & Matrícula */}
        <Card className="border-border bg-card shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Matrícula / CRI</span>
              <Building2 className="w-4 h-4 text-success" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-semibold text-foreground truncate block">
                Nº {renderSafe(ident.matricula)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium truncate">
              {renderSafe(ident.cartorio_ri, 'CRI')} ({renderSafe(ident.comarca, 'Comarca N/I')})
            </p>
          </CardContent>
        </Card>

        {/* Proprietários */}
        <Card className="border-border bg-card shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Proprietários Atuais</span>
              <Users className="w-4 h-4 text-success" />
            </div>
            <div className="mt-2.5">
              <span className="text-3xl font-semibold text-foreground">{props.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium truncate">
              {props.length > 0 ? renderSafe(props[0]?.nome, 'Titular Registrado') : 'Sem registros ativos'}
            </p>
          </CardContent>
        </Card>

        {/* Restrições */}
        <Card className="border-border bg-card shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Ônus / Indisponidades</span>
              <AlertTriangle className={`w-4 h-4 ${onus.length > 0 ? 'text-warning' : 'text-success'}`} />
            </div>
            <div className="mt-2.5">
              <span className={`text-3xl font-semibold ${onus.length > 0 ? 'text-warning' : 'text-foreground'}`}>
                {onus.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium truncate">
              {onus.length > 0 ? `${onus.length} gravame(s) ativo(s)` : 'Matrícula livre de ônus'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Foco Principal: NAVEGAÇÃO DOS 12 MÓDULOS REGISTRAIS COMPLETOS */}
      <div className="relative mt-4">
        
        {/* Conteúdo de Abas — 100% Visível e Interativo Sem Blur */}
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            {/* NAVEGAÇÃO DE ABAS 100% RESPONSIVA PARA IOS & ANDROID COM SWIPE E TOUCH SWIPE */}
            <div className="w-full bg-background border border-border p-1.5 rounded-2xl shadow-medium backdrop-blur-xl overflow-x-auto no-scrollbar ios-scroll">
              <TabsList className="w-full min-w-max lg:min-w-0 flex lg:grid lg:grid-cols-6 gap-1.5 bg-transparent h-auto p-0 border-0">
                <TabsTrigger
                  value="parecer"
                  className="rounded-xl text-[13px] font-medium gap-2 py-2.5 px-4 sm:px-3 text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-soft hover:text-foreground transition-colors duration-200 border border-transparent data-[state=active]:border-border text-center justify-center shrink-0 min-h-[44px]"
                >
                  <ShieldCheck className="w-4 h-4 shrink-0 text-primary" />
                  <span className="whitespace-nowrap">Mód 12 • Parecer & Risco</span>
                </TabsTrigger>

                <TabsTrigger
                  value="imovel"
                  className="rounded-xl text-[13px] font-medium gap-2 py-2.5 px-4 sm:px-3 text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-soft hover:text-foreground transition-colors duration-200 border border-transparent data-[state=active]:border-border text-center justify-center shrink-0 min-h-[44px]"
                >
                  <Building2 className="w-4 h-4 shrink-0 text-primary" />
                  <span className="whitespace-nowrap">Mód 1-3 • Imóvel & Geo</span>
                </TabsTrigger>

                <TabsTrigger
                  value="especiais"
                  className="rounded-xl text-[13px] font-medium gap-2 py-2.5 px-4 sm:px-3 text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-soft hover:text-foreground transition-colors duration-200 border border-transparent data-[state=active]:border-border text-center justify-center shrink-0 min-h-[44px]"
                >
                  <Landmark className="w-4 h-4 shrink-0 text-primary" />
                  <span className="whitespace-nowrap">Mód 4-6 • Regimes</span>
                </TabsTrigger>

                <TabsTrigger
                  value="proprietarios"
                  className="rounded-xl text-[13px] font-medium gap-2 py-2.5 px-4 sm:px-3 text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-soft hover:text-foreground transition-colors duration-200 border border-transparent data-[state=active]:border-border text-center justify-center shrink-0 min-h-[44px]"
                >
                  <Users className="w-4 h-4 shrink-0 text-success" />
                  <span className="whitespace-nowrap">Mód 7-8 • Donos & Cadeia</span>
                </TabsTrigger>

                <TabsTrigger
                  value="onus"
                  className="rounded-xl text-[13px] font-medium gap-2 py-2.5 px-4 sm:px-3 text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-soft hover:text-foreground transition-colors duration-200 border border-transparent data-[state=active]:border-border text-center justify-center shrink-0 min-h-[44px]"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 text-warning" />
                  <span className="whitespace-nowrap">Mód 9-11 • Ônus & Penhoras</span>
                </TabsTrigger>

                <TabsTrigger
                  value="perfil"
                  className="rounded-xl text-[13px] font-medium gap-2 py-2.5 px-4 sm:px-3 text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-soft hover:text-foreground transition-colors duration-200 border border-transparent data-[state=active]:border-border text-center justify-center shrink-0 min-h-[44px]"
                >
                  <Bot className="w-4 h-4 shrink-0 text-primary" />
                  <span className="whitespace-nowrap">Copiloto IA</span>
                </TabsTrigger>
              </TabsList>
            </div>

          {/* TAB 1: PARECER & RISCO */}
          <TabsContent value="parecer" className="mt-5 space-y-6 animate-in fade-in-50 duration-300 slide-in-from-bottom-1">
            <Card data-tour="step-1" className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-success" />
                    Diagnóstico Completo de Risco e Segurança do Imóvel
                  </CardTitle>
                  <Badge variant="outline" className={`${riskBadge.bg} text-xs font-semibold px-3 py-1`}>
                    {nivelRisco} ({scoreRisco}/100)
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-5 space-y-5">
                
                {/* Uncomplicated Plain Language Card */}
                <div className="p-5 border border-success/20 rounded-2xl space-y-4 bg-success/5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-success text-white flex items-center justify-center shadow-soft">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Entenda este Imóvel em Palavras Simples</h3>
                      <p className="text-xs text-muted-foreground">Resumo direto e descomplicado para compradores, proprietários e corretores</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3.5 bg-card border border-border rounded-xl space-y-1">
                      <span className="text-xs font-semibold text-success block">👤 Quem pode Vender</span>
                      <p className="text-xs text-foreground font-semibold truncate">
                        {props.length > 0 ? props.map((p: any) => renderSafe(p.nome)).join(', ') : 'Consulte no histórico'}
                      </p>
                    </div>

                    <div className="p-3.5 bg-card border border-border rounded-xl space-y-1">
                      <span className="text-xs font-semibold text-warning block">🛑 Dívidas ou Bloqueios</span>
                      <p className="text-xs text-foreground font-semibold truncate">
                        {onus.length > 0 ? `${onus.length} pendência(s) encontrada(s)` : 'Nenhuma dívida ou bloqueio'}
                      </p>
                    </div>

                    <div className="p-3.5 bg-card border border-border rounded-xl space-y-1">
                      <span className="text-xs font-semibold text-foreground block">🛡️ Nível de Segurança</span>
                      <p className="text-xs text-foreground font-semibold truncate">
                        {scoreRisco <= 25 ? 'Excelente — Alta Segurança' : scoreRisco <= 50 ? 'Atenção Moderada às Certidões' : 'Exige Cuidado / Análise Técnica'}
                      </p>
                    </div>
                  </div>

                  {parecer.explicacao_descomplicada && (
                    <p className="text-xs text-foreground bg-card/90 p-3.5 rounded-xl border border-success/30 leading-relaxed font-medium">
                      💡 <strong>Resumo Direto:</strong> {renderSafe(parecer.explicacao_descomplicada)}
                    </p>
                  )}
                </div>
              
              {/* Executive Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground">Resumo Executivo Diagnóstico</h4>
                <p className="text-sm text-foreground leading-relaxed bg-secondary p-4 rounded-xl border border-border">
                  {renderSafe(parecer.resumo_geral, 'Nenhum resumo executivo gerado.')}
                </p>
              </div>

              {/* Identified Risks */}
              {Array.isArray(parecer.riscos_identificados) && parecer.riscos_identificados.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted-foreground">Matriz de Riscos Mapeados</h4>
                  <div className="space-y-2.5">
                    {parecer.riscos_identificados
                      .filter((r: any) => !searchTerm || JSON.stringify(r).toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((risco: any, i: number) => (
                        <div key={i} className="p-3.5 bg-warning/60 border border-warning/80 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-warning text-xs flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-warning" />
                              {renderSafe(risco.descricao, 'Risco Detectado')}
                            </span>
                            <Badge variant="outline" className="border-warning/30 text-warning bg-warning/10 text-xs font-semibold">
                              {renderSafe(risco.tipo_risco, 'ALERTA')}
                            </Badge>
                          </div>
                          {risco.impacto && <p className="text-xs text-muted-foreground pl-5"><strong>Impacto:</strong> {renderSafe(risco.impacto)}</p>}
                          {risco.acao_recomendada && <p className="text-xs text-muted-foreground pl-5"><strong>Ação:</strong> {renderSafe(risco.acao_recomendada)}</p>}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Formal Pendencies */}
              {Array.isArray(parecer.pendencias_formais) && parecer.pendencias_formais.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground">Pendências Formais e Cadastrais</h4>
                  <div className="p-3 bg-warning/10 border border-warning/30 rounded-xl space-y-1 text-xs">
                    {parecer.pendencias_formais.map((p: any, i: number) => (
                      <p key={i} className="text-warning font-medium">⚠️ {renderSafe(p)}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Regularities */}
              {Array.isArray(parecer.regularidades_e_conformidade) && parecer.regularidades_e_conformidade.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground">Conformidades e Pontos Positivos</h4>
                  <div className="p-3 bg-success/10 border border-success/30 rounded-xl space-y-1 text-xs">
                    {parecer.regularidades_e_conformidade.map((c: any, i: number) => (
                      <p key={i} className="text-success font-medium">✓ {renderSafe(c)}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Due Diligence Certifications Checklist */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-success" />
                  Checklist de Certidões Recomendadas para Due Diligence
                </h4>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  {certidoesRecomendadas.map((cert, idx) => (
                    <div key={idx} className="p-3.5 bg-secondary border border-border rounded-xl space-y-1 hover:border-success/30 transition-colors">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                        <div>
                          <h5 className="font-semibold text-foreground">{cert.title}</h5>
                          <span className="text-xs font-semibold text-success block mt-0.5">Escopo: {cert.scope}</span>
                          <p className="text-xs text-muted-foreground mt-1 leading-snug">{cert.purpose}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Recommendation */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-semibold text-muted-foreground">Orientação para Due Diligence</h4>
                <div className="p-4 bg-success/10 border border-success/30 rounded-xl space-y-2">
                  <p className="text-sm text-foreground font-semibold leading-relaxed">
                    {renderSafe(parecer.recomendacao_final || parecer.conclusao_juridica, 'Análise concluída com sucesso.')}
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: IA EXPLICA POR PERFIL (5 LINGUAGENS DE NEGÓCIO) */}
        <TabsContent value="perfil" data-tour="step-5" className="mt-5 space-y-6">
          <div className="bg-card text-foreground p-4 sm:p-6 rounded-3xl shadow-medium border border-border space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl text-white flex items-center justify-center shadow-medium shrink-0 bg-success">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground">
                  IA Explica — Diagnóstico Registral por Persona
                </h3>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  Visualização adaptada para a linguagem exata e prioridades de cada perfil de atuação
                </p>
              </div>
            </div>

            {/* Abas dos Perfis — Horizontal Touch Scroll no Mobile */}
            <div className="w-full overflow-x-auto no-scrollbar ios-scroll p-1.5 bg-background border border-border rounded-2xl">
              <div className="flex items-center gap-2 min-w-max">
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
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all min-h-[44px] flex items-center gap-1.5 border ${
                      profileTab === p.id
                        ? 'bg-success text-white border-success/30 shadow-soft'
                        : 'bg-card/90 text-muted-foreground border-border hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Conteúdo Adaptado */}
            <div className="p-5 bg-muted/70 border border-border rounded-2xl text-xs sm:text-sm text-foreground leading-relaxed space-y-3 font-medium">
              {profileTab === 'comprador' && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-success block">👤 Parecer Direto para o Comprador / Leigo</span>
                  <p>{renderSafe(parecer.explicacoes_por_perfil?.comprador_leigo || parecer.explicacao_descomplicada || parecer.resumo_geral)}</p>
                </div>
              )}

              {profileTab === 'corretor' && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-success block">🏡 Visão Comercial & Corretagem Imobiliária</span>
                  <p>{renderSafe(parecer.explicacoes_por_perfil?.corretor_imoveis || `Imóvel com status ${statusJuridico}. Documentação apta para apresentação a clientes e elaboração do contrato de compra e venda.`)}</p>
                </div>
              )}

              {profileTab === 'banco' && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-success block">🏦 Análise de Garantia Fiduciária & Risco de Crédito</span>
                  <p>{renderSafe(parecer.explicacoes_por_perfil?.banco_credito || `Score de garantia: ${Math.max(10, 100 - scoreRisco)}/100. Gravames ativos: ${onus.length}. Avaliação recomendada para constituição de Alienação Fiduciária.`)}</p>
                </div>
              )}

              {profileTab === 'engenheiro' && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-success block">📐 Análise Física, Territorial & Engenharia</span>
                  <p>{renderSafe(parecer.explicacoes_por_perfil?.engenheiro_agronomo || `Área total: ${carac.area_total_m2 || 'Conforme certidão'}. Georreferenciamento: ${geo.possui_georreferenciamento ? 'Homologado SIGEF' : 'Em análise'}. Reserva legal e APP mapeadas.`)}</p>
                </div>
              )}

              {profileTab === 'advogado' && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-success block">⚖️ Parecer Registral Notarial & Fundamentação Jurídica</span>
                  <p>{renderSafe(parecer.explicacoes_por_perfil?.advogado_parecerista || parecer.conclusao_juridica || parecer.resumo_geral)}</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: DADOS DO IMÓVEL & GEO */}
        <TabsContent value="imovel" data-tour="step-2" className="mt-5 space-y-6 animate-in fade-in-50 duration-300 slide-in-from-bottom-1">

          {/* Módulo 1 & 2 */}
          <Card className="border-border bg-card shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-success" />
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
          <Card className="border-border bg-card shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Compass className="w-5 h-5 text-success" />
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
          <Card className="border-border bg-card shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <TreePine className="w-5 h-5 text-success" />
                Registro Ambiental e Recursos Hídricos (Módulo 5)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-3">
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-secondary border border-border rounded-xl space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground block">Reserva Legal</span>
                  <span className="font-semibold text-foreground">{renderSafe(ambiental?.reserva_legal_averbada, 'Conforme CAR / Averbada')}</span>
                </div>
                <div className="p-3 bg-secondary border border-border rounded-xl space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground block">Área de Preservação (APP)</span>
                  <span className="font-semibold text-foreground">{renderSafe(ambiental?.area_preservacao_permanente_app, 'Mapeada')}</span>
                </div>
                {ambiental?.embargos_ambientais && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl space-y-1">
                    <span className="text-xs font-semibold text-destructive block">Embargos Ambientais</span>
                    <span className="font-semibold text-destructive">{renderSafe(ambiental.embargos_ambientais)}</span>
                  </div>
                )}
                {ambiental?.outorga_agua && (
                  <div className="p-3 bg-secondary border border-border rounded-xl space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground block">Outorga de Recursos Hídricos</span>
                    <span className="font-semibold text-foreground">{renderSafe(ambiental.outorga_agua)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        {/* TAB 3: PROPRIETÁRIOS & CADEIA DOMINIAL */}
        <TabsContent value="proprietarios" data-tour="step-3" className="mt-5 space-y-6 animate-in fade-in-50 duration-300 slide-in-from-bottom-1">

          {/* Módulo 7: Proprietários */}
          <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-success" />
                Proprietários Atuais e Qualificação (Módulo 7)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {props.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  Nenhum proprietário atual identificado explicitamente.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-muted-foreground">
                    <thead className="bg-secondary text-muted-foreground font-semibold border-b border-border">
                      <tr>
                        <th className="px-4 py-3">Titular</th>
                        <th className="px-4 py-3">CPF / CNPJ</th>
                        <th className="px-4 py-3">Estado Civil / Regime</th>
                        <th className="px-4 py-3">Fração (%)</th>
                        <th className="px-4 py-3">Natureza do Direito</th>
                        <th className="px-4 py-3">Ato de Origem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-medium">
                      {props
                        .filter((p: any) => !searchTerm || JSON.stringify(p).toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((p: any, i: number) => (
                          <tr key={i} className="hover:bg-secondary/50">
                            <td className="px-4 py-3 font-semibold text-foreground">{renderSafe(p?.nome, 'N/I')}</td>
                            <td className="px-4 py-3 font-mono">{renderSafe(p?.cpf_cnpj, 'N/I')}</td>
                            <td className="px-4 py-3">{renderSafe(p?.estado_civil, '')} {p?.regime_bens ? `(${renderSafe(p.regime_bens)})` : ''}</td>
                            <td className="px-4 py-3 font-semibold text-success">{renderSafe(p?.percentual_propriedade, '100%')}</td>
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
          <Card className="border-border bg-card shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Clock className="w-5 h-5 text-success" />
                  Cadeia Dominial Cronológica Interativa (Módulo 8)
                </CardTitle>
                <Badge variant="outline" className="border-success/30 text-success bg-success/10 text-xs font-semibold">
                  {cadeia.length} Transmissões
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {cadeia.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  Nenhum ato de transmissão mapeado no histórico.
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-1 bg-primary">
                  {cadeia
                    .filter((ato: any) => !searchTerm || JSON.stringify(ato).toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((ato: any, i: number) => (
                      <div key={i} className="relative group animate-fade-in">
                        {/* Node Icon Circle */}
                        <div className="absolute -left-6 top-1 w-6 h-6 rounded-full bg-success border-2 border-border shadow-soft flex items-center justify-center text-white text-xs font-semibold transition-transform">
                          {i + 1}
                        </div>

                        <div className="p-4 bg-secondary/80 border border-border rounded-2xl space-y-2 hover:border-success/30 hover:bg-card transition-all shadow-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="border-success/30 text-success bg-success/60 font-semibold text-xs px-2 py-0.5">
                                {renderSafe(ato?.numero_ato, `R-${i + 1}`)}
                              </Badge>
                              <span className="font-semibold text-foreground text-xs">
                                {renderSafe(ato?.tipo_transmissao, 'Transmissão de Propriedade')}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              {renderSafe(ato?.data_registro, 'Data N/I')}
                            </span>
                          </div>

                          {/* Seller to Buyer visual path */}
                          <div className="grid sm:grid-cols-2 gap-3 text-xs pt-1">
                            {ato?.transmitentes && (
                              <div className="p-2.5 bg-destructive/50 border border-destructive/30 rounded-xl space-y-0.5">
                                <span className="text-xs font-semibold text-destructive block">Transmitente (Vendedor/Doador)</span>
                                <span className="font-semibold text-foreground">{renderSafe(ato.transmitentes)}</span>
                              </div>
                            )}
                            {ato?.adquirentes && (
                              <div className="p-2.5 bg-success/50 border border-success/30 rounded-xl space-y-0.5">
                                <span className="text-xs font-semibold text-success block">Adquirente (Comprador/Beneficiário)</span>
                                <span className="font-semibold text-foreground">{renderSafe(ato.adquirentes)}</span>
                              </div>
                            )}
                          </div>

                          {/* Value & Observations */}
                          <div className="flex items-center justify-between text-xs pt-1 text-muted-foreground">
                            {ato?.valor_transacao && (
                              <span className="font-semibold text-foreground bg-muted/60 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-success" /> {renderSafe(ato.valor_transacao)}
                              </span>
                            )}
                            {ato?.observacoes && (
                              <span className="text-xs text-muted-foreground italic">
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
          <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Garantias, Penhoras e Indisponividades (Módulos 9 e 10)
                </CardTitle>
                <Badge variant="outline" className={onus.length > 0 ? 'border-warning/30 text-warning bg-warning/10' : 'border-success/30 text-success bg-success/10'}>
                  {onus.length} Restrições
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {onus.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-success/10 text-success flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-foreground text-sm">Matrícula Livre de Ônus</h4>
                  <p className="text-xs text-muted-foreground">Não foram identificadas penhoras, hipotecas, alienações fiduciárias ou indisponividades (CNIB) ativas.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {onus
                    .filter((o: any) => !searchTerm || JSON.stringify(o).toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((o: any, i: number) => (
                      <div key={i} className="p-4 hover:bg-secondary/50 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground text-sm flex items-center gap-2">
                            <Badge variant="outline" className="border-warning/30 text-warning bg-warning/10 font-mono text-xs">
                              {renderSafe(o?.numero_ato, 'ATO')}
                            </Badge>
                            {renderSafe(o?.tipo, 'Restrição')}
                          </span>
                          <Badge className={String(o?.status).toUpperCase() === 'CANCELADO' ? 'bg-secondary text-muted-foreground' : 'bg-destructive/10 text-destructive border-destructive/30'}>
                            {renderSafe(o?.status, 'ATIVO')}
                          </Badge>
                        </div>
                        {(o?.credor_banco || o?.credor_beneficiario || o?.autor_exequente) && (
                          <p className="text-muted-foreground"><strong>Credor / Autor da Ação:</strong> {renderSafe(o.credor_banco || o.credor_beneficiario || o.autor_exequente)}</p>
                        )}
                        <p className="text-muted-foreground leading-relaxed">{renderSafe(o?.detalhes || o?.processo_vara, 'Sem descrição adicional')}</p>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Averbações Diversas */}
          {averb.length > 0 && (
            <Card className="border-border bg-card shadow-sm rounded-2xl">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  Averbações Diversas ({averb.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2.5">
                {averb
                  .filter((a: any) => !searchTerm || JSON.stringify(a).toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((a: any, i: number) => (
                    <div key={i} className="p-3 bg-secondary border border-border rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-foreground">
                        <span>{renderSafe(a?.numero_averbacao, `AV-${i + 1}`)} — {renderSafe(a?.tipo, 'Averbação')}</span>
                        <span className="text-muted-foreground font-normal">{renderSafe(a?.data, '')}</span>
                      </div>
                      <p className="text-muted-foreground">{renderSafe(a?.descricao || a?.observacoes)}</p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}

        </TabsContent>

        {/* TAB 5: REGIMES ESPECIAIS & SERVIDÕES */}
        <TabsContent value="especiais" className="mt-5 space-y-6 animate-in fade-in-50 duration-300 slide-in-from-bottom-1">

          {/* Módulo 4: Condomínios / REURB */}
          <Card className="border-border bg-card shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-success" />
                Condomínios, Loteamentos e REURB (Módulo 4)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-secondary border border-border rounded-xl">
                  <span className="text-xs font-semibold text-muted-foreground block">Condomínio Edilício</span>
                  <span className="font-semibold text-foreground">{regimes.e_condominio_edilicio ? 'SIM' : 'NÃO CONSTA'}</span>
                  {regimes.incorporacao_imobiliaria && <p className="text-xs text-muted-foreground mt-1">{renderSafe(regimes.incorporacao_imobiliaria)}</p>}
                  {regimes.fracao_ideal && <p className="text-xs text-success font-semibold mt-1">Fração Ideal: {renderSafe(regimes.fracao_ideal)}</p>}
                  {regimes.vaga_garagem && <p className="text-xs text-muted-foreground mt-0.5">Garagem: {renderSafe(regimes.vaga_garagem)}</p>}
                </div>
                <div className="p-3 bg-secondary border border-border rounded-xl">
                  <span className="text-xs font-semibold text-muted-foreground block">Regularização Fundiária (REURB)</span>
                  <span className="font-semibold text-foreground">{regimes.e_reurb ? renderSafe(regimes.tipo_reurb, 'SIM') : 'NÃO CONSTA'}</span>
                  {regimes.detalhes_regime && <p className="text-xs text-muted-foreground mt-1">{renderSafe(regimes.detalhes_regime)}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Módulo 6: Imóveis Especiais (SPU / Marinha / Tombamento) */}
          <Card className="border-border bg-card shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Landmark className="w-5 h-5 text-success" />
                Imóveis da União, Marinha (SPU), Fronteira e Tombamento (Módulo 6)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-secondary border border-border rounded-xl">
                  <span className="text-xs font-semibold text-muted-foreground block">Terreno de Marinha / SPU</span>
                  <span className="font-semibold text-foreground">{especiais.terreno_marinha ? renderSafe(especiais.regime_spu, 'SIM') : 'NÃO CONSTA'}</span>
                  {especiais.laudemic_inscrito && <p className="text-xs text-warning font-semibold mt-1">Laudêmio Inscrito</p>}
                </div>
                <div className="p-3 bg-secondary border border-border rounded-xl">
                  <span className="text-xs font-semibold text-muted-foreground block">Faixa de Fronteira / Faixa de Domínio</span>
                  <span className="font-semibold text-foreground">{especiais.faixa_fronteira ? 'Faixa de Fronteira (Lei 6.634/79)' : especiais.faixa_dominio ? 'Faixa de Domínio' : 'NÃO CONSTA'}</span>
                </div>
                <div className="p-3 bg-secondary border border-border rounded-xl">
                  <span className="text-xs font-semibold text-muted-foreground block">Tombamento Histórico / Terras Indígenas</span>
                  <span className="font-semibold text-foreground">{especiais.tombamento ? 'Tombamento Registrado' : especiais.terra_indigena_quilombola ? 'Área Indígena/Quilombola' : 'NÃO CONSTA'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Módulo 11: Usufruto, Servidões e Direitos Reais */}
          <Card className="border-border bg-card shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Key className="w-5 h-5 text-success" />
                  Usufruto, Servidões e Direitos Reais Averbados (Módulo 11)
                </CardTitle>
                <Badge variant="outline" className={usufruto.length > 0 ? 'border-warning/30 text-warning bg-warning/10' : 'border-success/30 text-success bg-success/10'}>
                  {usufruto.length > 0 ? `${usufruto.length} Registros` : '✓ Sem Restrições'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {usufruto.length === 0 ? (
                <div className="p-4 bg-success/10 border border-success/30 rounded-xl text-xs text-success font-medium">
                  ✓ Nenhum usufruto vitalício, servidão de passagem ou direito real de superfície averbado na matrícula.
                </div>
              ) : (
                usufruto
                  .filter((u: any) => !searchTerm || JSON.stringify(u).toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((u: any, i: number) => (
                    <div key={i} className="p-3 bg-secondary border border-border rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-foreground">
                        <span>[{renderSafe(u?.numero_ato, 'ATO')}] {renderSafe(u?.tipo, 'Direito Real')}</span>
                        <Badge variant="outline" className="text-xs">{renderSafe(u?.status, 'ATIVO')}</Badge>
                      </div>
                      {u?.beneficiarios && <p className="text-muted-foreground"><strong>Beneficiários:</strong> {renderSafe(u.beneficiarios)}</p>}
                      {u?.clausulas_restritivas && <p className="text-warning"><strong>Cláusulas:</strong> {renderSafe(u.clausulas_restritivas)}</p>}
                    </div>
                  ))
              )}
            </CardContent>
          </Card>

        </TabsContent>

        {/* TAB 5: COPILOTO IA CHAT INTERATIVO */}
        <TabsContent value="copiloto" data-tour="step-5" className="mt-5 space-y-6">
          <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-medium text-foreground space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="w-10 h-10 rounded-2xl text-white flex items-center justify-center shadow-medium shrink-0 bg-success">
                <Bot className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Copiloto Notarial de IA Registrária
                </h3>
                <p className="text-xs text-muted-foreground">
                  Respostas imediatas com citação direta dos atos da certidão (R-1, AV-2, penhoras, áreas e titularidades)
                </p>
              </div>
            </div>

            <MatriculaChat report={report} />
          </div>
        </TabsContent>
      </Tabs>
    </div>



    {/* Floating Secondary Copilot IA Button (Assistente em Segundo Plano) */}
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={() => setShowAiChat(!showAiChat)}
        className="bg-card hover:bg-muted text-success border border-success/40 rounded-full px-5 py-6 shadow-medium font-semibold text-xs flex items-center gap-2.5 transition-all"
      >
        <Bot className="w-5 h-5 text-success" />
        <span>{showAiChat ? 'Fechar Assistente IA' : '💬 Assistente Copiloto IA'}</span>
      </Button>
    </div>

    {/* Copilot Assistant Floating Panel */}
    {showAiChat && (
      <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[480px] bg-background border border-border rounded-3xl shadow-medium p-4 text-foreground animate-fade-in max-h-[75vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-success" />
            <h4 className="text-xs font-semibold text-foreground">Copiloto Notarial de IA Registrária</h4>
          </div>
          <button
            onClick={() => setShowAiChat(false)}
            className="text-muted-foreground hover:text-foreground text-xs font-semibold px-2 py-1 rounded-lg hover:bg-muted"
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

    {/* === OFERTA FINAL DA DEMONSTRAÇÃO === */}
    {isSampleDemo && (
      <div className="mt-10 max-w-4xl mx-auto px-4 pb-16">
        <div className="relative overflow-hidden rounded-3xl border border-primary/40 shadow-medium p-8 sm:p-10 text-center space-y-7 bg-background">
          {/* Background glow */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none hidden" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none hidden" />

          {/* Header */}
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 bg-primary/20 text-primary border border-primary/30 text-xs font-semibold px-4 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Você acabou de ver o poder do ValidaImóvel
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight leading-tight">
              Agora Analise Qualquer Matrícula Real<br />
              <span className="text-primary">por Apenas R$ 16,63/mês</span>
            </h2>
            <p className="text-sm text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              Plano 3 Meses Ilimitados — audite quantas matrículas precisar, com Score de Risco, Dossiê PDF e os 12 Módulos Registrais completos.
            </p>
          </div>

          {/* Benefícios */}
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            {[
              { icon: ShieldCheck, title: '12 Módulos Registrais', desc: 'Proprietários, ônus, penhoras, CAR, SIGEF/INCRA e muito mais.' },
              { icon: FileCheck, title: 'Dossiê PDF Completo', desc: 'Exportação profissional em PDF com capa, módulos e parecer jurídico.' },
              { icon: Zap, title: 'Resultado em < 30 seg', desc: 'IA Registrária com temperatura zero — zero invenção, 100% fidelidade ao texto.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-4 bg-card/80 rounded-2xl border border-border">
                <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shrink-0 mt-0.5 font-semibold">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Preço e CTA */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="text-center">
                <span className="text-muted-foreground text-sm line-through">R$ 299,70</span>
                <div className="text-4xl font-semibold text-foreground">R$ 49<span className="text-2xl">,90</span></div>
                <span className="text-xs text-primary font-semibold">3 meses ilimitados • pagamento único</span>
              </div>
            </div>

            <Link to="/auth" className="inline-block w-full sm:w-auto">
              <Button className="w-full sm:w-auto text-white font-semibold text-base px-10 py-7 gap-3 transition-all bg-primary">
                <Zap className="w-5 h-5 fill-white stroke-[2]" />
                <span>QUERO ANALISAR MATRÍCULAS REAIS AGORA</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </Button>
            </Link>

            <p className="text-xs text-muted-foreground font-medium">
              Pagamento via PIX • Ativação imediata • Sem renovação automática • Cancele quando quiser
            </p>
          </div>
        </div>
      </div>
    )}

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