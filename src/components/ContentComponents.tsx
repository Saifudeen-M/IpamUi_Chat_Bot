import { useState, useRef, useEffect, useCallback } from "react";
import { sendMessage } from "../services/api";

interface Message {
  text: string;
  sender: "user" | "bot";
}

function ContentComponents() {
  const [userMessage, setUserMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!userMessage.trim()) return;

    const userMsg: Message = { text: userMessage, sender: "user" };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setUserMessage("");

    const formattedHistory = updatedMessages.map((msg) => ({
      role: msg.sender,
      content: msg.text,
    }));

    try {
      const response = await sendMessage(userMessage, true, formattedHistory);
      const botMsg: Message = { text: response, sender: "bot" };
      setMessages((prevMessages) => [...prevMessages, botMsg]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMsg: Message = { text: "Error: Unable to get response.", sender: "bot" };
      setMessages((prevMessages) => [...prevMessages, errorMsg]);
    }
  }, [userMessage, messages]);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r p-6 shadow hidden md:flex flex-col justify-between">
        <div>
          <div className="mb-6 flex items-center gap-2 text-xl font-bold text-blue-600">
            <span className="text-3xl">📡</span>
            <span>IPChat Console</span>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-1">Search Service</label>
            <select className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50">
              <option>BOOKS_DATASET_SERVICE</option>
            </select>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Session Settings</h3>
            <div className="bg-gray-100 p-3 rounded text-sm space-y-1 shadow-sm">
              <div>🚀 Streamapp team</div>
              <div>🐞 Debug mode</div>
              <div>🔍 Tracing enabled</div>
            </div>
          </div>
        </div>

        <footer className="text-xs text-gray-400 text-center mt-8">
          © 2025 IPChat
        </footer>
      </aside>

      {/* Main Chat */}
      <main className="flex-1 flex flex-col p-4 md:p-6">
        <header className="mb-4 text-2xl font-semibold text-blue-700">
          👋 Welcome to IPChat
        </header>

        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-white via-gray-100 to-gray-200 rounded-xl border p-4 shadow-inner">
          {messages.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6 animate-fadeIn">
              Start chatting to see responses...
            </p>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-2 transition duration-300 ease-in-out ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender === "bot" && (
                    <span className="inline-block h-8 w-8 bg-gray-300 rounded-full text-center leading-8">
                      🤖
                    </span>
                  )}
                  <div
                    className={`p-3 rounded-lg max-w-sm shadow ${
                      msg.sender === "bot"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.sender === "user" && (
                    <span className="inline-block h-8 w-8 bg-blue-600 text-white rounded-full text-center leading-8">
                      🧑
                    </span>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input field with emoji inside */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="mt-4 flex items-center bg-white border rounded-lg shadow px-3 py-2 focus-within:ring-2 focus-within:ring-blue-600"
        >
          <input
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 text-sm p-2 focus:outline-none"
          />
          <button
            type="submit"
            title="Send"
            className="text-xl cursor-pointer hover:scale-110 transition"
          >
            🚀
          </button>
        </form>
      </main>
    </div>
  );
}

export default ContentComponents;
