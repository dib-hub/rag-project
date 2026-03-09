import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {

  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  async createEmbedding(text: string) {
    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text
    });

    return response.data[0].embedding;
  }

  async askLLM(prompt: string) {

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: prompt }
      ]
    });

    return completion.choices[0].message.content;
  }
}