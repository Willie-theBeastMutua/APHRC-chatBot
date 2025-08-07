interface TypingIndicatorProps {
  user?: string | null;
}

export function TypingIndicator({ user }: TypingIndicatorProps) {
  if (!user) return null;
  return (
    <div
      className="mt-2 text-xs text-muted-foreground px-2 select-none"
      role="status"
      aria-live="polite"
    >
      {user} is typing...
    </div>
  );
}
