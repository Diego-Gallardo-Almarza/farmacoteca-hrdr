// CalculadoraDosis.tsx
// Calculadora clínica de dosis para internos de enfermería — con Bottom Sheet (vaul)
"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Drawer } from "vaul";

/* ─── tipos ──────────────────────────────────────────────────────────── */
type Modo = "continua" | "bolo";

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

    // Inputs compartidos
    const [mgAmpolla, setMgAmpolla] = useState("");
    const [mlDilucion, setMlDilucion] = useState("");
    const [peso, setPeso] = useState("");

    // Modo continua
    const [dosisMcgKgMin, setDosisMcgKgMin] = useState("");

    // Modo bolo
    const [dosisMgKg, setDosisMgKg] = useState("");
    const [tiempoMin, setTiempoMin] = useState("30");

    /* ─── cálculos ───────────────────────────────────────────────────── */
    const resultados = useMemo(() => {
        const mg = n(mgAmpolla);
        const ml = n(mlDilucion);
        const kg = n(peso);

        if (!mg || !ml) return null;

        const concMgMl = mg / ml;
        const concMcgMl = concMgMl * 1000;

        if (modo === "continua") {
            const dosis = n(dosisMcgKgMin);
            if (!dosis || !kg) return { concMcgMl, concMgMl, modo: "continua" as const };

            const mlHr = (dosis * kg * 60) / concMcgMl;
            const dosisVerif = (mlHr * concMcgMl) / (kg * 60);

            return { concMcgMl, concMgMl, mlHr, dosisVerif, modo: "continua" as const };
        } else {
            const dMgKg = n(dosisMgKg);
            const tMin = n(tiempoMin);
            if (!dMgKg || !kg) return { concMcgMl, concMgMl, modo: "bolo" as const };

            const dosisTotal = dMgKg * kg;
            const volAdm = dosisTotal / concMgMl;
            const mlHr = tMin > 0 ? (volAdm / tMin) * 60 : 0;
            const dosisVerif = tMin > 0 ? (dosisTotal * 1000) / (kg * tMin) : 0;

            return { concMcgMl, concMgMl, volAdm, dosisTotal, mlHr, dosisVerif, modo: "bolo" as const };
        }
    }, [mgAmpolla, mlDilucion, peso, dosisMcgKgMin, dosisMgKg, tiempoMin, modo]);

    const limpiar = useCallback(() => {
        setMgAmpolla("");
        setMlDilucion("");
        setPeso("");
        setDosisMcgKgMin("");
        setDosisMgKg("");
        setTiempoMin("30");
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
                <Drawer.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />

                {/* Panel inferior */}
                <Drawer.Content
                    className="fixed bottom-0 left-0 right-0 z-50 flex flex-col
                               bg-white dark:bg-gray-900
                               rounded-t-3xl border-t-2 border-gray-200 dark:border-gray-700
                               shadow-2xl max-h-[92dvh] focus:outline-none"
                    aria-labelledby="calc-titulo"
                >
                    {/* Handle de arrastre */}
                    <div className="flex justify-center pt-3 pb-1 shrink-0">
                        <div className="w-10 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                    </div>

                    {/* Contenido scrollable */}
                    <div className="overflow-y-auto overscroll-contain flex-1">

                        {/* ── Banner de advertencia ── */}
                        <div className="flex items-start gap-3 px-5 py-4 bg-red-600 text-white mx-4 mt-2 rounded-2xl">
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
                        <div className="flex items-center justify-between px-5 pt-4 pb-2">
                            <div>
                                <Drawer.Title id="calc-titulo" className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    Calculadora de Dosis
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

                        {/* ── Toggle de modo ── */}
                        <div className="px-5 pb-3">
                            <div className="inline-flex rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden text-sm font-semibold">
                                <button
                                    onClick={() => setModo("continua")}
                                    className={`px-4 py-2 transition-colors ${modo === "continua"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        }`}
                                >
                                    Infusión continua
                                </button>
                                <button
                                    onClick={() => setModo("bolo")}
                                    className={`px-4 py-2 transition-colors ${modo === "bolo"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        }`}
                                >
                                    Dosis en bolo
                                </button>
                            </div>
                        </div>

                        {/* ── Formulario ── */}
                        <div className="px-5 pb-8 space-y-4">

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
                                            type="number"
                                            min="0"
                                            step="any"
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
                                            type="number"
                                            min="0"
                                            step="any"
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

                            {/* Datos del paciente */}
                            <fieldset className="space-y-3">
                                <legend className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    Datos del paciente y prescripción
                                </legend>

                                <label className="block">
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                                        Peso del paciente (kg)
                                    </span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={peso}
                                        onChange={(e) => setPeso(e.target.value)}
                                        placeholder="ej. 70"
                                        className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600
                                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm
                                                   focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100
                                                   dark:focus:ring-indigo-900/30 transition-all"
                                    />
                                </label>

                                {modo === "continua" ? (
                                    <label className="block">
                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                                            Dosis indicada (mcg/kg/min)
                                        </span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="any"
                                            value={dosisMcgKgMin}
                                            onChange={(e) => setDosisMcgKgMin(e.target.value)}
                                            placeholder="ej. 5"
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
                                                Dosis indicada (mg/kg)
                                            </span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="any"
                                                value={dosisMgKg}
                                                onChange={(e) => setDosisMgKg(e.target.value)}
                                                placeholder="ej. 0.1"
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
                                                type="number"
                                                min="1"
                                                step="1"
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

                            {/* ── Resultados ── */}
                            <div className="rounded-xl overflow-hidden border-2 border-indigo-200 dark:border-indigo-800">
                                {resultados && (
                                    <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-900/30 border-b border-indigo-200 dark:border-indigo-800">
                                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-1">
                                            Concentración de la solución
                                        </p>
                                        <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                                            {fmt(resultados.concMgMl, 3)} mg/ml
                                            <span className="text-indigo-500 dark:text-indigo-400 font-normal mx-2">·</span>
                                            {fmt(resultados.concMcgMl, 1)} mcg/ml
                                        </p>
                                    </div>
                                )}

                                <div className="divide-y divide-indigo-100 dark:divide-indigo-900">
                                    <ResultRow
                                        label="Velocidad de infusión"
                                        valor={resultados?.mlHr}
                                        unidad="ml/hr"
                                        decimales={2}
                                        destacado
                                    />
                                    <ResultRow
                                        label="Dosis en mcg/kg/min"
                                        valor={resultados?.dosisVerif}
                                        unidad="mcg/kg/min"
                                        decimales={3}
                                        destacado
                                    />
                                    {modo === "bolo" && resultados?.modo === "bolo" && (
                                        <>
                                            <ResultRow
                                                label="Dosis total calculada"
                                                valor={resultados.dosisTotal}
                                                unidad="mg"
                                                decimales={3}
                                            />
                                            <ResultRow
                                                label="Volumen a administrar"
                                                valor={resultados.volAdm}
                                                unidad="ml"
                                                decimales={2}
                                                destacado
                                            />
                                        </>
                                    )}
                                </div>

                                {!resultados && (
                                    <div className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                                        Ingresa los datos para ver los resultados
                                    </div>
                                )}
                            </div>

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

/* ─── sub-componente fila de resultado ───────────────────────────────── */
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
