import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { WhatsAppSupport } from '@/components/WhatsAppSupport';
import { COMPANY_CONFIG } from '@/config/companyConfig';
import { usePageMeta } from '@/hooks/usePageMeta';

const SECTIONS: Array<{ id: string; title: string; body: React.ReactNode }> = [
  {
    id: 'o-que-e',
    title: 'O que é a matrícula do imóvel',
    body: (
      <>
        <p>
          A matrícula é o registro oficial do imóvel no Cartório de Registro de Imóveis da região onde ele fica. Cada imóvel tem uma
          matrícula própria, com número único naquele cartório, e tudo o que acontece com ele juridicamente — vendas, heranças,
          financiamentos, penhoras — é anotado ali, em ordem cronológica (Lei 6.015/73, art. 176).
        </p>
        <p>
          A certidão de matrícula é a cópia dessa ficha emitida pelo cartório. Ela pode ser pedida no próprio cartório ou pela internet,
          no Serviço de Atendimento Eletrônico Compartilhado dos registradores (registradores.onr.org.br).
        </p>
      </>
    ),
  },
  {
    id: 'cabecalho',
    title: 'Cabeçalho e descrição do imóvel',
    body: (
      <>
        <p>No início da matrícula ficam:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>o número da matrícula, o cartório e a data de abertura;</li>
          <li>a descrição do imóvel: endereço, medidas, área, confrontações (com quem ele faz divisa) e, se houver, a inscrição municipal ou o cadastro rural;</li>
          <li>o proprietário na data de abertura e o registro anterior de onde a matrícula se originou.</li>
        </ul>
        <p>Confira se a descrição bate com o imóvel que você está vendo: endereço, número, metragem e, em apartamentos, a unidade e a vaga de garagem.</p>
      </>
    ),
  },
  {
    id: 'r-e-av',
    title: 'Registros (R) e averbações (AV)',
    body: (
      <>
        <p>
          Depois da descrição vêm os atos, numerados em sequência — por exemplo <strong className="text-foreground">R-1</strong>,{' '}
          <strong className="text-foreground">AV-2</strong>, <strong className="text-foreground">R-3</strong>. A numeração é única para os
          dois tipos, por isso é comum ver R-1, AV-2, AV-3, R-4.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-foreground">Registro (R):</strong> atos que transferem a propriedade ou criam direitos sobre o imóvel — compra e venda, doação, partilha, hipoteca, alienação fiduciária, penhora, usufruto (art. 167, I).</li>
          <li><strong className="text-foreground">Averbação (AV):</strong> alterações e cancelamentos — construção, casamento ou divórcio do proprietário, mudança de nome da rua e, principalmente, o cancelamento de ônus anteriores (art. 167, II).</li>
        </ul>
      </>
    ),
  },
  {
    id: 'proprietario',
    title: 'Quem é o proprietário hoje',
    body: (
      <>
        <p>
          O dono atual é quem aparece no último registro de transmissão (compra e venda, doação, partilha, adjudicação) que não foi
          cancelado depois. Observe:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>se há mais de um proprietário e qual a fração de cada um;</li>
          <li>o estado civil e o regime de bens: em regra, a venda de imóvel por pessoa casada precisa da autorização do cônjuge, exceto no regime de separação absoluta (Código Civil, art. 1.647);</li>
          <li>averbações posteriores de casamento, divórcio ou óbito, que mudam quem precisa assinar.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'onus',
    title: 'Ônus, penhoras e restrições',
    body: (
      <>
        <p>São os pontos que mais pesam numa compra. Os principais:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-foreground">Hipoteca:</strong> o imóvel garante uma dívida; se ela não for paga, o credor pode levá-lo a leilão.</li>
          <li><strong className="text-foreground">Alienação fiduciária:</strong> comum em financiamentos — enquanto a dívida não é quitada, a propriedade fica com o banco (Lei 9.514/97).</li>
          <li><strong className="text-foreground">Penhora, arresto e indisponibilidade:</strong> bloqueios determinados pela Justiça ou por órgãos públicos para garantir dívidas do proprietário.</li>
          <li><strong className="text-foreground">Averbação de execução (art. 828 do CPC):</strong> aviso de que existe uma ação de cobrança contra o proprietário.</li>
          <li><strong className="text-foreground">Usufruto e cláusulas:</strong> usufruto, inalienabilidade e impenhorabilidade limitam o uso ou a venda do imóvel.</li>
        </ul>
        <p>
          Para cada ônus, procure uma averbação posterior que o cancele (palavras como "cancelamento", "baixa" ou "quitação",
          citando o número do ato). Sem essa averbação, o ônus continua valendo.
        </p>
      </>
    ),
  },
  {
    id: 'rural',
    title: 'Imóveis rurais',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li><strong className="text-foreground">CCIR:</strong> certificado de cadastro do imóvel rural no INCRA.</li>
        <li><strong className="text-foreground">NIRF/ITR:</strong> número do imóvel na Receita Federal, para o imposto territorial rural.</li>
        <li><strong className="text-foreground">CAR:</strong> inscrição no Cadastro Ambiental Rural; a reserva legal e as áreas de preservação podem estar averbadas.</li>
        <li><strong className="text-foreground">Georreferenciamento:</strong> a certificação do perímetro no SIGEF/INCRA, exigida para várias operações conforme o tamanho do imóvel.</li>
        <li><strong className="text-foreground">Embargos ambientais:</strong> autuações averbadas que podem impedir financiamento e uso da área.</li>
      </ul>
    ),
  },
  {
    id: 'checklist',
    title: 'Checklist antes de fechar negócio',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Peça a certidão de matrícula atualizada; para a escritura, costuma-se exigir certidão emitida há no máximo 30 dias.</li>
        <li>Leia os últimos atos: eles mostram a situação atual.</li>
        <li>Liste os ônus ativos e confirme o cancelamento dos antigos.</li>
        <li>Confira quem precisa assinar (proprietários e cônjuges).</li>
        <li>Peça também as certidões pessoais dos vendedores (cível, trabalhista e federal) e a de débitos do imóvel (IPTU ou ITR).</li>
        <li>Em negócios relevantes, consulte um advogado.</li>
      </ul>
    ),
  },
];

