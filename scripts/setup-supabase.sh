#!/usr/bin/env bash
# Aplica las migraciones contra tu proyecto Supabase remoto.
#
# Uso:
#   ./scripts/setup-supabase.sh
#
# Necesita:
#   - .env.local con NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY llenos
#   - Tu DB password de Supabase (Settings → Database → Database password)

set -e

cd "$(dirname "$0")/.."

if [ ! -f .env.local ]; then
  echo "❌ Falta .env.local"
  exit 1
fi

# Cargar variables
set -a
. ./.env.local
set +a

if [[ "$NEXT_PUBLIC_SUPABASE_URL" == PEGAR* ]]; then
  echo "❌ NEXT_PUBLIC_SUPABASE_URL todavía tiene el placeholder."
  echo "   Llená .env.local con los valores de tu proyecto Supabase primero."
  exit 1
fi

# Extraer project ref de la URL (https://xxxxxxx.supabase.co)
PROJECT_REF=$(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed -E 's|https://([^.]+)\.supabase\.co.*|\1|')
echo "→ Proyecto: $PROJECT_REF"

# Link
npx -y supabase@latest link --project-ref "$PROJECT_REF"

# Push migrations
echo "→ Aplicando migraciones..."
npx -y supabase@latest db push

# Generate types
echo "→ Regenerando types/database.ts..."
npx -y supabase@latest gen types typescript --project-id "$PROJECT_REF" > src/types/database.ts

# Apply seed (optional — comenta esta línea si no querés datos demo)
echo "→ Aplicando seed de demo..."
npx -y supabase@latest db execute --file supabase/seed.sql 2>/dev/null || \
  echo "  (seed falló, podés correrlo manual desde Dashboard → SQL Editor)"

echo ""
echo "✅ Listo. Migraciones aplicadas, tipos regenerados, seed cargado."
echo ""
echo "ÚLTIMO PASO MANUAL → crear tu usuario admin:"
echo "  1) https://supabase.com/dashboard/project/$PROJECT_REF/auth/users"
echo "  2) 'Add user' → email/password"
echo "  3) Dashboard → SQL Editor → correr:"
echo "       update public.profiles set role='owner' where email='TU_EMAIL';"
echo ""
echo "Después: reiniciá el dev server y entrá a http://localhost:3001/admin/login"
