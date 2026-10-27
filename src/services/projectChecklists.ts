/**
 * Checklists Normativos e Procedimentais de Registro de Imóveis
 * Engenharia Reversa e Integração ValidaImóvel
 * 
 * Contém os 116 itens normativos para os 6 procedimentos registrais:
 * 1. Desdobro (16 itens)
 * 2. Divisão e extinção de condomínio (17 itens)
 * 3. Estremação (29 itens)
 * 4. Reurb (11 itens)
 * 5. Retificação de área (28 itens)
 * 6. Unificação (15 itens)
 */

export interface ChecklistItem {
  id: string;
  originalLabel?: string;
  text: string;
  category?: string;
  docACorrigir?: string;
  help?: string;
}

export interface ProcedureChecklist {
  key: string;
  name: string;
  description: string;
  items: ChecklistItem[];
}

export type ChecklistStatus =
  | 'CONFORME'
  | 'DIVERGENTE'
  | 'PENDENTE'
  | 'NÃO APLICÁVEL'
  | 'NÃO VERIFICÁVEL';

export interface ChecklistAnswer {
  status: ChecklistStatus;
  evidence: string;
  correction?: string;
}

export const CHECKLIST_STATUS_CONFIG: Record<
  ChecklistStatus,
  { label: string; color: string; badgeClass: string }
