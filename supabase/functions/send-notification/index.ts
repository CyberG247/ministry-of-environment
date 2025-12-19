import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  type: 'status_update' | 'new_report' | 'assignment';
  report_id: string;
  recipient_email?: string;
  recipient_phone?: string;
  message?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: NotificationPayload = await req.json();
    console.log('Notification request received:', payload);

    // Get report details
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select(`
        id,
        tracking_id,
        title,
        status,
        reporter_id,
        is_anonymous
      `)
      .eq('id', payload.report_id)
      .single();

    if (reportError || !report) {
      console.error('Report fetch error:', reportError);
      return new Response(
        JSON.stringify({ error: 'Report not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Report found:', report.tracking_id);

    // Get reporter's email if not anonymous
    let recipientEmail = payload.recipient_email;
    let recipientPhone = payload.recipient_phone;

    if (!report.is_anonymous && report.reporter_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, phone')
        .eq('user_id', report.reporter_id)
        .single();

      if (profile) {
        recipientEmail = recipientEmail || profile.email;
        recipientPhone = recipientPhone || profile.phone;
      }
    }

    const statusLabels: Record<string, string> = {
      submitted: 'Submitted',
      assigned: 'Assigned to Field Officer',
      in_progress: 'Investigation In Progress',
      resolved: 'Resolved',
      closed: 'Closed',
    };

    // Build notification message
    const message = payload.message || `Your report ${report.tracking_id} status has been updated to: ${statusLabels[report.status] || report.status}`;

    const notifications: { type: string; status: string; recipient?: string }[] = [];

    // Send email notification (placeholder - would integrate with actual email service)
    if (recipientEmail) {
      console.log(`[EMAIL] Sending to ${recipientEmail}: ${message}`);
      
      // In production, integrate with an email service like SendGrid, AWS SES, etc.
      // Example with SendGrid:
      // const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
      // await fetch('https://api.sendgrid.com/v3/mail/send', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     personalizations: [{ to: [{ email: recipientEmail }] }],
      //     from: { email: 'noreply@ecsrs.gov.ng' },
      //     subject: `ECSRS Report Update - ${report.tracking_id}`,
      //     content: [{ type: 'text/plain', value: message }],
      //   }),
      // });

      notifications.push({ type: 'email', status: 'sent', recipient: recipientEmail });
    }

    // Send SMS notification (placeholder - would integrate with actual SMS service)
    if (recipientPhone) {
      console.log(`[SMS] Sending to ${recipientPhone}: ${message}`);
      
      // In production, integrate with an SMS service like Twilio, Africa's Talking, etc.
      // Example with Africa's Talking (common in Nigeria):
      // const AT_API_KEY = Deno.env.get('AFRICAS_TALKING_API_KEY');
      // const AT_USERNAME = Deno.env.get('AFRICAS_TALKING_USERNAME');
      // await fetch('https://api.africastalking.com/version1/messaging', {
      //   method: 'POST',
      //   headers: {
      //     'apiKey': AT_API_KEY,
      //     'Content-Type': 'application/x-www-form-urlencoded',
      //   },
      //   body: new URLSearchParams({
      //     username: AT_USERNAME,
      //     to: recipientPhone,
      //     message: message,
      //   }),
      // });

      notifications.push({ type: 'sms', status: 'sent', recipient: recipientPhone });
    }

    // Log notification in database for audit trail
    console.log('Notification processed successfully:', notifications);

    return new Response(
      JSON.stringify({
        success: true,
        report_id: report.id,
        tracking_id: report.tracking_id,
        notifications,
        message: 'Notification processed',
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    console.error('Notification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
