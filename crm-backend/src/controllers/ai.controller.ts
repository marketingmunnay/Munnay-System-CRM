import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuración de Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

// Usar gemini-2.0-flash que es el modelo actual disponible
const MODEL_NAME = "gemini-2.0-flash";

export const generateContent = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return res.status(500).json({ message: 'Google Gemini API key not configured' });
    }

    // Obtener el modelo Gemini
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Generar contenido con el prompt proporcionado
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ content: text });
  } catch (error) {
    console.error('Error generating AI content:', error);
    const errAny: any = error || {};
    // Map upstream status codes to sensible HTTP responses
    if (errAny.status === 429 || /quota|rate limit|Too Many Requests/i.test(errAny.message || '')) {
      const message = 'La API de IA ha excedido la cuota o está limitada. Por favor revisa el plan/billing y espera antes de reintentar.';
      // Prefer to return 429 so client can surface a retry message
      return res.status(429).json({ message, detail: errAny.message || null });
    }

    // If the provider returned a 5xx, surface a 502 Bad Gateway
    if (errAny.status >= 500 && errAny.status < 600) {
      return res.status(502).json({ message: 'Error del proveedor de IA. Intenta nuevamente más tarde.' });
    }

    // Fallback: generic error
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

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return res.status(500).json({ message: 'Google Gemini API key not configured' });
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

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ analysis: text });
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    const errAny: any = error || {};
    if (errAny.status === 429 || /quota|rate limit|Too Many Requests/i.test(errAny.message || '')) {
      return res.status(429).json({ message: 'La API de IA ha excedido la cuota o está limitada. Por favor revisa el plan/billing y espera antes de reintentar.' });
    }
    if (errAny.status >= 500 && errAny.status < 600) {
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

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return res.status(500).json({ message: 'Google Gemini API key not configured' });
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

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ report: text });
  } catch (error) {
    console.error('Error generating commercial report:', error);
    const errAny: any = error || {};
    if (errAny.status === 429 || /quota|rate limit|Too Many Requests/i.test(errAny.message || '')) {
      return res.status(429).json({ message: 'La API de IA ha excedido la cuota o está limitada. Por favor revisa el plan/billing y espera antes de reintentar.' });
    }
    if (errAny.status >= 500 && errAny.status < 600) {
      return res.status(502).json({ message: 'Error del proveedor de IA. Intenta nuevamente más tarde.' });
    }
    res.status(500).json({ 
      message: 'Error generating commercial report', 
      detail: errAny.message || String(errAny)
    });
  }
};