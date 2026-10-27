/**
 * Conteúdo dos guias. Cada guia começa por uma resposta direta (o trecho que buscadores e assistentes de IA
 * costumam citar), segue com seções curtas, perguntas frequentes (viram dados estruturados FAQPage) e guias
 * relacionados. Texto informativo e conservador, com a lei citada sempre que possível.
 */
import React from 'react';
import { Link } from 'react-router-dom';

export interface GuideSection {
  id: string;
  title: string;
  body: React.ReactNode;
}

export interface GuideContent {
  summary: string;
  sections: GuideSection[];
  faq: Array<{ q: string; a: string }>;
  related: string[];
}

const B: React.FC<{ children: React.ReactNode }> = ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>;
const GuideLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <Link to={to} className="text-primary underline underline-offset-2">{children}</Link>
);
const List: React.FC<{ children: React.ReactNode }> = ({ children }) => <ul className="list-disc pl-5 space-y-1.5">{children}</ul>;

export const GUIDE_CONTENT: Record<string, GuideContent> = {
  'como-ler-matricula': {
    summary:
      'A matrícula é a ficha oficial do imóvel no Cartório de Registro de Imóveis. Para lê-la, comece pela descrição do imóvel, ' +
      'identifique o dono atual no último registro de transmissão e procure, ato por ato, hipotecas, alienações fiduciárias, penhoras ' +
      'e indisponibilidades, conferindo se cada uma foi cancelada por uma averbação posterior.',
    sections: [
      {
        id: 'o-que-e',
        title: 'O que é a matrícula do imóvel',
        body: (
          <>
            <p>
              Cada imóvel tem uma matrícula própria, com número único no cartório da região onde ele fica. Tudo o que acontece com ele
              juridicamente (vendas, heranças, financiamentos, penhoras) é anotado ali, em ordem cronológica (Lei 6.015/73, art. 176).
            </p>
            <p>
              A certidão de matrícula é a cópia dessa ficha emitida pelo cartório. Pode ser pedida no balcão ou pela internet, no
              Serviço de Atendimento Eletrônico Compartilhado dos registradores (registradores.onr.org.br).
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
            <List>
              <li>o número da matrícula, o cartório e a data de abertura;</li>
              <li>a descrição do imóvel: endereço, medidas, área, confrontações e, se houver, a inscrição municipal ou o cadastro rural;</li>
              <li>o proprietário na data de abertura e o registro anterior de onde a matrícula se originou.</li>
            </List>
            <p>Confira se a descrição bate com o imóvel que você está vendo: endereço, número, metragem e, em apartamentos, a unidade e a vaga.</p>
          </>
        ),
      },
      {
        id: 'atos',
        title: 'Registros (R) e averbações (AV)',
        body: (
          <p>
            Depois da descrição vêm os atos, numerados em sequência: R-1, AV-2, R-3... Os <B>registros</B> transferem a propriedade ou
            criam direitos sobre o imóvel (compra e venda, hipoteca, penhora); as <B>averbações</B> anotam alterações e cancelamentos.
            Veja os detalhes em <GuideLink to="/guia/registro-e-averbacao">registro e averbação</GuideLink>.
          </p>
        ),
      },
      {
        id: 'proprietario',
        title: 'Quem é o proprietário hoje',
        body: (
          <>
            <p>O dono atual é quem aparece no último registro de transmissão (compra e venda, doação, partilha, adjudicação) que não foi cancelado depois. Observe:</p>
            <List>
              <li>se há mais de um proprietário e qual a fração de cada um;</li>
              <li>o estado civil e o regime de bens: em regra, a venda por pessoa casada precisa da autorização do cônjuge, exceto na separação absoluta (Código Civil, art. 1.647);</li>
              <li>averbações posteriores de casamento, divórcio ou óbito, que mudam quem precisa assinar.</li>
            </List>
          </>
        ),
      },
      {
        id: 'onus',
        title: 'Ônus, penhoras e restrições',
        body: (
          <>
            <p>São os pontos que mais pesam numa compra:</p>
            <List>
              <li><B>Hipoteca:</B> o imóvel garante uma dívida; sem pagamento, o credor pode levá-lo a leilão.</li>
              <li><B>Alienação fiduciária:</B> comum em financiamentos. Até a quitação, a propriedade fica com o banco. <GuideLink to="/guia/alienacao-fiduciaria-na-matricula">Entenda</GuideLink>.</li>
              <li><B>Penhora, arresto e indisponibilidade:</B> bloqueios determinados pela Justiça ou por órgãos públicos. <GuideLink to="/guia/penhora-na-matricula">Veja os riscos</GuideLink>.</li>
              <li><B>Usufruto e cláusulas:</B> usufruto, inalienabilidade e impenhorabilidade limitam o uso ou a venda.</li>
            </List>
            <p>Para cada ônus, procure uma averbação posterior que o cancele ("cancelamento", "baixa", "quitação", citando o número do ato). Sem ela, o ônus continua valendo.</p>
          </>
        ),
      },
      {
        id: 'rural',
        title: 'Imóveis rurais',
        body: (
          <List>
            <li><B>CCIR:</B> cadastro do imóvel rural no INCRA.</li>
            <li><B>NIRF/ITR:</B> número do imóvel na Receita Federal, para o imposto territorial rural.</li>
            <li><B>CAR:</B> inscrição no Cadastro Ambiental Rural; a reserva legal e as áreas de preservação podem estar averbadas.</li>
            <li><B>Georreferenciamento:</B> a certificação do perímetro no SIGEF/INCRA, exigida para várias operações conforme o tamanho do imóvel.</li>
            <li><B>Embargos ambientais:</B> autuações averbadas que podem impedir financiamento e uso da área.</li>
          </List>
        ),
      },
    ],
    faq: [
      { q: 'Onde fica o nome do dono na matrícula?', a: 'No último registro (R) de transmissão que não foi cancelado depois: compra e venda, doação, partilha ou adjudicação. O nome no cabeçalho é o do proprietário na abertura da matrícula, que pode já ter vendido o imóvel.' },
      { q: 'Como saber se uma hipoteca foi cancelada?', a: 'Procure uma averbação posterior que mencione o cancelamento, a baixa ou a quitação daquela hipoteca, citando o número do registro. Sem essa averbação, a hipoteca continua valendo.' },
      { q: 'A matrícula mostra dívidas de IPTU ou condomínio?', a: 'Normalmente não. Débitos de IPTU e de condomínio são conferidos em certidões da prefeitura e declaração do condomínio; só aparecem na matrícula se virarem penhora averbada.' },
    ],
    related: ['registro-e-averbacao', 'certidao-de-onus-reais', 'documentos-para-comprar-imovel'],
  },

  'registro-e-averbacao': {
    summary:
      'Registro (R) é o ato que cria, transfere ou extingue direitos sobre o imóvel, como a compra e venda, a hipoteca e a penhora. ' +
      'Averbação (AV) anota alterações e cancelamentos, como uma construção, um casamento ou a baixa de uma hipoteca. Os dois seguem a ' +
      'mesma numeração na matrícula (R-1, AV-2, R-3...), e a propriedade só passa ao comprador com o registro da escritura.',
    sections: [
      {
        id: 'registro',
        title: 'O que é registro (R)',
        body: (
          <>
            <p>
              Os registros estão listados no art. 167, I, da Lei 6.015/73. São os atos que constituem, transferem, modificam ou extinguem
              direitos reais sobre o imóvel, por exemplo:
            </p>
            <List>
              <li>compra e venda, doação, permuta, partilha em inventário ou divórcio;</li>
              <li>hipoteca e alienação fiduciária em garantia;</li>
              <li>penhora, arresto e sequestro;</li>
              <li>usufruto, servidão e direito de superfície.</li>
            </List>
          </>
        ),
      },
      {
        id: 'averbacao',
        title: 'O que é averbação (AV)',
        body: (
          <>
            <p>As averbações (art. 167, II, da mesma lei) anotam fatos que alteram ou complementam o que já está registrado:</p>
            <List>
              <li>construção, demolição ou reforma (habite-se);</li>
              <li>casamento, separação, divórcio e óbito dos proprietários;</li>
              <li>mudança de nome da rua ou de numeração;</li>
              <li>cancelamento de hipoteca, de alienação fiduciária ou de penhora.</li>
            </List>
          </>
        ),
      },
      {
        id: 'numeracao',
        title: 'Como funciona a numeração',
        body: (
          <p>
            Cada lançamento recebe a letra R (registro) ou AV (averbação), seguida de um número de ordem e do número da matrícula
            (Lei 6.015/73, art. 232). A ordem é única para os dois tipos, por isso é comum ver R-1, AV-2, AV-3, R-4. Uma averbação
            de cancelamento sempre cita o número do ato que cancela. É assim que se confirma que um ônus foi baixado.
          </p>
        ),
      },
      {
        id: 'escritura',
        title: 'Por que a escritura não basta',
        body: (
          <p>
            A propriedade só se transfere com o <B>registro</B> do título no Registro de Imóveis (Código Civil, art. 1.245). Enquanto a
            escritura não é registrada, o vendedor continua sendo o dono perante todos, e dívidas dele podem atingir o imóvel. Por isso,
            depois de assinar, registre a escritura o quanto antes.
          </p>
        ),
      },
    ],
    faq: [
      { q: 'O que significa R-1 na matrícula?', a: 'É o primeiro ato de registro daquela matrícula. O "R" indica registro (que cria ou transfere direitos) e o número indica a ordem do lançamento.' },
      { q: 'Averbação de cancelamento apaga o registro antigo?', a: 'Não apaga: o registro antigo continua visível na matrícula, mas a averbação de cancelamento indica que ele deixou de produzir efeitos.' },
      { q: 'Comprei com escritura e não registrei. Sou o dono?', a: 'Perante terceiros, não. Pelo Código Civil (art. 1.245), a propriedade só se transfere com o registro. Até lá, o vendedor continua como proprietário na matrícula.' },
    ],
    related: ['como-ler-matricula', 'alienacao-fiduciaria-na-matricula', 'penhora-na-matricula'],
  },

  'alienacao-fiduciaria-na-matricula': {
    summary:
      'Alienação fiduciária é a garantia usada na maioria dos financiamentos imobiliários: até a dívida ser paga, a propriedade fica ' +
      'com o credor (normalmente o banco), e o comprador tem a posse. Ela aparece como um registro (R) na matrícula e só deixa de valer ' +
      'quando uma averbação posterior registra o cancelamento, feito com o termo de quitação do credor (Lei 9.514/97).',
    sections: [
      {
        id: 'como-funciona',
        title: 'Como funciona',
        body: (
          <p>
            Na alienação fiduciária, o devedor transfere ao credor a propriedade do imóvel em garantia, de forma resolúvel (Lei 9.514/97,
            art. 22). A garantia nasce com o registro do contrato na matrícula (art. 23). Quem financiou continua morando e usando o
            imóvel, mas só volta a ter a propriedade plena depois de pagar tudo.
          </p>
        ),
      },
      {
        id: 'na-matricula',
        title: 'Como aparece na matrícula',
        body: (
          <List>
            <li>um <B>registro de compra e venda</B> em nome de quem financiou;</li>
            <li>logo em seguida, um <B>registro de alienação fiduciária</B> em favor do banco, com o valor da dívida e as condições;</li>
            <li>quando a dívida é paga, uma <B>averbação de cancelamento</B> da propriedade fiduciária, citando o número do registro.</li>
          </List>
        ),
      },
      {
        id: 'quitacao',
        title: 'Como confirmar a quitação',
        body: (
          <p>
            Pago o financiamento, o credor tem 30 dias para entregar o termo de quitação, e o cartório cancela o registro da propriedade
            fiduciária à vista desse documento (Lei 9.514/97, art. 25). Se a matrícula não traz a averbação de cancelamento, a garantia
            ainda vale, mesmo que o vendedor diga que já pagou. Peça o termo de quitação e a certidão atualizada.
          </p>
        ),
      },
      {
        id: 'riscos',
        title: 'Riscos para quem compra',
        body: (
          <>
            <List>
              <li><B>Venda sem quitação:</B> o vendedor não tem a propriedade plena; a operação precisa da participação do banco (quitação ou transferência da dívida).</li>
              <li><B>Contrato de gaveta:</B> comprar sem registrar e sem anuência do banco deixa o comprador exposto se o vendedor deixar de pagar.</li>
              <li><B>Inadimplência:</B> com as prestações em atraso, o credor pode consolidar a propriedade em seu nome e levar o imóvel a leilão (arts. 26 e 27).</li>
            </List>
          </>
        ),
      },
    ],
    faq: [
      { q: 'Posso comprar um imóvel com alienação fiduciária?', a: 'Pode, desde que a dívida seja quitada (com o cancelamento averbado) ou transferida com a concordância do banco. Na prática, a quitação costuma ser feita com parte do dinheiro da compra, no mesmo ato.' },
      { q: 'Quanto tempo o banco tem para dar a quitação?', a: 'Trinta dias a partir do pagamento da dívida, segundo o art. 25 da Lei 9.514/97. Com o termo de quitação, o cartório averba o cancelamento.' },
      { q: 'Alienação fiduciária é o mesmo que hipoteca?', a: 'Não. Na hipoteca o devedor continua dono e o imóvel apenas garante a dívida; na alienação fiduciária a propriedade fica com o credor até o pagamento, o que torna a retomada mais rápida em caso de inadimplência.' },
    ],
    related: ['como-ler-matricula', 'certidao-de-onus-reais', 'documentos-para-comprar-imovel'],
  },

  'penhora-na-matricula': {
    summary:
      'Penhora na matrícula significa que o imóvel foi reservado pela Justiça para pagar uma dívida do proprietário. Ela não impede a venda, ' +
      'mas quem compra corre o risco de perder o imóvel, porque a venda não vale contra o credor (fraude à execução). Antes de comprar, ' +
      'confirme se existe averbação posterior de cancelamento ou levantamento da penhora.',
    sections: [
      {
        id: 'o-que-e',
        title: 'O que é a penhora',
        body: (
          <p>
            A penhora é o ato do processo de execução que separa um bem do devedor para pagar a dívida. Para valer contra todos, o
            credor providencia a sua anotação na matrícula (CPC, art. 844). A partir daí, presume-se que qualquer comprador sabia da
            dívida.
          </p>
        ),
      },
      {
        id: 'tipos',
        title: 'O que mais pode aparecer',
        body: (
          <List>
            <li><B>Arresto e sequestro:</B> bloqueios cautelares, antes ou durante o processo.</li>
            <li><B>Indisponibilidade:</B> ordem judicial ou administrativa que impede vender ou onerar o imóvel, comunicada pela Central Nacional de Indisponibilidade de Bens (CNIB).</li>
            <li><B>Averbação de execução (CPC, art. 828):</B> aviso de que existe uma execução contra o proprietário, mesmo antes da penhora.</li>
          </List>
        ),
      },
      {
        id: 'riscos',
        title: 'Riscos para quem compra',
        body: (
          <p>
            Vender um imóvel penhorado ou com execução averbada pode configurar fraude à execução (CPC, art. 792): a venda continua
            válida entre comprador e vendedor, mas não produz efeitos contra o credor, que pode levar o imóvel a leilão. Com
            indisponibilidade, o cartório nem registra a venda enquanto a ordem não for cancelada.
          </p>
        ),
      },
      {
        id: 'cancelamento',
        title: 'Como confirmar o cancelamento',
        body: (
          <p>
            O cancelamento depende de ordem do juiz ou do órgão que determinou a restrição, e aparece como uma averbação que cita o
            número do ato cancelado. Se a matrícula mostra a penhora sem essa averbação, considere-a ativa. Confira também o andamento
            do processo e peça a certidão de objeto e pé ao fórum.
          </p>
        ),
      },
    ],
    faq: [
      { q: 'Dá para comprar um imóvel penhorado?', a: 'É arriscado. A venda não vale contra o credor e o imóvel pode ir a leilão. Só compre com a penhora cancelada (averbada na matrícula) ou com a dívida quitada no próprio negócio, com orientação de um advogado.' },
      { q: 'Penhora e indisponibilidade são a mesma coisa?', a: 'Não. A penhora reserva o imóvel para uma dívida específica; a indisponibilidade impede qualquer venda ou oneração até ser cancelada e é comunicada pela CNIB.' },
      { q: 'Uma penhora antiga ainda vale?', a: 'Vale enquanto não houver averbação de cancelamento na matrícula, mesmo que o processo pareça encerrado. Peça ao vendedor a ordem de levantamento e a certidão atualizada.' },
    ],
    related: ['como-ler-matricula', 'documentos-para-comprar-imovel', 'certidao-de-onus-reais'],
  },

  'certidao-de-onus-reais': {
    summary:
      'A certidão de ônus reais informa se o imóvel tem hipoteca, alienação fiduciária, penhora, usufruto ou outras restrições registradas. ' +
      'É emitida pelo Cartório de Registro de Imóveis e, para lavrar uma escritura, precisa ter sido expedida há no máximo 30 dias ' +
      '(Decreto 93.240/86). Pode ser pedida pela internet, em registradores.onr.org.br.',
    sections: [
      {
        id: 'para-que-serve',
        title: 'Para que serve',
        body: (
          <p>
            Ela mostra, numa data específica, os ônus e as ações que pesam sobre o imóvel. É o documento que o tabelião, o banco e o
            comprador usam para decidir se o negócio é seguro. A lei exige a apresentação das certidões de ônus reais e de ações reais
            e pessoais reipersecutórias para lavrar escrituras (Lei 7.433/85 e Decreto 93.240/86, art. 1º).
          </p>
        ),
      },
      {
        id: 'inteiro-teor',
        title: 'Ônus reais ou inteiro teor?',
        body: (
          <List>
            <li><B>Inteiro teor:</B> cópia completa da matrícula, com todo o histórico. Ideal para entender a cadeia de proprietários.</li>
            <li><B>Ônus reais:</B> foca nas restrições vigentes. Em muitos cartórios, a certidão de inteiro teor já informa os ônus.</li>
          </List>
        ),
      },
      {
        id: 'validade',
        title: 'Validade de 30 dias',
        body: (
          <p>
            Para a escritura, a certidão precisa ter sido emitida há no máximo 30 dias (Decreto 93.240/86, art. 1º, IV). Para analisar
            um imóvel antes de fazer proposta, uma certidão um pouco mais antiga serve, mas peça uma nova antes de assinar, porque uma penhora
            pode ser averbada a qualquer momento.
          </p>
        ),
      },
      {
        id: 'como-pedir',
        title: 'Como pedir',
        body: (
          <List>
            <li>pela internet, no Serviço de Atendimento Eletrônico Compartilhado (registradores.onr.org.br), informando cartório e número da matrícula;</li>
            <li>no balcão do Cartório de Registro de Imóveis da região do imóvel;</li>
            <li>o valor segue a tabela de emolumentos de cada estado, e o prazo costuma ser de poucos dias úteis.</li>
          </List>
        ),
      },
    ],
    faq: [
      { q: 'Quanto tempo vale a certidão de ônus reais?', a: 'Para lavrar a escritura, ela deve ter sido emitida há no máximo 30 dias. Para uma análise preliminar não há prazo legal, mas o ideal é usar uma certidão recente.' },
      { q: 'Onde tirar a certidão de matrícula pela internet?', a: 'No Serviço de Atendimento Eletrônico Compartilhado dos registradores (registradores.onr.org.br), escolhendo o estado, o cartório e informando o número da matrícula.' },
      { q: 'Preciso saber o número da matrícula para pedir?', a: 'Ajuda muito. Ele costuma constar na escritura, no carnê do IPTU de alguns municípios ou em documentos do vendedor. Sem o número, o cartório pode pesquisar pelo endereço ou pelo nome do proprietário, geralmente com custo adicional.' },
    ],
    related: ['documentos-para-comprar-imovel', 'como-ler-matricula', 'penhora-na-matricula'],
  },

  'documentos-para-comprar-imovel': {
    summary:
      'Antes de comprar um imóvel, peça a certidão de matrícula atualizada (com ônus), a certidão de débitos de IPTU ou ITR e a declaração ' +
      'de quitação do condomínio, além das certidões dos vendedores: distribuição cível, execuções fiscais, trabalhista (CNDT), federal e ' +
      'protestos. A lei concentra na matrícula a maioria dos riscos, mas as certidões pessoais ainda ajudam a evitar surpresas.',
    sections: [
      {
        id: 'imovel',
        title: 'Certidões do imóvel',
        body: (
          <List>
            <li><B>Matrícula atualizada com ônus reais</B>, emitida há no máximo 30 dias para a escritura (<GuideLink to="/guia/certidao-de-onus-reais">veja como pedir</GuideLink>);</li>
            <li><B>Certidão negativa de débitos de IPTU</B> (prefeitura) ou, se rural, certidão do ITR e o CCIR;</li>
            <li><B>Declaração de quitação do condomínio</B>, assinada pelo síndico, porque as dívidas de condomínio acompanham o imóvel (Código Civil, art. 1.345);</li>
            <li>em imóveis rurais, também o CAR e, quando exigido, o georreferenciamento certificado no SIGEF.</li>
          </List>
        ),
      },
      {
        id: 'vendedores',
        title: 'Certidões dos vendedores',
        body: (
          <List>
            <li>distribuição cível e de execuções (Justiça Estadual) da comarca do imóvel e do domicílio dos vendedores;</li>
            <li>Justiça Federal e Certidão de Débitos Relativos a Tributos Federais e à Dívida Ativa da União (Receita Federal/PGFN);</li>
            <li>Certidão Negativa de Débitos Trabalhistas (CNDT, emitida pelo TST);</li>
            <li>protestos de títulos;</li>
            <li>documentos de estado civil (certidão de casamento ou nascimento atualizada), para saber quem precisa assinar.</li>
          </List>
        ),
      },
      {
        id: 'concentracao',
        title: 'O que a concentração na matrícula mudou',
        body: (
          <p>
            Desde a Lei 13.097/2015 (art. 54), vale o princípio da concentração: em regra, o comprador de boa-fé não pode ser atingido
            por ações e restrições que não estavam anotadas na matrícula. Há exceções (como algumas dívidas trabalhistas e fiscais e
            situações de insolvência do vendedor), por isso as certidões pessoais continuam recomendadas, principalmente em negócios de valor alto.
          </p>
        ),
      },
      {
        id: 'roteiro',
        title: 'Roteiro em cinco passos',
        body: (
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>Leia a matrícula e confirme quem são os donos e se há ônus ativos (<GuideLink to="/guia/como-ler-matricula">como ler</GuideLink>).</li>
            <li>Peça as certidões do imóvel e dos vendedores.</li>
            <li>Resolva pendências antes de pagar: quitação de financiamento, cancelamento de penhoras, débitos de IPTU e condomínio.</li>
            <li>Assine a escritura (ou o contrato com força de escritura, nos financiamentos) com certidão de ônus de até 30 dias.</li>
            <li>Registre o título na matrícula o quanto antes: só o registro transfere a propriedade.</li>
          </ol>
        ),
      },
    ],
    faq: [
      { q: 'Quais certidões o vendedor precisa apresentar?', a: 'As mais pedidas são: distribuição cível e de execuções, Justiça Federal, débitos federais (Receita/PGFN), trabalhista (CNDT) e protestos, além de documentos de estado civil. Para o imóvel, matrícula com ônus, IPTU ou ITR e declaração do condomínio.' },
      { q: 'A matrícula limpa basta para comprar com segurança?', a: 'Ela é o documento mais importante e, pela Lei 13.097/2015, protege o comprador de boa-fé contra o que não está anotado nela. Ainda assim, há exceções, e as certidões dos vendedores reduzem o risco.' },
      { q: 'Quem paga as certidões?', a: 'Não há regra fixa na lei: costuma ser combinado entre as partes. É comum o comprador pagar as certidões que ele mesmo pede para a própria segurança.' },
    ],
    related: ['certidao-de-onus-reais', 'como-ler-matricula', 'penhora-na-matricula'],
  },
  'desdobro-de-lote': {
    summary:
      'O desdobro é a divisão de um lote urbano em dois ou mais novos lotes com aproveitamento do sistema viário existente, sem abertura de novas ruas. ' +
      'Para ser aprovado pela prefeitura e registrado no cartório de imóveis, cada lote resultante deve respeitar a área e a frente mínimas da lei municipal (Lei 6.766/79), ' +
      'acompanhado de planta topográfica, memorial descritivo e ART ou RRT do responsável técnico.',
    sections: [
      {
        id: 'diferenca-desdobro-desmembramento',
        title: 'Diferença entre desdobro e desmembramento',
        body: (
          <>
            <p>
              Embora usados no dia a dia como sinônimos, na técnica registral o <B>desdobro</B> é a divisão de um lote já resultante de loteamento aprovado em duas ou mais frações autônomas.
              Já o <B>desmembramento</B> (Lei 6.766/79, art. 2º, § 2º) é a divisão de gleba em lotes destinados à edificação, com aproveitamento do sistema de vias existente, sem abertura de novas ruas ou praças.
            </p>
            <p>
              Em ambos os casos, a exigência fundamental é não alterar o sistema viário público nem invadir áreas públicas ou de preservação.
            </p>
          </>
        ),
      },
      {
        id: 'requisitos-prefeitura',
        title: 'Requisitos municipais e frente mínima',
        body: (
          <>
            <p>
              A Lei Federal 6.766/79 estipula área mínima de 125 m² e frente mínima de 5 metros para lotes urbanos, salvo legislações municipais de interesse social ou planos diretores mais restritivos (que frequentemente exigem 150 m², 250 m² ou frentes de 8 a 10 metros).
            </p>
            <List>
              <li>Certidão de diretrizes ou certidão de desdobro emitida pela Prefeitura Municipal;</li>
              <li>Planta do imóvel contendo a situação atual (lote original) e a situação proposta (lotes 1 e 2);</li>
              <li>Anotação de Responsabilidade Técnica (ART/CREA) ou Registro de Responsabilidade Técnica (RRT/CAU).</li>
            </List>
          </>
        ),
      },
      {
        id: 'documentos-cartorio',
        title: 'Documentos exigidos pelo Cartório de Registro de Imóveis',
        body: (
          <p>
            Para averbar o desdobro e abrir as novas matrículas, o cartório exige o requerimento com firma reconhecida dos proprietários, o ato formal de aprovação da Prefeitura, a planta aprovada, os memoriais descritivos individualizados de cada lote resultante e a certidão negativa de tributos municipais.
          </p>
        ),
      },
      {
        id: 'como-evitar-devolutiva',
        title: 'Como evitar nota devolutiva no desdobro',
        body: (
          <p>
            O erro mais comum que gera exigência cartorial é a divergência entre a planta e o memorial descritivo (uma medida de 14,20 m na planta redigida como 14,25 m no texto) ou a soma das áreas resultantes não fechar exatamente com a área da matrícula original. Conferir o fechamento perimétrico e cruzar o texto do memorial com o desenho evita semanas de atraso.
          </p>
        ),
      },
    ],
    faq: [
      { q: 'Qual a área mínima para desdobrar um terreno?', a: 'A regra geral federal (Lei 6.766/79) é de 125 m² de área e 5 metros de testada (frente), mas a lei de zoneamento do município onde o imóvel está localizado pode exigir medidas maiores.' },
      { q: 'Precisa da assinatura dos vizinhos no desdobro?', a: 'Em regra, o desdobro de lote urbano aprovado pela prefeitura não exige anuência dos confrontantes, desde que as divisas externas do lote original não sejam alteradas.' },
      { q: 'O que acontece com a matrícula original após o desdobro?', a: 'O cartório averba o desdobro na matrícula original, encerra-a e abre uma nova matrícula para cada um dos lotes resultantes (lote A, lote B, etc.).' },
    ],
    related: ['retificacao-de-area', 'como-ler-matricula', 'documentos-para-comprar-imovel'],
  },
  'retificacao-de-area': {
    summary:
      'A retificação de área no Cartório de Registro de Imóveis (Art. 213 da Lei 6.015/73) serve para corrigir medidas perimétricas, ângulos ou área que estejam em desacordo com a realidade do terreno. ' +
      'O procedimento extrajudicial é mais rápido que uma ação judicial e exige planta assinada por profissional habilitado com ART ou RRT, memorial descritivo e anuência expressa de todos os vizinhos confrontantes.',
    sections: [
      {
        id: 'quando-e-necessaria',
        title: 'Quando a retificação de área é necessária',
        body: (
          <>
            <p>
              Muitas matrículas antigas trazem descrições imprecisas (como &quot;da cerca de arame até a porteira de pau a pique&quot;) ou omitem azimutes e coordenadas georreferenciadas.
              A retificação de área (Art. 213, II, da Lei de Registros Públicos) é necessária quando há inserção ou alteração de medidas perimétricas que resultem ou não em alteração da área total registrada.
            </p>
          </>
        ),
      },
      {
        id: 'procedimento-cartorio',
        title: 'Procedimento consensual no cartório de registro',
        body: (
          <>
            <p>
              O procedimento é conduzido diretamente pelo oficial do Registro de Imóveis competente, sem intervenção do juiz, desde que preenchidos os requisitos formais e não haja litígio ou sobreposição em imóveis vizinhos.
            </p>
            <List>
              <li>Requerimento assinado pelo proprietário e pelo responsável técnico;</li>
              <li>Planta e memorial descritivo contendo coordenadas UTM e fechamento perimétrico;</li>
              <li>ART (CREA) ou RRT (CAU) devidamente quitada;</li>
              <li>Anuência expressa de todos os confrontantes tabulares e de fato.</li>
            </List>
          </>
        ),
      },
      {
        id: 'confrontantes-e-anuencia',
        title: 'Vizinhos confrontantes e cartas de anuência',
        body: (
          <p>
            Todos os vizinhos que fazem divisa com o imóvel (frente, fundos, laterais direita e esquerda) devem anuir com a nova descrição. Se algum confrontante não assinar a planta, o oficial do cartório fará a notificação pessoal. Se o confrontante notificado não apresentar impugnação fundamentada em até 15 dias, seu silêncio é considerado como concordância tácita (art. 213, § 2º a 4º).
          </p>
        ),
      },
      {
        id: 'confronto-planta-memorial',
        title: 'Rigor técnico entre planta e memorial descritivo',
        body: (
          <p>
            O memorial e a planta devem ser matematicamente idênticos. O cálculo de erro linear de fechamento perimétrico (fórmula de Gauss) precisa atender aos padrões da Corregedoria Geral de Justiça e do INCRA/SIGEF para imóveis rurais. Qualquer divergência entre rumos, distâncias ou coordenadas enseja nota devolutiva imediata.
          </p>
        ),
      },
    ],
    faq: [
      { q: 'Quanto tempo demora uma retificação de área amigável?', a: 'Se todos os vizinhos assinarem a planta e a documentação estiver regular, o procedimento no cartório costuma levar entre 30 e 90 dias.' },
      { q: 'O que fazer se um confrontante se recusar a assinar?', a: 'O cartório fará a notificação formal. Se o confrontante apresentar impugnação sem fundamento plausível, o registrador tentará a conciliação; persistindo a controvérsia infundada, o caso poderá ser remetido ao juiz corregedor.' },
      { q: 'Retificação de área aumenta o valor venal do IPTU?', a: 'Se a retificação constatar que a área real do terreno é maior do que a averbada originalmente, a prefeitura atualizará o cadastro fiscal e o carnê de IPTU passará a refletir a metragem correta.' },
    ],
    related: ['desdobro-de-lote', 'como-ler-matricula', 'certidao-de-onus-reais'],
  },
  'usucapiao-extrajudicial': {
    summary:
      'A usucapião extrajudicial permite reconhecer a propriedade de um imóvel diretamente no Cartório de Registro de Imóveis, sem necessidade de processo judicial (Art. 216-A da Lei 6.015/73 e Provimento 65 do CNJ). ' +
      'O procedimento exige a participação obrigatória de um advogado, ata notarial de constatação lavrada em cartório de notas, planta com memorial descritivo e certidões negativas vintenárias.',
    sections: [
      {
        id: 'o-que-e',
        title: 'O que é a usucapião extrajudicial',
        body: (
          <>
            <p>
              Criada pelo Código de Processo Civil de 2015 e regulamentada pelo Provimento 65/2017 do Conselho Nacional de Justiça (CNJ), a usucapião extrajudicial é uma modalidade administrativa mais célere para regularizar imóveis quando o possuidor preenche os requisitos temporais e de posse mansa e pacífica.
            </p>
            <p>
              Ao contrário da via judicial, que pode durar de 5 a 10 anos, a via em cartório pode ser concluída em poucos meses se não houver contestação.
            </p>
          </>
        ),
      },
      {
        id: 'requisitos-prazos',
        title: 'Requisitos e prazos de posse',
        body: (
          <>
            <p>Os prazos de posse variam conforme a espécie de usucapião:</p>
            <List>
              <li><B>Usucapião Extraordinária:</B> 15 anos de posse ininterrupta (ou 10 anos se estabeleceu moradia habitual ou realizou obras/serviços produtivos), independente de justo título e boa-fé;</li>
              <li><B>Usucapião Ordinária:</B> 10 anos com justo título e boa-fé (ou 5 anos se adquirido onerosamente com registro cancelado e residência/investimento);</li>
              <li><B>Usucapião Especial Urbana/Rural:</B> 5 anos para áreas até 250 m² (urbana) ou 50 hectares (rural), para moradia própria, sem possuir outro imóvel.</li>
            </List>
          </>
        ),
      },
      {
        id: 'documentos-necessarios',
        title: 'Documentos obrigatórios e ata notarial',
        body: (
          <>
            <p>A petição deve ser instruída com:</p>
            <List>
              <li>Ata notarial lavrada pelo Tabelião de Notas atestando o tempo de posse e a ausência de litígio;</li>
              <li>Planta e memorial descritivo assinados por profissional habilitado (ART/RRT) e pelos confrontantes;</li>
              <li>Certidões negativas dos distribuidores forenses da comarca e da Justiça Federal;</li>
              <li>Justo título ou quaisquer documentos que demonstrem a continuidade e a boa-fé da posse (contas de luz, IPTU, contratos).</li>
            </List>
          </>
        ),
      },
      {
        id: 'confrontantes-notificacao',
        title: 'Notificação dos confrontantes e entes públicos',
        body: (
          <p>
            O oficial de registro notificará os entes públicos (União, Estado e Município) para que se manifestem sobre interesse no imóvel em 15 dias, bem como eventuais titulares registrais e confrontantes que não tenham assinado previamente a documentação.
          </p>
        ),
      },
    ],
    faq: [
      { q: 'É obrigatório ter advogado na usucapião extrajudicial?', a: 'Sim. A legislação brasileira exige a representação por advogado ou defensor público em todas as fases do procedimento perante o cartório.' },
      { q: 'Quanto custa fazer usucapião em cartório?', a: 'Os custos envolvem os emolumentos da ata notarial no cartório de notas, os emolumentos de registro no cartório de imóveis (tabelados por lei estadual), os honorários do responsável técnico pela planta e os honorários advocatícios.' },
      { q: 'O que acontece se alguém contestar a usucapião no cartório?', a: 'Havendo impugnação fundamentada que não seja sanada por conciliação entre as partes, o registrador encerra a via extrajudicial e remete os autos ao juízo competente.' },
    ],
    related: ['retificacao-de-area', 'como-ler-matricula', 'documentos-para-comprar-imovel'],
  },
};
