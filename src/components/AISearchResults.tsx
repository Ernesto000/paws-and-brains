import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Brain, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AISearchResultsProps {
  query: string;
}

const AISearchResults = ({ query }: AISearchResultsProps) => {
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const searchWithAI = async () => {
      if (!query.trim()) return;
      
      setLoading(true);
      setError("");
      setResponse("");

      try {
        const { data, error: functionError } = await supabase.functions.invoke('vet-search', {
          body: { query }
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
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                        {response}
                      </div>
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