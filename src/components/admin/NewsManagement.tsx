import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Newspaper, 
  Eye, 
  EyeOff,
  Image as ImageIcon,
  Calendar,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  category: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

const categories = [
  "general",
  "announcement",
  "event",
  "success-story",
  "policy",
  "environment",
];

const NewsManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    image_url: "",
    category: "general",
    is_published: false,
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `news-${Date.now()}.${fileExt}`;
      const filePath = `news/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("report-media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("report-media")
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, image_url: urlData.publicUrl }));

      toast({
        title: "Image uploaded",
        description: "Image has been uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: "Could not upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      image_url: "",
      category: "general",
      is_published: false,
    });
    setEditingItem(null);
  };

  const openEditDialog = (item: NewsItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      excerpt: item.excerpt || "",
      image_url: item.image_url || "",
      category: item.category,
      is_published: item.is_published,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const newsData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || null,
        image_url: formData.image_url || null,
        category: formData.category,
        is_published: formData.is_published,
        published_at: formData.is_published ? new Date().toISOString() : null,
        author_id: user?.id,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("news")
          .update(newsData)
          .eq("id", editingItem.id);

        if (error) throw error;

        toast({
          title: "News updated",
          description: "Article has been updated successfully",
        });
      } else {
        const { error } = await supabase.from("news").insert([newsData]);

        if (error) throw error;

        toast({
          title: "News created",
          description: "Article has been created successfully",
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchNews();
    } catch (error: any) {
      console.error("Error saving news:", error);
      toast({
        title: "Save failed",
        description: error.message || "Could not save article. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (item: NewsItem) => {
    try {
      const newStatus = !item.is_published;
      const { error } = await supabase
        .from("news")
        .update({
          is_published: newStatus,
          published_at: newStatus ? new Date().toISOString() : null,
        })
        .eq("id", item.id);

      if (error) throw error;

      toast({
        title: newStatus ? "Published" : "Unpublished",
        description: `Article has been ${newStatus ? "published" : "unpublished"}`,
      });

      fetchNews();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteNews = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      const { error } = await supabase.from("news").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Article has been deleted",
      });

      fetchNews();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">News & Announcements</h2>
          <p className="text-sm text-muted-foreground">
            Manage ministry news and public announcements
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Article" : "Create New Article"}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Update the article details below"
                  : "Fill in the details to create a new article"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter article title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Input
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                  }
                  placeholder="Short summary (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, content: e.target.value }))
                  }
                  placeholder="Write your article content here..."
                  rows={8}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Featured Image</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="flex-1"
                    />
                  </div>
                  {formData.image_url && (
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg mt-2"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_published: checked }))
                  }
                />
                <Label htmlFor="is_published">Publish immediately</Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : editingItem ? (
                    "Update Article"
                  ) : (
                    "Create Article"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* News List */}
      {news.length === 0 ? (
        <div className="bg-background rounded-xl border border-border p-12 text-center">
          <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No articles yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first article to get started
          </p>
        </div>
      ) : (
        <div className="bg-background rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left p-4 font-medium text-foreground">Article</th>
                  <th className="text-left p-4 font-medium text-foreground">Category</th>
                  <th className="text-left p-4 font-medium text-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {news.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">
                            {item.title}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {item.excerpt || item.content.slice(0, 50)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary">
                        {item.category.replace("-", " ")}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => togglePublish(item)}
                        className="flex items-center gap-2"
                      >
                        {item.is_published ? (
                          <Badge className="bg-green-500 hover:bg-green-600 text-white">
                            <Eye className="w-3 h-3 mr-1" />
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Draft
                          </Badge>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(item.created_at), "MMM d, yyyy")}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(item)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteNews(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsManagement;
