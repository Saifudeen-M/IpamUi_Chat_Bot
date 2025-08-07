import { useState } from "react";
import { sendQuestion } from "../services/api";
import { Copy, Upload, Mic, MicOff } from "lucide-react";
import clsx from "clsx";

type Message = {
  role: "user" | "assistant";
  content: string | any[] | FormattedMessage;
};

type FormattedMessage = {
  type: "text" | "table";
  data: string | any[];
};

function ContentComponents() {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceLang, setVoiceLang] = useState("en-IN");
  const [copied, setCopied] = useState<number | null>(null);



  const isExcelRequest = (q: string) =>
    /\b(download|excel|export|\.xlsx)\b/i.test(q);

  const getSuggestedFilename = (q: string) => {
    const match = q.match(/(?:download|export).*(ipv[46]|username|port|useragent)/i);
    return `${match?.[1]?.toLowerCase() || "ip-data"}-data.csv`;
  };

  const handleSend = async (msgText?: string) => {
    const q = msgText ?? question.trim();
    if (!q) return;

    setQuestion("");
    setTranscript("");
    setLoading(true);
    const updatedHistory = [...history, { role: "user", content: q } as Message];
    setHistory(updatedHistory);

    try {
      const excelMode = isExcelRequest(q);
      const response = await sendQuestion(q, { responseType: excelMode ? "blob" : "json" });

      if (excelMode && response instanceof Blob) {
        const url = URL.createObjectURL(new Blob([response]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", getSuggestedFilename(q));
        document.body.appendChild(link);
        link.click();
        link.remove();

        setHistory([
          ...updatedHistory,
          {
            role: "assistant",
            content: "📁 Your Excel file has been downloaded successfully!",
          } as Message,
        ]);
      } else {
        const formatted: FormattedMessage = Array.isArray(response) && response.length
          ? { type: "table", data: response }
          : { type: "text", data: typeof response === "string" ? response : "No results found." };

        setHistory([...updatedHistory, { role: "assistant", content: formatted } as Message]);
      }
    } catch {
      setHistory([...updatedHistory, {
        role: "assistant",
        content: "❌ Something went wrong. Please try again.",
      } as Message]);
    }

    setLoading(false);
  };

  const handleVoice = () => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = voiceLang;
    recognition.interimResults = false;
    recognition.continuous = false;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const spoken = event.results[0][0].transcript;
      setTranscript(spoken);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
  };

  const handleCancelVoice = () => {
    setTranscript("");
    setIsListening(false);
  };

  const handleCopy = (msg: Message, index: number) => {
    let textToCopy = "";

    if (typeof msg.content === "string") {
      textToCopy = msg.content;
    } else if (
      typeof msg.content === "object" &&
      !Array.isArray(msg.content) &&
      msg.content.type === "text" &&
      typeof msg.content.data === "string"
    ) {
      textToCopy = msg.content.data;
    }

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(index);
      setTimeout(() => setCopied(null), 500);
    }
  };




  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-[280px] bg-indigo-700 text-white px-6 py-10 flex flex-col gap-6 items-center shadow-lg">
        <div className="text-5xl">🤖</div>
        <h1 className="text-3xl font-bold">Genz</h1>
        <p className="text-indigo-200 text-sm text-center">Your smart IP log assistant</p>
        <select
          value={voiceLang}
          onChange={(e) => setVoiceLang(e.target.value)}
          className="mt-4 bg-white text-black p-2 rounded text-sm"
        >
          <option value="en-IN">English (India)</option>
          <option value="hi-IN">Hindi</option>
          <option value="ta-IN">Tamil</option>
          <option value="te-IN">Telugu</option>
          <option value="bn-IN">Bengali</option>
        </select>
      </aside>

      {/* Main section */}
      <section className="flex-1 px-4 py-6 max-w-7xl mx-auto flex flex-col h-screen">
        <h2 className="text-2xl font-bold text-indigo-700 text-center mb-4">🤖 Welcome to Genz</h2>
        <div className="flex-1 overflow-y-auto border border-indigo-100 p-4 rounded-md bg-indigo-50 mb-4">
          {history.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-3`}>
              <div className={clsx(
                "relative max-w-[90%] px-4 py-3 rounded-xl text-sm shadow whitespace-pre-wrap",
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : "bg-white text-gray-900 border border-indigo-200 rounded-bl-none"
              )}>
                <div className="font-semibold text-xs mb-1 opacity-80">
                  {msg.role === "user" ? "👤 You" : "🤖 Genz"}
                </div>

                <div className="overflow-x-auto">
                  {(() => {
                    const c = msg.content;
                    if (typeof c === "string") return c;
                    if (Array.isArray(c)) return "🔗 Table data not formatted";
                    if (typeof c === "object" && c.type === "text") return c.data;
                    if (c.type === "table" && Array.isArray(c.data)) {
                      return (
                        <table className="table-auto w-full text-xs border border-indigo-200">
                          <thead className="bg-indigo-100">
                            <tr>{Object.keys(c.data[0]).map(k => (
                              <th key={k} className="border px-2 py-1">{k}</th>
                            ))}</tr>
                          </thead>
                          <tbody>
                            {c.data.map((row, i) => (
                              <tr key={i} className="odd:bg-white even:bg-indigo-50">
                                {Object.values(row).map((val, j) => (
                                  <td key={j} className="border px-2 py-1 break-all max-w-[150px]">{String(val)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      );
                    }
                    return <em>Unsupported content</em>;
                  })()}
                </div>

                {/* Copy icon for both roles */}
                <div className="absolute top-2 right-2">
                  <div className="relative">
                    <Copy
                      size={14}
                      className="text-gray-500 cursor-pointer hover:text-black transition-colors"
                      onClick={() => handleCopy(msg, i)}
                    />
                    {copied === i && (
                      <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded shadow">
                        Copied!
                      </span>
                    )}
                  </div>
                </div>


              </div>
            </div>
          ))}

          {loading && (
            <div className="text-indigo-700 italic animate-pulse">🤖 Genz is thinking...</div>
          )}
        </div>

        {/* Input bar */}
        <div className="flex items-center gap-2 border border-indigo-300 rounded-xl px-3 py-2">
          <input
            type="text"
            className="flex-1 px-2 py-2 focus:outline-none text-sm"
            placeholder="Ask a question about IP logs..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            className="cursor-pointer text-xl hover:scale-110 transition-transform"
            disabled={loading}
          >
            <Upload size={20} />
          </button>

          <button
            onClick={handleVoice}
            disabled={loading}
            title="Voice input"
            className="cursor-pointer text-xl hover:scale-110 transition-transform"
          >
            {isListening ? <Mic size={20} className="text-red-600 animate-pulse" /> : <MicOff size={20} />}
          </button>
        </div>

        {/* Voice transcript section */}
        {transcript && (
          <div className="mt-3 flex items-center gap-2 text-sm bg-indigo-100 p-2 rounded">
            <span className="font-medium text-indigo-800">🎧 Recognized:</span>
            <span className="flex-1 italic text-gray-800">{transcript}</span>
            <button onClick={() => handleSend(transcript)} className="cursor-pointer text-green-600 font-bold">✅ Send</button>
            <button onClick={handleCancelVoice} className="cursor-pointer text-red-600 font-bold">❌ Cancel</button>
          </div>
        )}
      </section>
    </main>
  );
}

export default ContentComponents;
