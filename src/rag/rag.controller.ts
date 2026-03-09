import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { RagService } from './rag.service';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('ask')
  async ask(@Body('question') question: string) {
    if (typeof question !== 'string' || !question.trim()) {
      throw new BadRequestException('`question` must be a non-empty string.');
    }

    const normalizedQuestion = question.trim();
    const answer = await this.ragService.ask(normalizedQuestion);

    return {
      question: normalizedQuestion,
      answer,
    };
  }
}