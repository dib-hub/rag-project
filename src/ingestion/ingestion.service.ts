import { Injectable } from '@nestjs/common';
import { PineconeService } from '../pinecone/pinecone.service';
import { OpenAIService } from '../openai/openai.service';

@Injectable()
export class IngestionService {

  constructor(
    private pineconeService: PineconeService,
    private openaiService: OpenAIService
  ) {}

  async insertDocument(id: string, text: string) {

    const embedding = await this.openaiService.createEmbedding(text);

    const index = this.pineconeService.getIndex();

    await index.upsert([
      {
        id,
        values: embedding,
        metadata: { text }
      }
    ]);

    return { message: "Document inserted" };
  }
}