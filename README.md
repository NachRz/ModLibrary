# ModLibrary - Sistema de Gestión de Biblioteca

## Requisitos Previos

### Windows
1. **Docker Desktop**
   - Descargar e instalar Docker Desktop desde: https://www.docker.com/products/docker-desktop
   - Durante la instalación, asegúrate de que la opción "WSL 2" esté habilitada
   - Reiniciar el equipo después de la instalación

2. **WSL 2 (Windows Subsystem for Linux)**
   - Abrir PowerShell como administrador y ejecutar:
   ```bash
   wsl --install
   ```
   - Reiniciar el equipo
   - Crear un usuario y contraseña cuando se solicite

3. **Git**
   - Descargar e instalar Git desde: https://git-scm.com/download/win
   - Durante la instalación, seleccionar "Git from the command line and also from 3rd-party software"

### Linux
1. **Docker**
   ```bash
   # Actualizar repositorios
   sudo apt update

   # Instalar dependencias
   sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

   # Agregar la clave GPG oficial de Docker
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

   # Agregar el repositorio de Docker
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

   # Instalar Docker
   sudo apt update
   sudo apt install -y docker-ce docker-ce-cli containerd.io

   # Agregar usuario actual al grupo docker
   sudo usermod -aG docker $USER
   ```

2. **Docker Compose**
   ```bash
   # Descargar la última versión de Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

   # Dar permisos de ejecución
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Git**
   ```bash
   sudo apt install -y git
   ```

## Instalación y Configuración

1. **Clonar el repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd ModLibrary
   ```

2. **Configurar variables de entorno**
   - En Windows, crear un archivo `.env` en la raíz del proyecto
   - En Linux, ejecutar:
   ```bash
   cp .env.example .env
   ```

3. **Construir y ejecutar los contenedores**
   ```bash
   # Construir las imágenes
   docker compose build

   # Iniciar los contenedores
   docker compose up -d
   ```

4. **Configurar la base de datos**
   ```bash
   # Acceder al contenedor del backend
   docker compose exec backend bash

   # Dentro del contenedor, ejecutar las migraciones
   php artisan migrate
   ```

## Acceso a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **phpMyAdmin**: http://localhost:8080
  - Usuario: root
  - Contraseña: root

## Comandos Útiles

```bash
# Ver estado de los contenedores
docker compose ps

# Ver logs de los contenedores
docker compose logs -f

# Detener la aplicación
docker compose down

# Reiniciar la aplicación
docker compose restart

# Reconstruir después de cambios
docker compose down
docker compose build
docker compose up -d
```

## Solución de Problemas Comunes

1. **Error de puertos en uso**
   - Verificar que los puertos 3000, 8000, 8080 y 3306 no estén en uso
   - En Windows: `netstat -ano | findstr :PUERTO`
   - En Linux: `sudo lsof -i :PUERTO`

2. **Problemas con Docker Desktop en Windows**
   - Asegurarse de que WSL 2 esté correctamente instalado
   - Verificar que la virtualización esté habilitada en la BIOS
   - Reiniciar Docker Desktop

3. **Problemas de permisos en Linux**
   - Asegurarse de que el usuario esté en el grupo docker
   - Ejecutar: `sudo usermod -aG docker $USER`
   - Cerrar sesión y volver a iniciar

## Estructura del Proyecto

```
ModLibrary/
├── backend/           # Aplicación Laravel
├── frontend/          # Aplicación React
├── docker-compose.yml # Configuración de Docker
└── README.md          # Este archivo
```

## Contacto y Soporte

Para problemas técnicos o consultas, contactar al equipo de desarrollo.

