import axios from "axios";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

const API_URL = "http://127.0.0.1:8000/chat";
// const API_URL = "https://ipam-chatbot.vercel.app/chat";


export const sendQuestion = async (
  question: string,
  options: { responseType?: "json" | "blob" } = {}
): Promise<any> => {
  const response = await axios.post(
    API_URL,
    { question }, // Only send the current question
    { responseType: options.responseType || "json" }
  );

  return response.data?.response || response.data;
};

// export const sendQuestion = async (
//   question: string,
//   options: { responseType?: "json" | "blob" } = {},
//   history: Message[] = []
// ): Promise<any> => {
//   const response = await axios.post(
//     API_URL,
//     { messages: [...history, { role: "user", content: question }] },
//     { responseType: options.responseType || "json" }
//   );

//   return response.data?.response || response.data;
// };

