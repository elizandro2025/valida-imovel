-- ValidaImóvel — trava da assinatura, histórico de análises, uso da IA e pagamentos
-- Como aplicar: Supabase → SQL Editor → colar este arquivo inteiro → Run. Pode rodar mais de uma vez.
-- O banco é compartilhado com o app BUPi: tudo aqui usa o prefixo valida_ e não altera colunas existentes.

-- ─── 1. Assinatura só pode ser alterada pelo servidor ───────────────────────────
-- O site grava no próprio perfil com o login do usuário (ex.: e-mail). Sem esta trava, a mesma permissão
-- deixaria qualquer pessoa logada marcar has_subscription = true para si. Pelo SQL Editor ou pela chave
-- de serviço (webhook de pagamento e painel admin) a alteração continua permitida.
create or replace function public.valida_protege_assinatura()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Sem "security definer": current_user é o papel de quem fez a alteração (authenticated/anon pela API)
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.has_subscription := false;
      new.subscription_status := null;
      new.subscription_plan := null;
      new.subscription_expires_at := null;
      new.payment_id := null;
    else
      new.has_subscription := old.has_subscription;
      new.subscription_status := old.subscription_status;
      new.subscription_plan := old.subscription_plan;
      new.subscription_expires_at := old.subscription_expires_at;
      new.payment_id := old.payment_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists valida_protege_assinatura on public.profiles;
create trigger valida_protege_assinatura
  before insert or update on public.profiles
  for each row execute function public.valida_protege_assinatura();

-- ─── 2. Histórico de análises ("Minhas análises") ──────────────────────────────
-- Guarda o relatório (não o PDF). Cada pessoa vê e apaga só as próprias análises.
create table if not exists public.valida_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  file_name text,
  file_hash text,
  matricula text,
  cartorio text,
  score_risco integer,
  nivel_risco text,
  report jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists valida_analyses_user_created on public.valida_analyses (user_id, created_at desc);
alter table public.valida_analyses enable row level security;

drop policy if exists "valida_analyses: ver as próprias" on public.valida_analyses;
create policy "valida_analyses: ver as próprias" on public.valida_analyses
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "valida_analyses: criar as próprias" on public.valida_analyses;
create policy "valida_analyses: criar as próprias" on public.valida_analyses
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "valida_analyses: apagar as próprias" on public.valida_analyses;
create policy "valida_analyses: apagar as próprias" on public.valida_analyses
  for delete to authenticated using (auth.uid() = user_id);

-- ─── 3. Uso da IA (limite diário de uso justo e métricas do admin) ──────────────
-- Sem políticas: só o servidor (chave de serviço) lê e grava.
create table if not exists public.valida_ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  kind text not null check (kind in ('analise', 'tarefa', 'chat')),
  model text,
  ok boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists valida_ai_usage_user_kind_created on public.valida_ai_usage (user_id, kind, created_at desc);
create index if not exists valida_ai_usage_created on public.valida_ai_usage (created_at desc);
alter table public.valida_ai_usage enable row level security;

-- ─── 4. Pagamentos (comprovantes, receita, estornos e pagamentos sem usuário) ───
-- Gravado só pelo webhook; cada pessoa pode ler os próprios (para abrir o comprovante).
create table if not exists public.valida_payments (
  payment_id text primary key,
  user_id uuid references auth.users (id) on delete set null,
  customer_email text,
  value numeric(10, 2),
  billing_type text,
  status text not null,
  receipt_url text,
  invoice_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists valida_payments_user on public.valida_payments (user_id, created_at desc);
alter table public.valida_payments enable row level security;

drop policy if exists "valida_payments: ver os próprios" on public.valida_payments;
create policy "valida_payments: ver os próprios" on public.valida_payments
  for select to authenticated using (auth.uid() = user_id);

-- ─── Conferência (rode depois e veja o resultado) ───────────────────────────────
-- select tgname from pg_trigger where tgname = 'valida_protege_assinatura';
-- select tablename, policyname, cmd from pg_policies where tablename like 'valida_%' or tablename = 'profiles' order by 1, 2;
