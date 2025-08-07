import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageList } from "./MessageList";
import { TypingIndicator } from "./TypingIndicator";
import { MessageInput } from "./MessageInput";
import { useChatSocket } from "@/hooks/useChatSocket";
import type { ChatMessage, IncomingSocketEvent } from "@/types/chat";

const SAMPLE: ChatMessage[] = [
  { id: 1, user: "Alice", message: "Hey team, morning!", timestamp: "2025-07-29T08:01:00Z" },
  { id: 2, user: "Bob", message: "Morning Alice!", timestamp: "2025-07-29T08:01:15Z" },
  { id: 3, user: "Charlie", message: "Anyone up for lunch later?", timestamp: "2025-07-29T08:02:00Z" },
  { id: 4, user: "Alice", message: "Count me in.", timestamp: "2025-07-29T08:02:10Z" },
  { id: 5, user: "Bob", message: "Same here!", timestamp: "2025-07-29T08:02:20Z" },
];

const CURRENT_USER = "You";

async function fetchMessages(): Promise<ChatMessage[]> {
  try {
    const res = await fetch("http://localhost:3001/api/messages");
    console.log("Fetching messages from server..." + res);
    if (!res.ok) throw new Error("Failed");
    const data = (await res.json()) as ChatMessage[];
    return data;
  } catch {
    return SAMPLE; // Fallback to sample
  }
}

export function Chat() {
  const { data } = useQuery({ queryKey: ["messages"], queryFn: fetchMessages });
  const [messages, setMessages] = useState<ChatMessage[]>(SAMPLE);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  useEffect(() => {
    if (data) setMessages(data);
  }, [data]);


  const onMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const onTyping = useCallback((user: string) => {
    setTypingUser(user);
    // Clear after 3s
    window.clearTimeout((onTyping as any)._t);
    (onTyping as any)._t = window.setTimeout(() => setTypingUser(null), 3000);
  }, []);

  const { send } = useChatSocket({ onMessage, onTyping });

  const handleSend = (text: string) => {
    const local: ChatMessage = {
      id: `${Date.now()}`,
      user: CURRENT_USER,
      message: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, local]);
    // Try to inform WS server if available
    send({ type: "message", data: local } satisfies IncomingSocketEvent as any);
  };

  const latestFive = useMemo(() => messages.slice(-5), [messages]);

  return (
    <section className="w-full">
      <Card className="border shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/20 to-primary/10 animate-[bg-pan_12s_linear_infinite]">
          <CardTitle className="text-xl font-semibold">Real-time AI Chat Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          <MessageList messages={latestFive} currentUser={CURRENT_USER} />
          <TypingIndicator user={typingUser} />
          <MessageInput onSend={handleSend} />
        </CardContent>
      </Card>
    </section>
  );
}
