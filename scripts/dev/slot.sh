#!/bin/zsh
# Zählsemaphore über mkdir: höchstens <n> gleichzeitige Läufe je <name> (über alle Agenten hinweg).
# Aufruf: scripts/dev/slot.sh <name> <n> <befehl …>
# Beispiele: scripts/dev/slot.sh heavy 2 npx tsc --noEmit
set -u
name=$1; n=$2; shift 2
base=${TMPDIR:-/tmp}/nexus-slots/$name
mkdir -p "$base"
while true; do
  for i in $(seq 1 $n); do
    d="$base/$i"
    if mkdir "$d" 2>/dev/null; then
      echo $$ > "$d/pid"
      trap 'rm -rf "$d"' EXIT INT TERM
      "$@"
      exit $?
    fi
    # verwaiste Sperre (Prozess tot) freigeben
    p=$(cat "$d/pid" 2>/dev/null)
    if [[ -n $p ]] && ! kill -0 $p 2>/dev/null; then rm -rf "$d"; fi
  done
  sleep 2
done
