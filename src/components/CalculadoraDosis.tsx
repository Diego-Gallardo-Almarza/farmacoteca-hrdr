// CalculadoraDosis.tsx
// Calculadora clínica de dosis — Bottom Sheet (vaul) + Stepper inputs
"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Drawer } from "vaul";
import { Minus, Plus } from "lucide-react";

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

/* ─── StepperInput ───────────────────────────────────────────────────── */
function StepperInput({
    label,
    value,
    onChange,
    step,
    min = 0,
    unit,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    step: number;
    min?: number;
    unit?: string;
}) {
    const [editing, setEditing] = useState(false);
    const numVal = parseFloat(value) || 0;

    // Redondear al múltiplo de step más cercano para evitar decimales sucios
    const round = (v: number) =>
        step < 1 ? Math.round(v * 100) / 100 : Math.round(v);

    const decrement = () => {
        const next = round(Math.max(min, numVal - step));
        onChange(String(next));
    };

    const increment = () => {
        const next = round(numVal + step);
        onChange(String(next));
    };

    return (
        <div className="flex flex-col items-center gap-2 py-3">
            {/* Etiqueta */}
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest text-center">
                {label}
            </p>

            {/* Stepper row */}
            <div className="flex items-center justify-between w-full gap-2">
                {/* Botón − */}
                <button
                    type="button"
                    onClick={decrement}
                    aria-label={`Disminuir ${label}`}
                    className="w-10 h-10 rounded-full border border-zinc-800 bg-transparent
                               flex items-center justify-center
                               text-zinc-400 hover:bg-zinc-800 hover:text-white
                               active:scale-95 transition-all"
                >
                    <Minus className="w-4 h-4" />
                </button>

                {/* Valor central — clic para editar */}
                <div className="flex-1 flex flex-col items-center min-w-0">
                    {editing ? (
                        <input
                            autoFocus
                            type="number"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            onBlur={() => setEditing(false)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === "Escape")
                                    setEditing(false);
                            }}
                            className="w-24 text-center text-2xl font-bold bg-transparent
                                       text-white outline-none border-b-2 border-indigo-500
                                       pb-0.5 [appearance:textfield]
                                       [&::-webkit-outer-spin-button]:appearance-none
                                       [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setEditing(true)}
                            aria-label={`Editar ${label} manualmente`}
                            className="flex items-baseline gap-1.5 hover:opacity-70 transition-opacity"
                        >
                            <span className="text-3xl font-bold text-white tabular-nums leading-none">
                                {value || "0"}
                            </span>
                            {unit && (
                                <span className="text-sm font-normal text-zinc-500">{unit}</span>
                            )}
                        </button>
                    )}
                </div>

                {/* Botón + */}
                <button
                    type="button"
                    onClick={increment}
                    aria-label={`Aumentar ${label}`}
                    className="w-10 h-10 rounded-full border border-zinc-800 bg-transparent
                               flex items-center justify-center
                               text-zinc-400 hover:bg-zinc-800 hover:text-white
                               active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

