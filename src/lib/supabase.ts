// Supabase senkron katmanı.
// Env değişkenleri (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)
// tanımlıysa bulut senkronu devreye girer. Yoksa uygulama localStorage ile çalışır.
import type { StoreData } from './types'
import type { SupabaseClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(URL && ANON)

let clientPromise: Promise<SupabaseClient | null> | null = null

async function getClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return null
  if (!clientPromise) {
    clientPromise = (async () => {
      const { createClient } = await import('@supabase/supabase-js')
      const client = createClient(URL!, ANON!, {
        auth: { persistSession: true, autoRefreshToken: true },
      })
      // Anonim oturum: her cihaz kendi kullanıcısı olur, RLS auth.uid() ile satır izolasyonu sağlar
      const { data: sessionData } = await client.auth.getSession()
      if (!sessionData.session) {
        const { error } = await client.auth.signInAnonymously()
        if (error) {
          console.warn('Supabase anonim giriş başarısız, localStorage kullanılacak:', error.message)
          return null
        }
      }
      return client
    })()
  }
  return clientPromise
}

export async function cloudLoad(): Promise<StoreData | null> {
  const client = await getClient()
  if (!client) return null
  const { data: userData } = await client.auth.getUser()
  const uid = userData.user?.id
  if (!uid) return null
  const { data, error } = await client
    .from('app_state')
    .select('data')
    .eq('user_id', uid)
    .maybeSingle()
  if (error) {
    console.warn('Supabase yükleme hatası:', error.message)
    return null
  }
  return (data?.data as StoreData) ?? null
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

export function cloudSaveDebounced(state: StoreData): void {
  if (!isSupabaseConfigured) return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => { void cloudSave(state) }, 800)
}

async function cloudSave(state: StoreData): Promise<void> {
  const client = await getClient()
  if (!client) return
  const { data: userData } = await client.auth.getUser()
  const uid = userData.user?.id
  if (!uid) return
  const { error } = await client
    .from('app_state')
    .upsert({ user_id: uid, data: state, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  if (error) console.warn('Supabase kaydetme hatası:', error.message)
}
