// CalculadoraDosis.tsx
// Calculadora clínica de dosis para internos de enfermería — con Bottom Sheet (vaul)
"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Drawer } from "vaul";

/* ─── tipos ──────────────────────────────────────────────────────────── */
type Modo = "continua" | "bolo" | "goteo";

/* ─── helpers ────────────────────────────────────────────────────────── */
function n(v: string): number {
    const parsed = parseFloat(v.replace(",", "."));
    return isNaN(parsed) || parsed <= 0 ? 0 : parsed;
}

function fmt(v: number, dec = 2): string {
    if (!isFinite(v) || v <= 0) return "—";
    return v.toFixed(dec);
}

/* ─── componente ─────────────────────────────────────────────────────── */
export default function CalculadoraDosis() {
    const [abierto, setAbierto] = useState(false);
    const [modo, setModo] = useState<Modo>("continua");

    // Inputs compartidos (infusión)
    const [mgAmpolla, setMgAmpolla] = useState("");
    const [mlDilucion, setMlDilucion] = useState("");

    // Modo continua — dosis absoluta en mcg/min
    const [dosisMcgMin, setDosisMcgMin] = useState("");

    // Modo bolo — dosis absoluta en mg
    const [dosisMgTotal, setDosisMgTotal] = useState("");
    const [tiempoMin, setTiempoMin] = useState("30");

    // Modo goteo
    const [volGoteo, setVolGoteo] = useState("");
    const [tiempoGoteo, setTiempoGoteo] = useState("");

    /* ─── cálculos infusión ──────────────────────────────────────────── */
    const resultadosInfusion = useMemo(() => {
        const mg = n(mgAmpolla);
        const ml = n(mlDilucion);
        if (!mg || !ml) return null;

        const concMgMl = mg / ml;
        const concMcgMl = concMgMl * 1000;

        if (modo === "continua") {
            const dosis = n(dosisMcgMin); // mcg/min absolutos
            if (!dosis) return { concMcgMl, concMgMl, modo: "continua" as const };

            // ml/hr = dosis(mcg/min) * 60 / concentración(mcg/ml)
            const mlHr = (dosis * 60) / concMcgMl;
            // Dosis en mg/hr para confirmar
            const mgHr = dosis * 60 / 1000;

            return { concMcgMl, concMgMl, mlHr, mgHr, modo: "continua" as const };
        } else {
            const dosisTotal = n(dosisMgTotal); // mg totales
            const tMin = n(tiempoMin);
            if (!dosisTotal) return { concMcgMl, concMgMl, modo: "bolo" as const };

            const volAdm = dosisTotal / concMgMl;
            const mlHr = tMin > 0 ? (volAdm / tMin) * 60 : 0;

            return { concMcgMl, concMgMl, volAdm, dosisTotal, mlHr, modo: "bolo" as const };
        }
    }, [mgAmpolla, mlDilucion, dosisMcgMin, dosisMgTotal, tiempoMin, modo]);

    /* ─── cálculos goteo ─────────────────────────────────────────────── */
    const resultadosGoteo = useMemo(() => {
        const vol = n(volGoteo);
        const tiempo = n(tiempoGoteo);
        if (!vol || !tiempo) return null;

        const microgotas = (vol * 60) / tiempo;   // factor 60 gtt/ml
        const macrogotas = (vol * 20) / tiempo;   // factor 20 gtt/ml
        const mlHr = (vol / tiempo) * 60;

        return { microgotas, macrogotas, mlHr };
    }, [volGoteo, tiempoGoteo]);

    const limpiar = useCallback(() => {
        setMgAmpolla("");
        setMlDilucion("");
        setDosisMcgMin("");
        setDosisMgTotal("");
        setTiempoMin("30");
        setVolGoteo("");
        setTiempoGoteo("");
    }, []);

    /* ─── render ─────────────────────────────────────────────────────── */
    return (
        <Drawer.Root open={abierto} onOpenChange={setAbierto}>
            {/* ── Botón disparador ── */}
            <Drawer.Trigger asChild>
                <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                               bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-700
                               text-indigo-700 dark:text-indigo-400 text-sm font-semibold
                               hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-400
                               transition-all shadow-sm"
                    aria-label="Abrir calculadora de dosis"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" />
                    </svg>
                    Calculadora de dosis
                </button>
            </Drawer.Trigger>

            {/* ── Portal del Drawer ── */}
            <Drawer.Portal>
                {/* Overlay */}
                <Drawer.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />

                {/* Panel inferior */}
                <Drawer.Content
                    className="bg-[#09090b] border-t border-zinc-800 rounded-t-[10px] fixed bottom-0 left-0 right-0 z-50 flex flex-col outline-none max-h-[96%]"
                    aria-labelledby="calc-titulo"
                >
                    {/* Handle de arrastre */}
                    <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mt-4 mb-6 shrink-0" />

                    {/* Contenido scrollable */}
                    <div className="overflow-y-auto overscroll-contain flex-1 px-4 pb-2">

                        {/* ── Banner de advertencia ── */}
                        <div className="flex items-start gap-3 px-4 py-4 bg-red-600 text-white mt-2 rounded-2xl">
                            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                            <p className="text-sm font-semibold leading-snug">
                                ADVERTENCIA: Herramienta de apoyo al estudio.
                                Verifique todos los cálculos clínicamente antes de administrar cualquier fármaco.
                            </p>
                        </div>

                        {/* ── Encabezado ── */}
                        <div className="flex items-center justify-between pt-4 pb-2">
                            <div>
                                <Drawer.Title id="calc-titulo" className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    Calculadora Clínica
                                </Drawer.Title>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Farmacoteca HRDR</p>
                            </div>
                            <button
                                onClick={() => setAbierto(false)}
                                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
                                           hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                aria-label="Cerrar calculadora"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* ── Toggle de modo (3 pestañas) ── */}
                        <div className="pb-3">
                            <div className="flex rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden text-sm font-semibold">
                                {(["continua", "bolo", "goteo"] as Modo[]).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setModo(m)}
                                        className={`flex-1 px-3 py-2 transition-colors capitalize ${
                                            modo === m
                                                ? "bg-indigo-600 text-white"
                                                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        }`}
                                    >
                                        {m === "continua" ? "Continua" : m === "bolo" ? "Bolo" : "Goteo"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Formulario ── */}
                        <div className="pb-8 space-y-4">

                            {/* ══ MODOS INFUSIÓN (continua / bolo) ══ */}
                            {(modo === "continua" || modo === "bolo") && (
                                <>
                                    {/* Preparación de la solución */}
                                    <fieldset className="space-y-3">
                                        <legend className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                            Preparación de la solución
                                        </legend>
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className="block">
                                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                                                    Fármaco en ampolla (mg)
                                                </span>
                                                <input
                                                    type="number" min="0" step="any"
                                                    value={mgAmpolla}
                                                    onChange={(e) => setMgAmpolla(e.target.value)}
                                                    placeholder="ej. 50"
                                                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600
                                                               bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm
                                                               focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100
                                                               dark:focus:ring-indigo-900/30 transition-all"
                                                />
                                            </label>
                                            <label className="block">
                                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                                                    Volumen a diluir (ml)
                                                </span>
                                                <input
                                                    type="number" min="0" step="any"
                                                    value={mlDilucion}
                                                    onChange={(e) => setMlDilucion(e.target.value)}
                                                    placeholder="ej. 50"
                                                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600
                                                               bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm
                                                               focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100
                                                               dark:focus:ring-indigo-900/30 transition-all"
                                                />
                                            </label>
                                        </div>
                                    </fieldset>

                                    {/* Prescripción */}
                                    <fieldset className="space-y-3">
                                        <legend className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                            Prescripción
                                        </legend>

                                        {modo === "continua" ? (
                                            <label className="block">
                                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                                                    Dosis indicada (mcg/min)
                                                </span>
                                                <input
                                                    type="number" min="0" step="any"
                                                    value={dosisMcgMin}
                                                    onChange={(e) => setDosisMcgMin(e.target.value)}
                                                    placeholder="ej. 200"
                                                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600
                                                               bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm
                                                               focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100
                                                               dark:focus:ring-indigo-900/30 transition-all"
                                                />
                                            </label>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3">
                                                <label className="block">
                                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                                                        Dosis total (mg)
                                                    </span>
                                                    <input
                                                        type="number" min="0" step="any"
                                                        value={dosisMgTotal}
                                                        onChange={(e) => setDosisMgTotal(e.target.value)}
                                                        placeholder="ej. 5"
                                                        className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600
                                                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm
                                                                   focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100
                                                                   dark:focus:ring-indigo-900/30 transition-all"
                                                    />
                                                </label>
                                                <label className="block">
                                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                                                        Pasar en (min)
                                                    </span>
                                                    <input
                                                        type="number" min="1" step="1"
                                                        value={tiempoMin}
                                                        onChange={(e) => setTiempoMin(e.target.value)}
                                                        placeholder="ej. 30"
                                                        className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600
                                                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm
                                                                   focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100
                                                                   dark:focus:ring-indigo-900/30 transition-all"
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    </fieldset>

                                    {/* Resultados infusión */}
                                    <div className="rounded-xl overflow-hidden border-2 border-indigo-200 dark:border-indigo-800">
                                        {resultadosInfusion && (
                                            <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-900/30 border-b border-indigo-200 dark:border-indigo-800">
                                                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-1">
                                                    Concentración de la solución
                                                </p>
                                                <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                                                    {fmt(resultadosInfusion.concMgMl, 3)} mg/ml
                                                    <span className="text-indigo-500 dark:text-indigo-400 font-normal mx-2">·</span>
                                                    {fmt(resultadosInfusion.concMcgMl, 1)} mcg/ml
                                                </p>
                                            </div>
                                        )}

                                        <div className="divide-y divide-indigo-100 dark:divide-indigo-900">
                                            <ResultRow
                                                label="Velocidad de infusión"
                                                valor={resultadosInfusion?.mlHr}
                                                unidad="ml/hr"
                                                decimales={2}
                                                destacado
                                            />
                                            {modo === "continua" && (
                                                <ResultRow
                                                    label="Dosis en mg/hr"
                                                    valor={resultadosInfusion?.mgHr}
                                                    unidad="mg/hr"
                                                    decimales={3}
                                                />
                                            )}
                                            {modo === "bolo" && resultadosInfusion?.modo === "bolo" && (
                                                <>
                                                    <ResultRow
                                                        label="Dosis total"
                                                        valor={resultadosInfusion.dosisTotal}
                                                        unidad="mg"
                                                        decimales={3}
                                                    />
                                                    <ResultRow
                                                        label="Volumen a administrar"
                                                        valor={resultadosInfusion.volAdm}
                                                        unidad="ml"
                                                        decimales={2}
                                                        destacado
                                                    />
                                                </>
                                            )}
                                        </div>

                                        {!resultadosInfusion && (
                                            <div className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                                                Ingresa los datos para ver los resultados
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* ══ MODO GOTEO ══ */}
                            {modo === "goteo" && (
                                <>
                                    <fieldset className="space-y-3">
                                        <legend className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                            Datos de la sueroterapia
                                        </legend>
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className="block">
                                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                                                    Volumen total (ml)
                                                </span>
                                                <input
                                                    type="number" min="0" step="any"
                                                    value={volGoteo}
                                                    onChange={(e) => setVolGoteo(e.target.value)}
                                                    placeholder="ej. 500"
                                                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600
                                                               bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm
                                                               focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100
                                                               dark:focus:ring-indigo-900/30 transition-all"
                                                />
                                            </label>
                                            <label className="block">
                                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                                                    Tiempo a pasar (min)
                                                </span>
                                                <input
                                                    type="number" min="1" step="1"
                                                    value={tiempoGoteo}
                                                    onChange={(e) => setTiempoGoteo(e.target.value)}
                                                    placeholder="ej. 240"
                                                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600
                                                               bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm
                                                               focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100
                                                               dark:focus:ring-indigo-900/30 transition-all"
                                                />
                                            </label>
                                        </div>
                                    </fieldset>

                                    {/* Referencia de factores */}
                                    <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 font-mono">
                                            Micro: 60 gtt/ml
                                        </span>
                                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 font-mono">
                                            Macro: 20 gtt/ml
                                        </span>
                                    </div>

                                    {/* Resultados goteo */}
                                    <div className="rounded-xl overflow-hidden border-2 border-teal-200 dark:border-teal-800">
                                        <div className="divide-y divide-teal-100 dark:divide-teal-900">
                                            <GoteoRow
                                                label="Microgotas"
                                                valor={resultadosGoteo?.microgotas}
                                                unidad="microgotas/min"
                                                destacado
                                            />
                                            <GoteoRow
                                                label="Macrogotas"
                                                valor={resultadosGoteo?.macrogotas}
                                                unidad="gotas/min"
                                                destacado
                                            />
                                            <GoteoRow
                                                label="Velocidad bomba"
                                                valor={resultadosGoteo?.mlHr}
                                                unidad="ml/hr"
                                                destacado
                                            />
                                        </div>

                                        {!resultadosGoteo && (
                                            <div className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                                                Ingresa el volumen y el tiempo para ver los resultados
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Botón limpiar */}
                            <button
                                onClick={limpiar}
                                className="w-full py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700
                                           text-gray-500 dark:text-gray-400 text-sm font-semibold
                                           hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 transition-all"
                            >
                                Limpiar campos
                            </button>
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}

/* ─── fila de resultado (infusión) ───────────────────────────────────── */
function ResultRow({
    label,
    valor,
    unidad,
    decimales = 2,
    destacado = false,
}: {
    label: string;
    valor?: number;
    unidad: string;
    decimales?: number;
    destacado?: boolean;
}) {
    const texto = valor !== undefined && valor > 0 ? fmt(valor, decimales) : "—";
    const tieneValor = texto !== "—";

    return (
        <div className={`flex items-center justify-between px-4 py-3
            ${destacado ? "bg-white dark:bg-gray-900" : "bg-indigo-50/40 dark:bg-indigo-900/10"}`}>
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</span>
            <span className={`text-sm font-bold tabular-nums
                ${tieneValor
                    ? destacado
                        ? "text-indigo-700 dark:text-indigo-300 text-base"
                        : "text-gray-800 dark:text-gray-200"
                    : "text-gray-300 dark:text-gray-600"}`}>
                {texto}
                {tieneValor && (
                    <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-1">{unidad}</span>
                )}
            </span>
        </div>
    );
}

/* ─── fila de resultado (goteo) ──────────────────────────────────────── */
function GoteoRow({
    label,
    valor,
    unidad,
    destacado = false,
}: {
    label: string;
    valor?: number;
    unidad: string;
    destacado?: boolean;
}) {
    const texto = valor !== undefined && valor > 0 ? fmt(valor, 1) : "—";
    const tieneValor = texto !== "—";

    return (
        <div className={`flex items-center justify-between px-4 py-3
            ${destacado ? "bg-white dark:bg-gray-900" : "bg-teal-50/40 dark:bg-teal-900/10"}`}>
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</span>
            <span className={`text-sm font-bold tabular-nums
                ${tieneValor
                    ? "text-teal-700 dark:text-teal-300 text-base"
                    : "text-gray-300 dark:text-gray-600"}`}>
                {texto}
                {tieneValor && (
                    <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-1">{unidad}</span>
                )}
            </span>
        </div>
    );
}
