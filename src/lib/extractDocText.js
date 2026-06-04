import { base44 } from "@/api/base44Client";

// Document file extensions whose text we extract at upload time so agents can
// always "read" them — including Word (.doc/.docx), which agent runtimes and
// ExtractDataFromUploadedFile do NOT natively parse.
const DOC_EXTENSIONS = ["doc", "docx", "pdf", "txt", "rtf", "md", "csv", "json", "xls", "xlsx", "pptx", "ppt"];

const extOf = (name = "") => name.split(".").pop().toLowerCase();

export const isDocFile = (name = "") => DOC_EXTENSIONS.includes(extOf(name));

/**
 * Extract readable text from an uploaded document via the LLM (which can read
 * Word, PDF, etc.). Returns a plain-text string, or "" if extraction fails.
 */
export async function extractDocText(fileUrl, fileName = "document") {
  try {
    const text = await base44.integrations.Core.InvokeLLM({
      prompt:
        `Extract and return the COMPLETE raw text content of the attached document "${fileName}". ` +
        `Preserve headings, lists, tables (as readable text), and ordering. ` +
        `Do not summarize, omit, or add commentary — output only the document's text content verbatim.`,
      file_urls: [fileUrl],
    });
    return typeof text === "string" ? text.trim() : "";
  } catch {
    return "";
  }
}

/**
 * Given uploaded files [{ name, url }], extract text from each document file
 * and return a single formatted block to append to the agent message so the
 * agent reliably reads the contents (especially Word docs).
 */
export async function buildDocContext(files = []) {
  const docs = files.filter((f) => isDocFile(f.name));
  if (docs.length === 0) return "";
  const blocks = [];
  for (const f of docs) {
    const text = await extractDocText(f.url, f.name);
    if (text) blocks.push(`--- Content of "${f.name}" ---\n${text}`);
  }
  if (blocks.length === 0) return "";
  return `\n\n[Extracted document contents below — read these]\n${blocks.join("\n\n")}`;
}