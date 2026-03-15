// SearchBar.tsx
// Barra de búsqueda con autocompletado y filtros por categoría
"use client";

import React, { useCallback } from "react";
import { CategoriaFarmaco } from "@/types/farmaco";

interface SearchBarProps {
    query: string;
    onQueryChange: (q: string) => void;
    categoria: CategoriaFarmaco | "todos";
    onCategoriaChange: (c: CategoriaFarmaco | "todos") => void;
    totalResultados: number;
}

const categorias: { value: CategoriaFarmaco | "todos"; label: string; emoji: string }[] = [
    { value: "todos", label: "Todos", emoji: "🔬" },
    { value: "antibacteriano", label: "Antibacteriano", emoji: "🦠" },
    { value: "antifungico", label: "Antifúngico", emoji: "🍄" },
    { value: "antiviral", label: "Antiviral", emoji: "🦠" },
];

export default function SearchBar({
    query,
    onQueryChange,
    categoria,
    onCategoriaChange,
    totalResultados,
}: SearchBarProps) {
    const handleClear = useCallback(() => {
        onQueryChange("");
    }, [onQueryChange]);

    return (
        <div className="w-full space-y-4">
            {/* Campo de búsqueda */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <svg
                        className="w-5 h-5 text-blue-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
                <input
                    id="search-input"
                    type="text"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    placeholder="Buscar fármaco... ej: vancomicina, meropenem"
                    className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-blue-200 dark:border-blue-700
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     placeholder-gray-400 dark:placeholder-gray-500
                     focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30
                     text-base shadow-lg shadow-blue-100/50 dark:shadow-none
                     transition-all duration-200"
                    aria-label="Buscar fármaco"
                    autoComplete="off"
                    spellCheck={false}
                />
                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label="Limpiar búsqueda"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Filtros de categoría */}
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
                {categorias.map((cat) => (
                    <button
                        key={cat.value}
                        id={`filter-${cat.value}`}
                        onClick={() => onCategoriaChange(cat.value)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${categoria === cat.value
                                ? "bg-blue-700 border-blue-700 text-white shadow-md shadow-blue-700/30 scale-[1.03]"
                                : "bg-white dark:bg-gray-800 border-blue-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-700 dark:hover:text-blue-400"
                            }`}
                        aria-pressed={categoria === cat.value}
                    >
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                    </button>
                ))}

                {/* Contador de resultados */}
                <span className="ml-auto flex items-center text-sm text-gray-500 dark:text-gray-400 font-medium self-center px-2">
                    {totalResultados} fármaco{totalResultados !== 1 ? "s" : ""}
                </span>
            </div>
        </div>
    );
}
