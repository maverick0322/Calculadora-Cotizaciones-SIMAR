# Sistema de Cotizaciones SIMAR - Desktop App 🚛♻️

Subsistema de escritorio local-first para la generación y gestión de cotizaciones del área comercial.
Desarrollado con Electron, React, TypeScript y SQLite bajo principios de Clean Architecture.

## 🚀 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:
* [Node.js](https://nodejs.org/) (Versión 20 o superior recomendada)
* Git

## 🛠️ Instalación y Configuración para el Equipo

**1. Clonar el repositorio**
**`git clone https://github.com/maverick0322/Calculadora-Cotizaciones-SIMAR.git`**
**`cd GestorResiduos-Desktop`**

**2. Instalar dependencias**
**`npm install`**

**3. Compilar módulos nativos**
Como usamos SQLite (una base de datos nativa en C++), cada vez que instales paquetes nuevos debes decirle a Electron que los recompile para su entorno interno. Ejecuta:
**`npx electron-builder install-app-deps`** y **`npm install lucide-react`**

**4. Levantar el entorno de desarrollo**
**`npm run dev`**

## 🌿 Flujo de Trabajo (Git Workflow)

**NUNCA trabajes directamente en la rama `main`.**

1. Actualiza tu rama principal: `git checkout main` y luego `git pull origin main`
2. Crea tu rama de trabajo: `git checkout -b feature/nombre-de-tu-tarea`
* **`[FEAT]`**: Para añadir funcionalidades, describe lo que añadiste en el commit.
* **`[CHORE]`**: Para tareas, describe la tarea hecha en el commit.
* **`[FIX]`**: Para arreglar, describe el problema que arreglaste en el commit.
* **`[DOC]`**: para documentación, describe la documentación agregada en el commit.
* **`[PERF]`**: Para optimización, describe lo que optimizaste en el commit.
* **`[REFACTOR]`**: para refactorización, describe lo que refactorizaste en el commit.
3. Revisamos en qué rama nos encontramos: `git branch`
3. Revisamos qué archivos hemos modificado: `git status`
4. Añade todos los cambios trabajados en memoria: `git add .`
5. Guarda los cambios: `git commit -m "feat: agregué X componente"`
6. Sube tu rama: `git push -u origin feature/nombre-de-tu-tarea`
8. Ve a GitHub y abre un **Pull Request** para revisión, agrega una descripción clara y crea el pull request.
7. Cuando se apruebe el merge regresa a la rama principal y actualízala: `git checkout main` y luego `git pull origin main`

## 🏗️ Arquitectura del Proyecto

* **`src/main/`**: Backend local (Node.js). Aquí vive SQLite, los Casos de Uso y las reglas de negocio.
* **`src/renderer/`**: Frontend (React). Aquí viven los componentes visuales de Tailwind. *Regla de oro: El frontend no puede importar nada directamente del main.*
* **`src/shared/`**: Contratos e interfaces compartidas entre ambos mundos.
* **`src/preload/`**: El puente de seguridad IPC que conecta React con Node.