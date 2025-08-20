# -----------------------
# Frontend build stage
# -----------------------
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# -----------------------
# Backend build stage
# -----------------------
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml ./
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# -----------------------
# Final runtime image
# -----------------------
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app


EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
