import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { unzip } from 'npm:fflate@0.8.2';

// Parse a .docx (which is a ZIP of XML) into plain text, server-side. This
// avoids the platform limitation where .docx is served as a protected binary
// that browser/LLM readers can't parse.
function unzipAsync(uint8) {
  return new Promise((resolve, reject) => {
    unzip(uint8, (err, files) => (err ? reject(err) : resolve(files)));
  });
}

function xmlToText(xml) {
  return xml
    // paragraph + line breaks → newlines
    .replace(/<\/w:p>/g, "\n")
    .replace(/<w:br\s*\/>/g, "\n")
    .replace(/<w:tab\s*\/>/g, "\t")
    // strip all remaining tags
    .replace(/<[^>]+>/g, "")
    // decode common XML entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractDocx(fileUrl) {
  const res = await fetch(fileUrl);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  const files = await unzipAsync(buf);
  const decoder = new TextDecoder("utf-8");

  // Main body + headers/footers, in order.
  const parts = [];
  const mainKey = "word/document.xml";
  if (files[mainKey]) parts.push(decoder.decode(files[mainKey]));
  Object.keys(files)
    .filter((k) => /^word\/(header|footer)\d*\.xml$/.test(k))
    .sort()
    .forEach((k) => parts.push(decoder.decode(files[k])));

  if (parts.length === 0) throw new Error("No document.xml found in .docx");
  return parts.map(xmlToText).filter(Boolean).join("\n\n");
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url, file_name = "document" } = await req.json();
    if (!file_url) {
      return Response.json({ error: 'file_url is required' }, { status: 400 });
    }

    const ext = (file_name.split(".").pop() || "").toLowerCase();

    let text = "";
    if (ext === "docx") {
      text = await extractDocx(file_url);
    } else {
      // For non-docx (pdf, txt, etc.) let the LLM read it — those formats are
      // readable via file_urls; only .docx hits the binary limitation.
      const llmText = await base44.integrations.Core.InvokeLLM({
        prompt:
          `Extract and return the COMPLETE raw text content of the attached document "${file_name}". ` +
          `Preserve headings, lists, and ordering. Output only the verbatim text content, no commentary.`,
        file_urls: [file_url],
      });
      text = typeof llmText === "string" ? llmText.trim() : "";
    }

    return Response.json({ text });
  } catch (error) {
    console.error("extractDocumentText error:", error?.message || error);
    return Response.json({ error: error?.message || "Extraction failed", text: "" }, { status: 200 });
  }
});