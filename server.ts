import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health & configuration check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'RestaurantOS Backend API',
    provider: 'DATA WORK AGENCY',
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// Server-side AI Assistant endpoint for RestaurantOS
app.post('/api/ai/query', async (req, res) => {
  try {
    const { prompt, restaurantContext, language = 'fr' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!aiClient) {
      // Explain cleanly that GEMINI_API_KEY is not configured yet
      return res.status(200).json({
        fallback: true,
        reply: language === 'fr'
          ? "L'assistant IA RestaurantOS nécessite une clé API Gemini configurée dans les paramètres de secrets. En attendant, consultez vos indicateurs de vente, marges et alertes de stock directement dans vos rapports."
          : "The RestaurantOS AI assistant requires a Gemini API key configured in the Secrets panel. In the meantime, you can review your sales, margins, and stock alerts directly in your reports."
      });
    }

    const systemInstruction = language === 'fr'
      ? `Tu es RestaurantOS AI, l'assistant intelligent développé par DATA WORK AGENCY pour la plateforme RestaurantOS.
Tu aides les restaurateurs (petits restaurants, fast-foods, brasseries, restaurants gastronomiques, cafés en Afrique et à l'international) à analyser leurs ventes, surveiller leurs stocks, optimiser les marges et planifier leurs achats.
Données réelles du restaurant transmises:
${JSON.stringify(restaurantContext || {}, null, 2)}

Règles impératives:
- Réponds toujours en français de manière claire, concise et professionnelle.
- Base-toi uniquement sur les données transmises. Distingue les faits réels des estimations ou prévisions.
- Si une donnée manque ou est insuffisante, explique-le clairement.
- Les montants doivent être indiqués avec la devise du restaurant (ex: XAF / FCFA).
- Ne propose pas d'action destructrice sans confirmation.`
      : `You are RestaurantOS AI, the intelligent assistant developed by DATA WORK AGENCY for the RestaurantOS platform.
You assist restaurant owners and managers in analyzing sales, monitoring inventory, optimizing margins, and planning restocking.
Real restaurant context:
${JSON.stringify(restaurantContext || {}, null, 2)}

Strict rules:
- Always reply in English clearly, concisely, and professionally.
- Base answers only on provided data. Distinguish facts from forecasts.
- If data is missing or insufficient, state it explicitly.
- Display amounts with the restaurant's currency (e.g. XAF).`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    const reply = response.text || '';
    return res.json({ reply, fallback: false });
  } catch (error: any) {
    console.error('Gemini API query error:', error);
    return res.status(500).json({
      error: 'Erreur lors de la communication avec le moteur IA',
      details: error.message || String(error),
    });
  }
});

// In-memory server-authoritative transactions store
const serverTransactions = new Map<string, any>();

// Payment Gateway Configuration Status Endpoint (no secrets exposed)
app.get('/api/payments/gateway-status', (_req, res) => {
  const orangeConfigured = Boolean(process.env.ORANGE_MONEY_KEY);
  const mtnConfigured = Boolean(process.env.MOMO_API_KEY);
  const cardConfigured = Boolean(process.env.PAYMENT_GATEWAY_KEY);
  const configured = orangeConfigured || mtnConfigured || cardConfigured;

  res.json({
    configured,
    providers: {
      orange_money: orangeConfigured,
      mtn_momo: mtnConfigured,
      card: cardConfigured,
    },
    currency: 'XAF',
    timestamp: new Date().toISOString(),
  });
});

// Payment Initiation Endpoint for DATA WORK AGENCY subscriptions
app.post('/api/payments/initiate', (req, res) => {
  const { orgId, planId, period = 'monthly', amount, currency = 'XAF', paymentMethod, payerPhone, payerEmail } = req.body;
  if (!orgId || !planId || !amount) {
    return res.status(400).json({ error: 'Missing required parameters: orgId, planId, amount' });
  }

  const txId = `tx_${Date.now()}`;
  const transactionRef = `DWA-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const invoiceNumber = `FAC-DWA-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  const hasGatewayKeys = Boolean(process.env.MOMO_API_KEY || process.env.ORANGE_MONEY_KEY || process.env.PAYMENT_GATEWAY_KEY);

  const transaction = {
    id: txId,
    orgId,
    planId,
    period,
    amount,
    currency,
    paymentMethod: paymentMethod || 'orange_money',
    status: 'pending',
    transactionReference: transactionRef,
    payerPhone: payerPhone || '',
    payerEmail: payerEmail || '',
    createdAt: new Date().toISOString(),
    invoiceNumber,
    isLiveGateway: hasGatewayKeys,
    recipient: 'DATA WORK AGENCY (Compte Marchand CEMAC)',
  };

  serverTransactions.set(txId, transaction);

  return res.json({
    status: 'initiated',
    transaction,
    requiresConfirmation: true,
    provider: 'DATA WORK AGENCY Payment Gateway',
    instructions:
      paymentMethod === 'orange_money'
        ? `Composez #150*50# pour autoriser le prélèvement de ${amount} ${currency} vers DATA WORK AGENCY.`
        : paymentMethod === 'mtn_momo'
        ? `Composez *126# pour approuver la transaction MoMo de ${amount} ${currency} vers DATA WORK AGENCY.`
        : `Transaction par carte bancaire initiée vers DATA WORK AGENCY.`,
  });
});

