'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import {
  Newspaper,
  Calendar,
  User,
  Pin,
  ExternalLink,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';

// Types
interface NewsItem {
  id: string | number;
  title: string;
  content: string;
  category: string;
  author: string;
  isPinned: boolean;
  publishedAt: Date | string;
}

interface GovernmentScheme {
  id: string | number;
  name: string;
  description: string;
  category: string;
  status: string;
  eligibility: string;
  benefits: string;
}

// Initial data
const initialNewsItems: NewsItem[] = [
  {
    id: 1,
    title: 'New Smart Traffic System Launches',
    content: 'The city has deployed a new AI-powered traffic management system to reduce congestion by 30%. The system uses real-time data from sensors and cameras to optimize traffic flow.',
    category: 'government',
    author: 'City Administration',
    isPinned: true,
    publishedAt: new Date(2024, 0, 15),
  },
  {
    id: 2,
    title: 'Water Conservation Initiative',
    content: 'Residents are encouraged to reduce water usage as reservoir levels drop below 50%. Free water-saving devices are available at city centers.',
    category: 'policy',
    author: 'Water Department',
    isPinned: true,
    publishedAt: new Date(2024, 0, 14),
  },
  {
    id: 3,
    title: 'Air Quality Alert: Moderate Levels',
    content: 'AQI has reached moderate levels in some areas. Sensitive groups should limit outdoor activities during peak hours.',
    category: 'incident',
    author: 'Environmental Department',
    isPinned: false,
    publishedAt: new Date(2024, 0, 14),
  },
  {
    id: 4,
    title: 'New Public Transport Routes',
    content: 'Three new bus routes will be added to improve connectivity in residential areas. Routes will be operational from February 1st.',
    category: 'government',
    author: 'Transport Authority',
    isPinned: false,
    publishedAt: new Date(2024, 0, 13),
  },
  {
    id: 5,
    title: 'Road Closure: Main Street',
    content: 'Main Street will be closed for repairs from January 20-25. Please use alternate routes during this period.',
    category: 'incident',
    author: 'Traffic Department',
    isPinned: false,
    publishedAt: new Date(2024, 0, 12),
  },
  {
    id: 6,
    title: 'Property Tax Reform Announced',
    content: 'New property tax reforms will provide relief to homeowners with properties valued under $500,000. Application deadline is March 15th.',
    category: 'policy',
    author: 'Finance Department',
    isPinned: false,
    publishedAt: new Date(2024, 0, 11),
  },
];

const initialGovernmentSchemes: GovernmentScheme[] = [
  {
    id: 1,
    name: 'Smart City Initiative',
    description: 'A comprehensive program to digitize city services and improve citizen engagement.',
    category: 'infrastructure',
    status: 'active',
    eligibility: 'All residents',
    benefits: 'Access to digital services, real-time updates',
  },
  {
    id: 2,
    name: 'Green Energy Subsidy',
    description: 'Subsidies for installing solar panels and energy-efficient appliances.',
    category: 'welfare',
    status: 'active',
    eligibility: 'Homeowners',
    benefits: 'Up to 50% subsidy on installation costs',
  },
  {
    id: 3,
    name: 'Free Health Camps',
    description: 'Monthly free health checkup camps in all districts.',
    category: 'health',
    status: 'active',
    eligibility: 'All residents',
    benefits: 'Free health screenings and consultations',
  },
  {
    id: 4,
    name: 'Student Scholarship Program',
    description: 'Merit-based scholarships for higher education.',
    category: 'education',
    status: 'active',
    eligibility: 'Students with GPA above 3.5',
    benefits: 'Up to $10,000 per year',
  },
];

