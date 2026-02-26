'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Upload, Download, Filter, FileText, PlusCircle, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type Transaction = {
    id: string;
    date: string;
    description: string;
    category: string;
    amount: number;
    banks?: { bank_name: string } | null;
    bank_id?: string | null;
    type?: string;
    is_tax_deductible?: boolean;
}

export default function ExtratosClient({ initialTransactions, banks }: { initialTransactions: Transaction[], banks: any[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "dd 'de' MMM, yyyy", { locale: ptBR });
        } catch {
            return dateString;
        }
    };

    const filteredTransactions = initialTransactions.filter(t =>
        (t.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (t.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Extratos</h2>
                    <p className="text-zinc-500 dark:text-zinc-400">Histórico completo de transações e importação de arquivos.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Button variant="outline" className="w-full sm:w-auto hidden sm:flex">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar
                    </Button>

                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Nova
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Nova Transação</DialogTitle>
                                <DialogDescription>
                                    Adicione uma transação manualmente.
                                </DialogDescription>
                            </DialogHeader>
                            <form action={async (formData) => {
                                startTransition(async () => {
                                    const { addTransaction } = await import('@/app/actions/transactions');
                                    const result = await addTransaction(formData);
                                    if (result?.error) {
                                        toast.error('Erro ao adicionar transação', { description: result.error });
                                    } else {
                                        toast.success('Transação adicionada com sucesso!');
                                        setIsAddOpen(false);
                                    }
                                });
                            }}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Descrição</Label>
                                        <Input id="description" name="description" placeholder="Ex: Mercado Livre" required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="amount">Valor (R$)</Label>
                                            <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="date">Data</Label>
                                            <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="type">Tipo</Label>
                                            <Select name="type" defaultValue="expense">
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="expense">Despesa</SelectItem>
                                                    <SelectItem value="income">Receita</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="category">Categoria</Label>
                                            <Input id="category" name="category" placeholder="Ex: Alimentação" required />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="bankId">Conta Bancária</Label>
                                        <Select name="bankId">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione a conta (Opcional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {banks.map(bank => (
                                                    <SelectItem key={bank.id} value={bank.id}>{bank.bank_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center space-x-2 pt-2">
                                        <input type="checkbox" id="isTaxDeductible" name="isTaxDeductible" className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-600" />
                                        <Label htmlFor="isTaxDeductible" className="text-sm font-normal">
                                            Dedutível no Imposto de Renda (IR)
                                        </Label>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                                    <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                        {isPending ? 'Salvando...' : 'Salvar'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Upload className="mr-2 h-4 w-4" />
                                Importar CSV
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Importar Transações (CSV)</DialogTitle>
                                <DialogDescription>
                                    Faça upload de um arquivo CSV com as colunas: <strong>Data (DD/MM/YYYY), Descrição, Valor</strong>
                                </DialogDescription>
                            </DialogHeader>
                            <form action={async (formData) => {
                                startTransition(async () => {
                                    const { uploadTransactions } = await import('@/app/actions/transactions');
                                    const result = await uploadTransactions(formData);
                                    if (result?.error) {
                                        toast.error('Erro na importação', { description: result.error });
                                    } else {
                                        toast.success(`Sucesso! ${result.count} transação(ões) importada(s).`);
                                        setIsImportOpen(false);
                                    }
                                });
                            }}>
                                <div className="grid gap-4 py-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="bankIdImport">Selecione a Conta Bancária</Label>
                                        <Select name="bankId" required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Obrigatório para importação" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {banks.map(bank => (
                                                    <SelectItem key={bank.id} value={bank.id}>{bank.bank_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer relative">
                                        <FileText className="h-10 w-10 text-zinc-400 mb-4" />
                                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Clique para selecionar</p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Apenas arquivos .csv</p>
                                        <input type="file" name="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".csv" required />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsImportOpen(false)}>Cancelar</Button>
                                    <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                        {isPending ? 'Processando...' : 'Processar Arquivo'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full sm:max-w-md">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                            <Input
                                placeholder="Buscar por descrição ou categoria..."
                                className="pl-9 bg-zinc-50 dark:bg-zinc-950/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Select defaultValue="all">
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <SelectValue placeholder="Conta" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas as Contas</SelectItem>
                                    <SelectItem value="nubank">Nubank</SelectItem>
                                    <SelectItem value="itau">Itaú</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border dark:border-zinc-800 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[100px]">Data</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead className="hidden md:table-cell">Categoria</TableHead>
                                    <TableHead className="hidden sm:table-cell">Conta</TableHead>
                                    <TableHead className="text-right">Valor</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell className="font-medium text-zinc-500 dark:text-zinc-400">{formatDate(tx.date)}</TableCell>
                                            <TableCell>{tx.description}</TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                                                    {tx.category || 'Sem Cat.'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell text-zinc-500 dark:text-zinc-400">
                                                {tx.banks?.bank_name || '-'}
                                            </TableCell>
                                            <TableCell className={`text-right font-medium ${tx.type === 'income' || tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                                {tx.type === 'income' || tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                                            </TableCell>
                                            <TableCell>
                                                <button
                                                    onClick={() => {
                                                        startTransition(async () => {
                                                            if (confirm("Excluir esta transação?")) {
                                                                const { deleteTransaction } = await import('@/app/actions/transactions');
                                                                const result = await deleteTransaction(tx.id);
                                                                if (result?.error) toast.error('Erro ao excluir', { description: result.error });
                                                                else toast.success('Transação excluída');
                                                            }
                                                        });
                                                    }}
                                                    disabled={isPending}
                                                    className="text-zinc-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                                            Nenhuma transação encontrada.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
