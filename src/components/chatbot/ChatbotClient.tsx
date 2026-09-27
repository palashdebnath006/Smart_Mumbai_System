'use client';

import { useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatbotClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messageIdRef = useRef(0);

  const nextId = () => {
    messageIdRef.current += 1;
    return `${messageIdRef.current}`;
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { id: nextId(), role: 'user', content: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.reply || 'Chat request failed');

      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'assistant', content: data.reply || 'No reply received.' },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error.';
      setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', content: `Error: ${message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col bg-slate-50 p-4 md:p-6">
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">Chatbot</h1>

      <section className="flex flex-1 flex-col rounded-2xl border border-slate-200 bg-white">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <p className="text-sm text-slate-500">Ask your first question to the assistant.</p>
          )}
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  message.role === 'user'
                    ? 'bg-teal-600 text-white'
                    : 'border border-slate-200 bg-slate-50 text-slate-900'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {loading && <p className="text-xs text-slate-500">Thinking...</p>}
        </div>

        <div className="border-t border-slate-200 p-3">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your question"
              className="min-h-24"
              disabled={loading}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
            />
            <Button onClick={() => void sendMessage()} disabled={!input.trim() || loading}>
              <Send className="mr-2 h-4 w-4" />
              Send
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
