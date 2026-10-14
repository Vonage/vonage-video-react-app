#!/bin/bash
# Project defaults that are not generated from app-config.json. Maintained by hand and sourced by
# the generated env.sh, so every command that runs env.sh gets them.
#
# Public, safe-to-commit values only: never put secrets or per-environment values here

# App (web only)
# How long in-app notifications stay on screen.
export NOTIFICATION_DURATION_MS="${NOTIFICATION_DURATION_MS:-4000}"

# Video (web only: the shared app-config.json schema only allows boolean extra keys)
# Highest resolution the publisher may send.
export PUBLISHER_MAX_RESOLUTION="${PUBLISHER_MAX_RESOLUTION:-1920x1080}"
# Range offered for a custom video bitrate, in bits per second.
export MIN_CUSTOM_VIDEO_BITRATE_BPS="${MIN_CUSTOM_VIDEO_BITRATE_BPS:-5000}"
export MAX_CUSTOM_VIDEO_BITRATE_BPS="${MAX_CUSTOM_VIDEO_BITRATE_BPS:-10000000}"
# Frame rates offered in the video settings, separated by `|`.
export SUPPORTED_FRAME_RATES="${SUPPORTED_FRAME_RATES:-30|15|7|1}"

# OIDC authentication (backend only, never mapped into the frontend bundle).
# AUTH_ENABLED, the client ID, provider endpoints, redirect URIs and AUTH_COOKIE_SECRET are per
# environment and live in backend/.env or the deployment config.
# Cookie holding the encrypted access and refresh tokens.
export AUTH_SESSION_COOKIE_NAME="${AUTH_SESSION_COOKIE_NAME:-vera-session}"
# Cookie holding the encrypted ID token, sent only to the sign-out route.
export AUTH_ID_TOKEN_COOKIE_NAME="${AUTH_ID_TOKEN_COOKIE_NAME:-vera-id-token}"
# Short-lived cookie holding the login state and PKCE verifier between sign-in and the callback.
export AUTH_TRANSACTION_COOKIE_NAME="${AUTH_TRANSACTION_COOKIE_NAME:-vera-sign-in}"
# How long the user has to finish logging in at the provider.
export AUTH_TRANSACTION_MAX_AGE_SECONDS="${AUTH_TRANSACTION_MAX_AGE_SECONDS:-600}"
# Refresh the access token when it has this many seconds left.
export AUTH_REFRESH_WINDOW_SECONDS="${AUTH_REFRESH_WINDOW_SECONDS:-30}"
# Timeout for every call to the provider (token, introspection, revocation).
export AUTH_PROVIDER_TIMEOUT_MS="${AUTH_PROVIDER_TIMEOUT_MS:-5000}"
# Scopes requested at sign-in. offline_access asks for a refresh token.
export OIDC_SCOPES="${OIDC_SCOPES:-openid profile email offline_access}"
# Request header and scheme that carry a Bearer token (mobile clients).
export AUTH_HEADER_NAME="${AUTH_HEADER_NAME:-authorization}"
export AUTH_SCHEME="${AUTH_SCHEME:-Bearer}"
