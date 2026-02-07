import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function TestRolePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Role Debug</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify({ user: user?.id, profile, error }, null, 2)}
      </pre>
    </div>
  )
}
