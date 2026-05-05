import path from "node:path";

import mammoth from "mammoth";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";

GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();

function normalizeResumeText(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/[ \u00a0]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractPdfText(fileBuffer: Buffer) {
  const pdf = await getDocument({
    data: new Uint8Array(fileBuffer),
    useWorkerFetch: false,
    useSystemFonts: true,
  }).promise;

  const pageTexts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .trim();

    if (pageText) {
      pageTexts.push(pageText);
    }
  }

  return normalizeResumeText(pageTexts.join("\n\n"));
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
