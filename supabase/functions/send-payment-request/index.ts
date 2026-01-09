import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Bank account details
const BANK_DETAILS = {
  iban: "ES11 0081 5455 8800 0266 5278",
  accountHolder: "Basque Highlands S.L.",
  bankName: "Banco Sabadell",
};

// Company details for proforma
const COMPANY_DETAILS = {
  name: "Basque Highlands S.L.",
  tradeName: "Winerim",
  vatId: "B75201234", // Replace with actual VAT ID
  address: "Calle Ejemplo 123",
  city: "San Sebastián",
  postalCode: "20001",
  country: "España",
  email: "payments@winerim.com",
  phone: "+34 943 000 000",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-PAYMENT-REQUEST] ${step}${detailsStr}`);
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

const generateProformaHTML = (
  customer: any,
  subscription: any,
  paymentRequest: any
): string => {
  const amounts = calculateIVA(subscription.amount);
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solicitud de Pago - ${paymentRequest.proforma_number}</title>
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
            <p style="margin: 0; color: #333; font-size: 14px;"><strong>Nº:</strong> ${paymentRequest.proforma_number}</p>
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
            <p style="margin: 5px 0 0 0; color: #888; font-size: 11px;">${formatDate(paymentRequest.billing_period_start)} - ${formatDate(paymentRequest.billing_period_end)}</p>
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
          <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 500;">${paymentRequest.proforma_number} - ${customer.company_name}</td>
        </tr>
      </table>
    </div>

    <!-- Due Date Warning -->
    <div style="padding: 0 40px 30px 40px; text-align: center;">
      <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px 20px;">
        <p style="margin: 0; color: #856404; font-size: 14px;">
          ⏰ <strong>Fecha límite de pago:</strong> ${formatDate(paymentRequest.due_date)}
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

interface PaymentRequestPayload {
  subscriptionId?: string;
  // For manual sending from dashboard
  sendNow?: boolean;
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
    if (!supabaseUrl || !supabaseKey) throw new Error("Supabase credentials not configured");

    const resend = new Resend(resendKey);
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload: PaymentRequestPayload = await req.json();
    logStep("Received payload", payload);

    let subscriptionsToProcess: any[] = [];

    if (payload.subscriptionId) {
      // Send for a specific subscription
      const { data, error } = await supabase
        .from("bank_transfer_subscriptions")
        .select("*")
        .eq("id", payload.subscriptionId)
        .single();
      
      if (error || !data) throw new Error(`Subscription not found: ${error?.message}`);
      subscriptionsToProcess = [data];
    } else {
      // Cron job: find all active subscriptions due today or earlier
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from("bank_transfer_subscriptions")
        .select("*")
        .eq("status", "active")
        .lte("next_billing_date", today);
      
      if (error) throw new Error(`Failed to fetch subscriptions: ${error.message}`);
      subscriptionsToProcess = data || [];
    }

    logStep(`Processing ${subscriptionsToProcess.length} subscriptions`);

    const results: any[] = [];

    for (const subscription of subscriptionsToProcess) {
      try {
        // Calculate billing period
        const billingPeriodStart = new Date(subscription.next_billing_date);
        const billingPeriodEnd = new Date(billingPeriodStart);
        
        switch (subscription.billing_interval) {
          case 'monthly':
            billingPeriodEnd.setMonth(billingPeriodEnd.getMonth() + 1);
            break;
          case 'quarterly':
            billingPeriodEnd.setMonth(billingPeriodEnd.getMonth() + 3);
            break;
          case 'semestral':
            billingPeriodEnd.setMonth(billingPeriodEnd.getMonth() + 6);
            break;
          case 'annual':
            billingPeriodEnd.setFullYear(billingPeriodEnd.getFullYear() + 1);
            break;
        }
        billingPeriodEnd.setDate(billingPeriodEnd.getDate() - 1);

        // Due date: 10 days from now
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 10);

        // Create payment request record
        const { data: paymentRequest, error: prError } = await supabase
          .from("payment_requests")
          .insert({
            subscription_id: subscription.id,
            amount: subscription.amount,
            billing_period_start: billingPeriodStart.toISOString().split('T')[0],
            billing_period_end: billingPeriodEnd.toISOString().split('T')[0],
            due_date: dueDate.toISOString().split('T')[0],
            status: 'pending',
          })
          .select()
          .single();

        if (prError) throw new Error(`Failed to create payment request: ${prError.message}`);
        logStep("Payment request created", { proforma: paymentRequest.proforma_number });

        // Generate and send email
        const emailHtml = generateProformaHTML(subscription, subscription, paymentRequest);

        const emailResult = await resend.emails.send({
          from: "Winerim <payments@winerim.com>",
          to: [subscription.email],
          cc: ["payments@winerim.com"],
          subject: `Solicitud de pago ${paymentRequest.proforma_number} - ${subscription.plan_name}`,
          html: emailHtml,
        });

        logStep("Email sent", { to: subscription.email, emailId: emailResult });

        // Update payment request status
        await supabase
          .from("payment_requests")
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq("id", paymentRequest.id);

        // Update subscription's next billing date
        const nextBillingDate = new Date(billingPeriodEnd);
        nextBillingDate.setDate(nextBillingDate.getDate() + 1);

        await supabase
          .from("bank_transfer_subscriptions")
          .update({
            next_billing_date: nextBillingDate.toISOString().split('T')[0],
            last_billed_date: billingPeriodStart.toISOString().split('T')[0],
          })
          .eq("id", subscription.id);

        results.push({
          subscriptionId: subscription.id,
          email: subscription.email,
          proforma: paymentRequest.proforma_number,
          status: 'sent',
        });

      } catch (subError: any) {
        logStep(`Error processing subscription ${subscription.id}`, { error: subError.message });
        results.push({
          subscriptionId: subscription.id,
          email: subscription.email,
          status: 'error',
          error: subError.message,
        });
      }
    }

    logStep("Processing complete", { total: results.length, sent: results.filter(r => r.status === 'sent').length });

    return new Response(JSON.stringify({ success: true, results }), {
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
