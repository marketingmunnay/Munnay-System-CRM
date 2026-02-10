import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todos los movimientos de stock (con filtros opcionales)
export const getMovimientosStock = async (req: Request, res: Response) => {
    try {
        const { productoId, tipoMovimiento, desde, hasta } = req.query;
        
        const where: any = {};
        
        if (productoId) where.productoId = Number(productoId);
        if (tipoMovimiento) where.tipoMovimiento = tipoMovimiento;
        if (desde || hasta) {
            where.fecha = {};
            if (desde) where.fecha.gte = new Date(desde as string);
            if (hasta) where.fecha.lte = new Date(hasta as string);
        }
        
        const movimientos = await (prisma as any).movimientoStock.findMany({
            where,
            include: {
                producto: true,
            },
            orderBy: { fecha: 'desc' },
        });
        
        res.json(movimientos);
    } catch (error) {
        console.error('Error fetching movimientos stock:', error);
        res.status(500).json({ error: 'Error fetching movimientos stock' });
    }
};

// Crear movimiento de stock (entrada o salida)
export const createMovimientoStock = async (req: Request, res: Response) => {
    try {
        const {
            productoId,
            tipoMovimiento,
            cantidad,
            costoUnitario,
            precioUnitario,
            motivo,
            creadoPor,
            ventaExtraId,
            procedimientoId,
        } = req.body;
        
        // Validar producto existe
        const producto = await prisma.product.findUnique({
            where: { id: productoId },
        });
        
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        // Calcular nuevo stock (con valores por defecto si son opcionales)
        let nuevoStock = (producto as any).stockActual ?? 0;
        if (tipoMovimiento === 'entrada') {
            nuevoStock += cantidad;
        } else if (tipoMovimiento === 'salida') {
            nuevoStock -= cantidad;
            if (nuevoStock < 0) {
                return res.status(400).json({ error: 'Stock insuficiente para realizar la salida' });
            }
        }
        
        // Crear movimiento y actualizar stock en transacción
        const [movimiento] = await prisma.$transaction([
            (prisma as any).movimientoStock.create({
                data: {
                    productoId,
                    tipoMovimiento,
                    cantidad,
                    costoUnitario: costoUnitario || 0,
                    precioUnitario: precioUnitario || 0,
                    motivo,
                    creadoPor,
                    ventaExtraId,
                    procedimientoId,
                },
                include: {
                    producto: true,
                },
            }),
            prisma.product.update({
                where: { id: productoId },
                data: {
                    stockActual: nuevoStock,
                    // Actualizar costo de compra si es entrada
                    ...(tipoMovimiento === 'entrada' && costoUnitario > 0 ? { costoCompra: costoUnitario } : {}),
                } as any,
            }),
        ]);
        
        res.status(201).json(movimiento);
    } catch (error) {
        console.error('Error creating movimiento stock:', error);
        res.status(500).json({ error: 'Error creating movimiento stock' });
    }
};

// Obtener alertas de stock (productos en stock mínimo o crítico)
export const getAlertasStock = async (req: Request, res: Response) => {
    try {
        // Obtener todos los productos
        const productos = await prisma.product.findMany() as any[];
        
        // Filtrar en memoria por niveles de stock
        const productosCriticos = productos.filter((p: any) => 
            p.stockActual !== null && 
            p.stockActual !== undefined &&
            p.stockCritico !== null && 
            p.stockCritico !== undefined &&
            p.stockActual <= p.stockCritico
        );
        
        const productosMinimos = productos.filter((p: any) => 
            p.stockActual !== null && 
            p.stockActual !== undefined &&
            p.stockMinimo !== null && 
            p.stockMinimo !== undefined &&
            p.stockCritico !== null &&
            p.stockCritico !== undefined &&
            p.stockActual <= p.stockMinimo && 
            p.stockActual > p.stockCritico
        );
        
        res.json({
            criticos: productosCriticos.sort((a: any, b: any) => (a.stockActual ?? 0) - (b.stockActual ?? 0)),
            minimos: productosMinimos.sort((a: any, b: any) => (a.stockActual ?? 0) - (b.stockActual ?? 0)),
        });
    } catch (error) {
        console.error('Error fetching alertas stock:', error);
        res.status(500).json({ error: 'Error fetching alertas stock' });
    }
};

// Obtener historial de movimientos de un producto específico
export const getMovimientosProducto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        const movimientos = await (prisma as any).movimientoStock.findMany({
            where: { productoId: Number(id) },
            orderBy: { fecha: 'desc' },
        });
        
        res.json(movimientos);
    } catch (error) {
        console.error('Error fetching movimientos producto:', error);
        res.status(500).json({ error: 'Error fetching movimientos producto' });
    }
};
