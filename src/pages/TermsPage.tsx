import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, ArrowLeft, FileText } from 'lucide-react';
import { COMPANY_CONFIG } from '@/config/companyConfig';
import { WhatsAppSupport } from '@/components/WhatsAppSupport';
import { Logo } from '@/components/Logo';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 text-foreground glass border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <Link to="/">
            <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:text-foreground gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar ao Início
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" /> Documento Legal
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
            Termos de Uso e Serviço
          </h1>
          <p className="text-sm text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
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
              O acesso ao sistema é disponibilizado mediante pagamento único no valor de <strong className="text-primary">{COMPANY_CONFIG.offer.priceFormatted}</strong>, garantindo o direito de utilizar a plataforma para análise ilimitada de matrículas pelo período contínuo de <strong className="text-foreground">{COMPANY_CONFIG.offer.period} ({COMPANY_CONFIG.offer.durationDays} dias)</strong> a contar da confirmação do pagamento.
            </p>
            <p>
              Não existem cobranças recorrentes nem renovação automática.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. Direito de Arrependimento e Garantia</h2>
            <p>
              Em conformidade com o Artigo 49 do Código de Defesa do Consumidor (CDC), o usuário poderá solicitar o cancelamento e reembolso integral do valor pago no prazo de até <strong className="text-foreground">7 (sete) dias corridos</strong> a partir da data de contratação, entrando em contato com a nossa equipe de suporte pelo e-mail <strong className="text-foreground">{COMPANY_CONFIG.supportEmail}</strong> ou via WhatsApp.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. Responsabilidade das Informações Fornecidas</h2>
            <p>
              O usuário é responsável pela veracidade e legitimidade dos documentos em PDF enviados para a plataforma. O {COMPANY_CONFIG.name} realiza o processamento registral estritamente com base nos dados presentes no arquivo transmitido pelo usuário.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">5. Contato e Suporte</h2>
            <p>
              Para dúvidas sobre os presentes Termos de Uso ou suporte ao sistema, entre em contato via e-mail: <strong className="text-primary">{COMPANY_CONFIG.supportEmail}</strong>.
            </p>
          </section>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {COMPANY_CONFIG.legalName}. Todos os direitos reservados.</p>
          <WhatsAppSupport variant="inline" />
        </div>
      </footer>
    </div>
  );
};

export default TermsPage;
