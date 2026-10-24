import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, FileText, Trash2, Loader2 } from 'lucide-react';
import { historyService, AnalysisSummary } from '@/services/historyService';

interface AnalysisHistoryProps {
  refreshKey: number;
  onOpen: (id: string, fileName: string | null) => void;
}

const LEVEL_STYLES: Record<string, string> = {
  CRÍTICO: 'border-destructive/30 text-destructive bg-destructive/10',
  ALTO: 'border-warning/30 text-warning bg-warning/10',
  MÉDIO: 'border-warning/30 text-warning bg-warning/10',
  BAIXO: 'border-success/30 text-success bg-success/10',
};

// "Minhas análises": relatórios salvos na conta (o PDF não é guardado)
export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ refreshKey, onOpen }) => {
  const [items, setItems] = useState<AnalysisSummary[] | null | undefined>(undefined);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    historyService.list().then(list => { if (!cancelled) setItems(list); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  const handleRemove = async (item: AnalysisSummary) => {
    if (!window.confirm(`Apagar a análise da matrícula ${item.matricula || item.file_name || ''}? Esta ação não pode ser desfeita.`)) return;
    setRemovingId(item.id);
    if (await historyService.remove(item.id)) setItems(prev => prev?.filter(i => i.id !== item.id));
    setRemovingId(null);
  };

  // Tabela ainda não criada no banco: a seção não aparece
  if (items === null) return null;

  return (
    <Card className="border-border bg-card shadow-sm rounded-3xl">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <History className="w-4 h-4 text-primary" /> Minhas análises
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {items === undefined ? (
          <div className="py-6 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : items.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            As matrículas que você analisar ficam salvas aqui para abrir e exportar de novo, em qualquer aparelho.
          </p>
        ) : (
          <ul className="divide-y divide-border -mx-2">
            {items.map(item => (
              <li key={item.id} className="flex items-center gap-3 px-2 py-2.5">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <button onClick={() => onOpen(item.id, item.file_name)} className="flex-1 min-w-0 text-left py-1.5 group">
                  <span className="block text-xs font-semibold text-foreground truncate group-hover:text-primary">
                    Matrícula {item.matricula || 'não identificada'}{item.cartorio ? ` • ${item.cartorio}` : ''}
                  </span>
                  <span className="block text-xs text-muted-foreground truncate">
                    {new Date(item.created_at).toLocaleDateString('pt-BR')} • {item.file_name || 'PDF'}
                  </span>
                </button>
                {item.nivel_risco && item.nivel_risco !== 'INDEFINIDO' && (
                  <Badge variant="outline" className={`${LEVEL_STYLES[item.nivel_risco] || ''} text-xs shrink-0 hidden sm:inline-flex`}>
                    {item.nivel_risco}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Apagar análise"
                  disabled={removingId === item.id}
                  onClick={() => handleRemove(item)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  {removingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
