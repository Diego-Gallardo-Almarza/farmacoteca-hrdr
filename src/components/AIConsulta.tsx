// AIConsulta.tsx
// Panel de chat con asistente LOCAL — sin API, sin internet
// Usa procesarConsulta() de src/lib/asistente.ts
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { MensajeChat } from "@/types/farmaco";
import { procesarConsulta } from "@/lib/asistente";
import farmacos from "@/data/farmacos.json";
import { Farmaco } from "@/types/farmaco";

export default function AIConsulta() {
    const [abierto, setAbierto] = useState(false);
    const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
    const [inputUsuario, setInputUsuario] = useState("");
    const [cargando, setCargando] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll al último mensaje
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [mensajes, cargando]);

    // Focus automático al abrir
    useEffect(() => {
        if (abierto && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [abierto]);

    const enviarMensaje = useCallback(async () => {
        const texto = inputUsuario.trim();
        if (!texto || cargando) return;

        // Agregar mensaje del usuario
        setMensajes((prev) => [...prev, { role: "user", content: texto }]);
        setInputUsuario("");
        setCargando(true);

        // Simular efecto "escribiendo..." 500ms para mejor UX
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Procesar localmente — sin API
        const respuesta = procesarConsulta(texto, farmacos as Farmaco[]);

        // Agregar respuesta del asistente
        setMensajes((prev) => [...prev, { role: "assistant", content: respuesta }]);
        setCargando(false);
    }, [inputUsuario, cargando]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            enviarMensaje();
        }
    };

    const limpiarChat = () => {
        setMensajes([]);
    };

    const usarSugerencia = (sugerencia: string) => {
        setInputUsuario(sugerencia);
        // Auto-enviar la sugerencia
        setTimeout(() => {
            const textoLimpio = sugerencia.trim();
            if (!textoLimpio) return;
            setMensajes((prev) => [...prev, { role: "user", content: textoLimpio }]);
            setInputUsuario("");
            setCargando(true);
            setTimeout(async () => {
                const respuesta = procesarConsulta(textoLimpio, farmacos as Farmaco[]);
                setMensajes((prev) => [...prev, { role: "assistant", content: respuesta }]);
                setCargando(false);
            }, 500);
        }, 50);
    };

    const sugerencias = [
        "¿Cuál es la dosis de vancomicina?",
        "¿Qué fármacos debo proteger de la luz?",
        "¿Cuánto tiempo es estable el meropenem?",
        "Lista los antifúngicos disponibles",
    ];

    return (
        <>
            {/* Botón flotante */}
            <button
                id="btn-ai-consulta"
                onClick={() => setAbierto(true)}
                className={`fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl
                    bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700
                    text-white font-bold shadow-xl shadow-blue-700/40 hover:shadow-blue-700/60
                    transition-all duration-300 hover:scale-105 active:scale-100
                    ${abierto ? "opacity-0 pointer-events-none scale-90" : "opacity-100"}`}
                aria-label="Abrir asistente local"
            >
                <span className="text-xl">💬</span>
                <span className="hidden sm:inline">Consultar con IA</span>
                {/* Dot verde animado */}
                <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
            </button>

            {/* Overlay */}
            {abierto && (
                <div
                    className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-40 transition-all"
                    onClick={() => setAbierto(false)}
                    aria-hidden="true"
                />
            )}

            {/* Panel de chat */}
            <div
                className={`fixed right-0 top-0 h-full w-full sm:w-[440px] z-50 flex flex-col
                    bg-white dark:bg-gray-900 shadow-2xl
                    transition-transform duration-300 ease-in-out
                    ${abierto ? "translate-x-0" : "translate-x-full"}`}
                role="dialog"
                aria-modal="true"
                aria-label="Asistente Farmacoteca HRDR"
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-4 bg-gradient-to-r from-blue-700 to-blue-600 text-white shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0">
                        🤖
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm leading-tight">Asistente Farmacoteca HRDR</p>
                        <p className="text-blue-200 text-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                            Local · Sin internet · Solo HRDR
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={limpiarChat}
                            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                            title="Limpiar chat"
                            aria-label="Limpiar conversación"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setAbierto(false)}
                            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                            aria-label="Cerrar chat"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mensajes */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
                >
                    {/* Bienvenida + sugerencias */}
                    {mensajes.length === 0 && !cargando && (
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-sm shrink-0">
                                    🤖
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-gray-800 dark:text-gray-200 max-w-[85%]">
                                    <p className="font-semibold text-blue-700 dark:text-blue-400 mb-1">
                                        ¡Hola! Soy tu asistente farmacológico.
                                    </p>
                                    <p>
                                        Puedo responder preguntas sobre los fármacos de la Farmacoteca HRDR.
                                        Todo funciona <strong>sin internet</strong> — solo uso los datos de la farmacoteca.
                                    </p>
                                </div>
                            </div>

                            {/* Sugerencias clickeables */}
                            <div className="space-y-2">
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium px-1">Sugerencias:</p>
                                <div className="flex flex-col gap-2">
                                    {sugerencias.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => usarSugerencia(s)}
                                            className="text-left text-xs px-3 py-2 rounded-xl border-2 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-400 transition-all"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Historial de mensajes */}
                    {mensajes.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                            <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${msg.role === "user"
                                        ? "bg-blue-700 text-white"
                                        : "bg-gray-100 dark:bg-gray-800"
                                    }`}
                            >
                                {msg.role === "user" ? "👩‍⚕️" : "🤖"}
                            </div>
                            <div
                                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user"
                                        ? "bg-blue-700 text-white rounded-tr-none max-w-[75%]"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none max-w-[85%]"
                                    }`}
                                style={{ whiteSpace: "pre-wrap" }}
                            >
                                {/* Renderizar negritas simples (**texto**) */}
                                {msg.content.split(/(\*\*[^*]+\*\*)/).map((parte, j) =>
                                    parte.startsWith("**") && parte.endsWith("**") ? (
                                        <strong key={j}>{parte.slice(2, -2)}</strong>
                                    ) : (
                                        parte
                                    )
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Indicador "escribiendo..." */}
                    {cargando && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm shrink-0">
                                🤖
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                                <span className="flex gap-1">
                                    {[0, 1, 2].map((n) => (
                                        <span
                                            key={n}
                                            className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
                                            style={{ animationDelay: `${n * 150}ms` }}
                                        />
                                    ))}
                                </span>
                                Buscando en farmacoteca...
                            </div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="shrink-0 px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <div className="flex gap-2 items-end">
                        <textarea
                            ref={inputRef}
                            id="ai-chat-input"
                            value={inputUsuario}
                            onChange={(e) => setInputUsuario(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Escribir consulta... (Enter para enviar)"
                            rows={2}
                            disabled={cargando}
                            className="flex-1 resize-none py-3 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-600
                         bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm
                         focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30
                         disabled:opacity-60 transition-all"
                        />
                        <button
                            id="ai-send-btn"
                            onClick={enviarMensaje}
                            disabled={!inputUsuario.trim() || cargando}
                            className="p-3 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-gray-200 dark:disabled:bg-gray-700
                         text-white disabled:text-gray-400 transition-all duration-200
                         shadow-lg shadow-blue-700/30 disabled:shadow-none hover:scale-105 active:scale-100"
                            aria-label="Enviar mensaje"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
                        🔒 Solo fármacos HRDR · Funciona sin conexión
                    </p>
                </div>
            </div>
        </>
    );
}
