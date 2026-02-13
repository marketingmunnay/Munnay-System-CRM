# Plan de Integración: Meta Lead Ads → CRM Munnay

## 📋 Resumen Ejecutivo

**Objetivo:** Automatizar la captura de leads desde Facebook/Instagram Lead Ads directamente al CRM, permitiendo seguimiento en tiempo real y optimización de campañas mediante Conversions API.

**Estado actual:** ✅ Sistema compatible (100% factible)

**Tiempo estimado:** 2-3 días de desarrollo

---

## 🏗️ Arquitectura de la Integración

```
┌─────────────────┐
│ Facebook/       │
│ Instagram       │
│ Lead Ads        │
└────────┬────────┘
         │ Webhook (HTTP POST)
         ▼
┌─────────────────┐     ┌──────────────┐
│ CRM Backend     │────▶│ PostgreSQL   │
│ (Node.js/       │     │ (Leads table)│
│  Express)       │◀────┘              │
└────────┬────────┘
         │ Conversions API (HTTP POST)
         ▼
┌─────────────────┐
│ Meta Marketing  │
│ API             │
│ (Pixel Events)  │
└─────────────────┘
```

---

## 📝 FASE 1: Recibir Leads (Webhook Endpoint)

### 1.1 Nuevo Modelo de Datos (Prisma Schema)

**Agregar a `schema.prisma`:**

```prisma
model MetaLeadIntegration {
  id                Int       @id @default(autoincrement())
  metaLeadId        String    @unique
  formId            String
  adId              String?
  campaignId        String?
  createdTime       DateTime
  
  // Datos del formulario
  fieldData         Json      // Almacena todos los campos del formulario
  
  // Relación con Lead del CRM
  leadId            Int?      
  lead              Lead?     @relation(fields: [leadId], references: [id])
  
  // Metadatos
  rawPayload        Json      // Payload completo de Meta
  processedAt       DateTime?
  processingStatus  String    @default("pending") // pending, processed, error
  errorMessage      String?   @db.Text
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([metaLeadId])
  @@index([processedAt])
}

// Agregar campo a Lead existente
model Lead {
  // ... campos existentes ...
  metaLeadId        String?   @unique
  metaIntegrations  MetaLeadIntegration[]
}
```

### 1.2 Variables de Entorno (.env)

```env
# Meta Integration
META_APP_SECRET=tu_app_secret_de_meta
META_VERIFY_TOKEN=token_personalizado_seguro_para_webhook
META_PIXEL_ID=tu_pixel_id
META_ACCESS_TOKEN=tu_access_token_permanente
META_API_VERSION=v21.0
```

### 1.3 Nuevo Controlador: `meta-webhook.controller.ts`

```typescript
import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../lib/prisma';

// Verificación del webhook (GET)
export const verifyWebhook = (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    console.log('✅ Webhook verificado correctamente');
    res.status(200).send(challenge);
  } else {
    console.error('❌ Verificación de webhook fallida');
    res.sendStatus(403);
  }
};

// Validar firma de Meta
const validateSignature = (req: Request): boolean => {
  const signature = req.headers['x-hub-signature-256'] as string;
  if (!signature || !process.env.META_APP_SECRET) return false;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.META_APP_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  return `sha256=${expectedSignature}` === signature;
};

// Procesar leads recibidos (POST)
export const receiveLeadWebhook = async (req: Request, res: Response) => {
  try {
    // 1. Validar firma de Meta
    if (!validateSignature(req)) {
      console.error('❌ Firma inválida del webhook');
      return res.sendStatus(403);
    }

    // 2. Responder inmediatamente a Meta (200 OK)
    res.sendStatus(200);

    // 3. Procesar payload de forma asíncrona
    const { entry } = req.body;
    if (!entry || !Array.isArray(entry)) return;

    for (const item of entry) {
      const changes = item.changes || [];
      
      for (const change of changes) {
        if (change.field === 'leadgen') {
          const leadData = change.value;
          await processMetaLead(leadData);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error procesando webhook de Meta:', error);
  }
};

// Procesar lead individual
const processMetaLead = async (leadData: any) => {
  try {
    const metaLeadId = leadData.leadgen_id;
    const formId = leadData.form_id;
    const adId = leadData.ad_id;
    const createdTime = new Date(parseInt(leadData.created_time) * 1000);

    // Guardar integración en BD
    const integration = await prisma.metaLeadIntegration.create({
      data: {
        metaLeadId,
        formId,
        adId,
        campaignId: leadData.campaign_id,
        createdTime,
        fieldData: leadData.field_data || [],
        rawPayload: leadData,
        processingStatus: 'pending'
      }
    });

    // Obtener datos completos del lead desde Meta API
    const fullLeadData = await fetchLeadFromMeta(metaLeadId);
    
    // Mapear campos de Meta a campos del CRM
    const leadFields = mapMetaFieldsToCRM(fullLeadData);
    
    // Crear lead en el CRM
    const newLead = await prisma.lead.create({
      data: {
        ...leadFields,
        metaLeadId,
        redSocial: 'Facebook Lead Ads',
        anuncio: `Ad ID: ${adId}`,
        fechaLead: createdTime,
        vendedor: 'Vanesa', // Default, cambiar según lógica
        estado: 'Nuevo',
        montoPagado: 0
      }
    });

    // Actualizar integración
    await prisma.metaLeadIntegration.update({
      where: { id: integration.id },
      data: {
        leadId: newLead.id,
        processingStatus: 'processed',
        processedAt: new Date()
      }
    });

    // Enviar evento de conversión a Meta
    await sendConversionEvent(newLead, metaLeadId, 'Lead');

    console.log(`✅ Lead de Meta procesado: ${newLead.nombres} ${newLead.apellidos}`);
  } catch (error) {
    console.error('❌ Error procesando lead de Meta:', error);
    // Actualizar estado de error
    await prisma.metaLeadIntegration.updateMany({
      where: { metaLeadId: leadData.leadgen_id },
      data: {
        processingStatus: 'error',
        errorMessage: error.message
      }
    });
  }
};

// Obtener lead completo desde Meta API
const fetchLeadFromMeta = async (leadId: string) => {
  const url = `https://graph.facebook.com/${process.env.META_API_VERSION}/${leadId}?access_token=${process.env.META_ACCESS_TOKEN}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Meta API error: ${response.statusText}`);
  }
  
  return await response.json();
};

