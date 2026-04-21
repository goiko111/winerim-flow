import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Recipients for payment notifications by account
const RECIPIENTS_BY_ACCOUNT: Record<string, string[]> = {
  es: ["payments@winerim.com"],
  intl: ["subscriptions@winerim.com"],
};
const DEFAULT_RECIPIENTS = ["payments@winerim.com"];

const getRecipients = (account?: string): string[] => {
  if (account && RECIPIENTS_BY_ACCOUNT[account]) {
    return RECIPIENTS_BY_ACCOUNT[account];
  }
  return DEFAULT_RECIPIENTS;
};

interface PaymentNotificationRequest {
  sessionId?: string;
  customerEmail?: string;
  customerName?: string;
  restaurantName?: string;
  companyName?: string;
  planName?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  billingInterval?: string;
  account?: 'es' | 'intl';
  isError?: boolean;
  errorMessage?: string;
  errorContext?: string;
}

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYMENT-NOTIFICATION] ${step}${detailsStr}`);
};

const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
};

const formatPaymentMethod = (method: string): string => {
  const methods: Record<string, string> = {
    'card': 'Tarjeta de crédito/débito',
    'sepa_debit': 'Domiciliación bancaria SEPA',
    'customer_balance': 'Transferencia bancaria',
  };
  return methods[method] || method;
};

const generateErrorEmailHtml = (errorMessage: string, errorContext: string, data: PaymentNotificationRequest): string => {
  const date = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; }
    .error-box { background: #FEE2E2; border: 1px solid #FECACA; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .error-message { color: #DC2626; font-family: monospace; font-size: 14px; white-space: pre-wrap; word-break: break-word; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e0e0; }
    .detail-label { color: #666; font-weight: 500; }
    .detail-value { font-weight: 600; color: #333; }
    .footer { background: #333; color: #999; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Error en Checkout Winerim</h1>
    </div>
    <div class="content">
      <p style="font-size: 16px; margin-bottom: 20px;">
        Se ha producido un error durante el proceso de checkout.
      </p>
      
      <div class="error-box">
        <strong>Contexto:</strong> ${errorContext}<br><br>
        <strong>Error:</strong><br>
        <div class="error-message">${errorMessage}</div>
      </div>

      <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
        <h3 style="margin-top: 0; color: #DC2626;">Datos disponibles</h3>
        
        <div class="detail-row">
          <span class="detail-label">Restaurante</span>
          <span class="detail-value">${data.restaurantName || '-'}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Empresa</span>
          <span class="detail-value">${data.companyName || '-'}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Email</span>
          <span class="detail-value">${data.customerEmail || '-'}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Plan</span>
          <span class="detail-value">${data.planName || '-'}</span>
        </div>
        
        <div class="detail-row" style="border-bottom: none;">
          <span class="detail-label">Fecha</span>
          <span class="detail-value">${date}</span>
        </div>
      </div>
    </div>
    <div class="footer">
      <p>Winerim · Notificación automática de errores</p>
    </div>
  </div>
</body>
</html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const data: PaymentNotificationRequest = await req.json();
    logStep("Request data received", { 
      sessionId: data.sessionId,
      customerEmail: data.customerEmail,
      planName: data.planName,
      isError: data.isError 
    });

    // Handle error notifications
    if (data.isError) {
      logStep("Processing error notification");
      
      const errorHtml = generateErrorEmailHtml(
        data.errorMessage || 'Error desconocido',
        data.errorContext || 'Contexto no especificado',
        data
      );

      const errorRecipients = getRecipients(data.account);
      logStep("Sending error notification", { recipients: errorRecipients, account: data.account });

      const emailResponse = await resend.emails.send({
        from: "Winerim <payments@winerim.com>",
        to: errorRecipients,
        subject: `⚠️ Error en checkout: ${data.restaurantName || data.companyName || 'Cliente desconocido'}`,
        html: errorHtml,
      });

      logStep("Error notification sent", { response: emailResponse });

      return new Response(JSON.stringify({ success: true, response: emailResponse }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Handle success notifications
    const {
      sessionId,
      customerEmail,
      customerName,
      restaurantName,
      companyName,
      planName,
      amount,
      currency,
      paymentMethod,
      billingInterval,
    } = data;

    const formattedAmount = formatCurrency(amount || 0, currency || 'eur');
    const formattedPaymentMethod = formatPaymentMethod(paymentMethod || 'card');
    const date = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #722F37 0%, #8B3A42 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e0e0; }
    .detail-label { color: #666; font-weight: 500; }
    .detail-value { font-weight: 600; color: #333; }
    .amount-highlight { background: #722F37; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .amount-highlight .amount { font-size: 32px; font-weight: bold; }
    .footer { background: #333; color: #999; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍷 Nueva Suscripción Winerim</h1>
    </div>
    <div class="content">
      <p style="font-size: 16px; margin-bottom: 20px;">
        Se ha completado un nuevo pago de suscripción.
      </p>
      
      <div class="amount-highlight">
        <div class="amount">${formattedAmount}</div>
        <div style="opacity: 0.9; margin-top: 5px;">${billingInterval}</div>
      </div>

      <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
        <h3 style="margin-top: 0; color: #722F37;">Datos del Cliente</h3>
        
        <div class="detail-row">
          <span class="detail-label">Restaurante</span>
          <span class="detail-value">${restaurantName || '-'}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Empresa</span>
          <span class="detail-value">${companyName || '-'}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Email</span>
          <span class="detail-value">${customerEmail}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Nombre contacto</span>
          <span class="detail-value">${customerName || '-'}</span>
        </div>
      </div>

      <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
        <h3 style="margin-top: 0; color: #722F37;">Detalles del Pago</h3>
        
        <div class="detail-row">
          <span class="detail-label">Plan</span>
          <span class="detail-value">${planName}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Método de pago</span>
          <span class="detail-value">${formattedPaymentMethod}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Fecha</span>
          <span class="detail-value">${date}</span>
        </div>
        
        <div class="detail-row" style="border-bottom: none;">
          <span class="detail-label">ID Sesión</span>
          <span class="detail-value" style="font-size: 11px; font-family: monospace;">${sessionId}</span>
        </div>
      </div>
    </div>
    <div class="footer">
      <p>Winerim · Notificación automática de pagos</p>
    </div>
  </div>
</body>
</html>
    `;

    logStep("Sending email to recipients", { recipients: NOTIFICATION_RECIPIENTS });

    const emailResponse = await resend.emails.send({
      from: "Winerim <payments@winerim.com>",
      to: NOTIFICATION_RECIPIENTS,
      subject: `💳 Nueva suscripción: ${restaurantName || companyName} - ${formattedAmount}`,
      html: emailHtml,
    });

    logStep("Email sent successfully", { response: emailResponse });

    return new Response(JSON.stringify({ success: true, response: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
