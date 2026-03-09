import { Injectable } from "@nestjs/common";
import { PineconeStore } from "@langchain/pinecone";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { Document } from "@langchain/core/documents";
import { PineconeService } from "../pinecone/pinecone.service";
import { LangchainService } from "../langchain/langchain.service";

@Injectable()
export class RagService {

  constructor(
    private pineconeService: PineconeService,
    private langchainService: LangchainService
  ) {}

  async ask(question: string) {

    const embeddings = this.langchainService.getEmbeddings();
    const llm = this.langchainService.getLLM();

    const vectorStore = await PineconeStore.fromExistingIndex(
      embeddings,
      {
        pineconeIndex: this.pineconeService.getIndex(),
      }
    );

    const retriever = vectorStore.asRetriever();

    // Create a prompt template
    const prompt = ChatPromptTemplate.fromTemplate(
      `Answer the question based only on the following context:
{context}

Question: {question}`
    );

    // Create the RAG chain using LCEL
    const ragChain = RunnableSequence.from([
      {
        context: async (input: { question: string }) => {
          const docs = await retriever.invoke(input.question);
          return docs.map((doc: Document) => doc.pageContent).join("\n\n");
        },
        question: (input: { question: string }) => input.question,
      },
      prompt,
      llm,
      new StringOutputParser(),
    ]);

    const result = await ragChain.invoke({
      question,
    });

    return result;
  }
}