// Mapear campos de Meta a CRM
const mapMetaFieldsToCRM = (metaData: any) => {
  const fieldData = metaData.field_data || [];
  const fields: any = {};

  fieldData.forEach((field: any) => {
    const name = field.name.toLowerCase();
    const value = field.values[0] || '';

    // Mapeo de campos comunes
    if (name.includes('nombre') || name === 'first_name') {
      fields.nombres = value;
    } else if (name.includes('apellido') || name === 'last_name') {
      fields.apellidos = value;
    } else if (name.includes('email') || name === 'email') {
      fields.email = value;
    } else if (name.includes('telefono') || name.includes('phone') || name === 'phone_number') {
      fields.numero = value.replace(/\D/g, ''); // Solo números
    } else if (name.includes('servicio') || name.includes('interes')) {
      fields.servicios = [value];
      fields.categoria = value;
    }
  });

  // Valores por defecto si faltan
  fields.nombres = fields.nombres || 'Lead';
  fields.apellidos = fields.apellidos || 'Facebook';
  fields.numero = fields.numero || '0000000000';
  fields.sexo = 'F'; // Default

  return fields;
};

// Enviar evento de conversión a Meta
const sendConversionEvent = async (
  lead: any,
  metaLeadId: string,
  eventName: string
) => {
  try {
    const url = `https://graph.facebook.com/${process.env.META_API_VERSION}/${process.env.META_PIXEL_ID}/events`;

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'system_generated',
          user_data: {
            lead_id: metaLeadId,
            em: lead.email ? [hashSHA256(lead.email)] : undefined,
            ph: lead.numero ? [hashSHA256(lead.numero)] : undefined
          },
          custom_data: {
            lead_event_source: 'Munnay CRM',
            event_source: 'crm',
            value: lead.precioCita || 0,
            currency: 'PEN'
          }
        }
      ],
      access_token: process.env.META_ACCESS_TOKEN
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('❌ Error enviando evento a Meta:', await response.text());
    } else {
      console.log(`✅ Evento "${eventName}" enviado a Meta para lead ${metaLeadId}`);
    }
  } catch (error) {
    console.error('❌ Error en sendConversionEvent:', error);
  }
};

// Hashear con SHA256
const hashSHA256 = (value: string): string => {
  return crypto
    .createHash('sha256')
    .update(value.toLowerCase().trim())
    .digest('hex');
};
```

### 1.4 Nueva Ruta: `meta.routes.ts`

```typescript
import { Router } from 'express';
import { verifyWebhook, receiveLeadWebhook } from '../controllers/meta-webhook.controller';
import { sendTestConversionEvent, syncLeadStages } from '../controllers/meta-conversions.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// Webhook publico (sin autenticación)
router.get('/webhook', verifyWebhook);
router.post('/webhook', receiveLeadWebhook);

// Endpoints protegidos
router.use(requireAuth);
router.post('/test-conversion', requireAdmin, sendTestConversionEvent);
router.post('/sync-lead-stages/:leadId', syncLeadStages);

