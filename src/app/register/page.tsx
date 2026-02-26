import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'

export default async function RegisterPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const params = await searchParams;
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50/50 dark:bg-zinc-950 p-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">FinancaSaaS</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Crie sua conta e comece agora.</p>
                </div>
                <Card className="border-none shadow-xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle>Criar Conta</CardTitle>
                        <CardDescription>
                            Dados seguros. Organização garantida.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {params?.error && (
                            <div className="mb-4 flex p-3 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300 rounded-md text-sm items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <p>{params.error}</p>
                            </div>
                        )}
                        <form action="/auth/register" method="post" className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome completo</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Seu Nome"
                                    required
                                />
                            </div>
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
                                <Label htmlFor="password">Senha</Label>
                                <Input id="password" name="password" type="password" required />
                            </div>
                            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                Criar conta
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <div className="text-sm text-zinc-500 mt-4 text-center">
                            Já tem uma conta?{' '}
                            <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-500">
                                Entrar
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
