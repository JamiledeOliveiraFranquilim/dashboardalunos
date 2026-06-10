import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://umllrqhvowxxjuiypldo.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtbGxycWh2b3d4eGp1aXlwbGRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMzYyNDEsImV4cCI6MjA5NjYxMjI0MX0.oXVyyf3FGDzlncS0SSm3RRVgeajN1oFbkBpEkBx17Po"

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variaveis de ambiente do Supabase nao configuradas')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)