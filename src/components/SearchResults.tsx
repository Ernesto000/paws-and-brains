import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, Clock, Users, BookOpen } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  summary: string;
  evidenceQuality: "high" | "medium" | "low" | "insufficient";
  studyType: string;
  participants: number;
  doi: string;
  relevanceScore: number;
}

const mockResults: SearchResult[] = [
  {
    id: "1",
    title: "Efficacy and Safety of Meloxicam in Cats: A Systematic Review and Meta-Analysis",
    authors: "Johnson, M.D., Smith, K.L., Brown, A.R.",
    journal: "Journal of Veterinary Pharmacology",
    year: 2023,
    summary: "This comprehensive meta-analysis evaluated the efficacy and safety profile of meloxicam in feline patients across 15 randomized controlled trials. Results demonstrate significant pain reduction with minimal adverse effects when used at recommended dosages.",
    evidenceQuality: "high",
    studyType: "Meta-Analysis",
    participants: 1247,
    doi: "10.1016/j.jvp.2023.12.001",
    relevanceScore: 94
  },
  {
    id: "2",
    title: "Long-term Outcomes of NSAID Use in Feline Chronic Kidney Disease",
    authors: "Williams, P.J., Davis, R.M., Thompson, L.K.",
    journal: "Veterinary Internal Medicine Research",
    year: 2023,
    summary: "A longitudinal cohort study examining NSAID usage patterns and renal function outcomes in cats with chronic kidney disease over a 3-year period. Findings suggest careful monitoring protocols can enable safe NSAID use.",
    evidenceQuality: "medium",
    studyType: "Cohort Study",
    participants: 456,
    doi: "10.1111/vim.2023.8901",
    relevanceScore: 87
  },
  {
    id: "3",
    title: "Comparative Analysis of NSAID Protocols in Post-Surgical Feline Pain Management",
    authors: "Anderson, C.R., Martinez, J.L.",
    journal: "Small Animal Surgery Today",
    year: 2022,
    summary: "This randomized controlled trial compared different NSAID protocols for post-operative pain management in cats undergoing routine procedures. Results show optimal dosing strategies for improved outcomes.",
    evidenceQuality: "high",
    studyType: "RCT",
    participants: 234,
    doi: "10.1177/sast.2022.0445",
    relevanceScore: 91
  }
];

const evidenceColors = {
  high: "bg-evidence-high text-white",
  medium: "bg-evidence-medium text-white", 
  low: "bg-evidence-low text-white",
  insufficient: "bg-evidence-insufficient text-white"
};

const SearchResults = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Search Results for "NSAID safety in cats"
            </h2>
            <p className="text-muted-foreground">
              Found {mockResults.length} high-quality studies • Sorted by relevance
            </p>
          </div>

          {/* AI Summary */}
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Star className="w-5 h-5" />
                AI Evidence Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">
                <strong>Current evidence suggests</strong> that NSAIDs can be safely used in cats when proper dosing protocols 
                are followed and adequate monitoring is implemented. Meta-analyses show significant efficacy for pain management 
                with low incidence of adverse effects. <strong>Key considerations:</strong> renal function monitoring, 
                appropriate dosing intervals, and contraindications in cats with existing kidney disease.
              </p>
            </CardContent>
          </Card>

          {/* Results List */}
          <div className="space-y-6">
            {mockResults.map((result) => (
              <Card key={result.id} className="shadow-soft hover:shadow-medium transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight mb-2 text-foreground">
                        {result.title}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span>{result.authors}</span>
                        <span>•</span>
                        <span className="font-medium">{result.journal}</span>
                        <span>•</span>
                        <span>{result.year}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`${evidenceColors[result.evidenceQuality]} font-medium`}
                      >
                        {result.evidenceQuality.toUpperCase()} QUALITY
                      </Badge>
                      <div className="text-right">
                        <div className="text-sm font-medium text-foreground">
                          {result.relevanceScore}% match
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground mb-4 leading-relaxed">
                    {result.summary}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {result.studyType}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {result.participants} subjects
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {result.year}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-mono">
                      DOI: {result.doi}
                    </span>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Study
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Results
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchResults;