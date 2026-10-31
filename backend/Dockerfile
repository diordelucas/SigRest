# Estágio 1: Compilação com Maven
# O cache em /root/.m2 (BuildKit) guarda as dependências entre builds: mesmo quando o pom.xml muda,
# só o que é novo é baixado.
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn dependency:go-offline -B -q
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn package -DskipTests -B -q

# Estágio 2: Execução só com o JRE. A variante Ubuntu (e não a -alpine) porque a do Alpine só existe
# para amd64 — a VM gratuita da Oracle é ARM (arm64).
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/SigRestBack-1.0-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
