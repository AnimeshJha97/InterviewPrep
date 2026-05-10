import path from "node:path";

import mammoth from "mammoth";
import { PdfReader } from "pdfreader";

import { logger } from "@/lib/logger";

function normalizeResumeText(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/[ \u00a0]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractPdfTextWithPdfReader(fileBuffer: Buffer, requestId?: string) {
  return new Promise<string>((resolve, reject) => {
    const lines: string[] = [];

    new PdfReader().parseBuffer(fileBuffer, (error, item) => {
      if (error) {
        logger.required.error("resume.parser.pdfreader_failed", { requestId, error });
        reject(error);
        return;
      }

      if (!item) {
        const text = normalizeResumeText(lines.join("\n"));
        logger.temporary.info("resume.parser.pdfreader_completed", {
          requestId,
          extractedCharacters: text.length,
        });
        resolve(text);
        return;
      }

      if ("text" in item && item.text) {
        lines.push(item.text);
      }
    });
  });
}

async function extractPdfTextWithPdfParse(fileBuffer: Buffer, requestId?: string) {
  const runtimeGlobal = globalThis as Record<string, unknown>;

  runtimeGlobal.DOMMatrix ??= class DOMMatrix {};
  runtimeGlobal.ImageData ??= class ImageData {};
  runtimeGlobal.Path2D ??= class Path2D {};

  logger.required.info("resume.parser.pdfparse_fallback_started", { requestId });

  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: fileBuffer });

  try {
    const result = await parser.getText();
    const text = normalizeResumeText(result.text);
    logger.required.info("resume.parser.pdfparse_fallback_completed", {
      requestId,
      extractedCharacters: text.length,
    });
    return text;
  } finally {
    await parser.destroy();
  }
}

async function extractPdfText(fileBuffer: Buffer, requestId?: string) {
  const primaryText = await extractPdfTextWithPdfReader(fileBuffer, requestId);

  if (primaryText.length >= 200) {
    logger.required.info("resume.parser.pdfreader_used", {
      requestId,
      extractedCharacters: primaryText.length,
    });
    return primaryText;
  }

  logger.required.warn("resume.parser.pdfreader_low_signal", {
    requestId,
    extractedCharacters: primaryText.length,
  });

  return extractPdfTextWithPdfParse(fileBuffer, requestId);
}

export async function extractResumeText(fileBuffer: Buffer, fileName: string, mimeType: string, requestId?: string) {
  const extension = path.extname(fileName).toLowerCase();

  if (mimeType === "application/pdf" || extension === ".pdf") {
    return extractPdfText(fileBuffer, requestId);
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    extension === ".docx"
  ) {
    logger.required.info("resume.parser.docx_started", { requestId });
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    const text = normalizeResumeText(result.value);
    logger.required.info("resume.parser.docx_completed", { requestId, extractedCharacters: text.length });
    return text;
  }

  throw new Error("Unsupported resume format. Please upload a PDF or DOCX file.");
}
