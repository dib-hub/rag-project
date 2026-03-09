import { Injectable } from '@nestjs/common';
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

@Injectable()
export class LangchainService {

  getEmbeddings() {
    return new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY
    });
  }

  getLLM() {
    return new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4o-mini"
    });
  }

}