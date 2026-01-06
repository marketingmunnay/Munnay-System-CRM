## Configuración

- Copia `.env.example` a `.env` y completa las variables:
	- `DATABASE_URL`: cadena de conexión a Postgres.
	- `JWT_SECRET`: clave segura para firmar tokens.
	- `ALLOWED_ORIGINS`: orígenes permitidos (opcional).

Ejemplos de `DATABASE_URL`:

- Sin SSL (misma VM/red privada):
	- postgresql://USUARIO:PASSWORD@HOST:5432/munnay_db
- Con SSL (proveedores que lo requieren):
	- postgresql://USUARIO:PASSWORD@HOST:5432/munnay_db?sslmode=require

## Comandos útiles

Desarrollo local:

```
npm install
npm run dev
```

Producción (build + start):

```
npm run build
npm start
```

PM2 (opcional):

```
npm run build
pm2 start ecosystem.config.js --env production
pm2 save
pm2 status
```

## Diagnóstico

- `GET /health` verifica que el servidor corre.
- `GET /health/db` verifica conectividad a la base de datos.

Si `health/db` falla con "Can't reach database server":
- Verifica que Postgres escuche en 0.0.0.0 (o crea túnel SSH).
- Asegura reglas de firewall para puerto 5432.
- Revisa `pg_hba.conf` y `postgresql.conf` para permitir el origen.

## Reverse proxy (Nginx) sugerido

Ejemplo básico para exponer el backend en 80/443 y proxy a `127.0.0.1:400`:

```
server {
	listen 80;
	server_name _;

	location / {
		proxy_pass http://127.0.0.1:400;
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
	}
}
```

Para HTTPS, añadir bloque `listen 443 ssl;` y certificados válidos.
