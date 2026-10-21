import { EmailMessage } from 'cloudflare:email';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Health check
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok', service: 'klutchplay-worker' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Contact form / Quote inquiry API
    if (url.pathname === '/api/contact' && request.method === 'POST') {
      try {
        let body;
        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          body = await request.json();
        } else {
          const formData = await request.formData();
          body = Object.fromEntries(formData.entries());
        }

        const name = body.name || body.clientName || 'Anonymous';
        const email = body.email || body.clientEmail || 'No email provided';
        const projectType = body.projectType || 'General Inquiry';
        const hostingPreference = body.hostingPreference || 'Not specified';
        const details = body.details || body.projectDetails || 'No details provided';

        const subject = `[Klutchplay Quote Inquiry] ${projectType} from ${name}`;
        const emailContent = [
          `New Project Inquiry from Klutchplay.com`,
          `-----------------------------------------`,
          `Client Name: ${name}`,
          `Client Email: ${email}`,
          `Project Focus: ${projectType}`,
          `Hosting & Domain Preference: ${hostingPreference}`,
          ``,
          `Project Details:`,
          `${details}`,
          `-----------------------------------------`,
          `Sent via Klutchplay Cloudflare Worker backend`,
        ].join('\n');

        // Send email via Cloudflare send_email binding if available
        if (env.EMAIL && typeof env.EMAIL.send === 'function') {
          try {
            const rawMessage = [
              `From: "Klutchplay Quotes" <${env.SENDER_EMAIL || 'website-quotes@klutchplay.com'}>`,
              `To: <${env.FORWARD_TO_EMAIL || 'klucinaken@gmail.com'}>`,
              `Reply-To: <${email}>`,
              `Subject: ${subject}`,
              `Content-Type: text/plain; charset=utf-8`,
              ``,
              emailContent,
            ].join('\r\n');

            const message = new EmailMessage(
              env.SENDER_EMAIL || 'website-quotes@klutchplay.com',
              env.FORWARD_TO_EMAIL || 'klucinaken@gmail.com',
              rawMessage
            );

            await env.EMAIL.send(message);
          } catch (emailErr) {
            console.error('Email send warning:', emailErr);
            // Non-fatal: still return success to the user with logged error
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Inquiry received successfully! We will get back to you shortly.',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      } catch (err) {
        console.error('API Error:', err);
        return new Response(
          JSON.stringify({ success: false, error: err.message || 'Internal Server Error' }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
