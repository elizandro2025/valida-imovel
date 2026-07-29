import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, Mail, Lock, ShieldCheck, CheckCircle2, ArrowRight,
  Key, FileCheck, ArrowLeft, FileText, Users, Compass, LogOut, Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AuthPage: React.FC = () => {
  const { user, signIn, signUp, resetPassword, updatePassword, signOut, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [showNewPasswordForm, setShowNewPasswordForm] = useState(false);

  useEffect(() => {
    const isReset = searchParams.get('reset') === 'true';
    if (isReset) setShowNewPasswordForm(true);
  }, [searchParams]);

  // Handler para Sign In (Login)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Campos obrigatórios', description: 'Preencha e-mail e senha para continuar.', variant: 'destructive' });
      return;
    }
    setFormLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        let msg = error.message || 'Erro no login. Verifique suas credenciais.';
        const lower = (error.message || '').toLowerCase();
        if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials')) {
          msg = 'E-mail ou senha incorretos.';
        } else if (lower.includes('email not confirmed')) {
          msg = 'Por favor, confirme seu e-mail para acessar.';
        } else if (lower.includes('too many requests')) {
          msg = 'Muitas tentativas. Tente novamente em alguns minutos.';
        }
        toast({ title: 'Erro no login', description: msg, variant: 'destructive' });
      } else {
        toast({ title: 'Bem-vindo!', description: 'Login realizado com sucesso.' });
        navigate('/app');
      }
    } catch (err: any) {
      console.error('Erro no handleSignIn:', err);
      toast({ title: 'Erro no login', description: err?.message || 'Verifique suas credenciais e tente novamente.', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  // Handler para Sign Up (Cadastro)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Campos obrigatórios', description: 'Preencha e-mail e senha para continuar.', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Senha muito curta', description: 'A senha deve ter pelo menos 6 caracteres.', variant: 'destructive' });
      return;
    }
    setFormLoading(true);
    try {
      const { error } = await signUp(email, password, name);
      if (error) {
        let msg = error.message || 'Erro ao criar conta. Tente novamente.';
        const lower = (error.message || '').toLowerCase();
        if (lower.includes('already registered') || lower.includes('already exists') || lower.includes('user_already_exists') || lower.includes('registered')) {
          msg = 'Este e-mail já está cadastrado. Clique no botão "Entrar" acima para acessar sua conta.';
        } else if (lower.includes('invalid email')) {
          msg = 'E-mail inválido. Verifique o endereço digitado.';
        }
        toast({ title: 'Erro no cadastro', description: msg, variant: 'destructive' });
      } else {
        toast({ title: 'Conta criada com sucesso!', description: 'Selecione a forma de pagamento para liberar o seu acesso.' });
        navigate('/pagamento-pix');
      }
    } catch (err: any) {
      toast({ title: 'Erro inesperado', description: err?.message || 'Ocorreu um erro ao criar conta.', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  // Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: 'E-mail obrigatório', description: 'Digite seu e-mail para receber as instruções.', variant: 'destructive' });
      return;
    }
    setFormLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        toast({ title: 'Erro ao enviar e-mail', description: 'Verifique o endereço e tente novamente.', variant: 'destructive' });
      } else {
        toast({ title: 'E-mail enviado!', description: 'Verifique sua caixa de entrada para redefinir a senha.' });
        setShowResetForm(false);
      }
    } catch {
      toast({ title: 'Erro inesperado', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  // Update Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast({ title: 'Campos obrigatórios', description: 'Digite a nova senha e confirme.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Senhas não conferem', description: 'A confirmação deve ser idêntica à senha.', variant: 'destructive' });
      return;
    }
    setFormLoading(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        toast({ title: 'Erro ao atualizar', description: 'Não foi possível alterar a senha.', variant: 'destructive' });
      } else {
        toast({ title: 'Senha atualizada!', description: 'Sua senha foi redefinida com sucesso.' });
        setShowNewPasswordForm(false);
        window.location.href = '/app';
      }
    } catch {
      toast({ title: 'Erro inesperado', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          </div>
          <p className="text-slate-400 text-sm font-medium">Carregando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se o usuário já estiver conectado, exibe tela de status em vez de redirecionar sem aviso
  if (user && !showNewPasswordForm) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-slate-800 bg-slate-900/90 rounded-3xl p-6 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1">
              Conectado
            </Badge>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Você já está autenticado!
            </h2>
            <p className="text-xs text-slate-400">
              Conectado como <strong className="text-white">{user.email}</strong>
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Link to="/app" className="block">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-5 rounded-xl shadow-lg gap-2">
                Ir para o Workspace de Auditoria <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              onClick={() => signOut()}
              variant="outline"
              className="w-full border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 font-bold text-xs py-5 rounded-xl gap-2"
            >
              <LogOut className="w-4 h-4" /> Sair da Conta (Desconectar)
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col lg:flex-row antialiased selection:bg-emerald-500 selection:text-white">
      {/* Left Panel — Branding Dark */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden bg-slate-900 border-r border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-black">
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              Valida<span className="text-emerald-400">Imóvel</span>
            </span>
          </Link>

          <div className="space-y-8 max-w-sm">
            <div className="space-y-4">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs font-bold">
                IA Registrária Notarial 2.0
              </Badge>
              <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight tracking-tight">
                Auditoria e Due Diligence com <span className="text-emerald-400">Inteligência Artificial</span>.
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Extraia a cadeia dominial, identifique gravames, penhoras (CNIB) e emita pareceres jurídicos em segundos.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { icon: FileText, label: 'Análise automática dos 12 Módulos Notariais' },
                { icon: ShieldCheck, label: 'Detecção de penhoras, hipotecas e indisponibilidades' },
                { icon: Compass, label: 'Auditoria de área, confrontações e usucapião' },
                { icon: Users, label: 'Cadeia dominial cronológica de proprietários' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-xs text-slate-300 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            © {new Date().getFullYear()} ValidaImóvel — Todos os direitos reservados.
          </div>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 max-w-md mx-auto w-full lg:max-w-none lg:mx-0">
        
        <div className="flex items-center justify-between lg:justify-end">
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-white">ValidaImóvel</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-900 text-xs gap-1.5 font-bold rounded-xl">
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao site
            </Button>
          </Link>
        </div>

        <div className="my-auto py-8 lg:max-w-md lg:mx-auto w-full">
          <Card className="border-slate-800 bg-slate-900/90 text-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-black text-white tracking-tight">
                {showResetForm ? 'Recuperar Senha' : showNewPasswordForm ? 'Nova Senha' : 'Acessar Conta'}
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                {showResetForm
                  ? 'Digite seu e-mail para receber as instruções de recuperação.'
                  : showNewPasswordForm
                  ? 'Digite sua nova senha de acesso.'
                  : 'Entre com suas credenciais ou crie sua conta gratuitamente.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {showResetForm ? (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-300">E-mail</Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <Input
                        type="email"
                        placeholder="seu.email@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-white pl-9 text-xs h-10 rounded-xl focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={formLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs h-11 rounded-xl shadow-lg gap-2"
                  >
                    {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Instruções'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowResetForm(false)}
                    className="w-full text-slate-400 hover:text-white text-xs font-bold"
                  >
                    Voltar ao Login
                  </Button>
                </form>
              ) : showNewPasswordForm ? (
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-300">Nova Senha</Label>
                    <Input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white text-xs h-10 rounded-xl focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-300">Confirmar Nova Senha</Label>
                    <Input
                      type="password"
                      placeholder="Repita a nova senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white text-xs h-10 rounded-xl focus:border-emerald-500"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={formLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs h-11 rounded-xl shadow-lg gap-2"
                  >
                    {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Atualizar Senha'}
                  </Button>
                </form>
              ) : (
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-2xl mb-4">
                    <TabsTrigger value="signin" className="text-xs font-bold rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                      Entrar
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="text-xs font-bold rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                      Criar Conta
                    </TabsTrigger>
                  </TabsList>

                  {/* TAB LOGIN */}
                  <TabsContent value="signin" className="space-y-4 mt-0">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-300">E-mail</Label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                          <Input
                            type="email"
                            placeholder="seu.email@exemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-white pl-9 text-xs h-10 rounded-xl focus:border-emerald-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold text-slate-300">Senha</Label>
                          <button
                            type="button"
                            onClick={() => setShowResetForm(true)}
                            className="text-[11px] text-emerald-400 hover:underline font-bold"
                          >
                            Esqueceu a senha?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                          <Input
                            type="password"
                            placeholder="Sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-white pl-9 text-xs h-10 rounded-xl focus:border-emerald-500"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={formLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs h-11 rounded-xl shadow-lg gap-2 mt-2"
                      >
                        {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Entrar na Plataforma'}
                        {!formLoading && <ArrowRight className="w-4 h-4" />}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* TAB CADASTRO */}
                  <TabsContent value="signup" className="space-y-4 mt-0">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-300">Nome Completo</Label>
                        <Input
                          type="text"
                          placeholder="Seu nome"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-slate-950 border-slate-800 text-white text-xs h-10 rounded-xl focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-300">E-mail</Label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                          <Input
                            type="email"
                            placeholder="seu.email@exemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-white pl-9 text-xs h-10 rounded-xl focus:border-emerald-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-300">Senha (mínimo 6 caracteres)</Label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                          <Input
                            type="password"
                            placeholder="Crie uma senha forte"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-white pl-9 text-xs h-10 rounded-xl focus:border-emerald-500"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={formLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs h-11 rounded-xl shadow-lg gap-2 mt-2"
                      >
                        {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Minha Conta'}
                        {!formLoading && <ArrowRight className="w-4 h-4" />}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>

            <CardFooter className="border-t border-slate-800/80 pt-4 text-center justify-center">
              <p className="text-[11px] text-slate-500">
                Ao continuar, você concorda com os Termos de Serviço e Política de Privacidade.
              </p>
            </CardFooter>
          </Card>
        </div>

        <div className="text-center lg:hidden text-xs text-slate-600">
          © {new Date().getFullYear()} ValidaImóvel
        </div>
      </div>
    </div>
  );
};

export default AuthPage;