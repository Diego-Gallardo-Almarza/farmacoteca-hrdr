// FavoritosPopover.tsx — Botón con menú flotante de favoritos con botones expansibles
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFavoritos } from "@/hooks/useFavoritos";
import { Farmaco, CategoriaFarmaco } from "@/types/farmaco";
import farmacos from "@/data/farmacos.json";
import BotonFavoritoExpandible from "./ui/BotonFavoritoExpandible";

// Color del degradado según categoría del fármaco
const COLOR_CATEGORIA: Record<CategoriaFarmaco, string> = {
    antibacteriano: "#3b82f6",
    antifungico: "#10b981",
    antiviral: "#8b5cf6",
    aine_analgesico: "#f59e0b",
    opioide: "#ef4444",
    digestivo: "#14b8a6",
    vitamina: "#f59e0b",
    mineral: "#6366f1",
    corticoide: "#f59e0b",
    oncologico: "#ef4444",
    "psicofármaco": "#8b5cf6",
};

export default function FavoritosPopover() {
    const [abierto, setAbierto] = useState(false);
    const { favoritos } = useFavoritos();
    const ref = useRef<HTMLDivElement>(null);

    const farmacosFavoritos = (farmacos as Farmaco[]).filter((f) =>
        favoritos.includes(f.id)
    );

    // Cerrar al hacer clic fuera
    useEffect(() => {
        if (!abierto) return;
        const fn = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setAbierto(false);
            }
        };
        document.addEventListener("mousedown", fn);
        return () => document.removeEventListener("mousedown", fn);
    }, [abierto]);

    // Cerrar con Escape
    useEffect(() => {
        if (!abierto) return;
        const fn = (e: KeyboardEvent) => {
            if (e.key === "Escape") setAbierto(false);
        };
        window.addEventListener("keydown", fn);
        return () => window.removeEventListener("keydown", fn);
    }, [abierto]);

    const irAFarmaco = (id: string) => {
        setAbierto(false);
        // Pequeño delay para que el popover cierre antes del scroll
        setTimeout(() => {
            const el = document.getElementById(`farmaco-${id}`);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                // Flash visual para identificar la tarjeta
                el.style.transition = "outline 0ms";
                el.style.outline = "2px solid #facc15";
                el.style.outlineOffset = "3px";
                setTimeout(() => {
                    el.style.outline = "";
                    el.style.outlineOffset = "";
                }, 1400);
            }
        }, 80);
    };

    return (
        <div className="relative" ref={ref}>
            {/* Botón disparador */}
            <button
                onClick={() => setAbierto((v) => !v)}
                aria-label="Ver fármacos favoritos"
                aria-expanded={abierto}
                className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                           text-blue-200 hover:text-white hover:bg-white/10
                           text-sm font-medium transition-all"
            >
                <svg
                    className="w-4 h-4"
                    fill={favoritos.length > 0 ? "currentColor" : "none"}
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
                <span className="hidden sm:inline">Favoritos</span>
                {favoritos.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 text-gray-900 text-[10px] font-bold flex items-center justify-center">
                        {favoritos.length}
                    </span>
                )}
            </button>

            {/* Popover */}
            {abierto && (
                <div
                    className="absolute right-0 top-full mt-2 z-50
                               bg-gray-950 rounded-2xl shadow-2xl
                               border border-zinc-800
                               overflow-hidden animate-fade-in-up"
                    style={{ minWidth: "200px", maxWidth: "calc(100vw - 2rem)" }}
                >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-zinc-100">
                            Fármacos guardados
                        </h3>
                        {farmacosFavoritos.length > 0 && (
                            <span className="text-xs text-zinc-500">
                                {farmacosFavoritos.length} guardado{farmacosFavoritos.length !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>

                    {farmacosFavoritos.length === 0 ? (
                        /* Estado vacío */
                        <div className="px-4 py-6 text-center">
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-2">
                                <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                            <p className="text-sm text-zinc-400">No hay fármacos guardados</p>
                            <p className="text-xs text-zinc-600 mt-1">
                                Toca la estrella en una tarjeta para guardar
                            </p>
                        </div>
                    ) : (
                        /* Lista de botones expandibles */
                        <ul
                            className="px-4 py-4 flex flex-col gap-3 max-h-72 overflow-y-auto"
                            style={{ scrollbarWidth: "none" }}
                        >
                            {farmacosFavoritos.map((f) => (
                                <BotonFavoritoExpandible
                                    key={f.id}
                                    nombre={f.nombre}
                                    color={COLOR_CATEGORIA[f.categoria] ?? "#6366f1"}
                                    onClick={() => irAFarmaco(f.id)}
                                />
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
