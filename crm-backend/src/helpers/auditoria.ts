import prisma from '../lib/prisma';

/**
 * Registra una actividad de usuario en la base de datos.
 * @param usuarioId ID del usuario que realiza la acción
 * @param accion Tipo de acción realizada (ej: 'ver_perfil', 'actualizar_metas', 'registrar_venta')
 * @param detalle Descripción o detalle adicional de la acción
 */
export async function logActividad(usuarioId: number, accion: string, detalle: string) {
  try {
    await prisma.registroActividad.create({
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
