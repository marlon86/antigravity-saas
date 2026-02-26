'use client';

import { useState, useTransition, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Landmark, MoreVertical, CreditCard, Trash2, FileText, Upload, Download, History } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { addBank, deleteBank } from '@/app/actions/banks';
import { getBankTransactions, uploadTransactions, Transaction } from '@/app/actions/transactions';

export type Bank = {
    id: string;
    bank_name?: string;
    name?: string;
    account_type?: string;
    type?: string;
    balance: number;
    currency?: string;
    last_sync?: string;
    icon?: string;
}

export default function BanksClient({ initialBanks }: { initialBanks: Bank[] }) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [viewingBank, setViewingBank] = useState<Bank | null>(null);
    const [bankTransactions, setBankTransactions] = useState<Transaction[]>([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
    const [isPending, startTransition] = useTransition();

    const formatCurrency = (value: number, currencyCode: string = 'BRL') => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currencyCode
        }).format(value);
    };

    const calculateTotalBalance = () => {
        // Warning: Total balance is a simple sum for now; in a real app, you'd convert everything to a base currency (like BRL)
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

    const loadTransactions = async (bankId: string) => {
        setIsLoadingTransactions(true);
        try {
            const data = await getBankTransactions(bankId);
            setBankTransactions(data as Transaction[]);
        } catch (error) {
            toast.error("Erro ao carregar transações");
        } finally {
            setIsLoadingTransactions(false);
        }
    };

    useEffect(() => {
        if (viewingBank) {
            loadTransactions(viewingBank.id);
        } else {
            setBankTransactions([]);
        }
    }, [viewingBank]);

    const handleImport = (formData: FormData) => {
        if (!viewingBank) return;
        formData.append('bankId', viewingBank.id);

        startTransition(async () => {
            const result = await uploadTransactions(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`${result.count} transações importadas com sucesso!`);
                loadTransactions(viewingBank.id);
            }
        });
    };

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
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="accountType">Tipo</Label>
                                        <Select name="accountType" defaultValue="corrente">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="corrente">Conta Corrente</SelectItem>
                                                <SelectItem value="poupanca">Poupança</SelectItem>
                                                <SelectItem value="investimento">Investimentos</SelectItem>
                                                <SelectItem value="carteira">Carteira Crypto</SelectItem>
                                                <SelectItem value="dinheiro">Dinheiro Físico</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="currency">Moeda</Label>
                                        <Select name="currency" defaultValue="BRL">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Moeda" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="BRL">BRL (R$)</SelectItem>
                                                <SelectItem value="USD">USD ($)</SelectItem>
                                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                                <SelectItem value="BTC">BTC (₿)</SelectItem>
                                                <SelectItem value="ETH">ETH (Ξ)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
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
                <Card className="col-span-full md:col-span-1 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-none shadow-md">
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
                    <Card key={bank.id} className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                        <div className="absolute top-4 right-4 flex items-center gap-2">
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
                                className="text-zinc-400 hover:text-red-500 transition-colors p-1"
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
                                <CardTitle className="text-lg flex items-center gap-2">
                                    {bank.bank_name || bank.name}
                                    <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 font-mono">
                                        {bank.currency || 'BRL'}
                                    </span>
                                </CardTitle>
                                <CardDescription className="capitalize">{bank.account_type || bank.type}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="mt-4">
                            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                                {formatCurrency(bank.balance, bank.currency)}
                            </div>
                        </CardContent>
                        <CardFooter className="bg-zinc-50 dark:bg-zinc-950/50 py-3 mt-4 flex items-center justify-between border-t dark:border-zinc-800">
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                <History className="h-3 w-3" />
                                {bank.last_sync ? `Sincronizado ${formatDistanceToNow(new Date(bank.last_sync), { addSuffix: true, locale: ptBR })}` : 'Nunca sincronizado'}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 font-semibold"
                                onClick={() => setViewingBank(bank)}
                            >
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

            {/* --- DIALOG DE EXTRATO --- */}
            <Dialog open={!!viewingBank} onOpenChange={(open) => !open && setViewingBank(null)}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                            <FileText className="h-6 w-6 text-emerald-600" />
                            Extrato: {viewingBank?.bank_name}
                            <span className="text-xs font-mono bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full ml-2">
                                {viewingBank?.currency || 'BRL'}
                            </span>
                        </DialogTitle>
                        <DialogDescription>
                            Linha do tempo de transações desta conta ({viewingBank?.currency || 'BRL'}).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Seção de Importação */}
                        <div className="bg-zinc-50 dark:bg-zinc-900/50 border dark:border-zinc-800 rounded-lg p-4">
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                                <Upload className="h-4 w-4" />
                                Adicionar Extrato (CSV/OFX)
                            </h4>
                            <form action={handleImport} className="flex items-end gap-3">
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="file-upload" className="sr-only">Arquivo</Label>
                                    <Input
                                        id="file-upload"
                                        name="file"
                                        type="file"
                                        accept=".csv,.ofx"
                                        className="h-9 cursor-pointer bg-white dark:bg-zinc-950"
                                        required
                                    />
                                </div>
                                <Button type="submit" disabled={isPending} className="h-9 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
                                    {isPending ? 'Enviando...' : 'Importar'}
                                </Button>
                            </form>
                            <p className="text-[10px] text-zinc-500 mt-2">
                                Formatos aceitos: .CSV (padrão banco) ou .OFX. As transações herdarão a moeda <strong>{viewingBank?.currency || 'BRL'}</strong>.
                            </p>
                        </div>

                        {/* Listagem de Transações */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Transações Recentes</h4>
                                <Button variant="outline" size="sm" className="h-7 text-[10px] border-zinc-200 dark:border-zinc-800">
                                    <Download className="h-3 w-3 mr-1" />
                                    Exportar Tudo
                                </Button>
                            </div>

                            {isLoadingTransactions ? (
                                <div className="py-8 text-center text-zinc-400 text-sm animate-pulse">Carregando transações...</div>
                            ) : bankTransactions.length > 0 ? (
                                <div className="border dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
                                    <Table>
                                        <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="w-[100px] text-[11px] uppercase tracking-wider font-bold">Data</TableHead>
                                                <TableHead className="text-[11px] uppercase tracking-wider font-bold">Descrição</TableHead>
                                                <TableHead className="text-right text-[11px] uppercase tracking-wider font-bold">Valor</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {bankTransactions.map((tx) => (
                                                <TableRow key={tx.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 border-zinc-100 dark:border-zinc-800">
                                                    <TableCell className="text-xs text-zinc-500 font-mono">
                                                        {new Date(tx.date).toLocaleDateString('pt-BR')}
                                                    </TableCell>
                                                    <TableCell className="text-xs font-medium max-w-[200px] truncate text-zinc-800 dark:text-zinc-300">
                                                        {tx.description}
                                                    </TableCell>
                                                    <TableCell className={`text-right text-xs font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {tx.type === 'expense' ? '-' : '+'} {formatCurrency(Math.abs(tx.amount), viewingBank?.currency)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="py-12 text-center text-zinc-500 border border-dashed rounded-lg dark:border-zinc-800 text-sm">
                                    Nenhuma transação encontrada para esta conta.
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="p-4 border-t dark:border-zinc-800">
                        <Button variant="outline" onClick={() => setViewingBank(null)}>Fechar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
