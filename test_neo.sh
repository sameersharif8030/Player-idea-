#!/bin/bash
set -a
source /c/Users/Sameer/AppData/Local/hermes/.env 2>/dev/null
set +a

VAR_NAME="OPENROUTER_API_KEY"
API_KEY="${!VAR_NAME}"

curl -s --max-time 45 "https://openrouter.ai/api/v1/chat/completions" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"nvidia/nemotron-3-ultra-550b-a55b:free","messages":[{"role":"user","content":"Say hello in one word"}]}'
