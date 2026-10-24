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
      'e indisponibilidades — conferindo se cada uma foi cancelada por uma averbação posterior.',
    sections: [
      {
        id: 'o-que-e',
        title: 'O que é a matrícula do imóvel',
        body: (
          <>
            <p>
              Cada imóvel tem uma matrícula própria, com número único no cartório da região onde ele fica. Tudo o que acontece com ele
              juridicamente — vendas, heranças, financiamentos, penhoras — é anotado ali, em ordem cronológica (Lei 6.015/73, art. 176).
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
              <li><B>Alienação fiduciária:</B> comum em financiamentos — até a quitação, a propriedade fica com o banco. <GuideLink to="/guia/alienacao-fiduciaria-na-matricula">Entenda</GuideLink>.</li>
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
      { q: 'Onde fica o nome do dono na matrícula?', a: 'No último registro (R) de transmissão que não foi cancelado depois — compra e venda, doação, partilha ou adjudicação. O nome no cabeçalho é o do proprietário na abertura da matrícula, que pode já ter vendido o imóvel.' },
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
            de cancelamento sempre cita o número do ato que cancela — é assim que se confirma que um ônus foi baixado.
          </p>
        ),
      },
      {
        id: 'escritura',
        title: 'Por que a escritura não basta',
        body: (
          <p>
            A propriedade só se transfere com o <B>registro</B> do título no Registro de Imóveis (Código Civil, art. 1.245). Enquanto a
            escritura não é registrada, o vendedor continua sendo o dono perante todos — e dívidas dele podem atingir o imóvel. Por isso,
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
            ainda vale — mesmo que o vendedor diga que já pagou. Peça o termo de quitação e a certidão atualizada.
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
            <li><B>Inteiro teor:</B> cópia completa da matrícula, com todo o histórico — ideal para entender a cadeia de proprietários.</li>
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
            um imóvel antes de fazer proposta, uma certidão um pouco mais antiga serve, mas peça uma nova antes de assinar — uma penhora
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
            <li><B>Matrícula atualizada com ônus reais</B> — no máximo 30 dias para a escritura (<GuideLink to="/guia/certidao-de-onus-reais">veja como pedir</GuideLink>);</li>
            <li><B>Certidão negativa de débitos de IPTU</B> (prefeitura) ou, se rural, certidão do ITR e o CCIR;</li>
            <li><B>Declaração de quitação do condomínio</B>, assinada pelo síndico — as dívidas de condomínio acompanham o imóvel (Código Civil, art. 1.345);</li>
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
            <li>Registre o título na matrícula o quanto antes — só o registro transfere a propriedade.</li>
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
};
