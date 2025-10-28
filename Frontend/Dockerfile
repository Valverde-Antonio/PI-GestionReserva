# ===== Etapa de build =====
FROM node:20-alpine AS build
WORKDIR /app

# Instala dependencias
COPY package*.json ./
RUN npm ci

# Copia el código y construye
COPY . .
# Para Angular clásico: --configuration=production en angular.json equivale a --prod
RUN npm run build --prod

# ===== Etapa de producción (Nginx) =====
FROM nginx:alpine

# Limpia html por defecto y copia build
RUN rm -rf /usr/share/nginx/html/*
# Ajusta la ruta si cambia el nombre del proyecto en dist/
COPY --from=build /app/dist/gestion-reservas/browser /usr/share/nginx/html

# Config SPA (fallback a index.html) y (opcional) proxy /api al backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
