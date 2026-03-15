// FarmacoTable.tsx
// Tabla completa de fármacos con ordenamiento y búsqueda integrada
"use client";

import React, { useState, useMemo } from "react";
import { Farmaco, CategoriaFarmaco } from "@/types/farmaco";
import BadgeAlerta from "./BadgeAlerta";
import Link from "next/link";

interface FarmacoTableProps {
    farmacos: Farmaco[];
}

type SortField = "nombre" | "categoria";
type SortDir = "asc" | "desc";

const categoriaColors = {
    antibacteriano: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    antifungico: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    antiviral: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
};
const categoriaLabels = {
    antibacteriano: "Antibacteriano",
    antifungico: "Antifúngico",
    antiviral: "Antiviral",
};

export default function FarmacoTable({ farmacos }: FarmacoTableProps) {
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState<SortField>("nombre");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [filtroCategoria, setFiltroCategoria] = useState<CategoriaFarmaco | "todos">("todos");

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDir("asc");
        }
    };

    const farmacosFiltrados = useMemo(() => {
        const q = search.toLowerCase().trim();
        return farmacos
            .filter((f) => {
                const matchTexto = !q || f.nombre.toLowerCase().includes(q) || f.cuidados.toLowerCase().includes(q);
                const matchCategoria = filtroCategoria === "todos" || f.categoria === filtroCategoria;
                return matchTexto && matchCategoria;
            })
            .sort((a, b) => {
                const valA = sortField === "nombre" ? a.nombre : a.categoria;
                const valB = sortField === "nombre" ? b.nombre : b.categoria;
                return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
            });
    }, [farmacos, search, sortField, sortDir, filtroCategoria]);

    const SortIcon = ({ field }: { field: SortField }) => (
        <span className="ml-1 inline-flex flex-col gap-0.5">
            <svg
                className={`w-3 h-3 -mb-1 ${sortField === field && sortDir === "asc" ? "text-blue-600" : "text-gray-300 dark:text-gray-600"}`}
                viewBox="0 0 24 24"
                fill="currentColor"
            >
                <path d="M12 4l8 8H4z" />
            </svg>
            <svg
                className={`w-3 h-3 ${sortField === field && sortDir === "desc" ? "text-blue-600" : "text-gray-300 dark:text-gray-600"}`}
                viewBox="0 0 24 24"
                fill="currentColor"
            >
                <path d="M12 20l-8-8h16z" />
            </svg>
        </span>
    );

    return (
        <div className="space-y-4">
            {/* Controles */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar en la tabla..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-sm transition-all"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {(["todos", "antibacteriano", "antifungico", "antiviral"] as const).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFiltroCategoria(cat)}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${filtroCategoria === cat
                                    ? "bg-blue-700 border-blue-700 text-white"
                                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400"
                                }`}
                        >
                            {cat === "todos" ? "Todos" : cat === "antifungico" ? "Antifúngico" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tabla responsive */}
            <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-blue-700 text-white">
                                <th className="text-left px-4 py-3 font-semibold">
                                    <button
                                        onClick={() => handleSort("nombre")}
                                        className="flex items-center gap-1 hover:text-blue-200 transition-colors"
                                    >
                                        Nombre <SortIcon field="nombre" />
                                    </button>
                                </th>
                                <th className="text-left px-4 py-3 font-semibold">
                                    <button
                                        onClick={() => handleSort("categoria")}
                                        className="flex items-center gap-1 hover:text-blue-200 transition-colors"
                                    >
                                        Categoría <SortIcon field="categoria" />
                                    </button>
                                </th>
                                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Dosis</th>
                                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Frecuencia</th>
                                <th className="text-left px-4 py-3 font-semibold hidden xl:table-cell">Velocidad</th>
                                <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Alertas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {farmacosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-gray-400 dark:text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-3xl">🔍</span>
                                            <p>No se encontraron fármacos con ese criterio</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                farmacosFiltrados.map((f, i) => (
                                    <tr
                                        key={f.id}
                                        className={`group transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 ${i % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-800/50"
                                            }`}
                                    >
                                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100">
                                            <Link
                                                href={`/#card-${f.id}`}
                                                className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                                            >
                                                {f.nombre}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${categoriaColors[f.categoria]}`}>
                                                {categoriaLabels[f.categoria]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell max-w-[200px] truncate">
                                            {f.dosis}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                                            {f.frecuencia}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden xl:table-cell">
                                            {f.velocidad}
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <div className="flex flex-wrap gap-1">
                                                {f.alertas.slice(0, 2).map((a) => (
                                                    <BadgeAlerta key={a} alerta={a} />
                                                ))}
                                                {f.alertas.length > 2 && (
                                                    <span className="text-xs text-gray-400 dark:text-gray-500 self-center">
                                                        +{f.alertas.length - 2}
                                                    </span>
                                                )}
                                                {f.alertas.length === 0 && (
                                                    <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                    Mostrando {farmacosFiltrados.length} de {farmacos.length} fármacos · Uso exclusivo pediátrico (&lt; 15 años)
                </div>
            </div>
        </div>
    );
}
