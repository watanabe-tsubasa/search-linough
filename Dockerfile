# === base
FROM node:20-alpine AS base
WORKDIR /app

# === deps
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# === build
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# === production
FROM node:20-alpine AS runner
WORKDIR /app

# Cloud Run に必要なポート設定
ENV NODE_ENV=production
ENV PORT=8080

# 本番用依存関係だけインストール（react-router 必須）
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# build済みファイル・依存関係をコピー
COPY --from=build /app/build ./build
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules

# 実行ユーザーを非rootに（セキュリティ対策）
USER node

# アプリ起動
CMD ["npm", "run", "start"]
