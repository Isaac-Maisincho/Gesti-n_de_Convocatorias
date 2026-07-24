FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

# Copiar archivos estáticos
RUN mkdir -p dist/public
RUN cp -r src/public/* dist/public/

# Copiar archivos JSON
RUN mkdir -p dist/data
RUN cp -r src/data/* dist/data/

FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["npm", "start"]