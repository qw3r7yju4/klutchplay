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

    // Health check endpoint
    if (url.pathname === '/api/health') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          service: 'klutchplay-worker',
          hasEmailBinding: Boolean(env.EMAIL && typeof env.EMAIL.send === 'function'),
          hasForwardEmailSecret: Boolean(env.FORWARD_TO_EMAIL),
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Contact / Quote Inquiry API
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

        const name = (body.name || body.clientName || '').trim();
        const email = (body.email || body.clientEmail || '').trim();
        const projectType = (body.projectType || 'General Web Design Inquiry').trim();
        const hostingPreference = (body.hostingPreference || 'Not specified').trim();
        const details = (body.details || body.projectDetails || 'No additional details provided.').trim();
        const selectedFeatures = Array.isArray(body.selectedFeatures)
          ? body.selectedFeatures.join(', ')
          : (body.selectedFeatures || '').trim();
        const estimatedTotal = (body.estimatedTotal || '').trim();

        if (!name) {
          return new Response(
            JSON.stringify({ success: false, error: 'Please provide your name.' }),
            { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
          );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
          return new Response(
            JSON.stringify({ success: false, error: 'Please provide a valid email address.' }),
            { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
          );
        }

        // Validate server bindings & secret
        if (!env.EMAIL || typeof env.EMAIL.send !== 'function') {
          console.error('Missing env.EMAIL binding in Cloudflare Worker');
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Email service binding is not configured on this Worker.',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
          );
        }

        const recipient = (env.FORWARD_TO_EMAIL || '').trim();
        if (!recipient || !emailRegex.test(recipient)) {
          console.error('Missing or invalid FORWARD_TO_EMAIL secret on Worker');
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Recipient forwarding address (FORWARD_TO_EMAIL) is not configured.',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
          );
        }

        // Sanitize headers against CRLF injection
        const cleanName = name.replace(/[\r\n]+/g, ' ');
        const cleanEmail = email.replace(/[\r\n]+/g, '');
        const cleanProjectType = projectType.replace(/[\r\n]+/g, ' ');
        const cleanHosting = hostingPreference.replace(/[\r\n]+/g, ' ');
        const subject = `[Klutchplay Quote Inquiry] ${cleanProjectType} from ${cleanName}`;

        const sender = (env.SENDER_EMAIL || 'website-quotes@klutchplay.com').trim();
        const senderDomain = sender.split('@')[1] || 'klutchplay.com';

        // Compose readable plain-text email body
        const emailContent = [
          `=========================================`,
          `  NEW PROJECT INQUIRY - KLUTCHPLAY.COM`,
          `  "When you need the clutch play."`,
          `=========================================`,
          ``,
          `CLIENT INFORMATION:`,
          `  Name:  ${cleanName}`,
          `  Email: ${cleanEmail}`,
          ``,
          `PROJECT SCOPE:`,
          `  Focus:   ${cleanProjectType}`,
          `  Hosting: ${cleanHosting}`,
          selectedFeatures ? `  Deliverables Selected: ${selectedFeatures}` : null,
          estimatedTotal ? `  Project Estimator Total: $${estimatedTotal} USD` : null,
          ``,
          `PROJECT DETAILS & TIMELINE:`,
          details,
          ``,
          `-----------------------------------------`,
          `Sent automatically from Klutchplay.com inquiry system.`,
          `Reply directly to this email to contact ${cleanName} (${cleanEmail}).`,
        ]
          .filter(Boolean)
          .join('\n');

        // Build fully compliant RFC 5322 MIME message
        const messageId = `<${crypto.randomUUID()}@${senderDomain}>`;
        const dateHeader = new Date().toUTCString();

        const rawMessage = [
          `From: "Klutchplay Quotes" <${sender}>`,
          `To: <${recipient}>`,
          `Reply-To: "${cleanName}" <${cleanEmail}>`,
          `Subject: ${subject}`,
          `Message-ID: ${messageId}`,
          `Date: ${dateHeader}`,
          `MIME-Version: 1.0`,
          `Content-Type: text/plain; charset=utf-8`,
          `Content-Transfer-Encoding: 8bit`,
          ``,
          emailContent,
        ].join('\r\n');

        try {
          const message = new EmailMessage(sender, recipient, rawMessage);
          await env.EMAIL.send(message);
        } catch (sendErr) {
          console.warn('EmailMessage MIME send failed, attempting structured builder fallback:', sendErr);
          await env.EMAIL.send({
            from: sender,
            to: recipient,
            replyTo: cleanEmail,
            subject: subject,
            text: emailContent,
          });
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Inquiry received successfully! I will review your project and get back to you shortly.',
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
        console.error('API Error in /api/contact:', err);
        return new Response(
          JSON.stringify({
            success: false,
            error: err.message || 'An unexpected error occurred while transmitting your inquiry.',
          }),
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
