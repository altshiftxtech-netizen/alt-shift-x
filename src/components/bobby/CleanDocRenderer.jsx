import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, Cell } from "recharts";

// CleanDocRenderer — renders markdown content with:
//  • GFM tables & lists (remark-gfm)
//  • Emoji stripped from all text (no emojis in BOBby documents)
//  • ```chart-bar / ```chart-pie / ```chart-line fenced blocks → recharts graphs
//  • Clean, gold-on-black styling matching the BOBby canvas.
const EMOJI_RE =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu;

function stripEmoji(text) {
  return (text || "")
    .replace(EMOJI_RE, "")
    .replace(/[^\S\n]{2,}/g, " ")   // collapse horizontal whitespace, KEEP newlines so markdown headings/lists parse
    .replace(/\n{3,}/g, "\n\n")     // cap blank-line runs
    .trim();
}

// GFM tables only parse when a blank line precedes the header row. The LLM often
// omits that blank line (text immediately followed by `| ... |`), which renders
// the pipes literally. This inserts a blank line before any table row that
// directly follows non-blank, non-table content — so tables always render.
function normalizeTables(md) {
  if (!md) return md;
  const lines = md.split("\n");
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isTable = /^\s*\|/.test(line);
    const prev = out.length ? out[out.length - 1] : null;
    const prevBlank = prev == null || prev.trim() === "";
    const prevIsTable = prev != null && /^\s*\|/.test(prev);
    if (isTable && !prevBlank && !prevIsTable) out.push(""); // separate table from preceding text
    out.push(line);
  }
  return out.join("\n");
}

// Auto-detects numeric data the agent emitted as plain lists/lines/code-fences
// and wraps it in the right chart fence so the document is always presentation-
// ready. Chart type is inferred from the nearest preceding heading:
//   share/pie/distribution/segment → chart-pie
//   trend/projection/revenue/forecast → chart-line
//   otherwise → chart-bar
function autoCharts(md) {
  if (!md) return md;
  const lines = md.split("\n");
  const out = [];
  let lastHeading = "";
  let i = 0;
  const bulletRe = /^\s*[-*]\s+(.+)$/;
  const dataRe = /^(.{1,45})[\s:·\-—|]+\s*(-?\d+(?:\.\d+)?)\s*$/;

  const chartType = (h) =>
    /share|pie|distribution|split|composition|breakdown|allocat|segment/i.test(h) ? "chart-pie"
    : /trend|projection|growth|over time|year|timeline|forecast|revenue|tcod|cost|roi/i.test(h) ? "chart-line"
    : "chart-bar";

  const emitChart = (rows) => {
    const parsed = rows.map((b) => {
      const m = b.match(/^(.+?)[\s:·\-—|]+\s*(-?\d+(?:\.\d+)?)\s*$/);
      return m ? { name: m[1].trim(), value: Number(m[2]) } : null;
    });
    if (parsed.length >= 2 && parsed.every(Boolean)) {
      out.push("```" + chartType(lastHeading));
      parsed.forEach((p) => out.push(p.name + ": " + p.value));
      out.push("```");
      return true;
    }
    return false;
  };

  while (i < lines.length) {
    const line = lines[i];
    const h = /^#{1,6}\s+(.*)$/.exec(line);
    if (h) { lastHeading = h[1].trim(); out.push(line); i++; continue; }

    // Case A: a fenced code block ``` ... ``` — convert plain data fences to charts.
    const fenceOpen = /^```\s*(\w*)\s*$/.exec(line);
    if (fenceOpen) {
      const lang = fenceOpen[1];
      const body = [];
      let j = i + 1;
      while (j < lines.length && !/^```\s*$/.test(lines[j])) { body.push(lines[j]); j++; }
      const isChart = lang === "chart-bar" || lang === "chart-pie" || lang === "chart-line";
      if (!isChart && body.length >= 2 && body.every((l) => dataRe.test(l.trim()))) {
        if (emitChart(body.map((l) => l.trim()))) { i = (j < lines.length ? j + 1 : j); continue; }
      }
      out.push(line);
      i++;
      continue;
    }

    // Case B: bullet list of "Label: number".
    if (bulletRe.test(line)) {
      const block = [];
      let j = i;
      while (j < lines.length && bulletRe.test(lines[j])) { block.push(lines[j].replace(bulletRe, "$1").trim()); j++; }
      if (emitChart(block)) { i = j; continue; }
      for (let k = i; k < j; k++) out.push(lines[k]);
      i = j;
      continue;
    }

    // Case C: isolated plain "Label: number" lines.
    if (dataRe.test(line)) {
      const prev = i > 0 ? lines[i - 1].trim() : "";
      const prevOk = prev === "" || /^#{1,6}\s+/.test(prev);
      if (prevOk) {
        const block = [];
        let j = i;
        while (j < lines.length && dataRe.test(lines[j])) { block.push(lines[j].trim()); j++; }
        const afterOk = j >= lines.length || lines[j].trim() === "";
        if (afterOk && emitChart(block)) { i = j; continue; }
      }
    }

    out.push(line);
    i++;
  }
  return out.join("\n");
}

