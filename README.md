# Sistema de Cotizaciones SIMAR - Desktop App 🚛♻️

Subsistema de escritorio local-first para la generación y gestión de cotizaciones del área comercial.
Desarrollado con Electron, React, TypeScript y SQLite bajo principios de Clean Architecture.

## 🚀 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:
* [Node.js](https://nodejs.org/) (Versión 20 o superior recomendada)
* Git

## 🛠️ Instalación y Configuración para el Equipo

**1. Clonar el repositorio**
\`\`\`bash
**`git clone https://github.com/maverick0322/Calculadora-Cotizaciones-SIMAR.git`**
**`cd GestorResiduos-Desktop`**
\`\`\`

**2. Instalar dependencias**
**`npm install`**

**3. Compilar módulos nativos (¡MUY IMPORTANTE!)**
Como usamos SQLite (una base de datos nativa en C++), cada vez que instales paquetes nuevos debes decirle a Electron que los recompile para su entorno interno. Ejecuta:
**`npx electron-builder install-app-deps`**

**4. Levantar el entorno de desarrollo**
**`npm run dev`**

## 🌿 Flujo de Trabajo (Git Workflow)

**NUNCA trabajes directamente en la rama `main`.**

1. Actualiza tu rama principal: `git checkout main` y luego `git pull`
2. Crea tu rama de trabajo: `git checkout -b feature/nombre-de-tu-tarea`
3. Haz tus cambios y guárdalos: `git commit -m "feat: agregué X componente"`
4. Sube tu rama: `git push -u origin feature/nombre-de-tu-tarea`
5. Ve a GitHub y abre un **Pull Request** para revisión.

## 🏗️ Arquitectura del Proyecto

* **`src/main/`**: Backend local (Node.js). Aquí vive SQLite, los Casos de Uso y las reglas de negocio.
* **`src/renderer/`**: Frontend (React). Aquí viven los componentes visuales de Tailwind. *Regla de oro: El frontend no puede importar nada directamente del main.*
* **`src/shared/`**: Contratos e interfaces compartidas entre ambos mundos.
* **`src/preload/`**: El puente de seguridad IPC que conecta React con Node.