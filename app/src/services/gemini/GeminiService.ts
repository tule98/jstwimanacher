import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export class GeminiService {
  private model: string;

  constructor(model: string = "gemini-2.5-flash") {
    this.model = model;
  }

  /**
   * Generate content using Gemini API
   * @param prompt The prompt to send to the model
   * @returns The generated text response
   */
  async generateContent(prompt: string): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    try {
      const response = await genAI.models.generateContent({
        model: this.model,
        contents: prompt,
      });

      const text = response.text || "";
      return text;
    } catch (error) {
      console.error("Gemini API error:", error);
      throw error;
    }
  }

  /**
   * Generate JSON content and parse it
   * @param prompt The prompt that should return JSON
   * @returns Parsed JSON object
   */
  async generateJSON<T>(prompt: string): Promise<T> {
    const text = await this.generateContent(prompt);

    // Remove markdown code blocks if present
    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    return JSON.parse(cleanedText) as T;
  }

  /**
   * Generate plain text content
   * @param prompt The prompt to send
   * @returns Plain text response
   */
  async generateText(prompt: string): Promise<string> {
    return this.generateContent(prompt);
  }
}

// Export singleton instance with default model
export const geminiService = new GeminiService("gemini-2.5-flash");
