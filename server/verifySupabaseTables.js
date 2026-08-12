import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function verifyTables() {
  console.log('🔍 Checking Supabase PostgreSQL Tables...');
  const tables = ['roles', 'users', 'buildings', 'rooms', 'bookings', 'commissions'];

  for (const tbl of tables) {
    const { data, error, count } = await supabase.from(tbl).select('*', { count: 'exact' });
    if (error) {
      console.error(`❌ Table "${tbl}": ERROR -> ${error.message}`);
    } else {
      console.log(`✅ Table "${tbl}": EXISTS (${data.length} rows)`);
    }
  }
}

verifyTables();
