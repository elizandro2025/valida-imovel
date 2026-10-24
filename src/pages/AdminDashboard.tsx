import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/services/adminService';
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

  // Busca a lista de usuários pela API (o servidor confere se quem pede é admin)
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      setUsersList(await adminService.listUsers() as UserProfile[]);
    } catch (err: any) {
      console.error('Falha ao carregar usuários:', err);
      toast({ title: 'Erro ao carregar usuários', description: err?.message || 'Tente novamente.', variant: 'destructive' });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
    const newStatus = !userItem.has_subscription;

    try {
      await adminService.setSubscription({ id: userItem.id }, newStatus);

      toast({
        title: newStatus ? 'Assinatura Ativada' : 'Assinatura Desativada',
        description: `O acesso para ${userItem.email} foi ${newStatus ? 'liberado por 90 dias' : 'removido'}.`,
      });

      fetchUsers();
    } catch (err: any) {
      toast({
        title: 'Erro ao atualizar',
        description: err?.message || 'Não foi possível alterar a assinatura.',
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
    
    if (statusFilter === 'active') return matchesSearch && (u.has_subscription || u.role === 'admin');
    if (statusFilter === 'inactive') return matchesSearch && !u.has_subscription && u.role !== 'admin';
    return matchesSearch;
  });

  const activeCount = usersList.filter(u => u.has_subscription || u.role === 'admin').length;

  const stats = [
    { title: 'Total de Usuários', value: usersList.length.toString(), icon: Users, trend: '+100%' },
    { title: 'Assinaturas Ativas', value: activeCount.toString(), icon: Sparkles, trend: `${Math.round((activeCount / (usersList.length || 1)) * 100)}%` },
    { title: 'Análises Realizadas', value: '12', icon: FileText, trend: '+15%' },
    { title: 'Status do Sistema', value: 'Online', icon: Activity, trend: '99,9%' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <Logo />
            <div className="hidden sm:block w-px h-5 bg-muted" />
            <Badge variant="outline" className="hidden sm:flex border-primary/30 text-primary bg-primary/10 gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Painel Administrativo
            </Badge>
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
              className="border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-semibold gap-1.5 h-9"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map(({ title, value, icon: Icon, trend }) => (
            <Card key={title} className="border-border bg-card shadow-sm rounded-2xl text-foreground">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground">{title}</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-foreground">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{trend} em relação ao total</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* PIX Access Management */}
        <Card className="border-primary/30 bg-card shadow-sm rounded-2xl overflow-hidden text-foreground">
          <div className="h-1 bg-primary" />
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-foreground">Liberação de Acesso via PIX</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Libere instantaneamente o acesso para clientes que efetuarem o pagamento via PIX
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
        <Card className="border-border bg-card shadow-medium rounded-2xl overflow-hidden text-foreground">
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
                className="border-border bg-background text-muted-foreground hover:text-foreground text-xs gap-1.5 h-9"
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
                  className={`text-xs h-8 rounded-lg font-semibold ${statusFilter === 'all' ? 'bg-primary text-white font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Todos ({usersList.length})
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === 'active' ? 'default' : 'ghost'}
                  onClick={() => setStatusFilter('active')}
                  className={`text-xs h-8 rounded-lg font-semibold ${statusFilter === 'active' ? 'bg-success text-white font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Ativos ({activeCount})
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === 'inactive' ? 'default' : 'ghost'}
                  onClick={() => setStatusFilter('inactive')}
                  className={`text-xs h-8 rounded-lg font-semibold ${statusFilter === 'inactive' ? 'bg-warning text-white font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
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
                      <th className="py-3 px-4">Função / Perfil</th>
                      <th className="py-3 px-4">Status da Assinatura</th>
                      <th className="py-3 px-4">Data de Cadastro</th>
                      <th className="py-3 px-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((item) => {
                      const isAdminUser = item.role === 'admin';
                      const hasActiveSub = Boolean(item.has_subscription || isAdminUser);
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
                          <td className="py-3.5 px-4">
                            {isAdminUser ? (
                              <Badge variant="outline" className="border-warning/40 text-warning bg-warning/10 gap-1 text-xs">
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
                              <Badge variant="outline" className="border-success/40 text-success bg-success/10 gap-1 text-xs font-semibold py-1 px-2.5">
                                <Check className="w-3 h-3 text-success" /> Assinatura Ativa (90d)
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-warning/40 text-warning bg-warning/10 gap-1 text-xs font-medium py-1 px-2.5">
                                <XCircle className="w-3 h-3 text-warning" /> Sem Assinatura
                              </Badge>
                            )}
                          </td>

                          {/* Coluna Data */}
                          <td className="py-3.5 px-4 text-muted-foreground">
                            <div className="flex items-center gap-1.5 text-xs">
                              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                              {item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : 'Recente'}
                            </div>
                          </td>

                          {/* Coluna Ações */}
                          <td className="py-3.5 px-4 text-right">
                            {isAdminUser ? (
                              <span className="text-xs text-muted-foreground italic">VIP Permanente</span>
                            ) : (
                              <Button
                                size="sm"
                                variant={hasActiveSub ? 'outline' : 'default'}
                                disabled={isUpdating}
                                onClick={() => handleToggleSubscription(item)}
                                className={`text-xs rounded-xl font-semibold gap-1.5 h-8 ${
                                  hasActiveSub
                                    ? 'border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/10'
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
          <Card className="border-border bg-card shadow-sm rounded-2xl text-foreground">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                <CardTitle className="text-base font-semibold text-foreground">Status do Sistema</CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground">Informações sobre integrações e serviços</CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-3">
              {[
                { label: 'Supabase Database & Auth', status: 'Conectado', ok: true },
                { label: 'Gerenciamento de Perfis', status: 'Ativo', ok: true },
                { label: 'Serviço de IA Registrária', status: 'Ativo', ok: true },
                { label: 'Sistema de Pagamentos PIX', status: 'Operacional', ok: true },
              ].map(({ label, status, ok }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0 text-xs">
                  <span className="text-muted-foreground font-medium">{label}</span>
                  <Badge
                    variant={ok ? 'outline' : 'secondary'}
                    className="text-xs font-semibold border-success/30 text-success bg-success/10"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1 text-success" />
                    {status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border bg-card shadow-sm rounded-2xl text-foreground">
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
                <Button key={label} onClick={action} variant="outline" className="w-full justify-start border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-card text-xs font-semibold gap-2.5 h-10">
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