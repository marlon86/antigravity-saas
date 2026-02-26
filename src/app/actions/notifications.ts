'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export type Notification = {
    id: string
    user_id: string
    title: string
    message: string
    type: NotificationType
    is_read: boolean
    created_at: string
}

export async function createNotification(title: string, message: string, type: NotificationType = 'info') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from('notifications')
        .insert({
            user_id: user.id,
            title,
            message,
            type
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating notification:', error)
        return null
    }

    revalidatePath('/')
    return data
}

export async function getNotifications() {
    const supabase = await createClient()

    // Test notification - MUST work even if auth fails for this test
    const testNotification: Notification = {
        id: 'test-id-' + Date.now(),
        user_id: 'any',
        title: 'Teste de Notificação (Bypass Auth)',
        message: 'Se você está vendo isso, o problema é o getUser() na Server Action.',
        type: 'warning',
        is_read: false,
        created_at: new Date().toISOString()
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return [testNotification]
    }

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

    if (error) {
        console.error('Error fetching notifications:', error)
        return [testNotification]
    }

    return [testNotification, ...(data as Notification[])]
}

export async function markAsRead(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)

    if (error) {
        console.error('Error marking notification as read:', error)
        return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}

export async function markAllAsRead() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

    if (error) {
        console.error('Error marking all notifications as read:', error)
        return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}
