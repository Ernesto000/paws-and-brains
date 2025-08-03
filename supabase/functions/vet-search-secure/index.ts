import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

// CORS headers for web app access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const MAX_QUERY_LENGTH = 500;
const BLOCKED_KEYWORDS = ['hack', 'exploit', 'injection', 'script'];

interface RateLimitCheck {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { 
        persistSession: false,
        autoRefreshToken: false 
      }
    });

    // Get API key for Gemini
    const apiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_GEMINI_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get and validate authorization
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Set auth context
    await supabase.auth.setSession({
      access_token: authHeader.replace('Bearer ', ''),
      refresh_token: ''
    });

    // Get user info
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // User is already authenticated, allow access for all authenticated users

    // Parse request body
    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query is required and must be a string' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Security validations
    if (query.length > MAX_QUERY_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Query too long. Maximum ${MAX_QUERY_LENGTH} characters allowed.` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check for suspicious content
    const lowerQuery = query.toLowerCase();
    const hasSuspiciousContent = BLOCKED_KEYWORDS.some(keyword => 
      lowerQuery.includes(keyword)
    );

    if (hasSuspiciousContent) {
      // Log suspicious activity
      await supabase.rpc('log_user_action', {
        action_name: 'suspicious_query',
        resource_type_param: 'ai_search',
        details_param: { 
          query: query.substring(0, 100), // Log only first 100 chars
          ip: req.headers.get('x-forwarded-for') || 'unknown'
        }
      });

      return new Response(
        JSON.stringify({ error: 'Query contains prohibited content' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Rate limiting check
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(supabase, user.id, clientIp);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please wait before making another request.',
          resetTime: rateLimitResult.resetTime
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
          } 
        }
      );
    }

    // Log the search query
    await supabase.rpc('log_user_action', {
      action_name: 'ai_search_query',
      resource_type_param: 'ai_search',
      details_param: { 
        queryLength: query.length,
        userId: user.id,
        ip: clientIp
      }
    });

    // Enhanced prompt for veterinary AI with security considerations
    const prompt = `You are VetIntel, an advanced AI veterinary assistant designed to provide evidence-based veterinary information. You must follow these strict guidelines:

SECURITY & SAFETY RULES:
- NEVER provide treatment advice without emphasizing the need for professional veterinary examination
- ALWAYS recommend consulting a licensed veterinarian for diagnosis and treatment
- DO NOT provide dosage information without veterinary supervision
- NEVER suggest performing procedures that require veterinary training
- REFUSE to answer questions about illegal drugs or procedures

RESPONSE FORMAT:
- Provide comprehensive, evidence-based information
- Use numbered citations [1], [2], etc. throughout your response
- Include a "References:" section at the end with your sources
- Structure your response clearly with proper sections
- Emphasize safety considerations and limitations

CONTENT REQUIREMENTS:
- Base answers on peer-reviewed veterinary literature
- Include relevant anatomy, physiology, and pathophysiology when appropriate
- Mention species-specific considerations when relevant
- Address common misconceptions or dangerous practices
- Provide context about when emergency care is needed

User question: ${query}

Provide a thorough, evidence-based response following all guidelines above.`;

    // Call Gemini API with enhanced security prompt
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      
      // Log API failure
      await supabase.rpc('log_user_action', {
        action_name: 'ai_api_error',
        resource_type_param: 'ai_search',
        details_param: { 
          error: errorText.substring(0, 200),
          status: geminiResponse.status
        }
      });

      return new Response(
        JSON.stringify({ error: 'AI service temporarily unavailable' }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await geminiResponse.json();
    const response = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!response) {
      console.error('No response from Gemini API');
      return new Response(
        JSON.stringify({ error: 'No response generated' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log successful search
    await supabase.rpc('log_user_action', {
      action_name: 'ai_search_success',
      resource_type_param: 'ai_search',
      details_param: { 
        responseLength: response.length,
        queryLength: query.length
      }
    });

    return new Response(
      JSON.stringify({ response }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
        } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Rate limiting function
async function checkRateLimit(
  supabase: any, 
  userId: string, 
  ipAddress: string
): Promise<RateLimitCheck> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW);
  
  try {
    // Check current rate limit for user
    const { data: rateLimits, error } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('endpoint', 'vet-search')
      .gte('window_start', windowStart.toISOString())
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Rate limit check error:', error);
      return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW, resetTime: now.getTime() };
    }

    if (!rateLimits) {
      // No existing rate limit record, create one
      await supabase
        .from('rate_limits')
        .insert({
          user_id: userId,
          ip_address: ipAddress,
          endpoint: 'vet-search',
          request_count: 1,
          window_start: now.toISOString()
        });
      
      return { 
        allowed: true, 
        remaining: MAX_REQUESTS_PER_WINDOW - 1, 
        resetTime: now.getTime() + RATE_LIMIT_WINDOW 
      };
    }

    // Check if user is blocked
    if (rateLimits.blocked_until && new Date(rateLimits.blocked_until) > now) {
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: new Date(rateLimits.blocked_until).getTime() 
      };
    }

    // Update request count
    if (rateLimits.request_count >= MAX_REQUESTS_PER_WINDOW) {
      // Block user for the remainder of the window
      const blockUntil = new Date(rateLimits.window_start);
      blockUntil.setTime(blockUntil.getTime() + RATE_LIMIT_WINDOW);
      
      await supabase
        .from('rate_limits')
        .update({ 
          blocked_until: blockUntil.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', rateLimits.id);

      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: blockUntil.getTime() 
      };
    }

    // Increment request count
    await supabase
      .from('rate_limits')
      .update({ 
        request_count: rateLimits.request_count + 1,
        updated_at: now.toISOString()
      })
      .eq('id', rateLimits.id);

    return { 
      allowed: true, 
      remaining: MAX_REQUESTS_PER_WINDOW - rateLimits.request_count - 1, 
      resetTime: new Date(rateLimits.window_start).getTime() + RATE_LIMIT_WINDOW 
    };

  } catch (error) {
    console.error('Rate limiting error:', error);
    // Allow request on error to avoid blocking legitimate users
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW, resetTime: now.getTime() };
  }
}