// layout.tsx — Layout global con header, banner de advertencia y footer
import type { Metadata } from "next";
import "./globals.css";
import DarkModeToggle from "@/components/DarkModeToggle";
import AIConsulta from "@/components/AIConsulta";
import FavoritosPopover from "@/components/FavoritosPopover";
import Link from "next/link";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Farmacoteca HCSBA — Fármacos para Enfermería",
  description:
    "Farmacoteca digital de fármacos para internos de enfermería del Hospital Clínico San Borja Arriarán.",
  keywords: [
    "farmacoteca",
    "enfermería",
    "fármacos",
    "internos",
    "Hospital San Borja Arriarán",
    "calculadora dosis",
  ],
  authors: [{ name: "EU Loreto Lizana Varela" }, { name: "QF Angélica Valenzuela" }],
  manifest: "/manifest.json",
  themeColor: "#ffffff",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Farmacoteca",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Script para modo oscuro sin flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark' ||
                  (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">

        {/* ===== HEADER ===== */}
        <header className="sticky top-0 z-30 bg-blue-800 dark:bg-gray-900 border-b border-blue-700 dark:border-gray-700 shadow-lg shadow-blue-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

            {/* Logo + título */}
            <Link href="/" className="flex items-center gap-3 group min-w-0">
              {/* Ícono institucional */}
              <div className="w-10 h-10 rounded-xl bg-white/15 group-hover:bg-white/25 flex items-center justify-center transition-colors shrink-0 overflow-hidden">
                <span className="text-2xl">💊</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-bold text-white leading-tight truncate">
                  Farmacoteca HRDR
                </h1>
                <p className="text-blue-200 text-xs leading-tight hidden sm:block truncate">
                  Antimicrobianos · Antivirales · Antifúngicos
                </p>
              </div>
            </Link>

            {/* Nav + controles */}
            <nav className="flex items-center gap-3">
              <Link
                href="/"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 text-sm font-medium transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscador
              </Link>
              <Link
                href="/farmacos"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 text-sm font-medium transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Lista completa
              </Link>
              <FavoritosPopover />
              <DarkModeToggle />
            </nav>
          </div>
        </header>

        {/* ===== CONTENIDO PRINCIPAL ===== */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-28">
          {children}
        </main>

        {/* ===== FOOTER ===== */}
        <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Farmacoteca HRDR</span> — Hospital Dr. Roberto del Río
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Realizado por{" "}
              <span className="font-medium">EU Loreto Lizana Varela</span> &{" "}
              <span className="font-medium">QF Angélica Valenzuela</span>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600">
              Revisado por{" "}
              <span className="font-medium">Dra. Verónica Contardo Pérez</span>
            </p>
          </div>
        </footer>

        {/* ===== ASISTENTE IA FLOTANTE ===== */}
        <AIConsulta />

        {/* ===== SISTEMA DE NOTIFICACIONES ===== */}
        <Toaster theme="dark" position="bottom-center" richColors />
      </body>
    </html>
  );
}