> = {
  CONFORME: {
    label: 'CONFORME',
    color: '#1d7a46',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  DIVERGENTE: {
    label: 'DIVERGENTE',
    color: '#b3261e',
    badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
  },
  PENDENTE: {
    label: 'PENDENTE DE DOCUMENTO',
    color: '#9a6200',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  'NÃO APLICÁVEL': {
    label: 'NÃO APLICÁVEL',
    color: '#5d6762',
    badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
  },
  'NÃO VERIFICÁVEL': {
    label: 'NÃO VERIFICÁVEL',
    color: '#9a6200',
    badgeClass: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
  },
};

export const PROCEDURE_CHECKLISTS: ProcedureChecklist[] = [
  {
    "key": "desdobro",
    "name": "Desdobro",
    "description": "Subdivisão de lote urbano para formação de novos lotes com frente para via pública oficial sem abertura de vias.",
    "items": [
      {
        "id": "DESDOBRO-01",
        "originalLabel": "ITEM 01",
        "text": "O imóvel objeto do desdobro está situado em via ou logradouro públicos oficiais, integralmente urbanizado?",
        "help": "",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      },
      {
        "id": "DESDOBRO-02",
        "originalLabel": "ITEM 02",
        "text": "Foi respeitada a fração mínima de parcelamento nos lotes objeto de parcelamento?",
        "help": "",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      },
      {
        "id": "DESDOBRO-03",
        "originalLabel": "ITEM 03",
        "text": "Foi elaborado o requerimento subscrito por todos os proprietários?",
        "help": "",
        "docACorrigir": "Contratos, procurações e anuências",
        "category": "Contratos, procurações e anuências"
      },
      {
        "id": "DESDOBRO-04",
        "originalLabel": "ITEM 03",
        "text": "Caso algum proprietário seja representado por procurador, deverá apresentar a procuração por traslado, certidão ou cópia autenticada, ou instrumento particular com firma reconhecida, em original ou cópia autenticada.",
        "help": "",
        "docACorrigir": "Contratos, procurações e anuências",
        "category": "Contratos, procurações e anuências"
      },
      {
        "id": "DESDOBRO-05",
        "originalLabel": "ITEM 04",
        "text": "Cópia autenticada ou original da certidão de nascimento/casamento (conforme o caso), bem como a cópia autenticada do RG e CPF dos proprietários.",
        "help": "Obs.: Caso sejam casados pelo regime da Comunhão Universal de Bens ou Regime da Separação Total de Bens, deve apresentar a Certidão de Registro de Pacto Antenupcial;",
        "docACorrigir": "Documentos pessoais",
        "category": "Documentos pessoais"
      },
      {
        "id": "DESDOBRO-06",
        "originalLabel": "ITEM 05",
        "text": "Se for pessoa jurídica, solicitar a Certidão Simplificada atualizada da Junta Comercial (90 dias).",
        "help": "",
        "docACorrigir": "Documentos pessoais",
        "category": "Documentos pessoais"
      },
      {
        "id": "DESDOBRO-07",
        "originalLabel": "ITEM SEM Nº",
        "text": "Foi verificado se a matrícula objeto do desdobro está com a descrição atualizada?",
        "help": "Caso o imóvel não tenha informação de quarteirão, distância da esquina mais próxima, lado par ou ímpar, deve ser apresentado junto com o desdobro certidão municipal para fazer averbação\nCaso as ruas do quarteirão ou os confrontantes da matrícula estejam desatualizadas (nome anterior ou proprietário anterior), deve ser apresentado junto com a unificação certidão municipal para atualização\nSe a matrícula tiver coordenadas, a descrição dos lotes deve ser também com coordenadas\nSe a área não tiver coordenadas, a descrição dos lotes tem que ser também sem coordenadas, apenas com as medidas\nSe não tiver medidas, tem que primeiro fazer retificação de área",
        "docACorrigir": "Matrícula principal",
        "category": "Matrícula principal"
      },
      {
        "id": "DESDOBRO-08",
        "originalLabel": "ITEM 06",
        "text": "Memorial descritivo conforme a ABNT NBR 17047/2022, devidamente assinado pelo responsável técnico e proprietário com firma reconhecida dos lotes? Deverá constar:",
        "help": "Cabeçalho contendo nome completo e CPF do proprietário, endereço completo;\nCódigo da parcela (se existir), número da matrícula e CNS (circunscrição);\nSistema de referência e projeção cartográfica utilizada no cálculo das distâncias e da área.\nÁrea e perímetro de cada lote;\nTabela com dados técnicos contendo o código do vértice e suas respectivas coordenadas geodésicas, as matrículas dos imóveis confrontantes (a descrição tabular da parcela deve iniciar no primeiro vértice de confrontação com o sistema viário ou acesso a este e seguir no sentido horário).\nAssinatura do responsável técnico, formação profissional, número no registro no conselho de classe e número da ART, TRT OU RRT;\nCroqui do polígono da parcela do imóvel indicando a posição do sistema viário;\nDescrição textual.\nCampo de assinatura para os proprietários, indicando o CPF/CNPJ.",
        "docACorrigir": "Memorial descritivo",
        "category": "Memorial descritivo"
      },
      {
        "id": "DESDOBRO-09",
        "originalLabel": "ITEM 07",
        "text": "No memorial descritivo, a descrição dos lotes, deve constar as informações:",
        "help": "logradouro, número e bairro ou localidade; ainda, caso o imóvel não esteja georreferenciado, tratando-se só de terreno, se esse fica do lado par ou do lado ímpar do logradouro, em que quadra e a que distância métrica da edificação ou da esquina mais próxima;\nse lote, além dos requisitos da alínea \"b\", o número do lote, da quadra",
        "docACorrigir": "Memorial descritivo",
        "category": "Memorial descritivo"
      },
      {
        "id": "DESDOBRO-10",
        "originalLabel": "ITEM 08",
        "text": "Relatório técnico, contendo:",
        "help": "Objeto, finalidade, período de execução, localização;\nsistema geodésico de referência do sistema de coordenadas plano-retangulares, com seu nível de referência altimétrico;\nmemorial descritivo dos serviços executados, contendo, no mínimo, precisões obtidas, quantidades executadas, relação dos instrumentos utilizados, equipe técnica e identificação do responsável técnico e documentos produzidos, incluindo as monografias, e memórias de cálculo, destacando-se: planilhas de cálculo das poligonais e planilhas das linhas de nivelamento.",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      },
      {
        "id": "DESDOBRO-11",
        "originalLabel": "ITEM 09",
        "text": "Plantas, assinadas pelo responsável técnico, e pelos proprietários com as firmas reconhecidas ou assinados eletronicamente dos lotes?",
        "help": "Na planta apresentada deverá conter:\nVértices do imóvel com seus respectivos códigos;\nPolígono fechado de cada lote, formado pela união dos vértices;\nDistâncias lineares entre os vértices na projeção cartográfica utilizada;\nFeições topográficas que auxiliem na interpretação e caracterização do limite da parcela ou do imóvel;\nNúmero das matrículas dos imóveis confrontantes ou indicação que se trata de área de posse;\nTabela de coordenadas dos vértices e quadro de áreas de cada lote;\nInformação sobre o Datum e a projeção cartográfica utilizada e fator de escala;\nConvenções, escala gráfica e direção norte da projeção cartográfica utilizada;\nNome completo do proprietário, endereço completo do imóvel, nome completo e número do registro profissional no conselho de classe do responsável técnico e número da ART, TRT ou RRT;\nInformação de área e perímetro na projeção cartográfica utilizada;\nData do levantamento e da conclusão da planta topográfica.\nDescrição (desenho) atual do imóvel, contendo a área do imóvel;\nDeverá constar os campos de assinatura indicando a qualidade (proprietários), e a indicação do número da matrícula ou de que o imóvel não possui.",
        "docACorrigir": "Planta",
        "category": "Planta"
      },
      {
        "id": "DESDOBRO-12",
        "originalLabel": "ITEM 10",
        "text": "A matrícula possui algum ônus? Verificar a necessidade de anuência. Os ônus serão transportados.",
        "help": "",
        "docACorrigir": "Matrícula principal",
        "category": "Matrícula principal"
      },
      {
        "id": "DESDOBRO-13",
        "originalLabel": "ITEM 11",
        "text": "Foi apresentado aprovação municipal com expressa dispensa de o parcelador realizar quaisquer melhoramentos?",
        "help": "",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      },
      {
        "id": "DESDOBRO-14",
        "originalLabel": "ITEM 12",
        "text": "Anotação de Responsabilidade Técnica -- ART e comprovante de pagamento",
        "help": "",
        "docACorrigir": "Responsabilidade técnica",
        "category": "Responsabilidade técnica"
      },
      {
        "id": "DESDOBRO-15",
        "originalLabel": "ITEM 13",
        "text": "Foi feita a conferência do memoria descritivo e planta?",
        "help": "",
        "docACorrigir": "Planta",
        "category": "Planta"
      },
      {
        "id": "DESDOBRO-16",
        "originalLabel": "ITEM 14",
        "text": "Juntar todos os documentos e enviar para o Registro de Imóveis",
        "help": "",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      }
    ]
  },
  {
    "key": "divisao",
    "name": "Divisão e extinção de condomínio",
    "description": "Partilha e individualização de frações ideais em condomínio voluntário ou pro indiviso.",
    "items": [
      {
        "id": "DIVISAO-01",
        "originalLabel": "ITEM 01",
        "text": "Foi respeitada a fração mínima de parcelamento nas glebas objeto de divisão?",
        "help": "",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      },
      {
        "id": "DIVISAO-02",
        "originalLabel": "ITEM 02",
        "text": "Foi respeitada a área em metros quadrados de cada condômino?",
        "help": "Caso algum condômino tenha ficado com área superior a outro, é necessário verificar e emitir as guias de ITBI",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      },
      {
        "id": "DIVISAO-03",
        "originalLabel": "ITEM 03",
        "text": "Caso algum proprietário seja representado por procurador, deverá apresentar a procuração por traslado, certidão ou cópia autenticada, ou instrumento particular com firma reconhecida, em original ou cópia autenticada.",
        "help": "",
        "docACorrigir": "Contratos, procurações e anuências",
        "category": "Contratos, procurações e anuências"
      },
      {
        "id": "DIVISAO-04",
        "originalLabel": "ITEM 04",
        "text": "Cópia autenticada ou original da certidão de nascimento/casamento (conforme o caso), bem como a cópia autenticada do RG e CPF dos proprietários.",
        "help": "Obs.: Caso sejam casados pelo regime da Comunhão Universal de Bens ou Regime da Separação Total de Bens, deve apresentar a Certidão de Registro de Pacto Antenupcial;",
        "docACorrigir": "Documentos pessoais",
        "category": "Documentos pessoais"
      },
      {
        "id": "DIVISAO-05",
        "originalLabel": "ITEM 05",
        "text": "Se for pessoa jurídica, solicitar a Certidão Simplificada atualizada da Junta Comercial (90 dias).",
        "help": "",
        "docACorrigir": "Documentos pessoais",
        "category": "Documentos pessoais"
      },
      {
        "id": "DIVISAO-06",
        "originalLabel": "ITEM 06",
        "text": "Memorial descritivo conforme a ABNT NBR 17047/2022, devidamente assinado pelo responsável técnico e proprietário com firma reconhecida? Deverá constar:",
        "help": "Cabeçalho contendo nome completo e CPF do proprietário, endereço completo;\nCódigo da parcela (se existir), número da matrícula e CNS (circunscrição);\nSistema de referência e projeção cartográfica utilizada no cálculo das distâncias e da área.\nÁrea e perímetro do imóvel;\nTabela com dados técnicos contendo o código do vértice e suas respectivas coordenadas geodésicas, as matrículas dos imóveis confrontantes (a descrição tabular da parcela deve iniciar no primeiro vértice de confrontação com o sistema viário ou acesso a este e seguir no sentido horário).\nAssinatura do responsável técnico, formação profissional, número no registro no conselho de classe e número da ART, TRT OU RRT;\nCroqui do polígono da parcela do imóvel indicando a posição do sistema viário;\nDescrição textual.\nCampo de assinatura para os proprietários, indicando o CPF/CNPJ.",
        "docACorrigir": "Memorial descritivo",
        "category": "Memorial descritivo"
      },
      {
        "id": "DIVISAO-07",
        "originalLabel": "ITEM 07",
        "text": "No memorial descritivo, quando se tratar de imóvel urbano, deve constar as informações:",
        "help": "logradouro, número e bairro ou localidade; ainda, caso o imóvel não esteja georreferenciado, tratando-se só de terreno, se esse fica do lado par ou do lado ímpar do logradouro, em que quadra e a que distância métrica da edificação ou da esquina mais próxima;\nse lote, além dos requisitos da alínea \"b\", o número do lote, da quadra e o nome do loteamento;",
        "docACorrigir": "Memorial descritivo",
        "category": "Memorial descritivo"
      },
      {
        "id": "DIVISAO-08",
        "originalLabel": "ITEM 08",
        "text": "Relatório técnico, contendo:",
        "help": "Objeto, finalidade, período de execução, localização;\nsistema geodésico de referência do sistema de coordenadas plano-retangulares, com seu nível de referência altimétrico;\nmemorial descritivo dos serviços executados, contendo, no mínimo, precisões obtidas, quantidades executadas, relação dos instrumentos utilizados, equipe técnica e identificação do responsável técnico e documentos produzidos, incluindo as monografias, e memórias de cálculo, destacando-se: planilhas de cálculo das poligonais e planilhas das linhas de nivelamento.",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      },
      {
        "id": "DIVISAO-09",
        "originalLabel": "ITEM 09",
        "text": "Plantas, assinadas pelo responsável técnico, pelos com as firmas reconhecidas ou assinados eletronicamente?",
        "help": "Na planta apresentada deverá conter:\nVértices do imóvel com seus respectivos códigos;\nPolígono fechado do imóvel, formado pela união dos vértices;\nDistâncias lineares entre os vértices na projeção cartográfica utilizada;\nFeições topográficas que auxiliem na interpretação e caracterização do limite da parcela ou do imóvel;\nNúmero das matrículas dos imóveis confrontantes ou indicação que se trata de área de posse;\nTabela de coordenadas dos vértices e quadro de áreas;\nInformação sobre o Datum e a projeção cartográfica utilizada e fator de escala;\nConvenções, escala gráfica e direção norte da projeção cartográfica utilizada;\nNome completo do proprietário, endereço completo do imóvel, nome completo e número do registro profissional no conselho de classe do responsável técnico e número da ART, TRT ou RRT;\nInformação de área e perímetro na projeção cartográfica utilizada;\nData do levantamento e da conclusão da planta topográfica.\nDescrição (desenho) atual do imóvel, contendo a área do imóvel;\nDeverá constar os campos de assinatura indicando a qualidade (proprietários), e a indicação do número da matrícula ou de que o imóvel não possui.",
        "docACorrigir": "Planta",
        "category": "Planta"
      },
      {
        "id": "DIVISAO-10",
        "originalLabel": "ITEM 10",
        "text": "A matrícula possui algum ônus? Verificar a necessidade de anuência. Os ônus serão transportados.",
        "help": "Hipoteca: não precisa da anuência do credor hipotecário, todavia o cartório irá comunicar a ele a realização do registro da localização da parcela;\nPenhora: não precisa de autorização judicial, mas o cartório irá comunica o fato ao juiz competente, por ofício;\nPenhora fiscal: em favor do Instituto Nacional de Seguridade Social (INSS), deve ser apresentada a expressa anuência daquele ente público, uma vez que perdida a disponibilidade do bem na forma do § 1º do art. 53 da Lei n. 8.212/91;\nAnticrese: solicitar a anuência do credor anticrético;\nAlienação Fiduciária: O credor (banco) deve assinar todo o processo junto com o proprietário (devedor);\nUsufruto: usufrutuário deve assinar todo o processo junto com o nu-porprietário\nIndisponibilidade por determinação judicial ou ato da administração pública federal: apresentar autorização expressa do juiz ou autoridade competente;\nArrolamento, medida de cautela fiscal: não precisa da anuência todavia o cartório irá comunicar o agente fiscal",
        "docACorrigir": "Matrícula principal",
        "category": "Matrícula principal"
      },
      {
        "id": "DIVISAO-11",
        "originalLabel": "ITEM 11",
        "text": "Se tratando de imóvel rural, foram apresentados os documentos?",
        "help": "□ Cadastro Ambiental Rural -- CAR (os dados não precisam coincidir com a matrícula -- art. 806 do CN);\n□ Certificado de Cadastro do Imóvel Rural -- CCIR 2023; Art. 974, V, \"a\", do CN.\n□ Certidão Negativa de Débitos do ITR (dentro do prazo de validade). Art. 974, V, \"a\", do CN.\nOs documentos podem se referir a matrícula \"mãe\", não precisa ser da área estremada.",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      },
      {
        "id": "DIVISAO-12",
        "originalLabel": "ITEM 12",
        "text": "Se o imóvel possuir mais de 25 hectares (250.000.00m²), foi feita a certificação do INCRA? (Art. 10, decreto 4.449/2002). -- Até 20/11/2025.",
        "help": "",
        "docACorrigir": "Responsabilidade técnica",
        "category": "Responsabilidade técnica"
      },
      {
        "id": "DIVISAO-13",
        "originalLabel": "ITEM 13",
        "text": "Se tratando de imóvel urbano, é necessário lidar como um DESDOBRO ou DESMEMBRAMENTO (se for o caso)",
        "help": "Inscrição imobiliária -- art. 974, VI do CN.\nO oficial observará o procedimento inerente ao desdobro quando o imóvel estiver situado em via ou logradouro públicos oficiais, integralmente urbanizados, nesse caso deve ser apresentado aprovação municipal com expressa dispensa de o parcelador realizar quaisquer melhoramentos.",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      },
      {
        "id": "DIVISAO-14",
        "originalLabel": "ITEM 14",
        "text": "Anotação de Responsabilidade Técnica -- ART e comprovante de pagamento",
        "help": "",
        "docACorrigir": "Responsabilidade técnica",
        "category": "Responsabilidade técnica"
      },
      {
        "id": "DIVISAO-15",
        "originalLabel": "ITEM 15",
        "text": "Foi feita a conferência do memoria descritivo e planta?",
        "help": "",
        "docACorrigir": "Planta",
        "category": "Planta"
      },
      {
        "id": "DIVISAO-16",
        "originalLabel": "ITEM 16",
        "text": "Juntar todos os documentos em duas vias (uma para o RI) e enviar para o Tabelionato de Notas confeccionar a Escritura",
        "help": "",
        "docACorrigir": "Contratos, procurações e anuências",
        "category": "Contratos, procurações e anuências"
      },
      {
        "id": "DIVISAO-17",
        "originalLabel": "ITEM 17",
        "text": "Após protocolar a retificação no registro de imóveis, fazer o cadastro e emitir o o memorial descritivo pelo Sistema de Informação Geográfica (SIG-RI) do Registro de Imóveis do Brasil.",
        "help": "",
        "docACorrigir": "Memorial descritivo",
        "category": "Memorial descritivo"
      }
    ]
  },
  {
    "key": "estremacao",
    "name": "Estremação",
    "description": "Localização e individualização de gleba ou fração ideal delimitada com posse mansa superior a 5 anos (Provimento CNJ nº 149/2023, NSCGJ-SP e correlatos).",
    "items": [
      {
        "id": "ESTREMACAO-01",
        "originalLabel": "ITEM 01",
        "text": "Foi verificado se o CLIENTE é o PROPRIETÁRIO REGISTRAL do imóvel pelo período de 5 anos?",
        "help": "Se não for, pode apresentar o título aquisitivo (compra e venda, partilha etc.) junto com a escritura de estremação (verificar se já foi protocolado, suas eventuais exigências e a ordem cronológica de registro)\nPode somar o tempo de posse com os proprietários anteriores",
        "docACorrigir": "Matrícula principal",
        "category": "Matrícula principal"
      },
      {
        "id": "ESTREMACAO-02",
        "originalLabel": "ITEM 02",
        "text": "Foi respeitada a fração mínima de parcelamento de imóvel rural ou a área mínima de lote urbano foi respeitada, tanto na área a ser estremada quanto na remanescente?",
        "help": "",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      },
      {
        "id": "ESTREMACAO-03",
        "originalLabel": "ITEM 03",
        "text": "Em caso de proprietário falecido:",
        "help": "Caso já houve partilha (ou seja, já fizeram Escritura Pública de Inventário) quem vai requerer são os herdeiros que receberam o imóvel;\nCaso já iniciou o processo judicialmente, mas não finalizaram ainda, quem vai requerer será o(a) viúvo(a) vivo(a) e espólio representado pelo inventariante, através do termo de nomeação de inventariante;\nQuando não houve partilha OU o inventariante assina, mediante uma Escritura Pública de nomeação de inventariante OU todos os herdeiros assinam terão que assinar;",
        "docACorrigir": "Contratos, procurações e anuências",
        "category": "Contratos, procurações e anuências"
      },
      {
        "id": "ESTREMACAO-04",
        "originalLabel": "ITEM 04",
        "text": "Caso algum proprietário seja representado por procurador, deverá apresentar a procuração por traslado, certidão ou cópia autenticada, ou instrumento particular com firma reconhecida, em original ou cópia autenticada.",
        "help": "",
        "docACorrigir": "Contratos, procurações e anuências",
        "category": "Contratos, procurações e anuências"
      },
      {
        "id": "ESTREMACAO-05",
        "originalLabel": "ITEM 05",
        "text": "Cópia autenticada ou original da certidão de nascimento/casamento (conforme o caso), bem como a cópia autenticada do RG e CPF dos proprietários.",
        "help": "Obs.: Caso sejam casados pelo regime da Comunhão Universal de Bens ou Regime da Separação Total de Bens, deve apresentar a Certidão de Registro de Pacto Antenupcial;",
        "docACorrigir": "Documentos pessoais",
        "category": "Documentos pessoais"
      },
      {
        "id": "ESTREMACAO-06",
        "originalLabel": "ITEM 06",
        "text": "Se for pessoa jurídica, solicitar a Certidão Simplificada atualizada da Junta Comercial (90 dias).",
        "help": "",
        "docACorrigir": "Documentos pessoais",
        "category": "Documentos pessoais"
      },
      {
        "id": "ESTREMACAO-07",
        "originalLabel": "ITEM 07",
        "text": "Memorial descritivo conforme a ABNT NBR 17047/2022, devidamente assinado pelo responsável técnico, proprietário e confrontantes, com firma reconhecida? Deverá constar:",
        "help": "Cabeçalho contendo nome completo e CPF do proprietário, endereço completo;\nCódigo da parcela (se existir), número da matrícula e CNS (circunscrição);\nSistema de referência e projeção cartográfica utilizada no cálculo das distâncias e da área.\nÁrea e perímetro do imóvel;\nTabela com dados técnicos contendo o código do vértice e suas respectivas coordenadas geodésicas, as matrículas dos imóveis confrontantes (a descrição tabular da parcela deve iniciar no primeiro vértice de confrontação com o sistema viário ou acesso a este e seguir no sentido horário).\nAssinatura do responsável técnico, formação profissional, número no registro no conselho de classe e número da ART, TRT OU RRT;\nCroqui do polígono da parcela do imóvel indicando a posição do sistema viário;\nDescrição textual.\nCampo de assinatura para os proprietários e confrontantes, indicando o CPF/CNPJ.",
        "docACorrigir": "Memorial descritivo",
        "category": "Memorial descritivo"
      },
      {
        "id": "ESTREMACAO-08",
        "originalLabel": "ITEM 08",
        "text": "No memorial descritivo, quando se tratar de imóvel urbano, deve constar as informações:",
        "help": "logradouro, número e bairro ou localidade; ainda, caso o imóvel não esteja georreferenciado, tratando-se só de terreno, se esse fica do lado par ou do lado ímpar do logradouro, em que quadra e a que distância métrica da edificação ou da esquina mais próxima;\nse lote, além dos requisitos da alínea \"b\", o número do lote, da quadra e o nome do loteamento;",
        "docACorrigir": "Memorial descritivo",
        "category": "Memorial descritivo"
      },
      {
        "id": "ESTREMACAO-09",
        "originalLabel": "ITEM 09",
        "text": "Relatório técnico, contendo:",
        "help": "Objeto, finalidade, período de execução, localização;\nsistema geodésico de referência do sistema de coordenadas plano-retangulares, com seu nível de referência altimétrico;\nmemorial descritivo dos serviços executados, contendo, no mínimo, precisões obtidas, quantidades executadas, relação dos instrumentos utilizados, equipe técnica e identificação do responsável técnico e documentos produzidos, incluindo as monografias, e memórias de cálculo, destacando-se: planilhas de cálculo das poligonais e planilhas das linhas de nivelamento.",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      },
      {
        "id": "ESTREMACAO-10",
        "originalLabel": "ITEM 10",
        "text": "Plantas, assinadas pelo responsável técnico, pelo proprietário requerente e pelos confrontantes, com as firmas reconhecidas ou assinados eletronicamente?",
        "help": "Na planta apresentada deverá conter:\nVértices do imóvel com seus respectivos códigos;\nPolígono fechado do imóvel, formado pela união dos vértices;\nDistâncias lineares entre os vértices na projeção cartográfica utilizada;\nFeições topográficas que auxiliem na interpretação e caracterização do limite da parcela ou do imóvel;\nNúmero das matrículas dos imóveis confrontantes ou indicação que se trata de área de posse;\nTabela de coordenadas dos vértices e quadro de áreas;\nInformação sobre o Datum e a projeção cartográfica utilizada e fator de escala;\nConvenções, escala gráfica e direção norte da projeção cartográfica utilizada;\nNome completo do proprietário, endereço completo do imóvel, nome completo e número do registro profissional no conselho de classe do responsável técnico e número da ART, TRT ou RRT;\nInformação de área e perímetro na projeção cartográfica utilizada;\nData do levantamento e da conclusão da planta topográfica.\nDescrição (desenho) atual do imóvel, contendo a área do imóvel;\nDeverá constar os campos de assinatura indicando a qualidade (proprietário, possuidor, requerente e CPF), e a indicação do número da matrícula ou de que o imóvel não possui.",
        "docACorrigir": "Planta",
        "category": "Planta"
      },
      {
        "id": "ESTREMACAO-11",
        "originalLabel": "ITEM 11",
        "text": "Foram emitidas as matrículas dos confrontantes e confirmados que os confrontantes indicados são proprietários destes imóveis? (os confrontantes podem fazer parte ou não da matrícula que está sendo estremada. Contudo, é comum que pelo menos um confrontante faça parte da matrícula, caso contrário, investigar)",
        "help": "",
        "docACorrigir": "Matrículas dos confrontantes",
        "category": "Matrículas dos confrontantes"
      },
      {
        "id": "ESTREMACAO-12",
        "originalLabel": "ITEM 12",
        "text": "Algum confrontante não vai dar anuência? (os confrontantes também precisam ir assinar a Escritura)",
        "help": "Fazer requerimento para notificação, com três vias da planta e memorial descritivo.",
        "docACorrigir": "Matrículas dos confrontantes",
        "category": "Matrículas dos confrontantes"
      },
      {
        "id": "ESTREMACAO-13",
        "originalLabel": "ITEM 13",
        "text": "Quando o confrontante for falecido, será representado pelo inventariante, mediante a comprovação do múnus;",
        "help": "Caso não haja inventário em andamento, qualquer dos sucessores será legitimado a dar anuência, comprovando-se sua condição com a certidão de óbito e prova de ser sucessor; se houver inventário concluído e não registrado, qualquer daqueles que houver recebido o imóvel poderá manifestar a anuência. Art. 988, VII do CN. -- Art. 824 do CN.",
        "docACorrigir": "Matrículas dos confrontantes",
        "category": "Matrículas dos confrontantes"
      },
      {
        "id": "ESTREMACAO-14",
        "originalLabel": "ITEM 14",
        "text": "Se tratando o imóvel confrontante de um condomínio geral, poderá ser representado por qualquer um dos condôminos.",
        "help": "Se tratando de condomínio edilício, será representado pelo síndico ou comissão de representantes; nos casos de casas ou simples que não tenham síndico eleito, poderá ser colhida anuência do(s) proprietário(s) das casas cujos limites toquem o imóvel retificando..",
        "docACorrigir": "Matrículas dos confrontantes",
        "category": "Matrículas dos confrontantes"
      },
      {
        "id": "ESTREMACAO-15",
        "originalLabel": "ITEM 15",
        "text": "Não se serão considerados confrontantes:",
        "help": "a) os titulares de direitos reais de garantia hipotecária ou pignoratícia;\nb) os titulares de crédito vincendo, cuja propriedade imobiliária esteja vinculada, temporariamente, à operação de crédito financeiro; ou\nc) outros titulares de direitos de uso, gozo ou fruição.",
        "docACorrigir": "Matrículas dos confrontantes",
        "category": "Matrículas dos confrontantes"
      },
      {
        "id": "ESTREMACAO-16",
        "originalLabel": "ITEM 16",
        "text": "A matrícula possui algum ônus?",
        "help": "Hipoteca: não precisa da anuência do credor hipotecário, todavia o cartório irá comunicar a ele a realização do registro da localização da parcela;\nPenhora: não precisa de autorização judicial, mas o cartório irá comunica o fato ao juiz competente, por ofício;\nPenhora fiscal: em favor do Instituto Nacional de Seguridade Social (INSS), deve ser apresentada a expressa anuência daquele ente público, uma vez que perdida a disponibilidade do bem na forma do § 1º do art. 53 da Lei n. 8.212/91;\nAnticrese: solicitar a anuência do credor anticrético;\nAlienação Fiduciária: O credor (banco) deve assinar todo o processo junto com o proprietário (devedor);\nUsufruto: usufrutuário deve assinar todo o processo junto com o nu-porprietário\nIndisponibilidade por determinação judicial ou ato da administração pública federal: apresentar autorização expressa do juiz ou autoridade competente;\nArrolamento, medida de cautela fiscal: não precisa da anuência todavia o cartório irá comunicar o agente fiscal;",
        "docACorrigir": "Responsabilidade técnica",
        "category": "Responsabilidade técnica"
      },
      {
        "id": "ESTREMACAO-17",
        "originalLabel": "ITEM 17",
        "text": "O imóvel foi dividido em duas ou mais glebas em razão de Rua ou Rodovia que \"corta\" o imóvel?",
        "help": "Em caso ser seccionado, por via pública instalada anteriormente pelo poder público: deverá apresentar certidão do município que ateste que a rua que corta o imóvel é preexistente ao pedido de retificação, aceita e reconhecida como oficial e está incorporada ao domínio público como uso comum do povo.\nDeverá ficar em condomínio em todas as glebas, proporcionalmente ao que possuem na matrícula OU apresentar juntamente com a retificação a Escritura Pública de Divisão e Extinção de Condomínio, que será analisada separadamente.",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      },
      {
        "id": "ESTREMACAO-18",
        "originalLabel": "ITEM 18",
        "text": "Se o imóvel objeto da retificação fazer divisa com vias públicas, estradas, ruas, travessas e rios navegáveis, deverá ser feita a declaração do responsável técnico de que a medição respeitou plenamente as divisas com as áreas e faixas de domínio de imóveis públicos, conforme art. 974, §9º do CN.",
        "help": "",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      },
      {
        "id": "ESTREMACAO-19",
        "originalLabel": "ITEM 19",
        "text": "Se trata de um imóvel uma estremação de dois proprietários juntos, permanecendo um condomínio? Caso positivo, foi indicado no projeto a área ideal de cada proprietário após a estremação?",
        "help": "Deverá ser proporcional ao que cada proprietário possui na matrícula.",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      },
      {
        "id": "ESTREMACAO-20",
        "originalLabel": "ITEM 20",
        "text": "Se tratando de imóvel rural, foram apresentados os documentos?",
        "help": "□ Cadastro Ambiental Rural -- CAR (os dados não precisam coincidir com a matrícula -- art. 806 do CN);\n□ Certificado de Cadastro do Imóvel Rural -- CCIR 2023; Art. 974, V, \"a\", do CN.\n□ Certidão Negativa de Débitos do ITR (dentro do prazo de validade). Art. 974, V, \"a\", do CN.\nOs documentos podem se referir a matrícula \"mãe\", não precisa ser da área estremada.",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      },
      {
        "id": "ESTREMACAO-21",
        "originalLabel": "ITEM 21",
        "text": "Se o imóvel possuir mais de 25 hectares (250.000.00m²), foi feita a certificação do INCRA? (Art. 10, decreto 4.449/2002). -- Até 20/11/2025.",
        "help": "",
        "docACorrigir": "Responsabilidade técnica",
        "category": "Responsabilidade técnica"
      },
      {
        "id": "ESTREMACAO-22",
        "originalLabel": "ITEM 22",
        "text": "Se tratando de imóvel urbano, foram apresentados os seguintes documentos:",
        "help": "Certidão de confrontação -- art. 974, VI do CN.\nInscrição imobiliária -- art. 974, VI do CN.\nanuência do Município com a comprovação da preexistência de infraestrutura essencial",
        "docACorrigir": "Responsabilidade técnica",
        "category": "Responsabilidade técnica"
      },
      {
        "id": "ESTREMACAO-23",
        "originalLabel": "ITEM 23",
        "text": "Foram emitidas as certidões das matrículas dos imóveis confrontantes quando registradas em outra comarca?",
        "help": "",
        "docACorrigir": "Matrículas dos confrontantes",
        "category": "Matrículas dos confrontantes"
      },
      {
        "id": "ESTREMACAO-24",
        "originalLabel": "ITEM 24",
        "text": "Se algum confrontante foi indicado como área de posse, foram apresentados documentos comprobatórios?",
        "help": "São possibilitados todos os meios de prova admitidos em direito.",
        "docACorrigir": "Matrículas dos confrontantes",
        "category": "Matrículas dos confrontantes"
      },
      {
        "id": "ESTREMACAO-25",
        "originalLabel": "ITEM 25",
        "text": "Anotação de Responsabilidade Técnica -- ART e comprovante de pagamento",
        "help": "",
        "docACorrigir": "Responsabilidade técnica",
        "category": "Responsabilidade técnica"
      },
      {
        "id": "ESTREMACAO-26",
        "originalLabel": "ITEM 26",
        "text": "Na matrícula do imóvel foi feito algum registro de REURB?",
        "help": "Caso positivo, deverá ser solicitada a anuência da prefeitura municipal.",
        "docACorrigir": "Matrícula principal",
        "category": "Matrícula principal"
      },
      {
        "id": "ESTREMACAO-27",
        "originalLabel": "ITEM 27",
        "text": "Foi feita a conferência do memoria descritivo e planta?",
        "help": "",
        "docACorrigir": "Planta",
        "category": "Planta"
      },
      {
        "id": "ESTREMACAO-28",
        "originalLabel": "ITEM 28",
        "text": "Juntar todos os documentos em duas vias (uma para o RI) e enviar para o Tabelionato de Notas confeccionar a Escritura",
        "help": "",
        "docACorrigir": "Contratos, procurações e anuências",
        "category": "Contratos, procurações e anuências"
      },
      {
        "id": "ESTREMACAO-29",
        "originalLabel": "ITEM 29",
        "text": "Após protocolar a retificação no registro de imóveis, fazer o cadastro e emitir o o memorial descritivo pelo Sistema de Informação Geográfica (SIG-RI) do Registro de Imóveis do Brasil.",
        "help": "",
        "docACorrigir": "Memorial descritivo",
        "category": "Memorial descritivo"
      }
    ]
  },
  {
    "key": "reurb",
    "name": "Reurb",
    "description": "Regularização Fundiária Urbana de Interesse Social (REURB-S) ou Específico (REURB-E) conforme Lei 13.465/2017.",
    "items": [
      {
        "id": "REURB-01",
        "originalLabel": "ITEM 01",
        "text": "Requerimento solicitando a abertura do procedimento na Prefeitura Municipal",
        "help": "",
        "docACorrigir": "Contratos, procurações e anuências",
        "category": "Contratos, procurações e anuências"
      },
      {
        "id": "REURB-02",
        "originalLabel": "ITEM 02",
        "text": "Referente aos beneficiários:",
        "help": "Contrato ou outro documento referente a aquisição\nCópia do documento pessoal;\nProcuração",
        "docACorrigir": "Contratos, procurações e anuências",
        "category": "Contratos, procurações e anuências"
      },
      {
        "id": "REURB-03",
        "originalLabel": "ITEM 03",
        "text": "A área objeto da REURB apresentada é um núcleo urbano informal consolidado?",
        "help": "Art. 901. Considera-se núcleo urbano informal consolidado (NUIC), o assentamento humano clandestino ou irregular, situado em área urbana, ou rural com uso e característica urbanas e área inferior ao módulo rural, constituído por unidades imobiliárias, de difícil reversão, ou que não tenha sido possível efetuar a titulação de seus ocupantes.\nParágrafo único. A irregularidade ou clandestinidade pode abranger parte ou a totalidade do núcleo urbano.\nArt. 902. A legitimação fundiária somente será conferida àquele que detiver a posse de área integrante de núcleo urbano informal consolidado existente em 22 de dezembro de 2016, contudo, esse prazo não restringe à aplicação da legislação da REURB a núcleos urbanos informais posteriores.\nArt. 903. O título relacionado à REURB será submetido somente à qualificação formal, que compreende o exame de características extrínsecas do documento e a observância dalegislação específica.\nParágrafo único. Havendo indícios de desvio de finalidade ou outras irregularidades relacionadas ao mérito do título, o oficial deverá comunicar ao Ministério Público Estadual, com cópia integral da documentação que lhe foi apresentada.",
        "docACorrigir": "Responsabilidade técnica",
        "category": "Responsabilidade técnica"
      },
      {
        "id": "REURB-04",
        "originalLabel": "ITEM 04",
        "text": "Projeto Urbanístico com todos os requisitos estabelecidos no art. 31 do Decreto nº 9.310/18",
        "help": "Art. 31. O projeto urbanístico de regularização fundiária indicará, no mínimo:\nI - as áreas ocupadas, o sistema viário e as unidades imobiliárias existentes e projetados;\nII - as unidades imobiliárias a serem regularizadas, as suas características, a área, as confrontações, a localização, o nome do logradouro e o número da designação cadastral, se houver;\nIII - as unidades imobiliárias edificadas a serem regularizadas, as suas características, a área dos lotes e das edificações, as confrontações, a localização, o nome do logradouro e o número da designação cadastral;\nIV - quando for o caso, as quadras e as suas subdivisões em lotes ou as frações ideais vinculadas à unidade regularizada;\nV - os logradouros, os espaços livres, as áreas destinadas aos edifícios públicos e outros equipamentos urbanos, quando houver;\nVI - as áreas já usucapidas;\nVII - as medidas de adequação para a correção das desconformidades, quando necessárias;\nVIII - as medidas necessárias à adequação da mobilidade, da acessibilidade, da infraestrutura e da relocação de edificações;\nIX - as obras de infraestrutura essenciais, quando necessárias; e\nX - outros requisitos que sejam definidos pelo Poder Público municipal ou distrital.\n§ 1º Para fins do disposto na Lei nº 13.465, de 2017 , e neste Decreto, consideram-se infraestrutura essencial os seguintes equipamentos:\nI - sistema de abastecimento de água potável, coletivo ou individual;\nII - sistema de coleta e tratamento do esgotamento sanitário, coletivo ou individual;\nIII - rede de energia elétrica domiciliar;\nIV - soluções de drenagem, quando necessárias; e\nV - outros equipamentos a serem definidos pelo Poder Público municipal ou distrital em função das necessidades locais e das características regionais.\n§ 2º A Reurb poderá ser implementada por etapas e abranger o núcleo urbano informal de forma total ou parcial.\n§ 3º Na Reurb de parcelamentos do solo, as edificações já existentes nos lotes poderão ser regularizadas, a critério do Poder Público municipal ou distrital, em momento posterior, de forma coletiva ou individual.\n§ 4º As obras de implantação da infraestrutura essencial, de equipamentos comunitários e de melhoria habitacional e a sua manutenção poderão ser realizadas antes, durante ou após a conclusão da Reurb.\n§ 5º O Poder Público municipal ou distrital definirá os requisitos para elaboração do projeto de regularização fundiária, no que se refere aos desenhos, ao memorial descritivo e ao cronograma físico de obras e serviços a serem realizados, se for o caso.\n§ 6º A inexistência de regulamentação dos requisitos a que se refere o § 5º não impedirá o processamento da Reurb e o registro da CRF.\n§ 7º A planta e o memorial descritivo serão assinados por profissional legalmente habilitado, dispensada a apresentação da ART no Conselho Regional de Engenharia e Arquitetura ou do RRT no Conselho de Arquitetura e Urbanismo, quando o responsável técnico for servidor ou empregado público.\n§ 8º As áreas já usucapidas referidas no inciso VI do caput constarão do projeto de regularização fundiária com a área constante na matrícula ou na transcrição e com a observação de se tratar de unidade imobiliária já registrada e oriunda de processo de usucapião e a nova descrição técnica georreferenciada da unidade imobiliária deverá ser averbada na matrícula existente.",
        "docACorrigir": "Responsabilidade técnica",
        "category": "Responsabilidade técnica"
      },
      {
        "id": "REURB-05",
        "originalLabel": "ITEM 05",
        "text": "Planta e memorial descritivo do perímetro do núcleo devidamente georreferenciada",
        "help": "Deverá indicar as construções existentes nos lotes (não precisa detalhar área, basta indicar se existem), o sistema viário do núcleo, as áreas públicas (se existir), acidentes geográficos (rios, lagos, etc.) e demais elementos que caracterizam o núcleo.\nDeverá constar todos os confrontantes e a indicação da sua matrícula ou título aquisitivo assim como um projeto de retificação de área (Art. 913 do Novo Código de Normas).",
        "docACorrigir": "Memorial descritivo",
        "category": "Memorial descritivo"
      },
      {
        "id": "REURB-06",
        "originalLabel": "ITEM 06",
        "text": "Planta e memorial descritivo dos lotes, áreas públicas (verdes, institucionais) e das ruas devidamente georreferenciadas?",
        "help": "Deverá constar todos os confrontantes e a indicação da sua matrícula ou título aquisitivo assim como um projeto de retificação de área (Art. 913 do Novo Código de Normas).",
        "docACorrigir": "Memorial descritivo",
        "category": "Memorial descritivo"
      },
      {
        "id": "REURB-07",
        "originalLabel": "ITEM 07",
        "text": "Será realizado o parcelamento do solo e titulação de apenas alguns lotes?",
        "help": "Art. 906 do Novo Código: O registro da regularização poderá ser feito em etapas, devendo a certidão de regularização fundiária (CRF) conter a descrição do núcleo urbano e da localização dos imóveis em regularização, independentemente do rito adotado e da modalidade eleita.\n§ 1º Para a regularização parcial, é imprescindível a apresentação de título contendo a apresentação da descrição do núcleo urbano informal consolidado, salvo quando se tratar de regularização meramente titulatória.\n§ 2º O oficial poderá efetuar o parcelamento do solo apenas das áreas individualizadas naquele momento, dispensada a delimitação das demais, desde que descritas as áreas públicas e o remanescente do perímetro do núcleo.\nNesses casos, não esquecer de fazer planta e memorial da descrição das áreas remanescentes",
        "docACorrigir": "Responsabilidade técnica",
        "category": "Responsabilidade técnica"
      },
      {
        "id": "REURB-08",
        "originalLabel": "ITEM 08",
        "text": "Planta de sobreposição legível, onde demonstra a(s) matrícula(s) atingidas pela regularização e o perímetro do núcleo",
        "help": "",
        "docACorrigir": "Planta",
        "category": "Planta"
      },
      {
        "id": "REURB-09",
        "originalLabel": "ITEM 09",
        "text": "Anotação de Responsabilidade Técnica (A.R.T) ou Registro de Responsabilidade Técnica (R.R.T) e o respectivo comprovante de pagamento",
        "help": "",
        "docACorrigir": "Responsabilidade técnica",
        "category": "Responsabilidade técnica"
      },
      {
        "id": "REURB-10",
        "originalLabel": "ITEM 10",
        "text": "Existe construção nos lotes? Deve ser apresentado os seguintes requisitos para o cartório realizar a averbação (Art. 931, IV do Novo Código e Art. 31, III do Decreto 9.310/18)?",
        "help": "Área em metros quadrados da construção\nTipo da construção: alvenaria, madeira ou mista\nNúmero da unidade da construção\nValor da construção (se não foi apresentado, calcular pelo CUB)\nArt. 940. As edificações já existentes nos lotes poderão ser regularizadas, a critério do Poder Público Municipal, em momento posterior, de forma coletiva ou individual.\nArt. 941. Não havendo informações sobre a regularização das edificações na certidão de regularização fundiária (CRF), o oficial aceitará requerimento do interessado e averbará as edificações mediante manifestação do Município, com a indicação da área construída e o número da unidade imobiliária.\nParágrafo único. Independentemente da modalidade (REURB-S ou REURB-E), o oficial dispensará a apresentação de habite-se e de certidões negativas de tributos e de contribuições previdenciárias.",
        "docACorrigir": "Responsabilidade técnica",
        "category": "Responsabilidade técnica"
      },
      {
        "id": "REURB-11",
        "originalLabel": "ITEM 11",
        "text": "Certidão de Regularização Fundiária (CRF) com todos os requisitos abaixo estabelecidos (Art. 41 da Lei 13.467/17, Art. 909 e 921 do Novo Código de Normas Extrajudicial da Corregedoria Geral de Justiça de Santa Catarina)",
        "help": "I -- o nome do núcleo urbano regularizado, e declaração de que está consolidado e é de difícil ou impossível reversão;\nII -- a sua localização;\nIII -- a modalidade da regularização (social ou específica);\nIV -- forma e organização da REURB;\nV -- matrículas atingidas pela regularização;\nVI -- eventuais áreas já usucapidas ou regulares, se houver;\nVII -- informação de ter havido notificação dos proprietários tabulares, confrontantes externos e internos, e eventuais terceiros interessados;\nVIII -- existência ou não de impugnação;\nIX -- informações sobre a publicação de edital;\nX -- existência de APPs, unidades de conservação e áreas de risco;\nXI -- listagem de ocupantes, com seus respectivos dados: filiação, estado civil, profissão, e número de inscrição no cadastro das pessoas físicas do Ministério da Fazenda;\nXII -- mecanismo de titulação;\nXIII -- as responsabilidades das obras e serviços e respectivo cronograma ou a certificação de conformidade da infraestrutura básica do núcleo urbano informal, quando houver;\nXIV -- a indicação numérica de cada unidade regularizada, quando houver;\nXV -- a indicação do projeto de regularização fundiária e do projeto urbanístico;\nXVI -- a declaração de aprovação do ente municipal da regularização fundiária com a indicação se contempla, ou não, a regularidade ambiental; e\nXVII -- a planta e o memorial descritivo, indicando a área atingida, imóveis individualizados e respectiva matrícula ou transcrição, se for possível identificá-las, e planta de sobreposição, se a área divergir da até então registrada.\nArt. 921. A certidão de regularização fundiária (CRF) indicará a modalidade de organização do núcleo como:\nI -- parcelamento do solo;\nII -- condomínio edilício;\nIII -- condomínio de lotes; ou\nIV -- conjunto habitacional.\n§ 1º Deverá indicar também a existência de lajes ou condomínios urbanos simples.",
        "docACorrigir": "Responsabilidade técnica",
        "category": "Responsabilidade técnica"
      }
    ]
  },
  {
    "key": "retificacao",
    "name": "Retificação de área",
    "description": "Procedimento administrativo consensual perante o Registro de Imóveis para inserção ou correção de medidas perimetrais (Lei 6.015/73 art. 213, II).",
    "items": [
      {
        "id": "RETIFICACAO-01",
        "originalLabel": "ITEM 01",
        "text": "Existe algum TÍTULO VINCULADO (compra e venda, partilha, etc.)?",
        "help": "Caso tenha, verificar se já foi protocolado, suas eventuais exigências e a ordem cronológica de registro.",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      },
      {
        "id": "RETIFICACAO-02",
        "originalLabel": "ITEM 02",
        "text": "Foi elaborado o requerimento subscrito pelo interessado e profissional habilitado?",
        "help": "Constar a qualificação completa, bem como as declarações:\nintra-muros;\nde que não optaram pelo procedimento judicial\ne declarando estar ciente do teor do art. 213, inciso II, § 14, da Lei nº 10.931/04 (alteração da lei nº 6.015/73);\ne declaração da responsável técnica de que a medição respeitou plenamente as divisas com as áreas e faixas de domínio de imóveis públicos.",
        "docACorrigir": "Contratos, procurações e anuências",
        "category": "Contratos, procurações e anuências"
      },
      {
        "id": "RETIFICACAO-03",
        "originalLabel": "ITEM 03",
        "text": "Em caso de proprietário falecido:",
        "help": "Caso já houve partilha (ou seja, já fizeram Escritura Pública de Inventário) quem vai requerer são os herdeiros que receberam o imóvel;\nCaso já iniciou o processo judicialmente, mas não finalizaram ainda, quem vai requerer será o(a) viúvo(a) vivo(a) e espólio representado pelo inventariante, através do termo de nomeação de inventariante;\nQuando não houve partilha OU o inventariante assina, mediante uma Escritura Pública de nomeação de inventariante OU todos os herdeiros assinam terão que assinar;",
        "docACorrigir": "Contratos, procurações e anuências",
        "category": "Contratos, procurações e anuências"
      },
      {
        "id": "RETIFICACAO-04",
        "originalLabel": "ITEM 04",
        "text": "Caso algum proprietário seja representado por procurador, deverá apresentar a procuração por traslado, certidão ou cópia autenticada, ou instrumento particular com firma reconhecida, em original ou cópia autenticada.",
        "help": "",
        "docACorrigir": "Contratos, procurações e anuências",
        "category": "Contratos, procurações e anuências"
      },
      {
        "id": "RETIFICACAO-05",
        "originalLabel": "ITEM 05",
        "text": "Cópia autenticada ou original da certidão de nascimento/casamento (conforme o caso), bem como a cópia autenticada do RG e CPF dos proprietários.",
        "help": "Obs.: Caso sejam casados pelo regime da Comunhão Universal de Bens, deve apresentar a Certidão de Registro de Pacto Antenupcial;",
        "docACorrigir": "Documentos pessoais",
        "category": "Documentos pessoais"
      },
      {
        "id": "RETIFICACAO-06",
        "originalLabel": "ITEM 06",
        "text": "Se for pessoa jurídica, solicitar a Certidão Simplificada atualizada da Junta Comercial (90 dias).",
        "help": "",
        "docACorrigir": "Documentos pessoais",
        "category": "Documentos pessoais"
      },
      {
        "id": "RETIFICACAO-07",
        "originalLabel": "ITEM 07",
        "text": "Memorial descritivo conforme a ABNT NBR 17047/2022, devidamente assinado pelo responsável técnico, proprietário e confrontantes, com firma reconhecida? Deverá constar:",
        "help": "Cabeçalho contendo nome completo e CPF do proprietário, endereço completo;\nCódigo da parcela (se existir), número da matrícula e CNS (circunscrição);\nSistema de referência e projeção cartográfica utilizada no cálculo das distâncias e da área.\nÁrea e perímetro do imóvel;\nTabela com dados técnicos contendo o código do vértice e suas respectivas coordenadas geodésicas, as matrículas dos imóveis confrontantes (a descrição tabular da parcela deve iniciar no primeiro vértice de confrontação com o sistema viário ou acesso a este e seguir no sentido horário).\nAssinatura do responsável técnico, formação profissional, número no registro no conselho de classe e número da ART, TRT OU RRT;\nCroqui do polígono da parcela do imóvel indicando a posição do sistema viário;\nDescrição textual.\nCampo de assinatura para os proprietários e confrontantes, indicando o CPF/CNPJ.",
        "docACorrigir": "Memorial descritivo",
        "category": "Memorial descritivo"
      },
      {
        "id": "RETIFICACAO-08",
        "originalLabel": "ITEM 08",
        "text": "No memorial descritivo, quando se tratar de imóvel urbano, deve constar as informações:",
        "help": "logradouro, número e bairro ou localidade; ainda, caso o imóvel não esteja georreferenciado, tratando-se só de terreno, se esse fica do lado par ou do lado ímpar do logradouro, em que quadra e a que distância métrica da edificação ou da esquina mais próxima;\nse lote, além dos requisitos da alínea \"b\", o número do lote, da quadra e o nome do loteamento;",
        "docACorrigir": "Memorial descritivo",
        "category": "Memorial descritivo"
      },
      {
        "id": "RETIFICACAO-09",
        "originalLabel": "ITEM 09",
        "text": "Relatório técnico, contendo:",
        "help": "Objeto, finalidade, período de execução, localização;\nsistema geodésico de referência do sistema de coordenadas plano-retangulares, com seu nível de referência altimétrico;\nmemorial descritivo dos serviços executados, contendo, no mínimo, precisões obtidas, quantidades executadas, relação dos instrumentos utilizados, equipe técnica e identificação do responsável técnico e documentos produzidos, incluindo as monografias, e memórias de cálculo, destacando-se: planilhas de cálculo das poligonais e planilhas das linhas de nivelamento.",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      },
      {
        "id": "RETIFICACAO-10",
        "originalLabel": "ITEM 10",
        "text": "Plantas, assinadas pelo responsável técnico, pelo proprietário requerente e pelos confrontantes, com as firmas reconhecidas ou assinados eletronicamente?",
        "help": "Na planta apresentada deverá conter:\nVértices do imóvel com seus respectivos códigos;\nPolígono fechado do imóvel, formado pela união dos vértices;\nDistâncias lineares entre os vértices na projeção cartográfica utilizada;\nFeições topográficas que auxiliem na interpretação e caracterização do limite da parcela ou do imóvel;\nNúmero das matrículas dos imóveis confrontantes ou indicação que se trata de área de posse;\nTabela de coordenadas dos vértices e quadro de áreas;\nInformação sobre o Datum e a projeção cartográfica utilizada e fator de escala;\nConvenções, escala gráfica e direção norte da projeção cartográfica utilizada;\nNome completo do proprietário, endereço completo do imóvel, nome completo e número do registro profissional no conselho de classe do responsável técnico e número da ART, TRT ou RRT;\nInformação de área e perímetro na projeção cartográfica utilizada;\nData do levantamento e da conclusão da planta topográfica.\nDescrição (desenho) atual do imóvel, contendo a área do imóvel;\nDeverá constar os campos de assinatura indicando a qualidade (proprietário, possuidor, requerente e CPF), e a indicação do número da matrícula ou de que o imóvel não possui.",
        "docACorrigir": "Planta",
        "category": "Planta"
      },
      {
        "id": "RETIFICACAO-11",
        "originalLabel": "ITEM 11",
        "text": "Foram emitidas as matrículas dos confrontantes e confirmados que os confrontantes indicados são proprietários destes imóveis?",
        "help": "",
        "docACorrigir": "Matrículas dos confrontantes",
        "category": "Matrículas dos confrontantes"
      },
      {
        "id": "RETIFICACAO-12",
        "originalLabel": "ITEM 12",
        "text": "Algum confrontante não vai dar anuência?",
        "help": "Fazer requerimento para notificação, com três vias da planta e memorial descritivo.",
        "docACorrigir": "Memorial descritivo",
        "category": "Memorial descritivo"
      },
      {
        "id": "RETIFICACAO-13",
        "originalLabel": "ITEM 13",
        "text": "Quando o confrontante for falecido, será representado pelo inventariante, mediante a comprovação do múnus;",
        "help": "Caso não haja inventário em andamento, qualquer dos sucessores será legitimado a dar anuência, comprovando-se sua condição com a certidão de óbito e prova de ser sucessor; se houver inventário concluído e não registrado, qualquer daqueles que houver recebido o imóvel poderá manifestar a anuência. Art. 988, VII do CN. -- Art. 824 do CN.",
        "docACorrigir": "Matrículas dos confrontantes",
        "category": "Matrículas dos confrontantes"
      },
      {
        "id": "RETIFICACAO-14",
        "originalLabel": "ITEM 14",
        "text": "Se tratando o imóvel confrontante de um condomínio geral, poderá ser representado por qualquer um dos condôminos.",
        "help": "Se tratando de condomínio edilício, será representado pelo síndico ou comissão de representantes; nos casos de casas ou simples que não tenham síndico eleito, poderá ser colhida anuência do(s) proprietário(s) das casas cujos limites toquem o imóvel retificando..",
        "docACorrigir": "Matrículas dos confrontantes",
        "category": "Matrículas dos confrontantes"
      },
      {
        "id": "RETIFICACAO-15",
        "originalLabel": "ITEM 15",
        "text": "Não se serão considerados confrontantes:",
        "help": "a) os titulares de direitos reais de garantia hipotecária ou pignoratícia;\nb) os titulares de crédito vincendo, cuja propriedade imobiliária esteja vinculada, temporariamente, à operação de crédito financeiro; ou\nc) outros titulares de direitos de uso, gozo ou fruição.",
        "docACorrigir": "Matrículas dos confrontantes",
        "category": "Matrículas dos confrontantes"
      },
      {
        "id": "RETIFICACAO-16",
        "originalLabel": "ITEM 16",
        "text": "Se a matrícula do imóvel tiver algum ônus ou titulares de outros direitos reais (hipoteca, alienação, servidão, usufruto, o direito do promitente comprador, penhor, anticrese), foi dada a anuência para a retificação?",
        "help": "Caso negativo, este deverá ser notificado para se manifestar em quinze dias, presumindo-se no caso de silêncio, sua manifestação tácita. Art. 983 do CN.",
        "docACorrigir": "Matrícula principal",
        "category": "Matrícula principal"
      },
      {
        "id": "RETIFICACAO-17",
        "originalLabel": "ITEM 17",
        "text": "O imóvel foi dividido em duas ou mais glebas em razão de Rua ou Rodovia que \"corta\" o imóvel?",
        "help": "Em caso ser seccionado, por via pública instalada anteriormente pelo poder público: deverá apresentar certidão do município que ateste que a rua que corta o imóvel é preexistente ao pedido de retificação, aceita e reconhecida como oficial e está incorporada ao domínio público como uso comum do povo.\nDeverá ficar em condomínio em todas as glebas, proporcionalmente ao que possuem na matrícula OU apresentar juntamente com a retificação a Escritura Pública de Divisão e Extinção de Condomínio, que será analisada separadamente.",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      },
      {
        "id": "RETIFICACAO-18",
        "originalLabel": "ITEM 18",
        "text": "Se o imóvel objeto da retificação fazer divisa com vias públicas, estradas, ruas, travessas e rios navegáveis, deverá ser feita a declaração do responsável técnico de que a medição respeitou plenamente as divisas com as áreas e faixas de domínio de imóveis públicos, conforme art. 974, §9º do CN.",
        "help": "",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      },
      {
        "id": "RETIFICACAO-19",
        "originalLabel": "ITEM 19",
        "text": "Se trata de um imóvel em condomínio? Caso positivo, foi indicado no projeto a área ideal de cada proprietário após a retificação de área?",
        "help": "Deverá ser proporcional ao que cada proprietário possui na matrícula.",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      },
      {
        "id": "RETIFICACAO-20",
        "originalLabel": "ITEM 20",
        "text": "Se tratando de imóvel rural, foram apresentados os documentos?",
        "help": "□ Cadastro Ambiental Rural -- CAR (os dados não precisam coincidir com a matrícula -- art. 806 do CN);\n□ Certificado de Cadastro do Imóvel Rural -- CCIR 2023; Art. 974, V, \"a\", do CN.\n□ Certidão Negativa de Débitos do ITR (dentro do prazo de validade). Art. 974, V, \"a\", do CN.",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      },
      {
        "id": "RETIFICACAO-21",
        "originalLabel": "ITEM 21",
        "text": "Se o imóvel possuir mais de 25 hectares (250.000.00m²), foi feita a certificação do INCRA? (Art. 10, decreto 4.449/2002). -- Até 20/11/2025.",
        "help": "",
        "docACorrigir": "Responsabilidade técnica",
        "category": "Responsabilidade técnica"
      },
      {
        "id": "RETIFICACAO-22",
        "originalLabel": "ITEM 22",
        "text": "Se tratando de imóvel urbano, foram apresentados os seguintes documentos:",
        "help": "Certidão de confrontação -- art. 974, VI do CN.\nInscrição imobiliária -- art. 974, VI do CN.",
        "docACorrigir": "Responsabilidade técnica",
        "category": "Responsabilidade técnica"
      },
      {
        "id": "RETIFICACAO-23",
        "originalLabel": "ITEM 23",
        "text": "Foram emitidas as certidões das matrículas dos imóveis confrontantes quando registradas em outra comarca?",
        "help": "",
        "docACorrigir": "Matrículas dos confrontantes",
        "category": "Matrículas dos confrontantes"
      },
      {
        "id": "RETIFICACAO-24",
        "originalLabel": "ITEM 24",
        "text": "Se algum confrontante foi indicado como área de posse, foram apresentados documentos comprobatórios?",
        "help": "São possibilitados todos os meios de prova admitidos em direito.",
        "docACorrigir": "Matrículas dos confrontantes",
        "category": "Matrículas dos confrontantes"
      },
      {
        "id": "RETIFICACAO-25",
        "originalLabel": "ITEM 25",
        "text": "Anotação de Responsabilidade Técnica -- ART e comprovante de pagamento",
        "help": "",
        "docACorrigir": "Responsabilidade técnica",
        "category": "Responsabilidade técnica"
      },
      {
        "id": "RETIFICACAO-26",
        "originalLabel": "ITEM 26",
        "text": "Na matrícula do imóvel foi feito algum registro de REURB?",
        "help": "Caso positivo, deverá ser solicitada a anuência da prefeitura municipal.",
        "docACorrigir": "Matrícula principal",
        "category": "Matrícula principal"
      },
      {
        "id": "RETIFICACAO-27",
        "originalLabel": "ITEM 27",
        "text": "Foi feita a conferência do memoria descritivo e planta?",
        "help": "",
        "docACorrigir": "Planta",
        "category": "Planta"
      },
      {
        "id": "RETIFICACAO-28",
        "originalLabel": "ITEM 28",
        "text": "Após protocolar a retificação no registro de imóveis, fazer o cadastro e emitir o o memorial descritivo pelo Sistema de Informação Geográfica (SIG-RI) do Registro de Imóveis do Brasil.",
        "help": "",
        "docACorrigir": "Memorial descritivo",
        "category": "Memorial descritivo"
      }
    ]
  },
  {
    "key": "unificacao",
    "name": "Unificação",
    "description": "Fusão de dois ou mais imóveis contíguos de mesma titularidade para formação de nova matrícula unificada.",
    "items": [
      {
        "id": "UNIFICACAO-01",
        "originalLabel": "ITEM 01",
        "text": "Os imóveis objeto da unificação são dos mesmos proprietários?",
        "help": "",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      },
      {
        "id": "UNIFICACAO-02",
        "originalLabel": "ITEM 02",
        "text": "Foi elaborado o requerimento subscrito por todos os proprietários?",
        "help": "",
        "docACorrigir": "Contratos, procurações e anuências",
        "category": "Contratos, procurações e anuências"
      },
      {
        "id": "UNIFICACAO-03",
        "originalLabel": "ITEM 03",
        "text": "Caso algum proprietário seja representado por procurador, deverá apresentar a procuração por traslado, certidão ou cópia autenticada, ou instrumento particular com firma reconhecida, em original ou cópia autenticada.",
        "help": "",
        "docACorrigir": "Contratos, procurações e anuências",
        "category": "Contratos, procurações e anuências"
      },
      {
        "id": "UNIFICACAO-04",
        "originalLabel": "ITEM 04",
        "text": "Cópia autenticada ou original da certidão de nascimento/casamento (conforme o caso), bem como a cópia autenticada do RG e CPF dos proprietários.",
        "help": "Obs.: Caso sejam casados pelo regime da Comunhão Universal de Bens ou Regime da Separação Total de Bens, deve apresentar a Certidão de Registro de Pacto Antenupcial;",
        "docACorrigir": "Documentos pessoais",
        "category": "Documentos pessoais"
      },
      {
        "id": "UNIFICACAO-05",
        "originalLabel": "ITEM 05",
        "text": "Se for pessoa jurídica, solicitar a Certidão Simplificada atualizada da Junta Comercial (90 dias).",
        "help": "",
        "docACorrigir": "Documentos pessoais",
        "category": "Documentos pessoais"
      },
      {
        "id": "UNIFICACAO-06",
        "originalLabel": "ITEM 06",
        "text": "Foi verificado se as matrículas objeto da unificação estão com a descrição atualizada?",
        "help": "Caso o imóvel não tenha informação de quarteirão, distância da esquina mais próxima, lado par ou ímpar, deve ser apresentado junto com a unificação certidão municipal para fazer averbação\nCaso as ruas do quarteirão ou os confrontantes da matrícula estejam desatualizadas (nome anterior ou proprietário anterior), deve ser apresentado junto com a unificação certidão municipal para atualização\nSe a matrícula tiver coordenadas, a descrição da área unificada deve ser também com coordenadas\nSe a área não tiver coordenadas, a descrição unificada tem que ser também sem coordenadas, apenas com as medidas\nSe não tiver medidas, tem que primeiro fazer retificação de área",
        "docACorrigir": "Matrícula principal",
        "category": "Matrícula principal"
      },
      {
        "id": "UNIFICACAO-07",
        "originalLabel": "ITEM 07",
        "text": "Memorial descritivo conforme a ABNT NBR 17047/2022, devidamente assinado pelo responsável técnico e proprietário com firma reconhecida da situação de cada matrícula e da área unificada? Deverá constar:",
        "help": "Cabeçalho contendo nome completo e CPF do proprietário, endereço completo;\nCódigo da parcela (se existir), número da matrícula e CNS (circunscrição);\nSistema de referência e projeção cartográfica utilizada no cálculo das distâncias e da área.\nÁrea e perímetro de área unificada;\nTabela com dados técnicos contendo o código do vértice e suas respectivas coordenadas geodésicas, as matrículas dos imóveis confrontantes (a descrição tabular da parcela deve iniciar no primeiro vértice de confrontação com o sistema viário ou acesso a este e seguir no sentido horário).\nAssinatura do responsável técnico, formação profissional, número no registro no conselho de classe e número da ART, TRT OU RRT;\nCroqui do polígono da parcela do imóvel indicando a posição do sistema viário;\nDescrição textual.\nCampo de assinatura para os proprietários, indicando o CPF/CNPJ.",
        "docACorrigir": "Memorial descritivo",
        "category": "Memorial descritivo"
      },
      {
        "id": "UNIFICACAO-08",
        "originalLabel": "ITEM 08",
        "text": "No memorial descritivo, a descrição da área unificada, deve constar as informações:",
        "help": "logradouro, número e bairro ou localidade; ainda, caso o imóvel não esteja georreferenciado, tratando-se só de terreno, se esse fica do lado par ou do lado ímpar do logradouro, em que quadra e a que distância métrica da edificação ou da esquina mais próxima;\nse lote, além dos requisitos da alínea \"b\", o número do lote, da quadra",
        "docACorrigir": "Memorial descritivo",
        "category": "Memorial descritivo"
      },
      {
        "id": "UNIFICACAO-09",
        "originalLabel": "ITEM 09",
        "text": "Relatório técnico, contendo:",
        "help": "Objeto, finalidade, período de execução, localização;\nsistema geodésico de referência do sistema de coordenadas plano-retangulares, com seu nível de referência altimétrico;\nmemorial descritivo dos serviços executados, contendo, no mínimo, precisões obtidas, quantidades executadas, relação dos instrumentos utilizados, equipe técnica e identificação do responsável técnico e documentos produzidos, incluindo as monografias, e memórias de cálculo, destacando-se: planilhas de cálculo das poligonais e planilhas das linhas de nivelamento.",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      },
      {
        "id": "UNIFICACAO-10",
        "originalLabel": "ITEM 10",
        "text": "Plantas, assinadas pelo responsável técnico, e pelos proprietários com as firmas reconhecidas ou assinados eletronicamente demonstrado a área conforme matrícula e unificada?",
        "help": "Na planta apresentada deverá conter:\nVértices do imóvel com seus respectivos códigos;\nPolígono fechado de cada lote, formado pela união dos vértices;\nDistâncias lineares entre os vértices na projeção cartográfica utilizada;\nFeições topográficas que auxiliem na interpretação e caracterização do limite da parcela ou do imóvel;\nNúmero das matrículas dos imóveis confrontantes ou indicação que se trata de área de posse;\nTabela de coordenadas dos vértices e quadro de áreas de das matrículas e área unificada;\nInformação sobre o Datum e a projeção cartográfica utilizada e fator de escala;\nConvenções, escala gráfica e direção norte da projeção cartográfica utilizada;\nNome completo do proprietário, endereço completo do imóvel, nome completo e número do registro profissional no conselho de classe do responsável técnico e número da ART, TRT ou RRT;\nInformação de área e perímetro na projeção cartográfica utilizada;\nData do levantamento e da conclusão da planta topográfica.\nDescrição (desenho) da área conforme matrícula e da área unificada do imóvel, contendo a área;\nDeverá constar os campos de assinatura indicando a qualidade (proprietários), e a indicação do número da matrícula ou de que o imóvel não possui.",
        "docACorrigir": "Planta",
        "category": "Planta"
      },
      {
        "id": "UNIFICACAO-11",
        "originalLabel": "ITEM 11",
        "text": "A matrícula possui algum ônus? Verificar a necessidade de anuência. Os ônus serão transportados.",
        "help": "",
        "docACorrigir": "Matrícula principal",
        "category": "Matrícula principal"
      },
      {
        "id": "UNIFICACAO-12",
        "originalLabel": "ITEM 12",
        "text": "Foi apresentado aprovação municipal?",
        "help": "",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      },
      {
        "id": "UNIFICACAO-13",
        "originalLabel": "ITEM 13",
        "text": "Anotação de Responsabilidade Técnica -- ART e comprovante de pagamento",
        "help": "",
        "docACorrigir": "Responsabilidade técnica",
        "category": "Responsabilidade técnica"
      },
      {
        "id": "UNIFICACAO-14",
        "originalLabel": "ITEM 14",
        "text": "Foi feita a conferência do memoria descritivo e planta?",
        "help": "",
        "docACorrigir": "Planta",
        "category": "Planta"
      },
      {
        "id": "UNIFICACAO-15",
        "originalLabel": "ITEM 15",
        "text": "Juntar todos os documentos e enviar para o Registro de Imóveis",
        "help": "",
        "docACorrigir": "Outros documentos",
        "category": "Outros documentos"
      }
    ]
  }
];
