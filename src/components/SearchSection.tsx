import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles } from "lucide-react";

interface SearchSectionProps {
  onSearch: (query: string) => void;
}

const SearchSection = ({ onSearch }: SearchSectionProps) => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const suggestedQueries = [
    "NSAID safety in cats",
    "Canine hip dysplasia treatment",
    "Feline diabetes management",
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-background via-accent/30 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Content */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              VetIntel
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ask any veterinary question and get evidence-based answers powered by AI
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Input
                type="text"
                placeholder="Ask a veterinary question..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-14 pl-12 pr-32 text-lg border-2 border-input focus:border-primary rounded-xl shadow-medium"
                onKeyPress={(e) => e.key === 'Enter' && query.trim() && handleSearch()}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10"
                variant="hero"
                onClick={handleSearch}
                disabled={!query.trim()}
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
                  onClick={() => {
                    setQuery(suggestion);
                    onSearch(suggestion);
                  }}
                  className="hover:bg-primary hover:text-white hover:border-primary"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SearchSection;