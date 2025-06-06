# ModLibrary - Sistema de Gestión de Biblioteca de Mods

## 🎮 Funcionalidades Principales

### ✅ Funcionalidades Implementadas

#### 🔐 Sistema de Autenticación Completo
- **Registro de usuarios** con validaciones avanzadas
- **Inicio de sesión seguro** con tokens JWT
- **Recuperación de contraseña** con sistema de reset
- **Rutas protegidas** para usuarios autenticados
- **Middleware de autenticación** y autorización
- **Gestión de sesiones** con persistencia local

#### 👥 Gestión de Usuarios y Perfiles
- **Perfiles de usuario públicos** con URL personalizada (`/perfil/:usuario`)
- **Dashboard personal** con estadísticas dinámicas
- **Edición de perfil** con información personal
- **Sistema de roles** (Admin/Usuario) con permisos diferenciados
- **Estadísticas personales**: rating promedio, descargas totales, mods creados
- **Gestión de privacidad** para perfiles públicos/privados

#### 🎯 Panel de Administración
- **Gestión completa de usuarios**: crear, editar, eliminar (soft delete)
- **Administración de mods**: moderación y gestión de contenido
- **Panel estadístico** con métricas del sistema
- **Middleware AdminMiddleware** para rutas exclusivas de administradores
- **Modales responsivos** para operaciones CRUD desde el panel admin

#### 🎮 Integración con API de RAWG
- **Sincronización automática** de datos de videojuegos
- **Extracción de géneros** automática al crear/sincronizar juegos
- **Búsqueda avanzada** de juegos con filtros
- **Caché inteligente** para optimizar peticiones
- **Actualización periódica** de información de juegos

#### 📦 Gestión Avanzada de Mods
- **Creación de mods** con formulario completo
- **Sistema de categorías** y etiquetas dinámicas
- **Galería de imágenes** con carrusel y modal lightbox
- **Sistema de valoraciones** con estrellas interactivas (1-5)
- **Comentarios y reseñas** con validaciones de autoría
- **Gestión de descargas** con contadores automáticos
- **Filtros avanzados**: por tiempo, categoría, rating, popularidad

#### ⭐ Sistema de Favoritos y Guardados
- **Mods favoritos**: guardar mods en lista personal
- **Juegos favoritos**: sistema de favoritos para juegos
- **Hooks personalizados**: `useSaveMod`, `useFavoriteGame`
- **Sincronización en tiempo real** con notificaciones visuales
- **Gestión desde dashboard** con secciones dedicadas

#### 🔍 Búsqueda Unificada Avanzada
- **Búsqueda global** en múltiples entidades (Mods, Juegos, Usuarios)
- **Resultados con pestañas** para filtrar por tipo de contenido
- **Modal de búsqueda** accesible desde cualquier página
- **Filtros inteligentes** por géneros, etiquetas y tiempo
- **Autocompletado** y sugerencias en tiempo real

#### 🎨 Interfaz de Usuario Moderna
- **Diseño responsive** optimizado para móviles y desktop
- **Sistema de temas** con colores personalizados (`custom-*`)
- **Animaciones fluidas** y transiciones suaves
- **Componentes reutilizables** con Tailwind CSS
- **Página 404 personalizada** con navegación intuitiva
- **Sistema de notificaciones** globales con React Context

#### 📊 Exploración y Descubrimiento
- **Explorar Mods**: página dedicada con filtros avanzados
- **Explorar Juegos**: navegación por géneros y popularidad
- **Páginas de detalles** completas para mods y juegos
- **Sistema de recomendaciones** basado en popularidad
- **Estadísticas dinámicas** en tiempo real

#### 🛠️ Características Técnicas
- **Base de datos MySQL** con relaciones optimizadas
- **API RESTful** completa con Laravel
- **Frontend React 18** con React Router DOM
- **Sistema de limpieza automática** de datos huérfanos
- **Patrón Observer** para eventos del sistema
- **Validaciones robustas** en frontend y backend
- **Manejo de errores** centralizado y user-friendly

### 📝 Guía de Uso y Pruebas

#### 🔑 Credenciales por Defecto
- **Administrador**:
  - Email: `admin@gmail.com`
  - Contraseña: `1234`
- **Usuario regular**:
  - Email: `user@gmail.com`
  - Contraseña: `1234`

#### 🎯 Funcionalidades Principales a Probar

