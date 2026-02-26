import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string; error?: string }>
}) {
    const params = await searchParams;
    // In a real app, wire this to a server action that calls supabase.auth.signInWithPassword
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50/50 dark:bg-zinc-950 p-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">FinancaSaaS</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Bem-vindo de volta.</p>
                </div>
                <Card className="border-none shadow-xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle>Entrar</CardTitle>
                        <CardDescription>
                            Acesse sua conta para continuar organizando suas finanças.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {params?.error && (
                            <div className="mb-4 flex p-3 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300 rounded-md text-sm items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <p>{params.error}</p>
                            </div>
                        )}
                        {params?.message && (
                            <div className="mb-4 flex p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 rounded-md text-sm items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                                <p>{params.message}</p>
                            </div>
                        )}
                        <form action="/auth/login" method="post" className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Senha</Label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
                                    >
                                        Esqueceu a senha?
                                    </Link>
                                </div>
                                <Input id="password" name="password" type="password" required />
                            </div>
                            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                Entrar
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center flex-col gap-2">
                        <div className="text-sm text-zinc-500 mt-4 text-center">
                            Não tem uma conta?{' '}
                            <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-500">
                                Criar conta
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
