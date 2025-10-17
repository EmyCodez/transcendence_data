FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package*.json ./
RUN npm ci --only=production
VOLUME ["/app/data"]
ENV DATABASE_FILE=/app/data/db.sqlite
EXPOSE 3000
CMD ["node", "dist/index.js"]
