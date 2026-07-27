// Script para criar conta admin master no Supabase
// Executar: node setup-admin.mjs

const SUPABASE_URL = 'https://zrfawkiaayajpodrhlfr.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyZmF3a2lhYXlhanBvZHJobGZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MDA5MTYsImV4cCI6MjA3MTM3NjkxNn0.DafALkXivgqEQTttzHGxrEh2388UkpF5sfruLSxK6tw';

const ADMIN_EMAIL = 'elizandro.aquino@outlook.com';
const ADMIN_PASSWORD = '@1Doc_22';

async function createAdminUser() {
  console.log('\n🚀 Configurando conta Admin Master no Supabase...\n');

  // Step 1: Criar a conta via signup
  console.log('📧 Criando conta com email:', ADMIN_EMAIL);
  const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      data: { full_name: 'Elizandro Aquino' }
    }),
  });

  const signupData = await signupRes.json();

  if (signupData.error) {
    if (signupData.error.message?.includes('already registered') || 
        signupData.msg?.includes('already registered')) {
      console.log('ℹ️  Conta já existe. Tentando fazer login...');
    } else {
      console.error('❌ Erro ao criar conta:', signupData.error?.message || signupData.msg);
    }
  } else {
    console.log('✅ Conta criada com sucesso! ID:', signupData.user?.id || signupData.id);
  }

  // Step 2: Fazer login para obter a session
  console.log('\n🔐 Fazendo login para obter token...');
  const signinRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  const signinData = await signinRes.json();

  if (signinData.error) {
    console.error('❌ Erro no login:', signinData.error_description || signinData.error);
    console.log('\n⚠️  Possível causa: email ainda não confirmado.');
    console.log('   Verifique sua caixa de entrada em', ADMIN_EMAIL);
    console.log('   Após confirmar, rode este script novamente.\n');
    return;
  }

  const { access_token, user } = signinData;
  console.log('✅ Login realizado! User ID:', user.id);

  // Step 3: Verificar/criar perfil com admin
  console.log('\n📋 Configurando perfil de administrador...');
  
  // Primeiro tenta buscar o perfil
  const profileGetRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${user.id}`, {
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
  });
  const profiles = await profileGetRes.json();

  let profileResult;
  if (profiles && profiles.length > 0) {
    // Atualizar perfil existente
    const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${user.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        has_subscription: true,
        subscription_status: 'active',
        role: 'admin',
        full_name: 'Elizandro Aquino',
      }),
    });
    profileResult = await updateRes.json();
    console.log('✅ Perfil atualizado para ADMIN!');
  } else {
    // Criar novo perfil
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        user_id: user.id,
        has_subscription: true,
        subscription_status: 'active',
        role: 'admin',
        full_name: 'Elizandro Aquino',
      }),
    });
    profileResult = await insertRes.json();
    console.log('✅ Perfil de ADMIN criado!');
  }

  if (profileResult?.error) {
    console.warn('⚠️  Aviso no perfil:', profileResult.error.message);
    console.log('   O perfil pode precisar ser ajustado manualmente no Supabase Dashboard.');
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('✅  CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!');
  console.log('═══════════════════════════════════════════════');
  console.log('📧  Email:    elizandro.aquino@outlook.com');
  console.log('🔑  Senha:    @1Doc_22');
  console.log('🛡️   Papel:    ADMIN MASTER');
  console.log('🌐  Acesso:   http://localhost:8080/auth');
  console.log('⚙️   Admin:    http://localhost:8080/admin');
  console.log('═══════════════════════════════════════════════\n');
}

createAdminUser().catch(console.error);
