import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!geminiApiKey) {
      throw new Error('Google Gemini API key not configured');
    }

    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      throw new Error('Query is required and must be a string');
    }

    console.log('Processing veterinary query:', query);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: query
          }]
        }],
        systemInstruction: {
          parts: [{
            text: `You are VetIntel, an expert veterinary AI assistant providing evidence-based information for veterinary professionals. 

RESPONSE FORMAT REQUIREMENTS:
1. Provide concise, professional medical responses (2-4 paragraphs maximum)
2. Include in-text citations using superscript numbers: [1], [2], [3]
3. End with a "References:" section using Vancouver style formatting
4. Use clear clinical language with definitive recommendations
5. Include evidence quality indicators where appropriate (Level A, B, C evidence)

RESPONSE STRUCTURE:
- **Brief Clinical Answer**: Direct response with key recommendations and citations [1][2]
- **Clinical Considerations**: Important factors, contraindications, or species differences [3][4]
- **References**: Vancouver-style numbered list

CITATION EXAMPLES:
- In text: "NSAIDs are contraindicated in cats due to reduced glucuronidation capacity [1]. Meloxicam may be used short-term with careful monitoring [2]."
- References format (MUST include DOI or URL):
1. Lascelles BDX, Court MH, Hardie EM, et al. Nonsteroidal anti-inflammatory drugs in cats: a review. Vet Anaesth Analg. 2007;34(4):228-250. doi: 10.1111/j.1467-2995.2007.00352.x
2. Ettinger SJ, Feldman EC. Textbook of veterinary internal medicine. 8th ed. St. Louis: Elsevier; 2017. Available from: https://www.elsevier.com/books/textbook-of-veterinary-internal-medicine/ettinger/9780323312110

REFERENCE REQUIREMENTS:
- ALL references MUST include either a DOI (preferred) or URL
- Use "doi: " prefix for DOI links
- Use "Available from: " prefix for URLs
- Follow modern Vancouver style with online accessibility

Keep responses focused, evidence-based, and professionally formatted with proper citations.`
          }]
        },
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1500,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', response.status, errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;

    console.log('Generated response for query');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in vet-search function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: 'Please try again or contact support if the issue persists'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});