export default router;
```

---

## 📤 FASE 2: Enviar Eventos de Conversión a Meta

### 2.1 Controlador: `meta-conversions.controller.ts`

```typescript
import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import crypto from 'crypto';

// Mapeo de estados del CRM a eventos de Meta
const LEAD_STATUS_TO_META_EVENT: Record<string, string> = {
  'Nuevo': 'Lead',
  'Seguimiento': 'Marketing Qualified Lead',
  'Agendado': 'Appointment Scheduled',
  'PorPagar': 'Sales Opportunity',
  'Perdido': 'Lead Lost'
};

const RECEPTION_STATUS_TO_META_EVENT: Record<string, string> = {
  'Atendido': 'Converted',
  'Cancelado': 'Lead Cancelled',
  'NoAsistio': 'No Show'
};

// Enviar evento cuando cambia el estado del lead
export const syncLeadStages = async (req: Request, res: Response) => {
  try {
    const leadId = parseInt(req.params.leadId);
    const { estado, estadoRecepcion } = req.body;

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        metaIntegrations: {
          where: { processingStatus: 'processed' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!lead || !lead.metaLeadId) {
      return res.status(404).json({ 
        message: 'Lead no proviene de Meta' 
      });
    }

    // Determinar evento según el estado
    let eventName = '';
    
    if (estado && LEAD_STATUS_TO_META_EVENT[estado]) {
      eventName = LEAD_STATUS_TO_META_EVENT[estado];
    } else if (estadoRecepcion && RECEPTION_STATUS_TO_META_EVENT[estadoRecepcion]) {
      eventName = RECEPTION_STATUS_TO_META_EVENT[estadoRecepcion];
    }

    if (!eventName) {
      return res.status(400).json({ 
        message: 'Estado no mapeado a evento de Meta' 
      });
    }

    // Enviar evento a Meta
    await sendConversionToMeta(lead, eventName);

    res.json({ 
      success: true, 
      eventSent: eventName,
      leadId: lead.id
    });
  } catch (error) {
    console.error('Error en syncLeadStages:', error);
    res.status(500).json({ 
      message: 'Error sincronizando con Meta',
      error: error.message
    });
  }
};

// Enviar conversión a Meta
const sendConversionToMeta = async (lead: any, eventName: string) => {
  const url = `https://graph.facebook.com/${process.env.META_API_VERSION}/${process.env.META_PIXEL_ID}/events`;

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'system_generated',
        user_data: {
          lead_id: lead.metaLeadId,
          em: lead.email ? [hashSHA256(lead.email)] : undefined,
          ph: lead.numero ? [hashSHA256(lead.numero)] : undefined,
          fn: lead.nombres ? [hashSHA256(lead.nombres)] : undefined,
          ln: lead.apellidos ? [hashSHA256(lead.apellidos)] : undefined
        },
        custom_data: {
          lead_event_source: 'Munnay CRM',
          event_source: 'crm',
          value: lead.montoPagado || lead.precioCita || 0,
          currency: 'PEN',
          lead_stage: lead.estado,
          reception_status: lead.estadoRecepcion || ''
        }
      }
    ],
    access_token: process.env.META_ACCESS_TOKEN
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Meta API error: ${error}`);
  }

  console.log(`✅ Conversión "${eventName}" enviada a Meta para Lead ${lead.id}`);
  return await response.json();
};

const hashSHA256 = (value: string): string => {
  return crypto
    .createHash('sha256')
    .update(value.toLowerCase().trim())
    .digest('hex');
};

// Endpoint de prueba
export const sendTestConversionEvent = async (req: Request, res: Response) => {
  try {
    const { metaLeadId, eventName } = req.body;

    const testPayload = {
      data: [
        {
          event_name: eventName || 'Lead',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'system_generated',
          user_data: {
            lead_id: metaLeadId || '1234567890123456'
          },
          custom_data: {
            lead_event_source: 'Munnay CRM Test',
            event_source: 'crm'
          }
        }
      ],
      test_event_code: process.env.META_TEST_EVENT_CODE,
      access_token: process.env.META_ACCESS_TOKEN
    };

    const url = `https://graph.facebook.com/${process.env.META_API_VERSION}/${process.env.META_PIXEL_ID}/events`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });

    const result = await response.json();

    res.json({
      success: response.ok,
      status: response.status,
      result
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
};
```

---

## 🔧 FASE 3: Modificar Controlador de Leads Existente

### 3.1 Actualizar `leads.controller.ts`

Agregar lógica automática para enviar eventos a Meta cuando se actualiza un lead:

```typescript
// Al final de updateLead(), agregar:
export const updateLead = async (req: AuthenticatedRequest, res: Response) => {
  // ... código existente ...

  try {
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: leadUpdateData,
      include: { /* ... includes existentes ... */ }
    });

    // ✅ NUEVO: Sincronizar automáticamente con Meta si el lead proviene de allí
    if (updatedLead.metaLeadId && 
        (req.body.estado !== undefined || req.body.estadoRecepcion !== undefined)) {
      
      // Enviar evento de forma asíncrona (no bloquear la respuesta)
      sendLeadStageToMeta(updatedLead)
        .catch(err => console.error('Error enviando evento a Meta:', err));
    }

    res.json(processLeadForResponse(updatedLead));
  } catch (error) {
    // ... manejo de errores existente ...
  }
};

