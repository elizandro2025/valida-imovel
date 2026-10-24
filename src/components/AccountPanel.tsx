import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarClock, Receipt, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { historyService, PaymentRecord } from '@/services/historyService';
import { COMPANY_CONFIG } from '@/config/companyConfig';

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysLeft(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  return Math.max(0, Math.ceil((Date.parse(expiresAt) - Date.now()) / DAY_MS));
}

const STATUS_LABEL: Record<string, string> = {
  pago: 'Pago',
  estornado: 'Estornado',
  chargeback: 'Contestado',
  desfeito: 'Desfeito',
};

// Situação do plano, renovação e comprovantes de pagamento
export const AccountPanel: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[] | null>(null);

  useEffect(() => {
    historyService.payments().then(setPayments);
  }, []);

  if (!user) return null;
  const isAdmin = user.role === 'admin';
  const left = daysLeft(user.subscriptionExpiresAt);

  return (
    <Card className="border-0 ring-1 ring-black/5 bg-card shadow-soft rounded-3xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-primary" /> Sua conta
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4 text-xs">
        <div className="space-y-1">
          <p className="text-muted-foreground">Plano</p>
          <p className="font-semibold text-foreground">
            {isAdmin ? 'Administrador (sem vencimento)' : user.hasSubscription ? `${COMPANY_CONFIG.offer.planName} ativo` : 'Sem plano ativo'}
          </p>
          {!isAdmin && user.subscriptionExpiresAt && (
            <p className="text-muted-foreground">
              {user.hasSubscription ? 'Vence em ' : 'Venceu em '}
              {new Date(user.subscriptionExpiresAt).toLocaleDateString('pt-BR')}
              {user.hasSubscription && left !== null ? ` (${left} dia${left === 1 ? '' : 's'})` : ''}
            </p>
          )}
          <p className="text-muted-foreground">Uso justo: até {COMPANY_CONFIG.offer.fairUseDailyLimit} análises por dia.</p>
        </div>

        {!isAdmin && (
          <Link to="/pagamento?renovar=1" className="block">
            <Button variant={user.hasSubscription ? 'outline' : 'default'} size="sm" className="w-full">
              {user.hasSubscription ? 'Renovar (os dias restantes são somados)' : `Assinar por ${COMPANY_CONFIG.offer.priceFormatted}`}
            </Button>
          </Link>
        )}

        {payments && payments.length > 0 && (
          <div className="space-y-2 pt-1">
            <p className="text-muted-foreground flex items-center gap-1.5"><Receipt className="w-3.5 h-3.5" /> Pagamentos</p>
            <ul className="space-y-1.5">
              {payments.map(p => (
                <li key={p.payment_id} className="flex items-center justify-between gap-2">
                  <span className="text-foreground">
                    {new Date(p.paid_at || p.created_at).toLocaleDateString('pt-BR')} • R$ {Number(p.value || 0).toFixed(2).replace('.', ',')} • {STATUS_LABEL[p.status] || p.status}
                  </span>
                  {(p.receipt_url || p.invoice_url) && (
                    <a href={p.receipt_url || p.invoice_url || '#'} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold flex items-center gap-1 py-2 -my-2 shrink-0">
                      Comprovante <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
