import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download, Copy, FileText, ShieldCheck, AlertTriangle, CheckCircle2,
  Building2, Users, Calendar, Clock, AlertCircle, Sparkles, FileCheck, Compass, Zap, Lock, Check,
  TreePine, Landmark, ShieldAlert, Key, RefreshCcw, CheckSquare, ArrowRight, DollarSign, MessageCircle,
  Bot, Info, Quote,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MatriculaChat } from './MatriculaChat';
import { GuidedTour } from './GuidedTour';
import { getReportView, statusOf, LienStatus, RiskLevel } from '@/lib/reportView';
import { ScoreRing } from './ScoreRing';
import { COMPANY_CONFIG } from '@/config/companyConfig';

/* eslint-disable @typescript-eslint/no-explicit-any -- o relatório vem da IA e tem forma livre */

const NOT_FOUND = 'Não identificado';

// Converte qualquer valor do relatório em texto, sem exibir JSON bruto; ausente = "Não identificado"
const renderSafe = (value: any, fallback: string = NOT_FOUND): string => {
  if (value === null || value === undefined || value === '') return fallback;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed === '{}' || trimmed === '[]') return fallback;
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        return renderSafe(JSON.parse(trimmed), fallback);
      } catch {
        // texto que só parece JSON: mostra como está
      }
    }
    return trimmed;
  }

  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'SIM' : 'NÃO';

  if (Array.isArray(value)) {
    const items = value.map(v => renderSafe(v, '')).filter(Boolean);
    return items.length > 0 ? items.join(', ') : fallback;
  }

  if (typeof value === 'object') {
    const parts = Object.entries(value)
      .filter(([key]) => !key.startsWith('_'))
      .map(([, v]) => (typeof v === 'object' ? renderSafe(v, '') : String(v ?? '').trim()))
      .filter(v => v && v !== 'null' && v !== 'undefined');
    return parts.length > 0 ? parts.join(' · ') : fallback;
  }

  return fallback;
};

// Booleanos do relatório: só afirma SIM/NÃO quando a IA encontrou isso no documento
const renderFlag = (value: any, detail?: any): string => {
  if (value === true) return renderSafe(detail, 'SIM');
  if (value === false) return 'NÃO';
  return NOT_FOUND;
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
    console.error('Falha ao exibir o relatório:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="max-w-md mx-auto bg-card border-destructive/30 p-6 text-center space-y-4 rounded-3xl shadow-medium">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Não foi possível exibir o relatório</h3>
          <p className="text-xs text-muted-foreground">Ocorreu um erro ao formatar um dos campos. Clique abaixo para tentar novamente.</p>
          <Button onClick={() => this.setState({ hasError: false, error: null })} variant="destructive" className="gap-2">
            <RefreshCcw className="w-3.5 h-3.5" /> Tentar de novo
          </Button>
        </Card>
      );
    }
    return this.props.children;
  }
}

// Campo que copia o valor com um clique
const CopyableField: React.FC<{ label: string; value: string; warning?: string }> = ({ label, value, warning }) => {
  const [copiedField, setCopiedField] = useState(false);
  const { toast } = useToast();
  const isCopyable = Boolean(value) && value !== NOT_FOUND;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCopyable) return;
    navigator.clipboard.writeText(value);
    setCopiedField(true);
    toast({ title: 'Campo copiado', description: `${label}: ${value}` });
    setTimeout(() => setCopiedField(false), 2000);
  };

  return (
    <div
      onClick={isCopyable ? handleCopy : undefined}
      className={`group relative p-3 bg-secondary hover:border-primary/40 hover:bg-primary/5 rounded-xl space-y-0.5 transition-colors ${isCopyable ? 'cursor-pointer' : ''}`}
      title={isCopyable ? `Clique para copiar "${value}"` : undefined}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs font-semibold text-muted-foreground block truncate">{label}</span>
        {isCopyable && (
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-primary flex items-center gap-0.5 shrink-0">
            {copiedField ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copiedField ? 'Copiado' : 'Copiar'}
          </span>
        )}
      </div>
      <span className={`font-semibold block truncate ${isCopyable ? 'text-foreground' : 'text-muted-foreground'}`}>{value}</span>
      {warning && <span className="text-xs text-warning font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{warning}</span>}
    </div>
  );
};

// Bloco de texto longo com botão de copiar
const CopyableBlock: React.FC<{ label: string; text: string }> = ({ label, text }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: 'Texto copiado', description: `${label} copiado.` });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        <button
          onClick={handleCopy}
          className="text-xs font-semibold text-primary flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-primary/10"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <p className="text-xs text-foreground bg-secondary p-3.5 rounded-xl border border-border leading-relaxed font-medium whitespace-pre-line">
        {text}
      </p>
    </div>
  );
};

const STATUS_STYLES: Record<LienStatus, { className: string; label: string }> = {
  ATIVO: { className: 'bg-destructive/10 text-destructive border-destructive/30', label: 'ATIVO' },
  CANCELADO: { className: 'bg-secondary text-muted-foreground border-border', label: 'CANCELADO' },
  INDEFINIDO: { className: 'bg-warning/10 text-warning border-warning/30', label: 'CONFERIR' },
};

const StatusBadge: React.FC<{ item: any }> = ({ item }) => {
  const style = STATUS_STYLES[statusOf(item)];
  return <Badge variant="outline" className={`${style.className} text-xs font-semibold shrink-0`}>{style.label}</Badge>;
};

