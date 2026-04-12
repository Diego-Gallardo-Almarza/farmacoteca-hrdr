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

const categoriaColors: Record<string, string> = {
    antibacteriano: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    antifungico: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    antiviral: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    aine_analgesico: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    opioide: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    digestivo: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
    vitamina: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    mineral: "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300",
    corticoide: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    oncologico: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    "psicofármaco": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

const categoriaLabels: Record<string, string> = {
    antibacteriano: "Antibacteriano",
    antifungico: "Antifúngico",
    antiviral: "Antiviral",
    aine_analgesico: "AINE / Analgésico",
    opioide: "Opioide",
    digestivo: "Digestivo",
    vitamina: "Vitamina",
    mineral: "Mineral",
    corticoide: "Corticoide",
    oncologico: "Oncológico",
    "psicofármaco": "Psicofármaco",
};

export default function FarmacoTable({ farmacos }: FarmacoTableProps) {
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState<SortField>("nombre");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [filtroCategoria, setFiltroCategoria] = useState<CategoriaFarmaco | "todos">("todos");

    // Categorías presentes en los datos actuales
    const categoriasDisponibles = useMemo(() => {
        const set = new Set(farmacos.map((f) => f.categoria));
        return ["todos" as const, ...Array.from(set).sort()];
    }, [farmacos]);

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
                const searchable = [
                    f.nombre,
                    f.cuidados,
                    f.mecanismoAccion ?? "",
                    f.reaccionesAdversas ?? "",
                    f.interacciones ?? "",
                ].join(" ").toLowerCase();
                const matchTexto = !q || searchable.includes(q);
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
                    {categoriasDisponibles.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFiltroCategoria(cat as CategoriaFarmaco | "todos")}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${filtroCategoria === cat
                                    ? "bg-blue-700 border-blue-700 text-white"
                                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400"
                                }`}
                        >
                            {cat === "todos" ? "Todos" : (categoriaLabels[cat] ?? cat)}
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
                                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Cuidados / Dilución</th>
                                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Mecanismo</th>
                                <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Alertas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {farmacosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-400 dark:text-gray-500">
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
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${categoriaColors[f.categoria] ?? "bg-gray-100 text-gray-700"}`}>
                                                {categoriaLabels[f.categoria] ?? f.categoria}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell max-w-[220px]">
                                            <span className="line-clamp-2 text-xs leading-relaxed">
                                                {f.cuidados && f.cuidados !== "---"
                                                    ? f.cuidados
                                                    : (f.dilucion && f.dilucion !== "---" ? f.dilucion : "—")}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden lg:table-cell max-w-[260px]">
                                            <span className="line-clamp-2 text-xs leading-relaxed">
                                                {f.mecanismoAccion ? f.mecanismoAccion : "—"}
                                            </span>
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
                    Mostrando {farmacosFiltrados.length} de {farmacos.length} fármacos · Farmacoteca HCSBA
                </div>
            </div>
        </div>
    );
}
