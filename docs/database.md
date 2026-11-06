# Base de datos y migraciones (Prisma)

## Reglas principales

1. **Nunca edites una migración que ya fue aplicada** en cualquier entorno (ppd, prod o una base compartida). Si te equivocaste, crea una migración nueva que lo corrija.
2. **Nunca uses `prisma db push` en ppd o prod.** Deja la base sin historial y hace que el historial no coincida con la base real.
3. **Lee siempre el SQL generado antes de hacer commit.** Busca especialmente `DROP TABLE`, `DROP COLUMN` y `ALTER ... TYPE`.
4. **Haz un backup antes de cualquier cambio en ppd o prod**, y compara los conteos de filas antes y después.
5. **Ninguna migración debe borrar tablas que contengan datos.**

## Cómo cambiar el esquema

1. Edita `prisma/schema.prisma`.
2. Genera la migración en local:
   ```bash
   npx prisma migrate dev --name <nombre_descriptivo>
   ```
3. Revisa el archivo `migration.sql` creado en `prisma/migrations/`.
4. Haz commit del cambio del esquema y de la carpeta de la migración juntos.
5. En ppd y prod la migración se aplica con `npx prisma migrate deploy` (el contenedor Docker lo ejecuta al iniciar).

## Cómo nombrar las migraciones

- Usa verbos en minúscula con guiones bajos que digan qué hace el cambio: `add_courses_and_enrollments`, `add_index_to_submissions`, `rename_user_email_column`.
- No uses nombres genéricos como `init`, `update` o `fix`.
- Un cambio lógico por migración.

## Historial actual: baseline

El historial anterior fue modificado a mano: tenía dos migraciones `init`, una migración sin nombre y `20251128214047_init_complete`, que empezaba con `DROP TABLE IF EXISTS` sobre varias tablas. En una base nueva, un reset o una base a medio migrar, eso podía borrar datos.

Se reemplazó por **una sola migración baseline**, generada desde `schema.prisma`:

```bash
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
```

- `prisma/migrations/20261105000000_baseline/` crea el esquema completo y no contiene ningún `DROP`.
- El historial anterior se conserva solo como referencia en `prisma/legacy_migrations/`. Prisma no lo lee y **no debe ejecutarse**.

## Base nueva o reiniciada

```bash
npx prisma migrate deploy
```

Crea el esquema completo con el baseline.

## Bases que ya existen (ppd y prod)

Estas bases ya tienen las tablas. **No ejecutes el baseline.** Márcalo como aplicado:

```bash
npx prisma migrate resolve --applied 20261105000000_baseline
```

Orden obligatorio:

1. Backup de la base.
2. Guardar el conteo de filas de las tablas principales.
3. Listar el historial actual:
   ```sql
   SELECT migration_name FROM _prisma_migrations;
   ```
4. Ejecutar `migrate resolve --applied 20261105000000_baseline`.
5. Ejecutar `npx prisma migrate status` y confirmar que no hay migraciones pendientes.
6. Volver a contar las filas y comparar con el paso 2.

Si la tabla `_prisma_migrations` aún contiene las filas de las migraciones antiguas, Prisma avisa de que no encuentra esas carpetas. Esto se resuelve junto con el responsable del entorno antes del deploy, y nunca borrando datos de negocio.