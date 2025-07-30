import Header from "@/components/Header";
import SearchSection from "@/components/SearchSection";
import SearchResults from "@/components/SearchResults";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SearchSection />
      <SearchResults />
      <Footer />
    </div>
  );
};

export default Index;
