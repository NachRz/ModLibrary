FROM node:18

WORKDIR /app

# Copiar archivos de dependencias e instalar
COPY package*.json ./
RUN npm install

# Copiar el resto de la aplicación
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Instalar el servidor estático para servir la app
RUN npm install -g serve

EXPOSE 3000

# Comando para iniciar el servidor en modo producción
CMD ["serve", "-s", "build", "-l", "3000"]
