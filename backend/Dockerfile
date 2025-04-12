FROM php:8.2-apache

# Instalar extensiones necesarias
RUN apt-get update && apt-get install -y \
    zip unzip curl libpng-dev libonig-dev libxml2-dev git \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Instalar Composer desde la imagen oficial de Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Establecer el directorio de trabajo
WORKDIR /var/www/html

# Copiar el código del backend
COPY . .

# Instalar dependencias de Laravel
RUN composer install

# Dar permisos a storage y bootstrap/cache
RUN chmod -R 777 storage bootstrap/cache

EXPOSE 8000

# Arranca Laravel (servidor de desarrollo)
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
