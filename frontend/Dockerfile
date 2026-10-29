# Estágio 1: build de produção do React (arquivos estáticos otimizados)
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
# Cache do npm (BuildKit) entre builds: só baixa de novo o que mudou no package-lock.json.
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund
COPY . .
# Endereço da API, embutido no JavaScript durante o build. Em produção é "/api": o Caddy encaminha
# para o backend no mesmo domínio (sem CORS). Localmente, o docker-compose.yml passa o endereço do backend.
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# Estágio 2: nginx servindo os arquivos estáticos
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
