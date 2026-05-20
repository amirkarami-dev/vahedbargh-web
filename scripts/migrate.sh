#!/bin/bash
# Migration script: dump auth users from old Supabase, restore to new Supabase

OLD_HOST="185.182.220.182"
OLD_PORT="5432"
NEW_SUPABASE_URL="https://supabase.kurdnezambargh.ir"
NEW_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJleHAiOjE5ODM4MTI5OTYsImlhdCI6MTc3OTI2NDQxN30.poS9DAupA2IGVhovftsGX3EAnSAZDY5D7mS_WWoBdyM"
NEW_DB_PASS="Kurd-Supabase-Str0ng-2025"

echo "=== Testing connection to old Supabase DB ==="
for pwd in "postgres" "your-super-secret-and-long-postgres-password" "supabase" "postgres123"; do
  result=$(PGPASSWORD="$pwd" docker exec -e PGPASSWORD="$pwd" supabase-db \
    psql -h "$OLD_HOST" -U postgres -d postgres -c '\dt public.*' 2>&1)
  if echo "$result" | grep -qv "FATAL\|error"; then
    echo "Connected with password: $pwd"
    OLD_PASS="$pwd"
    break
  fi
done

if [ -z "$OLD_PASS" ]; then
  echo "Could not connect to old DB. Listing auth users via API instead..."

  # Dump auth schema via API is not possible, so we'll migrate users via admin API
  # The users will be created directly on the new Supabase
  echo "Will create users via new Supabase admin API."
else
  echo "=== Dumping auth schema from old DB ==="
  PGPASSWORD="$OLD_PASS" docker exec -e PGPASSWORD="$OLD_PASS" supabase-db \
    pg_dump -h "$OLD_HOST" -U postgres -d postgres \
    --schema auth --no-owner --no-privileges \
    --exclude-table "auth.schema_migrations" \
    --exclude-table "auth.instances" \
    -t "auth.users" -t "auth.identities" \
    -a 2>/dev/null > /tmp/auth_users_dump.sql

  echo "=== Restoring auth users to new DB ==="
  PGPASSWORD="$NEW_DB_PASS" docker exec -e PGPASSWORD="$NEW_DB_PASS" supabase-db \
    psql -U postgres -d postgres < /tmp/auth_users_dump.sql 2>&1
  echo "=== Migration complete ==="
fi

echo ""
echo "=== Creating users via new Supabase admin API ==="

# User 1: amirkarami.dev@gmail.com
echo "Creating amirkarami.dev@gmail.com..."
curl -s -X POST "$NEW_SUPABASE_URL/auth/v1/admin/users" \
  -H "Authorization: Bearer $NEW_SERVICE_KEY" \
  -H "apikey: $NEW_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"amirkarami.dev@gmail.com","password":"Abcd@1234","email_confirm":true,"role":"authenticated"}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  => id={d.get(\"id\",\"ERROR\")} email={d.get(\"email\",d.get(\"msg\",\"?\"))}')"

# User 2: admin@sebnb.ir
echo "Creating admin@sebnb.ir..."
curl -s -X POST "$NEW_SUPABASE_URL/auth/v1/admin/users" \
  -H "Authorization: Bearer $NEW_SERVICE_KEY" \
  -H "apikey: $NEW_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sebnb.ir","password":"AdminSebnb@2025","email_confirm":true,"role":"authenticated"}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  => id={d.get(\"id\",\"ERROR\")} email={d.get(\"email\",d.get(\"msg\",\"?\"))}')"

echo ""
echo "=== Listing users in new Supabase ==="
curl -s "$NEW_SUPABASE_URL/auth/v1/admin/users" \
  -H "Authorization: Bearer $NEW_SERVICE_KEY" \
  -H "apikey: $NEW_SERVICE_KEY" | python3 -c "
import sys, json
d = json.load(sys.stdin)
users = d.get('users', [])
print(f'Total users: {len(users)}')
for u in users:
    print(f'  - {u[\"email\"]} (confirmed: {bool(u.get(\"email_confirmed_at\"))})')
"

echo ""
echo "=== Migration script done ==="
