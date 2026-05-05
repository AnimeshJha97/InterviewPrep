import path from "node:path";

import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

function normalizeResumeText(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/[ \u00a0]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractResumeText(fileBuffer: Buffer, fileName: string, mimeType: string) {
  const extension = path.extname(fileName).toLowerCase();

  if (mimeType === "application/pdf" || extension === ".pdf") {
    const parser = new PDFParse({ data: fileBuffer });
    const result = await parser.getText();
    await parser.destroy();
    return normalizeResumeText(result.text);
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    extension === ".docx"
  ) {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return normalizeResumeText(result.value);
  }

  throw new Error("Unsupported resume format. Please upload a PDF or DOCX file.");
}
