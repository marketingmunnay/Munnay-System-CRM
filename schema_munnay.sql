#!/bin/bash

# Este script generará el esquema SQL para tu base de datos PostgreSQL.
# Se creará un archivo llamado 'munnay_schema.sql' en el directorio actual.
# Asegúrate de ejecutar este script en un entorno Bash.

OUTPUT_FILE="munnay_schema.sql"

echo "Generando el esquema SQL en $OUTPUT_FILE..."

cat << 'EOF' > "$OUTPUT_FILE"
-- Eliminamos las tablas y tipos existentes si ya existen para un despliegue limpio.
-- ¡CUIDADO! Esto borrará todos los datos. Solo úsalo en entornos de desarrollo o si sabes lo que haces.
DROP TABLE IF EXISTS "_LeadToMembership" CASCADE;
DROP TABLE IF EXISTS "goals" CASCADE;
DROP TABLE IF EXISTS "reconocimientos" CASCADE;
DROP TABLE IF EXISTS "emergency_contacts" CASCADE;
DROP TABLE IF EXISTS "addresses" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "Role" CASCADE; -- Tabla generada por Prisma para roles
DROP TABLE IF EXISTS "memberships" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "services" CASCADE;
DROP TABLE IF EXISTS "job_positions" CASCADE;
DROP TABLE IF EXISTS "product_categories" CASCADE;
DROP TABLE IF EXISTS "egreso_categories" CASCADE;
DROP TABLE IF EXISTS "service_categories" CASCADE;
DROP TABLE IF EXISTS "client_sources" CASCADE;
DROP TABLE IF EXISTS "business_info" CASCADE;
DROP TABLE IF EXISTS "proveedores" CASCADE;
DROP TABLE IF EXISTS "tipos_proveedor" CASCADE;
DROP TABLE IF EXISTS "egresos" CASCADE;
DROP TABLE IF EXISTS "comprobantes_electronicos" CASCADE;
DROP TABLE IF EXISTS "comprobantes_items" CASCADE;
DROP TABLE IF EXISTS "incidencias" CASCADE;
DROP TABLE IF EXISTS "ventas_extra" CASCADE;
DROP TABLE IF EXISTS "seguidores" CASCADE;
DROP TABLE IF EXISTS "publicaciones" CASCADE;
DROP TABLE IF EXISTS "meta_campaigns" CASCADE;
DROP TABLE IF EXISTS "campaigns" CASCADE;
DROP TABLE IF EXISTS "alergias" CASCADE;
DROP TABLE IF EXISTS "seguimientos" CASCADE;
DROP TABLE IF EXISTS "procedimientos" CASCADE;
DROP TABLE IF EXISTS "tratamientos" CASCADE;
DROP TABLE IF EXISTS "registros_llamada" CASCADE;
DROP TABLE IF EXISTS "leads" CASCADE;

DROP TYPE IF EXISTS "LeadStatus";
DROP TYPE IF EXISTS "ReceptionStatus";
DROP TYPE IF EXISTS "AtencionStatus";
DROP TYPE IF EXISTS "Seller";
DROP TYPE IF EXISTS "Personal";
DROP TYPE IF EXISTS "Medico";
DROP TYPE IF EXISTS "MetodoPago";
DROP TYPE IF EXISTS "EstadoLlamada";
DROP TYPE IF EXISTS "TipoComprobanteElectronico";
DROP TYPE IF EXISTS "SunatStatus";
DROP TYPE IF EXISTS "TipoComprobante";
DROP TYPE IF EXISTS "ModoPagoEgreso";
DROP TYPE IF EXISTS "DocumentType";
DROP TYPE IF EXISTS "GoalUnit";
DROP TYPE IF EXISTS "GoalArea";
DROP TYPE IF EXISTS "GoalObjective";
DROP TYPE IF EXISTS "TipoPost";
DROP TYPE IF EXISTS "RedSocialPost";

