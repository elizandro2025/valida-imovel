import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { adminService, AdminMetrics, UnlinkedPayment } from '@/services/adminService';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Users, FileText, TrendingUp, Settings, LogOut, ShieldCheck,
  Database, Activity, UserPlus, CreditCard, FileCheck, CheckCircle2,
  Search, RefreshCw, Crown, Shield, XCircle, Mail, Calendar, Sparkles, Check,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';

export interface UserProfile {
  id: string;
  email: string | null;
  full_name?: string;
  role?: string;
  has_subscription?: boolean;
  subscription_status?: string;
  subscription_plan?: string;
  subscription_expires_at?: string;
  created_at?: string;
}

export const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newUserEmail, setNewUserEmail] = useState('');
  const [isGrantingAccess, setIsGrantingAccess] = useState(false);

  // Estados de Gerenciamento de Usuários
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [linkEmails, setLinkEmails] = useState<Record<string, string>>({});
  usePageMeta('Painel administrativo', '/admin', undefined, { noindex: true });

  // Busca a lista de usuários e as métricas pela API (o servidor confere se quem pede é admin)
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      setUsersList(await adminService.listUsers() as UserProfile[]);
    } catch (err) {
      console.error('Falha ao carregar usuários:', err);
      toast({ title: 'Erro ao carregar usuários', description: err instanceof Error ? err.message : 'Tente novamente.', variant: 'destructive' });
    } finally {
      setIsLoadingUsers(false);
    }
    adminService.metrics()
      .then(m => { setMetrics(m); setMetricsError(null); })
      .catch(err => setMetricsError(err instanceof Error ? err.message : 'Métricas indisponíveis'));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Pagamento que chegou sem conta vinculada: libera para o e-mail informado e associa a cobrança
  const handleLinkPayment = async (payment: UnlinkedPayment) => {
    const email = (linkEmails[payment.payment_id] ?? payment.customer_email ?? '').trim().toLowerCase();
    if (!email.includes('@')) {
      toast({ title: 'Informe o e-mail da conta', description: 'Use o e-mail com que a pessoa criou a conta no site.', variant: 'destructive' });
      return;
    }
    try {
      await adminService.setSubscription({ email, payment_id: payment.payment_id }, true);
      toast({ title: 'Pagamento vinculado', description: `Acesso liberado para ${email}.` });
      fetchUsers();
    } catch (err) {
      toast({ title: 'Não foi possível vincular', description: err instanceof Error ? err.message : 'Tente novamente.', variant: 'destructive' });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleGrantAccess = async () => {
    if (!newUserEmail.trim()) {
      toast({ title: 'Email obrigatório', description: 'Digite o email do usuário que pagou via PIX', variant: 'destructive' });
      return;
    }
    if (!newUserEmail.includes('@')) {
      toast({ title: 'Email inválido', description: 'Digite um email válido', variant: 'destructive' });
      return;
    }
    setIsGrantingAccess(true);
    try {
      await adminService.setSubscription({ email: newUserEmail.trim().toLowerCase() }, true);

      toast({ title: 'Acesso liberado!', description: `Usuário ${newUserEmail} teve a assinatura ativada com sucesso.` });
      setNewUserEmail('');
      fetchUsers();
    } catch (error) {
      let errorMessage = 'Erro desconhecido. Tente novamente.';
      if (error instanceof Error) {
        if (error.message.includes('User already registered')) errorMessage = 'Este email já está cadastrado no sistema.';
        else if (error.message.includes('Invalid email')) errorMessage = 'Email inválido. Verifique o formato.';
        else errorMessage = error.message;
      }
      toast({ title: 'Erro ao liberar acesso', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsGrantingAccess(false);
    }
  };

  // Alterna o status da assinatura de um usuário específico
  const handleToggleSubscription = async (userItem: UserProfile) => {
    setUpdatingUserId(userItem.id);
    const newStatus = !isActiveSub(userItem);

    try {
      await adminService.setSubscription({ id: userItem.id }, newStatus);

      toast({
        title: newStatus ? 'Assinatura Ativada' : 'Assinatura Desativada',
        description: `O acesso para ${userItem.email} foi ${newStatus ? 'liberado por 90 dias' : 'removido'}.`,
      });

      fetchUsers();
    } catch (err) {
      toast({
        title: 'Erro ao atualizar',
        description: err instanceof Error && err.message ? err.message : 'Não foi possível alterar a assinatura.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Filtra lista de usuários em tempo real
  const filteredUsers = usersList.filter(u => {
    const matchesSearch =
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'active') return matchesSearch && isActiveSub(u);
    if (statusFilter === 'inactive') return matchesSearch && !isActiveSub(u);
    return matchesSearch;
  });

  const isActiveSub = (u: UserProfile) =>
    u.role === 'admin' || (Boolean(u.has_subscription) && (!u.subscription_expires_at || Date.parse(u.subscription_expires_at) > Date.now()));
  const activeCount = usersList.filter(isActiveSub).length;
  const brl = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const pending = 'Aguardando migração do banco';

  const stats = [
    { title: 'Usuários cadastrados', value: usersList.length.toString(), icon: Users, detail: `${activeCount} com acesso ativo` },
    {
      title: 'Análises (30 dias)',
      value: metrics?.analyses ? metrics.analyses.last_30_days.toString() : '—',
      icon: FileText,
      detail: metrics?.analyses ? `${metrics.analyses.today} hoje • ${metrics.analyses.active_users_7_days} usuários em 7 dias` : pending,
    },
    {
      title: 'Receita (30 dias)',
      value: metrics?.payments_last_30_days ? brl(metrics.payments_last_30_days.revenue) : '—',
      icon: CreditCard,
      detail: metrics?.payments_last_30_days ? `${metrics.payments_last_30_days.count} pagamento(s) • ${metrics.payments_last_30_days.refunds} estorno(s)` : pending,
    },
    {
      title: 'IA (24 horas)',
      value: metrics?.ai_last_24h ? `${metrics.ai_last_24h.calls - metrics.ai_last_24h.failures}/${metrics.ai_last_24h.calls}` : '—',
      icon: Activity,
      detail: metrics?.ai_last_24h ? `${metrics.ai_last_24h.failures} falha(s) • chamadas com sucesso/total` : pending,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <Logo />
            
            <span className="hidden sm:inline text-[13px] text-muted-foreground">Administração</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden md:block truncate max-w-[180px] font-medium">
              {user?.name || user?.email || 'Admin Master'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-semibold gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Painel Administrativo</h1>
          <p className="text-sm text-muted-foreground">Gerencie usuários, acessos, assinaturas e status da plataforma Valida Imóvel.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {stats.map(({ title, value, icon: Icon, detail }) => (
            <Card key={title} className="border-0 ring-1 ring-black/5 bg-card shadow-soft rounded-3xl text-foreground">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground">{title}</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-foreground">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {metricsError && (
          <p className="text-xs text-warning">Métricas indisponíveis: {metricsError}</p>
        )}

        {/* Pagamentos que chegaram sem conta vinculada */}
        {metrics && metrics.unlinked_payments.length > 0 && (
          <Card className="border-warning/30 bg-card shadow-sm rounded-2xl text-foreground">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <XCircle className="w-5 h-5 text-warning" /> Pagamentos sem conta vinculada ({metrics.unlinked_payments.length})
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                O pagamento foi confirmado, mas não encontramos a conta. Informe o e-mail com que a pessoa se cadastrou para liberar o acesso.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {metrics.unlinked_payments.map(p => (
                <div key={p.payment_id} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 p-3 rounded-xl border border-border bg-background text-xs">
                  <span className="md:w-56 shrink-0 text-muted-foreground">
                    {new Date(p.paid_at || p.created_at).toLocaleDateString('pt-BR')} • {brl(Number(p.value || 0))} • {p.payment_id}
                  </span>
                  <Input
                    type="email"
                    placeholder="e-mail da conta"
                    value={linkEmails[p.payment_id] ?? p.customer_email ?? ''}
                    onChange={(e) => setLinkEmails(prev => ({ ...prev, [p.payment_id]: e.target.value }))}
                    className="h-10 rounded-xl text-xs"
                  />
                  <Button size="sm" onClick={() => handleLinkPayment(p)} className="shrink-0">Vincular e liberar</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Liberação manual */}
        <Card className="border-0 ring-1 ring-black/5 bg-card shadow-soft rounded-3xl overflow-hidden text-foreground">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-foreground">Liberar acesso manualmente</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Adiciona 90 dias (somados ao que ainda restar) para a conta com este e-mail
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <Label htmlFor="user-email" className="text-xs font-semibold text-muted-foreground">Email do usuário que pagou</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="usuario@email.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="h-11 rounded-xl border-border bg-background text-foreground focus:border-primary/30 focus:ring-primary/20"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleGrantAccess}
                  disabled={isGrantingAccess}
                  className="w-full h-11 font-medium gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {isGrantingAccess ? 'Liberando...' : 'Liberar Acesso (90 dias)'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 🚀 TABELA DE GERENCIAMENTO DE USUÁRIOS */}
        <Card className="border-0 ring-1 ring-black/5 bg-card shadow-soft rounded-3xl overflow-hidden text-foreground">
          <CardHeader className="pb-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-semibold text-foreground">Usuários Cadastrados</CardTitle>
                <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 text-xs font-semibold">
                  {filteredUsers.length} {filteredUsers.length === 1 ? 'usuário' : 'usuários'}
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Visualize, pesquise e gerencie o status das assinaturas dos usuários da plataforma.
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchUsers}
                disabled={isLoadingUsers}
                className="border-border bg-background text-muted-foreground hover:text-foreground text-xs gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? 'animate-spin' : ''}`} /> Atualizar
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            {/* Barra de Filtros e Busca */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por nome ou e-mail..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-xl border-border bg-background text-foreground text-xs placeholder:text-muted-foreground focus:border-primary/30 focus:ring-primary/20"
                />
              </div>

              {/* Botões de Filtro */}
              <div className="flex items-center gap-1.5 bg-background p-1 rounded-xl border border-border w-full sm:w-auto">
                <Button
                  size="sm"
                  variant={statusFilter === 'all' ? 'default' : 'ghost'}
                  onClick={() => setStatusFilter('all')}
                  className={`text-xs h-10 lg:h-8 rounded-lg font-semibold ${statusFilter === 'all' ? 'bg-primary text-white font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Todos ({usersList.length})
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === 'active' ? 'default' : 'ghost'}
                  onClick={() => setStatusFilter('active')}
                  className={`text-xs h-10 lg:h-8 rounded-lg font-semibold ${statusFilter === 'active' ? 'bg-success text-white font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Ativos ({activeCount})
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === 'inactive' ? 'default' : 'ghost'}
                  onClick={() => setStatusFilter('inactive')}
                  className={`text-xs h-10 lg:h-8 rounded-lg font-semibold ${statusFilter === 'inactive' ? 'bg-warning text-white font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Sem Assinatura ({usersList.length - activeCount})
                </Button>
              </div>
            </div>

            {/* Tabela de Usuários */}
            {isLoadingUsers ? (
              <div className="py-12 text-center text-muted-foreground space-y-3">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary/30 rounded-full animate-spin mx-auto" />
                <p className="text-xs">Carregando lista de usuários...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-border rounded-2xl bg-background/50">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-semibold text-muted-foreground">Nenhum usuário encontrado</p>
                <p className="text-xs text-muted-foreground mt-1">Tente ajustar o termo de busca ou o filtro selecionado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border bg-background">
                <table className="w-full text-left text-xs text-muted-foreground">
                  <thead className="bg-card/80 text-muted-foreground font-semibold border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Usuário</th>
                      <th className="py-3 px-4 hidden md:table-cell">Função / Perfil</th>
                      <th className="py-3 px-4">Status da Assinatura</th>
                      <th className="py-3 px-4 hidden md:table-cell">Data de Cadastro</th>
                      <th className="py-3 px-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((item) => {
                      const isAdminUser = item.role === 'admin';
                      const hasActiveSub = isActiveSub(item);
                      const isUpdating = updatingUserId === item.id;

                      return (
                        <tr key={item.id} className="hover:bg-card/50 transition-colors">
                          {/* Coluna Nome / Email */}
                          <td className="py-3.5 px-4 font-medium">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-muted border border-border flex items-center justify-center text-primary font-semibold">
                                {(item.full_name || item.email || 'U').substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                  {item.full_name || item.email?.split('@')[0] || 'Sem nome'}
                                  {isAdminUser && <Crown className="w-3.5 h-3.5 text-warning inline" />}
                                </div>
                                <div className="text-muted-foreground text-xs flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-muted-foreground" /> {item.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Coluna Role */}
                          <td className="py-3.5 px-4 hidden md:table-cell">
                            {isAdminUser ? (
                              <Badge variant="outline" className="border-warning/30 text-warning bg-warning/10 gap-1 text-xs">
                                <Crown className="w-3 h-3 text-warning" /> Admin Master
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-border text-muted-foreground bg-card text-xs">
                                <Shield className="w-3 h-3 text-muted-foreground" /> Cliente
                              </Badge>
                            )}
                          </td>

                          {/* Coluna Status Assinatura */}
                          <td className="py-3.5 px-4">
                            {hasActiveSub ? (
                              <Badge variant="outline" className="border-success/30 text-success bg-success/10 gap-1 text-xs font-semibold py-1 px-2.5">
                                <Check className="w-3 h-3 text-success" />
                                {isAdminUser || !item.subscription_expires_at
                                  ? 'Ativo'
                                  : `Ativo até ${new Date(item.subscription_expires_at).toLocaleDateString('pt-BR')}`}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-warning/30 text-warning bg-warning/10 gap-1 text-xs font-medium py-1 px-2.5">
                                <XCircle className="w-3 h-3 text-warning" />
                                {item.subscription_expires_at && Date.parse(item.subscription_expires_at) <= Date.now()
                                  ? `Venceu em ${new Date(item.subscription_expires_at).toLocaleDateString('pt-BR')}`
                                  : 'Sem assinatura'}
                              </Badge>
                            )}
                          </td>

                          {/* Coluna Data */}
                          <td className="py-3.5 px-4 text-muted-foreground hidden md:table-cell">
                            <div className="flex items-center gap-1.5 text-xs">
                              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                              {item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : 'Recente'}
                            </div>
                          </td>

                          {/* Coluna Ações */}
                          <td className="py-3.5 px-4 text-right">
                            {isAdminUser ? (
                              <span className="text-xs text-muted-foreground italic">Administrador</span>
                            ) : (
                              <Button
                                size="sm"
                                variant={hasActiveSub ? 'outline' : 'default'}
                                disabled={isUpdating}
                                onClick={() => handleToggleSubscription(item)}
                                className={`text-xs rounded-xl font-semibold gap-1.5 h-8 ${
                                  hasActiveSub
                                    ? 'border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10'
                                    : 'bg-success hover:bg-success text-white shadow-soft'
                                }`}
                              >
                                {isUpdating ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : hasActiveSub ? (
                                  'Desativar'
                                ) : (
                                  'Liberar Acesso'
                                )}
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottom Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* System Status */}
          <Card className="border-0 ring-1 ring-black/5 bg-card shadow-soft rounded-3xl text-foreground">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                <CardTitle className="text-base font-semibold text-foreground">Status do Sistema</CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground">Informações sobre integrações e serviços</CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-3">
              {(metrics
                ? [
                  { label: 'Banco de dados (Supabase)', status: metrics.services.database ? 'Respondendo' : 'Sem resposta', ok: metrics.services.database },
                  { label: 'Tabelas de histórico, uso e pagamentos', status: metrics.tables_ready ? 'Criadas' : 'Rodar a migração', ok: metrics.tables_ready },
                  { label: 'Chave da IA (Gemini)', status: metrics.services.ai_key_configured ? 'Configurada' : 'Ausente', ok: metrics.services.ai_key_configured },
                  {
                    label: 'IA nas últimas 24 h',
                    status: metrics.ai_last_24h ? `${metrics.ai_last_24h.failures} falha(s) em ${metrics.ai_last_24h.calls}` : 'Sem dados',
                    ok: !metrics.ai_last_24h || metrics.ai_last_24h.failures <= metrics.ai_last_24h.calls * 0.1,
                  },
                  { label: 'Pagamentos (Asaas)', status: metrics.services.payments_key_configured ? `Configurado (${metrics.environment})` : 'Chave ausente', ok: metrics.services.payments_key_configured },
                ]
                : [{ label: 'API', status: metricsError ? 'Sem resposta' : 'Carregando...', ok: !metricsError }]
              ).map(({ label, status, ok }) => (
                <div key={label} className="flex items-center justify-between gap-2 py-1.5 border-b border-border last:border-0 text-xs">
                  <span className="text-muted-foreground font-medium">{label}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs font-semibold shrink-0 ${ok ? 'border-success/30 text-success bg-success/10' : 'border-warning/30 text-warning bg-warning/10'}`}
                  >
                    {ok ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                    {status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 ring-1 ring-black/5 bg-card shadow-soft rounded-3xl text-foreground">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-semibold text-foreground">Ações Rápidas</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Principais funcionalidades administrativas</CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-3">
              {[
                { icon: Users, label: 'Atualizar Lista de Usuários', action: fetchUsers },
                { icon: FileText, label: 'Ir para Análise de Matrículas', action: () => navigate('/app') },
                { icon: Settings, label: 'Voltar para a Página Inicial', action: () => navigate('/') },
              ].map(({ icon: Icon, label, action }) => (
                <Button key={label} onClick={action} variant="outline" className="w-full justify-start border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-card text-xs font-semibold gap-2.5 h-10">
                  <Icon className="w-4 h-4 text-primary" /> {label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
};