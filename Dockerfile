FROM node:20-alpine AS base
WORKDIR /app

# deps
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# build
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/build ./build
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules

USER node

CMD ["npm", "run", "start"]
