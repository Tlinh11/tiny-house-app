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
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Supabase configuration missing!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const sampleUnsplashImages = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
];

async function run() {
  console.log('🚀 Starting Migration of Images to NEW Supabase Storage:', SUPABASE_URL);

  // 1. Create or verify bucket
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some(b => b.name === 'room-images')) {
    console.log('📁 Creating public bucket [room-images]...');
    await supabase.storage.createBucket('room-images', { public: true });
  }

  // 2. Upload sample images to new Supabase Bucket
  console.log('📦 Uploading high-res apartment images into new Supabase bucket...');
  const newPublicUrls = [];
  for (let i = 0; i < sampleUnsplashImages.length; i++) {
    try {
      const resp = await fetch(sampleUnsplashImages[i]);
      const blob = await resp.arrayBuffer();
      const fileName = `room_sample_${i + 1}.jpg`;

      const { error } = await supabase.storage.from('room-images').upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true
      });

      if (!error) {
        const { data: urlData } = supabase.storage.from('room-images').getPublicUrl(fileName);
        newPublicUrls.push(urlData.publicUrl);
        console.log(`  ✅ Uploaded: ${fileName} -> ${urlData.publicUrl}`);
      }
    } catch (e) {
      console.error(`  ❌ Failed uploading image ${i + 1}:`, e.message);
    }
  }

  if (newPublicUrls.length === 0) {
    console.error('❌ Could not upload sample images');
    return;
  }

  // 3. Update Database Tables in Supabase (buildings & rooms)
  console.log('\n🔄 Updating Supabase DB [buildings] table with NEW Supabase image URLs...');
  const { data: bList } = await supabase.from('buildings').select('*');
  if (bList && bList.length > 0) {
    for (let idx = 0; idx < bList.length; idx++) {
      const b = bList[idx];
      const coverImage = newPublicUrls[idx % newPublicUrls.length];
      const images = [
        newPublicUrls[idx % newPublicUrls.length],
        newPublicUrls[(idx + 1) % newPublicUrls.length],
        newPublicUrls[(idx + 2) % newPublicUrls.length]
      ];

      await supabase.from('buildings').update({
        cover_image: coverImage,
        images: images
      }).eq('id', b.id);
    }
    console.log(`  ✅ Updated ${bList.length} buildings in Supabase!`);
  }

  console.log('\n🔄 Updating Supabase DB [rooms] table with NEW Supabase image URLs...');
  const { data: rList } = await supabase.from('rooms').select('*');
  if (rList && rList.length > 0) {
    for (let idx = 0; idx < rList.length; idx++) {
      const r = rList[idx];
      const images = [
        newPublicUrls[idx % newPublicUrls.length],
        newPublicUrls[(idx + 1) % newPublicUrls.length]
      ];

      await supabase.from('rooms').update({
        images: images
      }).eq('id', r.id);
    }
    console.log(`  ✅ Updated ${rList.length} rooms in Supabase!`);
  }

  // 4. Update local dataStore.json
  const storePath = path.join(__dirname, 'dataStore.json');
  if (fs.existsSync(storePath)) {
    console.log('\n🔄 Syncing server/dataStore.json with new image URLs...');
    const store = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
    
    if (store.buildings) {
      store.buildings = store.buildings.map((b, idx) => ({
        ...b,
        coverImage: newPublicUrls[idx % newPublicUrls.length],
        images: [
          newPublicUrls[idx % newPublicUrls.length],
          newPublicUrls[(idx + 1) % newPublicUrls.length],
          newPublicUrls[(idx + 2) % newPublicUrls.length]
        ]
      }));
    }

    if (store.rooms) {
      store.rooms = store.rooms.map((r, idx) => ({
        ...r,
        images: [
          newPublicUrls[idx % newPublicUrls.length],
          newPublicUrls[(idx + 1) % newPublicUrls.length]
        ]
      }));
    }

    fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf-8');
    console.log('  ✅ Local dataStore.json synced!');
  }

  console.log('\n🎉 ALL IMAGES SUCCESSFULLY MIGRATED TO NEW SUPABASE STORAGE & DATABASE!');
}

run();
