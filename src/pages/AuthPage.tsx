import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, Mail, Lock, ShieldCheck, CheckCircle2, ArrowRight,
  Key, FileCheck, ArrowLeft, FileText, Users, Compass,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AuthPage: React.FC = () => {
  const { user, signIn, signUp, resetPassword, updatePassword, isLoading } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [showNewPasswordForm, setShowNewPasswordForm] = useState(false);

  useEffect(() => {
    const isReset = searchParams.get('reset') === 'true';
    if (isReset) setShowNewPasswordForm(true);
  }, [searchParams]);

  if (user && !showNewPasswordForm) return <Navigate to="/app" replace />;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Campos obrigatórios', description: 'Preencha email e senha para continuar.', variant: 'destructive' });
      return;
    }
    setFormLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        let msg = 'Erro no login. Verifique suas credenciais.';
        if (error.message?.includes('Invalid login credentials')) msg = 'Email ou senha incorretos.';
        else if (error.message?.includes('Email not confirmed')) msg = 'Por favor, confirme seu email antes de fazer login.';
        else if (error.message?.includes('Too many requests')) msg = 'Muitas tentativas. Tente novamente em alguns minutos.';
        toast({ title: 'Erro no login', description: msg, variant: 'destructive' });
      } else {
        toast({ title: 'Bem-vindo!', description: 'Login realizado com sucesso.' });
      }
    } catch {
      toast({ title: 'Erro inesperado', description: 'Ocorreu um erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Campos obrigatórios', description: 'Preencha email e senha para continuar.', variant: 'destructive' });
      return;
    }
    if (password.length < 8) {
      toast({ title: 'Senha inválida', description: 'A senha deve ter pelo menos 8 caracteres.', variant: 'destructive' });
      return;
    }
    setFormLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) {
        let msg = 'Erro ao criar conta. Tente novamente.';
        if (error.message?.includes('User already registered')) msg = 'Este email já está cadastrado. Faça login.';
        else if (error.message?.includes('Invalid email')) msg = 'Email inválido. Verifique e tente novamente.';
        toast({ title: 'Erro no cadastro', description: msg, variant: 'destructive' });
      } else {
        toast({ title: 'Conta criada!', description: 'Verifique seu email para confirmar sua conta.' });
        setEmail('');
        setPassword('');
      }
    } catch {
      toast({ title: 'Erro inesperado', description: 'Ocorreu um erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: 'Email obrigatório', description: 'Digite seu email para recuperar a senha.', variant: 'destructive' });
      return;
    }
    setFormLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        toast({ title: 'Erro ao enviar email', description: 'Verifique se o email está correto e tente novamente.', variant: 'destructive' });
      } else {
        toast({ title: 'Email enviado!', description: 'Verifique seu email para redefinir sua senha.' });
        setShowResetForm(false);
      }
    } catch {
      toast({ title: 'Erro inesperado', description: 'Ocorreu um erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast({ title: 'Campos obrigatórios', description: 'Preencha a nova senha e confirme.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Senhas não conferem', description: 'A nova senha e confirmação devem ser iguais.', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: 'Senha inválida', description: 'A senha deve ter pelo menos 8 caracteres.', variant: 'destructive' });
      return;
    }
    setFormLoading(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        toast({ title: 'Erro ao atualizar senha', description: 'Não foi possível atualizar sua senha. Tente novamente.', variant: 'destructive' });
      } else {
        toast({ title: 'Senha atualizada!', description: 'Sua senha foi atualizada com sucesso.' });
        setShowNewPasswordForm(false);
        window.location.href = '/app';
      }
    } catch {
      toast({ title: 'Erro inesperado', description: 'Ocorreu um erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-100 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Carregando plataforma...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row antialiased">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden bg-slate-900">
        {/* Background gradient accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14">
          {/* Logo top */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30 group-hover:bg-emerald-500 transition-colors">
              <FileCheck className="w-6 h-6 text-white stroke-[2]" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              Valida<span className="text-emerald-400">Imóvel</span>
            </span>
          </Link>

          {/* Hero content */}
          <div className="space-y-8 max-w-sm">
            <div className="space-y-4">
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs font-semibold">
                LegalTech & PropTech — IA Jurídica
              </Badge>
              <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight">
                Análise jurídica de matrículas com{' '}
                <span className="text-emerald-400">inteligência artificial</span>.
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Extraia cadeia dominial, identifique gravames, ônus e dados cartográficos automaticamente em segundos.
              </p>
            </div>

            {/* Feature bullets */}
            <div className="space-y-3">
              {[
                { icon: FileText, label: 'Extração automática de averbações e registros' },
                { icon: ShieldCheck, label: 'Identificação de penhoras, hipotecas e usufrutos' },
                { icon: Compass, label: 'Dados de georreferenciamento (SIGEF/INCRA)' },
                { icon: Users, label: 'Rastreio completo da cadeia dominial' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-emerald-400 stroke-[1.8]" />
                  </div>
                  <span className="text-sm text-slate-300">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom stat row */}
          <div className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-6">
            {[
              { value: '+50k', label: 'Matrículas Processadas' },
              { value: '99,8%', label: 'Precisão Extrativa' },
              { value: '<10s', label: 'Diagnóstico Rápido' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-xl font-extrabold text-emerald-400">{value}</div>
                <div className="text-[11px] text-slate-500 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Auth Forms */}
      <div className="flex-1 flex flex-col">
        {/* Mobile top nav */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <FileCheck className="w-4 h-4 text-white stroke-[2]" />
            </div>
            <span className="text-lg font-extrabold text-slate-900">
              Valida<span className="text-emerald-600">Imóvel</span>
            </span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-slate-600 text-xs gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </Button>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-md space-y-6">

            {/* Header */}
            <div className="text-center space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Acesse a Plataforma</h1>
              <p className="text-sm text-slate-500">Entre ou crie sua conta para começar a analisar</p>
            </div>

            {/* How to access notice */}
            <Card className="border-emerald-200/80 bg-emerald-50/60 shadow-sm rounded-2xl">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm pt-1">Como obter acesso completo (6 Meses Ilimitados)</h3>
                </div>
                <div className="space-y-2 text-xs text-slate-600 pl-10">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-emerald-700 flex-shrink-0">1.</span>
                    <span>
                      <Link to="/pagamento-pix" className="font-semibold text-emerald-700 hover:underline">Realize o pagamento via PIX (R$ 49,90)</Link> no Mercado Pago
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-emerald-700 flex-shrink-0">2.</span>
                    <span>O Mercado Pago confirma a transação automaticamente via Webhook</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-emerald-700 flex-shrink-0">3.</span>
                    <span>Seu acesso ilimitado por 6 meses é liberado instantaneamente na tela <strong>sem necessidade de envio de comprovante!</strong></span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Auth Tabs */}
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-xl bg-slate-100 p-1">
                <TabsTrigger value="signin" className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Criar Conta
                </TabsTrigger>
              </TabsList>

              {/* Sign In */}
              <TabsContent value="signin" className="mt-4">
                <Card className="border-slate-200 shadow-sm rounded-2xl">
                  <CardHeader className="pb-4 text-center">
                    <CardTitle className="text-lg font-bold text-slate-900">Bem-vindo de volta</CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Entre com suas credenciais para acessar a plataforma
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSignIn}>
                    <CardContent className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="signin-email" className="text-sm font-semibold text-slate-700">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-9 h-11 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="signin-password" className="text-sm font-semibold text-slate-700">Senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="signin-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-9 h-11 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 flex flex-col gap-3">
                      <Button
                        type="submit"
                        className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 group"
                        disabled={formLoading}
                      >
                        {formLoading ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Entrando...</>
                        ) : (
                          <>Entrar na plataforma <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                        )}
                      </Button>
                      {!showResetForm && !showNewPasswordForm && (
                        <button
                          type="button"
                          onClick={() => setShowResetForm(true)}
                          className="text-xs text-emerald-700 hover:underline font-medium"
                        >
                          Esqueceu sua senha?
                        </button>
                      )}
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>

              {/* Sign Up */}
              <TabsContent value="signup" className="mt-4">
                <Card className="border-slate-200 shadow-sm rounded-2xl">
                  <CardHeader className="pb-4 text-center">
                    <CardTitle className="text-lg font-bold text-slate-900">Criar Conta</CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Crie sua conta gratuita para acessar a plataforma
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSignUp}>
                    <CardContent className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="signup-email" className="text-sm font-semibold text-slate-700">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-9 h-11 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="signup-password" className="text-sm font-semibold text-slate-700">Senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="Mínimo 8 caracteres"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-9 h-11 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                            required
                            minLength={8}
                          />
                        </div>
                        <p className="text-[11px] text-slate-400">A senha deve ter pelo menos 8 caracteres</p>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 flex flex-col gap-3">
                      <Button
                        type="submit"
                        className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 group"
                        disabled={formLoading}
                      >
                        {formLoading ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Criando conta...</>
                        ) : (
                          <>Criar conta <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                        )}
                      </Button>
                      <div className="text-center text-[11px] text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-200">
                        Para acesso completo,{' '}
                        <Link to="/pagamento-pix" className="font-semibold text-emerald-700 hover:underline">
                          realize o pagamento via PIX (R$ 49,90)
                        </Link>
                      </div>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Password Reset Form */}
            {showResetForm && (
              <Card className="border-slate-200 shadow-sm rounded-2xl mt-2">
                <CardHeader className="pb-4 text-center">
                  <CardTitle className="text-lg font-bold text-slate-900">Recuperar Senha</CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Digite seu email para receber instruções de redefinição
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleResetPassword}>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="reset-email" className="text-sm font-semibold text-slate-700">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9 h-11 rounded-xl border-slate-200"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowResetForm(false)} className="flex-1 rounded-xl">
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl" disabled={formLoading}>
                      {formLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : 'Enviar Email'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            )}

            {/* New Password Form */}
            {showNewPasswordForm && (
              <Card className="border-slate-200 shadow-sm rounded-2xl mt-2">
                <CardHeader className="pb-4 text-center">
                  <CardTitle className="text-lg font-bold text-slate-900">Nova Senha</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Defina sua nova senha de acesso</CardDescription>
                </CardHeader>
                <form onSubmit={handleUpdatePassword}>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="new-password" className="text-sm font-semibold text-slate-700">Nova senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Mínimo 8 caracteres"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pl-9 h-11 rounded-xl border-slate-200"
                          required
                          minLength={8}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirm-password" className="text-sm font-semibold text-slate-700">Confirmar senha</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirme sua nova senha"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-9 h-11 rounded-xl border-slate-200"
                          required
                          minLength={8}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button type="submit" className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl" disabled={formLoading}>
                      {formLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Atualizando...</> : 'Atualizar Senha'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            )}

            {/* Footer */}
            <p className="text-center text-[11px] text-slate-400">
              Ao continuar, você concorda com nossos{' '}
              <a href="#" className="text-emerald-700 hover:underline font-medium">Termos de Uso</a>{' '}
              e{' '}
              <a href="#" className="text-emerald-700 hover:underline font-medium">Política de Privacidade</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};