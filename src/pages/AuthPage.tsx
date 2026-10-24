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
import { usePageMeta } from '@/hooks/usePageMeta';
import { Logo } from '@/components/Logo';

// Botão "Continuar com Google": ligar com VITE_GOOGLE_LOGIN=true depois de liberar a URL de retorno no Supabase
const GOOGLE_LOGIN = import.meta.env.VITE_GOOGLE_LOGIN === 'true';

export const AuthPage: React.FC = () => {
  const { user, signIn, signInWithGoogle, signUp, resetPassword, updatePassword, signOut, isLoading } = useAuth();
  usePageMeta(null, '/auth');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(
    tabParam === 'register' || tabParam === 'signup' ? 'signup' : 'signin'
  );

  useEffect(() => {
    if (tabParam === 'register' || tabParam === 'signup') {
      setActiveTab('signup');
    } else if (tabParam === 'login' || tabParam === 'signin') {
      setActiveTab('signin');
    }
  }, [tabParam]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  const handleGoogle = async () => {
    setFormLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({ title: 'Não foi possível entrar com Google', description: error.message, variant: 'destructive' });
      setFormLoading(false);
    }
  };
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
    } catch (err) {
      console.error('Erro no handleSignIn:', err);
      toast({ title: 'Erro no login', description: err instanceof Error && err.message ? err.message : 'Verifique suas credenciais e tente novamente.', variant: 'destructive' });
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
      const { error, needsConfirmation } = await signUp(email, password, name);
      if (!error && needsConfirmation) {
        toast({
          title: 'Confirme seu e-mail',
          description: 'Enviamos um link de confirmação para o seu e-mail. Clique nele e depois entre com sua senha.',
        });
        setActiveTab('signin');
      } else if (error) {
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
    } catch (err) {
      toast({ title: 'Erro inesperado', description: err instanceof Error && err.message ? err.message : 'Ocorreu um erro ao criar conta.', variant: 'destructive' });
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
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-success/20 border border-success/30 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-success" />
          </div>
          <p className="text-muted-foreground text-sm font-medium">Carregando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se o usuário já estiver conectado, exibe tela de status em vez de redirecionar sem aviso
  if (user && !showNewPasswordForm) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-border bg-card/90 rounded-3xl p-6 text-center space-y-6 shadow-medium">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-success/20 border border-success/30 flex items-center justify-center text-success">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <Badge className="bg-success/10 text-success border border-success/30 text-xs font-semibold px-3 py-1">
              Conectado
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Você já está autenticado!
            </h2>
            <p className="text-xs text-muted-foreground">
              Conectado como <strong className="text-foreground">{user.email}</strong>
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Link to="/app" className="block">
              <Button className="w-full bg-primary hover:bg-primary text-white font-semibold text-xs gap-2">
                Ir para o Workspace de Auditoria <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              onClick={() => signOut()}
              variant="outline"
              className="w-full border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted font-semibold text-xs py-5 rounded-xl gap-2"
            >
              <LogOut className="w-4 h-4" /> Sair da Conta (Desconectar)
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row antialiased selection:bg-primary selection:text-white">
      {/* Left Panel — Branding Dark */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden bg-card border-r border-border">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none hidden" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none hidden" />

        <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14">
          <Logo />

          <div className="space-y-8 max-w-sm">
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary border-primary/30 text-xs font-semibold">
                IA Registrária Notarial 2.0
              </Badge>
              <h2 className="text-3xl xl:text-4xl font-semibold text-foreground leading-tight tracking-tight">
                Auditoria e Due Diligence com <span className="text-primary">Inteligência Artificial</span>.
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Veja a cadeia dominial, os gravames e as penhoras de uma matrícula, com nota de risco, em poucos minutos.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { icon: FileText, label: 'Análise automática dos 12 Módulos Notariais' },
                { icon: ShieldCheck, label: 'Detecção de penhoras, hipotecas e indisponividades' },
                { icon: Compass, label: 'Auditoria de área, confrontações e usucapião' },
                { icon: Users, label: 'Cadeia dominial cronológica de proprietários' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted-foreground font-medium">
            © {new Date().getFullYear()} ValidaImóvel — Todos os direitos reservados.
          </div>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 max-w-md mx-auto w-full lg:max-w-none lg:mx-0">
        
        <div className="flex items-center justify-between lg:justify-end">
          <Logo className="lg:hidden" />
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-card text-xs gap-1.5 font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao site
            </Button>
          </Link>
        </div>

        <div className="my-auto py-8 lg:max-w-md lg:mx-auto w-full">
          <Card className="border-border bg-card/90 text-foreground rounded-3xl shadow-medium overflow-hidden backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-semibold text-foreground tracking-tight">
                {showResetForm ? 'Recuperar Senha' : showNewPasswordForm ? 'Nova Senha' : 'Acessar Conta'}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
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
                    <Label className="text-xs font-semibold text-muted-foreground">E-mail</Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="seu.email@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-background border-border text-foreground pl-9 text-xs h-10 rounded-xl focus:border-primary/30"
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={formLoading}
                    className="w-full bg-primary hover:bg-primary text-white font-semibold text-xs h-11 gap-2"
                  >
                    {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Instruções'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowResetForm(false)}
                    className="w-full text-muted-foreground hover:text-foreground text-xs font-semibold"
                  >
                    Voltar ao Login
                  </Button>
                </form>
              ) : showNewPasswordForm ? (
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">Nova Senha</Label>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-background border-border text-foreground text-xs h-10 rounded-xl focus:border-primary/30"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">Confirmar Nova Senha</Label>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder="Repita a nova senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-background border-border text-foreground text-xs h-10 rounded-xl focus:border-primary/30"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={formLoading}
                    className="w-full bg-primary hover:bg-primary text-white font-semibold text-xs h-11 gap-2"
                  >
                    {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Atualizar Senha'}
                  </Button>
                </form>
              ) : (
                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'signin' | 'signup')} className="w-full">
                  <TabsList className="grid grid-cols-2 p-1 bg-background border border-border rounded-2xl mb-4">
                    <TabsTrigger value="signin" className="text-xs font-bold rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                      Entrar
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="text-xs font-bold rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                      Criar Conta
                    </TabsTrigger>
                  </TabsList>

                  {GOOGLE_LOGIN && (
                    <div className="space-y-4 mb-4">
                      <Button type="button" variant="outline" onClick={handleGoogle} disabled={formLoading} className="w-full gap-2 h-11">
                        <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z" />
                          <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
                          <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1z" />
                          <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z" />
                        </svg>
                        Continuar com Google
                      </Button>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="h-px flex-1 bg-border" /> ou com e-mail <span className="h-px flex-1 bg-border" />
                      </div>
                    </div>
                  )}

                  {/* TAB LOGIN */}
                  <TabsContent value="signin" className="space-y-4 mt-0">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground">E-mail</Label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                          <Input
                            type="email"
                            autoComplete="email"
                            placeholder="seu.email@exemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-background border-border text-foreground pl-9 text-xs h-10 rounded-xl focus:border-primary/30"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold text-muted-foreground">Senha</Label>
                          <button
                            type="button"
                            onClick={() => setShowResetForm(true)}
                            className="text-xs text-primary hover:underline font-semibold py-3 -my-3"
                          >
                            Esqueceu a senha?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                          <Input
                            type="password"
                            autoComplete="current-password"
                            placeholder="Sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-background border-border text-foreground pl-9 text-xs h-10 rounded-xl focus:border-primary/30"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={formLoading}
                        className="w-full bg-primary hover:bg-primary text-white font-semibold text-xs h-11 gap-2 mt-2"
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
                        <Label className="text-xs font-semibold text-muted-foreground">Nome Completo</Label>
                        <Input
                          type="text"
                          autoComplete="name"
                          placeholder="Seu nome"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-background border-border text-foreground text-xs h-10 rounded-xl focus:border-primary/30"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground">E-mail</Label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                          <Input
                            type="email"
                            autoComplete="email"
                            placeholder="seu.email@exemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-background border-border text-foreground pl-9 text-xs h-10 rounded-xl focus:border-primary/30"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground">Senha (mínimo 6 caracteres)</Label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                          <Input
                            type="password"
                            autoComplete="new-password"
                            placeholder="Crie uma senha forte"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-background border-border text-foreground pl-9 text-xs h-10 rounded-xl focus:border-primary/30"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={formLoading}
                        className="w-full bg-primary hover:bg-primary text-white font-semibold text-xs h-11 gap-2 mt-2"
                      >
                        {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Minha Conta'}
                        {!formLoading && <ArrowRight className="w-4 h-4" />}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>

            <CardFooter className="border-t border-border pt-4 text-center justify-center">
              <p className="text-xs text-muted-foreground">
                Ao continuar, você concorda com os Termos de Serviço e Política de Privacidade.
              </p>
            </CardFooter>
          </Card>
        </div>

        <div className="text-center lg:hidden text-xs text-muted-foreground">
          © {new Date().getFullYear()} ValidaImóvel
        </div>
      </div>
    </div>
  );
};

export default AuthPage;