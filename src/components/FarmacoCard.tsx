// FarmacoCard.tsx
// Tarjeta expandible con toda la información clínica de un fármaco
"use client";

import React, { useState, useCallback } from "react";
import { Farmaco } from "@/types/farmaco";
import BadgeAlerta from "./BadgeAlerta";

interface FarmacoCardProps {
    farmaco: Farmaco;
    queryResaltada?: string;
}

/** Resalta el texto buscado con un span amarillo */
function resaltarTexto(texto: string, query: string): React.ReactNode {
    if (!query.trim()) return texto;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const partes = texto.split(regex);
    return partes.map((parte, i) =>
        regex.test(parte) ? (
            <mark key={i} className="bg-yellow-200 dark:bg-yellow-700/60 text-inherit rounded px-0.5">
                {parte}
            </mark>
        ) : (
            parte
        )
    );
}

const categoriaConfig = {
    antibacteriano: {
        label: "Antibacteriano",
        bg: "bg-blue-100 dark:bg-blue-900/40",
        text: "text-blue-700 dark:text-blue-300",
        border: "border-blue-200 dark:border-blue-700",
        badgeBg: "bg-blue-700",
        dot: "bg-blue-500",
    },
    antifungico: {
        label: "Antifúngico",
        bg: "bg-green-100 dark:bg-green-900/40",
        text: "text-green-700 dark:text-green-300",
        border: "border-green-200 dark:border-green-700",
        badgeBg: "bg-green-700",
        dot: "bg-green-500",
    },
    antiviral: {
        label: "Antiviral",
        bg: "bg-violet-100 dark:bg-violet-900/40",
        text: "text-violet-700 dark:text-violet-300",
        border: "border-violet-200 dark:border-violet-700",
        badgeBg: "bg-violet-700",
        dot: "bg-violet-500",
    },
};

const camposTabla = [
    { key: "dosis", label: "Dosis" },
    { key: "dosisDia", label: "Dosis/día" },
    { key: "dosisMaxima", label: "Dosis máxima" },
    { key: "frecuencia", label: "Frecuencia" },
    { key: "reconstitucion", label: "Reconstitución" },
    { key: "concentracionDilucion", label: "Concentración en dilución" },
    { key: "solvente", label: "Solvente" },
    { key: "estabilidad", label: "Estabilidad" },
    { key: "velocidad", label: "Velocidad infusión" },
] as const;

export default function FarmacoCard({ farmaco, queryResaltada = "" }: FarmacoCardProps) {
    const [expandido, setExpandido] = useState(false);
    const [copiado, setCopiado] = useState(false);
    const cat = categoriaConfig[farmaco.categoria];

    const copiarInfo = useCallback(async () => {
        const texto = `FARMACOTECA HRDR — ${farmaco.nombre}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Categoría: ${cat.label}
Presentación: ${farmaco.presentacion.join(" | ")}
Dosis: ${farmaco.dosis}
Dosis/día: ${farmaco.dosisDia}
Dosis máxima: ${farmaco.dosisMaxima}
Frecuencia: ${farmaco.frecuencia}
Reconstitución: ${farmaco.reconstitucion}
Concentración en dilución: ${farmaco.concentracionDilucion}
Solvente: ${farmaco.solvente}
Estabilidad: ${farmaco.estabilidad}
Velocidad infusión: ${farmaco.velocidad}
Cuidados especiales: ${farmaco.cuidados}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠ USO EXCLUSIVO PEDIÁTRICO (< 15 años)`;

        try {
            await navigator.clipboard.writeText(texto);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2500);
        } catch {
            // fallback silencioso
        }
    }, [farmaco, cat]);

    return (
        <div
            className={`group relative rounded-2xl border-2 ${cat.border} bg-white dark:bg-gray-800 shadow-md hover:shadow-xl dark:shadow-none
                  transition-all duration-300 overflow-hidden`}
        >
            {/* Barra de color superior */}
            <div className={`h-1.5 w-full ${cat.badgeBg} opacity-80`} />

            {/* Header clicable */}
            <button
                onClick={() => setExpandido(!expandido)}
                className="w-full text-left px-5 pt-4 pb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-t-2xl"
                aria-expanded={expandido}
                id={`card-${farmaco.id}`}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        {/* Nombre */}
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
                            {resaltarTexto(farmaco.nombre, queryResaltada)}
                        </h3>
                        {/* Presentación */}
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {farmaco.presentacion.join(" · ")}
                        </p>
                    </div>

                    {/* Badges derecha */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                        {/* Badge categoría */}
                        <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white ${cat.badgeBg}`}
                        >
                            <span
                                className={`w-1.5 h-1.5 rounded-full ${cat.dot} bg-white/70`}
                            />
                            {cat.label}
                        </span>

                        {/* Ícono expand */}
                        <svg
                            className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-300 ${expandido ? "rotate-180" : ""
                                }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Dosis rápida visible siempre */}
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">Dosis:</span>{" "}
                        {farmaco.dosis}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">Freq:</span>{" "}
                        {farmaco.frecuencia}
                    </span>
                </div>

                {/* Alertas preview */}
                {farmaco.alertas.length > 0 && !expandido && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {farmaco.alertas.slice(0, 3).map((alerta) => (
                            <BadgeAlerta key={alerta} alerta={alerta} />
                        ))}
                        {farmaco.alertas.length > 3 && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 self-center">
                                +{farmaco.alertas.length - 3} más
                            </span>
                        )}
                    </div>
                )}
            </button>

            {/* Panel expandido */}
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${expandido ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="px-5 pb-5 space-y-5 border-t border-gray-100 dark:border-gray-700 pt-4">
                    {/* Badge pediátrico */}
                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200 text-sm font-semibold">
                        <span>👶</span>
                        <span>Uso Pediátrico — Pacientes &lt; 15 años</span>
                    </div>

                    {/* Tabla de datos clínicos */}
                    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {camposTabla.map(({ key, label }, idx) => (
                                    <tr
                                        key={key}
                                        className={idx % 2 === 0 ? "bg-gray-50 dark:bg-gray-700/30" : "bg-white dark:bg-gray-800"}
                                    >
                                        <td className="px-4 py-2.5 font-semibold text-gray-600 dark:text-gray-400 w-1/3 align-top">
                                            {label}
                                        </td>
                                        <td className="px-4 py-2.5 text-gray-800 dark:text-gray-200 font-medium">
                                            {farmaco[key] || "---"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Cuidados especiales */}
                    {farmaco.cuidados && farmaco.cuidados !== "---" && (
                        <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 p-4">
                            <div className="flex items-start gap-2">
                                <span className="text-lg shrink-0">⚠️</span>
                                <div>
                                    <p className="font-bold text-amber-800 dark:text-amber-300 text-sm uppercase tracking-wide mb-1">
                                        Cuidados Especiales
                                    </p>
                                    <p className="text-amber-900 dark:text-amber-200 text-sm leading-relaxed">
                                        {farmaco.cuidados}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Badges de alerta completos */}
                    {farmaco.alertas.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                Alertas
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {farmaco.alertas.map((alerta) => (
                                    <BadgeAlerta key={alerta} alerta={alerta} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Botón copiar */}
                    <button
                        onClick={copiarInfo}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold
                        transition-all duration-200 border-2
                        ${copiado
                                ? "bg-green-50 dark:bg-green-900/30 border-green-400 text-green-700 dark:text-green-400"
                                : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            }`}
                        id={`copy-${farmaco.id}`}
                    >
                        {copiado ? (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                ¡Copiado al portapapeles!
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copiar información
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