/* ─── componente principal ───────────────────────────────────────────── */
export default function CalculadoraDosis() {
    const [abierto, setAbierto] = useState(false);
    const [modo, setModo] = useState<Modo>("continua");

    // Inputs compartidos (infusión)
    const [mgAmpolla, setMgAmpolla] = useState("0");
    const [mlDilucion, setMlDilucion] = useState("0");

    // Modo continua — dosis absoluta en mcg/min
    const [dosisMcgMin, setDosisMcgMin] = useState("0");

    // Modo bolo — dosis absoluta en mg
    const [dosisMgTotal, setDosisMgTotal] = useState("0");
    const [tiempoMin, setTiempoMin] = useState("30");

    // Modo goteo
    const [volGoteo, setVolGoteo] = useState("0");
    const [tiempoGoteo, setTiempoGoteo] = useState("0");

    /* ─── cálculos infusión ──────────────────────────────────────────── */
    const resultadosInfusion = useMemo(() => {
        const mg = n(mgAmpolla);
        const ml = n(mlDilucion);
        if (!mg || !ml) return null;

        const concMgMl = mg / ml;
        const concMcgMl = concMgMl * 1000;

        if (modo === "continua") {
            const dosis = n(dosisMcgMin);
            if (!dosis) return { concMcgMl, concMgMl, modo: "continua" as const };

            const mlHr = (dosis * 60) / concMcgMl;
            const mgHr = (dosis * 60) / 1000;

            return { concMcgMl, concMgMl, mlHr, mgHr, modo: "continua" as const };
        } else {
            const dosisTotal = n(dosisMgTotal);
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

        return {
            microgotas: (vol * 60) / tiempo,
            macrogotas: (vol * 20) / tiempo,
            mlHr: (vol / tiempo) * 60,
        };
    }, [volGoteo, tiempoGoteo]);

    const limpiar = useCallback(() => {
        setMgAmpolla("0");
        setMlDilucion("0");
        setDosisMcgMin("0");
        setDosisMgTotal("0");
        setTiempoMin("30");
        setVolGoteo("0");
        setTiempoGoteo("0");
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
                <Drawer.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />

                <Drawer.Content
                    className="bg-[#09090b] border-t border-zinc-800 rounded-t-[10px] fixed bottom-0 left-0 right-0 z-50 flex flex-col outline-none max-h-[96%]"
                    aria-labelledby="calc-titulo"
                >
                    {/* Handle */}
                    <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mt-4 mb-2 shrink-0" />

                    {/* Contenido scrollable */}
                    <div className="overflow-y-auto overscroll-contain flex-1 px-4 pb-2">

                        {/* Banner advertencia */}
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

                        {/* Encabezado */}
                        <div className="flex items-center justify-between pt-4 pb-2">
                            <div>
                                <Drawer.Title id="calc-titulo" className="text-lg font-bold text-white">
                                    Calculadora Clínica
                                </Drawer.Title>
                                <p className="text-xs text-zinc-500">Farmacoteca HRDR</p>
                            </div>
                            <button
                                onClick={() => setAbierto(false)}
                                className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                                aria-label="Cerrar calculadora"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Toggle de modo */}
                        <div className="pb-4">
                            <div className="flex rounded-xl border border-zinc-800 overflow-hidden text-sm font-semibold">
                                {(["continua", "bolo", "goteo"] as Modo[]).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setModo(m)}
                                        className={`flex-1 px-3 py-2 transition-colors ${
                                            modo === m
                                                ? "bg-indigo-600 text-white"
                                                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                        }`}
                                    >
                                        {m === "continua" ? "Continua" : m === "bolo" ? "Bolo" : "Goteo"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ═══ MODOS INFUSIÓN ═══ */}
                        {(modo === "continua" || modo === "bolo") && (
                            <div className="space-y-1 pb-8">

                                {/* Sección: Preparación */}
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                                    Preparación de la solución
                                </p>
                                <div className="grid grid-cols-2 divide-x divide-zinc-800 rounded-2xl border border-zinc-800 overflow-hidden mb-4">
                                    <StepperInput
                                        label="Ampolla"
                                        value={mgAmpolla}
                                        onChange={setMgAmpolla}
                                        step={1}
                                        unit="mg"
                                    />
                                    <StepperInput
                                        label="Dilución"
                                        value={mlDilucion}
                                        onChange={setMlDilucion}
                                        step={10}
                                        unit="ml"
                                    />
                                </div>

                                {/* Sección: Prescripción */}
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                                    Prescripción
                                </p>
                                {modo === "continua" ? (
                                    <div className="rounded-2xl border border-zinc-800 overflow-hidden mb-4">
                                        <StepperInput
                                            label="Dosis indicada"
                                            value={dosisMcgMin}
                                            onChange={setDosisMcgMin}
                                            step={1}
                                            unit="mcg/min"
                                        />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 divide-x divide-zinc-800 rounded-2xl border border-zinc-800 overflow-hidden mb-4">
                                        <StepperInput
                                            label="Dosis total"
                                            value={dosisMgTotal}
                                            onChange={setDosisMgTotal}
                                            step={1}
                                            unit="mg"
                                        />
                                        <StepperInput
                                            label="Pasar en"
                                            value={tiempoMin}
                                            onChange={setTiempoMin}
                                            step={5}
                                            min={1}
                                            unit="min"
                                        />
                                    </div>
                                )}

                                {/* Resultados infusión */}
                                <div className="rounded-xl overflow-hidden border border-zinc-800">
                                    {resultadosInfusion && (
                                        <div className="px-4 py-3 bg-indigo-950/60 border-b border-zinc-800">
                                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-1">
                                                Concentración de la solución
                                            </p>
                                            <p className="text-sm font-semibold text-indigo-200">
                                                {fmt(resultadosInfusion.concMgMl, 3)} mg/ml
                                                <span className="text-zinc-600 font-normal mx-2">·</span>
                                                {fmt(resultadosInfusion.concMcgMl, 1)} mcg/ml
                                            </p>
                                        </div>
                                    )}
                                    <div className="divide-y divide-zinc-800">
                                        <ResultRow label="Velocidad de infusión" valor={resultadosInfusion?.mlHr} unidad="ml/hr" decimales={2} destacado />
                                        {modo === "continua" && (
                                            <ResultRow label="Dosis en mg/hr" valor={resultadosInfusion?.mgHr} unidad="mg/hr" decimales={3} />
                                        )}
                                        {modo === "bolo" && resultadosInfusion?.modo === "bolo" && (
                                            <>
                                                <ResultRow label="Dosis total" valor={resultadosInfusion.dosisTotal} unidad="mg" decimales={3} />
                                                <ResultRow label="Volumen a administrar" valor={resultadosInfusion.volAdm} unidad="ml" decimales={2} destacado />
                                            </>
                                        )}
                                    </div>
                                    {!resultadosInfusion && (
                                        <div className="px-4 py-6 text-center text-sm text-zinc-600">
                                            Ingresa los datos para ver los resultados
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ═══ MODO GOTEO ═══ */}
                        {modo === "goteo" && (
                            <div className="space-y-4 pb-8">
                                <div className="grid grid-cols-2 divide-x divide-zinc-800 rounded-2xl border border-zinc-800 overflow-hidden">
                                    <StepperInput
                                        label="Volumen"
                                        value={volGoteo}
                                        onChange={setVolGoteo}
                                        step={50}
                                        unit="ml"
                                    />
                                    <StepperInput
                                        label="Tiempo"
                                        value={tiempoGoteo}
                                        onChange={setTiempoGoteo}
                                        step={5}
                                        min={1}
                                        unit="min"
                                    />
                                </div>

                                {/* Referencia factores */}
                                <div className="flex gap-2 text-xs text-zinc-500">
                                    <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 font-mono">
                                        Micro: 60 gtt/ml
                                    </span>
                                    <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 font-mono">
                                        Macro: 20 gtt/ml
                                    </span>
                                </div>

                                {/* Resultados goteo */}
                                <div className="rounded-xl overflow-hidden border border-zinc-800">
                                    <div className="divide-y divide-zinc-800">
                                        <GoteoRow label="Microgotas" valor={resultadosGoteo?.microgotas} unidad="microgotas/min" />
                                        <GoteoRow label="Macrogotas" valor={resultadosGoteo?.macrogotas} unidad="gotas/min" />
                                        <GoteoRow label="Velocidad bomba" valor={resultadosGoteo?.mlHr} unidad="ml/hr" destacado />
                                    </div>
                                    {!resultadosGoteo && (
                                        <div className="px-4 py-6 text-center text-sm text-zinc-600">
                                            Ingresa el volumen y el tiempo para ver los resultados
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Botón limpiar */}
                        <button
                            onClick={limpiar}
                            className="w-full py-2.5 mb-6 rounded-xl border border-zinc-800
                                       text-zinc-500 text-sm font-semibold
                                       hover:bg-zinc-900 hover:text-zinc-300 transition-all"
                        >
                            Limpiar campos
                        </button>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}

/* ─── fila resultado infusión ────────────────────────────────────────── */
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
        <div className={`flex items-center justify-between px-4 py-3 ${destacado ? "bg-zinc-900/60" : ""}`}>
            <span className="text-sm text-zinc-400 font-medium">{label}</span>
            <span className={`font-bold tabular-nums ${
                tieneValor
                    ? destacado ? "text-indigo-300 text-base" : "text-zinc-200 text-sm"
                    : "text-zinc-700 text-sm"
            }`}>
                {texto}
                {tieneValor && (
                    <span className="text-xs font-normal text-zinc-600 ml-1">{unidad}</span>
                )}
            </span>
        </div>
    );
}

/* ─── fila resultado goteo ───────────────────────────────────────────── */
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
        <div className={`flex items-center justify-between px-4 py-3 ${destacado ? "bg-zinc-900/60" : ""}`}>
            <span className="text-sm text-zinc-400 font-medium">{label}</span>
            <span className={`font-bold tabular-nums ${
                tieneValor ? "text-teal-300 text-base" : "text-zinc-700 text-sm"
            }`}>
                {texto}
                {tieneValor && (
                    <span className="text-xs font-normal text-zinc-600 ml-1">{unidad}</span>
                )}
            </span>
        </div>
    );
}
