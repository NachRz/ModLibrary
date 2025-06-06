 # Changelog

Todas las versiones siguen la convención [SemVer](https://semver.org/).

---

## v1.5.0 – Mejoras en navegación, perfiles y formato de código
- Actualización del Navbar para mostrar solo opciones del modo actual (admin/usuario).
- Implementación de rutas específicas para cada sección del panel admin.
- Desarrollo de paneles de estadísticas completos en perfiles de usuario.
- Eliminación de sección de estadísticas del home para mejorar la UX.
- Mejora del cálculo de estadísticas para perfiles públicos y privados.
- Ajustes generales de interfaz y experiencia de usuario.
- Normalización y mejora de la indentación y formato del código.
- Refactor de breadcrumbs y rutas de administrador para mejor navegación.

---

## v1.4.0 – Gestión automática final / Limpieza de datos huérfanos
- Funcionalidad en backend que revisa periódicamente:
  - Juegos sin mods asociados ni usuarios que los tengan en favoritos → se eliminan.
  - Géneros de juegos sin asignaciones → se eliminan.
  - Etiquetas sin mods relacionados ni usuarios que las tengan → se eliminan.
- Implementación del patrón Observer en Laravel para disparar limpieza al eliminar o modificar entidades relacionadas.
- Ajustes finales de zona horaria (`Europe/Madrid`) en guardado de descargas y logs.
- Optimización general de queries y refactor de controladores para evitar datos huérfanos.

---

## v1.3.0 – Búsqueda unificada y sistema de comentarios
- Ruta `/search` y componente `SearchResults` con pestañas para filtrar resultados (“Todos”, “Mods”, “Juegos”, “Usuarios”).
- Componente `SearchModal` que redirige a `/search?q=termino` al presionar Enter.
- Backend: endpoint unificado para buscar en múltiples tablas.
- Componente `CommentsTab` y lógica CRUD de comentarios en `ModDetails`.
- Validaciones de autoría: solo el autor puede editar o eliminar su comentario.
- Estados de carga, error y vacío en la pantalla de resultados de búsqueda.

---

## v1.2.1 – Correcciones en “Explorar Mods”
- Corrección de grid en la página de “Explorar Mods” para evitar desalineaciones.
- Ajuste de `useEffect` en búsqueda de juegos para eliminar bucles infinitos al escribir en el input.
- Refactor de algunas funciones de cálculo de fechas para evitar mutaciones accidentales de objetos `Date`.

---

## v1.2.0 – Rutas protegidas y perfiles de usuario
- Componente `ProtectedRoute` para rutas que requieren autenticación y `GuestRoute` para rutas de invitado.
- Restricción de acceso a pantallas de dashboard, perfil, “Mis Mods”, “Guardados” y “Crear Mod”.
- Componente `Perfil` independiente basado en `General`, con pestañas “General” y “Mis Mods”.
- Páginas de perfil público (`/perfil/:usuario`) que muestran estadísticas dinámicas, rating promedio y descargas totales.
- Componente `ImageCarousel` con “lightbox” modal para ver imágenes en grande.
- Ajustes de interfaz en `ModDetails` para mostrar pestañas de imágenes y secciones dinámicas.

---

## v1.1.1 – Correcciones UI puntuales
- Corrección de `z-index` en botones de favorito para evitar superposiciones con el header.
- Ajustes en jerarquía de capas (header, tarjetas, botones) usando clases válidas de Tailwind.
- Corrección en la funcionalidad del botón de guardar mods en `ModCard` y `ModList`.
- Ajustes en hooks y props para evitar filtros rotos.

---

## v1.1.0 – Sistema de géneros y etiquetas avanzadas
- Extracción automática de géneros desde RAWG al crear o sincronizar juegos (`verifyAndSyncGame`).
- Componente de filtros de géneros en frontend con conteos dinámicos.
- Filtros de etiquetas en `CrearMod` y `ExplorarMods` con selección múltiple y autocomplete.
- Ajustes en el layout responsive para mostrar correctamente filtros en dispositivos móviles.
- Mejora de la galería de imágenes con animaciones y experiencia de usuario optimizada.

---

## v1.0.0 – Panel de Administración
- Middleware `AdminMiddleware` en backend y `AdminToggle` en frontend para rutas exclusivas de admins.
- Páginas `UsersAdmin` y `ModsAdmin` con paginación, edición y eliminación.
- Panel de administración integrado dentro del dashboard (“Mi Panel”).
- Modales responsivos para crear/editar usuarios y mods desde el admin panel.
- Sistema unificado de eliminación de usuarios con confirmación obligatoria (soft delete vs borrar).
- Ajustes visuales generales del admin panel (espaciado, botones, validaciones).

---

## v0.9.0 – Explorar Mods/Juegos y Búsqueda Unificada
- Componente `ExplorarJuegos` con filtros por género, ordenamiento y paginación.
- Componente `ExplorarMods` con filtros de tiempo (“Últimas 24h”, “Última semana”), etiquetas y géneros.
- Pestañas en la página de resultados para buscar “Todos”, “Mods”, “Juegos” y “Usuarios” (`SearchResults`).
- Integración de `SearchModal` para enviar consultas a `/search?q=…`.
- Corrección de bugs en grid de explorar mods y bucles infinitos en búsquedas.
- Mejoras en UX de filtros: indicadores visuales y notificaciones al aplicar cambios.

---

## v0.8.0 – Juegos Favoritos y GameDetails
- Migración para crear tabla intermedia `game_fav`.
- Endpoints backend para agregar/eliminar juegos favoritos.
- Hooks `useFavoriteGame` y `useFavoriteGames` en frontend para gestionar favoritos de juegos.
- Componente `GameCard` con botón toggle para marcar juegos como favoritos.
- Página `GameDetails` que muestra información detallada de un juego y su lista de mods.
- Sistema de caché básico para optimizar peticiones de favoritos.
- Notificaciones visuales en el botón de favoritos.

---

## v0.7.0 – Sistema de valoraciones (ratings)
- Hook `useRating` para gestionar la lógica de obtener/crear/eliminar valoraciones.
- Endpoints backend para CRUD de valoraciones y cálculo del promedio.
- Interfaz de estrellas interactivas en `ModDetails` y `ModCard`.
- Eventos en el modelo `Valoracion` para actualizar estadísticas sin recargar la página.
- Rediseño parcial de `ModDetails` para mostrar la sección de valoraciones.
- Optimización de la funcionalidad de guardado de mods y botones de edición.

---

## v0.6.0 – “Guardar Mods” y notificaciones
- Endpoints backend para guardar y eliminar mods de la lista de guardados.
- Creación de hooks `useSaveMod` y `useSavedMods` en frontend.
- Botón toggle en `ModCard` y sección “Mods Favoritos” en dashboard.
- Sistema global de notificaciones con React Context para mostrar mensajes al usuario.
- Refactor de `ModCard` para eliminar el botón de guardado por defecto y usar el nuevo hook.

---

## v0.5.0 – Creación y gestión básica de mods
- Componente `ModDetails` creado con diseño responsivo para ver la información de un mod.
- Se añadió el campo `total_descargas` en la tabla `mods` (migración).
- Implementación de backend para listar, crear y mostrar mods básicos.
- Interfaz de usuario para la pestaña “Crear mods” (frontend).
- Componente “Mis Mods” en el dashboard para administrar los mods de un usuario.
- Ajustes visuales en la página de inicio y en componentes de mods.

---

## v0.4.0 – Interfaz de usuario básica y registro completo
- Implementación del componente de cambio de contraseña (ResetPassword).
- Ajustes en la interfaz para detectar inicio de sesión y rutas protegidas básicas.
- Creación de componente Tabs y actualización de paleta de colores.
- Mejoras en UI de login, registro, dashboard y flujo de restablecer contraseña.
- Ajustes finales en estilos de login y registro (frontend).
- Conexión completa entre frontend y backend para registro de nuevos usuarios.

---

## v0.3.0 – Sistema de autenticación y Docker refinado
- Componentes de frontend para login, registro y reset-password con Tailwind CSS.
- Endpoints de autenticación en backend (register, login, reset-password).
- Limpieza y corrección de seeders en el backend.
- Ajustes en rutas de API para conectar correctamente el formulario de login.
- Fusión de la rama `feature/login` en `develop`.
- Actualización de README con instrucciones detalladas para Windows, Linux y WSL2.
- Corrección de credenciales predeterminadas en `.env.example`.
- Arreglo de puertos en `docker-compose.yml` para evitar conflictos.

---

## v0.2.0 – Base de datos y RAWG API
- Migraciones completas para tablas de usuarios, mods, juegos, géneros y etiquetas.
- Modelos Eloquent configurados en Laravel.
- Seeders para poblar la base de datos con datos iniciales extraídos de la API de RAWG.
- Scripts y comandos para ejecutar la extracción de datos RAWG.

---

## v0.1.0 – Setup inicial
- Inicialización del repositorio con Laravel y React.
- Agregados Dockerfiles para backend, frontend, base de datos y phpMyAdmin.
- Creación de `.gitignore` para ignorar dependencias y archivos temporales.
- Actualización de dependencias de React (18.2.0) y corrección de vulnerabilidades.
