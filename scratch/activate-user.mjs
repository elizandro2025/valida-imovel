// Script para ativar e liberar acesso imediato para claudiarozales@gmail.com no Supabase
const SUPABASE_URL = 'https://zrfawkiaayajpodrhlfr.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyZmF3a2lhYXlhanBvZHJobGZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MDA5MTYsImV4cCI6MjA3MTM3NjkxNn0.DafALkXivgqEQTttzHGxrEh2388UkpF5sfruLSxK6tw';

const TARGET_EMAIL = 'claudiarozales@gmail.com';
const EXPIRES_AT = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

async function activateUser() {
  console.log(`🚀 Ativando assinatura para ${TARGET_EMAIL}...`);

  // 1. Tentar criar conta se não existir no Auth
  const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: TARGET_EMAIL,
      password: '@ValidaImovel2026',
      data: { full_name: 'Claudia Rozales' }
    }),
  });

  const signupData = await signupRes.json();
  console.log('Resultado Auth Signup:', signupData);

  const userId = signupData.user?.id || signupData.id || null;

  // 2. Inserir / Atualizar perfil na tabela profiles
  const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      ...(userId ? { user_id: userId } : {}),
      email: TARGET_EMAIL,
      full_name: 'Claudia Rozales',
      has_subscription: true,
      subscription_status: 'active',
      subscription_plan: 'Plano 3 Meses PIX',
      subscription_expires_at: EXPIRES_AT,
      updated_at: new Date().toISOString(),
    }),
  });

  console.log('Status Upsert Profile:', profileRes.status);
  const text = await profileRes.text();
  console.log('Resposta Upsert Profile:', text);
  console.log('✅ Usuária ativada com sucesso!');
}

activateUser().catch(console.error);
