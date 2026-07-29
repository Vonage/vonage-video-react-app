#!/bin/bash

# Cloudflare Tunnel実行スクリプト
# 使用方法: ./scripts/runCloudflaredTunnel.sh

set -e

TUNNEL_NAME="vera-local-tunnel"
BACKEND_PORT=3001
FRONTEND_PORT=5173

echo "================================"
echo "Cloudflare Tunnel - 実行中"
echo "================================"
echo ""

# トンネルが存在するか確認
if ! cloudflared tunnel list | grep -q "$TUNNEL_NAME"; then
    echo "❌ エラー: トンネン '$TUNNEL_NAME' が見つかりません"
    echo "セットアップを先に実行してください: ./scripts/setupCloudflaredTunnel.sh"
    exit 1
fi

TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
echo "ℹ️  トンネンID: $TUNNEL_ID"
echo ""

# ポート確認
echo "ℹ️  バックエンド確認中 (localhost:$BACKEND_PORT)..."
if ! nc -z localhost $BACKEND_PORT 2>/dev/null; then
    echo "⚠️  バックエンドが起動していません"
    echo "別のターミナルで実行: yarn start:backend"
    echo ""
fi

echo "ℹ️  フロントエンド確認中 (localhost:$FRONTEND_PORT)..."
if ! nc -z localhost $FRONTEND_PORT 2>/dev/null; then
    echo "⚠️  フロントエンドが起動していません"
    echo "別のターミナルで実行: yarn start:frontend"
    echo ""
fi

echo "🚀 Cloudflare Tunnelを起動しています..."
echo ""
echo "================================================"
echo "トンネルが正常に起動したら、以下のURLにアクセスしてください:"
echo "https://$TUNNEL_ID.trycloudflare.com"
echo "================================================"
echo ""
echo "Ctrl+C で停止"
echo ""

# トンネルを実行
cloudflared tunnel run $TUNNEL_NAME
