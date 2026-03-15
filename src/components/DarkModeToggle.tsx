// DarkModeToggle.tsx — Toggle para modo oscuro (cliente)
"use client";

import React, { useEffect, useState } from "react";

export default function DarkModeToggle() {
    const [dark, setDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Leer preferencia guardada o del sistema
        const saved = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setDark(saved === "dark" || (!saved && prefersDark));
    }, []);

    const toggleDark = () => {
        const next = !dark;
        setDark(next);
        if (next) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    if (!mounted) {
        // Placeholder para evitar hydration mismatch
        return <div className="w-9 h-9" />;
    }

    return (
        <button
            id="dark-mode-toggle"
            onClick={toggleDark}
            className="w-9 h-9 rounded-xl flex items-center justify-center
                 text-blue-200 hover:text-white hover:bg-white/10
                 transition-all duration-200"
            aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            title={dark ? "Modo claro" : "Modo oscuro"}
        >
            {dark ? (
                // Ícono sol
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ) : (
                // Ícono luna
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            )}
        </button>
    );
}
