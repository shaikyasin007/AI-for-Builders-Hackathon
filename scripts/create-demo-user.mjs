/**
 * Creates the hackathon demo user in Supabase.
 * Requires: email confirmations OFF in Supabase Auth settings.
 *
 * Usage: node scripts/create-demo-user.mjs
 */
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const DEMO_EMAIL = 'demo@codeguardian.app'
const DEMO_PASSWORD = 'HackathonDemo2026!'
const DEMO_NAME = 'Hackathon Demo'

function loadEnv() {
  try {
    readFileSync('.env', 'utf8').split('\n').forEach((line) => {
      const m = line.match(/^([^#=]+)=(.*)$/)
      if (m) process.env[m[1].trim()] = m[2].trim()
    })
  } catch {
    console.error('Missing .env file')
    process.exit(1)
  }
}

loadEnv()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const supabase = createClient(url, key)

const { data, error } = await supabase.auth.signUp({
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD,
  options: {
    data: { full_name: DEMO_NAME },
  },
})

if (error) {
  console.error('Sign up failed:', error.message)
  console.log('\nIf user already exists, sign in at /login with:')
  console.log('  Email:', DEMO_EMAIL)
  console.log('  Password:', DEMO_PASSWORD)
  process.exit(1)
}

const userId = data.user?.id
if (userId) {
  await supabase.from('profiles').upsert({
    id: userId,
    full_name: DEMO_NAME,
    role: 'user',
  })
}

console.log('Demo account ready!')
console.log('  Email:   ', DEMO_EMAIL)
console.log('  Password:', DEMO_PASSWORD)
console.log('  Login:   /login')
if (!data.session) {
  console.log('\nNote: Enable "Confirm email" OFF in Supabase → Authentication → Providers → Email')
}
