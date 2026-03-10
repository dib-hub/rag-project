import { Injectable } from "@nestjs/common";
import { PineconeService } from "../pinecone/pinecone.service";
import { OpenAIService } from "../openai/openai.service";
import { ChunkingService } from "../chunking/chunking.service";

const UPSERT_BATCH_SIZE = 100;

@Injectable()
export class IngestionService {
  constructor(
    private pineconeService: PineconeService,
    private openaiService: OpenAIService,
    private chunkingService: ChunkingService,
  ) {}

  async insertDocument(id: string, text: string) {
    const chunks = this.chunkingService.chunk(text);
    const index = this.pineconeService.getIndex();

    // Embed all chunks in parallel
    const embeddings = await Promise.all(
      chunks.map((chunk) => this.openaiService.createEmbedding(chunk.text)),
    );

    const vectors = chunks.map((chunk, i) => ({
      id: `${id}-${chunk.chunkIndex}`,
      values: embeddings[i],
      metadata: {
        text: chunk.text,
        sourceId: id,
        chunkIndex: chunk.chunkIndex,
      },
    }));

    // Upsert in batches of 100 (Pinecone max per request)
    for (let i = 0; i < vectors.length; i += UPSERT_BATCH_SIZE) {
      await index.upsert(vectors.slice(i, i + UPSERT_BATCH_SIZE));
    }

    return { message: "Document inserted", chunks: vectors.length };
  }
}
