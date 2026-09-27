import type { Metadata } from 'next';
import ChatbotClient from '@/components/chatbot/ChatbotClient';

export const metadata: Metadata = {
  title: 'Chatbot | Smart Mumbai',
  description: 'Project-aware Gemini chatbot with database-backed chat history and 2-minute rate limiting.',
};

export default function ChatbotPage() {
  return <ChatbotClient />;
}