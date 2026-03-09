import { Injectable } from '@nestjs/common';
import { OpenAIService } from '../openai/openai.service';

@Injectable()
export class EmbeddingService {

  constructor(private openaiService: OpenAIService) {}

  async createEmbedding(text: string): Promise<number[]> {

    const embedding = await this.openaiService.createEmbedding(text);

    return embedding;
  }

}