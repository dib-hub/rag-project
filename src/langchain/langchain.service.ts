import { Injectable } from "@nestjs/common";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

@Injectable()
export class LangchainService {
  getEmbeddings() {
    return new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY,
      model: "text-embedding-3-small",
    });
  }

  getLLM() {
    return new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini",
    });
  }
}
