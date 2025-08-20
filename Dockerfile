# Frontend build stage
FROM node:20-alpine AS frontend-build
WORKDIR /app/client
COPY client/package*.json ./
COPY client/ ./
RUN npm install
RUN npm run build

# Backend build stage
FROM maven:3.9.6-eclipse-temurin-21 AS backend-build
WORKDIR /app
COPY server/pom.xml ./pom.xml
COPY server/src ./src
COPY --from=frontend-build /app/client/dist ./src/main/resources/static/dist
RUN mvn clean package -DskipTests

# Runtime image
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=backend-build /app/target/*SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
