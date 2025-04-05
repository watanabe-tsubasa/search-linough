FROM node:20-slim AS base
WORKDIR /app

# deps
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm install

# build
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# runner
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# ← ここで build-arg を ENV に変換
ARG SUPABASE_URL
ARG SUPABASE_KEY
ENV SUPABASE_URL=${SUPABASE_URL}
ENV SUPABASE_KEY=${SUPABASE_KEY}

COPY package.json package-lock.json ./
RUN npm install --omit=dev

COPY --from=build /app/build ./build
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules

USER node

CMD ["npm", "run", "start"]
