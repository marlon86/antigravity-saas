'use client'

import { useState, useEffect } from 'react'
import { Search, Landmark, FileText, ArrowRight, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { globalSearch, SearchResult } from '@/app/actions/search'
import { useDebounce } from '@/hooks/use-debounce'
import Link from 'next/link'

export function GlobalSearch() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const debouncedQuery = useDebounce(query, 300)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                const input = document.getElementById('global-search-input')
                input?.focus()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    useEffect(() => {
        const performSearch = async () => {
            if (debouncedQuery.length < 2) {
                setResults([])
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            try {
                const data = await globalSearch(debouncedQuery)
                setResults(data)
            } catch (error) {
                console.error('Search error:', error)
            } finally {
                setIsLoading(false)
            }
        }

        performSearch()
    }, [debouncedQuery])

    const formatCurrency = (value: number, currencyCode: string = 'BRL') => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currencyCode
        }).format(value)
    }

    return (
        <div className="relative w-full max-w-md hidden md:block group">
            <div className="relative">
                {isLoading ? (
                    <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500 animate-spin" />
                ) : (
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                )}
                <Input
                    id="global-search-input"
                    type="search"
                    placeholder="Buscar transações, bancos..."
                    className="w-full bg-zinc-50 pl-9 pr-12 dark:bg-zinc-900 border-none focus-visible:ring-emerald-500"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setIsOpen(true)
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                <div className="absolute right-3 top-2.5 hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[10px] text-zinc-400 pointer-events-none">
                    <span className="font-sans">Ctrl</span>
                    <span className="font-sans">K</span>
                </div>
            </div>

            {isOpen && query.length >= 2 && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full mt-2 w-full bg-white dark:bg-zinc-950 border dark:border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden">
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {results.length > 0 ? (
                                <div className="py-2">
                                    {results.map((result) => (
                                        <Link
                                            key={`${result.type}-${result.id}`}
                                            href={result.url}
                                            onClick={() => {
                                                setIsOpen(false)
                                                setQuery('')
                                            }}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors border-b dark:border-zinc-800 last:border-0"
                                        >
                                            <div className={`p-2 rounded-lg shrink-0 ${result.type === 'bank' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                                {result.type === 'bank' ? <Landmark className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm font-semibold truncate dark:text-zinc-100">{result.title}</p>
                                                    {result.amount !== undefined && (
                                                        <span className={`text-xs font-mono font-bold ${result.type === 'transaction' && result.amount < 0 ? 'text-red-500' : 'text-zinc-900 dark:text-zinc-300'}`}>
                                                            {formatCurrency(result.amount, result.currency || 'BRL')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between mt-0.5">
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{result.subtitle}</p>
                                                    {result.date && (
                                                        <span className="text-[10px] text-zinc-400 uppercase">{new Date(result.date).toLocaleDateString('pt-BR')}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <ArrowRight className="h-3 w-3 text-zinc-300 dark:text-zinc-600" />
                                        </Link>
                                    ))}
                                </div>
                            ) : !isLoading ? (
                                <div className="py-12 text-center text-zinc-500">
                                    <Search className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">Nenhum resultado para "{query}"</p>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
