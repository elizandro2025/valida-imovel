/**
 * Comprovantes de pagamento: tabela valida_payments no Supabase (cada pessoa vê só os próprios, por RLS).
 * As análises não são guardadas: o relatório existe só na tela, e quem quiser guardar exporta o PDF.
 */
import { supabase } from '@/integrations/supabase/client';

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
