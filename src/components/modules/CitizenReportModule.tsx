'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store';
import {
  AlertCircle, CheckCircle2, MapPin, Loader2, Send, Clock,
  FileText, RefreshCw, Inbox,
} from 'lucide-react';

interface Report {
  id: string;
  type: string;
  title: string;
  description: string;
  location: string | null;
  status: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; variant: any; color: string }> = {
  submitted: { label: 'Submitted', variant: 'secondary', color: 'text-yellow-500' },
  reviewed: { label: 'Under Review', variant: 'default', color: 'text-blue-500' },
  in_progress: { label: 'In Progress', variant: 'default', color: 'text-purple-500' },
  resolved: { label: 'Resolved', variant: 'default', color: 'text-green-500' },
  actioned: { label: 'Actioned', variant: 'default', color: 'text-green-500' },
};

const categories = [
  { id: 'infrastructure', label: 'Infrastructure (Roads, Potholes)' },
  { id: 'water', label: 'Water & Plumbing' },
  { id: 'waste', label: 'Waste & Sanitation' },
  { id: 'electricity', label: 'Power & Streetlights' },
  { id: 'safety', label: 'Public Safety' },
  { id: 'other', label: 'Other' },
];

export default function CitizenReportModule() {
  const { token } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    category: 'infrastructure',
    location: '',
    message: '',
  });

  const fetchMyReports = useCallback(async () => {
    setLoadingReports(true);
    try {
      const res = await fetch('/api/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setReports(data.data || []);
    } catch {
      // silently fail
    } finally {
      setLoadingReports(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMyReports();
  }, [fetchMyReports]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'create',
          title: formData.title,
          category: formData.category,
          location: formData.location,
          message: formData.message,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit report');

      setSubmitted(true);
      setFormData({ title: '', category: 'infrastructure', location: '', message: '' });
      fetchMyReports();

      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-ocean-500 flex items-center justify-center">
          <Send className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-heading">Citizen Reports</h2>
          <p className="text-muted-foreground text-sm">Report issues & track your submissions.</p>
        </div>
      </div>

      <Tabs defaultValue="new">
        <TabsList>
          <TabsTrigger value="new">
            <Send className="w-3.5 h-3.5 mr-1.5" />
            New Report
          </TabsTrigger>
          <TabsTrigger value="my-reports">
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            My Reports
            {reports.length > 0 && (
              <Badge variant="outline" className="ml-2 text-[10px] h-4 px-1">{reports.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── New Report Tab ── */}
        <TabsContent value="new" className="mt-4">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Issue Details</CardTitle>
              <CardDescription>Provide details about the issue you are reporting.</CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="py-12 flex flex-col items-center justify-center text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Report Submitted Successfully</h3>
                    <p className="text-muted-foreground max-w-md">
                      Thank you for your report! The relevant department has been notified and will look into the issue shortly. You can track your report status in the "My Reports" tab.
                    </p>
                    <Button variant="outline" className="mt-4" onClick={() => setSubmitted(false)}>
                      Submit Another Report
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-500 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Issue Title</Label>
                      <Input
                        id="title"
                        placeholder="Brief summary of the issue"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="location"
                          placeholder="Street address, landmark, or GPS coordinates"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message / Description</Label>
                      <Textarea
                        id="message"
                        placeholder="Please provide any relevant details that might help officials locate and resolve the issue quickly..."
                        className="min-h-[120px]"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setFormData({ title: '', category: 'infrastructure', location: '', message: '' })}>
                        Clear Form
                      </Button>
                      <Button
                        type="submit"
                        className="bg-teal-600 hover:bg-teal-700 text-white min-w-[140px]"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Report
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {!submitted && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3 mt-6">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-semibold mb-1">In an emergency?</p>
                <p>If this is a life-threatening emergency, please dial 112 immediately. Do not use this form for urgent situations requiring immediate police, fire, or medical response.</p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── My Reports (History) Tab ── */}
        <TabsContent value="my-reports" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-500" />
                Your Submitted Reports
              </CardTitle>
              <Button variant="outline" size="sm" onClick={fetchMyReports} disabled={loadingReports}>
                <RefreshCw className={`w-3 h-3 mr-1 ${loadingReports ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {loadingReports ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading reports...
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Inbox className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No reports yet</p>
                  <p className="text-sm">Your submitted reports will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((r) => {
                    const sc = statusConfig[r.status] || statusConfig.submitted;
                    return (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg border p-4 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-medium text-sm text-foreground">{r.title}</span>
                              <Badge variant={sc.variant} className="text-xs capitalize">{sc.label}</Badge>
                              <Badge variant="outline" className="text-xs capitalize">{r.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{r.description}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {r.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> {r.location}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {new Date(r.createdAt).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
