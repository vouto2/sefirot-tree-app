import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// PUT method removed as per user's request

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

  // No user check needed as templates are global

  const { id } = params

  if (!id) {
    return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
  }

  const { error, count } = await supabase
    .from('templates')
    .delete()
    .eq('id', id)
    // Removed .eq('user_id', user.id) filter

  if (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (count === 0) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }

  return NextResponse.json({ message: 'Template deleted successfully' }, { status: 204 })
}