FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copia el jar generado
COPY target/backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8085

ENTRYPOINT ["java", "-jar", "app.jar"]

########################################################################
# 📝 PLANTILLA DOCKERFILE MULTI-STAGE (BACKEND JAVA + MAVEN)
# ---------------------------------------------------------------------
# Este archivo está completamente comentado.
# No interfiere con tu proyecto actual hasta que elimines los '#'.
#
# Instrucciones:
#   - Puedes dejarlo así como documentación o ejemplo.
#   - Para activarlo, elimina los '#' delante de las líneas que necesites.
#######################################################################

# ================================================================
# Etapa 1️⃣ : Compilar el proyecto con Maven (Build stage)
# ================================================================
# FROM maven:3.9-eclipse-temurin-17 AS build
# WORKDIR /src
#
# # Copiar el archivo pom.xml y descargar dependencias (cacheable)
# COPY pom.xml .
# RUN mvn -q -e -DskipTests dependency:go-offline
#
# # Copiar el código fuente
# COPY src ./src
#
# # Compilar el proyecto (sin tests para acelerar)
# RUN mvn -q -DskipTests clean package
#
# ================================================================
# Etapa 2️⃣ : Imagen final ligera (Runtime stage)
# ================================================================
# FROM eclipse-temurin:17-jre-alpine
# WORKDIR /app
#
# # Copiar el JAR desde la etapa anterior
# COPY --from=build /src/target/*-SNAPSHOT.jar /app/app.jar
#
# # Exponer el puerto del backend (ajústalo si es otro)
# EXPOSE 8085
#
# # Variable opcional de configuración JVM
# ENV JAVA_OPTS=""
#
# # Comando de ejecución
# ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
#
#######################################################################
# ✅ BENEFICIOS:
# - No dependes del directorio target/ externo.
# - Siempre genera un build limpio y reproducible.
# - Imagen final ligera (solo JRE).
# - Se puede usar directamente en docker-compose.yml:
#       build:
#         context: ./backend
#         dockerfile: Dockerfile
#######################################################################