-- Enums
CREATE TYPE "LeadStatus" AS ENUM ('Nuevo', 'Seguimiento', 'PorPagar', 'Agendado', 'Perdido');
CREATE TYPE "ReceptionStatus" AS ENUM ('Agendado', 'PorAtender', 'Atendido', 'Reprogramado', 'Cancelado', 'NoAsistio');
CREATE TYPE "AtencionStatus" AS ENUM ('PorAtender', 'EnSeguimiento', 'SeguimientoHecho');
CREATE TYPE "Seller" AS ENUM ('Vanesa', 'Liz', 'Elvira', 'Janela', 'Keila', 'Luz', 'Dra. Marilia', 'Dra. Sofía', 'Dr. Carlos');
CREATE TYPE "Personal" AS ENUM ('Vanesa', 'Elvira', 'Janela', 'Liz', 'Keila', 'Luz', 'Dra. Marilia', 'Dra. Sofía', 'Dr. Carlos');
CREATE TYPE "Medico" AS ENUM ('Dra. Marilia', 'Dra. Sofía', 'Dr. Carlos');
CREATE TYPE "MetodoPago" AS ENUM ('Efectivo', 'Tarjeta', 'Transferencia', 'Yape', 'Plin');
CREATE TYPE "EstadoLlamada" AS ENUM ('Contesto', 'NoContesto', 'Numero equivocado', 'Ocupado');
CREATE TYPE "TipoComprobanteElectronico" AS ENUM ('Boleta', 'Factura');
CREATE TYPE "SunatStatus" AS ENUM ('Aceptado', 'Pendiente', 'Rechazado', 'Con Observaciones', 'Anulado');
CREATE TYPE "TipoComprobante" AS ENUM ('Factura', 'Boleta', 'Recibo por Honorarios', 'Sin Comprobante');
CREATE TYPE "ModoPagoEgreso" AS ENUM ('Efectivo', 'Transferencia Bancaria', 'Tarjeta de Crédito/Débito', 'Yape/Plin');
CREATE TYPE "DocumentType" AS ENUM ('DNI', 'RUC', 'Pasaporte', 'Carnet de Extranjería');
CREATE TYPE "GoalUnit" AS ENUM ('cantidad', 'porcentaje');
CREATE TYPE "GoalArea" AS ENUM ('Comercial', 'Administración', 'Recepcion', 'Procedimientos');
CREATE TYPE "GoalObjective" AS ENUM ('Leads', 'Agendados', 'Asistidos', 'Costo por Resultado', 'Ventas de Servicios', 'Ventas de Productos', 'Recuperados', 'Conversión de Leads', 'ROI', 'Seguidores', 'Visualizaciones', 'Alcance', 'Engagement', 'Cierre de Evaluaciones', 'Aceptación de Tratamientos', 'Efectividad de Tratamientos', 'Seguimientos Completados', 'Rotación de Personal', 'Nivel de Stock');
CREATE TYPE "TipoPost" AS ENUM ('Reel', 'Historia', 'Carrusel', 'Post');
CREATE TYPE "RedSocialPost" AS ENUM ('Facebook', 'Instagram', 'Tiktok', 'YouTube');

-- Tables
CREATE TABLE "leads" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fechaLead" TIMESTAMP(3) NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "sexo" TEXT NOT NULL,
    "redSocial" TEXT NOT NULL,
    "anuncio" TEXT NOT NULL,
    "vendedor" "Seller" NOT NULL,
    "estado" "LeadStatus" NOT NULL DEFAULT 'Nuevo',
    "montoPagado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metodoPago" "MetodoPago",
    "fechaHoraAgenda" TIMESTAMP(3),
    "servicios" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "categoria" TEXT NOT NULL,
    "fechaVolverLlamar" TIMESTAMP(3),
    "horaVolverLlamar" TEXT,
    "notas" TEXT,
    "nHistoria" TEXT UNIQUE,
    "aceptoTratamiento" TEXT,
    "motivoNoCierre" TEXT,
    "estadoRecepcion" "ReceptionStatus" DEFAULT 'Agendado',
    "recursoId" TEXT,
    "birthDate" TIMESTAMP(3),
    "precioCita" DOUBLE PRECISION,
    "deudaCita" DOUBLE PRECISION,
    "metodoPagoDeuda" "MetodoPago",
    "documentType" "DocumentType",
    "documentNumber" TEXT,
    "razonSocial" TEXT,
    "direccionFiscal" TEXT
);

CREATE TABLE "registros_llamada" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "leadId" INTEGER NOT NULL,
    "numeroLlamada" INTEGER NOT NULL,
    "duracionLlamada" TEXT NOT NULL,
    "estadoLlamada" "EstadoLlamada" NOT NULL,
    "observacion" TEXT,
    FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE
);

CREATE TABLE "tratamientos" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "leadId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "cantidadSesiones" INTEGER NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "montoPagado" DOUBLE PRECISION NOT NULL,
    "metodoPago" "MetodoPago",
    "deuda" DOUBLE PRECISION NOT NULL,
    FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE
);

CREATE TABLE "procedimientos" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "leadId" INTEGER NOT NULL,
    "fechaAtencion" TIMESTAMP(3) NOT NULL,
    "personal" "Personal" NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "tratamientoId" INTEGER NOT NULL,
    "nombreTratamiento" TEXT NOT NULL,
    "sesionNumero" INTEGER NOT NULL,
    "asistenciaMedica" BOOLEAN NOT NULL,
    "medico" "Medico",
    "observacion" TEXT,
    FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE,
    FOREIGN KEY ("tratamientoId") REFERENCES "tratamientos"("id") ON DELETE RESTRICT
);