// Trecho do documento que comprova o item, com o resultado da conferência no texto lido
const SourceExcerpt: React.FC<{ item: any }> = ({ item }) => {
  if (typeof item?.trecho_origem !== 'string' || !item.trecho_origem.trim()) return null;
  const confirmed = item._trecho_confirmado;
  return (
    <div className="mt-1.5 p-2.5 rounded-lg bg-secondary text-xs text-muted-foreground space-y-1">
      <p className="flex gap-1.5 leading-relaxed"><Quote className="w-3 h-3 shrink-0 mt-0.5" /><span className="italic">{item.trecho_origem}</span></p>
      {confirmed === true && <p className="text-success font-semibold flex items-center gap-1"><Check className="w-3 h-3" /> Trecho localizado no documento</p>}
      {confirmed === false && <p className="text-warning font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Trecho não localizado no texto lido. Confira na certidão.</p>}
    </div>
  );
};

const DEFAULT_CERTIDOES = [
  { title: 'Certidão de inteiro teor e de ônus reais atualizada', scope: 'Cartório de Registro de Imóveis', purpose: 'Confirmar que nada mudou desde a emissão do PDF analisado (para escritura, costuma-se exigir emissão em até 30 dias).' },
  { title: 'Certidão Negativa de Débitos Federais (Receita Federal / PGFN)', scope: 'Vendedores', purpose: 'Verificar execuções fiscais da União e dívida ativa.' },
  { title: 'Certidões de distribuição cível e de execuções (Tribunal de Justiça)', scope: 'Vendedores', purpose: 'Identificar ações de cobrança que possam levar à penhora do imóvel.' },
  { title: 'Certidão Negativa de Débitos Trabalhistas (CNDT / TST)', scope: 'Vendedores e sócios', purpose: 'Reduzir o risco de fraude à execução trabalhista.' },
  { title: 'Certidão de débitos do imóvel (IPTU na prefeitura ou ITR na Receita Federal)', scope: 'Imóvel', purpose: 'Comprovar a quitação dos tributos do imóvel.' },
];

const RISK_STYLES: Record<RiskLevel, { bg: string; dot: string }> = {
  CRÍTICO: { bg: 'bg-destructive/10 text-destructive border-destructive/30', dot: 'bg-destructive' },
  ALTO: { bg: 'bg-warning/10 text-warning border-warning/30', dot: 'bg-warning' },
  MÉDIO: { bg: 'bg-warning/10 text-warning border-warning/30', dot: 'bg-warning' },
  BAIXO: { bg: 'bg-success/10 text-success border-success/30', dot: 'bg-success' },
  INDEFINIDO: { bg: 'bg-secondary text-muted-foreground border-border', dot: 'bg-muted-foreground' },
};

// Código de verificação: SHA-256 do conteúdo do relatório (o mesmo relatório gera sempre o mesmo código)
async function reportCode(report: any): Promise<string> {
  const data = new TextEncoder().encode(JSON.stringify(report));
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

interface AnalysisReportProps {
  report: any;
  autoStartTour?: boolean;
  isSampleDemo?: boolean;
}

const AnalysisReportContent: React.FC<AnalysisReportProps> = ({ report, autoStartTour = false, isSampleDemo = false }) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('parecer');
  const [profileTab, setProfileTab] = useState<'comprador' | 'corretor' | 'banco' | 'engenheiro' | 'advogado'>('comprador');
  const [showAiChat, setShowAiChat] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(autoStartTour);

  useEffect(() => {
    if (autoStartTour) setIsTourOpen(true);
  }, [autoStartTour]);

  const { user } = useAuth();
  const isSubscribed = Boolean(user?.hasSubscription);

  if (!report) return null;

  const view = getReportView(report);
  const { ident, carac, geo, regimes, ambiental, especiais, parecer, meta, cadeia, garantias, penhoras, onusTodos, onusAtivos, averbacoes: averb } = view;
  const props = view.proprietarios;
  const usufruto = view.direitos;
  const scoreRisco = view.score;
  const scoreLabel = scoreRisco === null ? '-' : String(scoreRisco);
  const nivelRisco = view.nivelRisco;
  const statusJuridico = view.statusJuridico;
  const riskBadge = RISK_STYLES[nivelRisco];
  const perfis = parecer.explicacoes_por_perfil && typeof parecer.explicacoes_por_perfil === 'object' ? parecer.explicacoes_por_perfil : {};

  const certidoesIA = Array.isArray(parecer.certidoes_complementares_recomendadas)
    ? parecer.certidoes_complementares_recomendadas.filter((c: any) => c && typeof c.certidao === 'string')
    : [];
  const certidoesRecomendadas = certidoesIA.length > 0
    ? certidoesIA.map((c: any) => ({ title: c.certidao, scope: renderSafe(c.orgao, '-'), purpose: renderSafe(c.motivo, '') }))
    : DEFAULT_CERTIDOES;

  const onusResumo = onusTodos.length === 0
    ? 'Nenhum ônus identificado na leitura'
    : `${onusAtivos.length} ativo(s) ou a conferir • ${onusTodos.length - onusAtivos.length} cancelado(s)`;

  const ownersLine = (p: any) =>
    `${renderSafe(p.nome)} (${renderSafe(p.cpf_cnpj)}), fração ${renderSafe(p.percentual_propriedade, 'não informada')}`;

  const requireSubscription = (feature: string) => {
    if (isSubscribed) return true;
    toast({
      title: `${feature} disponível no plano`,
      description: `Assine o ${COMPANY_CONFIG.offer.planName.toLowerCase()} por ${COMPANY_CONFIG.offer.priceFormatted} para usar este recurso.`,
      variant: 'destructive',
    });
    return false;
  };

  // Copiar todos os campos em texto estruturado
  const handleCopyAllFields = () => {
    if (!requireSubscription('Cópia dos dados')) return;
    const fullText = `
=== DADOS EXTRAÍDOS · VALIDAIMÓVEL (análise automatizada) ===
MATRÍCULA: ${renderSafe(ident.matricula)}
CARTÓRIO: ${renderSafe(ident.cartorio_ri)}
COMARCA/UF: ${renderSafe(ident.comarca)}
NOTA DE RISCO: ${scoreLabel}/100 (${nivelRisco})
SITUAÇÃO: ${statusJuridico}

1. DADOS CARTORÁRIOS
- Livro: ${renderSafe(ident.livro)}
- Folha: ${renderSafe(ident.folha)}
- Data de abertura: ${renderSafe(ident.data_abertura)}
- Tipo de imóvel: ${renderSafe(ident.tipo_imovel_analisado)}
- Inscrição / INCRA / SQL: ${renderSafe(ident.codigo_imovel)}

2. CARACTERIZAÇÃO FÍSICA
- Endereço: ${renderSafe(carac.endereco_completo)}
- Denominação: ${renderSafe(carac.denominacao_imovel)}
- Área total: ${renderSafe(carac.area_total_m2)}
- Área (hectares/outras): ${renderSafe(carac.area_total_hectares || carac.area_outras_unidades)}
- Loteamento/quadra/lote: ${renderSafe(carac.loteamento_quadra_lote)}
- Confrontações: ${renderSafe(carac.perimetros_confrontacoes)}

3. PROPRIETÁRIOS ATUAIS (${props.length})
${props.map((p: any, i: number) => `${i + 1}. ${ownersLine(p)} | Estado civil: ${renderSafe(p.estado_civil)}`).join('\n') || NOT_FOUND}

4. ÔNUS E RESTRIÇÕES (${onusResumo})
${onusTodos.map((g: any, i: number) => `${i + 1}. [${statusOf(g)}] ${renderSafe(g.numero_ato, '')} ${renderSafe(g.tipo)} | Credor/Autor: ${renderSafe(g.credor_banco || g.autor_exequente || g.processo_vara)} | Valor: ${renderSafe(g.valor_garantia || g.valor_execucao)}`).join('\n') || 'Nenhum ônus identificado na leitura.'}

5. PARECER
Resumo: ${renderSafe(parecer.resumo_geral)}
Recomendação: ${renderSafe(parecer.recomendacao_final || parecer.conclusao_juridica)}

Análise automatizada por IA. Não substitui a certidão atualizada nem a avaliação de um advogado.
`.trim();

    navigator.clipboard.writeText(fullText);
    toast({ title: 'Dados copiados', description: 'Todos os campos foram copiados para a área de transferência.' });
  };

  // Resumo para WhatsApp
  const handleCopyWhatsApp = () => {
    const waText = `*ValidaImóvel: resumo da matrícula*
📌 *Matrícula:* ${renderSafe(ident.matricula)}, ${renderSafe(ident.cartorio_ri)} (${renderSafe(ident.comarca)})
🛡️ *Nota de risco:* ${scoreLabel}/100, *${nivelRisco}*

👥 *Proprietário(s):*
${props.map((p: any) => `• ${renderSafe(p.nome)}`).join('\n') || NOT_FOUND}

🚨 *Ônus:* ${onusResumo}

💡 *Recomendação:* ${renderSafe(parecer.recomendacao_final || parecer.conclusao_juridica)}

_Análise automatizada por IA. Confira na certidão atualizada._`;

    navigator.clipboard.writeText(waText);
    toast({ title: 'Resumo copiado', description: 'Pronto para colar no WhatsApp.' });
  };

  // Relatório em PDF (jsPDF é carregado só quando o usuário exporta)
  const exportToPDF = async () => {
    if (!requireSubscription('Exportação em PDF')) return;
    setIsExporting(true);

    try {
      const [{ default: jsPDF }, code] = await Promise.all([import('jspdf'), reportCode(report)]);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 14;
      const contentWidth = pageWidth - (margin * 2);
      let y = margin;

      // Paleta do site (tons Apple): grafite, azul de destaque, cinzas claros
      const ink = [29, 29, 31];
      const accent = [0, 102, 214];
      const lightBg = [245, 245, 247];
      const border = [210, 210, 215];
      const textMuted = [110, 110, 115];

      const cleanTextForPDF = (text: string): string => {
        if (!text) return '';
        return String(text)
          .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '') // emojis
          .replace(/[☀-➿]/g, '')              // símbolos diversos
          .replace(/[^\t\n\r -ÿ]/g, '')       // mantém Latin-1 (acentos do português)
          .replace(/\s+/g, ' ')
          .trim();
      };

      const drawMiniHeader = () => {
        pdf.setFillColor(ink[0], ink[1], ink[2]);
        pdf.rect(0, 0, pageWidth, 12, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(255, 255, 255);
        pdf.text(cleanTextForPDF(`VALIDAIMÓVEL · MATRÍCULA Nº ${renderSafe(ident.matricula)} · ${renderSafe(ident.cartorio_ri)}`).slice(0, 110), margin, 8);
      };

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - 20) {
          pdf.addPage();
          y = margin + 14;
          drawMiniHeader();
        }
      };

      const drawSectionHeader = (title: string) => {
        checkPageBreak(16);
        y += 3;
        pdf.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
        pdf.roundedRect(margin, y, contentWidth, 8, 1.5, 1.5, 'F');
        pdf.setFillColor(accent[0], accent[1], accent[2]);
        pdf.rect(margin, y, 2.5, 8, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8.5);
        pdf.setTextColor(ink[0], ink[1], ink[2]);
        pdf.text(cleanTextForPDF(title.toUpperCase()), margin + 5, y + 5.5);
        y += 11;
      };

      const drawKeyValuePair = (label: string, val: string) => {
        const cleanVal = cleanTextForPDF(val);
        if (!cleanVal || cleanVal === NOT_FOUND) return;

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        const wrappedLabel = cleanTextForPDF(`${label}: `);
        const labelWidth = pdf.getTextWidth(wrappedLabel);

        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(cleanVal, contentWidth - labelWidth - 4);
        const blockHeight = lines.length * 4.2 + 2;
        checkPageBreak(blockHeight);

        pdf.setDrawColor(border[0], border[1], border[2]);
        pdf.line(margin, y + blockHeight, margin + contentWidth, y + blockHeight);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(ink[0], ink[1], ink[2]);
        pdf.text(wrappedLabel, margin + 2, y + 4.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60, 60, 67);
        lines.forEach((line: string, i: number) => {
          pdf.text(line, i === 0 ? margin + 2 + labelWidth : margin + 2, y + 4.5 + i * 4.2);
        });
        y += blockHeight;
      };

      const drawCardBlock = (title: string, subtitle?: string, isAlert = false) => {
        const cleanTitle = cleanTextForPDF(title);
        const cleanSub = subtitle ? cleanTextForPDF(subtitle) : '';
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        const titleLines = pdf.splitTextToSize(cleanTitle, contentWidth - 8);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        const subLines = cleanSub ? pdf.splitTextToSize(cleanSub, contentWidth - 8) : [];
        const blockHeight = titleLines.length * 4 + (subLines.length > 0 ? subLines.length * 3.8 + 1 : 0) + 5;
        checkPageBreak(blockHeight + 3);

        if (isAlert) {
          pdf.setFillColor(255, 241, 240);
          pdf.setDrawColor(255, 186, 181);
        } else {
          pdf.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
          pdf.setDrawColor(border[0], border[1], border[2]);
        }
        pdf.roundedRect(margin, y, contentWidth, blockHeight, 2, 2, 'FD');

        let currentY = y + 4.5;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        if (isAlert) pdf.setTextColor(180, 35, 24);
        else pdf.setTextColor(ink[0], ink[1], ink[2]);
        titleLines.forEach((line: string) => {
          pdf.text(line, margin + 4, currentY);
          currentY += 4;
        });

        if (subLines.length > 0) {
          currentY += 1;
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7.5);
          pdf.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
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
        pdf.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        pdf.text(cleanTextForPDF(msg), margin + 2, y + 4.5);
        y += 8;
      };

      // Capa
      pdf.setFillColor(ink[0], ink[1], ink[2]);
      pdf.rect(0, 0, pageWidth, 42, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.setTextColor(255, 255, 255);
      pdf.text('ValidaImóvel', margin, 18);
      pdf.setFontSize(8.5);
      pdf.setTextColor(200, 200, 205);
      pdf.text('RELATÓRIO DE ANÁLISE DE MATRÍCULA · GERADO POR INTELIGÊNCIA ARTIFICIAL', margin, 25);
      pdf.setFontSize(8);
      pdf.text(`Emissão: ${new Date().toLocaleDateString('pt-BR')} • Código do relatório: ${code}`, margin, 32);

      pdf.setFillColor(60, 60, 67);
      pdf.roundedRect(pageWidth - margin - 45, 10, 45, 24, 2, 2, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(200, 200, 205);
      pdf.text('NOTA DE RISCO', pageWidth - margin - 40, 16);
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`${scoreLabel}/100`, pageWidth - margin - 40, 24);
      pdf.setFontSize(7.5);
      pdf.text(cleanTextForPDF(nivelRisco), pageWidth - margin - 40, 30);

      y = 50;

      drawSectionHeader('Parecer e nota de risco');
      drawKeyValuePair('Situação', statusJuridico);
      drawKeyValuePair('Nota de risco', `${scoreLabel}/100 (${nivelRisco})`);
      if (parecer.explicacao_descomplicada) drawCardBlock('EM PALAVRAS SIMPLES:', renderSafe(parecer.explicacao_descomplicada));
      if (parecer.resumo_geral) drawCardBlock('RESUMO:', renderSafe(parecer.resumo_geral));
      if (Array.isArray(parecer.riscos_identificados)) {
        parecer.riscos_identificados.forEach((r: any) => {
          drawCardBlock(`RISCO ${renderSafe(r.tipo_risco, '')}: ${renderSafe(r.descricao)}`,
            [r.numero_ato && `Ato: ${r.numero_ato}`, r.impacto && `Impacto: ${renderSafe(r.impacto)}`, r.acao_recomendada && `Ação: ${renderSafe(r.acao_recomendada)}`]
              .filter(Boolean).join(' | '), true);
        });
      }
      if (parecer.recomendacao_final || parecer.conclusao_juridica) {
        drawCardBlock('RECOMENDAÇÃO:', renderSafe(parecer.recomendacao_final || parecer.conclusao_juridica));
      }
      if (view.pontosParaConferir.length > 0) {
        drawCardBlock('PONTOS PARA CONFERIR NA CERTIDÃO:', view.pontosParaConferir.join(' • '), true);
      }

      drawSectionHeader('1. Identificação da matrícula');
      drawKeyValuePair('Matrícula nº', renderSafe(ident.matricula));
      drawKeyValuePair('Cartório', renderSafe(ident.cartorio_ri));
      drawKeyValuePair('Comarca / UF', renderSafe(ident.comarca));
      drawKeyValuePair('Livro / Folha', `${renderSafe(ident.livro)} / ${renderSafe(ident.folha)}`);
      drawKeyValuePair('Data de abertura', renderSafe(ident.data_abertura));
      drawKeyValuePair('Tipo de imóvel', renderSafe(ident.tipo_imovel_analisado));
      drawKeyValuePair('Serventia / CNS', renderSafe(ident.serventia));
      drawKeyValuePair('Inscrição / INCRA / SQL', renderSafe(ident.codigo_imovel));
      drawKeyValuePair('Origem', renderSafe(ident.origem_transcricao));

      drawSectionHeader('2. Caracterização física e área');
      drawKeyValuePair('Denominação', renderSafe(carac.denominacao_imovel));
      drawKeyValuePair('Endereço', renderSafe(carac.endereco_completo));
      drawKeyValuePair('Área total', renderSafe(carac.area_total_m2));
      drawKeyValuePair('Área construída', renderSafe(carac.area_construida));
      drawKeyValuePair('Área privativa', renderSafe(carac.area_privativa));
      drawKeyValuePair('Uso predominante', renderSafe(carac.uso_predominante));
      if (carac.benfeitorias) drawCardBlock('BENFEITORIAS E CONSTRUÇÕES AVERBADAS:', renderSafe(carac.benfeitorias));
      if (carac.perimetros_confrontacoes) drawCardBlock('MEDIDAS E CONFRONTAÇÕES:', renderSafe(carac.perimetros_confrontacoes));
      if (carac.descricao_legal) drawCardBlock('DESCRIÇÃO DO IMÓVEL:', renderSafe(carac.descricao_legal));

      drawSectionHeader('3. Georreferenciamento e cadastro rural');
      drawKeyValuePair('Certificação SIGEF / INCRA', renderSafe(geo.situacao_certificacao));
      drawKeyValuePair('CAR', renderSafe(geo.codigo_car));
      drawKeyValuePair('CCIR', renderSafe(geo.codigo_ccir));
      drawKeyValuePair('NIRF / ITR', renderSafe(geo.codigo_itr_nirf));
      drawKeyValuePair('Responsável técnico', renderSafe(geo.responsavel_tecnico));
      drawKeyValuePair('Sistema geodésico', renderSafe(geo.sistema_geodesico));
      if (geo.coordenadas_geograficas) drawCardBlock('COORDENADAS DOS VÉRTICES:', renderSafe(geo.coordenadas_geograficas));

      drawSectionHeader('4 e 5. Regimes especiais e situação ambiental');
      drawKeyValuePair('Reserva legal', renderSafe(ambiental.reserva_legal_averbada));
      drawKeyValuePair('APP', renderSafe(ambiental.area_preservacao_permanente_app));
      drawKeyValuePair('Outorga de água', renderSafe(ambiental.outorga_agua));
      drawKeyValuePair('Embargos ambientais', view.temEmbargo ? renderSafe(ambiental.embargos_ambientais) : 'Nenhum identificado na leitura');
      drawKeyValuePair('Condomínio / loteamento / REURB', renderSafe(regimes.detalhes_regime));

      drawSectionHeader('6. Faixa de domínio, SPU e tombamento');
      drawKeyValuePair('Faixa de domínio', renderSafe(especiais.faixa_dominio));
      drawKeyValuePair('Terreno de marinha / SPU', renderFlag(especiais.terreno_marinha, especiais.regime_spu));
      drawKeyValuePair('Tombamento', renderSafe(especiais.tombamento));

      drawSectionHeader('7. Proprietários atuais');
      if (props.length === 0) {
        drawEmptyState('Nenhum proprietário atual identificado na leitura.');
      } else {
        props.forEach((p: any, idx: number) => {
          drawCardBlock(`PROPRIETÁRIO ${idx + 1}: ${renderSafe(p.nome)}`,
            `CPF/CNPJ: ${renderSafe(p.cpf_cnpj)} | Qualificação: ${renderSafe(p.qualificacao)} | Fração: ${renderSafe(p.percentual_propriedade, 'não informada')} | Ato de aquisição: ${renderSafe(p.ato_aquisicao)}`);
        });
      }

      drawSectionHeader('8. Cadeia dominial');
      if (cadeia.length === 0) {
        drawEmptyState('Nenhum ato de transmissão identificado na leitura.');
      } else {
        cadeia.forEach((ato: any, idx: number) => {
          const parts = [
            ato.data_registro || ato.data_ato ? `Data: ${renderSafe(ato.data_registro || ato.data_ato)}` : null,
            ato.transmitentes ? `Transmitente: ${renderSafe(ato.transmitentes)}` : null,
            ato.adquirentes ? `Adquirente: ${renderSafe(ato.adquirentes)}` : null,
            ato.valor_transacao ? `Valor declarado: ${renderSafe(ato.valor_transacao)}` : null,
          ].filter(Boolean).join(' | ');
          drawCardBlock(`ATO ${renderSafe(ato.numero_ato, `#${idx + 1}`)} · ${renderSafe(ato.tipo_transmissao)}`, parts);
        });
      }

      drawSectionHeader('9. Hipotecas, alienações fiduciárias e garantias');
      if (garantias.length === 0) {
        drawEmptyState('Nenhuma garantia identificada na leitura.');
      } else {
        garantias.forEach((g: any, idx: number) => {
          drawCardBlock(`${idx + 1}. [${renderSafe(g.numero_ato, 'ato não informado')}] ${renderSafe(g.tipo)} · ${statusOf(g)}`,
            `Credor: ${renderSafe(g.credor_banco)} | Valor: ${renderSafe(g.valor_garantia)}${g.ato_cancelamento ? ` | Cancelamento: ${renderSafe(g.ato_cancelamento)}` : ''}`,
            statusOf(g) !== 'CANCELADO');
        });
      }

      drawSectionHeader('10. Penhoras, indisponibilidades e ações');
      if (penhoras.length === 0) {
        drawEmptyState('Nenhuma penhora ou indisponibilidade identificada na leitura.');
      } else {
        penhoras.forEach((p: any, idx: number) => {
          drawCardBlock(`${idx + 1}. [${renderSafe(p.numero_ato, 'ato não informado')}] ${renderSafe(p.tipo)} · ${statusOf(p)}`,
            `Processo/vara: ${renderSafe(p.processo_vara)} | Autor: ${renderSafe(p.autor_exequente)}${p.ato_cancelamento ? ` | Cancelamento: ${renderSafe(p.ato_cancelamento)}` : ''}`,
            statusOf(p) !== 'CANCELADO');
        });
      }

      drawSectionHeader('11. Usufruto, servidões e cláusulas');
      if (usufruto.length === 0) {
        drawEmptyState('Nenhum usufruto, servidão ou cláusula restritiva identificado na leitura.');
      } else {
        usufruto.forEach((u: any, idx: number) => {
          drawCardBlock(`${idx + 1}. [${renderSafe(u.numero_ato, 'ato não informado')}] ${renderSafe(u.tipo)} · ${statusOf(u)}`,
            `Beneficiários: ${renderSafe(u.beneficiarios)} | Cláusulas: ${renderSafe(u.clausulas_restritivas)}`);
        });
      }

      drawSectionHeader('Certidões complementares recomendadas');
      certidoesRecomendadas.forEach((c: any, idx: number) => {
        drawCardBlock(`${idx + 1}. ${c.title}`, `Onde: ${c.scope} | Para quê: ${c.purpose}`);
      });

      drawSectionHeader('Sobre este relatório');
      drawCardBlock('ANÁLISE AUTOMATIZADA',
        'Relatório gerado por inteligência artificial a partir do PDF enviado. Não substitui a certidão atualizada do cartório nem a avaliação de um advogado. ' +
        `O código ${code} corresponde ao conteúdo deste relatório (SHA-256) e muda se qualquer dado for alterado.`);

      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setDrawColor(border[0], border[1], border[2]);
        pdf.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        pdf.text(cleanTextForPDF(`ValidaImóvel · análise automatizada · Matrícula ${renderSafe(ident.matricula, 'S/N')}`), margin, pageHeight - 9);
        pdf.text(`Código ${code} • Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 9, { align: 'right' });
      }

      // Nome que não se confunde com a certidão do cartório (que costuma se chamar "Matricula 12345...")
      const filename = `ValidaImovel-relatorio-matricula-${renderSafe(ident.matricula, 'imovel').replace(/[^\w.-]+/g, '_')}.pdf`;
      pdf.save(filename);
      toast({ title: 'PDF exportado', description: `Relatório salvo como ${filename}` });
    } catch (err) {
      console.error('Erro na exportação do PDF:', err);
      toast({ title: 'Erro na exportação', description: 'Não foi possível gerar o PDF.', variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  const tabTriggerClass = 'rounded-xl text-[13px] font-medium gap-2 py-2.5 px-4 sm:px-3 text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-soft hover:text-foreground transition-colors duration-200 text-center justify-center shrink-0 min-h-[44px]';

  return (
    <div className="space-y-6 antialiased animate-fade-in">

      {/* Cabeçalho: nota de risco em destaque, identificação, ações e aviso de IA */}
      <div className="bg-card rounded-3xl shadow-soft ring-1 ring-black/5 p-5 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <ScoreRing score={scoreRisco} level={nivelRisco} size={128} />
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-sm text-muted-foreground">Relatório da matrícula</p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Matrícula nº {renderSafe(ident.matricula, '-')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {renderSafe(ident.cartorio_ri, 'Cartório não identificado')}
              {ident.comarca ? ` • ${renderSafe(ident.comarca)}` : ''}
            </p>
            <Badge variant="outline" className={`${riskBadge.bg} mt-1`}>{statusJuridico}</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setIsTourOpen(true)} className="gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Tour guiado
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyAllFields} className="gap-1.5">
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
            Copiar dados
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyWhatsApp} className="gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />
            Resumo p/ WhatsApp
          </Button>
          <Button
            data-tour="step-6"
            size="sm"
            onClick={exportToPDF}
            disabled={isExporting}
            variant={isSubscribed ? 'default' : 'secondary'}
            className="gap-1.5"
          >
            {isSubscribed ? <Download className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-warning" />}
            {isExporting ? 'Gerando PDF...' : 'Exportar PDF'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2 border-t border-border pt-4">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          Análise automatizada por IA a partir do PDF enviado, com conferência de CPFs, atos e trechos citados.
          Não substitui a certidão atualizada nem a avaliação de um advogado.
        </p>
      </div>

      {/* Avisos sobre a própria análise */}
      {(meta.modo_economico || meta.texto_truncado) && (
        <div className="p-4 rounded-2xl border border-warning/30 bg-warning/10 text-xs text-foreground space-y-1">
          {meta.modo_economico && (
            <p className="flex gap-2"><AlertTriangle className="w-4 h-4 text-warning shrink-0" />
              O serviço de IA estava sobrecarregado e parte da análise usou um modelo mais simples. Se puder, analise de novo mais tarde.</p>
          )}
          {meta.texto_truncado && (
            <p className="flex gap-2"><AlertTriangle className="w-4 h-4 text-warning shrink-0" />
              O documento é muito longo e parte dele não foi analisada. Confira os atos diretamente na certidão.</p>
          )}
        </div>
      )}

      {/* Indicadores */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: 'Proprietários', value: String(props.length), detail: props.length > 0 ? renderSafe(props[0]?.nome) : 'Nenhum identificado na leitura', tone: 'text-foreground' },
          { label: 'Ônus ativos', value: String(onusAtivos.length), detail: onusResumo, tone: onusAtivos.length > 0 ? 'text-warning' : 'text-foreground' },
          { label: 'Transmissões', value: String(cadeia.length), detail: cadeia.length > 0 ? 'na cadeia dominial' : 'Nenhuma identificada na leitura', tone: 'text-foreground' },
        ].map(({ label, value, detail, tone }) => (
          <div key={label} className="bg-card rounded-2xl shadow-soft ring-1 ring-black/5 p-3.5 sm:p-5 min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{label}</p>
            <p className={`text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums mt-1 ${tone}`}>{value}</p>
            <p className="hidden sm:block text-xs text-muted-foreground mt-1 truncate">{detail}</p>
          </div>
        ))}
      </div>
      {/* Módulos */}
      <div className="relative mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <div className="w-full bg-muted/70 p-1 rounded-2xl overflow-x-auto no-scrollbar ios-scroll">
            <TabsList className="w-full min-w-max lg:min-w-0 flex lg:grid lg:grid-cols-6 gap-1.5 bg-transparent h-auto p-0 border-0">
              <TabsTrigger value="parecer" className={tabTriggerClass}>
                <ShieldCheck className="w-4 h-4 shrink-0 text-primary" />
                <span className="whitespace-nowrap">Parecer e risco</span>
              </TabsTrigger>
              <TabsTrigger value="imovel" className={tabTriggerClass}>
                <Building2 className="w-4 h-4 shrink-0 text-primary" />
                <span className="whitespace-nowrap">Imóvel e geo</span>
              </TabsTrigger>
              <TabsTrigger value="especiais" className={tabTriggerClass}>
                <Landmark className="w-4 h-4 shrink-0 text-primary" />
                <span className="whitespace-nowrap">Regimes e direitos</span>
              </TabsTrigger>
              <TabsTrigger value="proprietarios" className={tabTriggerClass}>
                <Users className="w-4 h-4 shrink-0 text-primary" />
                <span className="whitespace-nowrap">Donos e cadeia</span>
              </TabsTrigger>
              <TabsTrigger value="onus" className={tabTriggerClass}>
                <AlertTriangle className="w-4 h-4 shrink-0 text-warning" />
                <span className="whitespace-nowrap">Ônus e penhoras</span>
              </TabsTrigger>
              <TabsTrigger value="perfil" className={tabTriggerClass}>
                <Bot className="w-4 h-4 shrink-0 text-primary" />
                <span className="whitespace-nowrap">Visão por perfil</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* PARECER & RISCO */}
          <TabsContent value="parecer" className="mt-5 space-y-6 animate-in fade-in-50 duration-300 slide-in-from-bottom-1">
            <Card data-tour="step-1" className="border-0 ring-1 ring-black/5 bg-card shadow-soft rounded-3xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    Diagnóstico de risco
                  </CardTitle>
                  <Badge variant="outline" className={`${riskBadge.bg} text-xs font-semibold px-3 py-1 shrink-0`}>
                    {nivelRisco} ({scoreLabel}/100)
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-5 space-y-5">

                {view.pontosParaConferir.length > 0 && (
                  <div className="p-4 border border-warning/30 bg-warning/10 rounded-2xl space-y-2">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning" /> Pontos para conferir na certidão
                    </h4>
                    <ul className="space-y-1 text-xs text-foreground list-disc pl-5">
                      {view.pontosParaConferir.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}

                <div className="p-5 border border-border rounded-2xl space-y-4 bg-secondary/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-soft">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Em palavras simples</h3>
                      <p className="text-xs text-muted-foreground">Resumo para compradores, proprietários e corretores</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3.5 bg-card border border-border rounded-xl space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground block">Quem pode vender</span>
                      <p className="text-xs text-foreground font-semibold truncate">
                        {props.length > 0 ? props.map((p: any) => renderSafe(p.nome)).join(', ') : 'Não identificado na leitura'}
                      </p>
                    </div>
                    <div className="p-3.5 bg-card border border-border rounded-xl space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground block">Dívidas ou bloqueios</span>
                      <p className="text-xs text-foreground font-semibold truncate">
                        {onusAtivos.length > 0 ? `${onusAtivos.length} ativo(s) ou a conferir` : 'Nenhum ativo identificado'}
                      </p>
                    </div>
                    <div className="p-3.5 bg-card border border-border rounded-xl space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground block">Nível de risco</span>
                      <p className="text-xs text-foreground font-semibold truncate">
                        {scoreRisco === null ? 'Não avaliado' : scoreRisco < 25 ? 'Baixo: sem restrições ativas identificadas' : scoreRisco < 50 ? 'Médio: há pendências a conferir' : 'Alto: exige análise jurídica'}
                      </p>
                    </div>
                  </div>

                  {parecer.explicacao_descomplicada && (
                    <p className="text-xs text-foreground bg-card p-3.5 rounded-xl border border-border leading-relaxed font-medium">
                      {renderSafe(parecer.explicacao_descomplicada)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground">Resumo</h4>
                  <p className="text-sm text-foreground leading-relaxed bg-secondary p-4 rounded-xl border border-border whitespace-pre-line">
                    {renderSafe(parecer.resumo_geral, 'A IA não gerou um resumo para este documento.')}
                  </p>
                </div>

                {Array.isArray(parecer.riscos_identificados) && parecer.riscos_identificados.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground">Riscos identificados</h4>
                    <div className="space-y-2.5">
                      {parecer.riscos_identificados.map((risco: any, i: number) => (
                        <div key={i} className="p-3.5 bg-warning/10 border border-warning/30 rounded-xl space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-foreground text-xs flex items-start gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                              {renderSafe(risco.descricao)}
                            </span>
                            <Badge variant="outline" className="border-warning/30 text-warning bg-card text-xs font-semibold shrink-0">
                              {renderSafe(risco.tipo_risco, 'RISCO')}
                            </Badge>
                          </div>
                          <div className="pl-5 space-y-0.5 text-xs text-muted-foreground">
                            {risco.numero_ato && <p><strong className="text-foreground">Ato:</strong> {renderSafe(risco.numero_ato)}</p>}
                            {risco.impacto && <p><strong className="text-foreground">Impacto:</strong> {renderSafe(risco.impacto)}</p>}
                            {risco.acao_recomendada && <p><strong className="text-foreground">O que fazer:</strong> {renderSafe(risco.acao_recomendada)}</p>}
                            {risco.base_legal && <p><strong className="text-foreground">Base legal:</strong> {renderSafe(risco.base_legal)}</p>}
                            <SourceExcerpt item={risco} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(parecer.pendencias_formais) && parecer.pendencias_formais.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground">Pendências formais e cadastrais</h4>
                    <div className="p-3 bg-warning/10 border border-warning/30 rounded-xl space-y-1 text-xs">
                      {parecer.pendencias_formais.map((p: any, i: number) => (
                        <p key={i} className="text-foreground font-medium">• {renderSafe(p)}</p>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(parecer.regularidades_e_conformidade) && parecer.regularidades_e_conformidade.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground">Pontos regulares</h4>
                    <div className="p-3 bg-success/10 border border-success/30 rounded-xl space-y-1 text-xs">
                      {parecer.regularidades_e_conformidade.map((c: any, i: number) => (
                        <p key={i} className="text-foreground font-medium">✓ {renderSafe(c)}</p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-primary" />
                    Certidões recomendadas antes de fechar negócio
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    {certidoesRecomendadas.map((cert: any, idx: number) => (
                      <div key={idx} className="p-3.5 bg-secondary rounded-xl space-y-1">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <div>
                            <h5 className="font-semibold text-foreground">{cert.title}</h5>
                            <span className="text-xs font-semibold text-muted-foreground block mt-0.5">{cert.scope}</span>
                            {cert.purpose && <p className="text-xs text-muted-foreground mt-1 leading-snug">{cert.purpose}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-semibold text-muted-foreground">Recomendação</h4>
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <p className="text-sm text-foreground font-medium leading-relaxed whitespace-pre-line">
                      {renderSafe(parecer.recomendacao_final || parecer.conclusao_juridica, 'A IA não gerou uma recomendação para este documento.')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* VISÃO POR PERFIL */}
          <TabsContent value="perfil" data-tour="step-5" className="mt-5 space-y-6">
            <div className="bg-card text-foreground p-4 sm:p-6 rounded-3xl shadow-sm border border-border space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl text-white flex items-center justify-center shadow-soft shrink-0 bg-primary">
                  <Bot className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">A mesma matrícula, explicada para cada perfil</h3>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">Linguagem e prioridades de quem compra, vende, financia ou assessora</p>
                </div>
              </div>

              <div className="w-full overflow-x-auto no-scrollbar ios-scroll p-1.5 bg-background border border-border rounded-2xl">
                <div className="flex items-center gap-2 min-w-max">
                  {[
                    { id: 'comprador', label: 'Comprador' },
                    { id: 'corretor', label: 'Corretor' },
                    { id: 'banco', label: 'Banco / crédito' },
                    { id: 'engenheiro', label: 'Engenheiro / agrônomo' },
                    { id: 'advogado', label: 'Advogado' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setProfileTab(p.id as typeof profileTab)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors min-h-[44px] flex items-center border ${
                        profileTab === p.id
                          ? 'bg-primary text-white border-primary shadow-soft'
                          : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-secondary rounded-2xl text-xs sm:text-sm text-foreground leading-relaxed font-medium whitespace-pre-line">
                {profileTab === 'comprador' && renderSafe(perfis.comprador_leigo || parecer.explicacao_descomplicada, 'A IA não gerou esta visão para este documento.')}
                {profileTab === 'corretor' && renderSafe(perfis.corretor_imoveis, 'A IA não gerou esta visão para este documento.')}
                {profileTab === 'banco' && renderSafe(perfis.banco_credito, 'A IA não gerou esta visão para este documento.')}
                {profileTab === 'engenheiro' && renderSafe(perfis.engenheiro_agronomo, 'A IA não gerou esta visão para este documento.')}
                {profileTab === 'advogado' && renderSafe(perfis.advogado_parecerista || parecer.conclusao_juridica, 'A IA não gerou esta visão para este documento.')}
              </div>
            </div>
          </TabsContent>

          {/* IMÓVEL & GEO */}
          <TabsContent value="imovel" data-tour="step-2" className="mt-5 space-y-6 animate-in fade-in-50 duration-300 slide-in-from-bottom-1">
            <Card className="border-0 ring-1 ring-black/5 bg-card shadow-soft rounded-3xl">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Dados do cartório e do imóvel
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  {[
                    { label: 'Matrícula', value: renderSafe(ident.matricula) },
                    { label: 'Cartório', value: renderSafe(ident.cartorio_ri) },
                    { label: 'Comarca / UF', value: renderSafe(ident.comarca) },
                    { label: 'Livro', value: renderSafe(ident.livro) },
                    { label: 'Folha', value: renderSafe(ident.folha) },
                    { label: 'Data de abertura', value: renderSafe(ident.data_abertura) },
                    { label: 'Tipo de imóvel', value: renderSafe(ident.tipo_imovel_analisado) },
                    { label: 'Inscrição / INCRA / SQL', value: renderSafe(ident.codigo_imovel) },
                    { label: 'Serventia / CNS', value: renderSafe(ident.serventia) },
                    { label: 'Endereço', value: renderSafe(carac.endereco_completo) },
                    { label: 'Denominação / edifício', value: renderSafe(carac.denominacao_imovel) },
                    { label: 'Área total', value: renderSafe(carac.area_total_m2) },
                    { label: 'Área (hectares / outras)', value: renderSafe(carac.area_total_hectares || carac.area_outras_unidades) },
                    { label: 'Área construída', value: renderSafe(carac.area_construida) },
                    { label: 'Loteamento / quadra / lote', value: renderSafe(carac.loteamento_quadra_lote) },
                  ].map(({ label, value }) => (
                    <CopyableField key={label} label={label} value={value} />
                  ))}
                </div>

                {carac.perimetros_confrontacoes && (
                  <CopyableBlock label="Medidas e confrontações" text={renderSafe(carac.perimetros_confrontacoes)} />
                )}
                {carac.benfeitorias && (
                  <CopyableBlock label="Benfeitorias e construções averbadas" text={renderSafe(carac.benfeitorias)} />
                )}
                {carac.descricao_legal && (
                  <CopyableBlock label="Descrição do imóvel" text={renderSafe(carac.descricao_legal)} />
                )}
              </CardContent>
            </Card>

            <Card className="border-0 ring-1 ring-black/5 bg-card shadow-soft rounded-3xl">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Compass className="w-5 h-5 text-primary" />
                  Georreferenciamento e cadastro rural
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <CopyableField label="Certificação SIGEF / INCRA" value={renderSafe(geo.situacao_certificacao)} />
                  <CopyableField label="CAR" value={renderSafe(geo.codigo_car)} />
                  <CopyableField label="CCIR" value={renderSafe(geo.codigo_ccir)} />
                  <CopyableField label="NIRF / ITR" value={renderSafe(geo.codigo_itr_nirf)} />
                  <CopyableField label="Responsável técnico" value={renderSafe(geo.responsavel_tecnico)} />
                  <CopyableField label="Sistema geodésico" value={renderSafe(geo.sistema_geodesico)} />
                </div>
                {geo.coordenadas_geograficas && (
                  <CopyableBlock label="Coordenadas dos vértices" text={renderSafe(geo.coordenadas_geograficas)} />
                )}
              </CardContent>
            </Card>

            <Card className="border-0 ring-1 ring-black/5 bg-card shadow-soft rounded-3xl">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <TreePine className="w-5 h-5 text-primary" />
                  Situação ambiental
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-3">
                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <CopyableField label="Reserva legal" value={renderSafe(ambiental.reserva_legal_averbada)} />
                  <CopyableField label="Área de preservação permanente (APP)" value={renderSafe(ambiental.area_preservacao_permanente_app)} />
                  <CopyableField label="Outorga de recursos hídricos" value={renderSafe(ambiental.outorga_agua)} />
                  {view.temEmbargo ? (
                    <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl space-y-1">
                      <span className="text-xs font-semibold text-destructive block">Embargo ambiental</span>
                      <span className="font-semibold text-foreground">{renderSafe(ambiental.embargos_ambientais)}</span>
                    </div>
                  ) : (
                    <CopyableField label="Embargo ambiental" value="Nenhum identificado na leitura" />
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DONOS & CADEIA */}
          <TabsContent value="proprietarios" data-tour="step-3" className="mt-5 space-y-6 animate-in fade-in-50 duration-300 slide-in-from-bottom-1">
            <Card className="border-0 ring-1 ring-black/5 bg-card shadow-soft rounded-3xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Proprietários atuais
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {props.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    Nenhum proprietário atual identificado na leitura. Confira o último registro de transmissão na certidão.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-muted-foreground">
                      <thead className="bg-secondary text-muted-foreground font-semibold border-b border-border">
                        <tr>
                          <th className="px-4 py-3">Titular</th>
                          <th className="px-4 py-3">CPF / CNPJ</th>
                          <th className="px-4 py-3">Estado civil / regime</th>
                          <th className="px-4 py-3">Fração</th>
                          <th className="px-4 py-3">Natureza do direito</th>
                          <th className="px-4 py-3">Ato de aquisição</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border font-medium">
                        {props.map((p: any, i: number) => (
                          <tr key={i} className="hover:bg-secondary/60">
                            <td className="px-4 py-3 font-semibold text-foreground">{renderSafe(p?.nome)}</td>
                            <td className="px-4 py-3 font-mono">
                              {renderSafe(p?.cpf_cnpj)}
                              {p?._cpf_nao_confirmado && (
                                <span className="block text-warning font-sans font-semibold">não localizado no texto lido</span>
                              )}
                            </td>
                            <td className="px-4 py-3">{renderSafe(p?.estado_civil, '-')} {p?.regime_bens ? `(${renderSafe(p.regime_bens)})` : ''}</td>
                            <td className="px-4 py-3 font-semibold text-foreground">{renderSafe(p?.percentual_propriedade, 'não informada')}</td>
                            <td className="px-4 py-3">{renderSafe(p?.natureza_propriedade, '-')}</td>
                            <td className="px-4 py-3 font-mono">{renderSafe(p?.ato_aquisicao, '-')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 ring-1 ring-black/5 bg-card shadow-soft rounded-3xl">
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Cadeia dominial
                  </CardTitle>
                  <Badge variant="outline" className="border-border text-muted-foreground bg-secondary text-xs font-semibold">
                    {cadeia.length} transmiss{cadeia.length === 1 ? 'ão' : 'ões'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {cadeia.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    Nenhum ato de transmissão identificado na leitura.
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-px before:bg-border">
                    {cadeia.map((ato: any, i: number) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-6 top-1 w-6 h-6 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">
                          {i + 1}
                        </div>
                        <div className="p-4 bg-secondary rounded-2xl space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="border-primary/30 text-primary bg-card font-semibold text-xs px-2 py-0.5">
                                {renderSafe(ato?.numero_ato, `#${i + 1}`)}
                              </Badge>
                              <span className="font-semibold text-foreground text-xs">{renderSafe(ato?.tipo_transmissao, 'Tipo não identificado')}</span>
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {renderSafe(ato?.data_registro || ato?.data_ato, 'data não identificada')}
                            </span>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3 text-xs pt-1">
                            {ato?.transmitentes && (
                              <div className="p-2.5 bg-card border border-border rounded-xl space-y-0.5">
                                <span className="text-xs font-semibold text-muted-foreground block">Transmitente</span>
                                <span className="font-semibold text-foreground">{renderSafe(ato.transmitentes)}</span>
                              </div>
                            )}
                            {ato?.adquirentes && (
                              <div className="p-2.5 bg-card border border-border rounded-xl space-y-0.5">
                                <span className="text-xs font-semibold text-muted-foreground block">Adquirente</span>
                                <span className="font-semibold text-foreground">{renderSafe(ato.adquirentes)}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 text-muted-foreground">
                            {ato?.valor_transacao && (
                              <span className="font-semibold text-foreground bg-card px-2.5 py-1 rounded-lg flex items-center gap-1 border border-border">
                                <DollarSign className="w-3 h-3 text-primary" /> {renderSafe(ato.valor_transacao)}
                              </span>
                            )}
                            {ato?.observacoes && <span className="text-xs text-muted-foreground italic">{renderSafe(ato.observacoes)}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ÔNUS & PENHORAS */}
          <TabsContent value="onus" data-tour="step-4" className="mt-5 space-y-6 animate-in fade-in-50 duration-300 slide-in-from-bottom-1">
            <Card className="border-0 ring-1 ring-black/5 bg-card shadow-soft rounded-3xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    Garantias, penhoras e indisponibilidades
                  </CardTitle>
                  <Badge variant="outline" className={onusAtivos.length > 0 ? 'border-warning/30 text-warning bg-warning/10' : 'border-success/30 text-success bg-success/10'}>
                    {onusAtivos.length} ativo(s)
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {onusTodos.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-success/10 text-success flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-semibold text-foreground text-sm">Nenhum ônus identificado na leitura</h4>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Não foram encontradas hipotecas, alienações fiduciárias, penhoras ou indisponibilidades no texto do PDF.
                      Antes de fechar negócio, peça a certidão de ônus reais atualizada.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {onusTodos.map((o: any, i: number) => (
                      <div key={i} className="p-4 hover:bg-secondary/50 space-y-1 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-foreground text-sm flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="border-border text-foreground bg-secondary font-mono text-xs">
                              {renderSafe(o?.numero_ato, 'ato não informado')}
                            </Badge>
                            {renderSafe(o?.tipo, 'Tipo não identificado')}
                          </span>
                          <StatusBadge item={o} />
                        </div>
                        {(o?.credor_banco || o?.autor_exequente) && (
                          <p className="text-muted-foreground"><strong className="text-foreground">Credor / autor:</strong> {renderSafe(o.credor_banco || o.autor_exequente)}</p>
                        )}
                        {o?.processo_vara && <p className="text-muted-foreground"><strong className="text-foreground">Processo:</strong> {renderSafe(o.processo_vara)}</p>}
                        {(o?.valor_garantia || o?.valor_execucao) && (
                          <p className="text-muted-foreground"><strong className="text-foreground">Valor:</strong> {renderSafe(o.valor_garantia || o.valor_execucao)}</p>
                        )}
                        {o?.ato_cancelamento && <p className="text-muted-foreground"><strong className="text-foreground">Cancelado por:</strong> {renderSafe(o.ato_cancelamento)}</p>}
                        {statusOf(o) === 'INDEFINIDO' && (
                          <p className="text-warning font-semibold">Aparece como cancelado, mas o ato de cancelamento não foi identificado. Confira na certidão.</p>
                        )}
                        {o?._ato_nao_confirmado && <p className="text-warning font-semibold">Número do ato não localizado no texto lido.</p>}
                        {o?.detalhes && <p className="text-muted-foreground leading-relaxed">{renderSafe(o.detalhes)}</p>}
                        <SourceExcerpt item={o} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {averb.length > 0 && (
              <Card className="border-0 ring-1 ring-black/5 bg-card shadow-soft rounded-3xl">
                <CardHeader className="pb-3 border-b border-border">
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    Outras averbações ({averb.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-2.5">
                  {averb.map((a: any, i: number) => (
                    <div key={i} className="p-3 bg-secondary rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between gap-2 font-semibold text-foreground">
                        <span>{renderSafe(a?.numero_averbacao, `#${i + 1}`)} · {renderSafe(a?.tipo, 'Averbação')}</span>
                        <span className="text-muted-foreground font-normal shrink-0">{renderSafe(a?.data, '')}</span>
                      </div>
                      <p className="text-muted-foreground">{renderSafe(a?.descricao || a?.observacoes)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* REGIMES & DIREITOS */}
          <TabsContent value="especiais" className="mt-5 space-y-6 animate-in fade-in-50 duration-300 slide-in-from-bottom-1">
            <Card className="border-0 ring-1 ring-black/5 bg-card shadow-soft rounded-3xl">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Condomínio, loteamento e REURB
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="grid sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-secondary rounded-xl">
                    <span className="text-xs font-semibold text-muted-foreground block">Condomínio edilício</span>
                    <span className="font-semibold text-foreground">{renderFlag(regimes.eh_condominio)}</span>
                    {regimes.incorporacao_imobiliaria && <p className="text-xs text-muted-foreground mt-1">{renderSafe(regimes.incorporacao_imobiliaria)}</p>}
                    {regimes.fracao_ideal && <p className="text-xs text-foreground font-semibold mt-1">Fração ideal: {renderSafe(regimes.fracao_ideal)}</p>}
                    {regimes.vaga_garagem && <p className="text-xs text-muted-foreground mt-0.5">Garagem: {renderSafe(regimes.vaga_garagem)}</p>}
                  </div>
                  <div className="p-3 bg-secondary rounded-xl">
                    <span className="text-xs font-semibold text-muted-foreground block">Loteamento</span>
                    <span className="font-semibold text-foreground">{renderFlag(regimes.eh_loteamento, regimes.registro_loteamento)}</span>
                  </div>
                  <div className="p-3 bg-secondary rounded-xl">
                    <span className="text-xs font-semibold text-muted-foreground block">Regularização fundiária (REURB)</span>
                    <span className="font-semibold text-foreground">{renderFlag(regimes.eh_reurb, regimes.tipo_reurb)}</span>
                    {regimes.detalhes_regime && <p className="text-xs text-muted-foreground mt-1">{renderSafe(regimes.detalhes_regime)}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 ring-1 ring-black/5 bg-card shadow-soft rounded-3xl">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-primary" />
                  União, marinha, fronteira e tombamento
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-secondary rounded-xl">
                    <span className="text-xs font-semibold text-muted-foreground block">Terreno de marinha / SPU</span>
                    <span className="font-semibold text-foreground">{renderFlag(especiais.terreno_marinha, especiais.regime_spu)}</span>
                    {especiais.laudemio && <p className="text-xs text-muted-foreground mt-1">Laudêmio: {renderSafe(especiais.laudemio)}</p>}
                  </div>
                  <div className="p-3 bg-secondary rounded-xl">
                    <span className="text-xs font-semibold text-muted-foreground block">Faixa de fronteira / faixa de domínio</span>
                    <span className="font-semibold text-foreground">
                      {especiais.faixa_fronteira === true ? 'Faixa de fronteira (Lei 6.634/79)' : renderSafe(especiais.faixa_dominio)}
                    </span>
                  </div>
                  <div className="p-3 bg-secondary rounded-xl">
                    <span className="text-xs font-semibold text-muted-foreground block">Tombamento / terra indígena ou quilombola</span>
                    <span className="font-semibold text-foreground">{renderSafe(especiais.tombamento || especiais.terra_indigena_quilombola)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 ring-1 ring-black/5 bg-card shadow-soft rounded-3xl">
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary" />
                    Usufruto, servidões e cláusulas
                  </CardTitle>
                  <Badge variant="outline" className={view.direitosAtivos.length > 0 ? 'border-warning/30 text-warning bg-warning/10' : 'border-border text-muted-foreground bg-secondary'}>
                    {view.direitosAtivos.length} ativo(s)
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {usufruto.length === 0 ? (
                  <div className="p-4 bg-secondary rounded-xl text-xs text-muted-foreground font-medium">
                    Nenhum usufruto, servidão ou cláusula restritiva identificado na leitura.
                  </div>
                ) : (
                  usufruto.map((u: any, i: number) => (
                    <div key={i} className="p-3 bg-secondary rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between gap-2 font-semibold text-foreground">
                        <span>[{renderSafe(u?.numero_ato, 'ato não informado')}] {renderSafe(u?.tipo)}</span>
                        <StatusBadge item={u} />
                      </div>
                      {u?.beneficiarios && <p className="text-muted-foreground"><strong className="text-foreground">Beneficiários:</strong> {renderSafe(u.beneficiarios)}</p>}
                      {u?.clausulas_restritivas && <p className="text-muted-foreground"><strong className="text-foreground">Cláusulas:</strong> {renderSafe(u.clausulas_restritivas)}</p>}
                      <SourceExcerpt item={u} />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Assistente (só para quem pode usar a IA) */}
      {!isSampleDemo && isSubscribed && (
        <>
          <div className="fixed bottom-6 right-4 sm:right-6 z-50">
            <Button onClick={() => setShowAiChat(!showAiChat)} variant="outline" className="shadow-medium gap-2 h-12 px-5">
              <Bot className="w-5 h-5 text-primary" />
              <span>{showAiChat ? 'Fechar assistente' : 'Perguntar à IA'}</span>
            </Button>
          </div>
          {showAiChat && (
            <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[480px] bg-background border border-border rounded-3xl shadow-medium p-3 animate-fade-in max-h-[75vh] overflow-y-auto">
              <MatriculaChat report={report} />
            </div>
          )}
        </>
      )}

      <GuidedTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onSelectTab={(t) => setActiveTab(t)}
      />

      {/* Oferta ao fim da demonstração */}
      {isSampleDemo && (
        <div className="mt-10 max-w-4xl mx-auto px-4 pb-16">
          <div className="rounded-3xl border border-border shadow-medium p-8 sm:p-10 text-center space-y-7 bg-card">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5" /> Isto foi uma demonstração com dados fictícios
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight leading-tight">
                Agora analise as suas matrículas
              </h2>
              <p className="text-sm text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                {COMPANY_CONFIG.offer.period} de acesso por {COMPANY_CONFIG.offer.priceFormatted}, com nota de risco, relatório em PDF e os 12 módulos registrais.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-left">
              {[
                { icon: ShieldCheck, title: '12 módulos registrais', desc: 'Proprietários, ônus, penhoras, CAR, SIGEF/INCRA e mais.' },
                { icon: FileCheck, title: 'Relatório em PDF', desc: 'Pronto para compartilhar, com o trecho do documento que embasa cada risco.' },
                { icon: Zap, title: 'Resultado em poucos minutos', desc: 'Leitura por IA com conferência automática de CPFs, atos e trechos citados.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3 p-4 bg-secondary rounded-2xl border border-border">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-4xl font-semibold text-foreground">{COMPANY_CONFIG.offer.priceFormatted}</div>
                <span className="text-xs text-muted-foreground font-semibold">
                  {COMPANY_CONFIG.offer.period} • pagamento único • até {COMPANY_CONFIG.offer.fairUseDailyLimit} análises por dia
                </span>
              </div>
              <Link to="/auth?tab=register" className="inline-block w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  Criar conta e analisar <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground font-medium">
                Pix ou cartão • Liberação automática após o pagamento • Sem renovação automática
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AnalysisReport: React.FC<AnalysisReportProps> = (props) => (
  <ReportErrorBoundary>
    <AnalysisReportContent {...props} />
  </ReportErrorBoundary>
);
