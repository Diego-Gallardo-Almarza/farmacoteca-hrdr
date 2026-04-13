// page.tsx — Página principal con buscador y tarjetas de fármacos
"use client";

import React, { useState, useMemo } from "react";
import SearchBar from "@/components/SearchBar";
import FarmacoCard from "@/components/FarmacoCard";
import CalculadoraDosis from "@/components/CalculadoraDosis";
import { Farmaco, CategoriaFarmaco } from "@/types/farmaco";
import farmacos from "@/data/farmacos.json";
import Link from "next/link";

// Función de fuzzy search simple
function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Quitar tildes
}

function buscarFarmacos(
  lista: Farmaco[],
  query: string,
  categoria: CategoriaFarmaco | "todos"
): Farmaco[] {
  const q = normalizarTexto(query.trim());

  return lista.filter((farmaco) => {
    // Filtro de categoría
    const matchCategoria =
      categoria === "todos" || farmaco.categoria === categoria;

    // Filtro de texto fuzzy
    const matchTexto =
      !q ||
      normalizarTexto(farmaco.nombre).includes(q) ||
      normalizarTexto(farmaco.cuidados).includes(q) ||
      normalizarTexto(farmaco.categoria).includes(q) ||
      farmaco.presentacion.some((p) =>
        normalizarTexto(p).includes(q)
      ) ||
      normalizarTexto(farmaco.dosis ?? "").includes(q) ||
      normalizarTexto(farmaco.mecanismoAccion ?? "").includes(q) ||
      normalizarTexto(farmaco.reaccionesAdversas ?? "").includes(q);

    return matchCategoria && matchTexto;
  });
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [categoria, setCategoria] = useState<CategoriaFarmaco | "todos">("todos");

  const resultados = useMemo(
    () => buscarFarmacos(farmacos as Farmaco[], query, categoria),
    [query, categoria]
  );

  return (
    <div className="space-y-10">
      {/* ===== HERO ===== */}
      <section className="relative text-center space-y-4 py-8 sm:py-12">
        {/* Círculos decorativos de fondo */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-blue-100 dark:bg-blue-900/20 blur-3xl opacity-60" />
          <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-green-100 dark:bg-green-900/20 blur-3xl opacity-50" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight">
          <span className="gradient-text">Farmacoteca</span>{" "}
          <span className="text-blue-800 dark:text-blue-300">Yiyo</span>
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-base max-w-xl mx-auto">
          Consulta rápida de fármacos para estudiantes de
          enfermería del HCSBA.
        </p>

        {/* Stats rápidas + calculadora */}
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 pt-2">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-400">
              {farmacos.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Fármacos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-400">
              {new Set(farmacos.map((f) => f.categoria)).size}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Categorías</div>
          </div>
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
          <CalculadoraDosis />
        </div>
      </section>

      {/* ===== BUSCADOR ===== */}
      <section className="max-w-3xl mx-auto">
        <SearchBar
          query={query}
          onQueryChange={setQuery}
          categoria={categoria}
          onCategoriaChange={setCategoria}
          totalResultados={resultados.length}
        />
      </section>

      {/* ===== RESULTADOS ===== */}
      <section>
        {resultados.length === 0 ? (
          // Estado vacío
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-fade-in-up">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-4xl">
              🔍
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                No se encontraron fármacos
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Intenta con otro nombre o cambia el filtro de categoría
              </p>
            </div>
            <button
              onClick={() => { setQuery(""); setCategoria("todos"); }}
              className="px-4 py-2 rounded-xl border-2 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400 text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            {/* Grid de tarjetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {resultados.map((farmaco, i) => (
                <div
                  key={farmaco.id}
                  className="animate-fade-in-up card-hover"
                  style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
                >
                  <FarmacoCard farmaco={farmaco as Farmaco} queryResaltada={query} />
                </div>
              ))}
            </div>

            {/* Link a tabla completa */}
            {!query && categoria === "todos" && (
              <div className="mt-8 text-center">
                <Link
                  href="/farmacos"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700
                             text-blue-700 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/30
                             hover:border-blue-400 transition-all hover:scale-105 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Ver listado completo en tabla
                </Link>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
