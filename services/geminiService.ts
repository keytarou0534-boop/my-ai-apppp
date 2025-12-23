
import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSmartReply = async (messages: Message[]): Promise<string> => {
  try {
    const recentMessages = messages.slice(-5).map(m => `${m.senderName}: ${m.text || '[Image]'}`).join('\n');
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `あなたは顧客対応のプロフェッショナルな管理者です。以下のチャット履歴に基づいて、簡潔で親切な返信の提案を1つだけ作成してください。返信のみを出力してください。\n\nチャット履歴:\n${recentMessages}`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 200,
      }
    });

    return response.text || "返信を生成できませんでした。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AIアシスタントに接続できません。";
  }
};

export const summarizeChat = async (messages: Message[]): Promise<string> => {
  try {
    const chatLog = messages.map(m => `${m.senderName}: ${m.text || '[Image]'}`).join('\n');
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `以下のチャット内容を3行程度で要約してください。\n\n${chatLog}`,
      config: {
        temperature: 0.5,
      }
    });

    return response.text || "要約を生成できませんでした。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "要約の生成に失敗しました。";
  }
};
