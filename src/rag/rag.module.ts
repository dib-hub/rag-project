import { Module } from "@nestjs/common";
import { RagController } from "./rag.controller";
import { RagService } from "./rag.service";
import { PineconeService } from "../pinecone/pinecone.service";
import { LangchainService } from "../langchain/langchain.service";
import { IngestionService } from "../ingestion/ingestion.service";
import { OpenAIService } from "../openai/openai.service";
import { EmbeddingService } from "../embedding/embedding.service";
import { ChunkingService } from "../chunking/chunking.service";

@Module({
  controllers: [RagController],
  providers: [
    RagService,
    PineconeService,
    LangchainService,
    IngestionService,
    OpenAIService,
    EmbeddingService,
    ChunkingService,
  ],
})
export class RagModule {}
