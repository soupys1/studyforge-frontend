"use client";
import { useState } from "react";
import { generateNotes } from "@/lib/api";

interface NoteData {
  note_id: string;
  title: string;
  content: string;
  source_page: number | string | null;
}

interface NoteCardProps {
  documentId: string;
  index: number;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**")
          ? <strong key={i} style={{ fontWeight: 600, color: "var(--ln-ink)" }}>{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

function NoteTable({ lines }: { lines: string[] }) {
  const isSeparator = (l: string) => /^\|[-:\s|]+\|$/.test(l.trim());
  const parsed = lines
    .filter(l => !isSeparator(l))
    .map(l => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(c => c.trim()));

  if (!parsed.length) return null;
  const [headers, ...rows] = parsed;

  return (
    <div style={{ overflowX: "auto", marginBottom: 20 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, lineHeight: 1.5 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: "8px 14px",
                textAlign: "left",
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.4px",
                textTransform: "uppercase",
                color: "var(--ln-ink-subtle)",
                borderBottom: "1px solid var(--ln-hair)",
                whiteSpace: "nowrap",
              }}>
                {renderInline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding: "8px 14px",
                  color: "var(--ln-ink-muted)",
                  borderBottom: "1px solid var(--ln-hair)",
                  verticalAlign: "top",
                }}>
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderContent(content: string): React.ReactNode[] {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) { i++; continue; }

    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      nodes.push(<NoteTable key={key++} lines={tableLines} />);
      continue;
    }

    const hMatch = line.match(/^(#{1,4})\s+(.+)/);
    if (hMatch) {
      const level = hMatch[1].length;
      const text = hMatch[2];
      nodes.push(
        <p key={key++} style={{
          fontSize: level <= 2 ? 15 : 13.5,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: "var(--ln-ink)",
          marginTop: 20,
          marginBottom: 6,
        }}>
          {renderInline(text)}
        </p>
      );
      i++;
      continue;
    }

    if (/^[-*•]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*•]\s/, ""));
        i++;
      }
      nodes.push(
        <ul key={key++} style={{ paddingLeft: 18, marginBottom: 14, display: "flex", flexDirection: "column", gap: 5 }}>
          {items.map((item, j) => (
            <li key={j} style={{ fontSize: 14, lineHeight: 1.65, color: "var(--ln-ink-muted)" }}>
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ""));
        i++;
      }
      nodes.push(
        <ol key={key++} style={{ paddingLeft: 20, marginBottom: 14, display: "flex", flexDirection: "column", gap: 5 }}>
          {items.map((item, j) => (
            <li key={j} style={{ fontSize: 14, lineHeight: 1.65, color: "var(--ln-ink-muted)" }}>
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("|") &&
      !/^[-*•]\s/.test(lines[i].trim()) &&
      !/^\d+\.\s/.test(lines[i].trim()) &&
      !/^#{1,4}\s/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    if (paraLines.length) {
      nodes.push(
        <p key={key++} style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 14, color: "var(--ln-ink-muted)" }}>
          {renderInline(paraLines.join(" "))}
        </p>
      );
    }
  }

  return nodes;
}

export default function NoteCard({ documentId, index }: NoteCardProps) {
  const [topic,   setTopic]   = useState("");
  const [note,    setNote]    = useState<NoteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleGenerate() {
    if (!topic.trim()) return;
    setError(null);
    setNote(null);
    setLoading(true);
    try {
      const result = await generateNotes(documentId, topic);
      setNote(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sf-generator">
      {/* Sidebar */}
      <div>
        <span style={{
          fontFamily: "var(--font-heading)",
          fontSize: 56,
          fontWeight: 600,
          color: "var(--ln-hair-tertiary)",
          lineHeight: 1,
          display: "block",
          marginBottom: 12,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.04em",
        }}>
          0{index}
        </span>

        <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 8, color: "var(--ln-ink)" }}>Notes</h3>
        <p style={{ fontSize: 13.5, color: "var(--ln-ink-subtle)", lineHeight: 1.56, marginBottom: 24 }}>
          A concise, structured summary of the most relevant content for your topic.
        </p>

        <input
          className="sf-input"
          type="text"
          placeholder="Enter topic…"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleGenerate()}
          style={{ marginBottom: 10 }}
        />
        <button
          className="sf-btn sf-btn-primary"
          style={{ width: "100%" }}
          onClick={handleGenerate}
          disabled={!topic.trim() || loading}
        >
          {loading ? "Generating…" : "Generate notes"}
        </button>
      </div>

      {/* Output */}
      <div className="sf-panel" style={{ padding: 32, minHeight: 180 }}>

        {/* Ghost */}
        {!note && !loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="skeleton" style={{ height: 18, width: "48%", opacity: 0.6 }} />
            <div style={{ height: 8 }} />
            <div className="skeleton" style={{ height: 13, width: "100%", opacity: 0.4 }} />
            <div className="skeleton" style={{ height: 13, width: "88%",  opacity: 0.3 }} />
            <div className="skeleton" style={{ height: 13, width: "76%",  opacity: 0.2 }} />
            <div style={{ marginTop: 16 }}>
              <p className="sf-label">Enter a topic on the left and click <strong style={{ fontWeight: 500, color: "var(--ln-ink-subtle)" }}>Generate notes</strong> to get started.</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="skeleton" style={{ height: 18, width: "44%" }} />
            <div style={{ height: 6 }} />
            <div className="skeleton" style={{ height: 13, width: "100%" }} />
            <div className="skeleton" style={{ height: 13, width: "87%" }} />
            <div className="skeleton" style={{ height: 13, width: "94%" }} />
            <div className="skeleton" style={{ height: 13, width: "70%" }} />
            <div style={{ marginTop: 12 }}>
              <p className="sf-label" style={{ animation: "sf-pulse 1.2s ease-in-out infinite" }}>
                Retrieving relevant passages…
              </p>
            </div>
          </div>
        )}

        {error && <div className="sf-alert sf-alert-bad">{error}</div>}

        {/* Result */}
        {note && (
          <div>
            <div style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 20,
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--ln-ink)" }}>{note.title}</h3>
              {note.source_page != null && (
                <span className="sf-tag">p. {note.source_page}</span>
              )}
            </div>

            <div style={{ borderTop: "1px solid var(--ln-hair)", paddingTop: 20 }}>
              {renderContent(note.content)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
