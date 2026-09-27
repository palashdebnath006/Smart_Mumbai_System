'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageSquare, Dot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
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

export default function FloatingChatbot() {
  const { token, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Remove cooldown UI mapping
  const isCoolingDown = false;

  // Load chat history when token is available
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
        // Silently fail to load history
      }
    };

    loadHistory();
  }, [token]);

  // Fetch live metrics from dashboard
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch {
        // Silently fail to load metrics
      }
    };

    fetchMetrics();
    // Refresh metrics every 30 seconds to stay current
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cooldown countdown timer
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

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const element = scrollRef.current;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) {
      return;
    }

    if (!token) {
      toast({
        title: 'Sign in required',
        description: 'Use the dashboard login before chatting.',
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
        body: JSON.stringify({ 
          message: trimmed,
          metrics: metrics, // Include live dashboard metrics
        }),
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
        description: error instanceof Error ? error.message : 'Unexpected error.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-20 right-0 flex h-[min(500px,calc(100vh-7rem))] w-[360px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/50 bg-gradient-to-br from-white to-slate-50 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 bg-gradient-to-r from-teal-500/95 to-cyan-500/95 border-b border-teal-400/30">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Smart Mumbai</p>
                  <div className="flex items-center gap-1">
                    <Dot className="h-2 w-2 fill-green-300 text-green-300" />
                    <p className="text-xs text-green-100">Online</p>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-white hover:bg-white/20 transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages Area */}
            <ScrollArea className="min-h-0 flex-1 px-4 py-4" ref={scrollRef}>
              <div className="flex flex-col gap-3">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-2 py-6 text-center text-sm text-muted-foreground">
                    <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
                    <p>Start a conversation</p>
                    <p className="text-xs">Ask about the Smart Mumbai project</p>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.role === 'user'
                          ? 'bg-teal-500/90 text-white rounded-br-none'
                          : 'bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200/50'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <div className="flex gap-2">
                    <div className="max-w-[75%] rounded-2xl rounded-bl-none px-4 py-2.5 bg-slate-100 border border-slate-200/50">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" />
                        <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce delay-100" />
                        <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-slate-200/50 bg-white px-4 py-3 pb-4">
              {!isAuthenticated && (
                <p className="text-xs text-muted-foreground mb-3 text-center">
                  Sign in to the dashboard to use the chatbot
                </p>
              )}
              {isCoolingDown && (
                <p className="text-xs text-amber-600 mb-3 text-center">
                  Cooldown active
                </p>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Ask something..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading || isCoolingDown || !isAuthenticated}
                  className="text-sm border-slate-200/50 focus-visible:ring-teal-500/50"
                />
                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={loading || isCoolingDown || !isAuthenticated || !input.trim()}
                  className="h-10 w-10 bg-teal-500 hover:bg-teal-600 text-white transition-colors"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Icon Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg transition-all duration-300 hover:shadow-xl"
      >
        {/* Floating animation */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center rounded-full"
        >
          <MessageSquare className="h-6 w-6" />
        </motion.div>

        {/* Pulsing glow effect */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full border-2 border-teal-400/40"
        />

        {/* Hover tooltip */}
        <div className="absolute -top-10 right-0 bg-slate-900 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Chat with AI
        </div>
      </motion.button>
    </div>
  );
}
