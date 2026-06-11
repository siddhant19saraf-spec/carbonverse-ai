"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  Leaf,
  Car,
  Zap,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Suggestion {
  label: string;
  icon: React.ElementType;
  prompt: string;
}

const SUGGESTIONS: Suggestion[] = [
  { label: "Reduce food waste", icon: Leaf, prompt: "How can I reduce food waste?" },
  { label: "Green transport", icon: Car, prompt: "What are the greenest transportation options?" },
  { label: "Save energy", icon: Zap, prompt: "How can I reduce my electricity consumption?" },
  { label: "Recycle better", icon: Trash2, prompt: "What are the best recycling practices?" },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hi! I'm your personal carbon coach. I can help you understand your emissions, set sustainability goals, and find ways to reduce your carbon footprint. What would you like to know?",
    timestamp: new Date(),
  },
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.post<{ reply: string }>("/coach/chat", {
        message: content.trim(),
        history: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (prompt: string) => {
    sendMessage(prompt);
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const typingVariants = {
    animate: {
      opacity: [0.4, 1, 0.4],
      transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15">
          <Bot className="h-4 w-4 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Carbon Coach</h2>
          <p className="text-xs text-white/40">AI-powered sustainability assistant</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              className={cn(
                "flex gap-3",
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full",
                  message.role === "user"
                    ? "bg-blue-500/15"
                    : "bg-emerald-500/15"
                )}
              >
                {message.role === "user" ? (
                  <User className="h-3.5 w-3.5 text-blue-400" />
                ) : (
                  <Bot className="h-3.5 w-3.5 text-emerald-400" />
                )}
              </div>

              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-blue-500/15 text-blue-50"
                    : "bg-white/5 text-white/80"
                )}
              >
                {message.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
              <Bot className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl bg-white/5 px-4 py-3">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  variants={typingVariants}
                  animate="animate"
                  style={{ animationDelay: `${i * 0.2}s` }}
                  className="inline-block h-2 w-2 rounded-full bg-emerald-400"
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 1 && (
        <div className="px-5 pb-3">
          <p className="mb-2 text-xs text-white/40">Suggested questions</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => {
              const Icon = suggestion.icon;
              return (
                <button
                  key={suggestion.label}
                  onClick={() => handleSuggestionClick(suggestion.prompt)}
                  disabled={isLoading}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5",
                    "text-xs text-white/60 transition-all hover:border-emerald-500/30",
                    "hover:bg-emerald-500/10 hover:text-emerald-400",
                    "disabled:opacity-50 disabled:pointer-events-none"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {suggestion.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-white/10 px-5 py-4"
      >
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your carbon coach..."
          disabled={isLoading}
          aria-label="Message input"
          className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500/30"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isLoading}
          aria-label="Send message"
          className="h-10 w-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-30"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
