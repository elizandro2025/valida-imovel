import React, { useState } from 'react';
import {
  ProjectData,
  computeAutomaticOpinion,
  consolidateIssues,
  generateReportMarkdown,
  exportToWord,
} from '../../services/projectConferenceService';
import {
  Download,
  Copy,
  Printer,
  Check,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ParecerRelatorioTabProps {
  data: ProjectData;
  onUpdate: (updater: (prev: ProjectData) => ProjectData) => void;
}

export const ParecerRelatorioTab: React.FC<ParecerRelatorioTabProps> = ({
  data,
  onUpdate,
}) => {
  const [copied, setCopied] = useState(false);
  const [hasGeneratedReport, setHasGeneratedReport] = useState(false);
  const [activeView, setActiveView] = useState<'preview' | 'markdown'>('preview');

  const { opinion, divCount, pendCount } = computeAutomaticOpinion(data);
  const allIssues = consolidateIssues(data);
  const reportMarkdown = generateReportMarkdown(data);

  const currentOpinion = data.parecer?.final || opinion;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = () => {
    exportToWord(data);
  };

  const updateParecerField = (field: keyof ProjectData['parecer'], val: any) => {
    onUpdate(prev => ({
      ...prev,
      parecer: {
        ...prev.parecer,
        [field]: val,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Conclusão Pericial Card */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Resultado da Análise & Laudo Conclusivo
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Avaliação técnica de viabilidade para o cartório de imóveis, conforme a Lei 6.015/73 e normas da Corregedoria.
          </p>
        </div>

        {/* Big Opinion Box */}
        <div className="space-y-2">
          <div
            className={`inline-block px-4 py-2 rounded-xl font-bold text-xs sm:text-sm tracking-wide border ${
              currentOpinion === 'DOCUMENTAÇÃO COMPATÍVEL'
                ? 'bg-success/10 text-success border-success/30'
                : currentOpinion === 'DOCUMENTAÇÃO COM DIVERGÊNCIAS'
                ? 'bg-destructive/10 text-destructive border-destructive/30'
                : 'bg-warning/10 text-warning border-warning/30'
            }`}
          >
            {currentOpinion}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {divCount > 0
              ? `Constatadas ${divCount} divergência(s) impeditiva(s) e ${pendCount} pendência(s) documentais. O saneamento prévio é recomendado antes de dar entrada no cartório.`
              : pendCount > 0
              ? `Constatadas ${pendCount} pendência(s) de apresentação documental. Parecer condicionado à apresentação dos documentos pendentes.`
              : `Documentação técnica, medidas e confrontantes plenamente compatíveis e prontos para o cartório.`}
          </p>
        </div>

        {/* Parecer final select */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-xs font-semibold text-foreground">
            Parecer final
          </label>
          <select
            value={currentOpinion}
            onChange={e => updateParecerField('final', e.target.value)}
            className="w-full max-w-xl px-3.5 py-2 rounded-xl border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
          >
            <option value="DOCUMENTAÇÃO COMPATÍVEL">DOCUMENTAÇÃO COMPATÍVEL</option>
            <option value="DOCUMENTAÇÃO COM DIVERGÊNCIAS">DOCUMENTAÇÃO COM DIVERGÊNCIAS</option>
            <option value="DOCUMENTAÇÃO INCOMPLETA PARA CONFERÊNCIA">DOCUMENTAÇÃO INCOMPLETA PARA CONFERÊNCIA</option>
          </select>
        </div>

        {/* Checkboxes de Validação */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!!data.parecer?.validacaoRT}
              onChange={e => updateParecerField('validacaoRT', e.target.checked)}
              className="rounded text-primary focus:ring-primary h-4 w-4"
            />
            <span className="text-foreground">Necessária validação do responsável técnico</span>
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!!data.parecer?.validacaoJuridica}
              onChange={e => updateParecerField('validacaoJuridica', e.target.checked)}
              className="rounded text-primary focus:ring-primary h-4 w-4"
            />
            <span className="text-foreground">Necessária validação jurídica</span>
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!!data.parecer?.exigenciaCartorio}
              onChange={e => updateParecerField('exigenciaCartorio', e.target.checked)}
              className="rounded text-primary focus:ring-primary h-4 w-4"
            />
            <span className="text-foreground">Há possibilidade de exigência cartorária</span>
          </label>
        </div>

        {/* Resumo do parecer */}
        <div className="space-y-1.5 pt-2">
          <label className="block text-xs font-semibold text-foreground">
            Síntese do Resultado
          </label>
          <textarea
            rows={3}
            value={data.parecer?.resumo || ''}
            onChange={e => updateParecerField('resumo', e.target.value)}
            placeholder="Ex: O levantamento topográfico e as medidas conferem com a planta. A documentação apresenta pendência de assinatura na divisa leste e certidão atualizada a ser providenciada..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary leading-relaxed"
          />
        </div>

        {/* Verificações que dependem de... */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-foreground">
            Diligências e Providências
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Conferência Espacial (SIGEF / GeoSampa)
              </label>
              <textarea
                rows={2}
                value={data.parecer?.depSoftware || ''}
                onChange={e => updateParecerField('depSoftware', e.target.value)}
                placeholder="Ex: Conferir se não há sobreposição de polígonos no sistema..."
                className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Orientação Jurídica / Notarial
              </label>
              <textarea
                rows={2}
                value={data.parecer?.depJuridica || ''}
                onChange={e => updateParecerField('depJuridica', e.target.value)}
                placeholder="Ex: Notificação de vizinho nos termos do art. 213 da Lei 6.015/73..."
                className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Certidões Complementares
              </label>
              <textarea
                rows={2}
                value={data.parecer?.depDocumento || ''}
                onChange={e => updateParecerField('depDocumento', e.target.value)}
                placeholder="Ex: Certidão de inteiro teor atualizada (últimos 30 dias)..."
                className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-border">
          <Button
            type="button"
            onClick={() => setHasGeneratedReport(true)}
            className="font-semibold gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Gerar Laudo Completo
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-primary" />
            Imprimir / Salvar PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadWord}
            className="gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            Baixar Word (.docx)
          </Button>
        </div>
      </div>

      {/* Output Card */}
      {!hasGeneratedReport ? (
        <div className="bg-card border border-border rounded-2xl p-6 text-xs text-muted-foreground shadow-soft text-center">
          Clique no botão <strong className="text-foreground">"Gerar Laudo Completo"</strong> acima para visualizar e exportar o relatório técnico fundamentado.
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
          <div className="border-b border-border px-6 py-4 flex items-center justify-between flex-wrap gap-3 bg-secondary/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">
                Visualização do Laudo de Conferência
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}

                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-input text-xs font-medium hover:bg-muted"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar Relatório'}
              </button>
              <div className="flex items-center gap-1 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg text-xs">
                <button
                  onClick={() => setActiveView('preview')}
                  className={`px-3 py-1 rounded-md font-medium transition ${
                    activeView === 'preview'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  Prévia Formatada
                </button>
                <button
                  onClick={() => setActiveView('markdown')}
                  className={`px-3 py-1 rounded-md font-medium transition ${
                    activeView === 'markdown'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  Markdown Puro
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {activeView === 'markdown' ? (
              <textarea
                readOnly
                rows={24}
                value={reportMarkdown}
                className="w-full font-mono text-xs p-4 rounded-lg bg-gray-900 text-emerald-400 border border-gray-800 focus:outline-none selection:bg-emerald-800 selection:text-white"
              />
            ) : (
              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm font-sans space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300">
                  <span className="font-bold">Dica profissional:</span> O relatório abaixo é
                  estruturado nos exatos padrões aceitos pelos Oficiais de Registro de Imóveis e
                  atende rigorosamente às disposições da Lei 6.015/73, Lei 10.267/01 e Normas das
                  Corregedorias-Gerais de Justiça estaduais. Você pode exportar para Word (.doc) ou
                  imprimir diretamente.
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-900/50 shadow-inner font-serif">
                  <div className="text-center pb-6 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-lg font-bold uppercase tracking-wide text-gray-900 dark:text-white">
                      LAUDO TÉCNICO DE CONFERÊNCIA DOCUMENTAL & REGISTRAL
                    </h1>
                    <p className="text-xs text-gray-500 uppercase mt-1">
                      Conformidade Cartorária • Topografia • Georreferenciamento
                    </p>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mt-2">
                      {data.info.nome || 'Projeto sem Título'} — {data.info.municipio || 'Município'}/
                      {data.info.uf || 'UF'}
                    </p>
                  </div>

                  <div className="mt-6 space-y-4 text-xs font-sans text-gray-800 dark:text-gray-200 leading-relaxed">
                    <div>
                      <span className="font-bold uppercase text-gray-900 dark:text-white block mb-1">
                        1. Identificação Geral
                      </span>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>
                          <strong>Responsável Técnico:</strong> {data.info.rt || 'Não informado'} (
                          {data.info.prof || 'CREA/CFT'} {data.info.reg || 'S/N'})
                        </li>
                        <li>
                          <strong>A.R.T. / T.R.T.:</strong> {data.info.art || 'Não informada'}
                        </li>
                        <li>
                          <strong>Procedimento:</strong>{' '}
                          {data.info.procedimentos.length > 0
                            ? data.info.procedimentos.join(', ')
                            : 'Não especificado'}
                        </li>
                        <li>
                          <strong>Modo:</strong>{' '}
                          {data.info.modoMax
                            ? 'Conferência Máxima Rigorosa (Normas CGJ)'
                            : 'Padrão'}
                        </li>
                      </ul>
                    </div>

                    <div>
                      <span className="font-bold uppercase text-gray-900 dark:text-white block mb-1">
                        2. Parecer Registral Conclusivo
                      </span>
                      <div
                        className={`p-3 rounded-lg font-bold ${
                          currentOpinion === 'DOCUMENTAÇÃO COMPATÍVEL'
                            ? 'bg-emerald-100 text-emerald-800'
                            : currentOpinion === 'DOCUMENTAÇÃO COM DIVERGÊNCIAS'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {currentOpinion}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold uppercase text-gray-900 dark:text-white block mb-1">
                        3. Resumo de Inconsistências & Divergências ({allIssues.length})
                      </span>
                      {allIssues.length === 0 ? (
                        <p className="text-emerald-600 font-semibold">
                          Nenhuma divergência apurada entre as peças técnicas analisadas.
                        </p>
                      ) : (
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-gray-100 dark:bg-gray-800 font-bold">
                              <tr>
                                <th className="p-2">Tipo</th>
                                <th className="p-2">Origem</th>
                                <th className="p-2">Local</th>
                                <th className="p-2">Descrição</th>
                                <th className="p-2">Ação Recomendada</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                              {allIssues.slice(0, 10).map((issue, idx) => (
                                <tr key={idx}>
                                  <td className="p-2 font-semibold">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                                        issue.tipo === 'div'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-amber-100 text-amber-800'
                                      }`}
                                    >
                                      {issue.tipo === 'div' ? 'Divergência' : 'Pendência'}
                                    </span>
                                  </td>
                                  <td className="p-2 font-mono text-[11px]">{issue.origem}</td>
                                  <td className="p-2 text-[11px]">{issue.local}</td>
                                  <td className="p-2">{issue.erro}</td>
                                  <td className="p-2 italic text-gray-500">{issue.providencia}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {allIssues.length > 10 && (
                            <div className="p-2 text-center text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                              + {allIssues.length - 10} outras inconsistências detalhadas no relatório
                              completo Word.
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="font-bold uppercase text-gray-900 dark:text-white block mb-1">
                        4. Assinatura e Encerramento
                      </span>
                      <div className="pt-8 text-center border-t border-gray-200 dark:border-gray-700 max-w-sm mx-auto">
                        <div className="h-0.5 bg-gray-300 dark:bg-gray-600 mb-2" />
                        <p className="font-bold text-gray-900 dark:text-white">
                          {data.info.rt || 'Responsável Técnico'}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {data.info.prof || 'CREA/CFT'} {data.info.reg || 'S/N'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
