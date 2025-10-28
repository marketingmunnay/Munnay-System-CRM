import { Router } from 'express';
import * as controller from '../controllers/config.controller';

const router = Router();

// Business Info
router.get('/business-info', controller.getBusinessInfo);
router.put('/business-info', controller.updateBusinessInfo);

// Client Sources
router.get('/client-sources', controller.getClientSources);
router.post('/client-sources', controller.createClientSource);
router.put('/client-sources/:id', controller.updateClientSource);
router.delete('/client-sources/:id', controller.deleteClientSource);

// Services
router.get('/services', controller.getServices);
router.post('/services', controller.createService);
router.put('/services/:id', controller.updateService);
router.delete('/services/:id', controller.deleteService);

// Products
router.get('/products', controller.getProducts);
router.post('/products', controller.createProduct);
router.put('/products/:id', controller.updateProduct);
router.delete('/products/:id', controller.deleteProduct);

// Memberships
router.get('/memberships', controller.getMemberships);
router.post('/memberships', controller.createMembership);
router.put('/memberships/:id', controller.updateMembership);
// FIX: Corrected typo from deleteMemberships to deleteMembership
router.delete('/memberships/:id', controller.deleteMembership);

// Service Categories
router.get('/service-categories', controller.getServiceCategories);
router.post('/service-categories', controller.createServiceCategory);
router.put('/service-categories/:id', controller.updateServiceCategory);
router.delete('/service-categories/:id', controller.deleteServiceCategory);

// Product Categories
router.get('/product-categories', controller.getProductCategories);
router.post('/product-categories', controller.createProductCategory);
router.put('/product-categories/:id', controller.updateProductCategory);
router.delete('/product-categories/:id', controller.deleteProductCategory);

// Egreso Categories
router.get('/egreso-categories', controller.getEgresoCategories);
router.post('/egreso-categories', controller.createEgresoCategory);
router.put('/egreso-categories/:id', controller.updateEgresoCategory);
router.delete('/egreso-categories/:id', controller.deleteEgresoCategory);

// Job Positions
router.get('/job-positions', controller.getJobPositions);
router.post('/job-positions', controller.createJobPosition);
router.put('/job-positions/:id', controller.updateJobPosition);
router.delete('/job-positions/:id', controller.deleteJobPosition);

// Comprobantes Electronicos
router.get('/comprobantes', controller.getComprobantes);
router.post('/comprobantes', controller.createComprobante);
router.put('/comprobantes/:id', controller.updateComprobante);
router.delete('/comprobantes/:id', controller.deleteComprobante);


export default router;