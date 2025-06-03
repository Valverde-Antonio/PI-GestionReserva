# Etapa 1: build Angular
FROM node:24-slim as build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build --prod

# Etapa 2: servir con Nginx
FROM nginx:stable-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/gestion-reservas/browser /usr/share/nginx/html
EXPOSE 80
