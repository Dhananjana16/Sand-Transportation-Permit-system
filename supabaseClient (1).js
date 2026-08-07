// Supabase connections — one independent client per portal, each with its
// own separate login session storage key. This means logging into GSMB,
// Police, and the SandPass App (Holder/Driver) are all completely
// independent — switching between portal tabs never logs you out of
// another one, since each keeps its own session in a different storage slot.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lifokskqmiogkwmdbxaa.supabase.co'
const supabaseKey = 'sb_publishable_P80FbbHYrtYiJ-Mv4OvfBA_TpzGBWTz'

// SandPass App — Permit Holder & Driver
export const supabaseApp = createClient(supabaseUrl, supabaseKey, {
  auth: { storageKey: 'sandpass-auth-app', persistSession: true, autoRefreshToken: true },
})

// GSMB Regional Officer Portal
export const supabaseGSMB = createClient(supabaseUrl, supabaseKey, {
  auth: { storageKey: 'sandpass-auth-gsmb', persistSession: true, autoRefreshToken: true },
})

// Sri Lanka Police Portal
export const supabasePolice = createClient(supabaseUrl, supabaseKey, {
  auth: { storageKey: 'sandpass-auth-police', persistSession: true, autoRefreshToken: true },
})

// Kept for any file that hasn't been migrated yet — defaults to the App client.
export const supabase = supabaseApp
