// BadgeAlerta.tsx
// Badges semánticos con colores según tipo de alerta
import React from "react";
import { TipoAlerta } from "@/types/farmaco";

interface BadgeAlertaProps {
    alerta: TipoAlerta;
}

const alertaConfig: Record<
    TipoAlerta,
    { label: string; color: string; bg: string; darkBg: string; darkColor: string }
> = {
    anafilaxis: {
        label: "⚠ Anafilaxis",
        color: "text-red-700",
        bg: "bg-red-100 border-red-300",
        darkBg: "dark:bg-red-900/40 dark:border-red-700",
        darkColor: "dark:text-red-300",
    },
    pcr: {
        label: "🚨 Riesgo PCR",
        color: "text-red-700",
        bg: "bg-red-100 border-red-300",
        darkBg: "dark:bg-red-900/40 dark:border-red-700",
        darkColor: "dark:text-red-300",
    },
    riesgo_convulsion: {
        label: "⚡ Riesgo Convulsión",
        color: "text-red-700",
        bg: "bg-red-100 border-red-300",
        darkBg: "dark:bg-red-900/40 dark:border-red-700",
        darkColor: "dark:text-red-300",
    },
    nefrotoxicidad: {
        label: "🫘 Nefrotoxicidad",
        color: "text-orange-700",
        bg: "bg-orange-100 border-orange-300",
        darkBg: "dark:bg-orange-900/40 dark:border-orange-700",
        darkColor: "dark:text-orange-300",
    },
    hipotension: {
        label: "📉 Hipotensión",
        color: "text-orange-700",
        bg: "bg-orange-100 border-orange-300",
        darkBg: "dark:bg-orange-900/40 dark:border-orange-700",
        darkColor: "dark:text-orange-300",
    },
    velocidad_administracion: {
        label: "⏱ Velocidad RAM",
        color: "text-orange-700",
        bg: "bg-orange-100 border-orange-300",
        darkBg: "dark:bg-orange-900/40 dark:border-orange-700",
        darkColor: "dark:text-orange-300",
    },
    ajuste_renal: {
        label: "🫘 Ajuste Renal",
        color: "text-orange-700",
        bg: "bg-orange-100 border-orange-300",
        darkBg: "dark:bg-orange-900/40 dark:border-orange-700",
        darkColor: "dark:text-orange-300",
    },
    proteger_luz: {
        label: "💡 Proteger de la Luz",
        color: "text-yellow-700",
        bg: "bg-yellow-100 border-yellow-300",
        darkBg: "dark:bg-yellow-900/40 dark:border-yellow-700",
        darkColor: "dark:text-yellow-300",
    },
    refrigerar: {
        label: "❄️ Refrigerar",
        color: "text-yellow-700",
        bg: "bg-yellow-100 border-yellow-300",
        darkBg: "dark:bg-yellow-900/40 dark:border-yellow-700",
        darkColor: "dark:text-yellow-300",
    },
    refrigerar_viales: {
        label: "❄️ Refrigerar Viales",
        color: "text-yellow-700",
        bg: "bg-yellow-100 border-yellow-300",
        darkBg: "dark:bg-yellow-900/40 dark:border-yellow-700",
        darkColor: "dark:text-yellow-300",
    },
    homogenizar: {
        label: "🔄 Homogenizar",
        color: "text-yellow-700",
        bg: "bg-yellow-100 border-yellow-300",
        darkBg: "dark:bg-yellow-900/40 dark:border-yellow-700",
        darkColor: "dark:text-yellow-300",
    },
    lavar_via: {
        label: "💧 Lavar Vía",
        color: "text-yellow-700",
        bg: "bg-yellow-100 border-yellow-300",
        darkBg: "dark:bg-yellow-900/40 dark:border-yellow-700",
        darkColor: "dark:text-yellow-300",
    },
    transfusion: {
        label: "🩸 Espaciar Transfusión",
        color: "text-yellow-700",
        bg: "bg-yellow-100 border-yellow-300",
        darkBg: "dark:bg-yellow-900/40 dark:border-yellow-700",
        darkColor: "dark:text-yellow-300",
    },
    verificar_solucion: {
        label: "🔍 Verificar Solución",
        color: "text-yellow-700",
        bg: "bg-yellow-100 border-yellow-300",
        darkBg: "dark:bg-yellow-900/40 dark:border-yellow-700",
        darkColor: "dark:text-yellow-300",
    },
    qt_prolongado: {
        label: "❤️ QT Prolongado",
        color: "text-orange-700",
        bg: "bg-orange-100 border-orange-300",
        darkBg: "dark:bg-orange-900/40 dark:border-orange-700",
        darkColor: "dark:text-orange-300",
    },
    citostatico: {
        label: "☢️ Manejar como Citostático",
        color: "text-blue-700",
        bg: "bg-blue-100 border-blue-300",
        darkBg: "dark:bg-blue-900/40 dark:border-blue-700",
        darkColor: "dark:text-blue-300",
    },
    no_aditivos: {
        label: "🚫 No Agregar Aditivos",
        color: "text-blue-700",
        bg: "bg-blue-100 border-blue-300",
        darkBg: "dark:bg-blue-900/40 dark:border-blue-700",
        darkColor: "dark:text-blue-300",
    },
    alergia_penicilina: {
        label: "🌿 Alergia Penicilina",
        color: "text-orange-700",
        bg: "bg-orange-100 border-orange-300",
        darkBg: "dark:bg-orange-900/40 dark:border-orange-700",
        darkColor: "dark:text-orange-300",
    },
    no_refrigerar: {
        label: "🚫 No Refrigerar",
        color: "text-yellow-700",
        bg: "bg-yellow-100 border-yellow-300",
        darkBg: "dark:bg-yellow-900/40 dark:border-yellow-700",
        darkColor: "dark:text-yellow-300",
    },
    fotosensible: {
        label: "☀️ Fotosensible",
        color: "text-yellow-700",
        bg: "bg-yellow-100 border-yellow-300",
        darkBg: "dark:bg-yellow-900/40 dark:border-yellow-700",
        darkColor: "dark:text-yellow-300",
    },
    hepatotoxicidad: {
        label: "🫀 Hepatotoxicidad",
        color: "text-orange-700",
        bg: "bg-orange-100 border-orange-300",
        darkBg: "dark:bg-orange-900/40 dark:border-orange-700",
        darkColor: "dark:text-orange-300",
    },
    agranulocitosis: {
        label: "🩸 Riesgo Agranulocitosis",
        color: "text-red-700",
        bg: "bg-red-100 border-red-300",
        darkBg: "dark:bg-red-900/40 dark:border-red-700",
        darkColor: "dark:text-red-300",
    },
    depresion_respiratoria: {
        label: "🫁 Depresión Respiratoria",
        color: "text-red-700",
        bg: "bg-red-100 border-red-300",
        darkBg: "dark:bg-red-900/40 dark:border-red-700",
        darkColor: "dark:text-red-300",
    },
    naloxona_cerca: {
        label: "💉 Naloxona Disponible",
        color: "text-red-700",
        bg: "bg-red-100 border-red-300",
        darkBg: "dark:bg-red-900/40 dark:border-red-700",
        darkColor: "dark:text-red-300",
    },
    extrapiramidal: {
        label: "⚡ Riesgo Extrapiramidal",
        color: "text-orange-700",
        bg: "bg-orange-100 border-orange-300",
        darkBg: "dark:bg-orange-900/40 dark:border-orange-700",
        darkColor: "dark:text-orange-300",
    },
};

export default function BadgeAlerta({ alerta }: BadgeAlertaProps) {
    const config = alertaConfig[alerta];
    if (!config) return null;

    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.color} ${config.darkBg} ${config.darkColor} transition-all`}
        >
            {config.label}
        </span>
    );
}