**1. Panel de Usuario (Dashboard)**
- Inicia sesión y explora tu dashboard personal
- Revisa las estadísticas de tu perfil
- Navega por las pestañas: General, Mis Mods, Guardados

**2. Gestión de Mods**
- **Crear Mod**: Ve a "Mi Panel" → "Crear Mod"
- **Explorar Mods**: Usa filtros por tiempo, categoría, rating
- **Valorar Mods**: Sistema de estrellas (1-5) en cualquier mod
- **Guardar Favoritos**: Botón de corazón en las tarjetas de mods
- **Comentarios**: Deja reseñas en la página de detalles

**3. Exploración de Juegos**
- **Explorar Juegos**: Filtros por género y popularidad
- **Detalles de Juego**: Vista completa con mods asociados
- **Favoritos de Juegos**: Guarda juegos en tu lista personal

**4. Búsqueda Avanzada**
- **Búsqueda Global**: Barra superior, busca en todo el sistema
- **Filtros Inteligentes**: Combina múltiples criterios
- **Resultados por Pestañas**: Mods, Juegos, Usuarios

**5. Panel de Administración** (solo con cuenta admin)
- **Gestión de Usuarios**: CRUD completo de usuarios
- **Administración de Mods**: Moderación de contenido
- **Estadísticas del Sistema**: Métricas en tiempo real

**6. Perfiles Públicos**
- Visita `/perfil/nombreusuario` para ver perfiles públicos
- Revisa estadísticas de otros usuarios
- Explora sus mods publicados

#### 🧪 Casos de Prueba Recomendados
1. **Flujo completo de usuario nuevo**: Registro → Login → Crear perfil → Crear mod
2. **Interacciones sociales**: Valorar mods → Comentar → Guardar favoritos
3. **Búsqueda y descubrimiento**: Usar filtros → Explorar por categorías → Buscar usuarios
4. **Administración**: Gestionar usuarios → Moderar contenido → Ver estadísticas
5. **Responsividad**: Probar en móvil, tablet y desktop

### 🚧 Funcionalidades Planificadas

#### 🚀 Próximas Mejoras
- **Sistema de chat en tiempo real** entre usuarios
- **Notificaciones push** para actividades importantes
- **Sistema de logros** y gamificación
- **API pública** para desarrolladores externos
- **Modo offline** con sincronización automática
- **Integración con Discord** para comunidades

#### 🔄 Optimizaciones Continuas
- **Mejoras de rendimiento** en carga de imágenes
- **Caché avanzado** con Redis para mejor velocidad
- **Optimización SEO** para mejor indexación
- **Análiticas avanzadas** de uso y comportamiento
- **Tests automatizados** (unit, integration, e2e)
- **CI/CD pipeline** para despliegues automáticos

#### 🎯 Expansión de Funcionalidades
- **Sistema de seguimiento** entre usuarios
- **Feeds personalizados** basados en intereses
- **Marketplace de mods premium** 
- **Sistema de reputación** para creadores
- **Integración con Steam Workshop**
- **Soporte para múltiples idiomas** (i18n)

## 🚀 Guía Paso a Paso para Windows

### 1️⃣ Instalar Docker Desktop
1. **Descargar Docker Desktop**
   - Ve a https://www.docker.com/products/docker-desktop
   - Haz clic en "Download for Windows"
   - Ejecuta el instalador que descargaste

2. **Instalar Docker Desktop**
   - Sigue las instrucciones en pantalla
   - **IMPORTANTE**: Marca la casilla que dice "WSL 2" cuando te pregunte --> Si durante la instalacion no te sale, despues de instalarlo vete a ajustes de docker destock y activalo
   - Cuando termine, reinicia tu computadora

3. **Verificar que Docker funciona**
   - Abre el menú Inicio
   - Busca "Docker Desktop" y ábrelo (Si te da problemas abrelo como admin)
   - Espera a que aparezca el ícono de Docker en la barra de tareas (puede tardar unos minutos la primera vez)
   

### 2️⃣ Descargar el Proyecto
**Opción 1: Usando Git (recomendado)**
1. **Abre PowerShell o CMD**
   
3. **Ve a la carpeta donde quieres guardar el proyecto**, por ejemplo:
   ```bash
   cd Documentos
   ```
4. **Descarga el proyecto**:
   ```bash
   git clone https://github.com/NachRz/ModLibrary.git
   ```
5. **Entra a la carpeta del proyecto**:
   ```bash
   cd ModLibrary
   ```

