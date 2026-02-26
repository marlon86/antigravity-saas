'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export type Transaction = {
    id: string;
    description: string;
    amount: number;
    type: string;
    category: string;
    date: string;
    is_tax_deductible?: boolean;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#64748b'];

export default function DashboardClient({ initialTransactions }: { initialTransactions: Transaction[] }) {
    const transactions = initialTransactions || [];

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIncome - totalExpense;

    const expensesByCategory = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'expense');
        const grouped = expenses.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateStr: string) => {
        return new Intl.DateTimeFormat('pt-BR').format(new Date(dateStr));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Visão Geral</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Saldo Consolidado</CardTitle>
                        <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(balance)}</div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            Atualizado hoje
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Receitas do Mês</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(totalIncome)}</div>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center mt-1">
                            +12% desde o último mês
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Despesas do Mês</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(totalExpense)}</div>
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center mt-1">
                            +8% em relação à média
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Dedutível (IR)</CardTitle>
                        <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                            {formatCurrency(transactions.filter(t => t.is_tax_deductible).reduce((acc, curr) => acc + curr.amount, 0))}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            Gastos marcados como dedutíveis
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-white dark:bg-zinc-900 border dark:border-zinc-800 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Últimas Transações</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((transaction) => (
                                <div key={transaction.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{transaction.description}</p>
                                        <div className="flex gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                                            <span>{formatDate(transaction.date)}</span>
                                            <span>•</span>
                                            <span className="truncate max-w-[120px]">{transaction.category}</span>
                                        </div>
                                    </div>
                                    <div className={`font-semibold ${transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                    </div>
                                </div>
                            ))}
                            {transactions.length === 0 && (
                                <div className="text-center py-8 text-zinc-500 text-sm">
                                    Nenhuma transação encontrada. Adicione uma nova conta ou importe um arquivo.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 bg-white dark:bg-zinc-900 border dark:border-zinc-800 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Despesas por Categoria</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        {expensesByCategory.length > 0 ? (
                            <div className="h-[250px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={expensesByCategory}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {expensesByCategory.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: any) => formatCurrency(Number(value))}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-zinc-500">
                                Nenhuma despesa para exibir
                            </div>
                        )}
                        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 w-full px-4">
                            {expensesByCategory.slice(0, 4).map((category, idx) => (
                                <div key={category.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                    <span className="text-sm truncate dark:text-zinc-300">{category.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
