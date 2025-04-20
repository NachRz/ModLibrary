# ModLibrary - Sistema de Gestión de Biblioteca

## 🎮 Funcionalidades Principales

### ✅ Funcionalidades Implementadas

#### 1️⃣ Conexión con la API de RAWG
- Integración con la API de RAWG para obtener información de videojuegos
- Búsqueda y visualización de juegos
- Obtención de detalles específicos de cada juego

#### 2️⃣ Gestión de Base de Datos
- Conexión segura entre backend y base de datos MySQL
- Migraciones para la estructura de la base de datos
- Modelos y relaciones para:
  - Juegos
  - Mods
  - Usuarios
  - Categorías

#### 3️⃣ Backend (Laravel)
- API RESTful para operaciones básicas
- Endpoints para:
  - Gestión de mods
  - Gestión de juegos
  - Búsqueda y filtrado
- Integración con RAWG API
- Validación de datos básica

#### 4️⃣ Frontend (React)
- Interfaz de usuario básica
- Funcionalidades implementadas:
  - Creación de mods (disponible en el panel de administración)
  - Búsqueda y filtrado de mods
- Conexión con el backend mediante API

### 📝 Cómo Probar la Creación de Mods
1. **Accede al panel de administración**:
   - Inicia sesión con las credenciales por defecto:
     - Email: admin@gmail.com
     - Contraseña: 1234
   - Vete a Mi Panel
   - Ahí le das crear mod y ya te lleva al formulario de creación de Mods

2. **Crea un nuevo mod**:
   - Haz clic en "Crear Mod"
   - Completa los campos requeridos:
     - Nombre del mod
     - Descripción
     - Juego asociado (seleccionable desde la API de RAWG)
     - Categoría
     - Enlace de descarga
   - Haz clic en "Guardar"

3. **Verifica el mod creado**:
   - El mod aparecerá en la lista de mods
   - Podrás ver sus detalles en la vista correspondiente

### 🚧 Funcionalidades en Desarrollo

#### 1️⃣ Backend
- Autenticación y autorización de usuarios
- Endpoints para gestión de usuarios
- Manejo avanzado de errores
- Optimización de consultas

#### 2️⃣ Frontend
- Sistema de categorías
- Gestión de usuario
- Estado global con Redux
- Diseño responsive mejorado
- Edición de mods
- Eliminación de mods

#### 3️⃣ Base de Datos
- Seeders para datos iniciales
- Optimización de índices
- Relaciones avanzadas

#### 4️⃣ RAWG API
- Actualización automática de datos de juegos
- Caché de datos
- Sincronización periódica

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
6. **Ejecuta las migraciones**:
   ```bash
   php artisan migrate
   ```
5. **Ejecuta los seeders**:
   ```bash
   php artisan db:seed
   ```
7. **Sal del contenedor**:
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
5. **Ejecuta las migraciones**:
   ```bash
   php artisan migrate
   ```
6. **Ejecuta los seeders**:
   ```bash
   php artisan db:seed
   ```
   
7. **Sal del contenedor**:
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