// Parses a ```chart-* block: each line "Label: number" → a data point.
// Supports optional "Label: a, b, c" multi-value rows for line/bar grouped charts.
function parseRows(src) {
  return src
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const m = l.match(/^(.+?)[\s:·]+\s*(-?\d+(?:\.\d+)?)\s*$/);
      return m ? { name: m[1].trim(), value: Number(m[2]) } : null;
    })
    .filter(Boolean);
}

const CHART_PALETTE = ["#D4AF37", "#e6c454", "#c19a4d", "#9c7a3a", "#f0d770", "#a98a3a", "#8a6f2e"];

function ChartBar({ data }) {
  if (!data.length) return null;
  return (
    <div className="my-3 rounded-lg border border-[#D4AF37]/20 bg-black/40 p-3">
      <ResponsiveContainer width="100%" height={Math.max(140, data.length * 38)}>
        <BarChart data={data} margin={{ top: 6, right: 6, bottom: 4, left: -16 }}>
          <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 10 }} axisLine={{ stroke: "rgba(212,175,55,0.3)" }} tickLine={false} />
          <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(212,175,55,0.3)", fontSize: 11, color: "#fff" }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartPie({ data }) {
  if (!data.length) return null;
  return (
    <div className="my-3 rounded-lg border border-[#D4AF37]/20 bg-black/40 p-3">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={36} paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} stroke="#0a0a0a" strokeWidth={1.5} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(212,175,55,0.3)", fontSize: 11, color: "#fff" }} />
          <Legend wrapperStyle={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartLine({ data }) {
  if (!data.length) return null;
  return (
    <div className="my-3 rounded-lg border border-[#D4AF37]/20 bg-black/40 p-3">
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 6, right: 8, bottom: 4, left: -18 }}>
          <CartesianGrid stroke="rgba(212,175,55,0.12)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 10 }} axisLine={{ stroke: "rgba(212,175,55,0.3)" }} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 9 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(212,175,55,0.3)", fontSize: 11, color: "#fff" }} />
          <Line type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={2} dot={{ r: 3, fill: "#D4AF37" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function CleanDocRenderer({ content, className = "" }) {
  const cleaned = useMemo(() => normalizeTables(autoCharts(stripEmoji(content))), [content]);
  return (
    <div className={`text-sm text-white/75 leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Fenced code → chart-bar renders a graph, else plain code.
          code({ inline, className: cls, children, ...props }) {
            const raw = String(children || "");
            const lang = /language-([\w-]+)/.exec(cls || "")?.[1];
            if (!inline && lang === "chart-bar") {
              const data = parseRows(raw);
              if (data.length) return <ChartBar data={data} />;
            }
            if (!inline && lang === "chart-pie") {
              const data = parseRows(raw);
              if (data.length) return <ChartPie data={data} />;
            }
            if (!inline && lang === "chart-line") {
              const data = parseRows(raw);
              if (data.length) return <ChartLine data={data} />;
            }
            return (
              <code className="px-1.5 py-0.5 rounded bg-black/50 border border-[#D4AF37]/15 text-[11px] font-mono text-[#D4AF37]/90" {...props}>
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <pre className="my-2 p-3 rounded-lg bg-black/50 border border-[#D4AF37]/15 overflow-x-auto text-[11px] font-mono text-white/70">{children}</pre>;
          },
          // Tables
          table({ children }) {
            return <div className="my-3 overflow-x-auto"><table className="w-full text-xs border-collapse border border-[#D4AF37]/20">{children}</table></div>;
          },
          th({ children }) {
            return <th className="border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-1.5 text-left text-[#D4AF37] font-semibold">{children}</th>;
          },
          td({ children }) {
            return <td className="border border-[#D4AF37]/15 px-3 py-1.5 text-white/70">{children}</td>;
          },
          h1: ({ children }) => <h1 className="text-xl font-bold text-white mt-4 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold text-white mt-4 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold text-[#D4AF37] mt-3 mb-1.5">{children}</h3>,
          h4: ({ children }) => <h4 className="text-sm font-bold text-white mt-2.5 mb-1">{children}</h4>,
          h5: ({ children }) => <h5 className="text-sm font-semibold text-white/90 mt-2 mb-1">{children}</h5>,
          h6: ({ children }) => <h6 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]/70 mt-2 mb-1">{children}</h6>,
          ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1 text-white/70">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside my-2 space-y-1 text-white/70">{children}</ol>,
          a: ({ children, href }) => <a href={href} className="text-[#D4AF37] underline hover:text-[#e6c454]">{children}</a>,
          blockquote: ({ children }) => <blockquote className="my-2 pl-3 border-l-2 border-[#D4AF37]/40 text-white/60 italic">{children}</blockquote>,
          p: ({ children }) => <p className="my-2">{children}</p>,
        }}
      >
        {cleaned}
      </ReactMarkdown>
    </div>
  );
}