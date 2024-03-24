# frontend/Dockerfile
FROM node:20

# 作業ディレクトリの設定
WORKDIR /app

# 依存関係ファイルのコピー
COPY package.json yarn.lock ./

# 依存関係のインストール
RUN yarn install

# アプリケーションのコピー
COPY . .

# ビルド
RUN yarn build

# アプリケーションのポートを開放
EXPOSE 3000

# 実行コマンド
CMD ["yarn", "vite", "--host", "0.0.0.0", "--port", "3000"]
