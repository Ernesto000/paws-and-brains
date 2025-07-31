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
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SearchSection onSearch={handleSearch} />
      {showResults && <AISearchResults query={searchQuery} />}
    </div>
  );
};

export default Index;
