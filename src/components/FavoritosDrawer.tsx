// FavoritosDrawer.tsx — Favoritos en Bottom Sheet (vaul) para móvil
// Solo se renderiza en pantallas < md. El Popover cubre md+.
"use client";

import React from "react";
import { Drawer } from "vaul";
import { Pill, ChevronRight, Star } from "lucide-react";
import { useFavoritos } from "@/hooks/useFavoritos";
import { Farmaco, CategoriaFarmaco } from "@/types/farmaco";
import farmacos from "@/data/farmacos.json";

// ── Colores por categoría (idénticos a FavoritosPopover) ──────────────────
const COLOR_CATEGORIA: Record<CategoriaFarmaco, { from: string; to: string; label: string }> = {
    antibacteriano: { from: "#3b82f6", to: "#6366f1", label: "Antibacteriano" },
    antifungico:    { from: "#10b981", to: "#0d9488", label: "Antifúngico" },
    antiviral:      { from: "#8b5cf6", to: "#ec4899", label: "Antiviral" },
    aine_analgesico:{ from: "#f59e0b", to: "#ef4444", label: "AINE / Analgésico" },
    opioide:        { from: "#ef4444", to: "#f97316", label: "Opioide" },
    digestivo:      { from: "#14b8a6", to: "#3b82f6", label: "Digestivo" },
    vitamina:       { from: "#f59e0b", to: "#fb923c", label: "Vitamina" },
    mineral:        { from: "#6366f1", to: "#3b82f6", label: "Mineral / Electrolito" },
    corticoide:     { from: "#eab308", to: "#f59e0b", label: "Corticoide" },
    oncologico:     { from: "#ef4444", to: "#f97316", label: "Oncológico" },
    "psicofármaco": { from: "#8b5cf6", to: "#ec4899", label: "Psicofármaco" },
};

const DEFAULT_COLOR = { from: "#6366f1", to: "#3b82f6", label: "Fármaco" };

// ── Scroll + flash ─────────────────────────────────────────────────────────
function irAFarmaco(id: string, cerrar: () => void) {
    cerrar();
    setTimeout(() => {
        const el = document.getElementById(`farmaco-${id}`);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.style.transition = "outline 0ms";
        el.style.outline = "2px solid #facc15";
        el.style.outlineOffset = "3px";
        setTimeout(() => {
            el.style.outline = "";
            el.style.outlineOffset = "";
        }, 1400);
    }, 80);
}

// ── Componente ─────────────────────────────────────────────────────────────
export default function FavoritosDrawer() {
    const { favoritos } = useFavoritos();
    const [abierto, setAbierto] = React.useState(false);

    const farmacosFavoritos = (farmacos as Farmaco[]).filter((f) =>
        favoritos.includes(f.id)
    );

    return (
        <Drawer.Root open={abierto} onOpenChange={setAbierto}>
            {/* ── Trigger: botón del header ── */}
            <Drawer.Trigger asChild>
                <button
                    aria-label="Ver fármacos favoritos"
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
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                    </svg>
                    <span>
                        Favoritos{favoritos.length > 0 ? ` (${favoritos.length})` : ""}
                    </span>
                    {favoritos.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 text-gray-900 text-[10px] font-bold flex items-center justify-center">
                            {favoritos.length}
                        </span>
                    )}
                </button>
            </Drawer.Trigger>

            {/* ── Drawer ── */}
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />

                <Drawer.Content
                    className="bg-[#09090b] border-t border-zinc-800 rounded-t-[10px]
                               fixed bottom-0 left-0 right-0 z-50 flex flex-col
                               outline-none max-h-[80dvh]"
                >
                    {/* Handle */}
                    <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mt-4 mb-1 shrink-0" />

                    {/* Header del drawer */}
                    <div className="flex items-center justify-between px-5 pt-3 pb-4 shrink-0">
                        <div>
                            <Drawer.Title className="text-base font-bold text-white">
                                Fármacos guardados
                            </Drawer.Title>
                            <p className="text-xs text-zinc-500 mt-0.5">
                                {farmacosFavoritos.length > 0
                                    ? `${farmacosFavoritos.length} guardado${farmacosFavoritos.length !== 1 ? "s" : ""}`
                                    : "Toca la estrella ★ en una tarjeta para guardar"}
                            </p>
                        </div>
                        <button
                            onClick={() => setAbierto(false)}
                            className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                            aria-label="Cerrar"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Lista / estado vacío */}
                    <div className="overflow-y-auto overscroll-contain flex-1 px-4 pb-6">
                        {farmacosFavoritos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                                <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center">
                                    <Star className="w-7 h-7 text-zinc-600" />
                                </div>
                                <p className="text-sm text-zinc-400 font-medium">
                                    Aún no hay favoritos
                                </p>
                                <p className="text-xs text-zinc-600 max-w-xs">
                                    Abre cualquier tarjeta de fármaco y toca la estrella para guardarlo aquí.
                                </p>
                            </div>
                        ) : (
                            <ul className="flex flex-col divide-y divide-zinc-800/60">
                                {farmacosFavoritos.map((f) => {
                                    const col = COLOR_CATEGORIA[f.categoria] ?? DEFAULT_COLOR;
                                    return (
                                        <li key={f.id}>
                                            <button
                                                onClick={() => irAFarmaco(f.id, () => setAbierto(false))}
                                                className="w-full flex items-center gap-4 py-3.5 text-left
                                                           hover:bg-zinc-900/60 active:bg-zinc-900
                                                           rounded-xl transition-colors px-1"
                                            >
                                                {/* Ícono con degradado */}
                                                <span
                                                    style={{
                                                        background: `linear-gradient(135deg, ${col.from}, ${col.to})`,
                                                        boxShadow: `0 0 12px 2px ${col.from}55`,
                                                    }}
                                                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                                                >
                                                    <Pill className="w-5 h-5 text-white" />
                                                </span>

                                                {/* Texto */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-white leading-tight truncate">
                                                        {f.nombre}
                                                    </p>
                                                    <p className="text-xs text-zinc-500 mt-0.5 capitalize">
                                                        {col.label}
                                                    </p>
                                                </div>

                                                {/* Chevron */}
                                                <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
