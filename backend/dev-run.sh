#!/bin/sh
# Usado pelo docker-compose.dev.yml: sobe a API com spring-boot-devtools e recompila sozinho quando
# algo em src/main muda. O bind mount do Windows não avisa o container quando um arquivo muda, então
# a detecção é por polling (a cada 2 s).
#
# O devtools só reinicia quando o arquivo .reloadtrigger muda (SPRING_DEVTOOLS_RESTART_TRIGGERFILE no
# compose), e ele só é gravado depois que a compilação termina — assim a API não reinicia no meio do
# build com metade das classes.
#
# Mudou o pom.xml (dependência nova)? Reinicie o serviço: a recompilação aqui roda offline.

# API: JIT só no nível 1 e GC serial — sobe e reinicia mais rápido e usa menos memória, o que importa
# em desenvolvimento. O Maven (que roda o javac) fica sem o TieredStopAtLevel: compilar fica bem mais
# lento sem o JIT completo.
JVM_DEV="-XX:TieredStopAtLevel=1 -XX:+UseSerialGC -Xss512k"
export MAVEN_OPTS="-XX:+UseSerialGC -Xmx512m"

MARCADOR=/tmp/ultima-alteracao
touch "$MARCADOR"

(
  while true; do
    sleep 2
    if [ -n "$(find src/main -type f -newer "$MARCADOR" -print -quit)" ]; then
      touch "$MARCADOR"
      echo "[dev] alteração detectada, recompilando..."
      if mvn -q -B -o compile; then
        date > target/classes/.reloadtrigger
        echo "[dev] compilado, reiniciando a API"
      else
        echo "[dev] erro de compilação: corrija o código e salve de novo"
      fi
    fi
  done
) &

exec mvn -B spring-boot:run -Dspring-boot.run.jvmArguments="$JVM_DEV -Xmx512m"
