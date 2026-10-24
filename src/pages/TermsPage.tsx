import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, ArrowLeft, FileText } from 'lucide-react';
import { COMPANY_CONFIG } from '@/config/companyConfig';
import { WhatsAppSupport } from '@/components/WhatsAppSupport';
import { PublicLayout } from '@/components/PublicLayout';
import { usePageMeta } from '@/hooks/usePageMeta';

export const TermsPage: React.FC = () => {
  usePageMeta('Termos de uso', '/termos', 'Condições de uso do ValidaImóvel: plano de 3 meses com pagamento único, uso justo, direito de arrependimento de 7 dias e limites da análise automatizada de matrículas.');
  return (
    <PublicLayout>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" /> Documento Legal
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
            Termos de uso
          </h1>
          <p className="text-sm text-muted-foreground">
            Última atualização: {COMPANY_CONFIG.legalUpdatedAt}
          </p>
        </div>

        <Card className="bg-card border-border p-6 sm:p-8 rounded-3xl space-y-6 text-sm text-muted-foreground leading-relaxed font-medium">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">1. Visão Geral e Natureza do Serviço</h2>
            <p>
              O <strong className="text-foreground">{COMPANY_CONFIG.name}</strong> é um sistema automatizado de apoio à triagem documental e due diligence imobiliária ("Copiloto de análise registral"). A plataforma utiliza algoritmos de inteligência artificial para estruturar e organizar as informações contidas em certidões e matrículas de imóveis fornecidas pelo usuário.
            </p>
            <div className="p-4 bg-warning/10 border border-warning/30 rounded-2xl text-warning text-xs space-y-1">
              <strong>AVISO IMPORTANTE:</strong> A análise automatizada gerada pelo sistema é um parecer de apoio à triagem documental e não substitui a certidão de inteiro teor atualizada emitida pelo Cartório de Registro de Imóveis competente, pareceres jurídicos formais ou consultoria profissional especializada.
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. Condições de Acesso e Assinatura</h2>
            <p>
              O acesso ao sistema é disponibilizado mediante pagamento único no valor de <strong className="text-primary">{COMPANY_CONFIG.offer.priceFormatted}</strong>, pelo período contínuo de <strong className="text-foreground">{COMPANY_CONFIG.offer.period} ({COMPANY_CONFIG.offer.durationDays} dias)</strong> a contar da confirmação do pagamento, sem cobrança por documento analisado.
            </p>
            <p>
              <strong className="text-foreground">Uso justo:</strong> para manter o serviço estável para todos, cada conta pode realizar até {COMPANY_CONFIG.offer.fairUseDailyLimit} análises por dia (o limite renova à meia-noite, horário de Brasília). A conta é pessoal; o compartilhamento de acesso pode levar à suspensão.
            </p>
            <p>
              Não existem cobranças recorrentes nem renovação automática. Se o usuário renovar antes do fim do período, os dias restantes são somados ao novo período.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. Direito de Arrependimento, Estornos e Contestações</h2>
            <p>
              Em conformidade com o Artigo 49 do Código de Defesa do Consumidor (CDC), o usuário poderá solicitar o cancelamento e reembolso integral do valor pago no prazo de até <strong className="text-foreground">7 (sete) dias corridos</strong> a partir da data de contratação, pelo WhatsApp de suporte ou pelo e-mail <strong className="text-foreground">{COMPANY_CONFIG.supportEmail}</strong>.
            </p>
            <p>
              Pagamentos estornados ou contestados junto ao banco ou à operadora do cartão retiram os dias de acesso correspondentes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. Limites da Análise Automatizada</h2>
            <p>
              A leitura e a análise são feitas por inteligência artificial e podem conter erros ou omissões, especialmente em documentos ilegíveis, incompletos ou muito longos. O sistema sinaliza os pontos que não conseguiu confirmar no texto, mas cabe ao usuário conferir as informações decisivas na certidão original e, em negócios relevantes, consultar um profissional habilitado.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">5. Responsabilidade das Informações Fornecidas</h2>
            <p>
              O usuário é responsável pela veracidade e legitimidade dos documentos em PDF enviados para a plataforma. O {COMPANY_CONFIG.name} realiza o processamento registral estritamente com base nos dados presentes no arquivo transmitido pelo usuário.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">6. Contato e Suporte</h2>
            <p>
              Para dúvidas sobre os presentes Termos de Uso ou suporte ao sistema, fale conosco pelo WhatsApp de suporte (link no rodapé) ou pelo e-mail <strong className="text-primary">{COMPANY_CONFIG.supportEmail}</strong>.
            </p>
          </section>
        </Card>
      </main>

      </PublicLayout>
  );
};

export default TermsPage;
