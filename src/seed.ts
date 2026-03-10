import "dotenv/config";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { IngestionService } from "./ingestion/ingestion.service";

// Keep compatibility with both pdf-parse v1 (callable) and v2 (PDFParse class)
const pdfParseModule = require("pdf-parse");

type SeedDocument = {
  id: string;
  text: string;
};

async function extractPdfText(fileBuffer: Buffer): Promise<string> {
  if (typeof pdfParseModule === "function") {
    const parsed = await pdfParseModule(fileBuffer);
    return parsed?.text ?? "";
  }

  if (typeof pdfParseModule?.PDFParse === "function") {
    const parser = new pdfParseModule.PDFParse({ data: fileBuffer });
    try {
      const parsed = await parser.getText();
      return parsed?.text ?? "";
    } finally {
      await parser.destroy();
    }
  }

  throw new Error("Unsupported pdf-parse API shape.");
}

async function loadSeedDocuments(): Promise<SeedDocument[]> {
  const filePath = process.env.SEED_DOCS_PATH || "data/docs.json";
  const raw = await readFile(filePath, "utf-8");
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("Seed file must contain an array of documents.");
  }

  const docs = parsed.filter((item): item is SeedDocument => {
    return (
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      "text" in item &&
      typeof (item as { id: unknown }).id === "string" &&
      typeof (item as { text: unknown }).text === "string"
    );
  });

  if (docs.length !== parsed.length) {
    throw new Error(
      "Every seed document must include string fields: id and text.",
    );
  }

  return docs;
}

async function loadPdfDocuments(): Promise<SeedDocument[]> {
  const pdfDir = process.env.SEED_PDFS_PATH || "data/pdfs";
  const docs: SeedDocument[] = [];

  try {
    const files = await readdir(pdfDir);
    const pdfFiles = files.filter((f) => f.toLowerCase().endsWith(".pdf"));

    for (const file of pdfFiles) {
      const filePath = join(pdfDir, file);
      const fileBuffer = await readFile(filePath);
      const id = file.replace(/\.pdf$/i, "");
      const text = await extractPdfText(fileBuffer);

      if (text.trim()) {
        docs.push({ id, text });
        console.log(`Loaded PDF: ${file}`);
      }
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      console.log(`PDF directory not found: ${pdfDir}. Skipping PDFs.`);
    } else {
      throw err;
    }
  }

  return docs;
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const ingestion = app.get(IngestionService);

  try {
    const jsonDocs = await loadSeedDocuments();
    const pdfDocs = await loadPdfDocuments();
    const allDocs = [...jsonDocs, ...pdfDocs];

    console.log(`Starting seed process for ${allDocs.length} documents...`);

    for (const doc of allDocs) {
      await ingestion.insertDocument(doc.id, doc.text);
      console.log(`✓ Seeded: ${doc.id}`);
    }

    console.log(`\nSeed complete. Inserted ${allDocs.length} documents.`);
  } finally {
    await app.close();
  }
}

bootstrap();
