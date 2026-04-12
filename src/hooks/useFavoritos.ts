// useFavoritos.ts — Hook para gestionar fármacos favoritos con persistencia en localStorage
"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "farmacoteca_favoritos";

export function useFavoritos() {
    const [favoritos, setFavoritos] = useState<string[]>([]);

    // Cargar desde localStorage al montar
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) setFavoritos(JSON.parse(stored));
        } catch {
            // localStorage no disponible
        }
    }, []);

    const guardar = useCallback((ids: string[]) => {
        setFavoritos(ids);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
        } catch {
            // localStorage no disponible
        }
    }, []);

    const toggleFavorito = useCallback((id: string) => {
        setFavoritos((prev) => {
            const siguiente = prev.includes(id)
                ? prev.filter((f) => f !== id)
                : [...prev, id];
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(siguiente));
            } catch {
                // localStorage no disponible
            }
            return siguiente;
        });
    }, []);

    const esFavorito = useCallback(
        (id: string) => favoritos.includes(id),
        [favoritos]
    );

    return { favoritos, toggleFavorito, esFavorito, guardar };
}
