import { Chat } from "@/components/chat/Chat";

const Index = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <section className="container py-10">
        <h1 className="sr-only">Real-time AI Chat Dashboard</h1>
        <div className="mx-auto max-w-3xl">
          <Chat />
        </div>
      </section>
    </main>
  );
};

export default Index;
