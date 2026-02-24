import prisma from '../lib/prisma';

/**
 * Registra una actividad de usuario en la base de datos.
 * @param usuarioId ID del usuario que realiza la acción
 * @param accion Tipo de acción realizada (ej: 'ver_perfil', 'actualizar_metas', 'registrar_venta')
 * @param detalle Descripción o detalle adicional de la acción
 */ // Eliminar registros de auditoría relacionados a módulos eliminados
export async function logActividad(usuarioId: number, accion: string, detalle: string) {
  const registroActividad = (prisma as any).registroActividad;
  if (!registroActividad) return;
  try {
    await registroActividad.create({
      data: {
        usuarioId,
        accion,
        detalle,
        fechaHora: new Date(),
      },
    });
  } catch (error) {
    // Puedes loguear el error o manejarlo según tu necesidad
    console.error('Error registrando actividad:', error);
  }
}
