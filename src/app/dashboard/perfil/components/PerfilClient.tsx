'use client';

import { useState, useTransition, useContext } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { PreferencesContext } from '@/components/theme-provider';

export type UserProfile = {
    id: string;
    name: string | null;
    email: string | null;
    avatar_url: string | null;
}

export default function PerfilClient({ initialProfile, userEmail }: { initialProfile: UserProfile | null, userEmail: string }) {
    const [isPendingProfile, startTransitionProfile] = useTransition();
    const [isPendingPassword, startTransitionPassword] = useTransition();

    const { theme, setTheme } = useTheme();
    const { themeColor, setThemeColor, fontSize, setFontSize } = useContext(PreferencesContext);

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
                <p className="text-zinc-500 dark:text-zinc-400">Personalize seu perfil e a aparência do painel.</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
                    <TabsTrigger value="appearance">Aparência</TabsTrigger>
                    <TabsTrigger value="security">Segurança</TabsTrigger>
                </TabsList>

                {/* --- TAB: MEU PERFIL --- */}
                <TabsContent value="profile">
                    <Card className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 shadow-sm">
                        <CardHeader>
                            <CardTitle>Dados Pessoais</CardTitle>
                            <CardDescription>
                                Atualize seu nome e outras informações da sua conta.
                            </CardDescription>
                        </CardHeader>
                        <form action={(formData) => {
                            startTransitionProfile(async () => {
                                const { updateProfile } = await import('@/app/actions/profile');
                                const result = await updateProfile(formData);
                                if (result?.error) {
                                    toast.error('Erro ao salvar', { description: result.error });
                                } else {
                                    toast.success('Perfil atualizado com sucesso!');
                                }
                            });
                        }}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={initialProfile?.email || userEmail}
                                        disabled
                                        className="bg-zinc-50 dark:bg-zinc-900/50"
                                    />
                                    <p className="text-xs text-zinc-500">Seu email não pode ser alterado por aqui no momento.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome Completo</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={initialProfile?.name || ''}
                                        placeholder="Seu nome completo"
                                        required
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t dark:border-zinc-800 px-6 py-4">
                                <Button type="submit" disabled={isPendingProfile} className="bg-primary text-primary-foreground ml-auto">
                                    {isPendingProfile ? 'Salvando...' : 'Salvar Perfil'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                {/* --- TAB: APARÊNCIA --- */}
                <TabsContent value="appearance">
                    <Card className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 shadow-sm">
                        <CardHeader>
                            <CardTitle>Preferências do Painel</CardTitle>
                            <CardDescription>
                                Ajuste as cores, modo escuro e tamanho da fonte.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label>Modo de Exibição</Label>
                                <Select value={theme} onValueChange={(val) => setTheme(val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tema" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">Claro</SelectItem>
                                        <SelectItem value="dark">Escuro</SelectItem>
                                        <SelectItem value="system">Sistema</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label>Cor de Destaque</Label>
                                <Select value={themeColor} onValueChange={(val) => setThemeColor(val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a cor principal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="emerald">Verde Esmeralda</SelectItem>
                                        <SelectItem value="blue">Azul Oceano</SelectItem>
                                        <SelectItem value="violet">Ultravioleta</SelectItem>
                                        <SelectItem value="rose">Rosa Carmesim</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-zinc-500">A cor primária usada em botões e destaques.</p>
                            </div>

                            <div className="space-y-3">
                                <Label>Tamanho da Fonte</Label>
                                <Select value={fontSize} onValueChange={(val) => setFontSize(val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tamanho" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sm">Pequeno</SelectItem>
                                        <SelectItem value="base">Padrão</SelectItem>
                                        <SelectItem value="lg">Grande</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- TAB: SEGURANÇA --- */}
                <TabsContent value="security">
                    <Card className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 shadow-sm">
                        <CardHeader>
                            <CardTitle>Segurança</CardTitle>
                            <CardDescription>
                                Altere sua senha de acesso.
                            </CardDescription>
                        </CardHeader>
                        <form action={(formData) => {
                            startTransitionPassword(async () => {
                                const { updatePassword } = await import('@/app/actions/profile');
                                const result = await updatePassword(formData);
                                if (result?.error) {
                                    toast.error('Erro ao alterar senha', { description: result.error });
                                } else {
                                    toast.success('Senha atualizada com sucesso!');
                                    (document.getElementById('password-form') as HTMLFormElement)?.reset();
                                }
                            });
                        }} id="password-form">
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Nova Senha</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="Min. 6 caracteres"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t dark:border-zinc-800 px-6 py-4">
                                <Button type="submit" disabled={isPendingPassword} className="bg-primary text-primary-foreground ml-auto">
                                    {isPendingPassword ? 'Atualizando...' : 'Atualizar Senha'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
