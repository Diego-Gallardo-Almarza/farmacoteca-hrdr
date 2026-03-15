# Farmacoteca HRDR — Farmacoteca Yiyo

**Farmacoteca digital de antimicrobianos, antivirales y antifúngicos de uso EXCLUSIVO PEDIÁTRICO para pacientes menores de 15 años.**

Diseñada para estudiantes de enfermería del **Hospital Dr. Roberto del Río**, esta herramienta permite consultar de forma rápida y segura toda la información clínica relevante de los fármacos antimicrobianos disponibles.

---

## ⚠️ Importante

> Esta farmacoteca está diseñada **EXCLUSIVAMENTE para uso pediátrico** (pacientes < 15 años). Las dosis descritas no aplican para población adulta. Dosis superiores a las indicadas deben ser visadas por un infectólogo.

---

## 🚀 Instalación y uso local

### Prerequisitos
- Node.js 18 o superior
- npm 9 o superior
- Una API key de Anthropic (para el asistente IA)

### Pasos

1. **Clonar o descargar el proyecto**

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar las variables de entorno**
   
   Edita el archivo `.env.local` (ya incluido en el proyecto):
   ```env
   ANTHROPIC_API_KEY=tu_api_key_real_aqui
   NEXT_PUBLIC_APP_NAME=Farmacoteca HRDR
   ```
   
   > Obtén tu API key en: https://console.anthropic.com

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   
   Visita: [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy en Vercel

1. Sube el proyecto a GitHub
2. Importa el repositorio en [vercel.com](https://vercel.com)
3. Agrega la variable de entorno `ANTHROPIC_API_KEY` en Settings → Environment Variables
4. Haz clic en Deploy

> **Nota:** `.env.local` está en `.gitignore` y NO se sube a GitHub. La API key debe configurarse directamente en Vercel.

---

## 📁 Estructura del proyecto

```
farmacoteca-hrdr/
├── src/
│   ├── app/
│   │   ├── page.tsx              ← Página principal con buscador
│   │   ├── layout.tsx            ← Layout global con header/footer
│   │   ├── globals.css           ← Estilos globales
│   │   ├── farmacos/
│   │   │   └── page.tsx          ← Lista completa en tabla
│   │   └── api/
│   │       └── consulta/
│   │           └── route.ts      ← API route IA (Anthropic)
│   ├── components/
│   │   ├── SearchBar.tsx         ← Buscador con filtros
│   │   ├── FarmacoCard.tsx       ← Tarjeta de fármaco expandible
│   │   ├── FarmacoTable.tsx      ← Vista tabla completa
│   │   ├── AIConsulta.tsx        ← Panel de chat IA
│   │   ├── BadgeAlerta.tsx       ← Badges de alertas clínicas
│   │   └── DarkModeToggle.tsx    ← Toggle claro/oscuro
│   ├── data/
│   │   └── farmacos.json         ← Base de datos de 35 fármacos
│   └── types/
│       └── farmaco.ts            ← Interfaces TypeScript
├── .env.local                    ← Variables de entorno (NO subir a Git)
├── .gitignore
├── package.json
└── README.md
```

---

## ✨ Funcionalidades

- 🔍 **Buscador inteligente** con fuzzy search en tiempo real
- 🏷️ **Filtros por categoría**: Antibacteriano | Antifúngico | Antiviral
- 💊 **Tarjetas expandibles** con toda la información clínica
- ⚠️ **Badges de alerta** con colores semánticos por tipo de riesgo
- 📋 **Copiar al portapapeles** la información de cada fármaco
- 📊 **Tabla completa** con ordenamiento y búsqueda
- 🤖 **Asistente IA** (claude-sonnet-4-20250514) para consultas en lenguaje natural
- 🌙 **Modo oscuro** con persistencia de preferencia
- 📱 **Diseño responsive** mobile-first

---

## 👩‍⚕️ Créditos

| Rol | Persona |
|-----|---------|
| Elaborado por | EU Loreto Lizana Varela |
| Colaboración | QF Angélica Valenzuela |
| Revisión médica | Dra. Verónica Contardo Pérez |
| Hospital | Hospital Dr. Roberto del Río |

---

## 🛠️ Stack tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS v4
- **IA**: Anthropic SDK (claude-sonnet-4-20250514)
- **Datos**: JSON local (sin base de datos externa)
