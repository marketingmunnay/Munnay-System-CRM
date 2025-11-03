import { GoogleGenAI } from "@google/genai";
import type { 
  Lead, Campaign, VentaExtra, Incidencia, Egreso, Proveedor, User, Role, 
  BusinessInfo, ClientSource, Service, Product, Membership, ServiceCategory,
  ProductCategory, JobPosition, Publicacion, Seguidor, MetaCampaign, EgresoCategory,
  TipoProveedor, Goal, ComprobanteElectronico
} from '../types.ts';

// URL fija de tu backend en Cloud Run
const API_URL = "https://munnay-system-crm-156279657697.europe-west1.run.app/api";

// Helper genérico para requests
const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: any
): Promise<T> => {
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'Error en la petición a la API');
  }

  if (response.status === 204) return {} as T;
  return response.json();
};

// Ejemplo de uso
export const getLeads = (): Promise<Lead[]> => apiRequest<Lead[]>('/leads', 'GET');
export const saveLead = (lead: Lead): Promise<Lead> =>
  String(lead.id).length > 7
    ? apiRequest<Lead>('/leads', 'POST', { ...lead, id: undefined })
    : apiRequest<Lead>(`/leads/${lead.id}`, 'PUT', lead);

// ... y el resto de tus funciones igual, usando siempre API_URL
