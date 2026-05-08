import path from "node:path";

import mammoth from "mammoth";
import { PdfReader } from "pdfreader";

function normalizeResumeText(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/[ \u00a0]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractPdfTextWithPdfReader(fileBuffer: Buffer) {
  return new Promise<string>((resolve, reject) => {
    const lines: string[] = [];

    new PdfReader().parseBuffer(fileBuffer, (error, item) => {
      if (error) {
        reject(error);
        return;
      }

      if (!item) {
        resolve(normalizeResumeText(lines.join("\n")));
        return;
      }

      if ("text" in item && item.text) {
        lines.push(item.text);
      }
    });
  });
}

async function extractPdfTextWithPdfParse(fileBuffer: Buffer) {
  const runtimeGlobal = globalThis as Record<string, unknown>;

  runtimeGlobal.DOMMatrix ??= class DOMMatrix {};
  runtimeGlobal.ImageData ??= class ImageData {};
  runtimeGlobal.Path2D ??= class Path2D {};

  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: fileBuffer });

  try {
    const result = await parser.getText();
    return normalizeResumeText(result.text);
  } finally {
    await parser.destroy();
  }
}

async function extractPdfText(fileBuffer: Buffer) {
  const primaryText = await extractPdfTextWithPdfReader(fileBuffer);

  if (primaryText.length >= 200) {
    return primaryText;
  }

  return extractPdfTextWithPdfParse(fileBuffer);
}

export async function extractResumeText(fileBuffer: Buffer, fileName: string, mimeType: string) {
  const extension = path.extname(fileName).toLowerCase();

  if (mimeType === "application/pdf" || extension === ".pdf") {
    return extractPdfText(fileBuffer);
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
