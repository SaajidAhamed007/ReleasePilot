"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Send, Bot, User } from "lucide-react";
import { chatExamples, defaultChatAnswer } from "@/data/mock-release";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const initialMessages: Message[] = [
  {
    id: "intro",
    role: "assistant",
    text: "Hey! I'm the ReleaseIQ assistant. Ask me anything about this release.",
  },
];

function findAnswer(question: string): string {
  const match = chatExamples.find(
    (q) => q.question.toLowerCase() === question.toLowerCase()
  );
  return match?.answer ?? defaultChatAnswer;
}

export function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMessage: Message = { id: crypto.randomUUID(), role: "user", text };
    setMessages((m) => [...m, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const answer = findAnswer(text);
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", text: answer },
      ]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed right-6 bottom-6 z-50 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-2xl shadow-violet-900/40"
        aria-label="Open AI Release Assistant"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="size-6" />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Sparkles className="size-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed right-6 bottom-24 z-50 flex h-[520px] w-[min(380px,calc(100vw-3rem))] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c14]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-4">
              <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400">
                <Bot className="size-4 text-white" />
              </span>
              <div>
                <p className="text-sm font-medium text-white">AI Release Assistant</p>
                <p className="text-xs text-emerald-300">● Online</p>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-2", m.role === "user" && "justify-end")}
                >
                  {m.role === "assistant" && (
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-violet-300">
                      <Bot className="size-3.5" />
                    </span>
                  )}
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                      m.role === "assistant"
                        ? "bg-white/[0.06] text-white/85"
                        : "bg-gradient-to-br from-violet-500 to-cyan-400 text-white"
                    )}
                  >
                    {m.text}
                  </div>
                  {m.role === "user" && (
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60">
                      <User className="size-3.5" />
                    </span>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 pl-9">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                        className="size-1.5 rounded-full bg-white/50"
                      />
                    ))}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 border-t border-white/10 px-4 py-3">
              {chatExamples.map((q) => (
                <button
                  key={q.question}
                  onClick={() => sendMessage(q.question)}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/60 transition-colors hover:bg-white/10"
                >
                  {q.question}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-2 border-t border-white/10 p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about this release..."
                className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-violet-400/40 focus:outline-none"
              />
              <button
                type="submit"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-white"
                aria-label="Send"
              >
                <Send className="size-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