CREATE TABLE "seguimientos" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "leadId" INTEGER NOT NULL,
    "procedimientoId" INTEGER NOT NULL,
    "nombreProcedimiento" TEXT NOT NULL,
    "fechaSeguimiento" TIMESTAMP(3) NOT NULL,
    "personal" "Personal" NOT NULL,
    "inflamacion" BOOLEAN NOT NULL,
    "ampollas" BOOLEAN NOT NULL,
    "alergias" BOOLEAN NOT NULL,
    "malestarGeneral" BOOLEAN NOT NULL,
    "brote" BOOLEAN NOT NULL,
    "dolorDeCabeza" BOOLEAN NOT NULL,
    "moretones" BOOLEAN NOT NULL,
    "observacion" TEXT,
    FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE
);

CREATE TABLE "alergias" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "leadId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "gravedad" INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE
);

CREATE TABLE "campaigns" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nombreAnuncio" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "alcance" INTEGER NOT NULL,
    "resultados" INTEGER NOT NULL,
    "costoPorResultado" DOUBLE PRECISION NOT NULL,
    "importeGastado" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "meta_campaigns" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nombre" TEXT NOT NULL UNIQUE,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "categoria" TEXT NOT NULL
);

CREATE TABLE "publicaciones" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fechaPost" TIMESTAMP(3) NOT NULL,
    "horaPost" TEXT,
    "temaVideo" TEXT NOT NULL,
    "tipoPost" "TipoPost" NOT NULL,
    "redSocial" "RedSocialPost" NOT NULL,
    "publicacionUrl" TEXT NOT NULL,
    "imageUrl" TEXT,
    "vistas" INTEGER NOT NULL DEFAULT 0,
    "comentarios" INTEGER NOT NULL DEFAULT 0,
    "reacciones" INTEGER NOT NULL DEFAULT 0,
    "conversacionesIniciadas" INTEGER NOT NULL DEFAULT 0,
    "convertidos" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE "seguidores" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "cuenta" TEXT NOT NULL,
    "redSocial" "RedSocialPost" NOT NULL,
    "seguidores" INTEGER NOT NULL DEFAULT 0,
    "dejaronDeSeguir" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE "ventas_extra" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "codigoVenta" TEXT NOT NULL UNIQUE,
    "fechaVenta" TIMESTAMP(3) NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "nHistoria" TEXT NOT NULL,
    "nombrePaciente" TEXT NOT NULL,
    "servicio" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "montoPagado" DOUBLE PRECISION NOT NULL,
    "metodoPago" "MetodoPago" NOT NULL,
    "deuda" DOUBLE PRECISION NOT NULL,
    "fechaPagoDeuda" TIMESTAMP(3)
);

CREATE TABLE "incidencias" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "hora" TEXT NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "nHistoria" TEXT NOT NULL,
    "nombrePaciente" TEXT NOT NULL,
    "tipoIncidencia" TEXT NOT NULL,
    "detalleIncidencia" TEXT NOT NULL,
    "descripcion" TEXT,
    "solucionado" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE "comprobantes_items" (
    "id" SERIAL PRIMARY KEY,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "valorUnitario" DOUBLE PRECISION NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "igv" DOUBLE PRECISION NOT NULL,
    "montoTotal" DOUBLE PRECISION NOT NULL,
    "comprobanteElectronicoId" INTEGER NOT NULL,
    FOREIGN KEY ("comprobanteElectronicoId") REFERENCES "comprobantes_electronicos"("id") ON DELETE CASCADE
);

CREATE TABLE "comprobantes_electronicos" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tipoDocumento" "TipoComprobanteElectronico" NOT NULL,
    "serie" TEXT NOT NULL,
    "correlativo" INTEGER NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL,
    "clienteTipoDocumento" "DocumentType" NOT NULL,
    "clienteNumeroDocumento" TEXT NOT NULL,
    "clienteDenominacion" TEXT NOT NULL,
    "clienteDireccion" TEXT,
    "opGravadas" DOUBLE PRECISION NOT NULL,
    "igv" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "sunatStatus" "SunatStatus" NOT NULL DEFAULT 'Pendiente',
    "ventaType" TEXT NOT NULL,
    "leadId" INTEGER,
    "ventaExtraId" INTEGER,
    FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL,
    FOREIGN KEY ("ventaExtraId") REFERENCES "ventas_extra"("id") ON DELETE SET NULL
);