**Opción 2: Descarga Manual**
1. **Abre tu navegador** y ve a https://github.com/NachRz/ModLibrary
2. **Haz clic en el botón verde "Code"**
3. **Selecciona "Download ZIP"**
4. **Extrae el archivo ZIP** en la carpeta donde quieras guardar el proyecto
5. **Abre la carpeta extraída** (debería llamarse ModLibrary-main o similar)
6. **Renombra la carpeta** a simplemente "ModLibrary"

### 3️⃣ Configurar el archivo .env
1. **Ve a la carpeta backend**:
   ```bash
   cd backend
   ```
2. **Crea el archivo .env**:
   - **IMPORTANTE**: Copia el archivo .env.example y renómbralo a .env
   - O crea un nuevo archivo .env con este contenido:
   ```
   APP_NAME=ModLibrary
   APP_ENV=local
   APP_KEY=
   APP_DEBUG=true
   APP_URL=http://localhost:8000

   DB_CONNECTION=mysql
   DB_HOST=db
   DB_PORT=3306
   DB_DATABASE=modlibrary
   DB_USERNAME=root
   DB_PASSWORD=root
   ```

### 4️⃣ Ejecutar la Aplicación
1. **Abre Docker Desktop**
   - Abre el docker desktop
   - Espera a que el ícono deje de moverse (estado "Running")

2. **Abre la terminal integrada de Docker Desktop**
   - Abre docker(Si te da problemas abrelo como admin)
   - Abajo a la derecha deberiaponer terminal dale click, y se deberia abrir el terminal integrado
     

3. **Navega a la carpeta del proyecto**
   ```bash
   cd C:\Users\TuUsuario\Documentos\ModLibrary
   ```

4. **Construye las imágenes** (esto puede tardar varios minutos):
   ```bash
   docker compose build
   ```

5. **Inicia la aplicación**:
   ```bash
   docker compose up -d
   ```

6. **Verifica que todo esté funcionando**:
   - En Docker Desktop, haz clic en "Containers"
   - Deberías ver 4 contenedores en estado "Running":
     - modlibrary-backend
     - modlibrary-frontend
     - modlibrary-db
     - modlibrary-phpmyadmin

### 5️⃣ Configurar la Base de Datos
1. **Abre phpMyAdmin en tu navegador**
   - Ve a http://localhost:8080
   - Inicia sesión con:
     - Usuario: root
     - Contraseña: root

2. **Crear la base de datos (si no existe)**
   - En el panel izquierdo, haz clic en "Nueva"
   - En "Nombre de la base de datos", escribe: `modlibrary`
   - Haz clic en "Crear"

3. **Abre una nueva terminal en Docker Desktop**
   - Dentro de docker en la zona del terminal a la derecha vas a ver un "+" dale ahi y abre otra terminal
     
4. **Navega a la carpeta del proyecto**
   ```bash
   cd C:\Users\TuUsuario\Documentos\ModLibrary
   ```
5. **Accede al contenedor del backend**:
   ```bash
   docker compose exec backend bash
   ```
6. **Genera la clave de aplicación**:
   ```bash
   php artisan key:generate
   ```
7. **Ejecuta las migraciones**:
   ```bash
   php artisan migrate
   ```
8. **Ejecuta los seeders**:
   ```bash
   php artisan db:seed
   ```
9. **Sal del contenedor**:
   ```bash
   exit
   ```

### 6️⃣ Acceder a la Aplicación
- **Frontend** (Interfaz de usuario): http://localhost:3000
- **Backend** (API): http://localhost:8000
- **phpMyAdmin** (Base de datos): http://localhost:8080
  - Usuario: root
  - Contraseña: root

## 🐧 Guía Paso a Paso para Linux

### 1️⃣ Instalar Docker
1. **Abre la terminal** (Ctrl + Alt + T)
2. **Copia y pega estos comandos uno por uno**:
   ```bash
   sudo apt update
   sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   sudo apt update
   sudo apt install -y docker-ce docker-ce-cli containerd.io
   sudo usermod -aG docker $USER
   ```
3. **Cierra la terminal y vuelve a abrirla**

### 2️⃣ Descargar el Proyecto
**Opción 1: Usando Git (recomendado)**
1. **Abre la terminal**
2. **Ve a la carpeta donde quieres guardar el proyecto**, por ejemplo:
   ```bash
   cd ~/Documentos
   ```
3. **Descarga el proyecto**:
   ```bash
   git clone https://github.com/NachRz/ModLibrary.git
   ```
4. **Entra a la carpeta del proyecto**:
   ```bash
   cd ModLibrary
   ```

