// scripts/create-master-admin.js
const readline = require('readline');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function hiddenQuestion(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    
    let input = '';
    
    process.stdin.on('data', (char) => {
      char = char.toString();
      
      if (char === '\n' || char === '\r' || char === '\u0004') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdout.write('\n');
        resolve(input);
      } else if (char === '\u0003') {
        process.exit();
      } else if (char === '\u007f') { // backspace
        if (input.length > 0) {
          input = input.slice(0, -1);
          process.stdout.write('\b \b');
        }
      } else {
        input += char;
        process.stdout.write('*');
      }
    });
  });
}

async function createMasterAdmin() {
  try {
    console.log('=== ConfereAi - Criação de Administrador Master ===\n');

    // Validar variáveis de ambiente
    const supabaseUrl = "https://hpsjwiwtgxmablqrfpkt.supabase.co"
    const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwc2p3aXd0Z3htYWJscXJmcGt0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQwMzQxNSwiZXhwIjoyMDcxOTc5NDE1fQ.wnvpFZgfDLfgLtd9T8CvxwjipX1CgfGeq2KS3klumnQ"

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Erro: Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
      console.log('\nCertifique-se de que o arquivo .env.local contém:');
      console.log('NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase');
      console.log('SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key');
      process.exit(1);
    }

    // Conectar ao Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Coletar dados do administrador
    const name = await question('Nome completo: ');
    const email = await question('Email: ');
    const matricula = await question('Matrícula: ');
    const password = await hiddenQuestion('Senha: ');
    const confirmPassword = await hiddenQuestion('Confirme a senha: ');

    // Validações
    if (!name || !email || !matricula || !password) {
      console.error('\n❌ Erro: Todos os campos são obrigatórios');
      process.exit(1);
    }

    if (password !== confirmPassword) {
      console.error('\n❌ Erro: As senhas não coincidem');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('\n❌ Erro: A senha deve ter pelo menos 6 caracteres');
      process.exit(1);
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('\n❌ Erro: Email inválido');
      process.exit(1);
    }

    console.log('\n⏳ Criando administrador master...');

    // Verificar se já existe admin com a mesma matrícula ou email
    const { data: existingAdmin } = await supabase
      .from('confereai_admins')
      .select('matricula, email')
      .or(`matricula.eq.${matricula},email.eq.${email}`)
      .single();

    if (existingAdmin) {
      console.error('\n❌ Erro: Já existe um administrador com essa matrícula ou email');
      process.exit(1);
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 12);

    // Inserir administrador
    const { data: newAdmin, error } = await supabase
      .from('confereai_admins')
      .insert({
        name,
        email,
        matricula,
        password_hash: passwordHash,
        role: 'super_admin'
      })
      .select()
      .single();

    if (error) {
      console.error('\n❌ Erro ao criar administrador:', error.message);
      process.exit(1);
    }

    console.log('\n✅ Administrador master criado com sucesso!');
    console.log('\n📋 Dados do administrador:');
    console.log(`   Nome: ${newAdmin.name}`);
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Matrícula: ${newAdmin.matricula}`);
    console.log(`   Função: ${newAdmin.role}`);
    console.log(`   ID: ${newAdmin.id}`);
    console.log('\n🚀 Agora você pode fazer login no sistema com sua matrícula e senha.');

  } catch (error) {
    console.error('\n❌ Erro inesperado:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Verificar se o script está sendo executado diretamente
if (require.main === module) {
  createMasterAdmin();
}

module.exports = createMasterAdmin;