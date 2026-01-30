#!/usr/bin/env bash
set -euo pipefail

# One-shot script to DROP and RECREATE the Prisma schemas used by this project.
# Destructive. You said you have backups elsewhere.

SCHEMAS=(barcode fnmemberlist governance msgmanager tcnbulletin)

DRY_RUN=0
YES=0

usage() {
  cat <<EOF
Usage: $0 [--dry-run] [--yes] [DATABASE_URL]

Options:
  --dry-run   Print the psql commands instead of executing them
  --yes       Skip interactive confirmation
  DATABASE_URL  Optional connection string (or export DATABASE_URL)

This will DROP each schema listed here and then CREATE it again (CASCADE).
EOF
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1; shift ;;
    --yes) YES=1; shift ;;
    -h|--help) usage ;;
    *)
      if [[ -z "${DATABASE_URL:-}" ]]; then DATABASE_URL="$1"; else echo "Unknown arg: $1"; usage; fi
      shift ;;
  esac
done

: "${DATABASE_URL:=${DATABASE_URL:-}}"
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL not set. Export it or pass it as the last arg." >&2
  exit 2
fi

echo "Schemas to reset: ${SCHEMAS[*]}"
if [[ $DRY_RUN -eq 1 ]]; then
  echo "Dry run — commands to execute:"
  for s in "${SCHEMAS[@]}"; do
    echo psql -d "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "DROP SCHEMA IF EXISTS \"$s\" CASCADE; CREATE SCHEMA \"$s\";"
  done
  exit 0
fi

if [[ $YES -ne 1 ]]; then
  read -r -p "This will irreversibly delete data in those schemas. Type 'yes' to proceed: " CONF
  if [[ "$CONF" != "yes" ]]; then
    echo "Aborted by user."; exit 3
  fi
fi

for s in "${SCHEMAS[@]}"; do
  echo "Resetting schema: $s"
  psql -d "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "DROP SCHEMA IF EXISTS \"$s\" CASCADE; CREATE SCHEMA \"$s\";"
done

echo "All done. Schemas reset: ${SCHEMAS[*]}"