**Opción 2: Descarga Manual**
1. **Abre tu navegador** y ve a https://github.com/NachRz/ModLibrary
2. **Haz clic en el botón verde "Code"**
3. **Selecciona "Download ZIP"**
4. **Extrae el archivo ZIP**:
   ```bash
   unzip ModLibrary-main.zip -d ~/Documentos
   cd ~/Documentos/ModLibrary-main
   mv ModLibrary-main ModLibrary
   cd ModLibrary
   ```

### 3️⃣ Configurar el archivo .env
1. **Ve a la carpeta backend**:
   ```bash
   cd backend
   ```
2. **Crea el archivo .env**:
   ```bash
   cp .env.example .env
   ```
3. **Edita el archivo .env**:
   ```bash
   nano .env
   ```
   - Asegúrate de que tenga este contenido:
   ```
   APP_NAME=ModLibrary
   APP_ENV=local
   APP_KEY=
   APP_DEBUG=true
   APP_URL=http://localhost:8000

   DB_CONNECTION=mysql
   DB_HOST=db
   DB_PORT=3306
   DB_DATABASE=modlibrary
   DB_USERNAME=root
   DB_PASSWORD=root
   ```
   - Presiona Ctrl + X, luego Y y Enter para guardar

### 4️⃣ Ejecutar la Aplicación
1. **Navega a la carpeta del proyecto**:
   ```bash
   cd ~/Documentos/ModLibrary
   ```

2. **Construye las imágenes** (esto puede tardar varios minutos):
   ```bash
   docker compose build
   ```

3. **Inicia la aplicación**:
   ```bash
   docker compose up -d
   ```

4. **Verifica que todo esté funcionando**:
   ```bash
   docker compose ps
   ```
   Deberías ver 4 contenedores en estado "Up":
   - modlibrary-backend
   - modlibrary-frontend
   - modlibrary-db
   - modlibrary-phpmyadmin

### 5️⃣ Configurar la Base de Datos
1. **Abre phpMyAdmin en tu navegador**
   - Ve a http://localhost:8080
   - Inicia sesión con:
     - Usuario: root
     - Contraseña: root

2. **Crear la base de datos (si no existe)**
   - En el panel izquierdo, haz clic en "Nueva"
   - En "Nombre de la base de datos", escribe: `modlibrary`
   - Haz clic en "Crear"

3. **Abre una nueva terminal"
    ```bash
   cd ~/Documentos/ModLibrary
   ```

4. **Accede al contenedor del backend**:
   ```bash
   docker compose exec backend bash
   ```
5. **Genera la clave de aplicación**:
   ```bash
   php artisan key:generate
   ```
6. **Ejecuta las migraciones**:
   ```bash
   php artisan migrate
   ```
7. **Ejecuta los seeders**:
   ```bash
   php artisan db:seed
   ```
   
8. **Sal del contenedor**:
   ```bash
   exit
   ```

### 6️⃣ Acceder a la Aplicación
- **Frontend** (Interfaz de usuario): http://localhost:3000
- **Backend** (API): http://localhost:8000
- **phpMyAdmin** (Base de datos): http://localhost:8080
  - Usuario: root
  - Contraseña: root

### 🔧 Comandos Básicos que Necesitarás

```bash
# Ver si la aplicación está funcionando
docker compose ps

# Ver los logs (mensajes de la aplicación)
docker compose logs -f

# Detener la aplicación
docker compose down

# Reiniciar la aplicación
docker compose restart

# Actualizar después de hacer cambios
docker compose down
docker compose build
docker compose up -d
```

### ❓ Solución de Problemas Comunes

1. **"Los puertos están en uso"**
   - En Windows, abre PowerShell y escribe:
     ```bash
     netstat -ano | findstr :3000
     netstat -ano | findstr :8000
     netstat -ano | findstr :8080
     ```
   - En Linux, escribe:
     ```bash
     sudo lsof -i :3000
     sudo lsof -i :8000
     sudo lsof -i :8080
     ```

2. **"Docker no funciona"**
   - En Windows:
     - Abre Docker Desktop
     - Espera a que el ícono deje de moverse
     - Si no funciona, reinicia tu computadora
   - En Linux:
     - Escribe en la terminal:
       ```bash
       sudo systemctl restart docker
       ```

3. **"No puedo acceder a la aplicación"**
   - Verifica que todos los contenedores estén en estado "Up":
     ```bash
     docker compose ps
     ```
