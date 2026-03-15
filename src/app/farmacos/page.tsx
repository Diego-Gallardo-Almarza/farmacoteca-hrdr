// /farmacos/page.tsx — Página con tabla completa de fármacos
import React from "react";
import FarmacoTable from "@/components/FarmacoTable";
import farmacos from "@/data/farmacos.json";
import { Farmaco } from "@/types/farmaco";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Lista Completa — Farmacoteca HRDR",
    description:
        "Lista completa de antimicrobianos, antivirales y antifúngicos pediátricos ordenados y filtrables.",
};

export default function FarmacosPage() {
    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link
                            href="/"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            Inicio
                        </Link>
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
                        Lista completa de fármacos
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        {farmacos.length} fármacos · Uso exclusivo pediátrico (&lt; 15 años)
                    </p>
                </div>

                {/* Resumen por categoría */}
                <div className="flex gap-3 flex-wrap sm:shrink-0">
                    {[
                        {
                            cat: "antibacteriano",
                            label: "Antibact.",
                            color: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700",
                        },
                        {
                            cat: "antifungico",
                            label: "Antifúng.",
                            color: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700",
                        },
                        {
                            cat: "antiviral",
                            label: "Antiviral",
                            color: "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700",
                        },
                    ].map(({ cat, label, color }) => (
                        <div
                            key={cat}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${color}`}
                        >
                            <span className="text-lg font-extrabold">
                                {farmacos.filter((f) => f.categoria === cat).length}
                            </span>
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabla */}
            <FarmacoTable farmacos={farmacos as Farmaco[]} />

            {/* Nota informativa */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-sm text-blue-800 dark:text-blue-200">
                <span className="text-lg shrink-0">ℹ️</span>
                <p>
                    Haz clic en cualquier nombre de fármaco para ir al buscador y ver su
                    información completa. Los campos de dosis y estabilidad son específicos
                    para pacientes pediátricos ({"<"} 15 años). Dosis superiores a las
                    indicadas deben ser visadas por un infectólogo.
                </p>
            </div>
        </div>
    );
}
