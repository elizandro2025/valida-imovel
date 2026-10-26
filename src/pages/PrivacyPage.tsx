import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, ArrowLeft, Lock, CheckCircle2 } from 'lucide-react';
import { COMPANY_CONFIG } from '@/config/companyConfig';
import { WhatsAppSupport } from '@/components/WhatsAppSupport';
import { PublicLayout } from '@/components/PublicLayout';
import { usePageMeta } from '@/hooks/usePageMeta';

export const PrivacyPage: React.FC = () => {
  usePageMeta('Política de privacidade', '/privacidade', 'Como o ValidaImóvel trata seus dados e os PDFs de matrícula: o que é coletado, quem processa (Google, Asaas, Supabase, Cloudflare), por quanto tempo e como pedir a exclusão.');
  return (
    <PublicLayout>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" /> Segurança e Privacidade
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
            Política de privacidade
          </h1>
          <p className="text-sm text-muted-foreground">
            Lei Geral de Proteção de Dados (Lei nº 13.709/2018) • Última atualização: {COMPANY_CONFIG.legalUpdatedAt}
          </p>
        </div>

        <Card className="bg-card border-border p-6 sm:p-8 rounded-3xl space-y-6 text-sm text-muted-foreground leading-relaxed font-medium">
          
          <div className="p-4 bg-background border border-border rounded-2xl space-y-1">
            <span className="text-xs font-semibold text-primary block">🔒 Proteção de Conexão</span>
            <p className="text-xs text-muted-foreground">{COMPANY_CONFIG.dataPolicy.securityStatement}</p>
          </div>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">1. Dados Coletados e Finalidade</h2>
            <p>
              O <strong className="text-foreground">{COMPANY_CONFIG.name}</strong> coleta apenas o necessário para prestar o serviço:
            </p>
            <ul className="space-y-2 text-xs text-muted-foreground pt-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span><strong className="text-foreground">Conta:</strong> nome e e-mail, para login e controle da assinatura.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span><strong className="text-foreground">Pagamento:</strong> nome, e-mail e CPF, exigidos para emitir a cobrança Pix ou cartão.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span><strong className="text-foreground">Documento analisado:</strong> o PDF da matrícula, que pode conter nomes, CPFs e outros dados pessoais de terceiros, usado exclusivamente para gerar o relatório.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span><strong className="text-foreground">Registro de uso:</strong> data, hora e tipo de cada uso da IA (sem o conteúdo do documento), para aplicar o limite de uso justo e acompanhar falhas.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span><strong className="text-foreground">Erros técnicos:</strong> mensagem de erro, página e navegador, sem dados pessoais, para corrigir falhas do site.</span>
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. Como os Documentos São Processados</h2>
            <ul className="space-y-2 text-xs text-muted-foreground pt-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>O PDF é enviado por conexão segura (HTTPS/TLS) e lido por inteligência artificial do Google (API Gemini). O {COMPANY_CONFIG.name} não armazena o arquivo em seus servidores.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {COMPANY_CONFIG.dataPolicy.aiProviderMayUseContent ? (
                  <span>Conforme os termos da API Gemini, o Google pode reter o conteúdo enviado e utilizá-lo para melhorar seus produtos e serviços. O processamento pode ocorrer em servidores fora do Brasil.</span>
                ) : (
                  <span>Usamos o plano pago da API Gemini. Conforme os termos dessa API, o Google não usa o conteúdo enviado nem as respostas para treinar ou melhorar seus produtos; ele mantém registros por tempo limitado, apenas para detectar abusos e cumprir obrigações legais. O processamento pode ocorrer em servidores fora do Brasil.</span>
                )}
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>As análises não são guardadas. O relatório aparece apenas na sua tela, durante o uso, e não fica salvo nos nossos servidores nem no seu navegador. Para guardar uma análise, exporte o relatório em PDF.</span>
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. Empresas Parceiras (Operadores)</h2>
            <p>Para funcionar, o serviço compartilha dados somente com os fornecedores abaixo, cada um apenas para a sua finalidade:</p>
            <ul className="space-y-2 text-xs text-muted-foreground pt-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span><strong className="text-foreground">Google (API Gemini):</strong> leitura e análise do PDF por inteligência artificial.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span><strong className="text-foreground">Asaas:</strong> processamento dos pagamentos (nome, e-mail e CPF).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span><strong className="text-foreground">Supabase:</strong> armazenamento da conta, da assinatura, dos pagamentos e do registro de uso para o limite diário (data e tipo de cada uso, sem o conteúdo da matrícula ou do relatório).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span><strong className="text-foreground">Cloudflare:</strong> hospedagem do site e da API.</span>
              </li>
            </ul>
            <p>Nenhum dado é vendido ou usado para publicidade.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. Solicitação de Exclusão de Dados</h2>
            <p>
              {COMPANY_CONFIG.dataPolicy.deletionRequest} O titular dos dados possui o direito de solicitar a confirmação, acesso, correção ou eliminação definitiva dos seus dados armazenados a qualquer momento.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">5. Contato sobre Privacidade</h2>
            <p>
              Dúvidas e pedidos relativos à privacidade e proteção de dados podem ser enviados pelo e-mail <strong className="text-primary">{COMPANY_CONFIG.contactEmail}</strong> ou pelo WhatsApp de suporte (link no rodapé).
            </p>
          </section>

        </Card>
      </main>

      </PublicLayout>
  );
};

export default PrivacyPage;
