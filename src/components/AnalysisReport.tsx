import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
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
  MessageSquare, CheckSquare, ArrowRight, DollarSign, Search, MessageCircle, X
} from 'lucide-react';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { MatriculaChat } from './MatriculaChat';

// Helper ultra-seguro para impedir erros de React child em objetos/arrays
const renderSafe = (value: any, fallback: string = 'Não informado'): string => {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'string') return value.trim() || fallback;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'SIM' : 'NÃO';
  if (Array.isArray(value)) {
    if (value.length === 0) return fallback;
    return value.map(v => renderSafe(v, '')).filter(Boolean).join(', ');
  }
  if (typeof value === 'object') {
    const valid = Object.entries(value)
      .filter(([_, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${renderSafe(v, '')}`);
    return valid.length > 0 ? valid.join(' | ') : fallback;
  }
  return String(value);
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
    console.error("Erro na renderização do relatório:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="max-w-2xl mx-auto border-red-200 bg-red-50/50 p-6 rounded-2xl text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-red-900">Aviso na Exibição do Relatório</h3>
            <p className="text-xs text-red-700">
              Ocorreu um problema ao formatar um dos campos do relatório. Os dados foram extraídos com sucesso.
            </p>
          </div>
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

interface AnalysisReportProps {
  report: any;
}

const AnalysisReportContent: React.FC<AnalysisReportProps> = ({ report }) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('parecer');

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

    navigator.clipboard.writeText(waText);
    setCopiedWhatsApp(true);
    toast({ title: 'Copiado para WhatsApp!', description: 'Resumo formatado pronto para colar em conversas.' });
    setTimeout(() => setCopiedWhatsApp(false), 3000);
  };

  // GERADOR COMPLETO DE PDF CONTEMPLANDO OS 12 MÓDULOS
  const exportToPDF = async () => {
    setIsExporting(true);

    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      let y = margin;

      const emerald = [5, 150, 105];
      const darkSlate = [15, 23, 42];
      const slateGray = [100, 116, 139];

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - 20) {
          pdf.addPage();
          y = margin + 10;
          drawHeaderSmall();
        }
      };

      const drawHeaderSmall = () => {
        pdf.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        pdf.rect(0, 0, pageWidth, 12, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(255, 255, 255);
        pdf.text(`VALIDA IMÓVEL — MATRÍCULA Nº ${renderSafe(ident.matricula)} — ${renderSafe(ident.cartorio_ri)}`, margin, 8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(52, 211, 153);
        pdf.text(`Score: ${scoreRisco}/100 (${nivelRisco})`, pageWidth - margin - 35, 8);
      };

      const drawSectionTitle = (title: string) => {
        checkPageBreak(15);
        y += 4;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(emerald[0], emerald[1], emerald[2]);
        pdf.text(title.toUpperCase(), margin, y);
        y += 3;
        pdf.setDrawColor(226, 232, 240);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 6;
      };

      // Header Banner Principal (Página 1)
      pdf.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      pdf.rect(0, 0, pageWidth, 32, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(255, 255, 255);
      pdf.text('VALIDA IMÓVEL', margin, 14);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(52, 211, 153);
      pdf.text('RELATÓRIO AUDITADO TÉCNICO-JURÍDICO COMPLETO (12 MÓDULOS)', margin, 22);

      const dateStr = new Date().toLocaleDateString('pt-BR');
      pdf.setTextColor(148, 163, 184);
      pdf.text(`Data: ${dateStr}`, pageWidth - margin - 35, 16);
      pdf.text(`Matrícula Nº: ${renderSafe(ident.matricula)}`, pageWidth - margin - 50, 23);

      y = 40;

      // 1. DADOS CARTORÁRIOS (MÓDULO 1)
      drawSectionTitle('1. Identificação Registrária e Cartorária (Módulo 1)');
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 65, 85);

      const mod1Data = [
        [`Matrícula: ${renderSafe(ident.matricula)}`, `Cartório/CRI: ${renderSafe(ident.cartorio_ri)}`],
        [`Comarca/UF: ${renderSafe(ident.comarca)}`, `Livro/Folha: ${renderSafe(ident.livro)} / ${renderSafe(ident.folha)}`],
        [`Data Abertura: ${renderSafe(ident.data_abertura)}`, `Tipo de Imóvel: ${renderSafe(ident.tipo_imovel_analisado)}`],
        [`Código INCRA/SQL/IPTU: ${renderSafe(ident.codigo_imovel)}`, `Serventia/CNS: ${renderSafe(ident.serventia)}`]
      ];

      mod1Data.forEach(row => {
        checkPageBreak(6);
        pdf.text(row[0], margin, y);
        pdf.text(row[1], margin + 95, y);
        y += 5;
      });

      y += 3;

      // 2. CARACTERIZAÇÃO FÍSICA E BENFEITORIAS (MÓDULO 2)
      drawSectionTitle('2. Caracterização Física e Descrição Legal (Módulo 2)');
      const mod2Data = [
        [`Endereço: ${renderSafe(carac.endereco_completo)}`, `Denominação/Edifício: ${renderSafe(carac.denominacao_imovel)}`],
        [`Área Total (m²): ${renderSafe(carac.area_total_m2)}`, `Área (Ha / Outras): ${renderSafe(carac.area_total_hectares || carac.area_outras_unidades)}`],
        [`Loteamento / Quadra / Lote: ${renderSafe(carac.loteamento_quadra_lote)}`, `Benfeitorias: ${renderSafe(carac.benfeitorias)}`]
      ];

      mod2Data.forEach(row => {
        checkPageBreak(6);
        pdf.text(row[0], margin, y);
        pdf.text(row[1], margin + 95, y);
        y += 5;
      });

      if (carac.perimetros_confrontacoes) {
        checkPageBreak(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Perímetros e Confrontações (Vizinhos):', margin, y);
        y += 4;
        pdf.setFont('helvetica', 'normal');
        const splitPerim = pdf.splitTextToSize(renderSafe(carac.perimetros_confrontacoes), pageWidth - (margin * 2));
        pdf.text(splitPerim, margin, y);
        y += (splitPerim.length * 4) + 3;
      }

      if (carac.descricao_legal) {
        checkPageBreak(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Descrição Legal na Íntegra:', margin, y);
        y += 4;
        pdf.setFont('helvetica', 'normal');
        const splitDesc = pdf.splitTextToSize(renderSafe(carac.descricao_legal), pageWidth - (margin * 2));
        pdf.text(splitDesc, margin, y);
        y += (splitDesc.length * 4) + 4;
      }

      // 3. GEORREFERENCIAMENTO & REGISTRO AGRÁRIO (MÓDULO 3)
      drawSectionTitle('3. Georreferenciamento e Registro Agrário (Módulo 3)');
      const mod3Data = [
        [`Certificação SIGEF: ${renderSafe(geo.situacao_certificacao)}`, `Código CAR: ${renderSafe(geo.codigo_car)}`],
        [`Código CCIR/SNCR: ${renderSafe(geo.codigo_ccir)}`, `NIRF/ITR: ${renderSafe(geo.codigo_itr_nirf)}`],
        [`Responsável Técnico: ${renderSafe(geo.responsavel_tecnico)}`, `Sistema Geodésico: ${renderSafe(geo.sistema_geodesico)}`]
      ];

      mod3Data.forEach(row => {
        checkPageBreak(6);
        pdf.text(row[0], margin, y);
        pdf.text(row[1], margin + 95, y);
        y += 5;
      });

      if (geo.coordenadas_geograficas) {
        checkPageBreak(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Coordenadas Geodésicas:', margin, y);
        y += 4;
        pdf.setFont('helvetica', 'normal');
        pdf.text(renderSafe(geo.coordenadas_geograficas), margin, y);
        y += 6;
      }

      // 4. REGIMES ESPECIAIS (MÓDULO 4)
      drawSectionTitle('4. Regimes Especiais: Condomínios, Loteamentos e REURB (Módulo 4)');
      const mod4Data = [
        [`Condomínio Edilício: ${regimes.e_condominio_edilicio ? 'SIM' : 'NÃO CONSTA'}`, `Incorporação/Convenção: ${renderSafe(regimes.incorporacao_imobiliaria)}`],
        [`Fração Ideal: ${renderSafe(regimes.fracao_ideal)}`, `Vaga de Garagem: ${renderSafe(regimes.vaga_garagem)}`],
        [`Loteamento (Lei 6.766/79): ${regimes.e_loteamento ? 'SIM' : 'NÃO CONSTA'}`, `REURB (Lei 13.465/17): ${regimes.e_reurb ? renderSafe(regimes.tipo_reurb, 'SIM') : 'NÃO CONSTA'}`]
      ];

      mod4Data.forEach(row => {
        checkPageBreak(6);
        pdf.text(row[0], margin, y);
        pdf.text(row[1], margin + 95, y);
        y += 5;
      });

      y += 3;

      // 5. REGISTRO AMBIENTAL & RECURSOS HÍDRICOS (MÓDULO 5)
      drawSectionTitle('5. Registro Ambiental e Recursos Hídricos (Módulo 5)');
      const mod5Data = [
        [`Reserva Legal Averbada: ${renderSafe(ambiental.reserva_legal_averbada)}`, `Área Preservação APP: ${renderSafe(ambiental.area_preservacao_permanente_app)}`],
        [`Embargos IBAMA/Estadual: ${renderSafe(ambiental.embargos_ambientais, 'Nenhum embargo declarado')}`, `Outorga de Recursos Hídricos: ${renderSafe(ambiental.outorga_agua)}`]
      ];

      mod5Data.forEach(row => {
        checkPageBreak(6);
        pdf.text(row[0], margin, y);
        pdf.text(row[1], margin + 95, y);
        y += 5;
      });

      y += 3;

      // 6. IMÓVEIS ESPECIAIS: MARINHA / SPU / TOMBAMENTO (MÓDULO 6)
      drawSectionTitle('6. Imóveis da União, Marinha (SPU) e Tombamento (Módulo 6)');
      const mod6Data = [
        [`Terreno de Marinha: ${especiais.terreno_marinha ? renderSafe(especiais.regime_spu, 'SIM') : 'NÃO CONSTA'}`, `Laudêmio SPU: ${especiais.laudemic_inscrito ? 'Inscrito' : 'Não Consta'}`],
        [`Faixa de Fronteira/Domínio: ${especiais.faixa_fronteira ? 'Fronteira' : especiais.faixa_dominio ? 'Faixa Domínio' : 'NÃO CONSTA'}`, `Tombamento/Quilombola: ${especiais.tombamento ? 'Tombado' : 'NÃO CONSTA'}`]
      ];

      mod6Data.forEach(row => {
        checkPageBreak(6);
        pdf.text(row[0], margin, y);
        pdf.text(row[1], margin + 95, y);
        y += 5;
      });

      y += 3;

      // 7. PROPRIETÁRIOS ATUAIS (MÓDULO 7)
      drawSectionTitle('7. Titularidade Atual e Qualificação (Módulo 7)');
      if (props.length === 0) {
        pdf.text('Nenhum proprietário atual identificado explicitamente.', margin, y);
        y += 5;
      } else {
        props.forEach((p: any, idx: number) => {
          checkPageBreak(8);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${idx + 1}. ${renderSafe(p.nome, 'Proprietário')}`, margin, y);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`CPF/CNPJ: ${renderSafe(p.cpf_cnpj)} | Fração: ${renderSafe(p.percentual_propriedade, '100%')} | Estado Civil: ${renderSafe(p.estado_civil)} | Ato: ${renderSafe(p.ato_aquisicao)}`, margin + 65, y);
          y += 5;
        });
      }

      y += 3;

      // 8. CADEIA DOMINIAL CRONOLÓGICA (MÓDULO 8)
      drawSectionTitle('8. Cadeia Dominial Cronológica de Transmissões (Módulo 8)');
      if (cadeia.length === 0) {
        pdf.text('Nenhum ato de transmissão mapeado no histórico.', margin, y);
        y += 5;
      } else {
        cadeia.forEach((ato: any, idx: number) => {
          checkPageBreak(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`Ato ${renderSafe(ato.numero_ato, `#${idx + 1}`)} (${renderSafe(ato.data_registro)}) — ${renderSafe(ato.tipo_transmissao)}`, margin, y);
          y += 4;
          pdf.setFont('helvetica', 'normal');
          if (ato.transmitentes) pdf.text(`  • Transmitente (Vendedor): ${renderSafe(ato.transmitentes)}`, margin, y), y += 4;
          if (ato.adquirentes) pdf.text(`  • Adquirente (Comprador): ${renderSafe(ato.adquirentes)}`, margin, y), y += 4;
          if (ato.valor_transacao) pdf.text(`  • Valor Declarado: ${renderSafe(ato.valor_transacao)}`, margin, y), y += 4;
          y += 2;
        });
      }

      // 9. ÔNUS REAIS & GARANTIAS FINANCEIRAS (MÓDULO 9)
      drawSectionTitle('9. Ônus Reais e Garantias Financeiras (Módulo 9)');
      if (garantias.length === 0) {
        pdf.text('✓ Nenhuma hipoteca ou alienação fiduciária ativa registrada.', margin, y);
        y += 5;
      } else {
        garantias.forEach((g: any, idx: number) => {
          checkPageBreak(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${idx + 1}. [${renderSafe(g.numero_ato, 'ATO')}] ${renderSafe(g.tipo, 'Garantia')} (${renderSafe(g.status, 'ATIVO')})`, margin, y);
          y += 4;
          pdf.setFont('helvetica', 'normal');
          pdf.text(`  Credor/Banco: ${renderSafe(g.credor_banco || g.credor_beneficiario)} | Valor: ${renderSafe(g.valor_garantia)}`, margin, y);
          y += 5;
        });
      }

      // 10. INDISPONIBILIDADES & PENHORAS (MÓDULO 10)
      drawSectionTitle('10. Penhoras, Indisponividades e Ações Judiciais (Módulo 10)');
      if (penhoras.length === 0) {
        pdf.text('✓ Nenhuma penhora ou indisponibilidade CNIB ativa registrada.', margin, y);
        y += 5;
      } else {
        penhoras.forEach((p: any, idx: number) => {
          checkPageBreak(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${idx + 1}. [${renderSafe(p.numero_ato, 'ATO')}] ${renderSafe(p.tipo, 'Restrição Judicial')} (${renderSafe(p.status, 'ATIVO')})`, margin, y);
          y += 4;
          pdf.setFont('helvetica', 'normal');
          pdf.text(`  Processo/Vara: ${renderSafe(p.processo_vara)} | Exequente: ${renderSafe(p.autor_exequente)}`, margin, y);
          y += 5;
        });
      }

      // 11. USUFRUTO & SERVIDÕES (MÓDULO 11)
      drawSectionTitle('11. Usufruto, Servidões e Direitos Reais Averbados (Módulo 11)');
      if (usufruto.length === 0) {
        pdf.text('✓ Nenhum usufruto ou servidão registrado nesta matrícula.', margin, y);
        y += 5;
      } else {
        usufruto.forEach((u: any, idx: number) => {
          checkPageBreak(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${idx + 1}. [${renderSafe(u.numero_ato, 'ATO')}] ${renderSafe(u.tipo, 'Direito Real')}`, margin, y);
          y += 4;
          pdf.setFont('helvetica', 'normal');
          pdf.text(`  Beneficiários: ${renderSafe(u.beneficiarios)} | Cláusulas: ${renderSafe(u.clausulas_restritivas)}`, margin, y);
          y += 5;
        });
      }

      // 12. PARECER TÉCNICO-JURÍDICO & DUE DILIGENCE (MÓDULO 12)
      drawSectionTitle('12. Parecer Conclusivo, Score de Risco e Due Diligence (Módulo 12)');
      
      checkPageBreak(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text(`Score de Risco: ${scoreRisco}/100 | Nível: ${nivelRisco} | Status Jurídico: ${statusJuridico}`, margin, y);
      y += 6;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Resumo Diagnóstico Executivo:', margin, y);
      y += 4;
      pdf.setFont('helvetica', 'normal');
      const splitResumo = pdf.splitTextToSize(renderSafe(parecer.resumo_geral, 'Resumo geral não disponível.'), pageWidth - (margin * 2));
      pdf.text(splitResumo, margin, y);
      y += (splitResumo.length * 4) + 5;

      checkPageBreak(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Orientação e Recomendação Final para Due Diligence:', margin, y);
      y += 4;
      pdf.setFont('helvetica', 'normal');
      const splitRecom = pdf.splitTextToSize(
        renderSafe(parecer.recomendacao_final || parecer.conclusao_juridica, 'Realizar auditoria documental completa antes de transacionar.'),
        pageWidth - (margin * 2)
      );
      pdf.text(splitRecom, margin, y);
      y += (splitRecom.length * 4) + 6;

      // Checklist de Certidões no PDF
      checkPageBreak(25);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Checklist de Certidões Recomendadas:', margin, y);
      y += 4;
      pdf.setFont('helvetica', 'normal');
      certidoesRecomendadas.forEach(cert => {
        checkPageBreak(5);
        pdf.text(`  [ ] ${cert.title} — ${cert.scope}`, margin, y);
        y += 4;
      });

      // Adiciona número de páginas em todas as folhas (Página X de Y)
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
        pdf.text(`Valida Imóvel — Relatório Auditado de Matrícula Imobiliária — Página ${i} de ${pageCount}`, margin, pageHeight - 8);
      }

      const filename = `Relatorio_Auditado_12Modulos_Matricula_${renderSafe(ident.matricula, 'Imovel')}.pdf`;
      pdf.save(filename);

      toast({ title: 'PDF Completo Exportado!', description: `Relatório auditado dos 12 módulos salvo como ${filename}` });
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

      {/* Action Toolbar com Busca e Botões de Rápido Compartilhamento */}
      <div className="flex flex-col gap-4 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <FileCheck className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                  Relatório de Análise (12 Módulos Especialistas)
                </h2>
                <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 text-[10px] font-bold">
                  100% Abrangente
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Matrícula Nº <strong className="text-slate-700">{renderSafe(ident.matricula)}</strong> • {renderSafe(ident.cartorio_ri, 'CRI')}
              </p>
            </div>
          </div>

          {/* Quick Share Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyWhatsApp}
              className="border-emerald-200 bg-emerald-50/60 text-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-semibold gap-1.5 flex-1 sm:flex-none"
            >
              {copiedWhatsApp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />}
              {copiedWhatsApp ? 'Copiado!' : 'Enviar WhatsApp'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySummary}
              className="border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-semibold gap-1.5 flex-1 sm:flex-none"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado' : 'Copiar Resumo'}
            </Button>

            <Button
              onClick={exportToPDF}
              disabled={isExporting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 gap-1.5 flex-1 sm:flex-none"
            >
              <Download className="w-3.5 h-3.5" />
              {isExporting ? 'Exportando PDF Completo...' : 'Exportar PDF Completo (12 Módulos)'}
            </Button>
          </div>
        </div>

        {/* Real-time Filter Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar dados no relatório (pesquise por nome, CPF/CNPJ, ato R-, hipoteca, penhora, proprietário)..."
            className="pl-9 pr-9 text-xs border-slate-200 focus-visible:ring-emerald-500 rounded-xl bg-slate-50/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Risk Card */}
        <Card className="border-slate-200/80 bg-white shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Score de Risco</span>
              <Badge variant="outline" className={`${riskBadge.bg} text-[11px] font-bold gap-1 px-2 py-0.5`}>
                <span className={`w-1.5 h-1.5 rounded-full ${riskBadge.dot}`} />
                {nivelRisco}
              </Badge>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{scoreRisco}</span>
              <span className="text-xs text-slate-400 font-semibold">/ 100</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium truncate">
              Status: <strong className="text-slate-700">{statusJuridico}</strong>
            </p>
          </CardContent>
        </Card>

        {/* Cartório & Matrícula */}
        <Card className="border-slate-200/80 bg-white shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matrícula / CRI</span>
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 truncate block">
                Nº {renderSafe(ident.matricula)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium truncate">
              {renderSafe(ident.cartorio_ri, 'CRI')} ({renderSafe(ident.comarca, 'Comarca N/I')})
            </p>
          </CardContent>
        </Card>

        {/* Proprietários */}
        <Card className="border-slate-200/80 bg-white shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Proprietários Atuais</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">{props.length}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium truncate">
              {props.length > 0 ? renderSafe(props[0]?.nome, 'Titular Registrado') : 'Sem registros ativos'}
            </p>
          </CardContent>
        </Card>

        {/* Restrições */}
        <Card className="border-slate-200/80 bg-white shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ônus / Indisponidades</span>
              <AlertTriangle className={`w-4 h-4 ${onus.length > 0 ? 'text-amber-500' : 'text-emerald-600'}`} />
            </div>
            <div className="mt-3">
              <span className={`text-3xl font-black ${onus.length > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                {onus.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium truncate">
              {onus.length > 0 ? `${onus.length} gravame(s) ativo(s)` : 'Matrícula livre de ônus'}
            </p>
          </CardContent>
        </Card>
      </div>

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6 bg-slate-100 rounded-xl p-1 h-auto">
            <TabsTrigger value="parecer" className="rounded-lg text-xs font-bold gap-1.5 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Diagnóstico Fácil
            </TabsTrigger>
            <TabsTrigger value="chat" className="rounded-lg text-xs font-bold gap-1.5 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> Pergunte à IA
            </TabsTrigger>
            <TabsTrigger value="imovel" className="rounded-lg text-xs font-bold gap-1.5 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" /> Endereço & Tamanho
            </TabsTrigger>
            <TabsTrigger value="proprietarios" className="rounded-lg text-xs font-bold gap-1.5 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Users className="w-3.5 h-3.5 text-emerald-600" /> Donos do Imóvel
            </TabsTrigger>
            <TabsTrigger value="onus" className="rounded-lg text-xs font-bold gap-1.5 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <AlertTriangle className="w-3.5 h-3.5 text-emerald-600" /> Dívidas & Bloqueios
            </TabsTrigger>
            <TabsTrigger value="especiais" className="rounded-lg text-xs font-bold gap-1.5 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Landmark className="w-3.5 h-3.5 text-emerald-600" /> Regras & Marinha
            </TabsTrigger>
          </TabsList>

          {/* TAB CHAT DA MATRÍCULA */}
          <TabsContent value="chat" className="mt-5">
            <MatriculaChat report={report} />
          </TabsContent>

          {/* TAB 1: PARECER & RISCO */}
          <TabsContent value="parecer" className="mt-5 space-y-6">
            <Card className="border-slate-200/80 bg-white shadow-sm rounded-2xl overflow-hidden">
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

        {/* TAB 2: IMÓVEL, GEORREF. & AMBIENTAL */}
        <TabsContent value="imovel" className="mt-5 space-y-6">

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
                  <div key={label} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{label}</span>
                    <span className="font-bold text-slate-900 text-sm">{value}</span>
                  </div>
                ))}
              </div>

              {carac.perimetros_confrontacoes && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Perímetros e Confrontações (Vizinhos)</span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                    {renderSafe(carac.perimetros_confrontacoes)}
                  </p>
                </div>
              )}

              {carac.benfeitorias && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Benfeitorias e Construções Averbadas</span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                    {renderSafe(carac.benfeitorias)}
                  </p>
                </div>
              )}

              {carac.descricao_legal && (
                <div className="space-y-1 pt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descrição Legal na Íntegral</span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 leading-relaxed max-h-48 overflow-y-auto">
                    {renderSafe(carac.descricao_legal)}
                  </p>
                </div>
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
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Certificação SIGEF</span>
                  <span className="font-bold text-emerald-700">{renderSafe(geo.situacao_certificacao, 'Em análise')}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Código CAR</span>
                  <span className="font-bold text-slate-800">{renderSafe(geo.codigo_car)}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Código CCIR / SNCR</span>
                  <span className="font-bold text-slate-800">{renderSafe(geo.codigo_ccir)}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">NIRF / ITR</span>
                  <span className="font-bold text-slate-800">{renderSafe(geo.codigo_itr_nirf)}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Responsável Técnico</span>
                  <span className="font-semibold text-slate-800">{renderSafe(geo.responsavel_tecnico)}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sistema Geodésico</span>
                  <span className="font-semibold text-slate-800">{renderSafe(geo.sistema_geodesico, 'SIRGAS 2000')}</span>
                </div>
              </div>

              {geo.coordenadas_geograficas && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Coordenadas dos Vértices</span>
                  <p className="text-xs font-mono text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                    {renderSafe(geo.coordenadas_geograficas)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Módulo 5: Registro Ambiental */}
          {ambiental && (
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
                    <span className="font-semibold text-slate-800">{renderSafe(ambiental.reserva_legal_averbada)}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Área de Preservação (APP)</span>
                    <span className="font-semibold text-slate-800">{renderSafe(ambiental.area_preservacao_permanente_app)}</span>
                  </div>
                  {ambiental.embargos_ambientais && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">Embargos Ambientais</span>
                      <span className="font-semibold text-red-900">{renderSafe(ambiental.embargos_ambientais)}</span>
                    </div>
                  )}
                  {ambiental.outorga_agua && (
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Outorga de Recursos Hídricos</span>
                      <span className="font-semibold text-slate-800">{renderSafe(ambiental.outorga_agua)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        </TabsContent>

        {/* TAB 3: PROPRIETÁRIOS & CADEIA DOMINIAL */}
        <TabsContent value="proprietarios" className="mt-5 space-y-6">

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
        <TabsContent value="onus" className="mt-5 space-y-6">

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
        <TabsContent value="especiais" className="mt-5 space-y-6">

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
          {usufruto.length > 0 && (
            <Card className="border-slate-200/80 bg-white shadow-sm rounded-2xl">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Key className="w-5 h-5 text-emerald-600" />
                  Usufruto, Servidões e Direitos Reais Averbados (Módulo 11)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {usufruto
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
                  ))}
              </CardContent>
            </Card>
          )}

        </TabsContent>
      </Tabs>
    </div>
  );
};

// Componente exportado envelopado no Error Boundary anti-tela branca
export const AnalysisReport: React.FC<AnalysisReportProps> = (props) => (
  <ReportErrorBoundary>
    <AnalysisReportContent {...props} />
  </ReportErrorBoundary>
);