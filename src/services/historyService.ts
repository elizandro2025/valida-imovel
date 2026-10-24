/**
 * "Minhas análises" e comprovantes — tabelas valida_analyses e valida_payments no Supabase.
 * As permissões (RLS) deixam cada pessoa ver só os próprios registros. Se as tabelas ainda não existirem,
 * as funções devolvem null/false e a tela simplesmente esconde a seção.
 */
import { supabase } from '@/integrations/supabase/client';
import type { MatriculaReport } from './aiService';
import { getReportView } from '@/lib/reportView';

export interface AnalysisSummary {
  id: string;
  file_name: string | null;
  matricula: string | null;
  cartorio: string | null;
  score_risco: number | null;
  nivel_risco: string | null;
  created_at: string;
}

export interface PaymentRecord {
  payment_id: string;
  value: number | null;
  status: string;
  billing_type: string | null;
  receipt_url: string | null;
  invoice_url: string | null;
  paid_at: string | null;
  created_at: string;
}

export const historyService = {
  async list(): Promise<AnalysisSummary[] | null> {
    const { data, error } = await supabase
      .from('valida_analyses')
      .select('id,file_name,matricula,cartorio,score_risco,nivel_risco,created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) {
      console.warn('Histórico indisponível:', error.message);
      return null;
    }
    return data as AnalysisSummary[];
  },

  // O mesmo PDF reenviado (relatório vindo do cache do navegador) não vira uma segunda linha no histórico
  async save(userId: string, fileName: string, fileHash: string, report: MatriculaReport): Promise<string | null> {
    const existing = await supabase.from('valida_analyses').select('id').eq('file_hash', fileHash).limit(1);
    if (existing.error) return null;
    if (existing.data.length > 0) return existing.data[0].id as string;

    const view = getReportView(report);
    const { data, error } = await supabase
      .from('valida_analyses')
      .insert({
        user_id: userId,
        file_name: fileName,
        file_hash: fileHash,
        matricula: typeof view.ident.matricula === 'string' ? view.ident.matricula : null,
        cartorio: typeof view.ident.cartorio_ri === 'string' ? view.ident.cartorio_ri : null,
        score_risco: view.score,
        nivel_risco: view.nivelRisco,
        report,
      })
      .select('id')
      .single();
    if (error) {
      console.warn('Análise não salva no histórico:', error.message);
      return null;
    }
    return data.id as string;
  },

  async get(id: string): Promise<MatriculaReport | null> {
    const { data, error } = await supabase.from('valida_analyses').select('report').eq('id', id).single();
    if (error) return null;
    return data.report as MatriculaReport;
  },

  async remove(id: string): Promise<boolean> {
    const { error } = await supabase.from('valida_analyses').delete().eq('id', id);
    return !error;
  },

  async payments(): Promise<PaymentRecord[] | null> {
    const { data, error } = await supabase
      .from('valida_payments')
      .select('payment_id,value,status,billing_type,receipt_url,invoice_url,paid_at,created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) return null;
    return data as PaymentRecord[];
  },
};
