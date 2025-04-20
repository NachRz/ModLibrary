FROM node:18

WORKDIR /app

# Copiar archivos de dependencias e instalar
COPY package*.json ./
RUN npm install

# Copiar el resto de la aplicación
COPY . .

EXPOSE 3000

# Comando para iniciar el servidor en modo desarrollo
CMD ["npm", "start"]