// Nueva función auxiliar
const sendLeadStageToMeta = async (lead: any) => {
  if (!lead.metaLeadId) return;

  const eventName = 
    LEAD_STATUS_TO_META_EVENT[lead.estado] || 
    RECEPTION_STATUS_TO_META_EVENT[lead.estadoRecepcion];

  if (eventName) {
    await sendConversionToMeta(lead, eventName);
  }
};
```

---

## 📦 FASE 4: Configuración en Facebook Business Manager

### 4.1 Pasos en Meta:

1. **Crear Pixel de Meta:**
   - Ve a Events Manager
   - Crea un nuevo Pixel (o usa uno existente)
   - Copia el Pixel ID

2. **Generar Access Token:**
   - Settings → Conversions API
   - "Generate Access Token"
   - Guardar en `.env` como `META_ACCESS_TOKEN`

3. **Configurar Webhook:**
   - Page Settings → Webhooks
   - Subscribe to `leadgen` events
   - Callback URL: `https://crm.munnaymedicinaestetica.com/api/meta/webhook`
   - Verify Token: el mismo de tu `.env`

4. **Probar Webhook:**
   - Usa el "Test" button en Webhooks
   - Verifica que llegue a tu backend

---

## 🚀 FASE 5: Deployment

### 5.1 Actualizar `.env` en el VPS

```bash
ssh root@157.173.119.186
cd /home/munnay/Munnay-System-CRM/crm-backend
nano .env
```

Agregar:
```env
META_APP_SECRET=xxxxx
META_VERIFY_TOKEN=munnay_webhook_secret_2026
META_PIXEL_ID=xxxxx
META_ACCESS_TOKEN=xxxxx
META_API_VERSION=v21.0
META_TEST_EVENT_CODE=TEST12345  # Opcional, para pruebas
```

### 5.2 Ejecutar Migración de Prisma

```bash
cd /home/munnay/Munnay-System-CRM/crm-backend
npx prisma db push
pm2 restart munnay-backend
```

### 5.3 Verificar Logs

```bash
pm2 logs munnay-backend --lines 100
```

---

## ✅ Checklist de Implementación

- [ ] Actualizar `schema.prisma` con modelo `MetaLeadIntegration`
- [ ] Crear `meta-webhook.controller.ts`
- [ ] Crear `meta-conversions.controller.ts`
- [ ] Crear `meta.routes.ts`
- [ ] Actualizar `api/index.ts` para usar ruta `/meta`
- [ ] Modificar `leads.controller.ts` para sync automático
- [ ] Agregar variables de entorno en `.env`
- [ ] Ejecutar migración Prisma en VPS
- [ ] Configurar webhook en Facebook
- [ ] Probar con Test Events en Events Manager
- [ ] Crear campañas de prueba con Lead Forms

---

## 📊 Ventajas de Esta Integración

1. **Automatización Total:** Leads llegan automáticamente al CRM
2. **Tiempo Real:** Procesamiento instantáneo de leads
3. **Mejora de Campañas:** Meta optimiza anuncios basándose en conversiones reales
4. **Trazabilidad:** Historial completo de cada lead desde Meta
5. **ROI Mejorado:** Mejor atribución de conversiones a campañas específicas

---

## 🛡️ Seguridad

- ✅ Validación de firma con `x-hub-signature-256`
- ✅ Token de verificación único
- ✅ HTTPS obligatorio
- ✅ Rate limiting recomendado
- ✅ Logs de auditoría automáticos

---

## 🔍 Monitoreo y Debugging

### Dashboard recomendado en CRM:

Agregar página en frontend: **"Integración Meta"**

Mostrar:
- Total de leads recibidos de Meta (hoy/semana/mes)
- Tasa de procesamiento exitoso
- Últimos 10 leads de Meta
- Eventos enviados a Meta
- Errores recientes

---

## 💡 Próximos Pasos Sugeridos

1. Implementar retry logic para eventos fallidos
2. Agregar batch processing para grandes volúmenes
3. Dashboard de analytics de Meta en el CRM
4. Notificaciones automáticas cuando llega un lead VIP
5. Integración con WhatsApp Business API para respuesta automática

---

**¿Quieres que proceda con la implementación del código?**
