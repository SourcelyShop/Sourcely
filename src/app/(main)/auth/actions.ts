'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        redirect(`/login?error=${error.message}`)
    }

    // Check if user exists in public.users
    if (data.user) {
        const { data: publicUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', data.user.id)
            .single()

        if (!publicUser) {
            // User authenticated but has no public profile (deleted?)
            await supabase.auth.signOut()
            redirect('/login?error=Account not found. Please contact support.')
        }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name,
            },
        },
    })

    if (error) {
        redirect('/signup?error=Could not create user')
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=check_email')
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
