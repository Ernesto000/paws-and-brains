import { useState } from "react";
import Header from "@/components/Header";
import SearchSection from "@/components/SearchSection";
import AISearchResults from "@/components/AISearchResults";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (query: string) => {
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SearchSection onSearch={handleSearch} />
      {showResults && <div id="search-results"><AISearchResults query={searchQuery} /></div>}
    </div>
  );
};

export default Index;
