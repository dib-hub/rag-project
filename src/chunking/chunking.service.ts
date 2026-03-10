import { Injectable } from "@nestjs/common";

export interface TextChunk {
  text: string;
  chunkIndex: number;
}

@Injectable()
export class ChunkingService {
  private readonly chunkSize = 600;
  private readonly chunkOverlap = 150;

  chunk(text: string): TextChunk[] {
    const chunks: TextChunk[] = [];
    let start = 0;
    let index = 0;

    while (start < text.length) {
      const end = Math.min(start + this.chunkSize, text.length);
      const chunkText = text.slice(start, end).trim();

      if (chunkText.length > 0) {
        chunks.push({ text: chunkText, chunkIndex: index++ });
      }

      if (end === text.length) break;
      start += this.chunkSize - this.chunkOverlap;
    }

    return chunks;
  }
}