export default function NewsModule() {
  const isAdmin = useIsAdmin();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('news');

  // State
  const [newsItems, setNewsItems] = useState<NewsItem[]>(initialNewsItems);
  const [governmentSchemes, setGovernmentSchemes] = useState<GovernmentScheme[]>(initialGovernmentSchemes);
  const [lastRefreshAt, setLastRefreshAt] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dialog states
  const [newsDialogOpen, setNewsDialogOpen] = useState(false);
  const [schemeDialogOpen, setSchemeDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [editingScheme, setEditingScheme] = useState<GovernmentScheme | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'news' | 'scheme'; id: string | number } | null>(null);
  const [articleDialogOpen, setArticleDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  // Form states
  const [newsForm, setNewsForm] = useState({
    title: '',
    content: '',
    category: 'general',
    author: '',
    isPinned: false,
  });

  const [schemeForm, setSchemeForm] = useState({
    name: '',
    description: '',
    category: 'welfare',
    status: 'active',
    eligibility: '',
    benefits: '',
  });

  const REFRESH_INTERVAL_MS = 60 * 60 * 1000;

  const fetchNewsUpdates = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/news', { cache: 'no-store' });
      const contentType = response.headers.get('content-type') || '';

      if (!response.ok || !contentType.includes('application/json')) {
        throw new Error('Failed to fetch latest news updates.');
      }

      const data = await response.json();

      if (Array.isArray(data.news)) {
        setNewsItems(
          data.news.map((item: any) => ({
            ...item,
            author: item.author || 'City Operations Team',
          }))
        );
      }

      if (Array.isArray(data.schemes)) {
        setGovernmentSchemes(data.schemes);
      }

      setLastRefreshAt(new Date());
    } catch (error) {
      console.error(error);
      toast({
        title: 'News refresh failed',
        description: error instanceof Error ? error.message : 'Could not refresh news updates.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchNewsUpdates();

    const timer = setInterval(() => {
      void fetchNewsUpdates();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [fetchNewsUpdates]);

  // Handlers
  const handleAddNews = useCallback(() => {
    if (!newsForm.title.trim() || !newsForm.content.trim()) {
      toast({ title: 'Error', description: 'Title and content are required', variant: 'destructive' });
      return;
    }

    const newNews: NewsItem = {
      id: `local-news-${Date.now()}`,
      ...newsForm,
      publishedAt: new Date(),
    };

    setNewsItems(prev => [newNews, ...prev]);
    setNewsDialogOpen(false);
    setNewsForm({ title: '', content: '', category: 'general', author: '', isPinned: false });
    toast({ title: 'Success', description: 'News article published successfully' });
  }, [newsForm, newsItems.length, toast]);

  const handleUpdateNews = useCallback(() => {
    if (!editingNews) return;

    setNewsItems(prev => prev.map(n =>
      n.id === editingNews.id ? { ...n, ...newsForm } : n
    ));
    setNewsDialogOpen(false);
    setEditingNews(null);
    setNewsForm({ title: '', content: '', category: 'general', author: '', isPinned: false });
    toast({ title: 'Success', description: 'News article updated successfully' });
  }, [editingNews, newsForm, toast]);

  const handleAddScheme = useCallback(() => {
    if (!schemeForm.name.trim() || !schemeForm.description.trim()) {
      toast({ title: 'Error', description: 'Name and description are required', variant: 'destructive' });
      return;
    }

    const newScheme: GovernmentScheme = {
      id: `local-scheme-${Date.now()}`,
      ...schemeForm,
    };

    setGovernmentSchemes(prev => [...prev, newScheme]);
    setSchemeDialogOpen(false);
    setSchemeForm({ name: '', description: '', category: 'welfare', status: 'active', eligibility: '', benefits: '' });
    toast({ title: 'Success', description: 'Government scheme added successfully' });
  }, [schemeForm, governmentSchemes.length, toast]);

  const handleUpdateScheme = useCallback(() => {
    if (!editingScheme) return;

    setGovernmentSchemes(prev => prev.map(s =>
      s.id === editingScheme.id ? { ...s, ...schemeForm } : s
    ));
    setSchemeDialogOpen(false);
    setEditingScheme(null);
    setSchemeForm({ name: '', description: '', category: 'welfare', status: 'active', eligibility: '', benefits: '' });
    toast({ title: 'Success', description: 'Scheme updated successfully' });
  }, [editingScheme, schemeForm, toast]);

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'news') {
      setNewsItems(prev => prev.filter(n => n.id !== deleteTarget.id));
    } else {
      setGovernmentSchemes(prev => prev.filter(s => s.id !== deleteTarget.id));
    }

    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
    toast({ title: 'Success', description: 'Item deleted successfully' });
  }, [deleteTarget, toast]);

  // Helper functions
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'government': return 'bg-blue-500/10 text-blue-500 border-blue-500';
      case 'policy': return 'bg-purple-500/10 text-purple-500 border-purple-500';
      case 'incident': return 'bg-red-500/10 text-red-500 border-red-500';
      case 'general': return 'bg-gray-500/10 text-gray-500 border-gray-500';
      default: return 'bg-gray-500/10';
    }
  };

  const getSchemeCategoryColor = (category: string) => {
    switch (category) {
      case 'infrastructure': return 'bg-blue-500/10 text-blue-500';
      case 'welfare': return 'bg-green-500/10 text-green-500';
      case 'health': return 'bg-red-500/10 text-red-500';
      case 'education': return 'bg-purple-500/10 text-purple-500';
      default: return 'bg-gray-500/10';
    }
  };

  const formatDate = (date: Date | string) => {
    const parsed = typeof date === 'string' ? new Date(date) : date;
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const openEditNews = (news: NewsItem) => {
    setEditingNews(news);
    setNewsForm({
      title: news.title,
      content: news.content,
      category: news.category,
      author: news.author,
      isPinned: news.isPinned,
    });
    setNewsDialogOpen(true);
  };

  const openEditScheme = (scheme: GovernmentScheme) => {
    setEditingScheme(scheme);
    setSchemeForm({
      name: scheme.name,
      description: scheme.description,
      category: scheme.category,
      status: scheme.status,
      eligibility: scheme.eligibility,
      benefits: scheme.benefits,
    });
    setSchemeDialogOpen(true);
  };

  const openArticle = (news: NewsItem) => {
    setSelectedArticle(news);
    setArticleDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex justify-between w-full">
          <div className="flex">
            <TabsTrigger value="news">News & Announcements</TabsTrigger>
            <TabsTrigger value="schemes">Government Schemes</TabsTrigger>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              {activeTab === 'news' && (
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingNews(null);
                    setNewsForm({ title: '', content: '', category: 'general', author: '', isPinned: false });
                    setNewsDialogOpen(true);
                  }}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add News
                </Button>
              )}
              {activeTab === 'schemes' && (
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingScheme(null);
                    setSchemeForm({ name: '', description: '', category: 'welfare', status: 'active', eligibility: '', benefits: '' });
                    setSchemeDialogOpen(true);
                  }}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Scheme
                </Button>
              )}
            </div>
          )}
        </TabsList>

        <div className="mt-3 flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          <span>
            Auto updates every 1 hour for traffic, water conservation, air quality, and city alerts.
          </span>
          <span>
            {isRefreshing
              ? 'Refreshing now...'
              : lastRefreshAt
              ? `Last updated: ${lastRefreshAt.toLocaleTimeString()}`
              : 'Waiting for first refresh...'}
          </span>
        </div>

        {/* News Tab */}
        <TabsContent value="news" className="space-y-6 mt-6">
          {/* Pinned News */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-teal-500/30 bg-teal-500/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pin className="w-5 h-5 text-teal-500" />
                  Pinned Announcements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {newsItems.filter(n => n.isPinned).map((news) => (
                    <div
                      key={news.id}
                      className="p-4 rounded-lg bg-background border border-border relative"
                    >
                      {isAdmin && (
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditNews(news)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              setDeleteTarget({ type: 'news', id: news.id });
                              setDeleteConfirmOpen(true);
                            }}
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={getCategoryColor(news.category)}>
                          {news.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(news.publishedAt)}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-2">{news.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{news.content}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {news.author}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => openArticle(news)}>
                          Read More
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* All News */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-blue-500" />
                  Recent News
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {newsItems.filter(n => !n.isPinned).map((news, index) => (
                    <motion.div
                      key={news.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors relative"
                    >
                      {isAdmin && (
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditNews(news)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              setDeleteTarget({ type: 'news', id: news.id });
                              setDeleteConfirmOpen(true);
                            }}
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={getCategoryColor(news.category)}>
                          {news.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(news.publishedAt)}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-2">{news.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{news.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {news.author}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => openArticle(news)}>
                          Read Full Article
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Schemes Tab */}
        <TabsContent value="schemes" className="mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-500" />
                  Government Schemes & Programs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {governmentSchemes.map((scheme, index) => (
                    <motion.div
                      key={scheme.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors relative"
                    >
                      {isAdmin && (
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditScheme(scheme)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              setDeleteTarget({ type: 'scheme', id: scheme.id });
                              setDeleteConfirmOpen(true);
                            }}
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-3">
                        <Badge className={getSchemeCategoryColor(scheme.category)}>
                          {scheme.category}
                        </Badge>
                        <Badge variant="outline" className="border-green-500 text-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {scheme.status}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{scheme.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{scheme.description}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <span className="font-medium">Eligibility: </span>
                            <span className="text-muted-foreground">{scheme.eligibility}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <div>
                            <span className="font-medium">Benefits: </span>
                            <span className="text-muted-foreground">{scheme.benefits}</span>
                          </div>
                        </div>
                      </div>

                      <Button className="w-full mt-4" variant="outline">
                        Apply Now
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* News Dialog */}
      <Dialog open={newsDialogOpen} onOpenChange={setNewsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingNews ? 'Edit News Article' : 'Add News Article'}</DialogTitle>
            <DialogDescription>
              {editingNews ? 'Update the news article details.' : 'Publish a new news article or announcement.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={newsForm.title}
                onChange={(e) => setNewsForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="News article title"
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={newsForm.content}
                onChange={(e) => setNewsForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write the article content..."
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newsForm.category} onValueChange={(v) => setNewsForm(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="incident">Incident</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Author</Label>
                <Input
                  value={newsForm.author}
                  onChange={(e) => setNewsForm(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Author name"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pinned"
                checked={newsForm.isPinned}
                onChange={(e) => setNewsForm(prev => ({ ...prev, isPinned: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="pinned" className="cursor-pointer">Pin this announcement</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewsDialogOpen(false)}>Cancel</Button>
            <Button onClick={editingNews ? handleUpdateNews : handleAddNews} className="bg-teal-600 hover:bg-teal-700">
              {editingNews ? 'Update' : 'Publish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scheme Dialog */}
      <Dialog open={schemeDialogOpen} onOpenChange={setSchemeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingScheme ? 'Edit Government Scheme' : 'Add Government Scheme'}</DialogTitle>
            <DialogDescription>
              {editingScheme ? 'Update the scheme details.' : 'Add a new government scheme or program.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Scheme Name</Label>
              <Input
                value={schemeForm.name}
                onChange={(e) => setSchemeForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Smart City Initiative"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={schemeForm.description}
                onChange={(e) => setSchemeForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the scheme..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={schemeForm.category} onValueChange={(v) => setSchemeForm(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="welfare">Welfare</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={schemeForm.status} onValueChange={(v) => setSchemeForm(prev => ({ ...prev, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Eligibility</Label>
              <Input
                value={schemeForm.eligibility}
                onChange={(e) => setSchemeForm(prev => ({ ...prev, eligibility: e.target.value }))}
                placeholder="e.g., All residents"
              />
            </div>
            <div className="space-y-2">
              <Label>Benefits</Label>
              <Input
                value={schemeForm.benefits}
                onChange={(e) => setSchemeForm(prev => ({ ...prev, benefits: e.target.value }))}
                placeholder="e.g., Free services, subsidies"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSchemeDialogOpen(false)}>Cancel</Button>
            <Button onClick={editingScheme ? handleUpdateScheme : handleAddScheme} className="bg-teal-600 hover:bg-teal-700">
              {editingScheme ? 'Update' : 'Add Scheme'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Read Article Dialog */}
      <Dialog open={articleDialogOpen} onOpenChange={setArticleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedArticle?.title || 'News Article'}</DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-xs">
              <Calendar className="h-3 w-3" />
              {selectedArticle ? formatDate(selectedArticle.publishedAt) : ''}
              <span>•</span>
              <User className="h-3 w-3" />
              {selectedArticle?.author || 'City Operations Team'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {selectedArticle && (
              <Badge className={getCategoryColor(selectedArticle.category)}>
                {selectedArticle.category}
              </Badge>
            )}
            <p className="text-sm leading-7 text-muted-foreground">
              {selectedArticle?.content || 'No article content available.'}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArticleDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
