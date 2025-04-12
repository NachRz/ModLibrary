# ModLibrary – Despliegue Completo en Máquina Virtual (Desde Cero)

ModLibrary es una plataforma web de gestión de mods para videojuegos. Utiliza **Laravel** como backend, **React** como frontend, **MySQL** como base de datos, y **phpMyAdmin** para la administración. Todo el entorno se despliega con **Docker**, permitiendo ejecutarlo en cualquier sistema con Docker instalado, sin necesidad de configurar XAMPP, Composer o Node.js manualmente.

---

## ✅ Requisitos del Sistema

- Sistema operativo: Ubuntu 22.04+ (recomendado)
- Acceso a internet
- Usuario con permisos `sudo`
- Docker y Git (se instalan a continuación)

---

## 🐧 1. Instalación de Docker, Docker Compose y Git

### 🔹 Actualizar el sistema e instalar herramientas necesarias

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ca-certificates gnupg lsb-release apt-transport-https software-properties-common

# Agregar clave GPG de Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Agregar repositorio de Docker
echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu \
$(lsb_release -cs) stable" | \
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

docker --version
docker compose version
docker run hello-world

sudo usermod -aG docker $USER
newgrp docker


git clone https://github.com/tu_usuario/ModLibrary.git
cd ModLibrary

ModLibrary/
├── backend/              # Laravel (backend)
├── frontend/             # Angular (frontend)
├── docker-compose.yml    # Levanta todo el entorno
├── .gitignore
└── README.md

docker compose up -d --build

docker exec -it modlibrary-backend bash

composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --host=0.0.0.0 --port=8000

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=modlibrary
DB_USERNAME=root
DB_PASSWORD=root

docker compose up -d --build

docker compose logs -f

docker compose down

git checkout -b develop
git add .
git commit -m "Mi cambio"
git push -u origin develop

git checkout main
git pull
git merge develop
git push