CREATE TABLE "egresos" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL,
    "fechaPago" TIMESTAMP(3) NOT NULL,
    "proveedor" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipoComprobante" "TipoComprobante" NOT NULL,
    "serieComprobante" TEXT,
    "nComprobante" TEXT,
    "montoTotal" DOUBLE PRECISION NOT NULL,
    "montoPagado" DOUBLE PRECISION NOT NULL,
    "deuda" DOUBLE PRECISION NOT NULL,
    "modoPago" "ModoPagoEgreso",
    "fotoUrl" TEXT,
    "tipoMoneda" TEXT NOT NULL DEFAULT 'Soles',
    "observaciones" TEXT
);

CREATE TABLE "tipos_proveedor" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nombre" TEXT NOT NULL UNIQUE
);

CREATE TABLE "proveedores" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "razonSocial" TEXT NOT NULL UNIQUE,
    "ruc" TEXT NOT NULL UNIQUE,
    "tipo" TEXT NOT NULL,
    "numeroContacto" TEXT,
    "tipoProveedorId" INTEGER,
    FOREIGN KEY ("tipoProveedorId") REFERENCES "tipos_proveedor"("id") ON DELETE SET NULL
);

CREATE TABLE "business_info" (
    "id" INTEGER PRIMARY KEY DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nombre" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "logoUrl" TEXT,
    "loginImageUrl" TEXT
);

CREATE TABLE "client_sources" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nombre" TEXT NOT NULL UNIQUE
);

CREATE TABLE "service_categories" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nombre" TEXT NOT NULL UNIQUE
);

CREATE TABLE "egreso_categories" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nombre" TEXT NOT NULL UNIQUE
);

CREATE TABLE "product_categories" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nombre" TEXT NOT NULL UNIQUE
);

CREATE TABLE "job_positions" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nombre" TEXT NOT NULL UNIQUE
);

CREATE TABLE "services" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "serviceCategoryId" INTEGER,
    UNIQUE ("nombre", "categoria"),
    FOREIGN KEY ("serviceCategoryId") REFERENCES "service_categories"("id") ON DELETE SET NULL
);

CREATE TABLE "products" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "productCategoryId" INTEGER,
    UNIQUE ("nombre", "categoria"),
    FOREIGN KEY ("productCategoryId") REFERENCES "product_categories"("id") ON DELETE SET NULL
);

CREATE TABLE "memberships" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nombre" TEXT NOT NULL UNIQUE,
    "precio" DOUBLE PRECISION NOT NULL,
    "numeroSesiones" INTEGER NOT NULL,
    "descripcion" TEXT
);

CREATE TABLE "Role" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "permissions" TEXT[] NOT NULL,
    "dashboardMetrics" TEXT[] NOT NULL
);

CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "usuario" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "rolId" INTEGER NOT NULL,
    "avatarUrl" TEXT,
    "position" TEXT,
    "documentType" "DocumentType",
    "documentNumber" TEXT,
    "phone" TEXT,
    "birthDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "salary" DOUBLE PRECISION,
    "contractType" TEXT,
    "maritalStatus" TEXT,
    "sex" TEXT,
    "jobPositionId" INTEGER,
    FOREIGN KEY ("rolId") REFERENCES "Role"("id") ON DELETE RESTRICT,
    FOREIGN KEY ("jobPositionId") REFERENCES "job_positions"("id") ON DELETE SET NULL
);

CREATE TABLE "addresses" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "direccion" TEXT NOT NULL,
    "distrito" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "referencia" TEXT,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE "emergency_contacts" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "parentesco" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE "reconocimientos" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "otorgadoPorId" INTEGER NOT NULL,
    "otorgadoPorNombre" TEXT NOT NULL,
    "recibidoPorId" INTEGER NOT NULL,
    "mensaje" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("otorgadoPorId") REFERENCES "users"("id") ON DELETE RESTRICT,
    FOREIGN KEY ("recibidoPorId") REFERENCES "users"("id") ON DELETE RESTRICT
);

CREATE TABLE "goals" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "area" "GoalArea" NOT NULL,
    "objective" "GoalObjective" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" "GoalUnit" NOT NULL,
    "personal" "Personal",
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL
);

-- Tabla de unión para la relación muchos a muchos entre Lead y Membership
CREATE TABLE "_LeadToMembership" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    UNIQUE ("A", "B"),
    FOREIGN KEY ("A") REFERENCES "leads"("id") ON DELETE CASCADE,
    FOREIGN KEY ("B") REFERENCES "memberships"("id") ON DELETE CASCADE
);
EOF

echo "El archivo '$OUTPUT_FILE' ha sido creado."
echo ""
echo "Para ejecutar este esquema en tu base de datos PostgreSQL, puedes usar el siguiente comando:"
echo "psql -U tu_usuario -d tu_base_de_datos -h tu_host -f $OUTPUT_FILE"
echo ""
echo "Asegúrate de reemplazar 'tu_usuario', 'tu_base_de_datos' y 'tu_host' con tus credenciales de PostgreSQL."