const GuidePage: React.FC = () => {
  usePageMeta(
    'Como ler uma matrícula de imóvel',
    '/guia/como-ler-matricula',
    'Guia prático para ler a certidão de matrícula: registros e averbações, quem é o proprietário, hipoteca, alienação fiduciária, penhora e checklist antes de comprar.',
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <header className="sticky top-0 z-50 glass border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Voltar ao início</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" /> Guia
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">Como ler uma matrícula de imóvel</h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            O que olhar na certidão antes de comprar, vender ou financiar: quem é o dono, quais dívidas e restrições pesam sobre o
            imóvel e como saber se elas foram canceladas.
          </p>
        </div>

        <nav aria-label="Neste guia" className="p-4 rounded-2xl border border-border bg-card text-sm">
          <p className="font-semibold text-foreground mb-2">Neste guia</p>
          <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
            {SECTIONS.map(s => (
              <li key={s.id}><a href={`#${s.id}`} className="hover:text-primary py-2.5 inline-block min-h-[44px]">{s.title}</a></li>
            ))}
          </ol>
        </nav>

        <Card className="bg-card border-border p-6 sm:p-8 rounded-3xl space-y-8 text-[15px] text-muted-foreground leading-relaxed">
          {SECTIONS.map(s => (
            <section key={s.id} id={s.id} className="space-y-3 scroll-mt-20">
              <h2 className="text-xl font-semibold text-foreground">{s.title}</h2>
              {s.body}
            </section>
          ))}
          <p className="text-xs border-t border-border pt-4">
            Conteúdo informativo, não é orientação jurídica para um caso concreto. Atualizado em {COMPANY_CONFIG.legalUpdatedAt}.
          </p>
        </Card>

        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Quer ver isso aplicado a uma matrícula?</h2>
          <p className="text-sm text-muted-foreground">
            O {COMPANY_CONFIG.name} lê a certidão em PDF e organiza proprietários, ônus e cadeia dominial, com a nota de risco e o trecho que embasa cada ponto.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/app?sample=safe"><Button size="lg" className="w-full sm:w-auto">Ver demonstração gratuita</Button></Link>
            <Link to="/auth?tab=register"><Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">Criar conta <ArrowRight className="w-4 h-4" /></Button></Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {COMPANY_CONFIG.legalName}.</p>
          <WhatsAppSupport variant="inline" />
        </div>
      </footer>
    </div>
  );
};

export default GuidePage;
