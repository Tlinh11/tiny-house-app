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

async function initCommissions() {
  console.log('📌 Khởi tạo dữ liệu bảng Commissions...');
  const sampleCommissions = [
    {
      id: 'CMS-1001',
      ctv_id: 'usr_ctv_01',
      ctv_name: 'Tài Linh Lê Phạm',
      ctv_phone: '0988123456',
      building_code: 'TN007',
      room_number: '201',
      contract_value: 6000000,
      commission_rate: 50,
      commission_amount: 3000000,
      status: 'Đã duyệt',
      notes: 'Hợp đồng 6 tháng - Đã chuyển khoản'
    },
    {
      id: 'CMS-1002',
      ctv_id: 'usr_ctv_01',
      ctv_name: 'Tài Linh Lê Phạm',
      ctv_phone: '0988123456',
      building_code: 'DT007',
      room_number: '101',
      contract_value: 3600000,
      commission_rate: 50,
      commission_amount: 1800000,
      status: 'Chờ duyệt',
      notes: 'Khách vừa đặt cọc 1 tháng'
    }
  ];

  const { error } = await supabase.from('commissions').upsert(sampleCommissions);
  if (error) {
    console.error('⚠️ Lỗi khi khởi tạo Commissions:', error.message);
  } else {
    console.log('✅ Đã tạo dữ liệu mẫu cho bảng Commissions thành công!');
  }
}

initCommissions();
