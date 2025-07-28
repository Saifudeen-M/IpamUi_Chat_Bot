import { useState } from "react";
import { sendQuestion } from "../services/api";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function ContentComponents() {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!question.trim()) return;
    setQuestion("");
    const updatedHistory: Message[] = [
      ...history,
      { role: "user", content: question },
    ];
    setHistory(updatedHistory);
    setLoading(true);

    try {
      const response = await sendQuestion(question, updatedHistory);
      setHistory([...updatedHistory, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("Error sending question:", error);
      setHistory([
        ...updatedHistory,
        {
          role: "assistant",
          content: "❌ Something went wrong. Please try again.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[280px_1fr] bg-gradient-to-b from-slate-50 to-white">
      {/* Sidebar */}
      <aside className="bg-indigo-700 text-white px-6 py-10 flex flex-col gap-6 items-center shadow-lg">
        <div className="text-5xl">🤖</div>
        <h1 className="text-3xl font-bold tracking-wide">Genz</h1>
        <p className="text-indigo-200 text-sm text-center">
          Your intelligent book <br /> chat assistant
        </p>
        <div className="mt-10 space-y-2 text-sm text-indigo-300 text-center">
          <p>📚 Book search</p>
          <p>🎯 Precise answers</p>
          <p>💬 Chat context-aware</p>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex flex-col items-center py-10 px-6">
        <div className="w-full max-w-5xl h-[90vh] bg-white rounded-xl shadow-lg p-6 flex flex-col">
          <h2 className="text-2xl font-bold text-indigo-700 text-center mb-6">
            🤖 Welcome to Genz
          </h2>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto space-y-5 border border-indigo-100 p-5 rounded-md bg-indigo-50 mb-6 scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-indigo-100">
            {history.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-xl whitespace-pre-wrap text-sm leading-relaxed shadow ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-white text-gray-900 border border-indigo-200 rounded-bl-none"
                  }`}
                >
                  <div className="font-semibold text-xs mb-1 opacity-80">
                    {msg.role === "user" ? "👤 You" : "🤖 BookBot"}
                  </div>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-indigo-600 border border-indigo-200 px-4 py-2 rounded-xl text-sm shadow italic animate-pulse">
                  🤖 Genz is thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="flex items-center border border-indigo-300 rounded-xl overflow-hidden">
            <input
              type="text"
              className="flex-1 px-4 py-3 focus:outline-none text-sm"
              placeholder="Type your question about books..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="px-5 py-3 text-xl hover:scale-105 transition-transform disabled:opacity-30"
              aria-label="Send message"
            >
              🚀
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ContentComponents;