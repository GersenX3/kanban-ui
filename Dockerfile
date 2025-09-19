# Dockerfile para React (Producción) - Multi-stage build
# Stage 1: Build de la aplicación
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar dependencias del sistema necesarias para Rollup
RUN apk add --no-cache python3 make g++

# Copiar archivos de dependencias
COPY package*.json ./

# Limpiar npm cache y reinstalar dependencias completamente
RUN npm cache clean --force
RUN rm -rf node_modules package-lock.json
RUN npm install

# Copiar código fuente
COPY . .

# Build de producción
RUN npm run build

# Stage 2: Servir con nginx
FROM nginx:alpine

# Copiar los archivos buildeados desde el stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx (opcional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Comando por defecto (nginx se inicia automáticamente)
CMD ["nginx", "-g", "daemon off;"]
# IGNORE