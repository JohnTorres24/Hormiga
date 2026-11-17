# ==============================================================================
# DOCKERFILE: Cazador de Gastos Hormiga - API Spring Boot (Java 21)
# ==============================================================================
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /app

COPY pom.xml ./
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests

# Etapa liviana de ejecución
FROM eclipse-temurin:21-jre-alpine AS runner

WORKDIR /app

ENV PORT=10000

COPY --from=builder /app/target/cazador-gastos-hormiga-1.0.0.jar app.jar

EXPOSE 10000

ENTRYPOINT ["java", "-jar", "app.jar"]
