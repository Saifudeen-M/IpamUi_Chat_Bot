import axios from "axios";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

const API_URL = "http://127.0.0.1:8001/chat";

export const sendQuestion = async (
  question: string
): Promise<string | Record<string, any>[]> => {
  const response = await axios.post(API_URL, { question });
  return response.data.response;
};
