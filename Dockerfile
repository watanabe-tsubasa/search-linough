# 開発依存をインストール（ビルド用）
FROM node:20-alpine AS development-dependencies-env
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# 本番依存のみを取得
FROM node:20-alpine AS production-dependencies-env
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# アプリをビルド
FROM node:20-alpine AS build-env
WORKDIR /app
COPY --from=development-dependencies-env /app /app
RUN npm run build

# 軽量な本番イメージを作成
FROM node:20-alpine
WORKDIR /app
# Cloud Run が期待するポート番号
ENV PORT=8080
# 静的サーバ serve をインストール
RUN npm install -g serve
# 本番依存を追加
COPY --from=production-dependencies-env /app/node_modules ./node_modules
COPY --from=build-env /app/build ./build
# 静的ファイルをホスティング
CMD ["serve", "-s", "build", "-l", "8080"]
