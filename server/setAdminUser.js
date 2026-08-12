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

async function setAdminUser() {
  console.log('🔧 Updating User Tài Linh Lê Phạm to Super Admin on Supabase Cloud...');
  
  const adminUsers = [
    {
      id: 'usr_tailinh_admin',
      name: 'Tài Linh Lê Phạm',
      email: 'minhxuyen88@gmail.com',
      phone: '0988123456',
      password: 'admin',
      role_code: 'admin',
      role_name: 'Quản trị viên (Super Admin)',
      status: 'Hoạt động',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 'usr_tailinh_admin_2',
      name: 'Tài Linh Lê Phạm',
      email: 'tailinh@tinyhouse.vn',
      phone: '0988123456',
      password: 'admin',
      role_code: 'admin',
      role_name: 'Quản trị viên (Super Admin)',
      status: 'Hoạt động',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    }
  ];

  const { error } = await supabase.from('users').upsert(adminUsers);
  if (error) {
    console.error('❌ Error setting admin user:', error.message);
  } else {
    console.log('✅ Updated User Tài Linh Lê Phạm to Super Admin successfully!');
  }
}

setAdminUser();
