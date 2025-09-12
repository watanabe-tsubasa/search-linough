import { createClient } from '@supabase/supabase-js'
import { type Database } from '~/database.types'

// Vite exposes environment variables that need to be prefixed with `VITE_`
// when they are accessed on the client. Using `process.env` here causes the
// values to be undefined in the browser.
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_KEY!
)

