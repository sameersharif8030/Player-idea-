#!/bin/bash
set -a
source /c/Users/Sameer/AppData/Local/hermes/.env 2>/dev/null
set +a

# Test with owl-alpha which we KNOW works
VAR="OPENROUTER_API_KEY"
K="${!V...curl -s --max-time 15 "https://openrouter.ai/api/v1/chat/completions" \
  -H "Authorization: Bearer *** \
  -H "Content-Type: application/json" \
  -d '{"model":"openrouter/owl-alpha","messages":[{"role":"user","content":"Say hi"}]}'
