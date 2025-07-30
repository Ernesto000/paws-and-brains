import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, BookOpen, Shield } from "lucide-react";

const SearchSection = () => {
  const [query, setQuery] = useState("");

  const suggestedQueries = [
    "NSAID safety in cats",
    "Canine hip dysplasia treatment",
    "Feline diabetes management",
    "Equine colic diagnosis",
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-background via-accent/30 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Content */}
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Evidence-Based Veterinary Research
              <span className="block text-primary mt-2">Powered by AI</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Access the latest veterinary research, clinical guidelines, and evidence-based recommendations 
              to provide the best care for your patients.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Input
                type="text"
                placeholder="Ask a veterinary question or search for research..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-14 pl-12 pr-32 text-lg border-2 border-input focus:border-primary rounded-xl shadow-medium"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10"
                variant="hero"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Suggested Queries */}
          <div className="mb-12">
            <p className="text-sm text-muted-foreground mb-4">Try searching for:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {suggestedQueries.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(suggestion)}
                  className="hover:bg-primary hover:text-white hover:border-primary"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Comprehensive Database</h3>
              <p className="text-sm text-muted-foreground">
                Access thousands of peer-reviewed veterinary studies and clinical trials
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">AI-Powered Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Get intelligent insights and evidence synthesis powered by advanced AI
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-evidence-high/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-evidence-high" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Evidence Quality</h3>
              <p className="text-sm text-muted-foreground">
                Clear quality indicators and confidence levels for all research findings
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;