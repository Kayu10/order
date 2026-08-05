// src/utils/supabase.js
import { createClient } from '@supabase/supabase-js'

// 從環境變數讀取 URL 與 金鑰
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase 環境變數未設定，請確認 .env 檔案中是否已設定 VITE_SUPABASE_URL 與 VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')