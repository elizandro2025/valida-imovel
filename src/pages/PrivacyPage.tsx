import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, ArrowLeft, Lock, CheckCircle2 } from 'lucide-react';
import { COMPANY_CONFIG } from '@/config/companyConfig';
import { WhatsAppSupport } from '@/components/WhatsAppSupport';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-2xl border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black">
              <Shield className="w-4 h-4" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              Valida<span className="text-cyan-400">Imóvel</span>
            </span>
          </Link>
          <Link to="/">
            <Button variant="outline" size="sm" className="border-slate-800 text-slate-300 hover:text-white gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar ao Início
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-400 text-xs font-bold">
            <Lock className="w-3.5 h-3.5" /> Segurança e Privacidade
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Política de Privacidade e Proteção de Dados
          </h1>
          <p className="text-sm text-slate-400">
            Tratamento de dados em conformidade com as diretrizes da LGPD (Lei nº 13.709/2018)
          </p>
        </div>

        <Card className="bg-slate-900 border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 text-sm text-slate-300 leading-relaxed font-medium">
          
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-xs font-bold text-cyan-400 block">🔒 Proteção de Conexão</span>
            <p className="text-xs text-slate-400">{COMPANY_CONFIG.dataPolicy.securityStatement}</p>
          </div>

          <section className="space-y-2">
            <h2 className="text-lg font-extrabold text-white">1. Dados Coletados e Finalidade</h2>
            <p>
              O <strong className="text-white">{COMPANY_CONFIG.name}</strong> coleta apenas o necessário para prestar o serviço:
            </p>
            <ul className="space-y-2 text-xs text-slate-300 pt-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Conta:</strong> nome e e-mail, para login e controle da assinatura.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Pagamento:</strong> nome, e-mail e CPF, exigidos para emitir a cobrança Pix ou cartão.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Documento analisado:</strong> o PDF da matrícula, que pode conter nomes, CPFs e outros dados pessoais de terceiros, usado exclusivamente para gerar o relatório.</span>
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-extrabold text-white">2. Como os Documentos São Processados</h2>
            <ul className="space-y-2 text-xs text-slate-300 pt-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>O PDF é enviado por conexão segura (HTTPS/TLS) e lido por inteligência artificial do Google (API Gemini). O {COMPANY_CONFIG.name} não armazena o arquivo em seus servidores.</span>
              </li>
              {COMPANY_CONFIG.dataPolicy.aiProviderMayUseContent && (
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Conforme os termos da API Gemini, o Google pode reter o conteúdo enviado e utilizá-lo para melhorar seus produtos e serviços. O processamento pode ocorrer em servidores fora do Brasil.</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>O relatório gerado fica salvo apenas no seu navegador, para consulta rápida, e é apagado quando você sai da conta.</span>
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-extrabold text-white">3. Empresas Parceiras (Operadores)</h2>
            <p>Para funcionar, o serviço compartilha dados somente com os fornecedores abaixo, cada um apenas para a sua finalidade:</p>
            <ul className="space-y-2 text-xs text-slate-300 pt-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Google (API Gemini):</strong> leitura e análise do PDF por inteligência artificial.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Asaas:</strong> processamento dos pagamentos (nome, e-mail e CPF).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Supabase:</strong> armazenamento da conta e da assinatura.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Cloudflare:</strong> hospedagem do site e da API.</span>
              </li>
            </ul>
            <p>Nenhum dado é vendido ou usado para publicidade.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-extrabold text-white">4. Solicitação de Exclusão de Dados</h2>
            <p>
              {COMPANY_CONFIG.dataPolicy.deletionRequest} O titular dos dados possui o direito de solicitar a confirmação, acesso, correção ou eliminação definitiva dos seus dados armazenados a qualquer momento.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-extrabold text-white">5. Contato sobre Privacidade</h2>
            <p>
              Dúvidas relativas à privacidade e proteção de dados devem ser endereçadas pelo e-mail: <strong className="text-cyan-400">{COMPANY_CONFIG.contactEmail}</strong>.
            </p>
          </section>

        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {COMPANY_CONFIG.legalName}. Todos os direitos reservados.</p>
          <WhatsAppSupport variant="inline" />
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPage;
