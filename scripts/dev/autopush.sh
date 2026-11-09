#!/bin/zsh
# Zwischenstände über Nacht: alle <minuten> committen und pushen (nur wenn die Namensprüfung grün ist).
set -u
cd ${0:A:h:h:h}
interval=${1:-45}
while true; do
  sleep $(( interval * 60 ))
  if ! node scripts/check_names.mjs >/dev/null 2>&1; then echo "$(date +%H:%M) Namensprüfung rot – kein Push"; continue; fi
  git add -A
  if git diff --cached --quiet; then echo "$(date +%H:%M) nichts Neues"; continue; fi
  n=$(git diff --cached --name-only | wc -l | tr -d ' ')
  git commit -q -m "Zwischenstand $(date +%H:%M): $n Dateien

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" && git push -q && echo "$(date +%H:%M) gepusht ($n Dateien)"
done
