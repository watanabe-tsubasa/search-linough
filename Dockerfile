# 1. Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2. Production stage
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# remix-serve を使うために react-router を dependencies に含めておく必要あり
COPY --from=build /app ./
RUN npm ci --omit=dev

CMD ["npm", "run", "start"]
