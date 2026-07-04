// Hardwired model catalog for the ExpertMind extraction console.
// tier drives the Fast Path / Deep Path grouping in the switcher.
// These ids map 1:1 to the InvokeLLM `model` param.
export const EM_MODELS = [
  { id: "automatic", label: "Automatic", tier: "auto", note: "Platform default routing" },
  { id: "gemini_3_flash", label: "Gemini 3 Flash", tier: "fast", note: "Metabolism · sub-second" },
  { id: "gpt_5_mini", label: "GPT-5 Mini", tier: "fast", note: "Fast, low cost" },
  { id: "gpt_5_4", label: "GPT-5.4", tier: "fast", note: "Balanced" },
  { id: "gpt_5_5", label: "GPT-5.5", tier: "deep", note: "Frontier reasoning" },
  { id: "gemini_3_1_pro", label: "Gemini 3.1 Pro", tier: "deep", note: "Frontier · web-capable" },
  { id: "claude_sonnet_4_6", label: "Claude Sonnet 4.6", tier: "deep", note: "Forensic precision" },
  { id: "claude_opus_4_6", label: "Claude Opus 4.6", tier: "deep", note: "Deep reasoning" },
  { id: "claude_opus_4_7", label: "Claude Opus 4.7", tier: "deep", note: "Deep reasoning" },
  { id: "claude_opus_4_8", label: "Claude Opus 4.8", tier: "deep", note: "Apex reasoning" },
];

export const DEFAULT_MODEL = "gemini_3_flash";