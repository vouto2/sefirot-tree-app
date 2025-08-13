import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import TemplateListClient from '@/components/templates/TemplateListClient'

interface Template {
  id: string
  name: string
  title_template: string | null
  body_template: string | null
  tags_template: string | null
  created_at: string
  updated_at: string
}

export default async function TemplatesPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Redirect to login or show unauthorized message
    return <p>Unauthorized. Please log in.</p>
  }

  const { data: templates, error } = await supabase
    .from('templates')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching templates:', error)
    return <p>Error loading templates: {error.message}</p>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">テンプレート管理</h1>
      <TemplateListClient initialTemplates={templates as Template[]} />
    </div>
  )
}