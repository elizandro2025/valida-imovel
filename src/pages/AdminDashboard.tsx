import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Users, FileText, TrendingUp, Settings, LogOut, ShieldCheck,
  Database, Activity, UserPlus, CreditCard, FileCheck, CheckCircle2,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { user, signOut, grantAccess } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newUserEmail, setNewUserEmail] = useState('');
  const [isGrantingAccess, setIsGrantingAccess] = useState(false);

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
      await grantAccess(newUserEmail.trim());
      toast({ title: 'Acesso liberado!', description: `Usuário ${newUserEmail} foi cadastrado. Uma senha temporária foi gerada.` });
      setNewUserEmail('');
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

  const stats = [
    { title: 'Usuários Ativos', value: '1', icon: Users, trend: '+0%' },
    { title: 'Análises Realizadas', value: '0', icon: FileText, trend: '+0%' },
    { title: 'Taxa de Conversão', value: '0%', icon: TrendingUp, trend: '+0%' },
    { title: 'Status do Sistema', value: 'Online', icon: Activity, trend: '99,9%' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-slate-950 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform font-black">
                <FileCheck className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                Valida<span className="text-cyan-400">Imóvel</span>
              </span>
            </Link>
            <div className="hidden sm:block w-px h-5 bg-slate-800" />
            <Badge variant="outline" className="hidden sm:flex border-blue-500/30 text-cyan-400 bg-blue-500/10 gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Painel Administrativo
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden md:block truncate max-w-[180px] font-medium">
              {user?.name || user?.email || 'Modo Livre (Admin)'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl text-xs font-bold gap-1.5 h-9"
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
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Painel Administrativo</h1>
          <p className="text-sm text-slate-400">Gerencie usuários, acesso e status da plataforma Valida Imóvel.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map(({ title, value, icon: Icon, trend }) => (
            <Card key={title} className="border-slate-800 bg-slate-900 shadow-sm rounded-2xl text-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-cyan-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-white">{value}</div>
                <p className="text-xs text-slate-400 mt-1">{trend} desde o último mês</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* PIX Access Management */}
        <Card className="border-blue-500/30 bg-slate-900 shadow-sm rounded-2xl overflow-hidden text-white">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 h-1" />
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-white">Liberação de Acesso via PIX</CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-0.5">
                  Libere o acesso para usuários que realizaram o pagamento via PIX
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <Label htmlFor="user-email" className="text-sm font-semibold text-slate-700">Email do usuário que pagou</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="usuario@email.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleGrantAccess}
                  disabled={isGrantingAccess}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {isGrantingAccess ? 'Liberando...' : 'Liberar Acesso'}
                </Button>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-1.5">
              <p className="text-xs font-bold text-slate-700 mb-2">Instruções:</p>
              {[
                'Confirme o pagamento PIX recebido',
                'Digite o email do usuário no campo acima',
                'Clique em "Liberar Acesso"',
                'Uma conta será criada com senha temporária',
                'Informe ao usuário que deve fazer login e alterar a senha',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-500">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* System Status */}
          <Card className="border-slate-200/80 bg-white shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-slate-500" />
                <CardTitle className="text-base font-bold text-slate-900">Status do Sistema</CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500">Informações sobre integrações e serviços</CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-3">
              {[
                { label: 'Supabase', status: 'Conectado', ok: true },
                { label: 'Autenticação', status: 'Ativa', ok: true },
                { label: 'Serviço de IA Registrária', status: 'Ativo', ok: true },
                { label: 'Sistema de Pagamentos', status: 'PIX Manual', ok: true },
              ].map(({ label, status, ok }) => (
                <div key={label} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-600">{label}</span>
                  <Badge
                    variant={ok === true ? 'outline' : 'secondary'}
                    className={`text-[11px] font-semibold ${ok === true ? 'border-emerald-300 text-emerald-700 bg-emerald-50' : 'text-slate-500'}`}
                  >
                    {ok === true && <CheckCircle2 className="w-3 h-3 mr-1" />}
                    {status}
                  </Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-2 rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold gap-2">
                <Settings className="w-3.5 h-3.5" /> Configurar Integrações
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-slate-200/80 bg-white shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900">Ações Rápidas</CardTitle>
              <CardDescription className="text-xs text-slate-500">Principais funcionalidades administrativas</CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-3">
              {[
                { icon: Users, label: 'Gerenciar Usuários' },
                { icon: FileText, label: 'Relatórios de Análise' },
                { icon: TrendingUp, label: 'Analytics' },
                { icon: Settings, label: 'Configurações do Sistema' },
              ].map(({ icon: Icon, label }) => (
                <Button key={label} variant="outline" className="w-full justify-start rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 hover:border-emerald-300 hover:bg-emerald-50 text-xs font-semibold gap-2.5 h-10">
                  <Icon className="w-4 h-4 text-emerald-600" /> {label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Next Steps Notice */}
        <Card className="border-amber-200/80 bg-amber-50/60 shadow-sm rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-amber-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-600" /> Próximos Passos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-amber-700 mb-3">
              Para ativar todas as funcionalidades administrativas, conecte o projeto ao Supabase:
            </p>
            <ul className="space-y-1.5 text-xs text-amber-700">
              {[
                'Gerenciamento completo de usuários',
                'Banco de dados para análises',
                'Sistema de permissões avançado',
                'Relatórios detalhados',
                'Backup e segurança',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};