'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Landmark, MoreVertical, CreditCard } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { addBank, deleteBank } from '@/app/actions/banks';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

export type Bank = {
    id: string;
    name?: string;
    bank_name?: string;
    type?: string;
    account_type?: string;
    balance: number;
    lastSync?: string;
    last_sync?: string;
    icon?: string;
}

export default function BanksClient({ initialBanks }: { initialBanks: Bank[] }) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const calculateTotalBalance = () => {
        return initialBanks.reduce((acc, bank) => acc + bank.balance, 0);
    };

    const getIconColor = (color: string) => {
        switch (color) {
            case 'purple': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
            case 'orange': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
            case 'black': return 'text-zinc-800 bg-zinc-200 dark:text-zinc-300 dark:bg-zinc-800';
            default: return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Contas e Bancos</h2>
                    <p className="text-zinc-500 dark:text-zinc-400">Gerencie suas conexões bancárias e saldos manuais.</p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Conta
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Nova Conta</DialogTitle>
                            <DialogDescription>
                                Conecte seu banco (simulação) ou adicione uma conta manual.
                            </DialogDescription>
                        </DialogHeader>
                        <form action={async (formData) => {
                            startTransition(async () => {
                                const result = await addBank(formData);
                                if (result?.error) {
                                    toast.error('Erro ao adicionar conta', { description: result.error });
                                } else {
                                    toast.success('Conta adicionada com sucesso!');
                                    setIsAddOpen(false);
                                }
                            });
                        }}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="bankName">Nome da Instituição</Label>
                                    <Input id="bankName" name="bankName" placeholder="Ex: Inter, Bradesco, Dinheiro..." required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="accountType">Tipo de Conta</Label>
                                    <Select name="accountType" defaultValue="corrente">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="corrente">Conta Corrente</SelectItem>
                                            <SelectItem value="poupanca">Conta Poupança</SelectItem>
                                            <SelectItem value="investimento">Investimentos</SelectItem>
                                            <SelectItem value="dinheiro">Dinheiro Físico</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="balance">Saldo Inicial (R$)</Label>
                                    <Input id="balance" name="balance" type="number" step="0.01" placeholder="0.00" required />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                    {isPending ? 'Salvando...' : 'Salvar Conta'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="col-span-full md:col-span-1 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-100 flex items-center justify-between">
                            Patrimônio Total
                            <Landmark className="h-4 w-4 text-emerald-200" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{formatCurrency(calculateTotalBalance())}</div>
                        <p className="text-xs text-emerald-100/80 mt-1">Em {initialBanks.length} contas conectadas</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mt-6">
                {initialBanks.length > 0 ? initialBanks.map((bank) => (
                    <Card key={bank.id} className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-4 right-4 flex items-center gap-2 text-zinc-400 hover:text-zinc-600">
                            <button
                                onClick={() => {
                                    startTransition(async () => {
                                        if (confirm("Tem certeza que deseja excluir esta conta?")) {
                                            const result = await deleteBank(bank.id);
                                            if (result?.error) toast.error('Erro ao excluir', { description: result.error });
                                            else toast.success('Conta excluída.');
                                        }
                                    });
                                }}
                                disabled={isPending}
                                className="hover:text-red-500"
                                title="Excluir Conta"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <div className={`p-3 rounded-xl ${getIconColor(bank.icon || '')}`}>
                                <Landmark className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{bank.bank_name || bank.name}</CardTitle>
                                <CardDescription className="capitalize">{bank.account_type || bank.type}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="mt-4">
                            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(bank.balance)}</div>
                        </CardContent>
                        <CardFooter className="bg-zinc-50 dark:bg-zinc-950/50 py-3 mt-4 flex items-center justify-between border-t dark:border-zinc-800">
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                Sincronizado há 2h
                            </span>
                            <Button variant="ghost" size="sm" className="h-8 text-xs text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400">
                                Ver extrato
                            </Button>
                        </CardFooter>
                    </Card>
                )) : (
                    <div className="col-span-full py-12 text-center text-zinc-500 border border-dashed rounded-xl dark:border-zinc-800">
                        Nenhuma conta conectada ainda. Clique em "Adicionar Conta" para começar.
                    </div>
                )}
            </div>
        </div>
    );
}
