// FarmacoCard.tsx
// Tarjeta expandible con toda la información clínica de un fármaco
"use client";

import React, { useState, useCallback } from "react";
import { toast } from "sonner";
import { Farmaco } from "@/types/farmaco";
import BadgeAlerta from "./BadgeAlerta";
import { useFavoritos } from "@/hooks/useFavoritos";

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

const categoriaConfig: Record<string, {
    label: string;
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    dot: string;
}> = {
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
    aine_analgesico: {
        label: "AINE / Analgésico",
        bg: "bg-orange-100 dark:bg-orange-900/40",
        text: "text-orange-700 dark:text-orange-300",
        border: "border-orange-200 dark:border-orange-700",
        badgeBg: "bg-orange-600",
        dot: "bg-orange-500",
    },
    opioide: {
        label: "Opioide",
        bg: "bg-red-100 dark:bg-red-900/40",
        text: "text-red-700 dark:text-red-300",
        border: "border-red-200 dark:border-red-700",
        badgeBg: "bg-red-700",
        dot: "bg-red-500",
    },
    digestivo: {
        label: "Digestivo",
        bg: "bg-teal-100 dark:bg-teal-900/40",
        text: "text-teal-700 dark:text-teal-300",
        border: "border-teal-200 dark:border-teal-700",
        badgeBg: "bg-teal-700",
        dot: "bg-teal-500",
    },
    vitamina: {
        label: "Vitamina",
        bg: "bg-amber-100 dark:bg-amber-900/40",
        text: "text-amber-700 dark:text-amber-300",
        border: "border-amber-200 dark:border-amber-700",
        badgeBg: "bg-amber-600",
        dot: "bg-amber-500",
    },
    mineral: {
        label: "Mineral / Electrolito",
        bg: "bg-slate-100 dark:bg-slate-900/40",
        text: "text-slate-700 dark:text-slate-300",
        border: "border-slate-200 dark:border-slate-700",
        badgeBg: "bg-slate-600",
        dot: "bg-slate-500",
    },
    corticoide: {
        label: "Corticoide",
        bg: "bg-yellow-100 dark:bg-yellow-900/40",
        text: "text-yellow-700 dark:text-yellow-300",
        border: "border-yellow-200 dark:border-yellow-700",
        badgeBg: "bg-yellow-600",
        dot: "bg-yellow-500",
    },
    oncologico: {
        label: "Oncológico",
        bg: "bg-rose-100 dark:bg-rose-900/40",
        text: "text-rose-700 dark:text-rose-300",
        border: "border-rose-200 dark:border-rose-700",
        badgeBg: "bg-rose-700",
        dot: "bg-rose-500",
    },
    "psicofármaco": {
        label: "Psicofármaco",
        bg: "bg-purple-100 dark:bg-purple-900/40",
        text: "text-purple-700 dark:text-purple-300",
        border: "border-purple-200 dark:border-purple-700",
        badgeBg: "bg-purple-700",
        dot: "bg-purple-500",
    },
};

const camposAdministracion = [
    { key: "dosis" as const, label: "Dosis" },
    { key: "dosisDia" as const, label: "Dosis/día" },
    { key: "dosisMaxima" as const, label: "Dosis máxima" },
    { key: "frecuencia" as const, label: "Frecuencia" },
    { key: "reconstitucion" as const, label: "Reconstitución" },
    { key: "concentracionDilucion" as const, label: "Concentración en dilución" },
    { key: "solvente" as const, label: "Solvente" },
    { key: "estabilidad" as const, label: "Estabilidad" },
    { key: "velocidad" as const, label: "Velocidad infusión" },
    { key: "dilucion" as const, label: "Dilución" },
];

const camposFarmacologia = [
    { key: "mecanismoAccion" as const, label: "Mecanismo de acción" },
    { key: "reaccionesAdversas" as const, label: "Reacciones adversas (RA)" },
    { key: "interacciones" as const, label: "Interacciones" },
];

