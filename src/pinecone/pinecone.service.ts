import { Injectable } from '@nestjs/common';
import { Pinecone, Index } from '@pinecone-database/pinecone';

@Injectable()
export class PineconeService {

  private pinecone: Pinecone;
  private index: Index;

  constructor() {

    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    this.index = this.pinecone.index(
      process.env.PINECONE_INDEX!
    );
  }

  getIndex() {
    return this.index;
  }
}