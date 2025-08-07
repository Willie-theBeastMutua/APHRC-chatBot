export type ChatMessage = {
  id: number | string;
  user: string;
  message: string;
  timestamp: string; // ISO string
};

export type IncomingSocketEvent =
  | { type: "message"; data: ChatMessage }
  | { type: "typing"; data: { user: string } };
