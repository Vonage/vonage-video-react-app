#!/bin/bash

# Cloudflare Tunnel セットアップスクリプト
# 使用方法: ./scripts/setupCloudflaredTunnel.sh

set -e

echo "================================"
echo "Cloudflare Tunnel Setup"
echo "================================"

# cloudflaredのインストール確認
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared is not installed"
    echo ""
    echo "インストール手順:"
    echo "1. Homebrew使用時: brew install cloudflare/cloudflare/cloudflared"
    echo "2. または公式サイトからダウンロード: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
    echo ""
    exit 1
fi

echo "✅ cloudflared is installed: $(cloudflared --version)"
echo ""

# アカウント認証確認
echo "🔑 Cloudflare認証確認..."
if ! cloudflared tunnel list &> /dev/null; then
    echo "⚠️  認証が必要です。以下のコマンドを実行してください:"
    echo "   cloudflared tunnel login"
    echo ""
    echo "その後、このスクリプトを再度実行してください。"
    exit 1
fi

echo "✅認証完了"
echo ""

# トンネルの作成
TUNNEL_NAME="vera-local-tunnel"
TUNNEL_CONFIG="$HOME/.cloudflared/config.yml"

echo "🌐 Cloudflare Tunnel設定..."
echo ""
echo "トンネル名: $TUNNEL_NAME"
echo "バックエンド: http://localhost:3001"
echo "フロントエンド: http://localhost:5173"
echo ""

# トンネルが存在するか確認
if cloudflared tunnel list | grep -q "$TUNNEL_NAME"; then
    echo "ℹ️  トンネル '$TUNNEL_NAME' は既に存在します"
    TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
    echo "   トンネルID: $TUNNEL_ID"
else
    echo "📝 新しいトンネンルを作成しています..."
    cloudflared tunnel create $TUNNEL_NAME
    TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
    echo "✅ トンネル作成完了"
    echo "   トンネルID: $TUNNEL_ID"
fi

echo ""
echo "================================"
echo "✅ セットアップ完了！"
echo "================================"
echo ""
echo "次のステップ:"
echo "1. バックエンドを起動: yarn start:backend"
echo "2. フロントエンドを起動: yarn start:frontend"
echo "3. Cloudflare Tunnelを起動: ./scripts/runCloudflaredTunnel.sh"
echo ""
