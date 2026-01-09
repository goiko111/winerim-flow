import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BANK_DETAILS = {
  iban: "ES11 0081 5455 8800 0266 5278",
  accountHolder: "Basque Highlands S.L.",
  bankName: "Banco Sabadell",
};

const COMPANY_DETAILS = {
  name: "Basque Highlands S.L.",
  tradeName: "Winerim",
  email: "payments@winerim.com",
  phone: "+34 943 000 000",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-PROFORMA] ${step}${detailsStr}`);
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
};

const calculateIVA = (amount: number): { base: number; iva: number; total: number } => {
  const base = amount / 1.21;
  const iva = amount - base;
  return { base, iva, total: amount };
};

const getBillingPeriodText = (interval: string): string => {
  const map: Record<string, string> = {
    monthly: 'Mensual',
    quarterly: 'Trimestral',
    semestral: 'Semestral',
    annual: 'Anual',
  };
  return map[interval] || interval;
};

const generateProformaNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `PRO-${year}${month}-${random}`;
};

const generateProformaHTML = (
  customer: any,
  subscription: any,
  proformaNumber: string,
  billingPeriodStart: string,
  billingPeriodEnd: string,
  dueDate: string
): string => {
  const amounts = calculateIVA(subscription.amount);
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solicitud de Pago - ${proformaNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; padding: 0;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #722F37 0%, #8B3A44 100%); padding: 30px 40px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">WINERIM</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 12px;">Plataforma de gestión para hostelería</p>
    </div>

    <!-- Document Title -->
    <div style="background-color: #f8f4f4; padding: 20px 40px; border-bottom: 1px solid #e8e0e0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <h2 style="margin: 0; color: #722F37; font-size: 18px; font-weight: 600;">SOLICITUD DE PAGO</h2>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 13px;">Documento proforma (no válido como factura)</p>
          </td>
          <td style="text-align: right;">
            <p style="margin: 0; color: #333; font-size: 14px;"><strong>Nº:</strong> ${proformaNumber}</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 13px;">Fecha: ${formatDate(new Date().toISOString())}</p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Customer & Company Info -->
    <div style="padding: 30px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width: 48%; vertical-align: top;">
            <p style="margin: 0 0 10px 0; color: #722F37; font-size: 11px; text-transform: uppercase; font-weight: 600;">Facturar a:</p>
            <p style="margin: 0; color: #333; font-size: 14px; font-weight: 600;">${customer.company_name}</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 13px;">CIF/NIF: ${customer.vat_id}</p>
            ${customer.address ? `<p style="margin: 5px 0 0 0; color: #666; font-size: 13px;">${customer.address}</p>` : ''}
            ${customer.postal_code || customer.city ? `<p style="margin: 5px 0 0 0; color: #666; font-size: 13px;">${customer.postal_code || ''} ${customer.city || ''}</p>` : ''}
            <p style="margin: 5px 0 0 0; color: #666; font-size: 13px;">${customer.email}</p>
          </td>
          <td style="width: 4%;"></td>
          <td style="width: 48%; vertical-align: top; text-align: right;">
            <p style="margin: 0 0 10px 0; color: #722F37; font-size: 11px; text-transform: uppercase; font-weight: 600;">Emitido por:</p>
            <p style="margin: 0; color: #333; font-size: 14px; font-weight: 600;">${COMPANY_DETAILS.name}</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 13px;">${COMPANY_DETAILS.tradeName}</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 13px;">${COMPANY_DETAILS.email}</p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Invoice Items -->
    <div style="padding: 0 40px 30px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
        <tr style="background-color: #722F37;">
          <th style="padding: 12px 15px; text-align: left; color: #fff; font-size: 12px; font-weight: 600;">CONCEPTO</th>
          <th style="padding: 12px 15px; text-align: center; color: #fff; font-size: 12px; font-weight: 600;">PERÍODO</th>
          <th style="padding: 12px 15px; text-align: right; color: #fff; font-size: 12px; font-weight: 600;">IMPORTE</th>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 15px;">
            <p style="margin: 0; color: #333; font-size: 14px; font-weight: 500;">Suscripción ${subscription.plan_name}</p>
            <p style="margin: 5px 0 0 0; color: #888; font-size: 12px;">${subscription.description || 'Acceso completo a la plataforma Winerim'}</p>
          </td>
          <td style="padding: 15px; text-align: center;">
            <p style="margin: 0; color: #666; font-size: 13px;">${getBillingPeriodText(subscription.billing_interval)}</p>
            <p style="margin: 5px 0 0 0; color: #888; font-size: 11px;">${formatDate(billingPeriodStart)} - ${formatDate(billingPeriodEnd)}</p>
          </td>
          <td style="padding: 15px; text-align: right;">
            <p style="margin: 0; color: #333; font-size: 14px; font-weight: 600;">${formatCurrency(amounts.total)}</p>
          </td>
        </tr>
      </table>

      <!-- Totals -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
        <tr>
          <td style="width: 60%;"></td>
          <td style="width: 40%;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 13px;">Base imponible:</td>
                <td style="padding: 8px 0; text-align: right; color: #333; font-size: 13px;">${formatCurrency(amounts.base)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 13px;">IVA (21%):</td>
                <td style="padding: 8px 0; text-align: right; color: #333; font-size: 13px;">${formatCurrency(amounts.iva)}</td>
              </tr>
              <tr style="border-top: 2px solid #722F37;">
                <td style="padding: 12px 0; color: #722F37; font-size: 16px; font-weight: 600;">TOTAL:</td>
                <td style="padding: 12px 0; text-align: right; color: #722F37; font-size: 18px; font-weight: 700;">${formatCurrency(amounts.total)}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>

    <!-- Payment Details -->
    <div style="background-color: #f8f9fa; padding: 30px 40px; margin: 0 40px 30px 40px; border-radius: 8px; border: 1px solid #e0e0e0;">
      <h3 style="margin: 0 0 15px 0; color: #333; font-size: 14px; font-weight: 600;">💳 DATOS PARA LA TRANSFERENCIA</h3>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 8px 0; color: #666; font-size: 13px; width: 120px;">IBAN:</td>
          <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600; font-family: 'Courier New', monospace;">${BANK_DETAILS.iban}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666; font-size: 13px;">Beneficiario:</td>
          <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 500;">${BANK_DETAILS.accountHolder}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666; font-size: 13px;">Concepto:</td>
          <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 500;">${proformaNumber} - ${customer.company_name}</td>
        </tr>
      </table>
    </div>

    <!-- Due Date Warning -->
    <div style="padding: 0 40px 30px 40px; text-align: center;">
      <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px 20px;">
        <p style="margin: 0; color: #856404; font-size: 14px;">
          ⏰ <strong>Fecha límite de pago:</strong> ${formatDate(dueDate)}
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #722F37; padding: 25px 40px; text-align: center;">
      <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 12px;">
        Este documento es una solicitud de pago proforma y no tiene validez fiscal como factura.
      </p>
      <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.7); font-size: 11px;">
        La factura oficial será emitida tras confirmar la recepción del pago.
      </p>
      <p style="margin: 15px 0 0 0; color: rgba(255,255,255,0.6); font-size: 11px;">
        ${COMPANY_DETAILS.name} • ${COMPANY_DETAILS.email} • ${COMPANY_DETAILS.phone}
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

interface ProformaPayload {
  customer: {
    company_name: string;
    customer_name: string;
    vat_id: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
  };
  subscription: {
    plan_name: string;
    amount: number;
    billing_interval: string;
    description?: string;
  };
  subscriptionId?: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  dueDate: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    const resend = new Resend(resendKey);
    const supabase = supabaseUrl && supabaseKey 
      ? createClient(supabaseUrl, supabaseKey) 
      : null;

    const payload: ProformaPayload = await req.json();
    logStep("Received payload", { 
      customer: payload.customer.email, 
      amount: payload.subscription.amount 
    });

    const proformaNumber = generateProformaNumber();
    logStep("Generated proforma number", { proformaNumber });

    // Create payment request record if subscription exists
    if (payload.subscriptionId && supabase) {
      const { error: prError } = await supabase
        .from("payment_requests")
        .insert({
          subscription_id: payload.subscriptionId,
          amount: payload.subscription.amount,
          billing_period_start: payload.billingPeriodStart,
          billing_period_end: payload.billingPeriodEnd,
          due_date: payload.dueDate,
          status: 'sent',
          sent_at: new Date().toISOString(),
          proforma_number: proformaNumber,
        });

      if (prError) {
        logStep("Error creating payment request", { error: prError.message });
      } else {
        logStep("Payment request created");
      }
    }

    // Generate and send email
    const emailHtml = generateProformaHTML(
      payload.customer,
      payload.subscription,
      proformaNumber,
      payload.billingPeriodStart,
      payload.billingPeriodEnd,
      payload.dueDate
    );

    const emailResult = await resend.emails.send({
      from: "Winerim <payments@winerim.com>",
      to: [payload.customer.email],
      cc: ["payments@winerim.com"],
      subject: `Solicitud de pago ${proformaNumber} - ${payload.subscription.plan_name}`,
      html: emailHtml,
    });

    logStep("Email sent", { to: payload.customer.email, result: emailResult });

    return new Response(JSON.stringify({ 
      success: true, 
      proformaNumber,
      emailId: emailResult 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
