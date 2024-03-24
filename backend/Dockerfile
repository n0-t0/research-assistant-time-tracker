# backend/Dockerfile
FROM python:3.9-slim

RUN apt update && \
    apt install -y curl && \
    apt clean && \
    rm -rf /var/lib/apt/lists/*

# ユーザーの作成
ARG USERNAME=ryeuser
RUN useradd ${USERNAME} --create-home
USER ${USERNAME}

# 作業ディレクトリの設定
WORKDIR /home/${USERNAME}/app

# Ryeの環境変数
ENV RYE_HOME /home/${USERNAME}/.rye
ENV PATH ${RYE_HOME}/shims:${PATH}

# Ryeのインストール
RUN curl -sSf https://rye-up.com/get | RYE_NO_AUTO_INSTALL=1 RYE_INSTALL_OPTION="--yes" bash

# プロジェクトファイルのコピー
COPY --chown=${USERNAME}:${USERNAME} . .

# 依存関係のインストール
RUN rye sync --no-dev --no-lock

# # Flaskのポートを開放
# EXPOSE 5000

# # アプリケーションの実行コマンド
# CMD ["rye", "run", "python", "api.py"]

# Flaskのポートを開放
EXPOSE 8080

# アプリケーションの実行コマンド
CMD ["rye", "run", "waitress-serve", "--call", "app:create_app"]