export default function FarmacoCard({ farmaco, queryResaltada = "" }: FarmacoCardProps) {
    const [expandido, setExpandido] = useState(false);
    const cat = categoriaConfig[farmaco.categoria] ?? categoriaConfig["antibacteriano"];
    const { esFavorito, toggleFavorito } = useFavoritos();
    const favorito = esFavorito(farmaco.id);

    const filasAdmin = camposAdministracion.filter(
        ({ key }) => farmaco[key] && farmaco[key] !== "---"
    );

    const copiarInfo = useCallback(async () => {
        const lineas = [
            `FARMACOTECA HCSBA — ${farmaco.nombre}`,
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            `Categoría: ${cat.label}`,
            `Presentación: ${farmaco.presentacion.join(" | ")}`,
        ];
        if (farmaco.dosis) lineas.push(`Dosis: ${farmaco.dosis}`);
        if (farmaco.dosisDia) lineas.push(`Dosis/día: ${farmaco.dosisDia}`);
        if (farmaco.dosisMaxima) lineas.push(`Dosis máxima: ${farmaco.dosisMaxima}`);
        if (farmaco.frecuencia) lineas.push(`Frecuencia: ${farmaco.frecuencia}`);
        if (farmaco.reconstitucion) lineas.push(`Reconstitución: ${farmaco.reconstitucion}`);
        if (farmaco.concentracionDilucion) lineas.push(`Concentración en dilución: ${farmaco.concentracionDilucion}`);
        if (farmaco.solvente) lineas.push(`Solvente: ${farmaco.solvente}`);
        if (farmaco.estabilidad) lineas.push(`Estabilidad: ${farmaco.estabilidad}`);
        if (farmaco.velocidad) lineas.push(`Velocidad infusión: ${farmaco.velocidad}`);
        if (farmaco.dilucion && farmaco.dilucion !== "---") lineas.push(`Dilución: ${farmaco.dilucion}`);
        if (farmaco.mecanismoAccion) lineas.push(`Mecanismo de acción: ${farmaco.mecanismoAccion}`);
        if (farmaco.reaccionesAdversas && farmaco.reaccionesAdversas !== "---") lineas.push(`Reacciones adversas: ${farmaco.reaccionesAdversas}`);
        if (farmaco.interacciones && farmaco.interacciones !== "---") lineas.push(`Interacciones: ${farmaco.interacciones}`);
        if (farmaco.cuidados && farmaco.cuidados !== "---") lineas.push(`Cuidados especiales: ${farmaco.cuidados}`);
        lineas.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        try {
            await navigator.clipboard.writeText(lineas.join("\n"));
            toast.success("Información copiada al portapapeles", {
                duration: 2500,
            });
        } catch {
            // fallback silencioso
        }
    }, [farmaco, cat]);

    const handleToggleFavorito = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            toggleFavorito(farmaco.id);
            if (favorito) {
                toast("Eliminado de favoritos", {
                    icon: "☆",
                    duration: 2000,
                });
            } else {
                toast.success("Añadido a favoritos", {
                    icon: "★",
                    duration: 2000,
                });
            }
        },
        [farmaco.id, favorito, toggleFavorito]
    );

    return (
        <div
            id={`farmaco-${farmaco.id}`}
            className={`group relative rounded-2xl border-2 ${cat.border} bg-white dark:bg-gray-800 shadow-md hover:shadow-xl dark:shadow-none
                  transition-all duration-300 overflow-hidden`}
        >
            {/* Barra de color superior */}
            <div className={`h-1.5 w-full ${cat.badgeBg} opacity-80`} />

            {/* Botón favorito (esquina superior derecha) */}
            <button
                onClick={handleToggleFavorito}
                aria-label={favorito ? "Quitar de favoritos" : "Añadir a favoritos"}
                className={`absolute top-3 right-3 z-10 p-1.5 rounded-lg transition-all duration-200
                    ${favorito
                        ? "text-yellow-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                        : "text-gray-300 dark:text-gray-600 hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                    }`}
            >
                <svg
                    className="w-4 h-4"
                    fill={favorito ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                </svg>
            </button>

            {/* Header clicable */}
            <button
                onClick={() => setExpandido(!expandido)}
                className="w-full text-left px-5 pt-4 pb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-t-2xl"
                aria-expanded={expandido}
                id={`card-${farmaco.id}`}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 pr-6">
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

                {/* Info rápida visible siempre */}
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    {farmaco.dosis && (
                        <span className="text-gray-600 dark:text-gray-400">
                            <span className="font-semibold text-gray-800 dark:text-gray-200">Dosis:</span>{" "}
                            {farmaco.dosis}
                        </span>
                    )}
                    {farmaco.frecuencia && (
                        <span className="text-gray-600 dark:text-gray-400">
                            <span className="font-semibold text-gray-800 dark:text-gray-200">Freq:</span>{" "}
                            {farmaco.frecuencia}
                        </span>
                    )}
                    {!farmaco.dosis && farmaco.dilucion && farmaco.dilucion !== "---" && (
                        <span className="text-gray-600 dark:text-gray-400">
                            <span className="font-semibold text-gray-800 dark:text-gray-200">Dilución:</span>{" "}
                            {farmaco.dilucion}
                        </span>
                    )}
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
                className={`transition-all duration-300 ease-in-out overflow-hidden ${expandido ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="px-5 pb-5 space-y-5 border-t border-gray-100 dark:border-gray-700 pt-4">

                    {/* Tabla de datos de administración (sólo si hay campos) */}
                    {filasAdmin.length > 0 && (
                        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {filasAdmin.map(({ key, label }, idx) => (
                                        <tr
                                            key={key}
                                            className={idx % 2 === 0 ? "bg-gray-50 dark:bg-gray-700/30" : "bg-white dark:bg-gray-800"}
                                        >
                                            <td className="px-4 py-2.5 font-semibold text-gray-600 dark:text-gray-400 w-1/3 align-top">
                                                {label}
                                            </td>
                                            <td className="px-4 py-2.5 text-gray-800 dark:text-gray-200 font-medium">
                                                {farmaco[key]}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Secciones farmacológicas nuevas */}
                    {camposFarmacologia.map(({ key, label }) => {
                        const valor = farmaco[key];
                        if (!valor || valor === "---") return null;
                        return (
                            <div key={key} className="rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 p-4">
                                <p className="font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wide mb-2">
                                    {label}
                                </p>
                                <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
                                    {valor}
                                </p>
                            </div>
                        );
                    })}

                    {/* Cuidados especiales */}
                    {farmaco.cuidados && farmaco.cuidados !== "---" && (
                        <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 p-4">
                            <div className="flex items-start gap-2">
                                <span className="text-lg shrink-0">⚠️</span>
                                <div>
                                    <p className="font-bold text-amber-800 dark:text-amber-300 text-sm uppercase tracking-wide mb-1">
                                        Cuidados de Enfermería
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
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold
                        transition-all duration-200 border-2
                        bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300
                        hover:border-blue-400 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        id={`copy-${farmaco.id}`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copiar información
                    </button>
                </div>
            </div>
        </div>
    );
}
