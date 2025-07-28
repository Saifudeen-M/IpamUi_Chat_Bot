import axios from "axios";

const API_BASE_URL = "https://ipam-chatbot.vercel.app";

export const sendMessage = async (
  message: string,
  useChatHistory: boolean = true,
  history: Array<{ role: string; content: string }> = []
): Promise<string> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat`, {
      question: message,
      use_chat_history: useChatHistory,
      history: history,
    });
    return response.data.response;
  } catch (error) {
    console.error("API error:", error);
    return "Server error. Please try again later.";
  }
};

