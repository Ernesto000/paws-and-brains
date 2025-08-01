import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Brain, Clock, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import DOMPurify from 'dompurify';

interface AISearchResultsProps {
  query: string;
}

const AISearchResults = ({ query }: AISearchResultsProps) => {
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [showReferences, setShowReferences] = useState(false);

  useEffect(() => {
    const searchWithAI = async () => {
      if (!query.trim()) return;
      
      setLoading(true);
      setError("");
      setResponse("");

      try {
        // Get the current session to ensure we have a valid auth token
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('Authentication required. Please sign in again.');
        }

        const { data, error: functionError } = await supabase.functions.invoke('vet-search-secure', {
          body: { query },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          }
        });

        if (functionError) {
          throw functionError;
        }

        setResponse(data.response);
      } catch (err: any) {
        console.error('Search error:', err);
        setError(err.message || 'An error occurred while searching');
      } finally {
        setLoading(false);
      }
    };

    searchWithAI();
  }, [query]);

  // Parse response to separate main content and references
  const parseResponse = (text: string) => {
    const referencesIndex = text.toLowerCase().indexOf('references:');
    if (referencesIndex === -1) {
      return { mainContent: text, references: [] };
    }
    
    const mainContent = text.substring(0, referencesIndex).trim();
    const referencesText = text.substring(referencesIndex + 11).trim();
    const references = referencesText
      .split('\n')
      .filter(line => line.trim() && /^\d+\./.test(line.trim()))
      .map(ref => ref.trim());
    
    return { mainContent, references };
  };

  // Format text with superscript citations and sanitize HTML
  const formatTextWithCitations = (text: string) => {
    const formatted = text.replace(/\[(\d+)\]/g, '<sup class="text-primary font-medium">$1</sup>');
    const withBreaks = formatted.replace(/\n/g, '<br />');
    // Sanitize HTML to prevent XSS attacks
    return DOMPurify.sanitize(withBreaks, {
      ALLOWED_TAGS: ['sup', 'br', 'strong', 'em', 'u'],
      ALLOWED_ATTR: ['class']
    });
  };

  const { mainContent, references } = parseResponse(response);

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Search Results for: "{query}"
            </h2>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-1" />
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-3">AI-Generated Answer</h3>
                  
                  {loading && (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing your question and generating evidence-based response...</span>
                    </div>
                  )}

                  {error && (
                    <div className="text-destructive bg-destructive/10 p-4 rounded-lg">
                      <p className="font-medium mb-1">Error occurred</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  {response && !loading && (
                    <div className="space-y-4">
                      {/* Main Content */}
                       <div 
                        className="prose prose-sm max-w-none text-foreground leading-relaxed"
                        dangerouslySetInnerHTML={{ 
                          __html: formatTextWithCitations(mainContent)
                        }}
                      />
                      
                      {/* References Section */}
                      {references.length > 0 && (
                        <div className="mt-6 border-t border-border pt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowReferences(!showReferences)}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                          >
                            <BookOpen className="w-4 h-4" />
                            References ({references.length})
                            {showReferences ? 
                              <ChevronUp className="w-4 h-4" /> : 
                              <ChevronDown className="w-4 h-4" />
                            }
                          </Button>
                          
                          {showReferences && (
                            <div className="mt-3 space-y-2">
                              {references.map((ref, index) => (
                                <div 
                                  key={index}
                                  className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border-l-2 border-primary/30"
                                >
                                  {ref}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {response && !loading && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                This AI-generated response is for informational purposes only and should not replace professional veterinary advice.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AISearchResults;