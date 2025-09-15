/**
 * Blaze Intelligence - Lead Capture Worker
 * Handles contact form submissions and forwards to multiple destinations
 */

export default {
    async fetch(request, env, ctx) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                }
            });
        }
        
        if (request.method !== 'POST') {
            return new Response('Method not allowed', { status: 405 });
        }
        
        try {
            const data = await request.json();
            
            // Validate required fields
            const required = ['firstName', 'lastName', 'email', 'organization', 'message'];
            const missing = required.filter(field => !data[field]);
            
            if (missing.length > 0) {
                return new Response(JSON.stringify({
                    success: false,
                    error: `Missing required fields: ${missing.join(', ')}`
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            // Prepare lead data
            const lead = {
                timestamp: new Date().toISOString(),
                id: crypto.randomUUID(),
                source: 'blaze-intelligence-contact-form',
                contact: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phone: data.phone || '',
                    organization: data.organization,
                    sport: data.sport || '',
                    level: data.level || '',
                    message: data.message,
                    marketingOptIn: data.marketing === 'true' || data.marketing === true
                },
                metadata: {
                    page: data.page || '/contact.html',
                    userAgent: data.userAgent || '',
                    ip: request.headers.get('CF-Connecting-IP'),
                    country: request.headers.get('CF-IPCountry'),
                    timestamp: data.timestamp
                }
            };
            
            // Store in R2 for backup/analytics
            if (env.LEADS_BUCKET) {
                const key = `leads/${lead.timestamp.split('T')[0]}/${lead.id}.json`;
                await env.LEADS_BUCKET.put(key, JSON.stringify(lead, null, 2));
            }
            
            // Send email notification
            const emailBody = `
🔥 NEW BLAZE INTELLIGENCE LEAD

Contact Information:
• Name: ${lead.contact.firstName} ${lead.contact.lastName}
• Email: ${lead.contact.email}
• Phone: ${lead.contact.phone}
• Organization: ${lead.contact.organization}
• Sport: ${lead.contact.sport}
• Level: ${lead.contact.level}

Message:
${lead.contact.message}

Marketing Opt-in: ${lead.contact.marketingOptIn ? 'Yes' : 'No'}

Metadata:
• Source: ${lead.source}
• Page: ${lead.metadata.page}
• Country: ${lead.metadata.country}
• Timestamp: ${lead.timestamp}
• Lead ID: ${lead.id}

---
Blaze Intelligence Lead Capture System
            `;
            
            // Send to multiple destinations (parallel)
            const responses = await Promise.allSettled([
                
                // 1. Email notification (if configured)
                env.SENDGRID_API_KEY ? sendEmail(env.SENDGRID_API_KEY, {
                    to: 'ahump20@outlook.com',
                    from: 'leads@blaze-intelligence.com',
                    subject: `🔥 New Blaze Intelligence Lead: ${lead.contact.organization}`,
                    text: emailBody
                }) : Promise.resolve({ status: 'skipped', reason: 'No SendGrid API key' }),
                
                // 2. HubSpot (if configured)
                env.HUBSPOT_API_KEY ? sendToHubSpot(env.HUBSPOT_API_KEY, lead) : 
                    Promise.resolve({ status: 'skipped', reason: 'No HubSpot API key' }),
                
                // 3. Slack notification (if configured)
                env.SLACK_WEBHOOK_URL ? sendToSlack(env.SLACK_WEBHOOK_URL, lead) :
                    Promise.resolve({ status: 'skipped', reason: 'No Slack webhook' })
            ]);
            
            // Log results
            console.log('Lead capture results:', responses.map(r => r.status));
            
            return new Response(JSON.stringify({
                success: true,
                leadId: lead.id,
                message: 'Lead captured successfully',
                timestamp: lead.timestamp
            }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
            
        } catch (error) {
            console.error('Lead capture error:', error);
            
            return new Response(JSON.stringify({
                success: false,
                error: 'Internal server error',
                message: 'Please try again or contact us directly at ahump20@outlook.com'
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
    }
};

// Helper functions
async function sendEmail(apiKey, email) {
    try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                personalizations: [{
                    to: [{ email: email.to }]
                }],
                from: { email: email.from },
                subject: email.subject,
                content: [{ type: 'text/plain', value: email.text }]
            })
        });
        
        return { status: response.ok ? 'success' : 'failed', response: response.status };
        
    } catch (error) {
        return { status: 'error', error: error.message };
    }
}

async function sendToHubSpot(apiKey, lead) {
    try {
        const response = await fetch('https://api.hubapi.com/contacts/v1/contact', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                properties: [
                    { property: 'firstname', value: lead.contact.firstName },
                    { property: 'lastname', value: lead.contact.lastName },
                    { property: 'email', value: lead.contact.email },
                    { property: 'phone', value: lead.contact.phone },
                    { property: 'company', value: lead.contact.organization },
                    { property: 'hs_lead_status', value: 'NEW' },
                    { property: 'lead_source', value: 'Website Contact Form' },
                    { property: 'sport_interest', value: lead.contact.sport },
                    { property: 'competition_level', value: lead.contact.level },
                    { property: 'initial_message', value: lead.contact.message }
                ]
            })
        });
        
        return { status: response.ok ? 'success' : 'failed', response: response.status };
        
    } catch (error) {
        return { status: 'error', error: error.message };
    }
}

async function sendToSlack(webhookUrl, lead) {
    try {
        const message = {
            text: `🔥 New Blaze Intelligence Lead!`,
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: "🔥 New Lead Captured"
                    }
                },
                {
                    type: "section",
                    fields: [
                        {
                            type: "mrkdwn",
                            text: `*Name:*\n${lead.contact.firstName} ${lead.contact.lastName}`
                        },
                        {
                            type: "mrkdwn",
                            text: `*Organization:*\n${lead.contact.organization}`
                        },
                        {
                            type: "mrkdwn",
                            text: `*Email:*\n${lead.contact.email}`
                        },
                        {
                            type: "mrkdwn",
                            text: `*Sport:*\n${lead.contact.sport || 'Not specified'}`
                        }
                    ]
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*Message:*\n${lead.contact.message}`
                    }
                },
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: `Lead ID: ${lead.id} | ${lead.timestamp}`
                        }
                    ]
                }
            ]
        };
        
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        });
        
        return { status: response.ok ? 'success' : 'failed', response: response.status };
        
    } catch (error) {
        return { status: 'error', error: error.message };
    }
}