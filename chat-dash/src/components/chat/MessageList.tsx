import { ChatMessage } from "@/types/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useEffect, useRef } from "react";

interface MessageListProps {
  messages: ChatMessage[];
  currentUser?: string;
}

export function MessageList({ messages, currentUser }: MessageListProps) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <Card className="h-80 overflow-hidden border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <ScrollArea className="h-80 px-4 py-3">
        <ul className="space-y-3">
          {messages.map((m) => {
            const mine = currentUser && m.user === currentUser;
            return (
              <li key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-lg border px-3 py-2 shadow-sm animate-in fade-in-50",
                    mine
                      ? "bg-primary text-primary-foreground border-primary/40"
                      : "bg-muted text-foreground border-border"
                  )}
                  aria-label={`${m.user} said ${m.message}`}
                >
                  <div className="text-xs opacity-80 mb-1">
                    {m.user} • {format(new Date(m.timestamp), "HH:mm")}
                  </div>
                  <div className="text-sm leading-relaxed">{m.message}</div>
                </div>
              </li>
            );
          })}
        </ul>
        <div ref={endRef} />
      </ScrollArea>
    </Card>
  );
}
