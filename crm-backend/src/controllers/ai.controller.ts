import { Request, Response } from 'express';
import OpenAI from 'openai';

// Configuración del cliente OpenAI (Groq)
const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || '';
const client = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
});

// Modelo por defecto (puede ajustarse con env OPENAI_MODEL)
const MODEL_NAME = process.env.OPENAI_MODEL || 'openai/gpt-oss-20b';

// Simple in-memory circuit breaker / cooldown to avoid hammering the provider
let aiCooldownUntil: number | null = null; // timestamp ms
const AI_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

// Helper para extraer texto de la respuesta de la API (Groq/OpenAI)
const extractTextFromResponse = (resp: any): string => {
  if (!resp) return '';
  // si la librería expone `output_text` (ejemplo de Groq)
  if (typeof resp.output_text === 'string' && resp.output_text.length) return resp.output_text;

  // nueva API Responses: buscar en `output` o `output[0].content`
  if (Array.isArray(resp.output) && resp.output.length) {
    const first = resp.output[0];
    if (typeof first === 'string') return first;
    if (first.content && Array.isArray(first.content)) {
      return first.content.map((c: any) => c.text || (typeof c === 'string' ? c : '')).join('');
    }
  }

  // fallback: si la respuesta tiene `text` o `choices` (compatibilidad con otros clientes)
  if (typeof resp.text === 'string') return resp.text;
  if (resp.choices && Array.isArray(resp.choices) && resp.choices[0]) {
    const c = resp.choices[0];
    if (typeof c.text === 'string') return c.text;
    if (c.message && typeof c.message.content === 'string') return c.message.content;
  }

  return '';
};

export const generateContent = async (req: Request, res: Response) => {
  try {
    // If cooldown active, short-circuit to avoid further provider calls
    if (aiCooldownUntil && Date.now() < aiCooldownUntil) {
      const waitSec = Math.ceil((aiCooldownUntil - Date.now()) / 1000);
      return res.status(429).json({ message: `La API de IA está en enfriamiento por límite de cuota. Intenta de nuevo en ${waitSec} segundos.` });
    }
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    if (!GROQ_API_KEY) {
      return res.status(500).json({ message: 'Groq/OpenAI API key not configured' });
    }

    // Llamada al endpoint Responses (Groq/OpenAI)
    const resp = await client.responses.create({ model: MODEL_NAME, input: prompt });
    const text = extractTextFromResponse(resp) || '';
    res.status(200).json({ content: text });
  } catch (error) {
    console.error('Error generating AI content:', error);
    const errAny: any = error || {};
    const statusCode = errAny.status || errAny.statusCode || errAny.code || null;
    if (statusCode === 429 || /quota|rate limit|Too Many Requests/i.test(errAny.message || '')) {
      aiCooldownUntil = Date.now() + AI_COOLDOWN_MS;
      const message = 'La API de IA ha excedido la cuota o está limitada. Se activó un periodo de enfriamiento. Por favor revisa el plan/billing y espera antes de reintentar.';
      return res.status(429).json({ message, detail: errAny.message || null });
    }
    if (statusCode && statusCode >= 500 && statusCode < 600) {
      return res.status(502).json({ message: 'Error del proveedor de IA. Intenta nuevamente más tarde.' });
    }
    res.status(500).json({ 
      message: 'Error generating AI content', 
      detail: errAny.message || String(errAny)
    });
  }
};

