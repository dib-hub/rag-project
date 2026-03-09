import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IngestionService } from './ingestion/ingestion.service';

async function bootstrap() {

  const app = await NestFactory.createApplicationContext(AppModule);

  const ingestion = app.get(IngestionService);

  await ingestion.insertDocument(
    "doc1",
    "Truck dispatching coordinates freight between carriers and shippers."
  );

  await ingestion.insertDocument(
    "doc2",
    "Load boards help drivers find profitable freight."
  );

  process.exit();
}

bootstrap();