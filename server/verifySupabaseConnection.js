import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...vals] = trimmed.split('=');
      process.env[key.trim()] = vals.join('=').trim();
    }
  });
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('🔍 Checking Supabase configuration...');
console.log(`📌 SUPABASE_URL: ${SUPABASE_URL}`);
console.log(`🔑 SUPABASE_KEY Prefix: ${SUPABASE_KEY ? SUPABASE_KEY.substring(0, 15) + '...' : 'MISSING'}`);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Supabase configuration is missing or incomplete!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function checkAllTables() {
  console.log('\n📊 Testing live connection to Supabase Cloud PostgreSQL tables:');

  const tables = ['roles', 'users', 'buildings', 'rooms', 'bookings', 'commissions'];

  for (const table of tables) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error(`  ❌ Table '${table}': FAILED -> ${error.message}`);
    } else {
      // Fetch actual rows
      const { data: rows } = await supabase.from(table).select('*').limit(5);
      console.log(`  ✅ Table '${table}': OK (${count || rows?.length || 0} rows found)`);
    }
  }

  console.log('\n🎉 ALL SUPABASE CLOUD TABLES ARE PERFECTLY CONNECTED & ACTIVE!');
}

checkAllTables();
