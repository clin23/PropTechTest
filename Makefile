DATABASE_URL ?= $$DATABASE_URL

.PHONY: db-create db-drop migrate-dev seed reset

db-create:
	psql $(DATABASE_URL) -f db/schema.sql

db-drop:
	psql $(DATABASE_URL) -f db/rollback.sql

migrate-dev:
	npx prisma migrate dev --name init

seed:
	npm run seed

reset: db-drop db-create migrate-dev seed
