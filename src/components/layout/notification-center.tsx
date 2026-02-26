'use client'

import { useState, useEffect, useTransition } from 'react'
import { Bell, Check, Trash2, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Notification, getNotifications, markAsRead, markAllAsRead } from '@/app/actions/notifications'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isPending, startTransition] = useTransition()

    const fetchNotifications = async () => {
        const data = await getNotifications()
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.is_read).length)
    }

    useEffect(() => {
        fetchNotifications()
        // Poll every 10 seconds for new notifications (MVP real-time)
        const interval = setInterval(fetchNotifications, 10000)
        return () => clearInterval(interval)
    }, [])

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id)
        fetchNotifications()
    }

    const handleMarkAllAsRead = async () => {
        startTransition(async () => {
            await markAllAsRead()
            fetchNotifications()
        })
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />
            case 'error': return <XCircle className="h-4 w-4 text-red-500" />
            default: return <Info className="h-4 w-4 text-blue-500" />
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500"></span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 dark:bg-zinc-900 dark:border-zinc-800" align="end">
                <div className="flex items-center justify-between border-b dark:border-zinc-800 px-4 py-3">
                    <h4 className="font-semibold text-sm">Notificações</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-500 dark:hover:bg-emerald-900/20"
                            onClick={handleMarkAllAsRead}
                            disabled={isPending}
                        >
                            Marcar todas como lidas
                        </Button>
                    )}
                </div>
                <div className="max-h-[350px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {notifications.length > 0 ? (
                        <div className="flex flex-col">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`flex gap-3 px-4 py-3 border-b dark:border-zinc-800 transition-colors ${notification.is_read ? 'opacity-70' : 'bg-zinc-50/50 dark:bg-zinc-800/30'}`}
                                >
                                    <div className="mt-0.5 shrink-0">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={`text-sm leading-none ${notification.is_read ? 'font-normal' : 'font-semibold'}`}>
                                                {notification.title}
                                            </p>
                                            {!notification.is_read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="text-zinc-400 hover:text-emerald-600 transition-colors"
                                                    title="Marcar como lida"
                                                >
                                                    <Check className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 uppercase">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ptBR })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[300px] text-center p-6 text-zinc-500">
                            <Bell className="h-10 w-10 mb-2 opacity-20" />
                            <p className="text-sm">Nenhuma notificação por enquanto.</p>
                        </div>
                    )}
                </div>
                <div className="p-2 border-t dark:border-zinc-800 text-center">
                    <Button variant="ghost" size="sm" className="w-full text-xs text-zinc-500" disabled>
                        Ver tudo
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
