// BotonFavoritoExpandible.tsx
// Botón circular expandible con degradado y glow — inspirado en gradient-menu de 21st.dev
"use client";

import React, { useState } from "react";
import { Pill } from "lucide-react";

interface BotonFavoritoExpandibleProps {
    nombre: string;
    onClick: () => void;
    /** Color base del degradado en hex, ej. "#3b82f6" */
    color?: string;
}

// Degradados por color base para el glow y el fondo
const GRADIENTS: Record<string, { from: string; to: string; glow: string }> = {
    "#3b82f6": { from: "#3b82f6", to: "#6366f1", glow: "rgba(99,102,241,0.55)" },
    "#10b981": { from: "#10b981", to: "#0d9488", glow: "rgba(16,185,129,0.55)" },
    "#8b5cf6": { from: "#8b5cf6", to: "#ec4899", glow: "rgba(139,92,246,0.55)" },
    "#f59e0b": { from: "#f59e0b", to: "#ef4444", glow: "rgba(245,158,11,0.55)" },
    "#ef4444": { from: "#ef4444", to: "#f97316", glow: "rgba(239,68,68,0.55)" },
    "#14b8a6": { from: "#14b8a6", to: "#3b82f6", glow: "rgba(20,184,166,0.55)" },
};

const DEFAULT_GRADIENT = { from: "#6366f1", to: "#3b82f6", glow: "rgba(99,102,241,0.55)" };

export default function BotonFavoritoExpandible({
    nombre,
    onClick,
    color = "#6366f1",
}: BotonFavoritoExpandibleProps) {
    const [hovered, setHovered] = useState(false);
    const grad = GRADIENTS[color] ?? DEFAULT_GRADIENT;

    // Nombre truncado a 14 chars para que quepa bien
    const label = nombre.length > 14 ? nombre.slice(0, 13) + "…" : nombre;

    return (
        <li className="list-none">
            <button
                onClick={onClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onFocus={() => setHovered(true)}
                onBlur={() => setHovered(false)}
                aria-label={`Ir a ${nombre}`}
                style={{
                    // Ancho dinámico: colapsado=50px, expandido según texto
                    width: hovered ? `${Math.max(130, label.length * 9 + 52)}px` : "50px",
                    // Sombra glow al hacer hover
                    boxShadow: hovered
                        ? `0 0 18px 4px ${grad.glow}, 0 2px 12px rgba(0,0,0,0.35)`
                        : "0 2px 8px rgba(0,0,0,0.25)",
                    background: `linear-gradient(135deg, ${grad.from}, ${grad.to})`,
                    transition: "width 420ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 300ms ease",
                }}
                className="relative h-[50px] rounded-full overflow-hidden flex items-center
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
                {/* Blur blob decorativo */}
                <span
                    aria-hidden="true"
                    style={{
                        background: `radial-gradient(circle at 30% 50%, ${grad.to}88, transparent 70%)`,
                        transition: "opacity 300ms ease",
                        opacity: hovered ? 1 : 0,
                    }}
                    className="absolute inset-0 pointer-events-none"
                />

                {/* Ícono — visible cuando está colapsado */}
                <span
                    style={{
                        transform: hovered ? "scale(0)" : "scale(1)",
                        opacity: hovered ? 0 : 1,
                        transition: "transform 250ms ease, opacity 200ms ease",
                    }}
                    className="absolute left-0 w-[50px] h-[50px] flex items-center justify-center shrink-0"
                >
                    <Pill className="w-5 h-5 text-white" />
                </span>

                {/* Texto — visible cuando está expandido */}
                <span
                    style={{
                        transform: hovered ? "scale(1)" : "scale(0.7)",
                        opacity: hovered ? 1 : 0,
                        transition: "transform 280ms cubic-bezier(0.34,1.4,0.64,1) 60ms, opacity 200ms ease 60ms",
                    }}
                    className="absolute inset-0 flex items-center justify-center px-4"
                >
                    <span className="text-white text-[11px] font-bold tracking-wide uppercase whitespace-nowrap">
                        {label}
                    </span>
                </span>
            </button>
        </li>
    );
}
