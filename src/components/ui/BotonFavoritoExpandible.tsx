// BotonFavoritoExpandible.tsx
// Mobile-first: siempre expandido en táctil; colapsado+hover en desktop (md+)
// Sin estado JS — 100% CSS driven vía Tailwind breakpoints + group
"use client";

import React from "react";
import { Pill } from "lucide-react";

interface BotonFavoritoExpandibleProps {
    nombre: string;
    onClick: () => void;
    /** Color base del degradado en hex, ej. "#3b82f6" */
    color?: string;
}

const GRADIENTS: Record<string, { from: string; to: string }> = {
    "#3b82f6": { from: "#3b82f6", to: "#6366f1" },
    "#10b981": { from: "#10b981", to: "#0d9488" },
    "#8b5cf6": { from: "#8b5cf6", to: "#ec4899" },
    "#f59e0b": { from: "#f59e0b", to: "#ef4444" },
    "#ef4444": { from: "#ef4444", to: "#f97316" },
    "#14b8a6": { from: "#14b8a6", to: "#3b82f6" },
    "#6366f1": { from: "#6366f1", to: "#3b82f6" },
};

const DEFAULT_GRADIENT = { from: "#6366f1", to: "#3b82f6" };

export default function BotonFavoritoExpandible({
    nombre,
    onClick,
    color = "#6366f1",
}: BotonFavoritoExpandibleProps) {
    const grad = GRADIENTS[color] ?? DEFAULT_GRADIENT;

    // Truncar para que quepa dentro del botón expandido
    const label = nombre.length > 16 ? nombre.slice(0, 15) + "…" : nombre;

    return (
        <li className="list-none">
            <button
                onClick={onClick}
                aria-label={`Ir a ${nombre}`}
                style={{
                    background: `linear-gradient(135deg, ${grad.from}, ${grad.to})`,
                    // La transición de width la gestiona CSS; box-shadow es estático en móvil
                    transition:
                        "width 420ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 300ms ease",
                }}
                className={[
                    // Base
                    "group relative h-[50px] rounded-full overflow-hidden flex items-center",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                    "shadow-[0_2px_10px_rgba(0,0,0,0.3)]",
                    // ── ANCHO ──
                    // Móvil: siempre expandido
                    "w-[200px]",
                    // Desktop: colapsado por defecto, se expande al hover
                    "md:w-[50px]",
                    "md:hover:w-[200px]",
                    "md:hover:shadow-[0_0_22px_4px_rgba(255,255,255,0.12)]",
                ].join(" ")}
            >
                {/* ── Blur blob decorativo (solo desktop hover) ── */}
                <span
                    aria-hidden="true"
                    style={{
                        background: `radial-gradient(circle at 30% 50%, ${grad.to}99, transparent 70%)`,
                    }}
                    className={[
                        "absolute inset-0 pointer-events-none",
                        // Móvil: visible siempre para dar profundidad
                        "opacity-60",
                        // Desktop: oculto colapsado, visible en hover
                        "md:opacity-0 md:group-hover:opacity-100",
                        "transition-opacity duration-300",
                    ].join(" ")}
                />

                {/* ── Ícono Pill ── */}
                {/* Móvil: oculto (el texto ocupa todo el espacio) */}
                {/* Desktop: visible cuando está colapsado, desaparece en hover */}
                <span
                    className={[
                        "absolute left-0 w-[50px] h-[50px] flex items-center justify-center shrink-0",
                        // Móvil: invisible
                        "scale-0 opacity-0",
                        // Desktop colapsado: visible
                        "md:scale-100 md:opacity-100",
                        // Desktop hover: desaparece
                        "md:group-hover:scale-0 md:group-hover:opacity-0",
                        "transition-all duration-200",
                    ].join(" ")}
                >
                    <Pill className="w-5 h-5 text-white" />
                </span>

                {/* ── Texto del fármaco ── */}
                {/* Móvil: siempre visible */}
                {/* Desktop: oculto colapsado, aparece en hover */}
                <span
                    className={[
                        "absolute inset-0 flex items-center justify-center px-4",
                        // Móvil: siempre visible
                        "scale-100 opacity-100",
                        // Desktop colapsado: oculto
                        "md:scale-75 md:opacity-0",
                        // Desktop hover: visible con spring
                        "md:group-hover:scale-100 md:group-hover:opacity-100",
                        "transition-all duration-300 delay-[40ms]",
                    ].join(" ")}
                >
                    <span className="text-white text-[11px] font-bold tracking-wide uppercase whitespace-nowrap drop-shadow-sm">
                        {label}
                    </span>
                </span>
            </button>
        </li>
    );
}
