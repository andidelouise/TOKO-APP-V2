import { createClient } from '@supabase/supabase-js';

// Ambil environment variables yang sudah Anda siapkan di file .env.local
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Buat dan ekspor satu instance klien Supabase untuk digunakan di seluruh aplikasi
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
