import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Search, ArrowRight, Newspaper, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { format } from "date-fns";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  category: string;
  published_at: string;
  created_at: string;
}

const NewsMedia = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(news.map((n) => n.category))];

  const filteredNews = news.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredNews = filteredNews[0];
  const otherNews = filteredNews.slice(1);

  if (selectedNews) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-24">
          <Button variant="ghost" onClick={() => setSelectedNews(null)} className="mb-6">
            ← Back to News
          </Button>
          <article className="max-w-4xl mx-auto">
            {selectedNews.image_url && (
              <div className="aspect-video rounded-xl overflow-hidden mb-8">
                <img
                  src={selectedNews.image_url}
                  alt={selectedNews.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex items-center gap-3 mb-4">
              <Badge>{selectedNews.category}</Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(selectedNews.published_at || selectedNews.created_at), "MMMM d, yyyy")}
              </span>
            </div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-6">
              {selectedNews.title}
            </h1>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              {selectedNews.content.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </article>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Newspaper className="w-6 h-6" />
              <span className="text-primary-foreground/80 font-medium">News & Media</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Ministry Updates & Announcements
            </h1>
            <p className="text-xl text-primary-foreground/80">
              Stay informed about our latest initiatives, environmental programs, and community updates
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredNews.length === 0 ? (
          <Card className="py-12">
            <CardContent className="flex flex-col items-center justify-center">
              <Newspaper className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                {searchQuery || selectedCategory
                  ? "No news found matching your criteria"
                  : "No news articles available yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Featured Article */}
            {featuredNews && (
              <Card 
                className="mb-8 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedNews(featuredNews)}
              >
                <div className="grid md:grid-cols-2">
                  <div className="aspect-video md:aspect-auto">
                    {featuredNews.image_url ? (
                      <img
                        src={featuredNews.image_url}
                        alt={featuredNews.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge>Featured</Badge>
                      <Badge variant="secondary">{featuredNews.category}</Badge>
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-foreground mb-3">
                      {featuredNews.title}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      {featuredNews.excerpt || featuredNews.content.slice(0, 200)}...
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(featuredNews.published_at || featuredNews.created_at), "MMMM d, yyyy")}
                      </span>
                      <Button variant="ghost" size="sm">
                        Read More <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Other Articles Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherNews.map((item) => (
                <Card 
                  key={item.id} 
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedNews(item)}
                >
                  <div className="aspect-video">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {item.excerpt || item.content.slice(0, 100)}...
                    </p>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(item.published_at || item.created_at), "MMM d, yyyy")}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default NewsMedia;
