'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { ArrowLeft, Bot, Lock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function ChatbotClient() {
  const { token, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isCoolingDown = false;

  const statusText = useMemo(() => {
    if (!isAuthenticated) {
      return 'Sign in to use the project chatbot.';
    }

    if (isCoolingDown) {
      return `Cooldown active. Wait ${formatSeconds(secondsRemaining)} before sending the next message.`;
    }

    return 'Gemini is ready and the last messages are stored in the database.';
  }, [isAuthenticated, isCoolingDown, secondsRemaining]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!token) {
        return;
      }

      try {
        const response = await fetch('/api/chatbot', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setMessages(data.messages || []);
        setCooldownUntil(data.cooldownUntil || null);
      } catch {
        toast({
          title: 'Could not load chat history',
          description: 'The chatbot session could not be restored from the database.',
        });
      }
    };

    loadHistory();
  }, [token, toast]);

  useEffect(() => {
    if (!cooldownUntil) {
      setSecondsRemaining(0);
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((new Date(cooldownUntil).getTime() - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining === 0) {
        setCooldownUntil(null);
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [cooldownUntil]);

  useEffect(() => {
    const element = scrollRef.current;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed || loading) {
      return;
    }

    if (!token) {
      toast({
        title: 'Sign in required',
        description: 'Use the existing dashboard login before chatting.',
      });
      return;
    }

    if (isCoolingDown) {
      toast({
        title: 'Slow down',
        description: `You can send another message in ${formatSeconds(secondsRemaining)}.`,
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429 && data.cooldownUntil) {
          setCooldownUntil(data.cooldownUntil);
        }

        throw new Error(data.error || 'Chatbot request failed');
      }

      if (data.reply) {
        setMessages((current) => [
          ...current,
          {
            id: data.assistantMessage?.id || `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            createdAt: data.assistantMessage?.createdAt || new Date().toISOString(),
          },
        ]);
      }

      if (data.cooldownUntil) {
        setCooldownUntil(data.cooldownUntil);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Chat request failed',
        description: error instanceof Error ? error.message : 'Unexpected error while contacting Gemini.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_30%),linear-gradient(180deg,#f8fbfc_0%,#eef5f7_100%)] text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-4 md:px-6 md:py-6">
        <div className="mb-4 flex items-center justify-between gap-4 rounded-3xl border border-border/60 bg-background/75 px-5 py-4 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Smart Mumbai Assistant</p>
              <h1 className="text-xl font-semibold">Project-aware Gemini chatbot</h1>
            </div>
          </div>

          <Button asChild variant="outline" className="rounded-full">
            <a href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to dashboard
            </a>
          </Button>
        </div>

        <Card className="flex min-h-[calc(100vh-10rem)] flex-col overflow-hidden border-border/60 bg-background/80 shadow-lg backdrop-blur">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>Conversation</CardTitle>
            <CardDescription>{statusText}</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col p-0">
            <ScrollArea className="flex-1">
              <div ref={scrollRef} className="space-y-4 p-4 md:p-6">
                {messages.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-border/70 bg-muted/30 p-6 text-sm text-muted-foreground">
                    Ask about the dashboard modules, the Prisma schema, the auth flow, or where to put the Gemini API key.
                  </div>
                )}

                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: Math.min(index * 0.02, 0.12) }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-3xl px-4 py-3 shadow-sm md:max-w-[75%] ${
                        message.role === 'user'
                          ? 'bg-teal-600 text-white'
                          : 'border border-border/60 bg-card text-card-foreground'
                      }`}
                    >
                      <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] opacity-80">
                        {message.role === 'user' ? 'You' : 'Gemini'}
                      </div>
                      <div className={`prose prose-sm max-w-none ${message.role === 'user' ? 'prose-invert' : ''}`}>
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-3xl border border-border/60 bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
                      Gemini is thinking about your project...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t border-border/60 p-4 md:p-6">
              <div className="rounded-3xl border border-border/70 bg-background p-3 shadow-sm">
                <Textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask the project assistant something about Smart Mumbai..."
                  className="min-h-28 resize-none border-0 bg-transparent px-3 py-2 shadow-none focus-visible:ring-0"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage(input);
                    }
                  }}
                  disabled={loading || isCoolingDown || !isAuthenticated}
                />

                <div className="mt-3 flex items-center justify-between gap-3 px-2 pb-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="h-3.5 w-3.5" />
                    Responses are stored in the database and rate limited to one request every 2 minutes.
                  </div>
                  <Button
                    type="button"
                    onClick={() => void sendMessage(input)}
                    disabled={loading || isCoolingDown || !input.trim() || !isAuthenticated}
                    className="rounded-full px-5"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}