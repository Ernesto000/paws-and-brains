import { useState } from "react";
import Header from "@/components/Header";
import SearchSection from "@/components/SearchSection";
import AISearchResults from "@/components/AISearchResults";
import RoleGuard from "@/components/RoleGuard";
import { useAuth } from "@/hooks/useAuth";
import { useCanAccessVetFeatures } from "@/hooks/useRoleCheck";
import { useSecurityLogging } from "@/hooks/useSecurityLogging";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, User } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { user } = useAuth();
  const canAccessVetFeatures = useCanAccessVetFeatures();
  const { logSearchQuery } = useSecurityLogging();

  const handleSearch = (query: string) => {
    // Log search query for security monitoring
    logSearchQuery(query);
    
    setSearchQuery(query);
    setShowResults(true);
    
    // Scroll to results after a brief delay to allow rendering
    setTimeout(() => {
      const resultsElement = document.getElementById('search-results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Show public search interface for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="py-20 bg-gradient-to-br from-background via-accent/30 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-12">
                <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                  VetIntel
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                  Professional veterinary AI assistant for evidence-based answers
                </p>
                
                <Card className="max-w-md mx-auto">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Secure Access Required</h3>
                    <p className="text-muted-foreground mb-4">
                      VetIntel is exclusively for verified veterinary professionals. 
                      Sign in to access AI-powered veterinary insights.
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/auth'}
                      className="w-full"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Show restricted access message for unverified users
  if (!canAccessVetFeatures) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <RoleGuard 
          allowedRoles={['veterinarian', 'admin']}
          fallbackMessage="AI search is available only to verified veterinary professionals. Please complete your profile verification to access this feature."
        >
          <div></div>
        </RoleGuard>
      </div>
    );
  }

  // Full access for verified users
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SearchSection onSearch={handleSearch} />
      {showResults && <div id="search-results"><AISearchResults query={searchQuery} /></div>}
    </div>
  );
};

export default Index;
