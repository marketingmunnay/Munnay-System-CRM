# Prompts operativos para el Calendario asistido por IA

## 1. Crear citas repetidas (recurrencias)
```
Quiero que crees una serie de citas repetidas en el calendario del sistema:

Paso 1: Empieza creando una nueva cita o abriendo una existente con:
Cliente: {nombre_cliente}
Servicio(s): {servicio_1}, {servicio_2}, …
Fecha inicial: {fecha_inicio}
Hora de inicio: {hora_inicio}
Profesional asignado: {profesional}

Paso 2: Establece la repetición:
Frecuencia: {diaria / semanal / mensual}
Intervalo: cada {n} veces
Día(s) de la semana (si aplica): {lunes, miércoles,…}
Fecha final o “Sin fin”: {fecha_fin / nunca}

Paso 3: Guarda la serie de citas.

Validaciones:
- Verifica que el cliente y servicios existan en el sistema.
- Si alguna cita entra en conflicto con disponibilidad, sugiere alternativas.

Resultado esperado:
- Una serie de citas repetidas guardadas en el calendario con el icono de repetición.
- Si hay errores, indicar el paso y el dato faltante.
```
Referencia: flujo de recurrencias tipo Fresha.

## 2. Actualizar detalles de una cita existente
```
Quiero que actualices la información de una cita existente:

Paso 1: Identifica la cita por:
- ID de cita: {id_cita}, o
- Fecha/hora + cliente: {fecha}, {hora}, {nombre_cliente}

Paso 2: Aplica cambios según lo que se indique:
- Actualizar cliente: {nuevo_cliente}
- Reemplazar cliente: {cliente_actual} → {nuevo_cliente}
- Cambiar servicios:
  * Añadir: {servicio_nuevo}
  * Eliminar: {servicio_a_quitar}
  * Modificar: {servicio}, {nueva_duración}, {nuevo_profesional}
- Actualizar notas internas: {notas}

Paso 3: Guarda los cambios.

Validaciones:
- Cliente debe existir o crearse previamente.
- Servicio y profesional deben estar en el catálogo.

Resultado esperado:
- Cita actualizada con todos los datos modificados y confirmación al usuario.
```

## 3. Actualizar el estado de una cita
```
Quiero que actualices el estado de una cita:

Paso 1: Localiza la cita por:
- ID, o
- Cliente + fecha y hora

Paso 2: Cambia el estado a:
- Booked (programada)
- Confirmed (confirmada)
- Completed (completada)
- Cancelled (cancelada)
- No-show (no asistió)
- Personalizado: {estado_personalizado}

Paso 3: Guarda el nuevo estado.

Resultado esperado:
- La cita muestra el nuevo estado en el calendario.
- Si el sistema lo permite, se envía notificación al cliente.
```

## 4. Reprogramar (mover) una cita
```
Quiero que reprogrames una cita existente:

Paso 1: Identifica la cita:
- ID: {id_cita}, o
- Cliente + fecha y hora: {nombre_cliente}, {fecha}, {hora}

Paso 2: Indica la nueva programación:
- Nueva fecha: {nueva_fecha}
- Nueva hora de inicio: {nueva_hora}
- (Opcional) Nuevo profesional: {nuevo_profesional}

Paso 3: Mueve la cita en el calendario.

Validaciones:
- Verifica disponibilidad del profesional y horas disponibles.

Resultado esperado:
- Cita movida a la nueva fecha/hora con confirmación de los cambios.
```

## Recomendaciones generales
- Siempre especificar cómo identificar la cita (ID o cliente + fecha/hora).
- Añadir verificaciones de disponibilidad y consistencia de datos.
- Pedir al agente que detalla errores o datos faltantes.
- Incluir pasos opcionales como notificaciones o bitácora si la plataforma lo soporta.
