# ==========================================
# Dockerfile — Sistema de Gestión de Convocatorias (Node.js/Express puro)
# ==========================================

# Etapa 1: Construcción
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
# Aseguramos que los JSON de data y los activos públicos queden en dist
RUN mkdir -p dist/data dist/public && cp -r src/data/* dist/data/ && cp -r src/public/* dist/public/

# Etapa 2: Producción
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Solo dependencias de producción
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copiar el build completo (incluye dist/data/*.json)
COPY --from=builder /app/dist ./dist

EXPOSE 8080
ENV PORT=8080

# Iniciar la aplicación
CMD ["npm", "start"]
