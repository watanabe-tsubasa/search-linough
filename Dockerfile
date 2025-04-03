FROM node:20-alpine AS development-dependencies-env
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

FROM node:20-alpine AS production-dependencies-env
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS build-env
WORKDIR /app
COPY --from=development-dependencies-env /app /app
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV PORT=8080
ENV NODE_ENV=production

# react-router が dependencies にあればこれで十分
COPY --from=build-env /app /app
RUN npm ci --omit=dev

CMD ["npm", "run", "start"]
