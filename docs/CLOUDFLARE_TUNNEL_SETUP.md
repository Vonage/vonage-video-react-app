# Cloudflare Tunnel設定
# 場所: ~/.cloudflared/config.yml
# 
# このファイルを使用する場合:
# cloudflared tunnel run vera-local-tunnel
#
# または、コマンドラインから直接実行:
# cloudflared tunnel run --url http://localhost:3001 vera-local-tunnel

tunnel: vera-local-tunnel
credentials-file: ~/.cloudflared/<TUNNEL_ID>.json

ingress:
  # API/バックエンドエンドポイント
  - hostname: api.vera-local.trycloudflare.com
    service: http://localhost:3001

  # フロントエンド
  - hostname: vera-local.trycloudflare.com
    service: http://localhost:5173

  # デフォルトルート
  - service: http_status:404
