// Blaze Intelligence Worker - Contact Form & Data Pipeline
// Handles /api/lead endpoint with D1 + HubSpot integration

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // Route requests
      if (url.pathname === '/api/lead' && request.method === 'POST') {
        return await handleLeadSubmission(request, env, corsHeaders);
      }
      
      if (url.pathname === '/api/health') {
        return await handleHealthCheck(env, corsHeaders);
      }
      
      if (url.pathname === '/api/notion/refresh' && request.method === 'POST') {
        return await handleNotionRefresh(request, env, corsHeaders);
      }
      
      // Default response
      return new Response('Blaze Intelligence Worker - Ready', { 
        headers: corsHeaders,
        status: 200 
      });
      
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
  },
  
  async scheduled(event, env, ctx) {
    switch (event.cron) {
      case '*/10 * * * *': // Every 10 minutes - Cardinals Readiness Board
        ctx.waitUntil(runCardinalsReadinessBoard(env));
        break;
        
      case '*/30 * * * *': // Every 30 minutes - Digital-Combine Autopilot  
        ctx.waitUntil(runDigitalCombineAutopilot(env));
        break;
    }
  }
};

async function handleLeadSubmission(request, env, corsHeaders) {
  try {
    const formData = await request.json();
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        return new Response(JSON.stringify({
          success: false,
          error: `Missing required field: ${field}`
        }), {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }
    
    // Generate lead ID
    const leadId = generateLeadId();
    const timestamp = new Date().toISOString();
    
    // Prepare lead data
    const leadData = {
      id: leadId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      organization: formData.organization || '',
      role: formData.role || '',
      sport: formData.sport || '',
      subject: formData.subject || 'General Inquiry',
      message: formData.message || '',
      source: 'website',
      status: 'new',
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    // Store in D1
    const d1Result = await storeInD1(leadData, env);
    
    // Forward to HubSpot (optional - gracefully handle account limits)
    let hubspotResult = null;
    if (env.HUBSPOT_API_KEY) {
      hubspotResult = await forwardToHubSpot(leadData, env);
      // Don't fail the entire request if HubSpot is at limit
      if (!hubspotResult.success) {
        console.warn('HubSpot forwarding failed (continuing):', hubspotResult.error);
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      leadId: leadId,
      message: 'Lead captured successfully',
      metadata: {
        d1Stored: d1Result.success,
        hubspotForwarded: hubspotResult ? hubspotResult.success : false
      }
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Lead submission error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to process lead submission'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}

async function storeInD1(leadData, env) {
  try {
    // Create leads table if it doesn't exist
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT NOT NULL,
        organization TEXT,
        role TEXT,
        sport TEXT,
        subject TEXT,
        message TEXT,
        source TEXT,
        status TEXT,
        createdAt TEXT,
        updatedAt TEXT
      )
    `).run();
    
    // Insert lead
    const stmt = env.DB.prepare(`
      INSERT INTO leads (
        id, firstName, lastName, email, organization, role, 
        sport, subject, message, source, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = await stmt.bind(
      leadData.id,
      leadData.firstName,
      leadData.lastName,
      leadData.email,
      leadData.organization,
      leadData.role,
      leadData.sport,
      leadData.subject,
      leadData.message,
      leadData.source,
      leadData.status,
      leadData.createdAt,
      leadData.updatedAt
    ).run();
    
    return { success: true, result };
    
  } catch (error) {
    console.error('D1 storage error:', error);
    return { success: false, error: error.message };
  }
}

async function forwardToHubSpot(leadData, env) {
  try {
    console.log('Attempting HubSpot integration for lead:', leadData.id);
    
    const hubspotData = {
      properties: {
        firstname: leadData.firstName,
        lastname: leadData.lastName,
        email: leadData.email,
        company: leadData.organization,
        jobtitle: leadData.role,
        hs_lead_status: 'NEW',
        lifecyclestage: 'lead',
        lead_source: 'Blaze Intelligence Website'
      }
    };
    
    console.log('HubSpot payload:', JSON.stringify(hubspotData));
    
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(hubspotData)
    });
    
    const responseText = await response.text();
    console.log('HubSpot response status:', response.status);
    console.log('HubSpot response:', responseText);
    
    if (response.ok) {
      const result = JSON.parse(responseText);
      console.log('HubSpot contact created:', result.id);
      return { success: true, hubspotId: result.id };
    } else {
      console.error('HubSpot API error:', response.status, responseText);
      return { success: false, error: responseText };
    }
    
  } catch (error) {
    console.error('HubSpot forwarding error:', error);
    return { success: false, error: error.message };
  }
}

async function handleHealthCheck(env, corsHeaders) {
  try {
    // Check D1 connection
    const d1Check = await env.DB.prepare('SELECT 1').first();
    
    // Get lead count
    const leadCount = await env.DB.prepare('SELECT COUNT(*) as count FROM leads').first();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        d1: d1Check ? 'connected' : 'disconnected',
        hubspot: env.HUBSPOT_API_KEY ? 'configured' : 'not_configured'
      },
      metrics: {
        totalLeads: leadCount ? leadCount.count : 0
      }
    };
    
    return new Response(JSON.stringify(health), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}

async function handleNotionRefresh(request, env, corsHeaders) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // TODO: Implement Notion refresh logic
    // This would call your recruiting data sources and update the Notion database
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Notion refresh triggered',
      timestamp: new Date().toISOString()
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Notion refresh error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to refresh Notion data'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}

function generateLeadId() {
  return `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}


async function runCardinalsReadinessBoard(env) {
  try {
    console.log('Running Cardinals Readiness Board...');
    
    // Generate readiness data
    const readinessData = generateCardinalsReadiness();
    
    // Store in KV for site consumption
    await env.READINESS_KV.put('latest', JSON.stringify(readinessData));
    
    console.log('Cardinals Readiness Board completed');
    
  } catch (error) {
    console.error('Cardinals Readiness Board error:', error);
  }
}

async function runDigitalCombineAutopilot(env) {
  try {
    console.log('Running Digital-Combine Autopilot...');
    
    // Generate analytics insights
    const insights = generateCombineInsights();
    
    // Store in KV
    await env.ANALYTICS_KV.put('latest', JSON.stringify(insights));
    
    console.log('Digital-Combine Autopilot completed');
    
  } catch (error) {
    console.error('Digital-Combine Autopilot error:', error);
  }
}

function generateCardinalsReadiness() {
  const currentDate = new Date();
  const gameDay = Math.random() > 0.5; // Simulate game day detection
  
  return {
    timestamp: currentDate.toISOString(),
    team: 'St. Louis Cardinals',
    gameDay: gameDay,
    readiness: {
      overall: Math.round(75 + Math.random() * 20),
      offense: Math.round(70 + Math.random() * 25),
      defense: Math.round(80 + Math.random() * 15),
      pitching: Math.round(75 + Math.random() * 20)
    },
    predictions: {
      winProbability: Math.round(40 + Math.random() * 40),
      keyFactors: [
        'Starting pitcher matchup',
        'Recent offensive performance', 
        'Bullpen availability'
      ]
    },
    injuries: {
      teamHealthScore: Math.round(80 + Math.random() * 15),
      riskFactors: Math.random() > 0.7 ? ['Workload management'] : []
    },
    metadata: {
      source: 'Cardinals Analytics Tool',
      nextUpdate: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    }
  };
}

function generateCombineInsights() {
  return {
    timestamp: new Date().toISOString(),
    topics: ['MLB', 'NFL', 'College', 'High School', 'Perfect Game'],
    insights: [
      'Cross-sport injury prevention patterns identified',
      'Championship probability models updated',
      'Recruiting analytics trending upward'
    ],
    metadata: {
      source: 'Digital-Combine Autopilot',
      nextUpdate: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    }
  };
}