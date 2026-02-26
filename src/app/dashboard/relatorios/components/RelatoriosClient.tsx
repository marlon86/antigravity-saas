'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileBarChart, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

const PREVIOUS_YEAR = 2025;
const CURRENT_YEAR = new Date().getFullYear();

export type Transaction = {
    id: string;
    description: string;
    amount: number;
    type: string;
    category: string;
    date: string;
    is_tax_deductible?: boolean;
}

const MOCK_IR_DATA = {
    investments: [
        { id: '1', name: 'CDB Banco Itaú', type: 'Renda Fixa', value: 35000.0, CNPJ: '60.701.190/0001-04' },
        { id: '2', name: 'Tesouro Direto IPCA+', type: 'Títulos Públicos', value: 12500.5, CNPJ: '00.000.000/0001-91' },
        { id: '3', name: 'Fundo Mútuo XP', type: 'Fundo de Investimento', value: 8400.2, CNPJ: '02.332.886/0001-04' },
    ]
};

export default function RelatoriosClient({ initialTransactions }: { initialTransactions: Transaction[] }) {
    const [year, setYear] = useState(CURRENT_YEAR.toString());

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const deductibles = initialTransactions.filter(t => t.is_tax_deductible && new Date(t.date).getFullYear() === parseInt(year));
    const totalDeductibles = deductibles.reduce((acc, curr) => acc + curr.amount, 0);
    const totalInvestments = MOCK_IR_DATA.investments.reduce((acc, curr) => acc + curr.value, 0);

    const handleExportPDF = async () => {
        try {
            const jsPDF = (await import('jspdf')).default;
            const autoTable = (await import('jspdf-autotable')).default;

            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.text(`Relatório de Imposto de Renda - ${year}`, 14, 22);
            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);

            // Resumo
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text('Resumo', 14, 45);

            autoTable(doc, {
                startY: 50,
                head: [['Categoria', 'Total']],
                body: [
                    ['Despesas Dedutíveis (Saúde/Educação)', formatCurrency(totalDeductibles)],
                    ['Bens e Direitos (Investimentos)', formatCurrency(totalInvestments)],
                ],
                theme: 'striped',
                headStyles: { fillColor: [16, 185, 129] } // emerald-500
            });

            // Detalhamento Dedutíveis
            let finalY = (doc as any).lastAutoTable.finalY || 50;
            doc.text('Despesas Dedutíveis', 14, finalY + 15);

            const deductiblesBody = deductibles.map(d => [
                d.description,
                new Date(d.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
                formatCurrency(d.amount)
            ]);

            autoTable(doc, {
                startY: finalY + 20,
                head: [['Descrição', 'Data', 'Valor']],
                body: deductiblesBody.length > 0 ? deductiblesBody : [['Nenhuma despesa dedutível encontrada neste ano.', '', '']],
                theme: 'striped',
                headStyles: { fillColor: [16, 185, 129] }
            });

            // Detalhamento Investimentos
            finalY = (doc as any).lastAutoTable.finalY || 50;
            if (finalY > 250) {
                doc.addPage();
                finalY = 20;
            } else {
                finalY += 15;
            }

            doc.text('Bens e Direitos (Investimentos)', 14, finalY);

            const investmentsBody = MOCK_IR_DATA.investments.map(i => [
                i.name,
                i.CNPJ,
                i.type,
                formatCurrency(i.value)
            ]);

            autoTable(doc, {
                startY: finalY + 5,
                head: [['Instituição / Fundo', 'CNPJ', 'Tipo', `Saldo Final (${year})`]],
                body: investmentsBody,
                theme: 'striped',
                headStyles: { fillColor: [16, 185, 129] }
            });

            doc.save(`Relatorio_IR_${year}.pdf`);
            toast.success('Relatório PDF gerado com sucesso!');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao gerar PDF do relatório.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Imposto de Renda</h2>
                    <p className="text-zinc-500 dark:text-zinc-400">Organize suas deduções e investimentos para a declaração anual.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Select defaultValue={year} onValueChange={setYear}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2026">2026 (Atual)</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2024">2024</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleExportPDF} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Download className="mr-2 h-4 w-4" />
                        Gerar Relatório {year}
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <CheckCircle2 className="h-10 w-10 text-emerald-100 dark:text-emerald-900/30" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Dedutível Identificado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(totalDeductibles)}</div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center">
                            Baseado em {deductibles.length} despesas dedutíveis (Saúde/Educação).
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <TrendingUp className="h-10 w-10 text-emerald-100 dark:text-emerald-900/30" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total em Investimentos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(totalInvestments)}</div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center">
                            Distribuído em {MOCK_IR_DATA.investments.length} instituições financeiras diferentes.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 shadow-sm">
                <Tabs defaultValue="deductibles" className="w-full">
                    <CardHeader className="pb-0 border-b dark:border-zinc-800">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <CardTitle className="text-lg">Detalhamento para {year}</CardTitle>
                                <CardDescription>Revise os itens antes de gerar o relatório final.</CardDescription>
                            </div>
                        </div>
                        <TabsList className="bg-transparent border-none gap-2 sm:gap-4 p-0 flex-wrap h-auto">
                            <TabsTrigger
                                value="deductibles"
                                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:shadow-none rounded-none px-2 pb-3 text-sm sm:text-base"
                            >
                                Despesas Dedutíveis
                            </TabsTrigger>
                            <TabsTrigger
                                value="investments"
                                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:shadow-none rounded-none px-2 pb-3 text-sm sm:text-base"
                            >
                                Bens e Direitos (Investimentos)
                            </TabsTrigger>
                        </TabsList>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <TabsContent value="deductibles" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                            <div className="rounded-md border dark:border-zinc-800">
                                <Table>
                                    <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                                        <TableRow>
                                            <TableHead>Descrição</TableHead>
                                            <TableHead>Data</TableHead>
                                            <TableHead className="text-right">Valor</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {deductibles.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.description}</TableCell>
                                                <TableCell className="text-zinc-500">{new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(item.amount)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {deductibles.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center py-8 text-zinc-500">
                                                    Nenhuma despesa dedutível encontrada neste ano.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="mt-4 flex p-4 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 rounded-lg text-sm items-start gap-3">
                                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                <p>Apenas despesas com Saúde, Educação, Previdência e Dependentes são dedutíveis. Guarde sempre os comprovantes (NF ou Recibo) com o CPF/CNPJ do prestador por até 5 anos.</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="investments" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                            <div className="rounded-md border dark:border-zinc-800">
                                <Table>
                                    <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                                        <TableRow>
                                            <TableHead>Instituição / Fundo</TableHead>
                                            <TableHead>CNPJ</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead className="text-right">Saldo Final ({year})</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {MOCK_IR_DATA.investments.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell className="text-zinc-500 font-mono text-xs">{item.CNPJ}</TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                                                        {item.type}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(item.value)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>
                    </CardContent>
                </Tabs>
            </Card>
        </div>
    );
}
