import axios from "axios";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

const API_URL = "https://ipam-chatbot.vercel.app/chat";

export const sendQuestion = async (
  question: string,
  history: Message[]
): Promise<string> => {
  const response = await axios.post(API_URL, {
    question,
    use_chat_history: true,
    history,
  });
  return response.data.response;
};