export const generateAnalysis = async (req: Request, res: Response) => {
  try {
    const { seguimientos, paciente } = req.body;

    if (!seguimientos || !Array.isArray(seguimientos)) {
      return res.status(400).json({ message: 'Seguimientos array is required' });
    }

    if (!GROQ_API_KEY) {
      return res.status(500).json({ message: 'Groq/OpenAI API key not configured' });
    }

    // Crear un prompt específico para análisis de seguimientos
    const prompt = `
    Como experto en salud y análisis médico especializado en estética, analiza los siguientes datos de seguimiento del paciente ${paciente?.nombre || 'No especificado'}:

    Seguimientos registrados:
    ${seguimientos.map((seg: any, index: number) => `
    ${index + 1}. Fecha: ${seg.fecha}
       Descripción: ${seg.descripcion}
       Estado: ${seg.estado || 'No especificado'}
       Observaciones: ${seg.observaciones || 'Ninguna'}
    `).join('\n')}

    Por favor, proporciona un análisis estructurado que incluya:
    
    **📊 Resumen del Progreso:**
    - Estado general del paciente
    - Evolución observada en el tiempo
    
    **📈 Tendencias Identificadas:**
    - Patrones en la respuesta al tratamiento
    - Mejoras o preocupaciones recurrentes
    
    **🎯 Recomendaciones Específicas:**
    - Próximos pasos sugeridos
    - Ajustes al protocolo de tratamiento
    
    **⚠️ Alertas y Consideraciones:**
    - Áreas que requieren atención especial
    - Signos de seguimiento prioritario
    
    **✅ Evaluación General:**
    - Clasificación del progreso (Excelente/Bueno/Regular/Requiere Atención)
    - Pronóstico a corto plazo

    Mantén un tono profesional, médico y constructivo. El análisis debe ser específico para tratamientos estéticos y orientado a la mejora continua del cuidado del paciente.
    `;

    const resp = await client.responses.create({ model: MODEL_NAME, input: prompt });
    const text = extractTextFromResponse(resp) || '';
    res.status(200).json({ analysis: text });
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    const errAny: any = error || {};
    const statusCode = errAny.status || errAny.statusCode || errAny.code || null;
    if (statusCode === 429 || /quota|rate limit|Too Many Requests/i.test(errAny.message || '')) {
      aiCooldownUntil = Date.now() + AI_COOLDOWN_MS;
      return res.status(429).json({ message: 'La API de IA ha excedido la cuota o está limitada. Por favor revisa el plan/billing y espera antes de reintentar.' });
    }
    if (statusCode && statusCode >= 500 && statusCode < 600) {
      return res.status(502).json({ message: 'Error del proveedor de IA. Intenta nuevamente más tarde.' });
    }
    res.status(500).json({ 
      message: 'Error generating AI analysis', 
      detail: errAny.message || String(errAny)
    });
  }
};

export const generateCommercialReport = async (req: Request, res: Response) => {
  try {
    const { salesData, goals, period } = req.body;

    if (!GROQ_API_KEY) {
      return res.status(500).json({ message: 'Groq/OpenAI API key not configured' });
    }

    const prompt = `
    Como analista comercial especializado en clínicas estéticas, genera un informe ejecutivo basado en los siguientes datos del período ${period}:

    **Datos de Ventas:**
    ${JSON.stringify(salesData, null, 2)}

    **Metas Establecidas:**
    ${JSON.stringify(goals, null, 2)}

    Genera un resumen en formato Markdown que sea **breve y directo**. Estructúralo con los siguientes títulos en negrita:
    - **Diagnóstico General:** Un resumen del rendimiento comercial general.
    - **Análisis de Metas:** Un análisis conciso del cumplimiento de metas, indicando para cada una si fue **"Lograda"** o **"No Lograda"**.
    - **Recomendaciones Clave:** Una o dos recomendaciones accionables para mejorar los resultados.
    
    **Importante:** No incluyas encabezados numerados o con '###' como "### 2. ...". Solo usa los títulos en negrita proporcionados.
    `;

    const resp = await client.responses.create({ model: MODEL_NAME, input: prompt });
    const text = extractTextFromResponse(resp) || '';
    res.status(200).json({ report: text });
  } catch (error) {
    console.error('Error generating commercial report:', error);
    const errAny: any = error || {};
    const statusCode = errAny.status || errAny.statusCode || errAny.code || null;
    if (statusCode === 429 || /quota|rate limit|Too Many Requests/i.test(errAny.message || '')) {
      aiCooldownUntil = Date.now() + AI_COOLDOWN_MS;
      return res.status(429).json({ message: 'La API de IA ha excedido la cuota o está limitada. Por favor revisa el plan/billing y espera antes de reintentar.' });
    }
    if (statusCode && statusCode >= 500 && statusCode < 600) {
      return res.status(502).json({ message: 'Error del proveedor de IA. Intenta nuevamente más tarde.' });
    }
    res.status(500).json({ 
      message: 'Error generating commercial report', 
      detail: errAny.message || String(errAny)
    });
  }
};