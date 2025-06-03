FROM maven:3.9.4-eclipse-temurin-17 AS builder

WORKDIR /build
COPY . /build
RUN mvn -f /build/pom.xml clean package -DskipTests

FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