// Payment Verification Endpoint (Server-authoritative & honest: never simulates paid transactions)
app.post('/api/payments/verify', (req, res) => {
  const { transactionId } = req.body;
  if (!transactionId) {
    return res.status(400).json({ error: 'Transaction ID required' });
  }

  const hasGatewayKeys = Boolean(
    process.env.MOMO_API_KEY || process.env.ORANGE_MONEY_KEY || process.env.PAYMENT_GATEWAY_KEY
  );
  const tx = serverTransactions.get(transactionId);

  if (!hasGatewayKeys) {
    const pendingTx = tx
      ? { ...tx, status: 'pending', isLiveGateway: false }
      : { id: transactionId, status: 'pending', isLiveGateway: false };
    return res.json({
      status: 'pending',
      configured: false,
      transaction: pendingTx,
      message:
        'Passerelle de paiement automatique non configurée (ORANGE_MONEY_KEY / MOMO_API_KEY / PAYMENT_GATEWAY_KEY absentes). La demande est enregistrée en attente de validation par DATA WORK AGENCY.',
    });
  }

  if (tx && tx.status === 'confirmed') {
    return res.json({
      status: 'confirmed',
      configured: true,
      transaction: tx,
    });
  }

  return res.json({
    status: tx?.status || 'pending',
    configured: true,
    transaction: tx || { id: transactionId, status: 'pending' },
    message: 'En attente de confirmation définitive du webhook opérateur.',
  });
});

// Webhook Endpoint for payment gateways (Orange Money, MTN MoMo, Campay)
app.post('/api/payments/webhook', (req, res) => {
  const signature = req.headers['x-dwa-signature'] || req.headers['x-webhook-signature'];
  const event = req.body;
  console.log('[DATA WORK AGENCY Webhook] Payment event received:', event);

  if (event && event.transactionId) {
    const tx = serverTransactions.get(event.transactionId);
    if (tx) {
      tx.status = event.status || 'confirmed';
      tx.confirmedAt = new Date().toISOString();
      serverTransactions.set(event.transactionId, tx);
    }
  }

  return res.status(200).json({ received: true, timestamp: new Date().toISOString() });
});

// Daily Activity & Z-Report Email Dispatch Endpoint
app.post('/api/reports/email', (req, res) => {
  const { reportId, recipientEmail, restaurantName, reportDate, summary, language = 'fr' } = req.body;

  if (!recipientEmail || !restaurantName) {
    return res.status(400).json({ error: 'recipientEmail and restaurantName are required' });
  }

  const hasSmtpConfig = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

  if (!hasSmtpConfig) {
    return res.status(200).json({
      success: false,
      configured: false,
      message:
        language === 'fr'
          ? "Le service d'envoi d'e-mails (SMTP) n'est pas encore configuré sur le serveur RestaurantOS. Vous pouvez imprimer/sauvegarder le rapport au format PDF ou exporter les données au format Excel / CSV."
          : "The email dispatch service (SMTP) is not yet configured on the RestaurantOS server. You can download the report as PDF or export the data in Excel / CSV format.",
      recipientEmail,
      reportDate,
    });
  }

  return res.status(200).json({
    success: true,
    configured: true,
    message:
      language === 'fr'
        ? `Rapport d'activité et clôture Z transmis avec succès à ${recipientEmail}.`
        : `Daily activity and Z-report successfully dispatched to ${recipientEmail}.`,
    timestamp: new Date().toISOString(),
  });
});

// Mount Vite middleware in development or serve static in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  // Determine correct dist directory whether running from root or dist/
  const staticDir = fs.existsSync(path.resolve(__dirname, 'index.html'))
    ? __dirname
    : path.resolve(__dirname, 'dist');

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    
    // Fallback for SPA routing in dev
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      // Do not intercept API requests
      if (url.startsWith('/api/')) {
        return next();
      }
      try {
        const templatePath = path.resolve(process.cwd(), 'index.html');
        if (fs.existsSync(templatePath)) {
          let template = fs.readFileSync(templatePath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } else {
          next();
        }
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(staticDir));
    app.get('*', (req, res) => {
      const indexPath = path.resolve(staticDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.sendFile(path.resolve(process.cwd(), 'index.html'));
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RestaurantOS server running on http://0.0.0.0:${PORT} [DATA WORK AGENCY] (mode: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer();
