FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Cache do npm (BuildKit) entre builds: só baixa de novo o que mudou no package-lock.json.
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
